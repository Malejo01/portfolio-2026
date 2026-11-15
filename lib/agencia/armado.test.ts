import { describe, expect, it } from "vitest";
import { getPlan } from "@/content/agencia/pricing";
import { MAX_ITEMS, aQuery, aplicar, deQuery, normalizar, type Armado } from "./armado";
import { clasificarId, estimarArmado, montoPlanEscrito, senaDelPiso, senaMinima, senaPara, validarArmado } from "./pricing";

const items = (...ids: string[]): Armado => ({ items: ids.map((id) => ({ id, origen: "persona" as const })), extras: [] });

describe("armado (tanda P2, Fase 2)", () => {
  it("?a= de ida y vuelta, con extras y el origen de lo que llega por link", () => {
    const a: Armado = { items: [{ id: "landing-profesional", origen: "malejo" }, { id: "turnos-online", origen: "persona" }], extras: ["blog"] };
    expect(aQuery(a)).toBe("landing-profesional,turnos-online,blog");
    expect(deQuery(aQuery(a), clasificarId)).toEqual({
      items: [
        { id: "landing-profesional", origen: "persona" },
        { id: "turnos-online", origen: "persona" },
      ],
      extras: ["blog"],
    });
  });

  it("descarta ids inválidos, resuelve alias y no repite", () => {
    const a = deQuery("inventado,COMBO-WEB-TURNOS,combo-negocio-con-turnos,<script>,turnos-online,,turnos-online", clasificarId);
    expect(a.items.map((i) => i.id)).toEqual(["combo-negocio-con-turnos", "turnos-online"]);
    expect(validarArmado({ items: [{ id: 42 }, { id: "blog" }], extras: ["no-existe"] })).toEqual({ items: [], extras: ["blog"] });
    expect(validarArmado("basura")).toEqual({ items: [], extras: [] });
  });

  it(`tope de ${MAX_ITEMS} ítems`, () => {
    const todos = ["landing-express", "landing-profesional", "landing-premium", "sitio-pyme", "menu-digital-qr", "turnos-online", "reservas-con-sena", "tablero-de-ventas", "control-de-stock-con-qr", "pedidos-y-clientes", "asistente-ia-para-tu-web", "agente-de-ventas", "renovacion", "blog"];
    const a = deQuery(todos.join(","), clasificarId);
    expect(a.items.length + a.extras.length).toBe(MAX_ITEMS);
    expect(aplicar(a, { accion: "agregar", id: "blog", origen: "persona" }, clasificarId)).toBe(a);
  });

  it("agregar, quitar y vaciar; agregar dos veces no duplica", () => {
    let a = aplicar({ items: [], extras: [] }, { accion: "agregar", id: "turnos-online", origen: "malejo" }, clasificarId);
    a = aplicar(a, { accion: "agregar", id: "turnos-online", origen: "persona" }, clasificarId);
    a = aplicar(a, { accion: "agregar", id: "pagina-adicional", origen: "persona" }, clasificarId);
    expect(a).toEqual({ items: [{ id: "turnos-online", origen: "malejo" }], extras: ["pagina-adicional"] });
    expect(aplicar(a, { accion: "quitar", id: "pagina-adicional" }, clasificarId).extras).toEqual([]);
    expect(aplicar(a, { accion: "vaciar" })).toEqual({ items: [], extras: [] });
    expect(aplicar(a, { accion: "agregar", id: "no-existe", origen: "persona" }, clasificarId)).toBe(a);
  });

  it("normalizar sin catálogo solo mira la forma del id", () => {
    expect(normalizar({ items: ["ok-id", "MAL ID"] }, (id) => ({ id, tipo: "item" })).items.map((i) => i.id)).toEqual(["ok-id"]);
  });
});

describe("estimarArmado (tanda P2, D2)", () => {
  it("piso = lo publicado; techo = +15% de lo fijo, redondeado a miles", () => {
    const e = estimarArmado(items("landing-profesional"));
    expect(e.piso).toBe(249000);
    expect(e.techo).toBe(Math.round((249000 * 1.15) / 1000) * 1000);
    expect(e.techo).toBeGreaterThan(e.piso);
  });

  it("lo \"desde\" suma 50% al techo", () => {
    const e = estimarArmado(items("tienda-online-con-mercado-pago"));
    expect(getPlan("tienda-online-con-mercado-pago")!.from).toBe(true);
    expect(e.piso).toBe(747000);
    expect(e.techo).toBe(Math.round((747000 * 1.5) / 1000) * 1000);
    expect(e.mensual).toBe(35000);
  });

  it("los combos se aplican solos dentro del armado", () => {
    const e = estimarArmado(items("landing-profesional", "turnos-online"));
    expect(e.cotizacion.combosAplicados).toEqual(["combo-negocio-con-turnos"]);
    expect(e.piso).toBe(357000);
    expect(e.mensual).toBe(45000);
  });

  it("el tope de los 3 pagos se mira sobre el piso", () => {
    expect(estimarArmado(items("landing-profesional", "catalogo-con-pedidos-por-whatsapp")).pagos?.tres).not.toBeNull();
    const caro = estimarArmado(items("landing-premium", "turnos-online", "tablero-de-ventas"));
    expect(caro.piso).toBeGreaterThan(600000);
    expect(caro.pagos?.tres).toBeNull();
    expect(caro.pagos?.dos).toHaveLength(2);
  });

  it("solo lo mensual: sin pago único, techo 0 y sin pagos", () => {
    const e = estimarArmado(items("mantenimiento-basico"));
    expect([e.piso, e.techo, e.pagos, e.mensual]).toEqual([0, 0, null, 25000]);
  });

  it("requiere plan escrito arriba de $750.000, con proyectos grandes o con un sistema a medida", () => {
    expect(estimarArmado(items("landing-profesional")).requierePlanEscrito).toBe(false);
    expect(estimarArmado(items("sitio-pyme", "pedidos-y-clientes")).requierePlanEscrito).toBe(true);
    expect(estimarArmado(items("sistema-a-medida")).requierePlanEscrito).toBe(true);
    expect(estimarArmado(items("diagnostico-escrito")).requierePlanEscrito).toBe(true);
  });

  it("vacío: todo en cero", () => {
    const e = estimarArmado({ items: [], extras: [] });
    expect([e.piso, e.techo, e.mensual]).toEqual([0, 0, 0]);
  });
});

describe("senaPara (tanda P2, D4)", () => {
  it("los tres tramos: $25.000, $50.000 y el plan escrito", () => {
    expect(senaPara(["landing-profesional"])).toEqual({ tipo: "demo", monto: 25000 });
    expect(senaPara(["tienda-online-con-mercado-pago"])).toEqual({ tipo: "demo", monto: 50000 });
    expect(senaPara(["sitio-pyme", "pedidos-y-clientes"])).toEqual({ tipo: "plan-escrito", monto: 60000 });
    expect(montoPlanEscrito()).toBe(60000);
    expect(senaMinima()).toBe(25000);
  });

  it("los bordes: $360.000, $360.001, $750.000 y $750.001 (sobre el piso del total)", () => {
    expect(senaDelPiso(360000)).toEqual({ tipo: "demo", monto: 25000 });
    expect(senaDelPiso(360001)).toEqual({ tipo: "demo", monto: 50000 });
    expect(senaDelPiso(750000)).toEqual({ tipo: "demo", monto: 50000 });
    expect(senaDelPiso(750001)).toEqual({ tipo: "plan-escrito", monto: 60000 });
    // Con el catálogo: Página completa ($357.000) queda abajo; con una vuelta de correcciones ($382.000), arriba.
    const conVuelta = (id: string): Armado => ({ items: [{ id, origen: "persona" }], extras: ["ronda-de-revision-extra"] });
    expect(senaPara(["landing-premium"])).toEqual({ tipo: "demo", monto: 25000 });
    expect(senaPara(conVuelta("landing-premium"))).toEqual({ tipo: "demo", monto: 50000 });
    // Tienda que cobra sola ($747.000) queda en el segundo tramo; con la vuelta ($772.000), plan escrito.
    expect(senaPara(conVuelta("tienda-online-con-mercado-pago")).tipo).toBe("plan-escrito");
  });

  it("con IA o WhatsApp oficial, el mínimo es $50.000", () => {
    expect(senaPara(["asistente-ia-para-tu-web"])).toEqual({ tipo: "demo", monto: 50000 });
    expect(senaPara(["turnos-online"])).toEqual({ tipo: "demo", monto: 50000 });
    expect(senaPara(["combo-atencion-24-h"])).toEqual({ tipo: "demo", monto: 50000 });
    expect(senaPara(["landing-express"])).toEqual({ tipo: "demo", monto: 25000 });
  });

  it("la renovación de una web tiene la demo sin cargo", () => {
    expect(senaPara(["renova-tu-web"])).toEqual({ tipo: "sin-cargo" });
    // Con otra cosa al lado, ya no.
    expect(senaPara(["renova-tu-web", "turnos-online"]).tipo).not.toBe("sin-cargo");
  });

  it("un sistema a medida o un proyecto grande van con plan escrito, aunque el monto sea chico", () => {
    expect(senaPara(["sistema-a-medida"])).toEqual({ tipo: "plan-escrito", monto: 60000 });
    expect(senaPara(["diagnostico-escrito"]).tipo).toBe("plan-escrito");
  });

  it("los combos y los alias cuentan por su total", () => {
    expect(senaPara(["combo-web-turnos"])).toEqual(senaPara(["combo-negocio-con-turnos"]));
    expect(senaPara(["combo-arranque"])).toEqual({ tipo: "demo", monto: 50000 });
  });

  it("sin nada elegido: la seña más chica", () => {
    expect(senaPara([])).toEqual({ tipo: "demo", monto: 25000 });
  });
});
