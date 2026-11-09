import type { Metadata } from "next";
import { Cotizador } from "@/components/agencia/client/Cotizador";
import { cotizadorCopy as copy } from "@/content/agencia/cotizador";
import { home } from "@/content/agencia/home";
import { categories, extras } from "@/content/agencia/pricing";
import { solucion } from "@/content/agencia/servicios";

export const metadata: Metadata = {
  title: copy.metaTitle,
  description: copy.description,
  alternates: { canonical: "/cotizador" },
  openGraph: { title: copy.metaTitle, description: copy.description, url: "/cotizador", images: ["/og"] },
};

/**
 * En proyectos a medida solo se cotiza el plan del proyecto por escrito: la
 * charla es gratis y cada etapa se cotiza en ese plan.
 */
const cotizables = categories.map((c) =>
  c.key === "grandes" ? { ...c, plans: c.plans.filter((p) => typeof p.impl === "number" && p.impl > 0) } : c,
);

const necesidades = Object.fromEntries(categories.map((c) => [c.key, c.key === "grandes" ? c.label : (solucion(c.key)?.problema ?? c.label)]));

export default function CotizadorPage() {
  return (
    <section className="wrap pb-24 pt-10 sm:pt-16">
      <span className="lbl lbl-o">{copy.label}</span>
      <h1 className="h h2">{copy.title}</h1>
      <p className="mb-0 mt-2 max-w-[44em] text-[17px] text-muted">{copy.lead}</p>
      <Cotizador categories={cotizables} extras={extras} copy={copy} medioCopy={home.pricing} necesidades={necesidades} />
    </section>
  );
}
