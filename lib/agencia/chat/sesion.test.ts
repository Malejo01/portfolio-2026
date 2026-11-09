import { describe, expect, it } from "vitest";
import { SESION_KEY, SESION_MAX, borrarSesion, guardarSesion, leerSesion } from "./sesion";

function memoria() {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k), m };
}

describe("sesión del chat (R3)", () => {
  const msg = (id: number, role: "user" | "assistant", text = "hola") => ({ id, role, text, cards: [] });

  it("guarda y recupera la charla y la ficha, con tope de mensajes", () => {
    const s = memoria();
    const msgs = Array.from({ length: 40 }, (_, i) => msg(i, i % 2 ? "assistant" : "user"));
    guardarSesion({ msgs, ficha: { rubro: "Veterinaria" } }, s);
    const r = leerSesion(s)!;
    expect(r.msgs).toHaveLength(SESION_MAX);
    expect(r.msgs[0].id).toBe(10);
    expect(r.ficha).toEqual({ rubro: "Veterinaria" });
  });

  it("sin mensajes del usuario no hay nada que retomar", () => {
    const s = memoria();
    guardarSesion({ msgs: [msg(0, "assistant")], ficha: {} }, s);
    expect(leerSesion(s)).toBeNull();
  });

  it("datos corruptos o almacenamiento que tira: arranca de cero sin romper", () => {
    const s = memoria();
    s.m.set(SESION_KEY, "{no es json");
    expect(leerSesion(s)).toBeNull();
    const roto = { getItem: () => { throw new Error("bloqueado"); }, setItem: () => { throw new Error("bloqueado"); }, removeItem: () => { throw new Error("x"); } };
    expect(leerSesion(roto)).toBeNull();
    expect(() => guardarSesion({ msgs: [msg(1, "user")], ficha: {} }, roto)).not.toThrow();
    expect(() => borrarSesion(roto)).not.toThrow();
    expect(leerSesion(undefined)).toBeNull();
  });
});
