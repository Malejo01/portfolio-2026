"use client";

import { useEffect, useState } from "react";
import type { DemoCopy } from "@/content/agencia/demo";
import { linkDeSena, waLink } from "@/lib/agencia/config";
import { armadoDeUrl, fmt, montoPlanEscrito, senaMinima, senaPara, type Sena } from "@/lib/agencia/pricing";

/**
 * Lo que cambia en `/demo` según lo elegido (tanda P2, D4). Lee `?a=` o
 * `?plan=` en el cliente (la ruta sigue estática) y calcula la seña con
 * `senaPara()`:
 *
 * - `DemoModo`: el encabezado. Si corresponde el plan por escrito, en lugar
 *   de "Pedí tu demo" va "Primero el plan por escrito", con la charla gratis.
 *   Los dos encabezados llegan armados del servidor; acá solo se elige.
 * - `DemoSena`: el paso 2. Sin nada elegido, "Seña desde $25.000" y la
 *   tabla (llega como `children`). Con algo elegido, el monto que
 *   corresponde y su link de pago (`linkDeSena`); si ese link no está
 *   cargado, el alias de transferencia y WhatsApp, nunca un botón roto.
 */
function useSenaDeUrl(): Sena | null {
  const [sena, setSena] = useState<Sena | null>(null);
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const a = armadoDeUrl(location.search);
      if (a.items.length || a.extras.length) setSena(senaPara(a));
    });
    return () => cancelAnimationFrame(raf);
  }, []);
  return sena;
}

export function DemoModo({ demo, planEscrito }: { demo: React.ReactNode; planEscrito: React.ReactNode }) {
  const sena = useSenaDeUrl();
  return <>{sena?.tipo === "plan-escrito" ? planEscrito : demo}</>;
}

export function DemoSena({ copy, alias, children }: { copy: DemoCopy["sena"]; alias: string; children: React.ReactNode }) {
  const sena = useSenaDeUrl();
  const href = sena ? linkDeSena(sena) : "";
  const title =
    !sena ? copy.desde.replace("{SENA}", fmt(senaMinima()))
    : sena.tipo === "sin-cargo" ? copy.sinCargo
    : sena.tipo === "plan-escrito" ? copy.planEscrito.replace("{SENA}", fmt(montoPlanEscrito()))
    : copy.title.replace("{SENA}", fmt(sena.monto));
  const body = !sena ? copy.bodyDesde : sena.tipo === "sin-cargo" ? copy.sinCargoBody : sena.tipo === "plan-escrito" ? copy.planEscritoBody : copy.body;
  const waTexto = sena?.tipo === "plan-escrito" ? copy.whatsappPlanText : sena?.tipo === "sin-cargo" ? copy.whatsappSinCargoText : copy.whatsappText;

  return (
    <>
      <h2 className="h text-xl" aria-live="polite">
        {title}
      </h2>
      <p className="m-0 text-sm leading-relaxed text-muted">{body}</p>
      {href && sena && sena.tipo !== "sin-cargo" ? (
        <a href={href} target="_blank" rel="noopener" className="btn btn-p">
          {sena.tipo === "plan-escrito" ? copy.payPlan : copy.pay} · {fmt(sena.monto)}
        </a>
      ) : (
        <>
          {alias && sena?.tipo !== "sin-cargo" ? (
            <div className="rounded-[14px] border border-border bg-surf-2 p-4">
              <span className="lbl text-[10px]">{copy.alias}</span>
              <div className="mt-1 font-mono text-lg font-semibold">{alias}</div>
            </div>
          ) : null}
          <a href={waLink(waTexto)} target="_blank" rel="noopener" className="btn btn-s">
            {sena?.tipo === "sin-cargo" ? copy.whatsappSinCargo : copy.whatsapp}
          </a>
        </>
      )}
      {sena && sena.tipo !== "sin-cargo" ? null : children}
    </>
  );
}
