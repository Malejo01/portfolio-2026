"use client";

/* eslint-disable @next/next/no-img-element -- pixel art chico, sin optimizar a propósito */
import { track } from "@vercel/analytics";
import { useEffect, useId, useRef, useState } from "react";
import type { estiloCopy as EstiloCopy } from "@/content/agencia/estilos";
import { dibujoSiguiente, elegirDibujo, elegirEstilo } from "@/lib/agencia/estilo";
import { AGENCIA_THEME_COOKIE } from "@/lib/agencia/theme";
import { Icon } from "../icons";
import { useEstilo } from "./useEstilo";

export interface EstiloLigero {
  id: string;
  nombre: string;
  descripcion: string;
  etiquetaCategoria: string;
  disponible: boolean;
}

export interface Personaje {
  id: string;
  nombre: string;
  src: string;
  w: number;
  h: number;
}

/**
 * El selector de estilos (tanda P3-1, `docs/agencia/estilos/institucional/F-selector.html`).
 *
 * - Escritorio (≥ 760 px): pestaña vertical "Estilos" en el borde derecho, a
 *   media altura. Celular: el ícono de la paleta en el header, al lado del
 *   logo (la barra inferior no se toca).
 * - Abre "Mirá la web en otro estilo": un `<dialog>` nativo (panel a la
 *   derecha en escritorio, hoja abajo en el celular) con las miniaturas, la
 *   fila Personaje, "Sorprendeme" y "Volver al original".
 * - Elegir guarda en `localStorage`, cambia `data-estilo` y usa
 *   `startViewTransition()` si existe (sin transición con movimiento
 *   reducido): `lib/agencia/estilo.ts`.
 *
 * Sin JS no se ve (`js-only`): la página queda en Tech/IA.
 */
export function EstiloSelector({
  copy,
  estilos,
  temas,
  personajes,
}: {
  copy: typeof EstiloCopy;
  estilos: EstiloLigero[];
  /** id → tema de entrada ("light" | "dark" | ""), de `configArranque`. */
  temas: Record<string, string>;
  personajes: Personaje[];
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [abierto, setAbierto] = useState(false);
  const { estilo, dibujo } = useEstilo();
  const titulo = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierto && !d.open) d.showModal();
    else if (!abierto && d.open) d.close();
  }, [abierto]);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onClose = () => setAbierto(false);
    d.addEventListener("close", onClose);
    return () => d.removeEventListener("close", onClose);
  }, []);

  const disponibles = estilos.filter((e) => e.disponible);

  const elegir = (id: string) => {
    if (id === estilo) return;
    elegirEstilo(id, (temas[id] ?? "") as "light" | "dark" | "", AGENCIA_THEME_COOKIE);
    track("estilo_cambiado", { id });
  };

  const sorprendeme = () => {
    const otros = disponibles.filter((e) => e.id !== estilo);
    if (otros.length) elegir(otros[Math.floor(Math.random() * otros.length)].id);
  };

  const elegirPersonaje = (id: string) => {
    elegirDibujo(id);
    track("personaje_cambiado", { dibujo: id });
  };

  return (
    <>
      {/* Celular: al lado del logo. */}
      <button
        type="button"
        aria-label={copy.abrir}
        aria-haspopup="dialog"
        onClick={() => setAbierto(true)}
        className="js-only ibtn text-tono-2 min-[760px]:hidden"
      >
        <Icon name="paleta" size={20} />
      </button>
      {/* Escritorio: la pestaña vertical del borde derecho. */}
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={copy.abrir}
        onClick={() => setAbierto(true)}
        className="estilos-pestana js-only hidden min-[760px]:flex"
      >
        <Icon name="paleta" size={16} />
        <span>{copy.pestana}</span>
      </button>

      <dialog
        ref={ref}
        aria-labelledby={titulo}
        className="estilos-dlg"
        onClick={(e) => {
          if (e.target === e.currentTarget) setAbierto(false);
        }}
      >
        <div className="estilos-panel card flex flex-col gap-4 p-[22px]">
          <div className="flex items-center justify-between gap-3">
            <h2 id={titulo} className="h m-0 text-[22px] leading-tight">
              {copy.titulo}
            </h2>
            <button type="button" className="ibtn h-9 w-9" aria-label={copy.cerrar} onClick={() => setAbierto(false)}>
              <Icon name="close" size={16} />
            </button>
          </div>
          <p className="m-0 text-[14px] text-muted">{copy.bajada}</p>

          <ul className="m-0 grid list-none grid-cols-2 gap-2.5 p-0">
            {estilos.map((e) => {
              const activo = e.id === estilo;
              return (
                <li key={e.id} className="flex">
                  <button
                    type="button"
                    aria-pressed={e.disponible ? activo : undefined}
                    disabled={!e.disponible}
                    onClick={() => elegir(e.id)}
                    className="estilo-mini flex flex-1 flex-col overflow-hidden rounded-12 border-2 border-border bg-surf text-left aria-pressed:border-acc-text disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    <span aria-hidden="true" className={`mini mini-${e.id} relative block h-16 border-b border-border`}>
                      <span className="mini-l1" />
                      <span className="mini-l2" />
                      <span className="mini-b" />
                    </span>
                    <span className="flex flex-col gap-0.5 p-2.5">
                      <span className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-titulo">
                        {e.nombre}
                        {activo ? (
                          <>
                            <Icon name="check" size={14} />
                            <span className="sr-only">({copy.actual})</span>
                          </>
                        ) : null}
                      </span>
                      <span className="text-[12px] leading-snug text-etiqueta">{e.disponible ? e.descripcion : copy.proximamente}</span>
                      <span className="mt-1 text-[12px] text-acc-text">{e.etiquetaCategoria}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="border-t border-border pt-3.5">
            <h3 className="m-0 mb-2 text-[15px] font-semibold text-titulo">{copy.personaje}</h3>
            <div role="group" aria-label={copy.personajeGrupo} className="flex gap-2">
              {personajes.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={p.id === dibujo}
                  onClick={() => elegirPersonaje(p.id)}
                  className="flex min-h-11 flex-1 flex-col items-center gap-1.5 rounded-12 border-2 border-border bg-surf p-2.5 text-[13px] font-semibold text-titulo aria-pressed:border-acc-text aria-pressed:bg-ic-bg"
                >
                  <span className="flex h-16 items-end">
                    <img src={p.src} alt="" width={p.w} height={p.h} className="pixel block h-16 w-auto" loading="lazy" />
                  </span>
                  {p.nombre}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button type="button" className="btn btn-s btn-sm" onClick={sorprendeme} disabled={disponibles.length < 2}>
              {copy.sorprendeme}
            </button>
            <button
              type="button"
              className="lnk min-h-11 underline underline-offset-4"
              onClick={() => elegir("tech")}
              disabled={estilo === "tech"}
            >
              {copy.original}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

/**
 * El selector rápido de personaje (pedido de Mauro): "Personaje: Pixel ·
 * Chibi · Anime" debajo del ejemplo del hero, en escritorio.
 */
export function PersonajeRapido({ copy, personajes, className = "" }: { copy: typeof EstiloCopy; personajes: Personaje[]; className?: string }) {
  const { dibujo } = useEstilo();
  return (
    <div role="group" aria-label={copy.personajeGrupo} className={`js-only flex items-center gap-1.5 ${className}`}>
      <span className="text-[12px] text-etiqueta">{copy.personajeCorto}</span>
      {personajes.map((p) => (
        <button
          key={p.id}
          type="button"
          aria-pressed={p.id === dibujo}
          onClick={() => {
            elegirDibujo(p.id);
            track("personaje_cambiado", { dibujo: p.id });
          }}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-10 border border-border bg-surf px-2.5 text-[12px] font-medium text-titulo aria-pressed:border-acc-text aria-pressed:bg-ic-bg aria-pressed:font-semibold"
        >
          <img src={p.src} alt="" width={Math.round((p.w * 16) / p.h)} height={16} className="pixel h-4 w-auto" loading="lazy" />
          {p.nombre}
        </button>
      ))}
    </div>
  );
}

/** El botón de flechas al lado de "Soy Mauro" (celular) y el avatar del chat: pasa al dibujo siguiente. */
export function PersonajeCiclo({ label, className = "" }: { label: string; className?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        const sig = dibujoSiguiente();
        elegirDibujo(sig);
        track("personaje_cambiado", { dibujo: sig });
      }}
      className={`js-only ibtn h-10 w-10 ${className}`}
    >
      <Icon name="rotar" size={18} />
    </button>
  );
}
