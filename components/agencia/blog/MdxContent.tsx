import { evaluate } from "@mdx-js/mdx";
import Link from "next/link";
import * as runtime from "react/jsx-runtime";
import { getCombo, getPlan, recargoMercadoPago } from "@/content/agencia/pricing";
import { ahorro, fmt, precioDePlan } from "@/lib/agencia/pricing";

/**
 * Componentes que los posts pueden usar para citar precios **del catálogo**
 * en vez de escribirlos a mano: si un precio cambia en `precios.json`, el
 * post se actualiza en el próximo build.
 */
function Precio({ id }: { id: string }) {
  const plan = getPlan(id);
  if (!plan) return <mark>[plan desconocido: {id}]</mark>;
  const p = precioDePlan(plan, "transferencia");
  return (
    <strong className="text-text">
      {p.etiqueta === "Desde" ? "desde " : ""}
      {p.precio == null ? p.texto : fmt(p.precio)}
      {p.abono ? ` + ${fmt(p.abono)}/mes` : ""}
    </strong>
  );
}

function Combo({ id }: { id: string }) {
  const combo = getCombo(id);
  if (!combo) return <mark>[combo desconocido: {id}]</mark>;
  return (
    <>
      <strong className="text-text">{combo.name}</strong> ({fmt(combo.price)} + {fmt(combo.monthly)}/mes, ahorrás {ahorro(combo)}%)
    </>
  );
}

function Recargo() {
  return <>{Math.round(recargoMercadoPago * 100)}%</>;
}

function A({ href = "", children }: { href?: string; children?: React.ReactNode }) {
  return href.startsWith("/") ? <Link href={href}>{children}</Link> : <a href={href} target="_blank" rel="noopener">{children}</a>;
}

/** Compila el MDX en el build (Server Component). */
export async function MdxContent({ source }: { source: string }) {
  const { default: Content } = await evaluate(source, { ...runtime, baseUrl: import.meta.url });
  return <Content components={{ Precio, Combo, Recargo, a: A }} />;
}
