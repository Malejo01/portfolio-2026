"use client";

import { useEffect, type RefObject } from "react";

/**
 * Cloudflare Turnstile en modo `interaction-only` (casi siempre invisible).
 * Hook compartido por la casilla de consentimiento del chat y el formulario
 * de `/demo`. Sin `siteKey` no hace nada: sin claves no se exige (el
 * servidor tampoco lo pide sin `TURNSTILE_SECRET_KEY`). Dentro de un
 * `<form>`, Turnstile agrega solo el campo `cf-turnstile-response`.
 */
declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string; remove?: (id: string) => void };
  }
}

const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js";

export function useTurnstile(siteKey: string | undefined, box: RefObject<HTMLElement | null>, onToken?: (token: string) => void): void {
  useEffect(() => {
    const el = box.current;
    if (!siteKey || !el) return;
    let id: string | undefined;
    const render = () => {
      if (!el.isConnected || id) return;
      id = window.turnstile?.render(el, { sitekey: siteKey, appearance: "interaction-only", callback: onToken });
    };
    if (window.turnstile) render();
    else {
      let s = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT}"]`);
      if (!s) {
        s = document.createElement("script");
        s.src = SCRIPT;
        s.async = true;
        document.head.appendChild(s);
      }
      s.addEventListener("load", render);
    }
    return () => {
      if (id) window.turnstile?.remove?.(id);
    };
  }, [siteKey, box, onToken]);
}
