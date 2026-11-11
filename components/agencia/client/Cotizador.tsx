"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/agencia/icons";
import type { cotizadorCopy } from "@/content/agencia/cotizador";
import type { Category, Extra } from "@/content/agencia/pricing";
import { waLink } from "@/lib/agencia/config";
import {
  cotizar,
  fmt,
  fmtUsd,
  lineaDeTarjeta,
  lineaTopeTres,
  montoDeExtra,
  precioDePlan,
  resumenCotizacion,
  totalConTarjeta,
  type Medio,
} from "@/lib/agencia/pricing";
import { MedioSwitch } from "./MedioSwitch";

/**
 * `/cotizador`: elegís planes y extras, el medio de pago, y el total sale de
 * `cotizar()` —la misma función que usan `/precios`, las soluciones y el
 * agente—. Termina en "Pedí tu demo" (con la selección en la URL) o en
 * WhatsApp con el resumen precargado.
 *
 * Tanda R2 (auditoría P2-1): arranca con "¿Qué necesitás?" y abre solo esa
 * categoría; las demás quedan en `<details>` cerradas (antes eran 30
 * tarjetas a la vista, 7,3 pantallas en celular). `?cat=` abre una al
 * entrar. En celular, mientras haya algo elegido, el total queda fijo abajo.
 */
export function Cotizador({
  categories,
  extras,
  copy,
  medioCopy,
  necesidades,
}: {
  categories: Category[];
  extras: Extra[];
  copy: typeof cotizadorCopy;
  medioCopy: { medioLabel: string; transferencia: string; mp: string; mpChip: string };
  /** El problema de cada categoría (`servicios.ts`), para las chips de "¿Qué necesitás?". */
  necesidades: Partial<Record<Category["key"], string>>;
}) {
  const [abiertas, setAbiertas] = useState<Set<string>>(new Set());
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const cat = new URLSearchParams(location.search).get("cat");
      if (cat && categories.some((c) => c.key === cat)) setAbiertas(new Set([cat]));
    });
    return () => cancelAnimationFrame(raf);
  }, [categories]);
  const elegir = (key: string) => {
    setAbiertas((prev) => new Set([...prev, key]));
    requestAnimationFrame(() => document.getElementById(`cot-${key}`)?.scrollIntoView({ block: "start" }));
  };
  const [planIds, setPlanIds] = useState<string[]>([]);
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const [medio, setMedio] = useState<Medio>("transferencia");

  // Tipo de cambio del día: se pide al montar, así la página sigue estática.
  // Si falla, el cotizador sigue en pesos y no muestra la línea en dólares.
  const [tipoDeCambio, setTipoDeCambio] = useState<number>();
  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/dolar", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { valor?: number } | null) => d?.valor && d.valor > 0 && setTipoDeCambio(d.valor))
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  const c = useMemo(() => cotizar({ planIds, extras: extraIds, medio, tipoDeCambio }), [planIds, extraIds, medio, tipoDeCambio]);
  /** "2 × $208.500"; si el último pago absorbe una diferencia, se muestran los montos. */
  const pagosValor = (lista: number[]) =>
    lista.every((x) => x === lista[0])
      ? copy.pagosValor.replace("{N}", String(lista.length)).replace("{MONTO}", fmt(lista[0]))
      : lista.map(fmt).join(" + ");
  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const demoHref = `/demo?plan=${encodeURIComponent(c.items.filter((i) => i.tipo !== "extra").map((i) => i.id).join(","))}${
    extraIds.length ? `&extras=${encodeURIComponent(extraIds.join(","))}` : ""
  }`;
  const wa = waLink(`${copy.whatsappIntro}\n${resumenCotizacion(c)}`);

  return (
    <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="flex flex-col gap-6">
        <MedioSwitch value={medio} onChange={setMedio} label={medioCopy.medioLabel} transferencia={medioCopy.transferencia} mp={medioCopy.mp} mpChip={medioCopy.mpChip} className="self-start" />

        <div className="card p-5">
          <h2 className="h text-[22px]">{copy.pregunta}</h2>
          <p className="m-0 mt-1 text-sm text-muted">{copy.preguntaHint}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((cat) => {
              const on = abiertas.has(cat.key);
              return (
                <button
                  key={cat.key}
                  type="button"
                  aria-pressed={on}
                  aria-controls={`cot-${cat.key}`}
                  onClick={() => elegir(cat.key)}
                  className={`chip h-11 ${on ? "border-hi-t bg-ic-bg text-acc-text" : ""}`}
                >
                  {necesidades[cat.key] ?? cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {categories.map((cat) => {
          const n = cat.plans.filter((p) => planIds.includes(p.id)).length;
          return (
          <details
            key={cat.key}
            id={`cot-${cat.key}`}
            open={abiertas.has(cat.key)}
            onToggle={(e) => {
              const abierta = (e.currentTarget as HTMLDetailsElement).open;
              setAbiertas((prev) => {
                if (prev.has(cat.key) === abierta) return prev;
                const next = new Set(prev);
                if (abierta) next.add(cat.key);
                else next.delete(cat.key);
                return next;
              });
            }}
            className="plans scroll-mt-[104px] border-t border-border pt-4"
          >
            <summary className="flex min-h-11 items-center justify-between gap-3">
              <span className="h text-[20px] sm:text-[22px]">{cat.label}</span>
              <span className="flex items-center gap-2 text-sm text-muted">
                {n ? <span className="tag">{copy.elegidos.replace("{N}", String(n))}</span> : null}
                <Icon name="arrow" size={16} className="plans-arrow" />
              </span>
            </summary>
          <fieldset className="m-0 mt-3 border-0 p-0">
            <legend className="sr-only">{cat.label}</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {cat.plans.map((plan) => {
                const on = planIds.includes(plan.id);
                const p = precioDePlan(plan, medio);
                return (
                  <button
                    key={plan.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setPlanIds((l) => toggle(l, plan.id))}
                    className={`card lift flex flex-col gap-2 p-[18px] text-left ${on ? "hi" : ""}`}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="h text-[17px]">{plan.name}</span>
                      <span
                        aria-hidden="true"
                        className={`inline-flex h-6 w-6 flex-none items-center justify-center rounded-lg border ${
                          on ? "border-acc bg-acc text-acc-ink" : "border-border-2"
                        }`}
                      >
                        {on ? <Icon name="check" size={14} /> : null}
                      </span>
                    </span>
                    <span className="text-sm text-muted">
                      {p.tipo === "desde" ? `${p.etiqueta} ` : ""}
                      <strong className="text-text">{p.precio == null ? p.texto : fmt(p.precio)}</strong> {p.unidad}
                      {p.abono ? ` + ${fmt(p.abono)}/mes` : ""}
                    </span>
                    {plan.time ? <span className="tag self-start">⏱ {plan.time}</span> : null}
                  </button>
                );
              })}
            </div>
          </fieldset>
          </details>
          );
        })}

        <fieldset className="m-0 border-0 border-t border-border p-0 pt-4">
          <legend className="h mb-3 text-[22px]">{copy.extrasLabel}</legend>
          <div className="flex flex-wrap gap-2">
            {extras.map((e) => {
              const on = extraIds.includes(e.id);
              return (
                <button
                  key={e.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setExtraIds((l) => toggle(l, e.id))}
                  className={`chip h-11 ${on ? "border-hi-t bg-ic-bg text-acc-text" : ""}`}
                >
                  {e.name} <strong>{montoDeExtra(e, medio)}</strong>
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      {c.items.length ? (
        <div className="card hi fixed inset-x-2 bottom-2 z-50 flex items-center justify-between gap-3 rounded-[18px] py-2.5 pl-4 pr-20 lg:hidden">
          <div className="min-w-0">
            <span className="lbl block text-[10px]">{copy.total}</span>
            <strong className="h text-[22px]">{fmt(c.total)}</strong>
          </div>
          <a href="#cotizacion" className="btn btn-s btn-sm min-h-11 flex-none">
            {copy.verResumen}
          </a>
        </div>
      ) : null}

      <aside id="cotizacion" aria-labelledby="cotizacion-titulo" className="card hi flex scroll-mt-[104px] flex-col gap-4 p-6 mb-20 lg:mb-0 lg:sticky lg:top-[104px]">
        <div className="flex items-center justify-between">
          <span id="cotizacion-titulo" className="lbl lbl-o">
            {copy.summaryLabel}
          </span>
          {c.items.length ? (
            <button
              type="button"
              className="lbl rounded-md px-1 hover:text-text"
              onClick={() => {
                setPlanIds([]);
                setExtraIds([]);
              }}
            >
              {copy.clear}
            </button>
          ) : null}
        </div>

        <div aria-live="polite" className="flex flex-col gap-4">
          {c.items.length === 0 ? (
            <p className="m-0 text-sm text-muted">{copy.empty}</p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-sm">
              {c.items.map((i) => (
                <li key={i.id} className="flex items-start justify-between gap-3">
                  <span>
                    {i.nombre}
                    {c.combosAplicados.includes(i.id) ? (
                      <span className="ml-1.5 rounded-md bg-save-bg px-1.5 py-0.5 font-mono text-[10px] uppercase text-ok-text">{copy.comboApplied}</span>
                    ) : null}
                  </span>
                  <span className="flex-none text-right text-muted">
                    {i.implementacion ? <strong className="text-text">{`${i.desde ? "desde " : ""}${fmt(i.implementacion)}`}</strong> : null}
                    {i.mensual ? <span className="block">+ {fmt(i.mensual)}/mes</span> : null}
                    {i.anual ? <span className="block">{fmt(i.anual)}/año</span> : null}
                    {i.aCotizar ? <span className="block">{i.aCotizar}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <dl className="m-0 flex flex-col gap-1.5 border-t border-border pt-4 text-sm">
            <Row label={copy.implementacion} value={`${c.desde ? "desde " : ""}${fmt(c.implementacion)}`} />
            <Row label={copy.abono} value={`${fmt(c.abonoMensual)}/mes`} />
            {c.anual ? <Row label={copy.anual} value={`${fmt(c.anual)}/año`} /> : null}
          </dl>
          {/* §4.4: el pago único en 2 o 3 pagos (por transferencia) y con tarjeta. */}
          {c.pagos ? (
            <dl aria-label={copy.pagosLabel} className="m-0 flex flex-col gap-1.5 rounded-[14px] bg-surf-2 p-3 text-sm">
              <Row label={copy.dosPagos} value={pagosValor(c.pagos.dos)} />
              {c.pagos.tres ? <Row label={copy.tresPagos} value={pagosValor(c.pagos.tres)} /> : null}
              {c.pagos.tres ? null : <p className="m-0 text-xs text-muted">{lineaTopeTres()}</p>}
              <p className="m-0 text-xs text-muted">
                {totalConTarjeta(c.pagos)} · {lineaDeTarjeta(c.pagos)}
              </p>
            </dl>
          ) : null}
          <div>
            <span className="lbl text-[10px]">{copy.total}</span>
            <div className="h text-[34px]">{fmt(c.total)}</div>
            {c.usd && c.total ? <p className="m-0 text-sm text-muted">{copy.usd.replace("{USD}", fmtUsd(c.usd.total))}</p> : null}
            <p className="m-0 text-xs text-muted">{c.desde ? copy.desdeHint : copy.totalHint}</p>
            {c.aCotizar.length ? <p className="m-0 text-xs text-muted">{copy.aCotizarHint}</p> : null}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <Link href={demoHref} className={`btn btn-p ${c.items.length ? "" : "pointer-events-none opacity-50"}`} aria-disabled={!c.items.length}>
            {copy.demo}
          </Link>
          <a href={wa} target="_blank" rel="noopener" className={`btn btn-s ${c.items.length ? "" : "pointer-events-none opacity-50"}`} aria-disabled={!c.items.length}>
            {copy.whatsapp}
          </a>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="m-0 font-semibold">{value}</dd>
    </div>
  );
}
