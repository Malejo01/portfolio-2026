import Link from "next/link";
import { home } from "@/content/agencia/home";
import { combos, planesDe, type Category, type Plan } from "@/content/agencia/pricing";
import { solucionesCopy as copy } from "@/content/agencia/soluciones";
import { Carrusel } from "../client/Carrusel";
import { ComboCard, GrandesSteps, PlanCard, PlanFila } from "../PlanCard";

const { pricing } = home;

/** La recomendada primero (Fase 6 bis): en el carrusel es la que se ve al entrar. */
function recomendadaPrimero(plans: Plan[]): Plan[] {
  return [...plans].sort((a, b) => Number(b.rec) - Number(a.rec));
}

/**
 * El panel de una categoría en `/soluciones` (tanda P2). Server Component:
 * va dentro del `<details>` de la isla `Armador`, así que **empieza por su
 * `<summary>`** (el título; sin JS, cada categoría se abre a un clic).
 *
 * Los 3 planes `visibles` van en un carrusel en el celular y en grilla
 * desde 760 px, con "Agregar al armado"; "Ver otras opciones (N)" en lista
 * compacta y los combos de la categoría en otro carrusel igual. Proyectos a
 * medida muestra sus pasos: no se agregan al armado.
 */
export function PanelArmado({ category }: { category: Category }) {
  const titulo = (
    <summary className="cat-summary flex min-h-11 items-center justify-between gap-3">
      <h2 className="h text-[22px] sm:text-[26px]">{category.label}</h2>
      <span aria-hidden="true" className="plans-arrow nojs-only text-acc-text">
        ▾
      </span>
    </summary>
  );

  if (category.key === "grandes") {
    return (
      <>
        {titulo}
        <p className="mb-0 mt-2 text-[15px] text-muted">{category.intro}</p>
        <GrandesSteps plans={category.plans} />
        <Link href={`/servicios/${category.key}`} className="lnk mt-3 min-h-11">
          {pricing.masSobre}
        </Link>
      </>
    );
  }

  const { visibles, otras } = planesDe(category);
  const suyos = combos.filter((c) => c.categorias.includes(category.key));
  return (
    <>
      {titulo}
      <p className="mb-0 mt-2 text-[15px] text-muted">{category.intro}</p>
      <div className="mt-[22px]">
        <Carrusel label={category.label} labels={copy.carrusel}>
          {recomendadaPrimero(visibles).map((plan) => (
            <PlanCard key={plan.id} plan={plan} modo="armado" />
          ))}
        </Carrusel>
      </div>
      {otras.length ? (
        <details className="plans mt-5">
          <summary className="btn btn-s min-h-11">{pricing.otras.replace("{N}", String(otras.length))}</summary>
          <ul className="card m-0 mt-3 list-none px-5 py-1">
            {otras.map((plan) => (
              <PlanFila key={plan.id} plan={plan} modo="armado" />
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
          <div className="mt-[18px]">
            <Carrusel label={copy.carrusel.combos} labels={copy.carrusel}>
              {suyos.map((combo) => (
                <ComboCard key={combo.id} combo={combo} modo="armado" />
              ))}
            </Carrusel>
          </div>
        </>
      ) : null}
    </>
  );
}
