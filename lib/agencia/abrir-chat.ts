/**
 * Contrato del evento global que abre el chat de Malejo desde cualquier
 * botón del sitio (tanda R2, F3). Módulo puro: lo comparten la isla
 * `AbrirChat` (que lo dispara) y `MalejoLoader` (que lo escucha).
 *
 *   window.dispatchEvent(new CustomEvent("malejo:abrir", { detail: { tema }, cancelable: true }))
 *
 * El evento es cancelable a propósito: el loader llama a `preventDefault()`
 * para avisar "lo atiendo yo". Si nadie lo cancela (el loader no montó, o el
 * chunk del widget falló), `dispatchEvent` devuelve `true` y el botón sigue
 * su `href`: WhatsApp con el texto genérico. Así el respaldo no depende de
 * un temporizador ni de una ventana emergente.
 */
export const ABRIR_CHAT_EVENT = "malejo:abrir";

export interface AbrirChatDetail {
  /** Primer mensaje del usuario, ya enviado al abrir ("Quiero dar turnos online"). */
  tema?: string;
}

/** Dispara el evento. `true` = alguien abrió el chat; `false` = seguí el link. */
export function abrirChat(detail: AbrirChatDetail = {}): boolean {
  const ev = new CustomEvent<AbrirChatDetail>(ABRIR_CHAT_EVENT, { detail, cancelable: true });
  return !window.dispatchEvent(ev);
}
