/**
 * S8 · Tope de tamaño del historial que llega al modelo: como mucho
 * `MAX_CHARS` caracteres en total. Se descartan los mensajes más viejos y
 * siempre se conserva el último mensaje del usuario (cada mensaje ya viene
 * topeado a 2.000 caracteres por el esquema de la ruta). El resultado
 * empieza por un mensaje del usuario, como pide la API.
 */
export const MAX_CHARS = 12_000;

export function recortarHistorial<T extends { role: "user" | "assistant"; content: string }>(mensajes: T[], max = MAX_CHARS): T[] {
  let total = 0;
  let desde = mensajes.length;
  for (let i = mensajes.length - 1; i >= 0; i--) {
    const largo = mensajes[i].content.length;
    // El último mensaje entra siempre, aunque solo él pase el tope.
    if (i < mensajes.length - 1 && total + largo > max) break;
    total += largo;
    desde = i;
  }
  let out = mensajes.slice(desde);
  while (out.length > 1 && out[0].role !== "user") out = out.slice(1);
  return out;
}
