import type { Metadata } from "next";
import { notFound } from "next/navigation";

/**
 * La misma metadata que `not-found.tsx`. Hace falta en los dos lados: el
 * HTML del servidor sale con la del `not-found`, pero cuando Next vuelve a
 * montar el árbol en el cliente resuelve la metadata por segmento, y el
 * segmento es este. Sin esto, a los pocos segundos el título del 404 pasaba
 * al del home y el `noindex` desaparecía.
 */
export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: true },
};

/**
 * Existe solo para llamar a `notFound()`.
 *
 * Sin esto, una URL que no matchea ninguna ruta la resuelve Next contra su
 * 404 global, y con **dos** root layouts no hay forma de decirle en qué
 * idioma renderizarlo. Con este catch-all, cualquier cosa que caiga en este
 * árbol dispara el `not-found.tsx` de al lado, que ya está adentro del
 * layout correcto: `<html lang>`, nav y footer en el idioma que toca.
 *
 * No se come las rutas reales: Next resuelve los segmentos estáticos antes
 * que los catch-all.
 */
export default function CatchAll() {
  notFound();
}
