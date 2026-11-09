import { describe, expect, it } from "vitest";
import { aliases, combos, getCombo, getPlan, plans } from "@/content/agencia/pricing";
import { planDesdeUrl } from "./demo-plan";

/** Las mismas opciones que arma `app/(agencia)/demo/page.tsx`. */
const opciones = [...combos.map((c) => ({ id: c.id, name: `Combo ${c.name}` })), ...plans.map((p) => ({ id: p.id, name: p.name }))];

describe("/demo?plan= (links viejos)", () => {
  it("/demo?plan=landing-profesional preselecciona el plan con su nombre nuevo", () => {
    expect(planDesdeUrl("landing-profesional", opciones, aliases)).toEqual({ id: "landing-profesional", extra: null });
    expect(getPlan("landing-profesional")?.name).toBe("Página para aparecer en Google");
  });

  it("/demo?plan=combo-web-turnos cae en el combo Página + turnos", () => {
    expect(planDesdeUrl("combo-web-turnos", opciones, aliases)).toEqual({ id: "combo-negocio-con-turnos", extra: null });
    expect(getCombo("combo-negocio-con-turnos")?.name).toBe("Página + turnos");
  });

  it("varios ids (chat o cotizador) arman una opción combinada, con alias resueltos", () => {
    const r = planDesdeUrl("turnos-online,combo-web-turnos", opciones, aliases);
    expect(r?.id).toBe("turnos-online,combo-negocio-con-turnos");
    expect(r?.extra?.name).toBe("Agenda de turnos online + Combo Página + turnos");
  });

  it("ids inventados o vacíos: sin preselección", () => {
    expect(planDesdeUrl("app-tipo-uber", opciones, aliases)).toBeNull();
    expect(planDesdeUrl("", opciones, aliases)).toBeNull();
    expect(planDesdeUrl(null, opciones, aliases)).toBeNull();
  });
});
