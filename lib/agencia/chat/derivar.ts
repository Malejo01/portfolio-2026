/**
 * Salvaguarda de la derivación (tanda P1, evals reales del 11-11): a veces
 * el modelo escribe "le dejo tu consulta lista por WhatsApp" o "te paso con
 * Mauro" y no llama a `derivar_whatsapp`, aunque el prompt se lo exige. Si
 * el texto del turno promete derivar y no salió ninguna tarjeta de WhatsApp
 * ni de contacto, la ruta agrega la de WhatsApp con la ficha: la promesa
 * siempre tiene su botón. Módulo puro, testeable.
 */
const PROMETE = /\b(te|le) (paso|dejo|derivo|mando)\b[^.?!]{0,60}\b(Mauro|WhatsApp)\b/i;

export function prometeDerivar(texto: string): boolean {
  return PROMETE.test(texto);
}

/** Tarjetas que ya cumplen la promesa: WhatsApp o un camino de contacto. */
export const CUMPLEN_DERIVACION = new Set(["whatsapp", "consent", "formContacto"]);
