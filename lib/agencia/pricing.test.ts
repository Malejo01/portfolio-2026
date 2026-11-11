import { describe, expect, it } from "vitest";
import raw from "@/docs/agencia/datos/precios.json";
import { aliases, categories, combos, extras, getCategory, getCombo, getExtra, getPlan, mantenimientoGrandesPct, plans, resolverId } from "@/content/agencia/pricing";
import {
  aUsd,
  ahorro,
  ahorroEnPesos,
  anualPorMes,
  comparar,
  conRecargo,
  cotizar,
  fmt,
  fmtUsd,
  lineaDePagos,
  lineaDePlan,
  pagosCortos,
  pagosDe,
  pagosDePlan,
  precioDePlan,
  resumenCotizacion,
} from "./pricing";

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
    expect(getPlan("landing-profesional")?.impl).toBe(249000);
  });

  it("siete categorías (con proyectos a medida) y un recomendado cada una", () => {
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
    expect(combos.map(ahorro)).toEqual([16, 15, 16, 14]);
    expect(combos.map(ahorroEnPesos)).toEqual([81000, 87000, 69000, 204000]);
  });
});

describe("ids fijos (R2)", () => {
  type ConId = { id?: unknown };
  const json = raw as unknown as {
    categorias: { plans: ConId[] }[];
    combos: (ConId & { planIds?: unknown })[];
    extras: ConId[];
  };
  const todos: ConId[] = [...json.categorias.flatMap((c) => c.plans), ...json.combos, ...json.extras];

  it("cada plan, combo y extra del JSON trae su id escrito", () => {
    for (const x of todos) expect(typeof x.id === "string" && /^[a-z0-9-]+$/.test(x.id as string), JSON.stringify(x).slice(0, 80)).toBe(true);
  });

  it("ningún id se repite", () => {
    const ids = todos.map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("los ids de antes de renombrar siguen existiendo", () => {
    const antes = [
      "landing-express", "landing-profesional", "landing-premium", "sitio-pyme", "sitio-autoadministrable", "renova-tu-web",
      "menu-digital-qr", "catalogo-con-pedidos-por-whatsapp", "directorio-o-guia-con-mapa", "tienda-online-con-mercado-pago",
      "turnos-online", "reservas-con-sena", "inscripciones-a-eventos-y-salidas",
      "control-de-stock-con-qr", "pedidos-y-clientes", "tablero-de-ventas", "sistema-a-medida",
      "asistente-ia-para-tu-web", "asistente-por-whatsapp", "agente-de-ventas", "automatizacion", "plataforma-educativa-con-ia", "clasificador-con-ia",
      "renovacion", "mantenimiento-basico", "mantenimiento-pro",
      "consultoria-inicial", "diagnostico-escrito", "sprint-con-demo", "mantenimiento-de-proyectos-grandes",
    ];
    for (const id of antes) expect(getPlan(id), id).toBeDefined();
    for (const id of ["combo-arranque", "combo-atencion-24-h", "combo-negocio-con-turnos", "combo-pyme-digital"]) expect(getCombo(id), id).toBeDefined();
    for (const id of ["pagina-adicional", "blog", "dominio-com-ar-nic-ar-por-ano"]) expect(getExtra(id), id).toBeDefined();
  });

  it("los combos apuntan a planes que existen", () => {
    for (const c of combos) {
      expect(c.planIds.length, c.id).toBeGreaterThan(1);
      for (const id of c.planIds) expect(getPlan(id), `${c.id} → ${id}`).toBeDefined();
    }
  });

  it("combo-web-turnos es un alias del combo Página + turnos (links viejos)", () => {
    expect(aliases["combo-web-turnos"]).toBe("combo-negocio-con-turnos");
    expect(resolverId("combo-web-turnos")).toBe("combo-negocio-con-turnos");
    expect(getCombo("combo-web-turnos")?.id).toBe("combo-negocio-con-turnos");
    expect(getPlan("combo-web-turnos")).toBeUndefined();
    for (const destino of Object.values(aliases)) expect(getPlan(destino) ?? getCombo(destino), destino).toBeDefined();
  });

  it("cada plan y cada combo dice para quién es", () => {
    for (const p of plans) expect(p.paraQuien.length, p.id).toBeGreaterThan(10);
    for (const c of combos) expect(c.paraQuien.length, c.id).toBeGreaterThan(10);
  });
});

describe("precioDePlan", () => {
  it("plan con implementación y abono", () => {
    expect(precioDePlan(getPlan("turnos-online")!, "transferencia")).toEqual({
      tipo: "unico",
      etiqueta: "Pago único",
      precio: 177000,
      texto: "",
      unidad: "",
      abono: 22000,
    });
  });

  it("plan desde", () => {
    const p = precioDePlan(getPlan("automatizacion")!, "transferencia");
    expect(p.tipo).toBe("desde");
    expect(p.etiqueta).toBe("Desde");
    expect(p.unidad).toBe("por cada tarea automatizada");
  });

  it("plan de solo abono", () => {
    expect(precioDePlan(getPlan("mantenimiento-pro")!, "mp")).toEqual({
      tipo: "mensual",
      etiqueta: "Por mes",
      precio: 51900,
      texto: "",
      unidad: "/mes",
      abono: null,
    });
  });
});

describe("cotizar", () => {
  it("un plan", () => {
    const c = cotizar({ planIds: ["landing-express"] });
    expect(c.implementacion).toBe(177000);
    expect(c.abonoMensual).toBe(0);
    expect(c.total).toBe(177000);
    expect(c.desde).toBe(false);
  });

  it("veterinaria con turnos: el id viejo combo-web-turnos cotiza el combo Página + turnos", () => {
    const c = cotizar({ planIds: ["combo-web-turnos"] });
    expect(c.items.map((i) => i.id)).toEqual(["combo-negocio-con-turnos"]);
    expect(c.implementacion).toBe(357000);
    expect(c.abonoMensual).toBe(45000);
    expect(c.total).toBe(357000 + 45000 * 12);
  });

  it("aplica un combo solo cuando están todas sus partes", () => {
    const c = cotizar({ planIds: ["landing-profesional", "catalogo-con-pedidos-por-whatsapp"] });
    expect(c.combosAplicados).toEqual(["combo-arranque"]);
    expect(c.items).toHaveLength(1);
    expect(c.implementacion).toBe(417000);
    expect(c.abonoMensual).toBe(15000);
  });

  it("combo explícito absorbe sus partes repetidas", () => {
    const c = cotizar({ planIds: ["combo-pyme-digital", "sitio-pyme"] });
    expect(c.items.map((i) => i.id)).toEqual(["combo-pyme-digital"]);
    expect(c.implementacion).toBe(1257000);
  });

  it("plan desde marca la cotización como piso", () => {
    const c = cotizar({ planIds: ["tienda-online-con-mercado-pago"] });
    expect(c.desde).toBe(true);
    expect(c.implementacion).toBe(747000);
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
    expect(c.items.map((i) => i.implementacion)).toEqual([187600, 190800, 63600]);
    expect(c.implementacion).toBe(187600 + 190800 + 63600);
    // Los pagos van sobre el total por transferencia, sin el recargo.
    expect(c.pagos?.total).toBe(177000 + 180000 + 60000);
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
    expect(c.filas.map((f) => f.precio)).toEqual([177000, 249000, 597000]);
    expect(c).not.toHaveProperty("total");
    expect(c).not.toHaveProperty("implementacion");
  });

  it("comparar mantenimiento Básico y Pro muestra cada abono, no $80.000", () => {
    const c = comparar({ ids: ["mantenimiento-basico", "mantenimiento-pro"] });
    expect(c.filas.map((f) => [f.etiqueta, f.precio, f.unidad])).toEqual([
      ["Por mes", 25000, "/mes"],
      ["Por mes", 49000, "/mes"],
    ]);
  });

  it("comparar trae la otra forma de pago, para quién es y el recomendado", () => {
    const pro = comparar({ ids: ["landing-express", "landing-profesional"] }).filas[1];
    expect(pro.alt).toMatch(/^\$59\.000 de entrada y \$42\.000 por mes/);
    expect(pro.paraQuien).toBe(getPlan("landing-profesional")!.paraQuien);
    expect(pro.recomendado).toBe(true);
  });

  it("comparar con combos y con ids inventados", () => {
    const c = comparar({ ids: ["turnos-online", "combo-negocio-con-turnos", "app-tipo-uber"], medio: "mp" });
    expect(c.filas[1]).toMatchObject({ tipo: "combo", etiqueta: "Combo", precio: 378400, abono: 47700 });
    expect(c.desconocidos).toEqual(["app-tipo-uber"]);
  });

  it("cotizar sí suma lo que se contrata junto", () => {
    const c = cotizar({ planIds: ["tienda-online-con-mercado-pago", "asistente-por-whatsapp"] });
    expect(c.implementacion).toBe(1194000);
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
    expect(c.usd).toEqual({ tipoDeCambio: 1000, implementacion: 250, abonoMensual: 0, anual: 0, total: 250 });
    expect(resumenCotizacion(c)).toContain("≈ USD 250");
    expect(cotizar({ planIds: ["landing-profesional"] }).usd).toBeUndefined();
  });

  it("comparar en USD fila por fila", () => {
    const c = comparar({ ids: ["turnos-online", "combo-web-turnos"], tipoDeCambio: 1000 });
    expect(c.filas[1].id).toBe("combo-negocio-con-turnos");
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
    expect(precioDePlan(sprint, "mp")).toMatchObject({ tipo: "aCotizar", etiqueta: "A cotizar", precio: null, texto: "se cotiza en el plan escrito" });
    const c = cotizar({ planIds: ["sprint-con-demo"], medio: "mp" });
    expect(c.implementacion).toBe(0);
    expect(c.total).toBe(0);
    expect(c.aCotizar).toEqual(["Etapa de 2 semanas con avance funcionando: se cotiza en el plan escrito"]);
    expect(resumenCotizacion(c)).toContain("se cotiza en el plan escrito");
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
    expect(c.implementacion).toBe(249000);
    expect(c.aCotizar).toEqual(["Tu dirección web .com.ar (por año): según tarifa vigente de NIC.ar"]);
  });

  it("todos los extras tienen precio o texto", () => {
    for (const e of extras) expect(e.price != null || e.aCotizar.length > 0, e.id).toBe(true);
  });
});

describe("formas de pago (tanda P1)", () => {
  const unicos = [
    ...plans.filter((p) => p.category !== "grandes" && p.impl != null && p.impl > 0).map((p) => [p.id, p.impl!] as const),
    ...combos.map((c) => [c.id, c.price] as const),
  ];

  it("todo precio único de hasta $600.000 se parte en 3 pagos de miles exactos (regla de diseño)", () => {
    for (const [id, precio] of unicos.filter(([, p]) => p <= 600000)) {
      expect(precio % 3000, `${id}: ${precio}`).toBe(0);
    }
  });

  it("el tope de los 3 pagos es $600.000, inclusive", () => {
    expect(pagosDe(600000)?.tres).toEqual([200000, 200000, 200000]);
    expect(pagosDe(600001)?.tres).toBeNull();
    expect(pagosDe(600001)?.dos).toEqual([300000, 300001]);
  });

  it("los pagos suman exacto: el último absorbe la diferencia", () => {
    for (const total of [177000, 100000, 417001, 1257000, 1]) {
      const p = pagosDe(total)!;
      expect(p.dos.reduce((s, x) => s + x, 0), `dos ${total}`).toBe(total);
      if (p.tres) expect(p.tres.reduce((s, x) => s + x, 0), `tres ${total}`).toBe(total);
    }
    expect(pagosDe(100000)?.tres).toEqual([33333, 33333, 33334]);
  });

  it("tarjeta: el total con el recargo, en hasta 6 cuotas", () => {
    expect(pagosDe(249000)?.tarjeta).toEqual({ total: 263900, cuotas: 6, cuota: 44000 });
  });

  it("sin pago único no hay pagos", () => {
    expect(pagosDe(0)).toBeNull();
    expect(lineaDePagos(null)).toBeNull();
    expect(pagosDePlan(getPlan("mantenimiento-basico")!)).toBeNull();
    expect(pagosDePlan(getPlan("renovacion")!)).toBeNull();
    expect(pagosDePlan(getPlan("diagnostico-escrito")!)).toBeNull();
  });

  it("lineaDePagos: 3 pagos hasta el tope, 2 arriba", () => {
    expect(lineaDePagos(249000)).toBe("o 3 pagos de $83.000 sin interés");
    expect(lineaDePlan(getPlan("tienda-online-con-mercado-pago")!)).toBe("o 2 pagos de $373.500 sin interés");
    expect(pagosCortos(177000)).toBe("3 × $59.000");
  });

  it("la tabla §3: cada pago de 3 es el de la columna", () => {
    const tabla: Record<string, number> = {
      "landing-express": 59000,
      "landing-profesional": 83000,
      "landing-premium": 119000,
      "sitio-pyme": 199000,
      "catalogo-con-pedidos-por-whatsapp": 83000,
      "menu-digital-qr": 39000,
      "turnos-online": 59000,
      "reservas-con-sena": 119000,
      "tablero-de-ventas": 109000,
      "pedidos-y-clientes": 179000,
      "asistente-ia-para-tu-web": 109000,
      "agente-de-ventas": 199000,
    };
    for (const [id, pago] of Object.entries(tabla)) expect(pagosDePlan(getPlan(id)!)?.tres?.[0], id).toBe(pago);
    expect(pagosDe(getCombo("combo-arranque")!.price)?.tres?.[0]).toBe(139000);
    expect(pagosDe(getCombo("combo-pyme-digital")!.price)?.tres).toBeNull();
  });

  it("el tope se mira sobre el total contratado, no plan por plan", () => {
    const c = cotizar({ planIds: ["landing-premium", "reservas-con-sena"] });
    expect(c.implementacion).toBe(714000);
    expect(c.pagos?.tres).toBeNull();
    expect(c.pagos?.dos).toEqual([357000, 357000]);
    expect(resumenCotizacion(c)).toContain("o 2 pagos de $357.000 sin interés");
    expect(resumenCotizacion(cotizar({ planIds: ["landing-profesional"] }))).toContain("o 3 pagos de $83.000 sin interés");
  });

  it("comparar trae los pagos de cada opción", () => {
    const c = comparar({ ids: ["landing-express", "combo-pyme-digital", "mantenimiento-pro"] });
    expect(c.filas.map((f) => f.pagos?.tres?.[0] ?? null)).toEqual([59000, null, null]);
    expect(c.filas[1].pagos?.dos[0]).toBe(628500);
  });

  it("proyectos a medida quedan fuera de los pagos", () => {
    expect(cotizar({ planIds: ["diagnostico-escrito"] }).pagos).toBeNull();
    expect(cotizar({ planIds: ["diagnostico-escrito", "landing-express"] }).pagos?.total).toBe(177000);
  });

  it("Mantener online se muestra por mes, calculado", () => {
    expect(anualPorMes(getPlan("renovacion")!)).toBe("$7.500 por mes, pagás el año junto");
    expect(anualPorMes(getPlan("landing-express")!)).toBeNull();
  });
});

describe("catálogo P1", () => {
  it("cada categoría (salvo proyectos a medida) muestra 3 visibles, que existen e incluyen al recomendado", () => {
    for (const c of categories.filter((x) => x.key !== "grandes")) {
      expect(c.visibles, c.key).toHaveLength(3);
      for (const id of c.visibles) expect(c.plans.some((p) => p.id === id), `${c.key}: ${id}`).toBe(true);
      expect(c.visibles, c.key).toContain(c.plans.find((p) => p.rec)!.id);
    }
    expect(getCategory("grandes")!.visibles).toEqual([]);
  });

  it("todo plan y todo combo dice qué no incluye", () => {
    for (const p of plans) expect(p.noIncluye.length, p.id).toBeGreaterThan(0);
    for (const c of combos) expect(c.noIncluye.length, c.id).toBeGreaterThan(0);
  });

  it("las tarjetas llevan como mucho 3 viñetas", () => {
    for (const p of plans) expect(p.destacados.length, p.id).toBeLessThanOrEqual(3);
  });

  it("cada combo aparece en pestañas que existen", () => {
    const keys = categories.map((c) => c.key);
    for (const c of combos) {
      expect(c.categorias.length, c.id).toBeGreaterThan(0);
      for (const k of c.categorias) expect(keys, c.id).toContain(k);
    }
  });

  it("Página completa: mismo id, sin asistente", () => {
    const p = getPlan("landing-premium")!;
    expect(p.name).toBe("Página completa");
    expect(p.items.join(" ")).not.toMatch(/asistente/i);
    expect(p.usaServiciosDeTerceros).toEqual([]);
  });

  it("los planes con IA o WhatsApp oficial lo declaran", () => {
    for (const id of ["asistente-ia-para-tu-web", "asistente-por-whatsapp", "agente-de-ventas"]) {
      expect(getPlan(id)!.usaServiciosDeTerceros, id).toContain("ia");
    }
    expect(getPlan("asistente-por-whatsapp")!.usaServiciosDeTerceros).toContain("whatsapp");
  });

  it("el recomendado de mantenimiento es el del medio", () => {
    expect(getCategory("mant")!.plans.find((p) => p.rec)?.id).toBe("mantenimiento-basico");
    expect(getPlan("mantenimiento-pro")?.monthly).toBe(49000);
  });
});
