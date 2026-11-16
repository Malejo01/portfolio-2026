import datos from "@/public/agencia/sprites/sprites.json";
import { dibujos, type Dibujo, type Pose } from "@/content/agencia/estilos";

/**
 * El personaje en 3 dibujos (tanda P3-1). Los PNG y `sprites.json` los
 * generan `scripts/sprites/limpiar.py` y `animar.py` (`npm run sprites`)
 * desde `docs/agencia/sprites/`.
 *
 * Cada dibujo tiene su lienzo (recortado al margen común, con los pies en la
 * última fila y `aire` px arriba para el salto del festejo). Para que los 3
 * se vean del mismo tamaño, la escala sale del alto del personaje
 * (`alto - aire`), no del lienzo.
 */
export type Animacion = "idle" | "saludo" | "festejo";

export interface DatosDibujo {
  nombre: string;
  bloque: number;
  ancho: number;
  alto: number;
  aire: number;
}

export const SPRITES = datos as Record<Dibujo, DatosDibujo & { animaciones: Record<Animacion, { total: number }> }>;
export const DIBUJOS_SPRITE = Object.keys(SPRITES) as Dibujo[];

/** Tamaño en pantalla de un dibujo para que el personaje mida `alto` px (de la cabeza a los pies). */
export function medida(dibujo: Dibujo, alto: number): { w: number; h: number } {
  const d = SPRITES[dibujo];
  const s = alto / (d.alto - d.aire);
  return { w: Math.round(d.ancho * s), h: Math.round(d.alto * s) };
}

export function srcPose(dibujo: Dibujo, pose: Pose): string {
  return `/agencia/sprites/${dibujo}/${pose}.png`;
}

export function srcTira(dibujo: Dibujo, anim: Animacion): string {
  return `/agencia/sprites/${dibujo}/${anim}.png`;
}

/** Los 3 dibujos para los selectores de personaje (miniatura de la pose normal). */
export function personajes(alto = 64): { id: Dibujo; nombre: string; src: string; w: number; h: number }[] {
  return dibujos.map((d) => ({ id: d.id, nombre: d.nombre, src: srcPose(d.id, "normal"), ...medida(d.id, alto) }));
}
