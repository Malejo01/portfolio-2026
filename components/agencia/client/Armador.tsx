"use client";

import { track } from "@vercel/analytics";
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SolucionesCopy } from "@/content/agencia/soluciones";
import { getCombo, getPlan } from "@/content/agencia/pricing";
import { abrirChat } from "@/lib/agencia/abrir-chat";
import { ABRIR_CHAT_EVENT } from "@/lib/agencia/abrir-chat";
import { aQuery, armadoVacio, deQuery, emitir, escuchar, firmaArmado, leer, marcarKitEnviado, type Armado } from "@/lib/agencia/armado";
import { leerSesion } from "@/lib/agencia/chat/sesion";
import { agendaLink, waLink } from "@/lib/agencia/config";
import { ahorroEnPesos, clasificarId, estimarArmado, fmt, lineaDePagos, lineaDeSena, type EstimadoArmado } from "@/lib/agencia/pricing";
import { Icon, type IconName } from "../icons";
import { VUELO_EVENT, type VueloDetail } from "./AgregarBoton";
import { Hoja } from "./Hoja";
import { useTurnstile } from "./turnstile";
import { reproducir } from "@/lib/agencia/sprite-anim";
import { Sprite } from "../Sprite";
import { useArmado } from "./useArmado";

/**
 * El armador de `/soluciones` (tanda P2, Fase 4 y Fase 6 bis). La isla
 * maneja **qué categoría se ve y el carrito**; los paneles (tarjetas,
 * carruseles, "Ver otras opciones", combos y modales) los arma el servidor y
 * llegan como `paneles`, así la copy de los planes no entra al bundle.
 *
 * - Escritorio (≥ 1024 px): categorías en una columna fija a la izquierda,
 *   planes al medio y el carrito fijo a la derecha. Entre 760 y 1023 px,
 *   categorías arriba y el carrito a la derecha.
 * - Celular: la grilla de 2 columnas de P1 y, cuando sale de la pantalla,
 *   una fila de chips fija arriba con la categoría activa centrada. El
 *   carrito es una barra fija ("Tu armado · N · desde $X ▴") que abre una
 *   hoja; vacío, la barra no se muestra.
 * - El estado del armado vive en `lib/agencia/armado.ts` (sessionStorage +
 *   `malejo:armado`): los botones "Agregar" y el widget de Malejo lo cambian
 *   desde afuera. Se refleja en `?a=` con `replaceState` para compartirlo;
 *   un `?a=` al entrar reemplaza el armado y avisa "Te compartieron…".
 * - El estimado es un **rango** (`estimarArmado`, D2), nunca un total cerrado.
 *
 * Sin JS: cada panel es un `<details>` (todas las categorías a un clic), el
 * carrito no existe y el servidor muestra WhatsApp y "Contame qué necesitás".
 */
export interface CategoriaArmador {
  key: string;
  label: string;
  /** Etiqueta corta de la grilla del celular ("Web", "Agenda"). */
  short: string;
  icon: IconName;
}

type Vista = "carrito" | "form" | "exito";
type Pestana = "kit" | "malejo";

/** Donde el widget de Malejo monta el chat en la columna (`MalejoWidget`, `useHostPanel`). */
const MALEJO_PANEL_ID = "malejo-panel";

const plural = (n: number) => String(n);

/** La categoría donde cuenta un ítem (un combo cuenta en la primera de las suyas). */
function categoriaDe(id: string): string | undefined {
  return getPlan(id)?.category ?? getCombo(id)?.categorias[0];
}

export function Armador({
  categorias,
  paneles,
  copy,
  extrasSlot,
  senaSlot,
  turnstileSiteKey,
}: {
  categorias: CategoriaArmador[];
  /** Un panel por categoría, armado en el servidor. */
  paneles: Record<string, React.ReactNode>;
  copy: SolucionesCopy;
  /** "Sumale extras": el modal de P1 con un "Agregar" por extra (servidor). */
  extrasSlot: React.ReactNode;
  /** "¿Cuánto es la seña?": la tabla de tramos en un modal (servidor). */
  senaSlot: React.ReactNode;
  turnstileSiteKey?: string;
}) {
  const reduced = useReducedMotion();
  const armado = useArmado(clasificarId, "catalogo");
  const e = useMemo(() => estimarArmado(armado), [armado]);
  const n = armado.items.length + armado.extras.length;
  const [activa, setActiva] = useState(categorias[0]?.key ?? "");
  const [compartido, setCompartido] = useState(false);
  const [hoja, setHoja] = useState(false);
  const [vista, setVista] = useState<Vista>("carrito");
  const [chips, setChips] = useState(false);
  const grillaRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listo = useRef(false);
  const barraRef = useRef<HTMLButtonElement>(null);

  /*
   * La columna derecha (P2.1, punto 3): pestañas "Tu kit" | "Malejo". Abrir
   * el chat desde cualquier botón (`malejo:abrir`: "Ayudame a elegir",
   * "Preguntale a Malejo", el header) pasa a "Malejo" y trae la columna a la
   * vista. Lo que se agrega desde una sugerencia de Malejo marca "Tu kit"
   * con un punto de novedad, sin cambiar de pestaña.
   */
  const [pestana, setPestana] = useState<Pestana>("kit");
  const [novedad, setNovedad] = useState(false);
  const pestanaRef = useRef(pestana);
  useEffect(() => {
    pestanaRef.current = pestana;
  });
  useEffect(() => {
    const onAbrir = () => {
      if (!window.matchMedia("(min-width: 760px)").matches) return;
      setPestana("malejo");
      const panel = document.getElementById("catalogo");
      if (panel && panel.getBoundingClientRect().top > 120) {
        panel.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      }
    };
    window.addEventListener(ABRIR_CHAT_EVENT, onAbrir);
    const dejar = escuchar((ev) => {
      if (ev.accion === "agregar" && ev.origen === "malejo" && pestanaRef.current === "malejo") setNovedad(true);
    });
    return () => {
      window.removeEventListener(ABRIR_CHAT_EVENT, onAbrir);
      dejar();
    };
  }, []);
  const elegirPestana = (p: Pestana) => {
    setPestana(p);
    if (p === "kit") setNovedad(false);
    // El chat se carga cuando el navegador está libre: si todavía no llegó, se pide.
    if (p === "malejo" && !document.getElementById(MALEJO_PANEL_ID)?.childElementCount) abrirChat({});
  };

  // `?cat=` y `?a=` en el primer frame: la URL es estado externo y la ruta, estática.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const q = new URLSearchParams(location.search);
      const cat = q.get("cat");
      if (cat && categorias.some((c) => c.key === cat)) setActiva(cat);
      const a = q.get("a");
      if (a) {
        const llegado = deQuery(a, clasificarId);
        if (!armadoVacio(llegado)) {
          // Lo guardado en esta pestaña: si es lo mismo que llegó, es una recarga, no un link compartido.
          const actual = leer(clasificarId);
          if (firmaArmado(actual) !== firmaArmado(llegado)) {
            emitir({ accion: "reemplazar", armado: llegado }, clasificarId);
            setCompartido(true);
          }
        }
      }
      listo.current = true;
    });
    return () => cancelAnimationFrame(raf);
  }, [categorias]);

  // El armado y la categoría, reflejados en la URL para compartir.
  useEffect(() => {
    if (!listo.current) return;
    const url = new URL(location.href);
    const q = aQuery(armado);
    if (q) url.searchParams.set("a", q);
    else url.searchParams.delete("a");
    url.searchParams.set("cat", activa);
    history.replaceState(history.state, "", url);
  }, [armado, activa]);

  // Con JS, el `<summary>` de cada panel es solo el título: fuera del orden de tabulación.
  const panelesRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    panelesRef.current?.querySelectorAll<HTMLElement>(".cat-summary").forEach((s) => (s.tabIndex = -1));
  }, []);

  // Celular: la fila de chips aparece cuando la grilla sale de la pantalla.
  useEffect(() => {
    const el = grillaRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const mq = window.matchMedia("(max-width: 759px)");
    const io = new IntersectionObserver(([entry]) => setChips(mq.matches && !entry.isIntersecting && entry.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // La activa, centrada en la fila de chips.
  useEffect(() => {
    if (!chips) return;
    chipsRef.current?.querySelector<HTMLElement>(`[data-cat="${activa}"]`)?.scrollIntoView({ inline: "center", block: "nearest", behavior: reduced ? "auto" : "smooth" });
  }, [chips, activa, reduced]);

  /**
   * Cambiar de categoría (P2.1, punto 1): con la página scrolleada, los
   * planes nuevos quedaban fuera de la vista. Se vuelve al título de la
   * categoría descontando el header fijo y, en celular, la fila de chips
   * (`scroll-margin-top`); suave, o directo con movimiento reducido. Si el
   * título ya se ve arriba, no se mueve. El foco va al título para los
   * lectores de pantalla (con el teclado, en las pestañas, se queda en la pestaña).
   */
  const elegir = useCallback(
    (key: string, { scroll }: { scroll: boolean }) => {
      setActiva(key);
      if (!scroll) return;
      requestAnimationFrame(() => {
        const titulo = document.getElementById(`sol-titulo-${key}`);
        if (!titulo) return;
        const header = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
        const celular = window.matchMedia("(max-width: 759px)").matches;
        // La fila de chips aparece apenas la grilla sale de la pantalla: se cuenta siempre en celular.
        const chipsAlto = celular ? (chipsRef.current?.parentElement?.getBoundingClientRect().height || 60) : 0;
        const margen = Math.round(header + chipsAlto + 12);
        // El `html` ya tiene `scroll-padding-top` (el header): se suma, así que se descuenta.
        const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
        titulo.style.scrollMarginTop = `${Math.max(0, margen - padding)}px`;
        const top = titulo.getBoundingClientRect().top;
        const yaSeVe = top >= margen - 4 && top < window.innerHeight * 0.45;
        if (!yaSeVe) titulo.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
        titulo.focus({ preventScroll: true });
      });
    },
    [reduced],
  );

  const onTabKey = (ev: React.KeyboardEvent, i: number) => {
    const last = categorias.length - 1;
    const next =
      ev.key === "ArrowRight" || ev.key === "ArrowDown" ? (i === last ? 0 : i + 1)
      : ev.key === "ArrowLeft" || ev.key === "ArrowUp" ? (i === 0 ? last : i - 1)
      : ev.key === "Home" ? 0
      : ev.key === "End" ? last
      : null;
    if (next === null) return;
    ev.preventDefault();
    elegir(categorias[next].key, { scroll: false });
    tabRefs.current[next]?.focus();
  };

  const porCategoria = useMemo(() => {
    const out: Record<string, number> = {};
    for (const i of armado.items) {
      const c = categoriaDe(i.id);
      if (c) out[c] = (out[c] ?? 0) + 1;
    }
    return out;
  }, [armado]);

  /* ─── Vuelo de la miniatura y rebote del contador (Fase 6 bis) ─── */
  const [vuelo, setVuelo] = useState<{ n: number; desde: VueloDetail["desde"]; hasta: { x: number; y: number }; nombre: string } | null>(null);
  const [rebote, setRebote] = useState(0);
  useEffect(() => {
    const on = (ev: Event) => {
      const d = (ev as CustomEvent<VueloDetail>).detail;
      setRebote((r) => r + 1);
      if (reduced) return;
      const destinos = [...document.querySelectorAll<HTMLElement>("[data-armado-destino]")].map((el) => el.getBoundingClientRect()).filter((r) => r.width > 0);
      const t = destinos[0];
      if (!t) return;
      setVuelo((v) => ({ n: (v?.n ?? 0) + 1, desde: d.desde, hasta: { x: t.left + t.width / 2, y: t.top + t.height / 2 }, nombre: d.nombre }));
    };
    window.addEventListener(VUELO_EVENT, on);
    return () => window.removeEventListener(VUELO_EVENT, on);
  }, [reduced]);

  const actual = categorias.find((c) => c.key === activa) ?? categorias[0];
  if (!actual) return null;

  const enviarKit = () => setVista("form");
  const pie = vista === "carrito" && e.cotizacion.items.length ? <CarritoPie e={e} copy={copy} senaSlot={senaSlot} onEnviar={enviarKit} /> : null;
  const carrito = (
    <CarritoCuerpo
      armado={armado}
      e={e}
      copy={copy}
      vista={vista}
      setVista={setVista}
      extrasSlot={extrasSlot}
      compartido={compartido}
      turnstileSiteKey={turnstileSiteKey}
      onAyuda={() => {
        track("soluciones_camino", { camino: "ayudame", desde: "carrito" });
        setHoja(false);
        abrirChat({ tema: n ? copy.carrito.ayudaTema : undefined });
      }}
    />
  );

  const pestanas: { key: Pestana; label: string }[] = [
    { key: "kit", label: copy.panel.kit },
    { key: "malejo", label: copy.panel.malejo },
  ];

  return (
    <LazyMotion features={domAnimation}>
      <div id="catalogo" className="mt-8 grid scroll-mt-[104px] grid-cols-1 items-start gap-6 min-[760px]:grid-cols-[minmax(0,1fr)_300px] lg:grid-cols-[200px_minmax(0,1fr)_310px] lg:gap-6">
        {/* Categorías: grilla en celular y tableta, columna fija en escritorio */}
        <div className="min-w-0 lg:sticky lg:top-[104px]">
          <span className="lbl hidden lg:block">{copy.tabsLabel}</span>
          <div
            ref={grillaRef}
            role="tablist"
            aria-label={copy.tabsLabel}
            aria-orientation="vertical"
            className="grid grid-cols-2 gap-2 min-[760px]:flex min-[760px]:flex-wrap lg:mt-3 lg:flex-col lg:flex-nowrap"
          >
            {categorias.map((c, i) => {
              const on = c.key === actual.key;
              const k = porCategoria[c.key] ?? 0;
              return (
                <button
                  key={c.key}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`sol-tab-${c.key}`}
                  aria-selected={on}
                  aria-controls={`sol-panel-${c.key}`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => elegir(c.key, { scroll: true })}
                  onKeyDown={(ev) => onTabKey(ev, i)}
                  className={`cat-tab flex min-h-11 min-w-0 items-center gap-2 rounded-14 px-3 py-2 text-left text-[14px] font-semibold leading-tight transition-colors lg:min-h-12 lg:text-[15px] ${
                    on ? "bg-acc text-acc-ink" : "border border-border bg-surf text-text shadow-card"
                  }`}
                >
                  <Icon name={c.icon} size={18} className="flex-none" />
                  <span className="min-w-0 flex-1 min-[760px]:hidden">{c.short}</span>
                  <span className="hidden min-w-0 flex-1 min-[760px]:inline">{c.label}</span>
                  {k ? (
                    <span
                      aria-label={copy.enArmado.replace("{N}", plural(k))}
                      className={`contador inline-flex h-6 min-w-6 flex-none items-center justify-center rounded-full px-1.5 font-mono text-[12px] ${on ? "bg-acc-ink text-acc" : "bg-ic-bg text-acc-text"}`}
                    >
                      {k}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Celular: la fila de chips fija, cuando la grilla ya no se ve */}
        <AnimatePresence>
          {chips ? (
            <m.div
              key="chips"
              data-reveal
              initial={reduced ? false : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{ duration: 0.18 }}
              className="chips-fijos fixed inset-x-0 z-30 min-[760px]:hidden"
            >
              <div ref={chipsRef} className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-2">
                {categorias.map((c) => {
                  const on = c.key === actual.key;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      data-cat={c.key}
                      aria-pressed={on}
                      onClick={() => elegir(c.key, { scroll: true })}
                      className={`chip h-11 flex-none whitespace-nowrap ${on ? "border-acc bg-acc text-acc-ink" : ""}`}
                    >
                      <Icon name={c.icon} size={16} />
                      {c.short}
                      {porCategoria[c.key] ? <span className="font-mono text-[12px]">· {porCategoria[c.key]}</span> : null}
                    </button>
                  );
                })}
              </div>
            </m.div>
          ) : null}
        </AnimatePresence>

        {/* Los planes de la categoría activa */}
        <div
          ref={panelesRef}
          className="min-w-0 pb-24 min-[760px]:col-start-1 min-[760px]:pb-0 lg:col-start-2 lg:row-start-1">
          {categorias.map((c) => {
            const on = c.key === actual.key;
            return (
              <details
                key={c.key}
                id={`sol-panel-${c.key}`}
                role="tabpanel"
                aria-labelledby={`sol-tab-${c.key}`}
                open={on}
                data-activo={on ? "" : undefined}
                // La activa no se cierra: con JS el título no es un botón.
                onToggle={(ev) => {
                  const d = ev.currentTarget;
                  if (on && !d.open) d.open = true;
                }}
                className="cat-panel plans"
              >
                {/*
                  Sin <Suspense> a propósito: Next manda el contenido de un límite
                  por streaming fuera de lugar y, sin JS, el catálogo no se vería.
                */}
                {paneles[c.key]}
              </details>
            );
          })}
        </div>

        {/*
          La columna derecha desde 760 px (P2.1, punto 3): un panel fijo de 3
          zonas que nunca scrollea entero. Arriba las pestañas; al medio el
          cuerpo (la lista o el chat), la única parte que scrollea; abajo, en
          "Tu kit", el pie con el estimado y el botón, siempre completo.
        */}
        <aside
          aria-label={copy.panel.label}
          className={`panel-madera card hi hidden min-w-0 flex-col overflow-hidden min-[760px]:sticky min-[760px]:top-[104px] min-[760px]:col-start-2 min-[760px]:row-span-2 min-[760px]:row-start-1 min-[760px]:flex min-[760px]:max-h-[calc(100dvh-120px)] lg:col-start-3 ${
            pestana === "malejo" ? "min-[760px]:h-[calc(100dvh-120px)]" : ""
          }`}
        >
          <div role="tablist" aria-label={copy.panel.label} className="pestanas-madera flex flex-none gap-1 border-b border-border p-1.5">
            {pestanas.map((t) => {
              const on = pestana === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  id={`panel-tab-${t.key}`}
                  aria-selected={on}
                  aria-controls={`panel-${t.key}`}
                  onClick={() => elegirPestana(t.key)}
                  className={`relative flex min-h-11 flex-1 items-center justify-center gap-2 rounded-14 px-3 text-[15px] font-semibold transition-colors ${
                    on ? "bg-ic-bg text-acc-text" : "text-muted hover:text-text"
                  }`}
                >
                  {t.key === "malejo" ? <Icon name="chat" size={16} /> : null}
                  {t.label}
                  {t.key === "kit" && n ? <Contador n={n} rebote={rebote} /> : null}
                  {t.key === "kit" && novedad && !on ? (
                    <span aria-label={copy.panel.novedad} className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-acc" />
                  ) : null}
                </button>
              );
            })}
          </div>
          <div id="panel-kit" role="tabpanel" aria-labelledby="panel-tab-kit" hidden={pestana !== "kit"} className="flex min-h-0 flex-1 flex-col">
            <div className="scroll-fino min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">{carrito}</div>
            {pie ? <div className="flex-none border-t border-border px-5 py-4">{pie}</div> : null}
          </div>
          <div
            id={MALEJO_PANEL_ID}
            role="tabpanel"
            aria-labelledby="panel-tab-malejo"
            hidden={pestana !== "malejo"}
            className="flex min-h-0 flex-1 flex-col"
          />
        </aside>
      </div>

      {/* Celular: la barra del armado, encima de la barra inferior */}
      <AnimatePresence>
        {n > 0 ? (
          <m.div
            key="barra"
            data-reveal
            initial={reduced ? false : { y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { y: 24, opacity: 0 }}
            transition={{ duration: 0.2 }}
            // Con la hoja abierta la barra no se desmonta (se esconde): así el
            // `<dialog>` le devuelve el foco al cerrarse.
            aria-hidden={hoja || undefined}
            className={`barra-armado fixed inset-x-2 z-40 min-[760px]:hidden ${hoja ? "invisible" : ""}`}
          >
            <button
              ref={barraRef}
              type="button"
              onClick={() => setHoja(true)}
              aria-haspopup="dialog"
              aria-label={`${copy.carrito.abrir}: ${copy.carrito.cantidad.replace("{N}", plural(n))}`}
              className="card hi flex min-h-14 w-full items-center justify-between gap-3 rounded-18 px-4 py-2 text-left"
            >
              <span className="flex min-w-0 flex-col">
                <span className="flex items-center gap-1.5 text-[15px] font-semibold">
                  {copy.carrito.barra.replace(" · {N}", "")}
                  <span aria-hidden="true" className="text-muted">
                    ·
                  </span>
                  <Contador n={n} rebote={rebote} />
                </span>
                {e.piso ? <span className="text-[13px] text-muted">{copy.carrito.barraDesde.replace("{X}", fmt(e.piso))}</span> : null}
              </span>
              <span aria-hidden="true" className="ibtn h-10 w-10 border-0 bg-ic-bg text-acc-text">
                <Icon name="up" size={18} />
              </span>
            </button>
          </m.div>
        ) : null}
      </AnimatePresence>

      <div className="min-[760px]:hidden">
        <Hoja
          abierta={hoja}
          onCerrar={() => {
            setHoja(false);
            // La barra estaba invisible mientras la hoja estaba abierta: el foco vuelve cuando se ve.
            requestAnimationFrame(() => barraRef.current?.focus());
          }}
          titulo={copy.carrito.label}
          cerrarLabel={copy.carrito.cerrar}
          pie={pie}
        >
          {carrito}
        </Hoja>
      </div>

      {/* La miniatura que vuela hasta la barra o el carrito */}
      <AnimatePresence>
        {vuelo ? (
          <m.div
            key={vuelo.n}
            aria-hidden="true"
            initial={{ x: vuelo.desde.x + vuelo.desde.w / 2 - 70, y: vuelo.desde.y + vuelo.desde.h / 2 - 22, scale: 1, opacity: 0.95 }}
            animate={{ x: vuelo.hasta.x - 70, y: vuelo.hasta.y - 22, scale: 0.35, opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
            onAnimationComplete={() => setVuelo(null)}
            className="pointer-events-none fixed left-0 top-0 z-[80] flex h-11 w-[140px] items-center justify-center truncate rounded-14 bg-acc px-3 text-[13px] font-semibold text-acc-ink"
          >
            {vuelo.nombre}
          </m.div>
        ) : null}
      </AnimatePresence>
    </LazyMotion>
  );
}

function Contador({ n, rebote }: { n: number; rebote: number }) {
  const reduced = useReducedMotion();
  return (
    <m.span
      key={rebote}
      data-armado-destino
      initial={reduced || !rebote ? false : { scale: 1.45 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 520, damping: 14 }}
      className="contador inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-acc px-1.5 font-mono text-[12px] font-semibold text-acc-ink"
    >
      {n}
    </m.span>
  );
}

/**
 * El cuerpo del kit (lo que scrollea): la lista, el combo, los extras,
 * compartir y vaciar; o el formulario, o la pantalla de éxito. Igual en la
 * columna de escritorio y en la hoja del celular. El estimado y el botón
 * van aparte, en `CarritoPie`, que queda fijo abajo (P2.1, punto 3).
 */
function CarritoCuerpo({
  armado,
  e,
  copy,
  vista,
  setVista,
  extrasSlot,
  compartido,
  turnstileSiteKey,
  onAyuda,
}: {
  armado: Armado;
  e: EstimadoArmado;
  copy: SolucionesCopy;
  vista: Vista;
  setVista: (v: Vista) => void;
  extrasSlot: React.ReactNode;
  compartido: boolean;
  turnstileSiteKey?: string;
  onAyuda: () => void;
}) {
  const k = copy.carrito;
  const [vaciando, setVaciando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const c = e.cotizacion;
  const origen = (id: string) => armado.items.find((i) => i.id === id)?.origen;
  const combo = c.combosAplicados.map((id) => getCombo(id)).find(Boolean);
  const nombres = c.items.map((i) => i.nombre).join(" + ");

  const textoWhatsApp = [
    copy.whatsapp.intro,
    nombres,
    e.piso ? copy.whatsapp.estimado.replace("{X}", fmt(e.piso)).replace("{Y}", fmt(e.techo)) : "",
    e.mensual ? `+ ${fmt(e.mensual)} ${k.porMes}` : "",
    lineaDeSena(e.sena),
    typeof location === "undefined" ? "" : `${location.origin}/soluciones?a=${aQuery(armado)}`,
  ]
    .filter(Boolean)
    .join("\n");

  const compartir = async () => {
    const url = `${location.origin}/soluciones?a=${aQuery(armado)}`;
    const text = k.compartirTexto.replace("{ITEMS}", nombres);
    track("armado_compartido", { n: c.items.length });
    try {
      if (navigator.share) {
        await navigator.share({ title: k.compartirTitulo, text, url });
        return;
      }
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {}
  };

  if (vista === "exito") {
    return (
      <div role="status" className="flex flex-col gap-3">
        <Festejo />
        <p className="h m-0 text-[22px] leading-tight">{copy.exito.titulo}</p>
        <p className="m-0 text-[15px] text-muted">{copy.exito.lead}</p>
        <a href={agendaLink()} target="_blank" rel="noopener" onClick={() => track("armado_agenda")} className="btn btn-p w-full">
          {copy.exito.agenda}
        </a>
        <a href={waLink(textoWhatsApp)} target="_blank" rel="noopener" className="btn btn-s w-full">
          <Icon name="whatsapp" size={18} />
          {copy.exito.whatsapp}
        </a>
        <button type="button" className="lnk min-h-11 self-start" onClick={() => setVista("carrito")}>
          {copy.exito.otro}
        </button>
      </div>
    );
  }

  if (vista === "form") {
    return <FormArmado armado={armado} copy={copy} e={e} turnstileSiteKey={turnstileSiteKey} onVolver={() => setVista("carrito")} onExito={() => setVista("exito")} waTexto={textoWhatsApp} />;
  }

  if (!c.items.length) {
    return (
      <div className="flex flex-col gap-3">
        <p className="m-0 text-[15px] text-muted">{k.vacio}</p>
        <button type="button" className="btn btn-s h-auto min-h-[50px] w-full whitespace-normal py-2" onClick={onAyuda}>
          <Icon name="chat" size={18} />
          {k.ayuda}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {compartido ? (
        <p role="status" className="m-0 rounded-12 bg-ic-bg px-3 py-2 text-[13px] text-acc-text">
          {k.compartido}
        </p>
      ) : null}

      <ul className="m-0 flex list-none flex-col p-0">
        {c.items.map((i) => (
          <li key={i.id} className="flex items-start justify-between gap-3 border-b border-border py-2.5 first:pt-0">
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-[15px] font-semibold leading-snug">{i.nombre}</span>
              {origen(i.id) === "malejo" || (i.incluye ?? []).some((p) => origen(p) === "malejo") ? (
                <span className="self-start rounded-md bg-ic-bg px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[.06em] text-acc-text">{k.sugerido}</span>
              ) : null}
              <span className="text-[13px] text-muted">
                {i.implementacion ? `${i.desde ? `${k.desde} ` : ""}${fmt(i.implementacion)}` : ""}
                {i.mensual ? `${i.implementacion ? " + " : ""}${fmt(i.mensual)} ${k.porMes}` : ""}
                {i.anual ? `${fmt(i.anual)} ${k.porAnio}` : ""}
                {i.aCotizar ? i.aCotizar : ""}
              </span>
            </span>
            <button
              type="button"
              className="lnk min-h-11 flex-none text-[13px]"
              aria-label={k.quitarAria.replace("{NOMBRE}", i.nombre)}
              onClick={() => {
                // Un combo aplicado solo se arma con sus partes: se quitan todas.
                const ids = i.incluye && !armado.items.some((x) => x.id === i.id) ? i.incluye : [i.id];
                for (const id of ids) emitir({ accion: "quitar", id }, clasificarId);
                track("armado_quitar", { id: i.id });
              }}
            >
              {k.quitar}
            </button>
          </li>
        ))}
      </ul>

      {combo ? (
        <p className="m-0 rounded-12 bg-save-bg px-3 py-2 text-[13px] font-semibold text-ok-text">{k.combo.replace("{AHORRO}", fmt(ahorroEnPesos(combo)))}</p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">{extrasSlot}</div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" className="btn btn-s btn-sm min-h-11" onClick={compartir}>
          <Icon name="share" size={16} />
          {copiado ? k.copiado : k.compartir}
        </button>
        {vaciando ? (
          <span className="flex items-center gap-2 text-[13px]" role="group" aria-label={k.vaciarPregunta}>
            {k.vaciarPregunta}
            <button
              type="button"
              className="lnk min-h-11 text-[13px]"
              onClick={() => {
                emitir({ accion: "vaciar" });
                setVaciando(false);
              }}
            >
              {k.vaciarSi}
            </button>
            <button type="button" className="lnk min-h-11 text-[13px]" onClick={() => setVaciando(false)}>
              {k.vaciarNo}
            </button>
          </span>
        ) : (
          <button type="button" className="lnk min-h-11 text-[13px]" onClick={() => setVaciando(true)}>
            {k.vaciar}
          </button>
        )}
      </div>

      <button type="button" className="lnk min-h-11 self-start whitespace-normal text-left text-[14px]" onClick={onAyuda}>
        {k.ayuda}
      </button>
    </div>
  );
}

/**
 * El pie fijo del kit (P2.1, punto 3): el estimado como rango, la línea de
 * pagos, lo mensual, la seña y el botón para mandárselo a Mauro. Nunca
 * scrollea ni queda cortado: en la columna es la tercera zona del panel y en
 * el celular va en el `pie` de la hoja.
 */
function CarritoPie({ e, copy, senaSlot, onEnviar }: { e: EstimadoArmado; copy: SolucionesCopy; senaSlot: React.ReactNode; onEnviar: () => void }) {
  const k = copy.carrito;
  const linea = lineaDePagos(e.pagos?.total);
  return (
    <div className="flex flex-col gap-3">
      <div aria-live="polite" className="flex flex-col gap-1 rounded-16 bg-surf-2 px-4 py-3">
        <span className="lbl text-[10px]">{k.estimadoLabel}</span>
        {e.piso ? (
          <strong className="h text-[22px] leading-tight">{k.estimado.replace("{X}", fmt(e.piso)).replace("{Y}", fmt(e.techo))}</strong>
        ) : (
          <strong className="text-[15px]">{k.soloMensual}</strong>
        )}
        {linea ? <span className="text-[14px] font-semibold text-acc-text">{linea}</span> : null}
        {e.mensual || e.anual ? (
          <span className="text-[14px]">
            {e.mensual ? (
              <>
                + <strong>{fmt(e.mensual)}</strong> <span className="text-muted">{k.porMes}</span>
              </>
            ) : null}
            {e.anual ? (
              <>
                {e.mensual ? " " : ""}+ <strong>{fmt(e.anual)}</strong> <span className="text-muted">{k.porAnio}</span>
              </>
            ) : null}
          </span>
        ) : null}
        <span className="flex flex-wrap items-center gap-x-2 text-[14px]">
          {lineaDeSena(e.sena)}
          <span className="contents">{senaSlot}</span>
        </span>
        <span className="text-[12px] leading-snug text-muted">{k.nota}</span>
      </div>
      <button type="button" className="btn btn-p w-full whitespace-normal" onClick={onEnviar}>
        {k.enviar}
      </button>
    </div>
  );
}

/**
 * "Mandale tu armado a Mauro" (D3). El cliente manda **solo ids**: el
 * servidor los valida y escribe el resumen. Mismo origen permitido, mismos
 * topes por IP y el mismo único insert que el resto (`/api/contacto`).
 */
function FormArmado({
  armado,
  copy,
  e,
  turnstileSiteKey,
  onVolver,
  onExito,
  waTexto,
}: {
  armado: Armado;
  copy: SolucionesCopy;
  e: EstimadoArmado;
  turnstileSiteKey?: string;
  onVolver: () => void;
  onExito: () => void;
  waTexto: string;
}) {
  const f = copy.form;
  const [estado, setEstado] = useState<"idle" | "enviando" | "error">("idle");
  const [error, setError] = useState("");
  const [captcha, setCaptcha] = useState<string>();
  const box = useRef<HTMLDivElement>(null);
  const primero = useRef<HTMLInputElement>(null);
  useTurnstile(turnstileSiteKey, box, setCaptcha);
  useEffect(() => {
    primero.current?.focus();
  }, []);

  const enviar = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const d = new FormData(ev.currentTarget);
    const nombre = String(d.get("nombre") ?? "").trim();
    const whatsapp = String(d.get("whatsapp") ?? "").trim();
    if (!d.get("consent")) return setError(f.needCheck);
    if (nombre.length < 2 || whatsapp.replace(/\D/g, "").length < 10) return setError(f.invalid);
    setEstado("enviando");
    setError("");
    const ficha = leerSesion()?.ficha;
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          consent: true,
          armado: { items: armado.items.map((i) => i.id), extras: armado.extras },
          nombre,
          whatsapp,
          rubro: String(d.get("rubro") ?? "").trim() || undefined,
          nota: String(d.get("nota") ?? "").trim() || undefined,
          ...(ficha ? { ficha: { rubro: ficha.rubro, necesidad: ficha.necesidad } } : {}),
          turnstile: captcha,
        }),
      });
      const r = (await res.json()) as { ok: boolean; error?: string };
      if (!r.ok) throw new Error(r.error);
      track("armado_enviado", { n: e.cotizacion.items.length, sena: e.sena.tipo });
      marcarKitEnviado();
      onExito();
    } catch (err) {
      setEstado("error");
      setError((err as Error).message || f.error);
    }
  };

  const campo = "h-12 w-full rounded-12 border border-border-2 bg-bg px-3 text-[16px] text-text";
  return (
    <form onSubmit={enviar} className="flex flex-col gap-3" noValidate>
      <p className="h m-0 text-[20px] leading-tight">{f.titulo}</p>
      <p className="m-0 text-[14px] text-muted">{f.lead}</p>
      <label className="flex flex-col gap-1">
        <span className="text-[14px] font-semibold">{f.nombre}</span>
        <input ref={primero} name="nombre" autoComplete="name" maxLength={80} required className={campo} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[14px] font-semibold">{f.whatsapp}</span>
        <input name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" maxLength={30} required className={campo} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[14px] font-semibold">{f.rubro}</span>
        <input name="rubro" maxLength={80} placeholder={f.rubroPlaceholder} className={`${campo} placeholder:text-muted`} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[14px] font-semibold">{f.nota}</span>
        <textarea name="nota" maxLength={300} rows={3} className="w-full rounded-12 border border-border-2 bg-bg px-3 py-2 text-[16px] text-text" />
      </label>
      <label className="flex min-h-11 cursor-pointer items-start gap-2.5 text-[14px]">
        <input type="checkbox" name="consent" className="mt-0.5 h-5 w-5 flex-none accent-(--acc)" />
        <span>
          {f.consent}.{" "}
          <Link href="/legal/privacidad" className="text-acc-text underline underline-offset-2">
            {f.privacy}
          </Link>
        </span>
      </label>
      <div ref={box} />
      {error ? (
        <p role="alert" className="m-0 text-[14px] text-acc-text">
          {error}{" "}
          {estado === "error" ? (
            <a href={waLink(waTexto)} target="_blank" rel="noopener" className="underline underline-offset-2">
              {f.errorWhatsapp}
            </a>
          ) : null}
        </p>
      ) : null}
      <button type="submit" disabled={estado === "enviando"} className="btn btn-p w-full disabled:opacity-60">
        {estado === "enviando" ? f.enviando : f.enviar}
      </button>
      <button type="button" className="lnk min-h-11 self-start" onClick={onVolver}>
        {f.volver}
      </button>
    </form>
  );
}

/**
 * Tanda P3-1: en la pantalla de éxito del kit, Mauro festeja una vez y queda
 * en la pose `ok` (con movimiento reducido, directo en `ok`).
 */
function Festejo() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    void reproducir(ref.current?.querySelector("[data-sprite]"), "festejo");
  }, []);
  return (
    <span ref={ref} className="flex h-[104px] items-end">
      <Sprite pose="ok" alto={96} alt="" animaciones={["festejo"]} />
    </span>
  );
}
