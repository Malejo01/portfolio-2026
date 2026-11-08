import { describe, expect, it } from "vitest";
import { categories, combos, extras, getCategory, getExtra, getPlan, mantenimientoGrandesPct, plans } from "@/content/agencia/pricing";
import { aUsd, ahorro, comparar, conRecargo, cotizar, fmt, fmtUsd, precioDePlan, resumenCotizacion } from "./pricing";

describe("fmt", () => {
  it("formatea en es-AR, pegado al signo", () => {
    expect(fmt(180000)).toBe("$180.000");
    expect(fmt(1350000)).toBe("$1.350.000");
    expect(fmt(0)).toBe("$0");
  });
});

describe("conRecargo", () => {
  it("transferencia no cambia el precio", () => {
    expect(conRecargo(180000, "transferencia")).toBe(180000);
  });

  it("Mercado Pago suma 6% y redondea a $100 (05-precios-mercadopago.png)", () => {
    expect(conRecargo(180000, "mp")).toBe(190800);
    expect(conRecargo(320000, "mp")).toBe(339200);
    expect(conRecargo(950000, "mp")).toBe(1007000);
    expect(conRecargo(45000, "mp")).toBe(47700);
    expect(conRecargo(15000, "mp")).toBe(15900);
    expect(conRecargo(1550000, "mp")).toBe(1643000);
    expect(conRecargo(25000, "mp")).toBe(26500);
  });

  it("redondea al múltiplo de $100 más cercano", () => {
    expect(conRecargo(12345, "mp")).toBe(13100); // 13085,7
    expect(conRecargo(1000, "mp")).toBe(1100); // 1060
    expect(conRecargo(1000, "mp") % 100).toBe(0);
  });
});

describe("catálogo", () => {
  it("ids únicos y estables", () => {
    const ids = [...plans.map((p) => p.id), ...combos.map((c) => c.id), ...extras.map((e) => e.id)];
    expect(new Set(ids).size).toBe(ids.length);
    expect(getPlan("landing-profesional")?.impl).toBe(320000);
    expect(getPlan("combo-web-turnos")?.monthly).toBe(45000);
  });

  it("siete categorías (con proyectos grandes) y un recomendado cada una", () => {
    expect(categories.map((c) => c.key)).toEqual(["webs", "tiendas", "turnos", "gestion", "ia", "mant", "grandes"]);
    for (const c of categories) expect(c.plans.filter((p) => p.rec)).toHaveLength(1);
  });

  it("la suma de lista de cada combo coincide con sus partes", () => {
    for (const c of combos) {
      const suma = c.planIds.reduce((s, id) => s + (getPlan(id)?.impl ?? NaN), 0);
      expect(suma, c.name).toBe(c.list);
    }
  });

  it("ahorro de los combos como en la captura", () => {
    expect(combos.map(ahorro)).toEqual([13, 12, 10, 13]);
  });
});

describe("precioDePlan", () => {
  it("plan con implementación y abono", () => {
    expect(precioDePlan(getPlan("turnos-online")!, "transferencia")).toEqual({
      etiqueta: "Implementación",
      precio: 180000,
      texto: "",
      unidad: "pago único",
      abono: 22000,
    });
  });

  it("plan desde", () => {
    const p = precioDePlan(getPlan("automatizacion")!, "transferencia");
    expect(p.etiqueta).toBe("Desde");
    expect(p.unidad).toBe("por flujo");
  });

  it("plan de solo abono", () => {
    expect(precioDePlan(getPlan("mantenimiento-pro")!, "mp")).toEqual({
      etiqueta: "Abono",
      precio: 58300,
      texto: "",
      unidad: "/mes",
      abono: null,
    });
  });
});

describe("cotizar", () => {
  it("un plan", () => {
    const c = cotizar({ planIds: ["landing-express"] });
    expect(c.implementacion).toBe(180000);
    expect(c.abonoMensual).toBe(0);
    expect(c.total).toBe(180000);
    expect(c.desde).toBe(false);
  });

  it("veterinaria con turnos: el Combo Web + Turnos", () => {
    const c = cotizar({ planIds: ["combo-web-turnos"] });
    expect(c.implementacion).toBe(450000);
    expect(c.abonoMensual).toBe(45000);
    expect(c.total).toBe(450000 + 45000 * 12);
  });

  it("aplica un combo solo cuando están todas sus partes", () => {
    const c = cotizar({ planIds: ["landing-profesional", "catalogo-con-pedidos-por-whatsapp"] });
    expect(c.combosAplicados).toEqual(["combo-arranque"]);
    expect(c.items).toHaveLength(1);
    expect(c.implementacion).toBe(520000);
    expect(c.abonoMensual).toBe(15000);
  });

  it("combo explícito absorbe sus partes repetidas", () => {
    const c = cotizar({ planIds: ["combo-pyme-digital", "sitio-pyme"] });
    expect(c.items.map((i) => i.id)).toEqual(["combo-pyme-digital"]);
    expect(c.implementacion).toBe(1350000);
  });

  it("plan desde marca la cotización como piso", () => {
    const c = cotizar({ planIds: ["tienda-online-con-mercado-pago"] });
    expect(c.desde).toBe(true);
    expect(c.implementacion).toBe(750000);
    expect(c.abonoMensual).toBe(35000);
  });

  it("plan de solo abono", () => {
    const c = cotizar({ planIds: ["mantenimiento-basico"] });
    expect(c.implementacion).toBe(0);
    expect(c.abonoMensual).toBe(25000);
    expect(c.total).toBe(300000);
  });

  it("renovación es un pago anual", () => {
    const c = cotizar({ planIds: ["renovacion"] });
    expect(c.anual).toBe(90000);
    expect(c.implementacion).toBe(0);
    expect(c.total).toBe(90000);
  });

  it("extras y Mercado Pago ítem por ítem", () => {
    const c = cotizar({ planIds: ["landing-express"], extras: ["blog", "pagina-adicional"], medio: "mp" });
    expect(c.items.map((i) => i.implementacion)).toEqual([190800, 190800, 63600]);
    expect(c.implementacion).toBe(190800 + 190800 + 63600);
  });

  it("reporta ids desconocidos en vez de inventarlos", () => {
    const c = cotizar({ planIds: ["web-con-ia-magica"], extras: ["nada"] });
    expect(c.items).toHaveLength(0);
    expect(c.desconocidos).toEqual(["web-con-ia-magica", "nada"]);
  });
});

describe("cotizar vs comparar (F1 de las pruebas)", () => {
  it("comparar nunca suma: una fila por opción y sin total", () => {
    const c = comparar({ ids: ["landing-express", "landing-profesional", "sitio-pyme"] });
    expect(c.filas.map((f) => f.precio)).toEqual([180000, 320000, 650000]);
    expect(c).not.toHaveProperty("total");
    expect(c).not.toHaveProperty("implementacion");
  });

  it("comparar mantenimiento Básico y Pro muestra cada abono, no $80.000", () => {
    const c = comparar({ ids: ["mantenimiento-basico", "mantenimiento-pro"] });
    expect(c.filas.map((f) => [f.etiqueta, f.precio, f.unidad])).toEqual([
      ["Abono", 25000, "/mes"],
      ["Abono", 55000, "/mes"],
    ]);
  });

  it("comparar trae la alternativa por abono y el recomendado", () => {
    const pro = comparar({ ids: ["landing-express", "landing-profesional"] }).filas[1];
    expect(pro.alt).toContain("$49.000/mes");
    expect(pro.recomendado).toBe(true);
  });

  it("comparar con combos y con ids inventados", () => {
    const c = comparar({ ids: ["turnos-online", "combo-negocio-con-turnos", "app-tipo-uber"], medio: "mp" });
    expect(c.filas[1]).toMatchObject({ etiqueta: "Combo", precio: 477000, abono: 47700 });
    expect(c.desconocidos).toEqual(["app-tipo-uber"]);
  });

  it("cotizar sí suma lo que se contrata junto", () => {
    const c = cotizar({ planIds: ["tienda-online-con-mercado-pago", "asistente-por-whatsapp"] });
    expect(c.implementacion).toBe(1200000);
    expect(c.abonoMensual).toBe(90000);
  });
});

describe("dólares", () => {
  it("redondea a la decena y abajo de USD 100 a la unidad", () => {
    expect(aUsd(190800, 1450)).toBe(130); // 131,6
    expect(aUsd(320000, 1450)).toBe(220); // 220,7
    expect(aUsd(23300, 1450)).toBe(16);
    expect(aUsd(0, 1450)).toBe(0);
    expect(aUsd(1000, 0)).toBe(0);
  });

  it("cotizar con tipo de cambio fijo suma el equivalente en USD", () => {
    const c = cotizar({ planIds: ["landing-profesional"], tipoDeCambio: 1000 });
    expect(c.usd).toEqual({ tipoDeCambio: 1000, implementacion: 320, abonoMensual: 0, anual: 0, total: 320 });
    expect(resumenCotizacion(c)).toContain("≈ USD 320");
    expect(cotizar({ planIds: ["landing-profesional"] }).usd).toBeUndefined();
  });

  it("comparar en USD fila por fila", () => {
    const c = comparar({ ids: ["turnos-online", "combo-web-turnos"], tipoDeCambio: 1000 });
    expect(c.filas[0].usd).toEqual({ precio: 180, abono: 22 });
    expect(c.tipoDeCambio).toBe(1000);
  });

  it("fmtUsd", () => {
    expect(fmtUsd(1230)).toBe("USD 1.230");
  });
});

describe("proyectos grandes", () => {
  const grandes = getCategory("grandes")!;

  it("tres pasos y el mantenimiento al 10% en un solo lugar", () => {
    expect(grandes.plans.map((p) => p.id)).toEqual([
      "consultoria-inicial",
      "diagnostico-escrito",
      "sprint-con-demo",
      "mantenimiento-de-proyectos-grandes",
    ]);
    expect(mantenimientoGrandesPct).toBe(0.1);
  });

  it("el diagnóstico escrito es el plan de $60.000 y ya no está duplicado como extra", () => {
    expect(getPlan("diagnostico-escrito")?.impl).toBe(60000);
    expect(getExtra("diagnostico-escrito")).toBeUndefined();
    // Compatibilidad: si llega como extra, se cotiza como plan.
    expect(cotizar({ planIds: [], extras: ["diagnostico-escrito"] }).implementacion).toBe(60000);
  });

  it("impl: null sin abono es 'a cotizar' y no rompe cotizar ni precioDePlan", () => {
    const sprint = getPlan("sprint-con-demo")!;
    expect(precioDePlan(sprint, "mp")).toMatchObject({ etiqueta: "A cotizar", precio: null, texto: "se cotiza con el diagnóstico" });
    const c = cotizar({ planIds: ["sprint-con-demo"], medio: "mp" });
    expect(c.implementacion).toBe(0);
    expect(c.total).toBe(0);
    expect(c.aCotizar).toEqual(["Sprint con demo: se cotiza con el diagnóstico"]);
    expect(resumenCotizacion(c)).toContain("se cotiza con el diagnóstico");
  });

  it("la consultoría inicial es sin cargo", () => {
    expect(cotizar({ planIds: ["consultoria-inicial"] }).implementacion).toBe(0);
  });
});

describe("dominio", () => {
  it("es un adicional aparte, por año, sin precio inventado", () => {
    const d = getExtra("dominio-com-ar-nic-ar-por-ano")!;
    expect(d).toMatchObject({ price: null, unit: "por año", aCotizar: "según tarifa vigente de NIC.ar" });
    const c = cotizar({ planIds: ["landing-profesional"], extras: [d.id] });
    expect(c.implementacion).toBe(320000);
    expect(c.aCotizar).toEqual(["Dominio .com.ar (NIC.ar, por año): según tarifa vigente de NIC.ar"]);
  });

  it("todos los extras tienen precio o texto", () => {
    for (const e of extras) expect(e.price != null || e.aCotizar.length > 0, e.id).toBe(true);
  });
});
