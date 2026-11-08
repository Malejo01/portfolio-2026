import { describe, expect, it } from "vitest";
import { conocimiento, faqPorIds } from "@/content/agencia/conocimiento";
import { home } from "@/content/agencia/home";
import { faqPagos } from "@/content/agencia/servicios";
import { bloqueConocimiento } from "./knowledge";

const palabras = (t: string) => t.trim().split(/\s+/).length;

describe("base de conocimiento", () => {
  it("ninguna respuesta del FAQ pasa de 40 palabras", () => {
    for (const f of conocimiento.faq) expect(palabras(f.a), f.id).toBeLessThanOrEqual(40);
  });

  it("ids únicos y el FAQ de la home sale de acá (sin copy duplicada)", () => {
    const ids = conocimiento.faq.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(home.faq.items).toHaveLength(6);
    for (const item of [...home.faq.items, ...faqPagos]) expect(conocimiento.faq).toContain(item);
    expect(() => faqPorIds(["no-existe"])).toThrow();
  });

  it("cubre todo F12: cuotas, seña, dominio, tecnología, baja, USD y factura", () => {
    const todo = conocimiento.faq.map((f) => `${f.q} ${f.a}`).join(" ");
    for (const tema of [/6 cuotas/, /seña.*no|no.*seña/i, /dominio/i, /Next\.js/, /30 días/, /dólar/i, /factura/i]) {
      expect(todo).toMatch(tema);
    }
  });

  it("Tuki no nombra al cliente institucional", () => {
    const tuki = conocimiento.proyectos.find((p) => p.key === "tuki")!;
    expect(tuki.que).toContain("un municipio de capital provincial");
    expect(JSON.stringify(conocimiento)).not.toMatch(/Muni\b|Municipalidad de/);
  });

  it("el bloque del prompt incluye el conocimiento, con la seña resuelta y sin URLs", () => {
    const bloque = bloqueConocimiento(20000);
    expect(bloque).toContain("Mauro Lizárraga");
    expect(bloque).toContain("AfinIA Jobs");
    expect(bloque).toContain("$20.000");
    expect(bloque).not.toContain("{SENA}");
    expect(bloque).not.toMatch(/https?:\/\//);
    expect(bloqueConocimiento(20000)).toBe(bloque);
  });
});
