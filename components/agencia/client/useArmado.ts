"use client";

import { useSyncExternalStore } from "react";
import { ARMADO_EVENT, ARMADO_KEY, ARMADO_VACIO, leer, type Armado, type Clasificador, sinValidar } from "@/lib/agencia/armado";

/**
 * El armado como estado de React (tanda P2), leído de `sessionStorage` con
 * `useSyncExternalStore`: el carrito, cada botón "Agregar al armado" y el
 * widget de Malejo ven siempre lo mismo, sin un contexto que los una (son
 * islas separadas). Se escucha el evento `malejo:armado` de esta pestaña.
 *
 * En el servidor (y en el primer render del cliente) el armado está vacío:
 * así la página sigue estática y la hidratación no difiere.
 */
const cache = new Map<string, { raw: string | null; armado: Armado }>();

function suscribir(cb: () => void): () => void {
  window.addEventListener(ARMADO_EVENT, cb);
  // Otra pestaña no comparte sessionStorage: no hace falta escuchar `storage`.
  return () => window.removeEventListener(ARMADO_EVENT, cb);
}

function crudo(): string | null {
  try {
    return window.sessionStorage.getItem(ARMADO_KEY);
  } catch {
    return null;
  }
}

/** Una instantánea estable por contenido: `useSyncExternalStore` exige la misma referencia si no cambió. */
function instantanea(clave: string, clasificar: Clasificador): Armado {
  const raw = crudo();
  const prev = cache.get(clave);
  if (prev && prev.raw === raw) return prev.armado;
  const armado = raw ? leer(clasificar) : ARMADO_VACIO;
  cache.set(clave, { raw, armado });
  return armado;
}

/**
 * `clave` separa las cachés de quien valida con el catálogo (el armador) y
 * quien no lo carga (los botones y el widget, que confían en los ids del
 * servidor).
 */
export function useArmado(clasificar: Clasificador = sinValidar, clave = "sin-validar"): Armado {
  return useSyncExternalStore(
    suscribir,
    () => instantanea(clave, clasificar),
    () => ARMADO_VACIO,
  );
}
