import Link from "next/link";
import { home } from "@/content/agencia/home";
import { categories, combos, extras } from "@/content/agencia/pricing";
import { PricingCatalog } from "../client/PricingCatalog";

/**
 * Catálogo completo de `/precios` (`05-precios-*.png`). Antes vivía en la
 * home; desde la tanda R2 es una página propia. El encabezado (H1) y el pie
 * legal son HTML del servidor; las pestañas, el medio de pago y las
 * tarjetas viven en la isla.
 */
export function PricingSection() {
  const { pricing } = home;

  return (
    <section className="wrap pb-24 pt-10 sm:pt-16">
      <PricingCatalog
        categories={categories}
        combos={combos}
        extras={extras}
        copy={pricing}
        heading={
          <div>
            <span className="lbl lbl-o">{pricing.label}</span>
            <h1 className="h h2">{pricing.title}</h1>
            <p className="mb-0 mt-2 text-[17px] text-muted">{pricing.lead}</p>
          </div>
        }
        footer={
          <p className="mb-0 mt-4 text-[13px] leading-[1.55] text-muted">
            {pricing.legal}{" "}
            <Link href={pricing.legalCta.href} className="lnk min-h-11 text-[13px]">
              {pricing.legalCta.label}
            </Link>
          </p>
        }
      />
    </section>
  );
}
