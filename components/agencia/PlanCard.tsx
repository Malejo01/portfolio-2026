import Link from "next/link";
import { home } from "@/content/agencia/home";
import { pagosCopy, type Combo, type Plan } from "@/content/agencia/pricing";
import { solucionDeCombo } from "@/content/agencia/servicios";
import { solucionesCopy } from "@/content/agencia/soluciones";
import { ahorro, ahorroEnPesos, fmt, lineaDePagos, lineaDePlan, mensualDeAnual, precioDePlan } from "@/lib/agencia/pricing";
import { AgregarBoton } from "./client/AgregarBoton";
import { PlanDialog } from "./client/PlanDialog";
import { Check } from "./icons";
import { estiloCopy } from "@/content/agencia/estilos";
import { Garabato } from "./client/Garabato";
import { EtiquetaPrecio } from "./EtiquetaPrecio";
import { OVALO } from "./home/garabatos";
import { ComboDetalle, PlanDetalle } from "./PlanDetalle";

/**
 * Tarjetas del catálogo (DISENO.md §4 Precios; tanda P1, §1 y §5 de
 * `docs/agencia/precios-psicologia-2026-11-10.md`). Server Components: las
 * usan `/precios` (paneles que arma el servidor) y `/servicios/[slug]`.
 * Todo precio pasa por `lib/agencia/pricing.ts` y siempre por
 * transferencia: el medio de pago se elige en el cotizador y en el modal.
 *
 * "La tarjeta dice para qué sirve, el modal dice qué trae" (§1.6): nombre,
 * para quién, plazo, total, la línea de pagos, el monto por mes y hasta 3
 * viñetas (`destacados`). El detalle completo va en `PlanDialog`.
 *
 * Sin JS, "Ver qué incluye" lleva a `/servicios/<cat>#<id>`. En la página de
 * la solución (`enPagina`) el detalle está ahí mismo, en un `<details>`
 * (`.nojs-only`), y el enlace se esconde.
 *
 * `modo="armado"` (tanda P2, `/soluciones`): el botón principal pasa a ser
 * "Agregar al armado" (la isla `AgregarBoton`, que alterna a "✓ Agregado ·
 * Quitar") y el modal suma el mismo botón. Sin JS, en su lugar va "Pedí tu
 * demo" (`.nojs-only`).
 */

const { pricing } = home;
const s = solucionesCopy;
const LABELS = { agregar: s.agregar, agregado: s.agregado, quitar: s.quitar, quitarAria: s.carrito.quitarAria };

export type ModoTarjeta = "catalogo" | "armado";

/** "Agregar al armado" con su respaldo sin JS: "Pedí tu demo" con el plan. */
export function AgregarConRespaldo({ id, nombre, destacado = false, tipo = "item" }: { id: string; nombre: string; destacado?: boolean; tipo?: "item" | "extra" }) {
  return (
    <>
      <AgregarBoton id={id} nombre={nombre} labels={LABELS} destacado={destacado} tipo={tipo} />
      {tipo === "item" ? (
        <Link href={`/demo?plan=${id}`} className={`nojs-only btn btn-sm min-h-11 w-full ${destacado ? "btn-p" : "btn-s"}`} aria-label={`${s.sinJsDemo}: ${nombre}`}>
          {s.sinJsDemo}
        </Link>
      ) : null}
    </>
  );
}

/** El `<details>` sin JS de `/servicios/<cat>`: el destino de `#<id>`. */
function DetalleSinJs({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <details className="nojs-only plans">
      <summary className="lnk min-h-11">{label}</summary>
      <div id={id} className="mt-3 flex scroll-mt-[104px] flex-col gap-4">
        {children}
      </div>
    </details>
  );
}

/** "Ver qué incluye": el modal y, en la página de la solución, su respaldo sin JS. */
function VerPlan({ plan, enPagina, modo = "catalogo" }: { plan: Plan; enPagina: boolean; modo?: ModoTarjeta }) {
  const href = `/servicios/${plan.category}#${plan.id}`;
  return (
    <>
      <span className={enPagina ? "js-only contents" : "contents"}>
        <PlanDialog
          label={pricing.verIncluye}
          title={plan.name}
          href={href}
          closeLabel={pricing.modal.cerrar}
          triggerAriaLabel={`${pricing.verIncluye}: ${plan.name}`}
          triggerClassName="lnk min-h-11 self-center"
        >
          <PlanDetalle plan={plan} />
          {modo === "armado" ? <AgregarBoton id={plan.id} nombre={plan.name} labels={LABELS} destacado /> : null}
        </PlanDialog>
      </span>
      {enPagina ? (
        <DetalleSinJs id={plan.id} label={pricing.verIncluye}>
          <PlanDetalle plan={plan} />
        </DetalleSinJs>
      ) : null}
    </>
  );
}

/** El precio grande: "Pago único $249.000", "Por mes $25.000" o "$7.500 por mes, pagás el año junto". */
function Precio({ plan }: { plan: Plan }) {
  const p = precioDePlan(plan, "transferencia");
  const porMes = mensualDeAnual(plan);
  if (porMes != null) {
    return (
      <div>
        <span className="lbl text-[10px]">{p.etiqueta}</span>
        <div className="flex flex-wrap items-baseline gap-1.5">
          <EtiquetaPrecio tamano="grande">
            <span className="h text-[34px] tracking-[-.02em]">{fmt(porMes)}</span>
          </EtiquetaPrecio>
          <span className="text-sm text-muted">{pagosCopy.anualUnidad}</span>
        </div>
      </div>
    );
  }
  const linea = lineaDePlan(plan);
  return (
    <div>
      <span className="lbl text-[10px]">{p.etiqueta}</span>
      <div className="flex flex-wrap items-baseline gap-1.5">
        {p.precio == null ? (
          <span className="text-sm text-muted">{p.texto}</span>
        ) : (
          <EtiquetaPrecio tamano="grande">
            <span className="h text-[34px] tracking-[-.02em]">{fmt(p.precio)}</span>
          </EtiquetaPrecio>
        )}
        {p.unidad ? <span className="text-sm text-muted">{p.unidad}</span> : null}
      </div>
      {/* La línea de pagos va en naranja de texto: no es la acción principal (§2). */}
      {linea ? <p className="m-0 text-sm font-semibold text-acc-text">{linea}</p> : null}
      {p.abono ? (
        <p className="m-0 text-sm">
          + <strong>{fmt(p.abono)}</strong>
          <span className="text-muted">{pricing.monthlySuffix}</span>
        </p>
      ) : null}
    </div>
  );
}

export function PlanCard({
  plan,
  heading = "h3",
  enPagina = false,
  modo = "catalogo",
}: {
  plan: Plan;
  heading?: "h2" | "h3";
  enPagina?: boolean;
  modo?: ModoTarjeta;
}) {
  const H = heading;

  return (
    <article className={`card lift relative flex flex-col gap-4 p-[26px] ${plan.rec ? "hi" : ""}`}>
      {plan.rec ? (
        <span className="sello-rec absolute -top-3 left-6 rounded-full bg-acc px-2.5 py-1.5 font-mono text-[11px] font-semibold uppercase leading-none tracking-[.08em] text-acc-ink">
          {pricing.recommended}
        </span>
      ) : null}
      {plan.rec ? (
        // Tanda P3-3: en Tienda, "El más pedido" como sticker tomate rotado.
        <span data-solo-estilo="tienda" className="sticker absolute -top-3.5 right-5 px-3 py-1.5 text-[14px] font-bold leading-none">
          {estiloCopy.tienda.masPedido}
        </span>
      ) : null}
      {plan.rec ? (
        // Tanda P3-2: en Aula virtual el sello es "¡recomendado!" en un óvalo de tiza.
        <span data-solo-estilo="aula" className="garabato absolute -top-6 left-1/2 flex h-11 w-[180px] -translate-x-1/2 items-center justify-center text-tono-2">
          <span className="relative z-10 font-titulo text-[24px] font-bold leading-none">{estiloCopy.aula.garabatos.recomendado}</span>
          <Garabato trazos={[OVALO]} viewBox="0 0 180 44" ancho={2.5} className="absolute inset-0" />
        </span>
      ) : null}
      <div className="flex flex-col gap-1.5">
        {/* P2.1: el plazo nunca sale de la tarjeta; si no entra al lado del nombre, baja. */}
        <div className="flex flex-wrap items-start justify-between gap-x-2.5 gap-y-1.5">
          <H className="h min-w-0 text-xl">{plan.name}</H>
          {plan.time ? <span className="tag max-w-full flex-none whitespace-normal">⏱ {plan.time}</span> : null}
        </div>
        {plan.enUnaLinea ? <p className="m-0 line-clamp-2 text-[13px] leading-[1.45] text-muted">{plan.enUnaLinea}</p> : null}
      </div>
      <Precio plan={plan} />
      <ul className="m-0 flex list-none flex-col gap-[9px] p-0 text-sm">
        {plan.destacados.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <Check />
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-col gap-1">
        {modo === "armado" ? (
          <AgregarConRespaldo id={plan.id} nombre={plan.name} destacado={plan.rec} />
        ) : (
          <Link
            href={`/demo?plan=${plan.id}`}
            className={`btn btn-sm min-h-11 w-full ${plan.rec ? "btn-p" : "btn-s"}`}
            aria-label={`${pricing.planCta}: ${plan.name}`}
          >
            {pricing.planCta}
          </Link>
        )}
        <VerPlan plan={plan} enPagina={enPagina} modo={modo} />
      </div>
    </article>
  );
}

/** Una fila de "Ver otras opciones" (§4.2.4): nombre, total, pagos y "Ver qué incluye". */
export function PlanFila({ plan, enPagina = false, modo = "catalogo" }: { plan: Plan; enPagina?: boolean; modo?: ModoTarjeta }) {
  const p = precioDePlan(plan, "transferencia");
  const linea = lineaDePlan(plan);
  return (
    <li className="flex flex-col gap-1 border-b border-border py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex min-w-0 flex-col">
        <strong className="text-[15px] leading-snug">{plan.name}</strong>
        <span className="text-[14px] text-muted">
          {p.tipo === "desde" || p.tipo === "mensual" ? `${p.etiqueta} ` : ""}
          <strong className="text-text">{p.precio == null ? p.texto : fmt(p.precio)}</strong>
          {p.unidad && p.precio != null ? ` ${p.unidad}` : ""}
          {linea ? <span className="text-acc-text"> · {linea}</span> : null}
        </span>
      </div>
      <div className={`flex-none ${modo === "armado" ? "flex flex-col gap-1 sm:w-[220px]" : ""}`}>
        {modo === "armado" ? <AgregarConRespaldo id={plan.id} nombre={plan.name} /> : null}
        <VerPlan plan={plan} enPagina={enPagina} modo={modo} />
      </div>
    </li>
  );
}

export function ComboCard({
  combo,
  highlight,
  enPagina = false,
  modo = "catalogo",
}: {
  combo: Combo;
  highlight?: boolean;
  enPagina?: boolean;
  modo?: ModoTarjeta;
}) {
  const linea = lineaDePagos(combo.price);
  const pagina = solucionDeCombo(combo.id);
  return (
    <article className={`card lift relative flex h-full flex-col gap-2.5 p-[22px] ${highlight ? "hi" : ""}`}>
      <h3 className="h m-0 text-[19px]">{combo.name}</h3>
      {combo.paraQuien ? <p className="m-0 text-[13px] leading-[1.45] text-muted">{combo.paraQuien}</p> : null}
      <div className="mt-auto">
        <div className="text-[13px] text-muted">
          {pricing.porSeparado} <span className="line-through">{fmt(combo.list)}</span>
        </div>
        <div className="h text-[28px]">{fmt(combo.price)}</div>
        <p className="m-0 text-[14px] font-semibold text-ok-text">
          {pricing.saveLabel} {fmt(ahorroEnPesos(combo))} <span className="text-[12px] font-normal">({ahorro(combo)}%)</span>
        </p>
        {linea ? <p className="m-0 text-sm font-semibold text-acc-text">{linea}</p> : null}
        {combo.monthly ? (
          <p className="m-0 text-[13px]">
            + <strong>{fmt(combo.monthly)}</strong>
            <span className="text-muted">{pricing.monthlySuffix}</span>
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        {modo === "armado" ? (
          <AgregarConRespaldo id={combo.id} nombre={`Combo ${combo.name}`} />
        ) : (
          <Link href={`/demo?plan=${combo.id}`} className="btn btn-s btn-sm min-h-11 w-full" aria-label={`${pricing.comboCta}: ${combo.name}`}>
            {pricing.comboCta}
          </Link>
        )}
        <span className={enPagina ? "js-only contents" : "contents"}>
          <PlanDialog
            label={pricing.verTrae}
            title={combo.name}
            href={`/servicios/${pagina ?? "webs"}#${combo.id}`}
            closeLabel={pricing.modal.cerrar}
            triggerAriaLabel={`${pricing.verTrae}: ${combo.name}`}
            triggerClassName="lnk min-h-11 self-center"
          >
            <ComboDetalle combo={combo} />
            {modo === "armado" ? <AgregarBoton id={combo.id} nombre={`Combo ${combo.name}`} labels={LABELS} destacado /> : null}
          </PlanDialog>
        </span>
        {enPagina ? (
          <DetalleSinJs id={combo.id} label={pricing.verTrae}>
            <ComboDetalle combo={combo} />
          </DetalleSinJs>
        ) : null}
      </div>
    </article>
  );
}

/**
 * Pestaña "Proyectos grandes": los pasos (consultoría → diagnóstico →
 * sprint) en tarjetas numeradas, la línea de mantenimiento y el CTA de la
 * consultoría. Misma forma que `PlanCard` (DISENO.md §4): `card lift`, el
 * paso recomendado en `.hi`. No ofrecen 3 pagos: se paga por etapa.
 */
export function GrandesSteps({ plans }: { plans: Plan[] }) {
  const copy = pricing.grandes;
  const pasos = plans.filter((p) => p.mantenimientoPct == null);
  const external = /^https?:/.test(copy.cta.href);
  return (
    <>
      <ol className="m-0 mt-[22px] grid list-none grid-cols-1 items-stretch gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {pasos.map((plan, i) => {
          const p = precioDePlan(plan, "transferencia");
          return (
            <li key={plan.id} className={`card lift relative flex flex-col gap-4 p-[26px] ${plan.rec ? "hi" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-x-2.5 gap-y-1.5">
                <div className="min-w-0">
                  <span className="lbl lbl-o text-[10px]">
                    {copy.stepLabel} {i + 1}
                  </span>
                  <h3 className="h mt-1 text-xl">{plan.name}</h3>
                </div>
                {plan.time ? <span className="tag max-w-full flex-none whitespace-normal">⏱ {plan.time}</span> : null}
              </div>
              <div>
                {p.precio == null ? (
                  <>
                    <span className="h block text-[34px] tracking-[-.02em]">{p.etiqueta}</span>
                    <span className="text-sm text-muted">{p.texto}</span>
                  </>
                ) : p.precio === 0 ? (
                  <span className="h text-[34px] tracking-[-.02em]">{copy.free}</span>
                ) : (
                  <div className="flex flex-wrap items-baseline gap-1.5">
                    <EtiquetaPrecio tamano="grande">
            <span className="h text-[34px] tracking-[-.02em]">{fmt(p.precio)}</span>
          </EtiquetaPrecio>
                    {p.unidad ? <span className="text-sm text-muted">{p.unidad}</span> : null}
                  </div>
                )}
              </div>
              <ul className="m-0 flex list-none flex-col gap-[9px] p-0 text-sm">
                {plan.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check />
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="m-0 text-[15px] text-muted">{copy.maintenance}</p>
        <a href={copy.cta.href} {...(external ? { target: "_blank", rel: "noopener" } : {})} className="btn btn-p btn-sm min-h-11 flex-none">
          {copy.cta.label}
        </a>
      </div>
    </>
  );
}

/**
 * "Proyectos a medida" en el armador (P2.1, punto 2): los 3 pasos como una
 * **línea de tiempo vertical** en la columna central. Cada paso es una
 * tarjeta a lo ancho con dos zonas (paso, título, plazo y lista a la
 * izquierda; el precio arriba a la derecha) que se apilan cuando la columna
 * mide menos de 640 px (container query). Las une una línea con el número en
 * un círculo. El precio usa como mucho el tamaño de `h2` y no parte renglón;
 * el plazo va en la fila de "PASO N" y, si no entra, baja.
 */
export function GrandesLinea({ plans }: { plans: Plan[] }) {
  const copy = pricing.grandes;
  const pasos = plans.filter((p) => p.mantenimientoPct == null);
  const external = /^https?:/.test(copy.cta.href);
  return (
    <>
      <ol className="m-0 mt-[22px] flex list-none flex-col gap-4 p-0">
        {pasos.map((plan, i) => {
          const p = precioDePlan(plan, "transferencia");
          const ultimo = i === pasos.length - 1;
          return (
            <li key={plan.id} className="relative flex gap-3 sm:gap-4">
              {/* El número y la línea que une los pasos. */}
              <div aria-hidden="true" className="relative flex w-9 flex-none flex-col items-center">
                <span className="z-10 mt-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-hi-b bg-ic-bg font-mono text-sm font-semibold text-acc-text">
                  {i + 1}
                </span>
                {ultimo ? null : <span className="absolute bottom-[-16px] top-14 w-px bg-border-2" />}
              </div>
              <div className={`card @container min-w-0 flex-1 p-5 sm:p-6 ${plan.rec ? "hi" : ""}`}>
                <div className="flex flex-col gap-4 @min-[640px]:flex-row @min-[640px]:items-start @min-[640px]:justify-between @min-[640px]:gap-8">
                  <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                      <span className="lbl lbl-o text-[10px]">
                        {copy.stepLabel} {i + 1}
                      </span>
                      {plan.time ? <span className="tag max-w-full whitespace-normal">⏱ {plan.time}</span> : null}
                    </div>
                    <h3 className="h text-xl leading-tight sm:text-[22px]">{plan.name}</h3>
                    <ul className="m-0 flex list-none flex-col gap-[9px] p-0 text-sm">
                      {plan.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <Check />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-none @min-[640px]:text-right">
                    {p.precio == null ? (
                      <>
                        <span className="h block whitespace-nowrap text-[26px] tracking-[-.02em] sm:text-[32px]">{p.etiqueta}</span>
                        <span className="block max-w-[16em] text-sm text-muted">{p.texto}</span>
                      </>
                    ) : p.precio === 0 ? (
                      <span className="h block whitespace-nowrap text-[26px] tracking-[-.02em] sm:text-[32px]">{copy.free}</span>
                    ) : (
                      <div className="flex flex-wrap items-baseline gap-1.5 @min-[640px]:justify-end">
                        <span className="h whitespace-nowrap text-[26px] tracking-[-.02em] sm:text-[32px]">{fmt(p.precio)}</span>
                        {p.unidad ? <span className="text-sm text-muted">{p.unidad}</span> : null}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="m-0 text-[15px] text-muted">{copy.maintenance}</p>
        <a href={copy.cta.href} {...(external ? { target: "_blank", rel: "noopener" } : {})} className="btn btn-p btn-sm min-h-11 flex-none">
          {copy.cta.label}
        </a>
      </div>
    </>
  );
}
