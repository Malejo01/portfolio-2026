import { describe, expect, it } from "vitest";
import { firmaCard, leerFirmaQuote, lineaTarjeta, type Card } from "./cards";
import { mergeFicha } from "./ficha";
import { FichaSchema, limpiarFicha } from "./ficha-schema";
import { isPhoneAR, signConsent, verifyConsent } from "./security";
import { nuevoContexto, runTool, ultimaCotizacion } from "./tools";

const TC = 1000;
const ctx = (ficha = {}, shown: string[] = []) => nuevoContexto(TC, ficha, shown);

describe("herramientas del agente", () => {
  it("cotizar usa cotizar() y arma la tarjeta", () => {
    const out = runTool("cotizar", { planIds: ["combo-web-turnos"] }, ctx());
    expect(out.isError).toBeUndefined();
    expect(out.card).toMatchObject({ kind: "quote", implementacion: 450000, mensual: 45000, demoHref: "/demo?plan=combo-negocio-con-turnos" });
  });

  it("rechaza input inválido o ids inventados", () => {
    expect(runTool("cotizar", { planIds: [] }, ctx()).isError).toBe(true);
    expect(runTool("cotizar", { planIds: ["web-magica"] }, ctx()).isError).toBe(true);
    expect(runTool("leer_contactos", {}, ctx()).isError).toBe(true);
    expect(runTool("comparar", { ids: ["landing-express"] }, ctx()).isError).toBe(true);
    expect(runTool("anotar_ficha", { etapa: "cualquiera" }, ctx()).isError).toBe(true);
  });

  it("guardar_contacto no guarda: devuelve una firma para la UI", () => {
    const out = runTool("guardar_contacto", { nombre: "Ana", whatsapp: "387 581-3233", rubro: "Veterinaria", resumen: "Quiere turnos online" }, ctx());
    expect(out.card?.kind).toBe("consent");
    if (out.card?.kind !== "consent") return;
    expect(verifyConsent(out.card.payload, out.card.token)).toBe(true);
    // Un payload editado invalida la firma.
    expect(verifyConsent({ ...out.card.payload, whatsapp: "1111111111" }, out.card.token)).toBe(false);
  });

  it("guardar_contacto exige teléfono argentino (caso H: Pedro, 12345)", () => {
    const out = runTool("guardar_contacto", { nombre: "Pedro", whatsapp: "12345678", rubro: "Ferretería", resumen: "Quiere una web" }, ctx());
    expect(out.isError).toBe(true);
    expect(out.card).toBeUndefined();
  });

  it("guardar_contacto toma rubro y resumen de la ficha (caso G)", () => {
    const c = ctx({ rubro: "Inmobiliaria", necesidad: "Un asistente que responda consultas de propiedades" });
    const out = runTool("guardar_contacto", { nombre: "Laura", whatsapp: "3874123456" }, c);
    expect(out.card?.kind).toBe("consent");
    if (out.card?.kind !== "consent") return;
    expect(out.card.payload).toMatchObject({ rubro: "Inmobiliaria", resumen: "Un asistente que responda consultas de propiedades" });
    expect(c.ficha.nombre).toBe("Laura");
  });

  it("la firma vence", () => {
    const p = { nombre: "A", whatsapp: "3875813233", rubro: "x", resumen: "y", iat: Date.now() - 2 * 60 * 60 * 1000 };
    expect(verifyConsent(p, signConsent(p))).toBe(false);
  });

  it("teléfonos", () => {
    for (const ok of ["+54 9 387 581-3233", "0387 15 581-3233", "3875813233", "11 2345-6789"]) expect(isPhoneAR(ok), ok).toBe(true);
    for (const bad of ["hola", "12345", "+1 555 1234"]) expect(isPhoneAR(bad), bad).toBe(false);
  });
});

describe("cotizar vs comparar (F1 de producción)", () => {
  it("comparar arma una tarjeta compare sin total", () => {
    const out = runTool("comparar", { ids: ["landing-express", "landing-profesional", "sitio-pyme"] }, ctx());
    expect(out.card?.kind).toBe("compare");
    if (out.card?.kind !== "compare") return;
    expect(out.card.filas.map((f) => f.precio)).toEqual([180000, 320000, 650000]);
    expect(JSON.stringify(out.card)).not.toContain("1150000");
    expect(out.card).not.toHaveProperty("implementacion");
  });

  it("mantenimiento Básico + Pro por comparar no suma $80.000", () => {
    const out = runTool("comparar", { ids: ["mantenimiento-basico", "mantenimiento-pro"] }, ctx());
    expect(JSON.stringify(out)).not.toContain("80000");
  });

  it("USD solo si se pide moneda usd", () => {
    const ars = runTool("cotizar", { planIds: ["landing-profesional"] }, ctx());
    const usd = runTool("cotizar", { planIds: ["landing-profesional"], moneda: "usd" }, ctx());
    expect(ars.card).not.toHaveProperty("usd");
    expect(usd.card).toMatchObject({ moneda: "usd", usd: { implementacion: 320, tipoDeCambio: TC } });
    expect(usd.content).toContain("dólar oficial del día");
  });

  it("ninguna herramienta cotiza ni ofrece demo de un proyecto grande (caso I)", () => {
    for (const [name, input] of [
      ["cotizar", { planIds: ["sprint-con-demo"] }],
      ["cotizar", { planIds: ["diagnostico-escrito"] }],
      ["comparar", { ids: ["consultoria-inicial", "diagnostico-escrito"] }],
      ["pedir_demo", { planId: "sprint-con-demo" }],
    ] as const) {
      const out = runTool(name, input, ctx());
      expect(out.isError, name).toBe(true);
      expect(out.card, name).toBeUndefined();
      expect(out.content).toContain("charla gratis (20 min)");
    }
  });
});

describe("deduplicación de tarjetas (F2/F3.6)", () => {
  it("la misma cotización (ids, medio y moneda) no se vuelve a emitir", () => {
    const c = ctx();
    const primera = runTool("cotizar", { planIds: ["turnos-online"], medio: "mp" }, c);
    expect(primera.card).toBeDefined();
    const segunda = runTool("cotizar", { planIds: ["turnos-online"], medio: "mp" }, c);
    expect(segunda.card).toBeUndefined();
    expect(segunda.content).toContain("YA está en pantalla");
    // Otro medio sí es otra tarjeta.
    expect(runTool("cotizar", { planIds: ["turnos-online"] }, c).card).toBeDefined();
  });

  it("respeta las firmas que manda el widget, sin importar el orden de los ids", () => {
    const firma = firmaCard(runTool("comparar", { ids: ["mantenimiento-pro", "mantenimiento-basico"] }, ctx()).card!);
    const out = runTool("comparar", { ids: ["mantenimiento-basico", "mantenimiento-pro"] }, ctx({}, [firma]));
    expect(out.card).toBeUndefined();
  });

  it("demo y WhatsApp no se deduplican", () => {
    const c = ctx();
    expect(runTool("pedir_demo", {}, c).card).toBeDefined();
    expect(runTool("pedir_demo", {}, c).card).toBeDefined();
  });

  it("la última cotización se reconstruye desde su firma", () => {
    const card = runTool("cotizar", { planIds: ["turnos-online"], medio: "mp", moneda: "usd" }, ctx()).card!;
    const firma = firmaCard(card);
    expect(leerFirmaQuote(firma)).toEqual({ ids: ["turnos-online"], extras: [], medio: "mp", moneda: "usd" });
    expect(ultimaCotizacion(ctx({}, ["demo:/demo", firma]))).toMatchObject({ implementacion: 190800, mensual: 23300 });
    expect(ultimaCotizacion(ctx({}, ["quote:inventado||mp|ars"]))).toBeNull();
  });
});

describe("ficha", () => {
  it("anotar_ficha valida, trunca y traduce ids a nombres", () => {
    const c = ctx();
    const out = runTool("anotar_ficha", { rubro: "  Peluquería  ", necesidad: "x".repeat(900), planesInteres: ["turnos-online", "combo-negocio-con-turnos"] }, c);
    expect(out.card).toBeUndefined();
    expect(out.ficha?.rubro).toBe("Peluquería");
    expect(out.ficha?.necesidad).toHaveLength(300);
    expect(out.ficha?.planesInteres).toEqual(["Agenda de turnos online", "Combo Página + turnos"]);
    expect(c.ficha.rubro).toBe("Peluquería");
  });

  it("merge: textos nuevos reemplazan, listas se unen sin repetir", () => {
    const a = mergeFicha({ rubro: "Vete", dudas: ["¿Cuotas?"] }, { rubro: "Veterinaria", dudas: ["¿cuotas?", "¿Factura?"], ciudad: "  " });
    expect(a).toEqual({ rubro: "Veterinaria", dudas: ["¿Cuotas?", "¿Factura?"] });
    expect(mergeFicha({ etapa: "cotizado" }, { etapa: "interesado" }).etapa).toBe("interesado");
  });

  it("el schema del body trunca, descarta vacíos y limita las listas", () => {
    const f = limpiarFicha(FichaSchema.parse({ nombre: "", rubro: "a".repeat(500), dudas: Array.from({ length: 20 }, (_, i) => `d${i}`) }));
    expect(f.nombre).toBeUndefined();
    expect(f.rubro).toHaveLength(120);
    expect(f.dudas).toHaveLength(6);
  });

  it("derivar_whatsapp arma el mensaje desde la ficha y la última cotización", () => {
    const firma = firmaCard(runTool("cotizar", { planIds: ["turnos-online"] }, ctx()).card!);
    const out = runTool("derivar_whatsapp", { resumen: "Quiere avanzar" }, ctx({ rubro: "Peluquería", necesidad: "Agenda de turnos online" }, [firma]));
    expect(out.card?.kind).toBe("whatsapp");
    const texto = decodeURIComponent((out.card as Extract<Card, { kind: "whatsapp" }>).href.split("text=")[1]);
    expect(texto).toContain("Rubro: Peluquería");
    expect(texto).toContain("Cotización: Agenda de turnos online · $180.000 + $22.000/mes");
    expect(out.ficha).toEqual({ etapa: "derivado" });
  });
});

describe("tarjetas en el historial (F4)", () => {
  it("una línea compacta por tarjeta", () => {
    const quote = runTool("cotizar", { planIds: ["turnos-online"], medio: "mp", moneda: "usd" }, ctx()).card!;
    expect(lineaTarjeta(quote)).toBe("[Tarjeta mostrada · Cotización: Agenda de turnos online · MP · $190.800 + $23.300/mes · ≈ USD 190 + USD 23/mes]");
    const cmp = runTool("comparar", { ids: ["landing-express", "landing-profesional"] }, ctx()).card!;
    expect(lineaTarjeta(cmp)).toBe("[Tarjeta mostrada · Comparación: Página Esencial | Página para aparecer en Google]");
    expect(lineaTarjeta({ kind: "demo", demoHref: "/demo", agendaHref: "" })).toBe("[Tarjeta mostrada · Demo]");
    expect(lineaTarjeta({ kind: "whatsapp", href: "" })).toBe("[Tarjeta mostrada · WhatsApp]");
  });

  it("mostrar_proyectos trae los cuatro proyectos y el portfolio, una sola vez", () => {
    const c = ctx();
    const out = runTool("mostrar_proyectos", {}, c);
    expect(out.card?.kind).toBe("proyectos");
    if (out.card?.kind !== "proyectos") return;
    expect(out.card.items.map((i) => i.nombre)).toEqual(["AfinIA Jobs", "Qué Pinta Salta", "Tuki", "MaestrIA"]);
    expect(out.card.portfolio.href).toBe("/portfolio");
    expect(runTool("mostrar_proyectos", {}, c).card).toBeUndefined();
  });
});

describe("sin MALEJO_SALT en producción", () => {
  it("no firma ni acepta consentimientos", () => {
    const prev = { env: process.env.NODE_ENV, salt: process.env.MALEJO_SALT };
    const env = process.env as Record<string, string | undefined>;
    env.NODE_ENV = "production";
    delete env.MALEJO_SALT;
    try {
      const out = runTool("guardar_contacto", { nombre: "Ana", whatsapp: "3875813233", rubro: "Vete", resumen: "Quiere turnos" }, ctx());
      expect(out.card?.kind).toBe("whatsapp");
      const p = { nombre: "A", whatsapp: "3875813233", rubro: "x", resumen: "y", iat: Date.now() };
      expect(verifyConsent(p, signConsent(p))).toBe(false);
    } finally {
      env.NODE_ENV = prev.env;
      if (prev.salt) env.MALEJO_SALT = prev.salt;
    }
  });
});
