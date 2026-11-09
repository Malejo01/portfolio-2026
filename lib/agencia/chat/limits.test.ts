import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { consume, limites, resetUsoEnMemoria } from "./limits";

const env = process.env as Record<string, string | undefined>;
const prev = { ip: env.CHAT_DAILY_LIMIT_IP, total: env.CHAT_DAILY_LIMIT_TOTAL, db: env.DATABASE_URL, rafaga: env.CHAT_BURST_LIMIT };

beforeEach(() => {
  delete env.DATABASE_URL;
  // La ráfaga (R2) se prueba en seguridad.test.ts; acá, apagada.
  env.CHAT_BURST_LIMIT = "0";
  resetUsoEnMemoria();
});
afterEach(() => {
  for (const [k, v] of [["CHAT_DAILY_LIMIT_IP", prev.ip], ["CHAT_DAILY_LIMIT_TOTAL", prev.total], ["DATABASE_URL", prev.db], ["CHAT_BURST_LIMIT", prev.rafaga]] as const) {
    if (v === undefined) delete env[k];
    else env[k] = v;
  }
});

describe("límites del chat (F7)", () => {
  it("por defecto (R2): 150 por IP y 1000 en total; vacío = default", () => {
    delete env.CHAT_DAILY_LIMIT_IP;
    delete env.CHAT_DAILY_LIMIT_TOTAL;
    expect(limites()).toMatchObject({ ip: 150, total: 1000 });
    env.CHAT_DAILY_LIMIT_IP = "";
    env.CHAT_DAILY_LIMIT_TOTAL = "";
    expect(limites()).toMatchObject({ ip: 150, total: 1000 });
    env.CHAT_DAILY_LIMIT_TOTAL = "abc";
    expect(limites().total).toBe(1000);
  });

  it("0 = sin límite, en los dos", async () => {
    env.CHAT_DAILY_LIMIT_IP = "0";
    env.CHAT_DAILY_LIMIT_TOTAL = "0";
    for (let i = 0; i < 50; i++) expect((await consume("ip-a")).ok).toBe(true);
  });

  it("sin límite por IP, el tope global sigue cortando", async () => {
    env.CHAT_DAILY_LIMIT_IP = "0";
    env.CHAT_DAILY_LIMIT_TOTAL = "3";
    expect((await consume("ip-a")).ok).toBe(true);
    expect((await consume("ip-a")).ok).toBe(true);
    expect((await consume("ip-b")).ok).toBe(true);
    expect(await consume("ip-c")).toEqual({ ok: false, reason: "total" });
  });

  it("con límite por IP configurado, corta por IP", async () => {
    env.CHAT_DAILY_LIMIT_IP = "2";
    env.CHAT_DAILY_LIMIT_TOTAL = "0";
    expect((await consume("ip-a")).ok).toBe(true);
    expect((await consume("ip-a")).ok).toBe(true);
    expect(await consume("ip-a")).toEqual({ ok: false, reason: "ip" });
    expect((await consume("ip-b")).ok).toBe(true);
  });
});
