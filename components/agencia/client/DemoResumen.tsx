"use client";

import { useEffect, useState } from "react";
import { cotizar, fmt, lineaDePagos, type Cotizacion } from "@/lib/agencia/pricing";

/**
 * Resumen de lo elegido en `/demo` (tanda P1, §4.5): el total, la línea de
 * pagos y "La seña de $X se descuenta del primer pago". Lee `?plan=` (un
 * id, un combo o varios separados por coma, como los arma el cotizador o el
 * chat) y `?extras=` en el cliente, así la ruta sigue estática, y cotiza con
 * `cotizar()`: el mismo total que en el resto del sitio. Sin plan en la URL
 * (o con ids desconocidos) no muestra nada.
 *
 * La seña llega ya escrita desde el servidor (`SENA_MONTO` es de servidor).
 */
export function DemoResumen({
  copy,
  sena,
}: {
  copy: { label: string; unico: string; desde: string; monthlySuffix: string };
  /** "La seña de $20.000 se descuenta del primer pago." */
  sena: string;
}) {
  const [c, setC] = useState<Cotizacion | null>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const q = new URLSearchParams(location.search);
      const lista = (k: string) => (q.get(k) ?? "").split(",").map((x) => x.trim()).filter(Boolean);
      const planIds = lista("plan");
      if (!planIds.length) return;
      const r = cotizar({ planIds, extras: lista("extras") });
      if (r.items.length) setC(r);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!c) return null;
  const linea = lineaDePagos(c.pagos?.total);

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
      <p className="m-0 text-sm text-muted">{sena}</p>
    </div>
  );
}
