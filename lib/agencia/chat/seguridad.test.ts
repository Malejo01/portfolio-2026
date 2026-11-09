import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { alertaDeUso, umbralAlerta } from "@/lib/agencia/alerta";
import { TOPE_SIN_BASE, consume, limites, resetUsoEnMemoria } from "./limits";
import { MAX_CHARS, recortarHistorial } from "./recorte";
import { esTokenDePrueba, origenPermitido } from "./security";

/** Tanda R2 · seguridad del chat (S1, S6, S7, S8, S9). */
const env = process.env as Record<string, string | undefined>;
const CLAVES = ["CHAT_BURST_LIMIT", "CHAT_DAILY_LIMIT_IP", "CHAT_DAILY_LIMIT_TOTAL", "DATABASE_URL", "CHAT_TEST_TOKEN", "NEXT_PUBLIC_SITE_URL", "NODE_ENV", "VERCEL_URL", "CHAT_ALERT_THRESHOLD", "RESEND_API_KEY"];
const prev = Object.fromEntries(CLAVES.map((k) => [k, env[k]]));

beforeEach(() => {
  delete env.DATABASE_URL;
  resetUsoEnMemoria();
});
afterEach(() => {
  for (const k of CLAVES) {
    if (prev[k] === undefined) delete env[k];
    else env[k] = prev[k];
  }
  vi.restoreAllMocks();
  vi.doUnmock("@/lib/db");
});

describe("S1 · límites por ráfaga y por IP", () => {
  it("defaults: 20 cada 10 minutos, 150 por IP y por día, 1000 en total", () => {
    for (const k of ["CHAT_BURST_LIMIT", "CHAT_DAILY_LIMIT_IP", "CHAT_DAILY_LIMIT_TOTAL"]) delete env[k];
    expect(limites()).toEqual({ rafaga: 20, ip: 150, total: 1000 });
    env.CHAT_DAILY_LIMIT_IP = "0";
    expect(limites().ip).toBe(0);
  });

  it("la ráfaga corta a los 20 y se libera en la ventana siguiente", async () => {
    env.CHAT_DAILY_LIMIT_IP = "0";
    const t0 = Date.UTC(2026, 10, 9, 12, 0, 0);
    for (let i = 0; i < 20; i++) expect((await consume("ip-a", { now: t0 + i * 1000 })).ok).toBe(true);
    expect(await consume("ip-a", { now: t0 + 30_000 })).toEqual({ ok: false, reason: "rafaga" });
    expect((await consume("ip-b", { now: t0 + 30_000 })).ok).toBe(true);
    expect((await consume("ip-a", { now: t0 + 10 * 60_000 })).ok).toBe(true);
  });

  it("la llave de pruebas saltea los topes por IP pero no el global", async () => {
    env.CHAT_BURST_LIMIT = "2";
    env.CHAT_DAILY_LIMIT_IP = "2";
    env.CHAT_DAILY_LIMIT_TOTAL = "5";
    for (let i = 0; i < 5; i++) expect((await consume("evals", { saltarIp: true })).ok).toBe(true);
    expect(await consume("evals", { saltarIp: true })).toEqual({ ok: false, reason: "total" });
  });

  it("el formulario de /demo cuenta aparte y no consume el cupo global del chat", async () => {
    env.CHAT_BURST_LIMIT = "2";
    env.CHAT_DAILY_LIMIT_TOTAL = "1";
    expect((await consume("ip-a", { ambito: "demo" })).ok).toBe(true);
    expect((await consume("ip-a", { ambito: "demo" })).ok).toBe(true);
    expect(await consume("ip-a", { ambito: "demo" })).toEqual({ ok: false, reason: "rafaga" });
    expect((await consume("ip-a")).ok).toBe(true);
  });

  it("token de pruebas: comparación exacta, sin token configurado no hay llave", () => {
    delete env.CHAT_TEST_TOKEN;
    expect(esTokenDePrueba("cualquiera")).toBe(false);
    env.CHAT_TEST_TOKEN = "t".repeat(32);
    expect(esTokenDePrueba("t".repeat(32))).toBe(true);
    expect(esTokenDePrueba("t".repeat(31))).toBe(false);
    expect(esTokenDePrueba(null)).toBe(false);
    env.CHAT_TEST_TOKEN = "corto";
    expect(esTokenDePrueba("corto")).toBe(false);
  });
});

describe("S7 · fallar cerrado", () => {
  it("si la base falla, el global cae a un contador en memoria con tope de 100", async () => {
    vi.resetModules();
    const roto = () => {
      throw new Error("db caída");
    };
    vi.doMock("@/lib/db", () => ({ getDb: () => ({ insert: roto, select: roto, delete: roto }), schema: {} }));
    const { consume: consumeConBase, resetUsoEnMemoria: reset } = await import("./limits");
    reset();
    vi.spyOn(console, "error").mockImplementation(() => {});
    env.CHAT_BURST_LIMIT = "0";
    env.CHAT_DAILY_LIMIT_IP = "0";
    env.CHAT_DAILY_LIMIT_TOTAL = "1000";
    for (let i = 0; i < TOPE_SIN_BASE; i++) expect((await consumeConBase(`ip-${i}`)).ok).toBe(true);
    expect(await consumeConBase("ip-x")).toEqual({ ok: false, reason: "total" });
  });
});

describe("S8 · tope de tamaño del historial", () => {
  const m = (role: "user" | "assistant", n: number, c = "x") => ({ role, content: c.repeat(n) });

  it("recorta a 12.000 caracteres desde el final y empieza por el usuario", () => {
    const h = [m("user", 2000), m("assistant", 2000), m("user", 2000), m("assistant", 2000), m("user", 2000), m("assistant", 2000), m("user", 2000), m("assistant", 1500), m("user", 1500, "y")];
    const r = recortarHistorial(h);
    expect(r.reduce((s, x) => s + x.content.length, 0)).toBeLessThanOrEqual(MAX_CHARS);
    expect(r[0].role).toBe("user");
    expect(r[r.length - 1]).toBe(h[h.length - 1]);
  });

  it("conserva siempre el último mensaje del usuario", () => {
    const r = recortarHistorial([m("assistant", 50), m("user", 20_000)], MAX_CHARS);
    expect(r).toHaveLength(1);
    expect(r[0].content).toHaveLength(20_000);
  });

  it("un historial corto no cambia", () => {
    const h = [m("user", 10), m("assistant", 10), m("user", 10)];
    expect(recortarHistorial(h)).toEqual(h);
  });
});

describe("S6 · origen", () => {
  it("acepta el dominio, la URL del sitio y las vistas previas de Vercel; rechaza el resto", () => {
    const e = { NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://malejo.com.ar", VERCEL_BRANCH_URL: "portfolio-git-rama-mauro.vercel.app" } as NodeJS.ProcessEnv;
    for (const ok of ["https://malejo.com.ar", "https://www.malejo.com.ar", "https://portfolio-git-rama-mauro.vercel.app", null, undefined, ""]) {
      expect(origenPermitido(ok, e), String(ok)).toBe(true);
    }
    for (const mal of ["https://evil.com", "https://malejo.com.ar.evil.com", "http://malejo.com.ar", "http://localhost:3000", "null", "basura"]) {
      expect(origenPermitido(mal, e), mal).toBe(false);
    }
  });

  it("en desarrollo permite localhost", () => {
    const e = { NODE_ENV: "development" } as NodeJS.ProcessEnv;
    expect(origenPermitido("http://localhost:3000", e)).toBe(true);
    expect(origenPermitido("http://127.0.0.1:3005", e)).toBe(true);
    expect(origenPermitido("https://evil.com", e)).toBe(false);
  });
});

describe("S9 · alerta de uso", () => {
  it("umbral por defecto 300 y configurable", () => {
    delete env.CHAT_ALERT_THRESHOLD;
    expect(umbralAlerta()).toBe(300);
    env.CHAT_ALERT_THRESHOLD = "50";
    expect(umbralAlerta()).toBe(50);
  });

  it("sin Resend deja un console.warn sin datos personales", async () => {
    delete env.RESEND_API_KEY;
    delete env.CHAT_ALERT_THRESHOLD;
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(await alertaDeUso("2026-11-08", 120)).toBe("normal");
    expect(await alertaDeUso("2026-11-08", 301)).toBe("log");
    expect(warn).toHaveBeenCalledOnce();
    expect(String(warn.mock.calls[0][0])).toMatch(/^\[cron\] alerta de uso: 301 mensajes el 2026-11-08 \(umbral 300\)$/);
    expect(await alertaDeUso("2026-11-08", null)).toBe("sin-datos");
  });
});
