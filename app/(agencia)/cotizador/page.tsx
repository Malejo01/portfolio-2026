import type { Metadata } from "next";
import { Cotizador } from "@/components/agencia/client/Cotizador";
import { cotizadorCopy as copy } from "@/content/agencia/cotizador";
import { home } from "@/content/agencia/home";
import { categories, extras } from "@/content/agencia/pricing";

export const metadata: Metadata = {
  title: copy.metaTitle,
  description: copy.description,
  alternates: { canonical: "/cotizador" },
  openGraph: { title: copy.metaTitle, description: copy.description, url: "/cotizador", images: ["/og"] },
};

/**
 * En proyectos grandes solo se cotiza el diagnóstico escrito: la consultoría
 * es sin cargo y el sprint se cotiza con el diagnóstico.
 */
const cotizables = categories.map((c) =>
  c.key === "grandes" ? { ...c, plans: c.plans.filter((p) => typeof p.impl === "number" && p.impl > 0) } : c,
);

export default function CotizadorPage() {
  return (
    <section className="wrap pb-24 pt-10 sm:pt-16">
      <span className="lbl lbl-o">{copy.label}</span>
      <h1 className="h h2">{copy.title}</h1>
      <p className="mb-0 mt-2 max-w-[44em] text-[17px] text-muted">{copy.lead}</p>
      <Cotizador categories={cotizables} extras={extras} copy={copy} medioCopy={home.pricing} />
    </section>
  );
}
