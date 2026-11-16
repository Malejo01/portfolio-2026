"use client";

import { useEffect, useState } from "react";
import { armadoDeUrl, estimarArmado, fmt, lineaDePagos, lineaDeSena, type EstimadoArmado } from "@/lib/agencia/pricing";

/**
 * Resumen de lo elegido en `/demo` (tanda P1, §4.5; tanda P2): lo elegido,
 * el pago único publicado, la línea de pagos, lo mensual y **la seña que
 * corresponde** (escalonada, `senaPara()`). Lee `?a=` (lo que manda
 * `/soluciones`) o `?plan=`/`?extras=` en el cliente, así la ruta sigue
 * estática. Sin nada reconocible en la URL no muestra nada.
 */
export function DemoResumen({
  copy,
}: {
  copy: { label: string; unico: string; desde: string; monthlySuffix: string };
}) {
  const [e, setE] = useState<EstimadoArmado | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const armado = armadoDeUrl(location.search);
      if (!armado.items.length && !armado.extras.length) return;
      const r = estimarArmado(armado);
      if (r.cotizacion.items.length) setE(r);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!e) return null;
  const c = e.cotizacion;
  const linea = lineaDePagos(e.pagos?.total);

  return (
    <div className="card hi mt-6 flex max-w-[44em] flex-col gap-1 p-5">
      <span className="lbl lbl-o">{copy.label}</span>
      <strong className="text-[17px] leading-snug">{c.items.map((i) => i.nombre).join(" + ")}</strong>
      {c.implementacion ? (
        <p className="m-0 text-[15px]">
          {copy.unico}: <strong>{`${c.desde ? `${copy.desde} ` : ""}${fmt(c.implementacion)}`}</strong>
        </p>
      ) : null}
      {linea ? <p className="m-0 text-[15px] font-semibold text-acc-text">{linea}</p> : null}
      {c.abonoMensual ? (
        <p className="m-0 text-sm">
          + <strong>{fmt(c.abonoMensual)}</strong>
          <span className="text-muted">{copy.monthlySuffix}</span>
        </p>
      ) : null}
      <p className="m-0 text-sm text-muted">{lineaDeSena(e.sena)}</p>
    </div>
  );
}
