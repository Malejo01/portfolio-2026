import { z } from "zod";
import { ETAPAS, FICHA_LIMITES as L, type Ficha } from "./ficha";

/**
 * Validación de la ficha en el servidor: la usan la herramienta
 * `anotar_ficha` y el body de `/api/chat`. Los strings se **truncan** (no se
 * rechazan) para que un dato largo no tire abajo el turno; los vacíos se
 * descartan.
 */
const texto = (max: number) =>
  z
    .string()
    .transform((s) => s.replace(/\s+/g, " ").trim().slice(0, max))
    .optional();

const lista = z
  .array(z.string())
  .transform((xs) =>
    xs
      .map((s) => s.replace(/\s+/g, " ").trim().slice(0, L.item))
      .filter(Boolean)
      .slice(-L.lista),
  )
  .optional();

export const FichaSchema = z.object({
  nombre: texto(L.texto),
  rubro: texto(L.texto),
  ciudad: texto(L.texto),
  necesidad: texto(L.necesidad),
  presupuesto: texto(L.texto),
  planesInteres: lista,
  urgencia: texto(L.texto),
  medioPago: texto(L.texto),
  cuotas: texto(L.texto),
  dudas: lista,
  etapa: z.enum(ETAPAS).optional(),
});

/** Quita las claves vacías que dejó el truncado. */
export function limpiarFicha(f: z.infer<typeof FichaSchema>): Ficha {
  const out: Ficha = {};
  for (const [k, v] of Object.entries(f) as [keyof Ficha, unknown][]) {
    if (typeof v === "string" ? v.length : Array.isArray(v) ? v.length : v != null) {
      (out as Record<string, unknown>)[k] = v;
    }
  }
  return out;
}
