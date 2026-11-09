import { describe, expect, it } from "vitest";
import { bloqueFicha, catalogo, systemBlocks, systemPrompt } from "./prompt";

describe("system prompt", () => {
  const base = systemPrompt(20000);

  it("es determinista (prefijo cacheable) y no tiene placeholders sin resolver", () => {
    expect(systemPrompt(20000)).toBe(base);
    expect(base).not.toMatch(/\{SENA\}|\$\{|undefined|NaN/);
  });

  it("sigue el orden pedido: identidad → … → conocimiento → catálogo", () => {
    const orden = ["Sos Malejo", "# Objetivo", "# Estilo", "# Cómo vendés", "# Objeciones", "# Proyectos grandes", "# Cuándo derivar", "# Herramientas y tarjetas", "# Límites", "# Conocimiento", "# Catálogo"];
    const pos = orden.map((s) => base.indexOf(s));
    expect(pos.every((p) => p >= 0)).toBe(true);
    expect([...pos].sort((a, b) => a - b)).toEqual(pos);
  });

  it("incluye el conocimiento y el catálogo con otras formas de pago y proyectos a medida", () => {
    expect(base).toContain("Mauro Lizárraga");
    expect(base).toContain("hasta 6 cuotas");
    expect(base).toContain("Otra forma de pago: $90.000 de entrada y $49.000 por mes");
    expect(base).toContain("[sprint-con-demo] Etapa de 2 semanas con avance funcionando: se cotiza en el plan escrito");
    expect(base).toContain("[diagnostico-escrito] Plan del proyecto por escrito: pago único $60.000");
    expect(base).toContain("10% mensual del precio del proyecto");
    expect(base).toContain("Tu dirección web .com.ar (por año) según tarifa vigente de NIC.ar");
    expect(catalogo()).toContain("RECOMENDADO");
  });

  it("explica las líneas de tarjetas y prohíbe rutas crudas y correcciones", () => {
    expect(base).toContain("[Tarjeta mostrada");
    expect(base).toContain("te corrijo");
    expect(base).toMatch(/Nunca escribas URLs/);
  });

  it("no le pasa URLs al modelo", () => {
    expect(base).not.toMatch(/https?:\/\//);
  });

  it("dos bloques: el base con caché y la ficha al final, sin caché", () => {
    const [cacheado, ficha] = systemBlocks(20000, { rubro: "Peluquería", dudas: ["¿Cuotas?"] });
    expect(cacheado.cache_control).toEqual({ type: "ephemeral" });
    expect(ficha.cache_control).toBeUndefined();
    expect(ficha.text).toContain("- Rubro: Peluquería");
    expect(ficha.text).toContain("- Dudas abiertas: ¿Cuotas?");
    expect(bloqueFicha({})).toContain("Todavía nada");
  });
});
