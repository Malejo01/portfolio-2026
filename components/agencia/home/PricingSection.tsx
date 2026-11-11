import Link from "next/link";
import { home } from "@/content/agencia/home";
import { categories, combos, planesDe, type Category } from "@/content/agencia/pricing";
import { solucion } from "@/content/agencia/servicios";
import { CondicionesModal, CostosFranja, ExtrasModal } from "../InfoPagos";
import { ComboCard, GrandesSteps, PlanCard, PlanFila } from "../PlanCard";
import { PricingCatalog, type CategoriaTab } from "../client/PricingCatalog";

/**
 * Catálogo completo de `/precios` (`05-precios-*.png`; tanda P1, §4.3 y
 * Fase 3 bis). Todo es HTML del servidor salvo el selector de categoría:
 * cada panel trae sus 3 tarjetas `visibles` en escalera, "Ver otras
 * opciones (N)" en lista compacta, los combos de esa pestaña y el enlace a
 * la solución. Debajo, la franja del auto, el taller y la nafta, los extras
 * en un modal y la letra chica en una línea.
 */

function Panel({ category }: { category: Category }) {
  const { pricing } = home;
  const s = solucion(category.key);
  if (category.key === "grandes") {
    return (
      <>
        <p className="mb-0 mt-2 text-[15px] text-muted">{category.intro}</p>
        <GrandesSteps plans={category.plans} />
        {s ? (
          <Link href={`/servicios/${category.key}`} className="lnk mt-3 min-h-11">
            {pricing.masSobre}
          </Link>
        ) : null}
      </>
    );
  }
  const { visibles, otras } = planesDe(category);
  const suyos = combos.filter((c) => c.categorias.includes(category.key));
  return (
    <>
      <p className="mb-0 mt-2 text-[15px] text-muted">{category.intro}</p>
      <div className="mt-[22px] grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibles.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
      {otras.length ? (
        <details className="plans mt-5">
          <summary className="btn btn-s min-h-11">{pricing.otras.replace("{N}", String(otras.length))}</summary>
          <ul className="card m-0 mt-3 list-none px-5 py-1">
            {otras.map((plan) => (
              <PlanFila key={plan.id} plan={plan} />
            ))}
          </ul>
        </details>
      ) : null}
      <Link href={`/servicios/${category.key}`} className="lnk mt-3 min-h-11">
        {pricing.masSobre}
      </Link>
      {suyos.length ? (
        <>
          <div className="mt-10">
            <span className="lbl lbl-o">{pricing.combosLabel}</span>
            <h3 className="h mt-2 text-[24px] sm:text-[28px]">{pricing.combosTitle}</h3>
          </div>
          <div className="mt-[18px] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {suyos.map((combo) => (
              <ComboCard key={combo.id} combo={combo} />
            ))}
          </div>
        </>
      ) : null}
    </>
  );
}

export function PricingSection() {
  const { pricing } = home;
  const tabs: CategoriaTab[] = categories.map((c) => {
    const s = solucion(c.key);
    return { key: c.key, label: c.label, short: s?.label ?? c.label, icon: s?.icon ?? "web" };
  });
  const panels = Object.fromEntries(categories.map((c) => [c.key, <Panel key={c.key} category={c} />]));

  return (
    <section className="wrap pb-24 pt-10 sm:pt-16">
      <PricingCatalog
        categories={tabs}
        panels={panels}
        tabsLabel={pricing.tabsLabel}
        viendo={pricing.viendo}
        heading={
          <div>
            <span className="lbl lbl-o">{pricing.label}</span>
            <h1 className="h h2">{pricing.title}</h1>
            <p className="mb-0 mt-2 text-[17px] text-muted">{pricing.lead}</p>
          </div>
        }
      />
      <div className="mt-10 flex flex-col gap-4">
        <CostosFranja />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <ExtrasModal />
          <Link href={pricing.legalCta.href} className="lnk min-h-11 whitespace-normal text-[14px]">
            {pricing.legalCta.label}
          </Link>
        </div>
        <CondicionesModal />
      </div>
    </section>
  );
}
