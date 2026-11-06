import type { Metadata } from "next";
import { notFound } from "next/navigation";

/**
 * La misma metadata que `not-found.tsx` de al lado: cuando Next vuelve a
 * montar el árbol en el cliente resuelve la metadata por este segmento.
 */
export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: true },
};

/**
 * Existe solo para llamar a `notFound()`. Con tres root layouts no hay un
 * 404 global que Next pueda componer, así que cualquier URL de la raíz que
 * no matchee una ruta cae acá y renderiza el `not-found.tsx` de la agencia,
 * dentro de su layout (menú, pie y tokens propios).
 *
 * Vivía en `app/(es)/[...notFound]` mientras el portfolio ocupaba la raíz.
 * Ahora el portfolio tiene el suyo en `app/(es)/portfolio/[...notFound]` y
 * el inglés en `app/(en)/portfolio/en/[...notFound]`; Next resuelve primero
 * los segmentos estáticos, así que `/portfolio/…` nunca llega a este.
 */
export default function CatchAll() {
  notFound();
}
