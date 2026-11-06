import { describe, expect, it } from "vitest";
import { categories, combos, extras, getPlan, plans } from "@/content/agencia/pricing";
import { ahorro, conRecargo, cotizar, fmt, precioDePlan } from "./pricing";

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

  it("seis categorías con un recomendado cada una", () => {
    expect(categories).toHaveLength(6);
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
