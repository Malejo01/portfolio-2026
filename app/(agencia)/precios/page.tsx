import type { Metadata } from "next";
import { PricingSection } from "@/components/agencia/home/PricingSection";
import { home } from "@/content/agencia/home";

const { pricing } = home;

export const metadata: Metadata = {
  title: pricing.metaTitle,
  description: pricing.description,
  alternates: { canonical: "/precios" },
  openGraph: { title: pricing.metaTitle, description: pricing.description, url: "/precios", images: ["/og"] },
};

/** `/precios`: el catálogo completo (pestañas, combos, extras y medio de pago). Estática. */
export default function PreciosPage() {
  return <PricingSection />;
}
