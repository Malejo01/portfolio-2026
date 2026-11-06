import type { Metadata } from "next";
import Link from "next/link";
import { ServiceCards } from "@/components/agencia/home/Services";
import { servicios } from "@/content/agencia/servicios";

const { index } = servicios;

export const metadata: Metadata = {
  title: index.metaTitle,
  description: index.description,
  alternates: { canonical: "/servicios" },
  openGraph: { title: index.metaTitle, description: index.description, url: "/servicios", images: ["/og"] },
};

/** Índice de servicios: las mismas seis tarjetas de la home, cada una a su página. */
export default function ServiciosPage() {
  return (
    <section className="wrap pb-24 pt-10 sm:pt-16">
      <span className="lbl lbl-o">{index.label}</span>
      <h1 className="h h2">{index.heading}</h1>
      <p className="mb-0 mt-2 max-w-[40em] text-[17px] text-muted">{index.lead}</p>
      <ServiceCards linkMode="page" heading="h2" />
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href={index.demo.href} className="btn btn-p">
          {index.demo.label}
        </Link>
        <Link href={index.cotizador.href} className="btn btn-s">
          {index.cotizador.label}
        </Link>
      </div>
    </section>
  );
}
