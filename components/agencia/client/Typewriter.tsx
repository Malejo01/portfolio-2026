"use client";

import { useEffect, useState } from "react";

/**
 * H1 tecleado del hero (DISENO.md §7, `02-hero-tecleo-*.png`).
 *
 * - Por **palabras**: cada palabra es un `inline-block` con
 *   `white-space: nowrap` separado por `margin-right: .24em`, así no se
 *   pierden los espacios ni se parte una palabra a la mitad.
 * - Cada letra aparece entera a su tiempo: 30–72 ms con ritmo irregular
 *   (aleatorio con semilla fija: es igual en cada visita), +60 ms después de
 *   una coma o un punto, +40 ms entre palabras, +180 ms entre líneas, y
 *   arranca a los 0,5 s.
 * - El cursor `▍` va pegado a la última letra visible (sólido) y al terminar
 *   queda dentro de la última palabra, titilando. Es de ancho cero: no
 *   empuja las letras que faltan ni cambia dónde corta la línea.
 *
 * SSR: el HTML trae la frase completa. Sin JS se lee entera; con JS
 * `agencia.css` oculta las letras hasta que esta isla toma el control
 * (`data-tw-live`). Con reducir movimiento: frase completa y sin cursor.
 */
type Word = { text: string; accent?: boolean };

const START = 500;

/** mulberry32: PRNG chico y determinista. */
function prng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Instante (ms desde el montaje) en que aparece cada letra, en orden. */
function schedule(lines: Word[][]): number[] {
  const rand = prng(7);
  const times: number[] = [];
  let t = START;
  let prev = "";
  lines.forEach((words, li) => {
    words.forEach((word, wi) => {
      [...word.text].forEach((ch, ci) => {
        if (times.length > 0) {
          t += 30 + Math.round(rand() * 42);
          if (/[.,]/.test(prev)) t += 60;
          if (ci === 0) t += wi === 0 && li > 0 ? 180 : 40;
        }
        times.push(t);
        prev = ch;
      });
    });
  });
  return times;
}

export function Typewriter({ lines }: { lines: Word[][] }) {
  // null = todavía no tomó el control (SSR / antes de hidratar).
  const [shown, setShown] = useState<number | null>(null);
  const [cursor, setCursor] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const times = schedule(lines);
    // Todo el estado se escribe desde el primer frame, no en el cuerpo del
    // efecto: el reloj del tecleo arranca ahí.
    let t0 = 0;
    let raf = 0;
    const tick = (now: number) => {
      if (reduced) {
        setShown(times.length);
        return;
      }
      if (!t0) {
        t0 = now;
        setCursor(true);
      }
      let n = 0;
      while (n < times.length && times[n] <= now - t0) n++;
      setShown(n);
      if (n < times.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [lines]);

  const total = lines.reduce((s, ws) => s + ws.reduce((x, w) => x + w.text.length, 0), 0);
  const done = shown !== null && shown >= total;
  let index = 0;

  return (
    <span aria-hidden="true" className="tw" data-tw-live={shown !== null ? "" : undefined}>
      {lines.map((words, li) => (
        <span key={li} className="block">
          {words.map((word, wi) => {
            const last = wi === words.length - 1;
            return (
              <span
                key={wi}
                className={`inline-block whitespace-nowrap ${word.accent ? "text-acc-text dark:text-acc" : ""}`}
                style={last ? undefined : { marginRight: ".24em" }}
              >
                {cursor && shown === 0 && index === 0 ? <Cursor /> : null}
                {[...word.text].map((ch) => {
                  const i = index++;
                  const visible = shown === null || i < shown;
                  return (
                    <span key={i}>
                      <span className="tw-l" style={shown === null ? undefined : { opacity: visible ? 1 : 0 }}>
                        {ch}
                      </span>
                      {cursor && shown !== null && shown > 0 && i === shown - 1 ? <Cursor blink={done} /> : null}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}

function Cursor({ blink = false }: { blink?: boolean }) {
  return (
    <span className="inline-block w-0 whitespace-nowrap">
      <span className="tw-cur" data-blink={blink ? "" : undefined}>
        ▍
      </span>
    </span>
  );
}
