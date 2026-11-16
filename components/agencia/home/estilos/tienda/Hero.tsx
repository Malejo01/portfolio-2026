import Link from "next/link";
import { WHATSAPP_TEXTO, home } from "@/content/agencia/home";
import { estiloCopy, getEstilo, selectorCopy } from "@/content/agencia/estilos";
import { waLink } from "@/lib/agencia/config";
import { fmt } from "@/lib/agencia/pricing";
import { personajes } from "@/lib/agencia/sprites";
import { Check, Icon } from "../../../icons";
import { EtiquetaPrecio } from "../../../EtiquetaPrecio";
import { Sprite } from "../../../Sprite";
import { AbrirChat } from "../../../client/AbrirChat";
import { PersonajeCiclo, PersonajeRapido } from "../../../client/EstiloSelector";

/**
 * Hero de Tienda (tanda P3-3, `docs/agencia/estilos/tienda/` F-home-claro,
 * F-home-oscuro, F-home-celular y F-pedido-celular): el almacén de barrio.
 * H1 en Fredoka con la "IA" en una píldora mostaza, los dos botones redondos
 * y, a la derecha (en el celular, debajo de los botones), el ejemplo
 * «Almacén Doña Rosa». El chibi es el dibujo por defecto del estilo.
 */
export function HeroTienda() {
  const { hero } = home;
  const c = estiloCopy.hero;
  const estilo = getEstilo("tienda")!;
  const wa = waLink(WHATSAPP_TEXTO);
  const tonos = ["tono-1", "tono-2", "tono-3"];
  const e = estiloCopy.tienda.ejemplo;

  return (
    <section data-solo-estilo="tienda" className="hero-tienda">
      <div className="wrap grid grid-cols-1 gap-8 pb-10 pt-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center lg:gap-14 lg:pb-16 lg:pt-12">
        <div className="flex min-w-0 flex-col gap-[14px] sm:gap-5">
          <span className="text-[13px] font-bold text-etiqueta sm:text-[14px]">
            <span className="sm:hidden">{c.labelCorto}</span>
            <span className="hidden sm:inline">{c.label}</span>
          </span>
          <h1 className="h text-[40px] leading-[1.05] min-[380px]:text-[42px] sm:text-[62px]">
            {c.antes}
            <span className="ia-pildora">{c.acento}</span>
            {c.despues}
          </h1>
          <p className="m-0 text-[16px] text-muted sm:hidden">{hero.leadCorto}</p>
          <p className="m-0 hidden max-w-[520px] text-[19px] leading-[1.6] text-muted sm:block">{hero.lead}</p>

          <div className="flex items-center gap-3 rounded-[18px] bg-tono-2-bg px-3 py-2.5 lg:hidden">
            <span className="flex h-[76px] w-14 flex-none items-end justify-center overflow-hidden">
              <Sprite alto={72} alt={estiloCopy.alt.normal} saludoAlEntrar />
            </span>
            <span className="flex min-w-0 flex-col text-[14px] leading-snug">
              <strong className="font-bold">{hero.quien.nombre}</strong>
              <span className="text-muted">{hero.quien.rol}</span>
            </span>
            <PersonajeCiclo label={estiloCopy.cambiarPersonaje} texto={estiloCopy.tienda.cambiar} className="ml-auto bg-surf" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <AbrirChat href={wa} className="btn btn-p w-full text-[17px] sm:w-auto">
              {c.primary}
            </AbrirChat>
            <Link href={hero.secondary.href} className="btn btn-s w-full border-2 text-[17px] sm:w-auto">
              {c.secondary}
            </Link>
          </div>

          <ul aria-label={hero.chipsLabel} className="m-0 flex list-none justify-between gap-x-5 gap-y-1 p-0 text-[12px] text-muted sm:flex-wrap sm:justify-start sm:text-[15px]">
            {hero.chips.map((chip, i) => (
              <li key={chip} className={`${tonos[i % 3]} flex items-center gap-1 sm:gap-2`}>
                <span className="tono-texto inline-flex">
                  <Check size={15} />
                </span>
                <span className="sm:hidden">{c.chipsCortos[i]}</span>
                <span className="hidden sm:inline">{chip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex min-w-0 flex-col gap-3">
          <span className="text-[14px] font-bold text-acc-text">
            <span className="hidden lg:inline">{e.etiqueta}</span>
            <span className="lg:hidden">{e.ejemploCelular}</span>
          </span>
          <div className="relative">
            <Almacen />
            <span className="pointer-events-none absolute -bottom-10 -right-5 hidden lg:block">
              <Sprite alto={110} alt={estiloCopy.alt.normal} saludoAlEntrar />
            </span>
          </div>
          <Link href={`/soluciones?cat=${estilo.categoria}`} className="lnk self-start underline underline-offset-4">
            {e.link}
          </Link>
          <PersonajeRapido copy={selectorCopy} personajes={personajes()} className="personaje-rapido hidden lg:flex" />
        </div>
      </div>
    </section>
  );
}

/**
 * «Almacén Doña Rosa»: una ilustración, no una tienda de verdad. Todo va
 * `aria-hidden` (sin nada tabulable: no hay botones, solo `span`) y el
 * lector anuncia solo el texto alternativo. Los precios salen de `fmt()` y
 * el total y la cantidad se calculan con los mismos números.
 */
function Almacen() {
  const e = estiloCopy.tienda.ejemplo;
  const total = e.productos.reduce((s, p) => s + p.precio * p.cantidad, 0);
  const cantidad = e.productos.reduce((s, p) => s + p.cantidad, 0);
  return (
    <div role="img" aria-label={e.alt} className="ejemplo-almacen card p-4 sm:p-[18px]">
      <div aria-hidden="true">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <span className="flex flex-col">
            <span className="h text-[22px] leading-tight">{e.nombre}</span>
            <span className="text-[12px] text-muted">{e.rubro}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-tono-2-bg px-2.5 py-1 text-[11px] font-bold text-tono-2-texto">
            <span className="h-2 w-2 rounded-full bg-tono-2" />
            {e.abierto}
          </span>
        </div>
        <span className="mt-2.5 inline-flex rounded-full bg-tono-3-bg p-1 text-[12px] font-bold">
          {e.modos.map((m, i) => (
            <span key={m} className={`rounded-full px-3 py-1 ${i === 0 ? "bg-surf text-text" : "text-muted"}`}>
              {m}
            </span>
          ))}
        </span>
        <span className="mt-2.5 flex gap-2 lg:hidden">
          {e.categorias.map((cat, i) => (
            <span key={cat} className={`rounded-full border-2 px-3 py-1 text-[13px] font-bold ${i === 0 ? "border-text bg-text text-bg" : "border-border"}`}>
              {cat}
            </span>
          ))}
        </span>
        <ul className="m-0 mt-1.5 list-none p-0">
          {e.productos.map((p, i) => (
            <li key={p.nombre} className={`tono-${p.tono} flex items-center gap-3 border-b border-dashed border-border py-2.5 last:border-0`}>
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-(--t-bg) text-(--t)">
                <Producto icono={p.icono} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col items-start gap-1">
                <span className="text-[14px] font-bold leading-tight">{p.nombre}</span>
                <span className="text-[12px] text-muted">{p.detalle}</span>
                <EtiquetaPrecio i={i}>{fmt(p.precio)}</EtiquetaPrecio>
              </span>
              {p.cantidad ? (
                <span className="inline-flex items-center gap-2 rounded-full border-2 border-border px-1 py-0.5 text-[14px] font-bold">
                  <span className="px-1.5">−</span>
                  {p.cantidad}
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-acc text-acc-ink">+</span>
                </span>
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-acc text-[16px] font-bold text-acc-ink">+</span>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-2 rounded-2xl bg-tono-2-bg p-3">
          <div className="flex items-center justify-between text-[14px]">
            <span>
              {e.tuPedido} · {cantidad}
            </span>
            <strong className="h text-[17px]">
              {e.total} {fmt(total)}
            </strong>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 text-center text-[13px] font-bold sm:grid-cols-2">
            <span className="rounded-full bg-malejo-btn px-3 py-2 text-malejo-btn-ink">{e.enviar}</span>
            <span className="rounded-full border-2 border-border bg-surf px-3 py-1.5">{e.pagar}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Íconos de producto, de trazo (decorativos). */
function Producto({ icono }: { icono: string }) {
  const comun = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (icono === "frasco")
    return (
      <svg {...comun}>
        <rect x="7" y="7" width="10" height="13" rx="2" />
        <path d="M8 4h8v3H8zM7 11h10" />
      </svg>
    );
  if (icono === "huevos")
    return (
      <svg {...comun}>
        <ellipse cx="8.5" cy="13" rx="4" ry="5" />
        <ellipse cx="16" cy="13" rx="3.5" ry="4.5" />
      </svg>
    );
  if (icono === "pan")
    return (
      <svg {...comun}>
        <path d="M4 15a8 6 0 0116 0v2H4z" />
        <path d="M9 11v3M12 10v4M15 11v3" />
      </svg>
    );
  return <Icon name="box" size={22} />;
}
