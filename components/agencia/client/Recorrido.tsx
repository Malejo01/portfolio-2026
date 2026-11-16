"use client";

import { track } from "@vercel/analytics";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { RecorridoCopy } from "@/content/agencia/recorrido";
import { marcar, objetivo } from "@/lib/agencia/recorrido";
import { reproducir } from "@/lib/agencia/sprite-anim";
import { Sprite } from "../Sprite";

/**
 * El recorrido de bienvenida (tanda P3-4). Lo monta `RecorridoLoader` con
 * `next/dynamic` solo cuando hace falta.
 *
 * Malejo señala un botón por vez: la página se oscurece (`--recorrido-velo`,
 * por estilo) con un hueco sobre el objetivo (8 px de margen, su radio y un
 * borde del color de acción) y un globito lo explica. Mientras dura, el
 * objetivo no se puede tocar (una capa transparente encima de todo).
 *
 * - Los objetivos son `data-recorrido="malejo|kit|estilos"`; si uno no se
 *   ve, el paso se saltea (`lib/agencia/recorrido.ts → objetivo`).
 * - El globito va del lado con más espacio y nunca tapa el hueco; en el
 *   celular, arriba o abajo a todo el ancho, sin pisar la barra inferior.
 *   Se recalcula al girar, redimensionar y hacer scroll. Si el objetivo está
 *   fuera de la vista, primero se lleva a la vista.
 * - `role="dialog"` con título y texto; el foco va a "Siguiente", Tab no
 *   sale del globito, Esc = "Saltar" y al cerrar vuelve a donde estaba. Cada
 *   paso se anuncia en una región `aria-live`.
 * - Con movimiento reducido, sin transiciones ni saludo.
 */
const MARGEN = 8;
const AIRE = 12;
const BORDE = 16;
const ANCHO_MAX = 380;

type Caja = { x: number; y: number; w: number; h: number; r: number };
type Lugar = { x: number; y: number; w: number };
/** `animar`: solo entre pasos; al scrollear o girar, el hueco sigue al objetivo sin demora. */
type Medida = { hueco: Caja; lugar: Lugar; animar: boolean };

export function Recorrido({ copy, origen, onCerrar }: { copy: RecorridoCopy; origen: "auto" | "enlace"; onCerrar: () => void }) {
  const reducido = useReducedMotion();
  // Los pasos que tienen un objetivo a la vista al abrir (los demás se saltean).
  const [pasos] = useState(() => copy.pasos.filter((p) => objetivo(p.id)));
  const [i, setI] = useState(0);
  const [medida, setMedida] = useState<Medida | null>(null);
  const globo = useRef<HTMLDivElement>(null);
  const siguienteBtn = useRef<HTMLButtonElement>(null);
  const spriteRef = useRef<HTMLSpanElement>(null);
  // Dónde estaba el foco al abrir: ahí vuelve al cerrar. (La isla es `ssr: false`.)
  const [previo] = useState(() => (document.activeElement instanceof HTMLElement ? document.activeElement : null));
  const saludo = useRef(false);
  const tituloId = useId();
  const textoId = useId();
  const paso = pasos[i];
  const ultimo = i === pasos.length - 1;

  const cerrar = useCallback(
    (completo: boolean) => {
      // El enlace "¿Cómo uso la página?" no toca la marca; el recorrido solo, sí.
      if (origen === "auto") marcar(completo ? "visto" : "saltado");
      track("recorrido_fin", { completo, paso: i + 1 });
      onCerrar();
      requestAnimationFrame(() => previo?.focus?.({ preventScroll: true }));
    },
    [origen, i, onCerrar, previo],
  );

  // Al abrir se avisa. Sin ningún objetivo a la vista, se cierra.
  useEffect(() => {
    track("recorrido_inicio", { origen });
    if (!pasos.length) onCerrar();
    // Solo al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Mide el objetivo y ubica el hueco y el globito. */
  const medir = useCallback((animar: boolean) => {
    if (!paso) return;
    const el = objetivo(paso.id);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const radio = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
    const h: Caja = { x: r.left - MARGEN, y: r.top - MARGEN, w: r.width + 2 * MARGEN, h: r.height + 2 * MARGEN, r: 0 };
    h.r = Math.min(radio + MARGEN, h.h / 2, h.w / 2);
    const ubicar = (lugar: Lugar) => setMedida({ hueco: h, lugar, animar });

    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const navInf = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-inf")) || 0;
    const celular = vw < 760;
    const w = celular ? vw - 2 * BORDE : Math.min(ANCHO_MAX, vw - 2 * BORDE);
    const gh = globo.current?.offsetHeight ?? 220;
    // Abajo no se pisa la barra inferior, salvo que el objetivo esté en ella.
    const piso = h.y + h.h > vh - navInf ? vh - BORDE : vh - navInf - BORDE;
    const libreAbajo = piso - (h.y + h.h) - AIRE - gh;
    const libreArriba = h.y - AIRE - BORDE - gh;
    const centroY = (y: number) => Math.min(Math.max(y, BORDE), piso - gh);
    const centroX = (x: number) => Math.min(Math.max(x, BORDE), vw - BORDE - w);

    if (celular) {
      const abajo = libreAbajo >= 0 || libreAbajo >= libreArriba;
      ubicar({ x: BORDE, y: abajo ? h.y + h.h + AIRE : h.y - AIRE - gh, w });
      return;
    }
    const libreDerecha = vw - BORDE - (h.x + h.w) - AIRE - w;
    const libreIzquierda = h.x - AIRE - BORDE - w;
    const opciones: [number, Lugar][] = [
      [libreAbajo, { x: centroX(h.x + h.w / 2 - w / 2), y: h.y + h.h + AIRE, w }],
      [libreArriba, { x: centroX(h.x + h.w / 2 - w / 2), y: h.y - AIRE - gh, w }],
      [libreDerecha, { x: h.x + h.w + AIRE, y: centroY(h.y + h.h / 2 - gh / 2), w }],
      [libreIzquierda, { x: h.x - AIRE - w, y: centroY(h.y + h.h / 2 - gh / 2), w }],
    ];
    opciones.sort((a, b) => b[0] - a[0]);
    ubicar(opciones[0][1]);
  }, [paso]);

  // Cada paso: lleva el objetivo a la vista si hace falta, mide y avisa.
  useLayoutEffect(() => {
    if (!paso) return;
    const el = objetivo(paso.id);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const navInf = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-inf")) || 0;
    const fuera = r.top < BORDE || r.bottom > window.innerHeight - navInf - BORDE;
    const enBarra = el.closest(".nav-inf");
    if (fuera && !enBarra) el.scrollIntoView({ block: "center", behavior: reducido ? "instant" : "smooth" });
    // El primer paso aparece en su lugar; los siguientes se deslizan.
    medir(i > 0);
    // Una segunda medida con el globito ya dibujado (su alto real).
    const raf = requestAnimationFrame(() => medir(i > 0));
    track("recorrido_paso", { paso: i + 1 });
    return () => cancelAnimationFrame(raf);
  }, [i, paso, medir, reducido]);

  // Girar, redimensionar o scrollear: se vuelve a ubicar.
  useEffect(() => {
    let raf = 0;
    const pedir = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => medir(false));
    };
    window.addEventListener("resize", pedir);
    window.addEventListener("orientationchange", pedir);
    window.addEventListener("scroll", pedir, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", pedir);
      window.removeEventListener("orientationchange", pedir);
      window.removeEventListener("scroll", pedir, true);
    };
  }, [medir]);

  // El foco va a "Siguiente" en cada paso; en el primero, Malejo saluda una vez.
  const ubicado = medida !== null;
  useEffect(() => {
    if (!ubicado) return;
    siguienteBtn.current?.focus({ preventScroll: true });
    if (i === 0 && !saludo.current) {
      saludo.current = true;
      void reproducir(spriteRef.current?.querySelector("[data-sprite]"), "saludo");
    }
  }, [i, ubicado]);

  // Esc = Saltar; Tab no sale del globito.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cerrar(false);
        return;
      }
      if (e.key !== "Tab" || !globo.current) return;
      const focos = [...globo.current.querySelectorAll<HTMLElement>("button")];
      if (!focos.length) return;
      const primero = focos[0];
      const final = focos[focos.length - 1];
      const dentro = globo.current.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === primero || !dentro)) {
        e.preventDefault();
        final.focus();
      } else if (!e.shiftKey && (document.activeElement === final || !dentro)) {
        e.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [cerrar]);

  /** El paso siguiente que todavía tenga su objetivo a la vista (si desapareció, se saltea). */
  const avanzar = () => {
    let n = i + 1;
    while (n < pasos.length && !objetivo(pasos[n].id)) n++;
    if (n >= pasos.length) cerrar(true);
    else setI(n);
  };

  if (!paso) return null;

  const total = pasos.length;
  const reemplazar = (s: string) => s.replace("{N}", String(i + 1)).replace("{T}", String(total)).replace("{TITULO}", paso.titulo);
  const transicion = reducido || !medida?.animar ? { duration: 0 } : { duration: 0.25, ease: "easeOut" as const };
  const hueco = medida?.hueco;
  const lugar = medida?.lugar;

  return createPortal(
    <LazyMotion features={domAnimation}>
      {/* Encima de todo: nada de la página se toca mientras dura (tampoco el objetivo). */}
      <div className="recorrido-capa" aria-hidden="true" />
      {hueco ? (
        <m.div
          data-reveal=""
          className="recorrido-hueco"
          aria-hidden="true"
          initial={false}
          animate={{ left: hueco.x, top: hueco.y, width: hueco.w, height: hueco.h, borderRadius: hueco.r }}
          transition={transicion}
        />
      ) : null}
      <m.div
        ref={globo}
        data-reveal=""
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        aria-describedby={textoId}
        className="recorrido-globo card"
        style={{ width: lugar?.w ?? Math.min(ANCHO_MAX, window.innerWidth - 2 * BORDE), visibility: lugar ? "visible" : "hidden" }}
        initial={false}
        animate={{ left: lugar?.x ?? 0, top: lugar?.y ?? 0 }}
        transition={transicion}
      >
        <div className="flex gap-3">
          <span ref={spriteRef} className="flex flex-none items-end">
            <Sprite pose="ok" alto={72} alt="" animaciones={["saludo"]} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="lbl m-0">{reemplazar(copy.contador)}</p>
            <h2 id={tituloId} className="h m-0 mt-1 text-[20px] leading-tight">
              {paso.titulo}
            </h2>
            <p id={textoId} className="m-0 mt-1.5 text-[14px] leading-[1.5] text-muted">
              {paso.texto}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <button type="button" className="lnk min-h-11" onClick={() => cerrar(false)}>
            {copy.saltar}
          </button>
          <button
            ref={siguienteBtn}
            type="button"
            className="btn btn-p btn-sm"
            onClick={() => (ultimo ? cerrar(true) : avanzar())}
          >
            {ultimo ? copy.listo : copy.siguiente}
          </button>
        </div>
      </m.div>
      <p className="sr-only" aria-live="polite">
        {reemplazar(copy.aviso)}
      </p>
    </LazyMotion>,
    document.body,
  );
}
