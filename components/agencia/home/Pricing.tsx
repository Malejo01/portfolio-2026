import Link from "next/link";
import { home } from "@/content/agencia/home";
import { categories, combos, extras } from "@/content/agencia/pricing";
import { PricingCatalog } from "../client/PricingCatalog";
import { Reveal } from "../client/Reveal";

/**
 * Precios (`05-precios-*.png`). El encabezado y el pie legal son HTML del
 * servidor; las pestañas, el medio de pago y las tarjetas viven en la isla.
 */
export function Pricing() {
  const { pricing } = home;

  return (
    <section id="precios" className="wrap pt-[72px] sm:pt-24">
      <PricingCatalog
        categories={categories}
        combos={combos}
        extras={extras}
        copy={pricing}
        heading={
          <Reveal>
            <span className="lbl lbl-o">{pricing.label}</span>
            <h2 className="h h2">{pricing.title}</h2>
            <p className="mb-0 mt-2 text-[17px] text-muted">{pricing.lead}</p>
          </Reveal>
        }
        footer={
          <p className="mb-0 mt-4 text-[13px] leading-[1.55] text-muted">
            {pricing.legal}{" "}
            <Link href={pricing.legalCta.href} className="lnk text-[13px]">
              {pricing.legalCta.label}
            </Link>
          </p>
        }
      />
    </section>
  );
}
