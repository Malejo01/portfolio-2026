"use client";

import { track } from "@vercel/analytics";
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/agencia/icons";
import type { MalejoCopy, OpcionBienvenida } from "@/content/agencia/malejo";
import { emitir, kitEnviado, leer } from "@/lib/agencia/armado";
import type { Card } from "@/lib/agencia/chat/cards";
import { mergeFicha, type Ficha } from "@/lib/agencia/chat/ficha";
import { armarHistorial, firmasMostradas, ultimaQuote } from "@/lib/agencia/chat/history";
import { modoDePagina } from "@/lib/agencia/chat/modo";
import { borrarSesion, guardarSesion, leerSesion } from "@/lib/agencia/chat/sesion";
import { mensajeWhatsApp } from "@/lib/agencia/chat/whatsapp";
import { waLink } from "@/lib/agencia/config";
import { fmt, fmtUsd } from "@/lib/agencia/format";
import type { Pose } from "@/content/agencia/estilos";
import { dibujoSiguiente, elegirDibujo } from "@/lib/agencia/estilo";
import { reproducir } from "@/lib/agencia/sprite-anim";
import { Sprite } from "../Sprite";
import { CaraMalejo } from "../CaraMalejo";
import { CHAT_ABIERTO_EVENT } from "@/lib/agencia/recorrido";
import { vibrar } from "./AgregarBoton";
import { useTurnstile } from "./turnstile";
import { useArmado } from "./useArmado";

/**
 * El flotante de Malejo (DISENO.md §5, `11-flotante-*.png`): sprite-botón y
 * ventana de chat. Lo carga `MalejoLoader` con `next/dynamic` (`ssr: false`)
 * cuando el navegador está libre o cuando un botón `AbrirChat` lo pide
 * (`pedido`), así que no pesa en el primer render.
 *
 * Tanda P2:
 * - **Bienvenida** (Fase 5 bis): el saludo es una burbuja de Malejo con las
 *   opciones adentro, en grilla de 2 columnas (1 debajo de 340 px), que se
 *   pueden tocar solo mientras son el último mensaje; después quedan en gris
 *   (`aria-disabled`), igual que las respuestas sugeridas. En `/soluciones`
 *   las opciones son las del modo armado. Si el chat se abrió con un tema,
 *   no hay opciones: el tema sale como primer mensaje. El saludo no va al
 *   historial que se manda al servidor.
 * - **Pie mínimo**: solo el campo, enviar y la línea de privacidad. "Hablar
 *   con Mauro" pasa al encabezado (texto visible en escritorio, ícono en
 *   celular), con la ficha y el armado.
 * - **Scroll al leer**: un mensaje nuevo de Malejo se muestra desde su
 *   primera línea; mientras se escribe, el final se sigue solo si la persona
 *   ya estaba abajo de todo.
 * - **Celular** (Fase 6 bis): hoja a media pantalla (55 %) con el catálogo
 *   visible arriba, que se agranda (⤢) y pasa sola a pantalla completa con
 *   el teclado abierto (`visualViewport`). Avisa su alto en `--malejo-hoja`
 *   para que la barra del armado quede encima. El sprite flotante solo se
 *   ve desde 760 px: en el celular, Malejo está en la barra inferior.
 * - Manda el **armado** actual con cada pedido (como la ficha) y muestra
 *   las sugerencias de `sugerir_armado` con su botón "Agregar al armado":
 *   el clic es de la persona (D5).
 *
 * Memoria de la charla, toda en el cliente (el servidor no guarda nada): los
 * mensajes con sus tarjetas y la **ficha** que va armando `anotar_ficha`.
 * Cada pedido manda el historial con una línea por tarjeta mostrada, la
 * ficha y las firmas de las tarjetas (`lib/agencia/chat/history.ts`).
 */
type Seg = { t: "text"; text: string } | { t: "card"; card: Card };
/**
 * `text` y `cards` arman el historial; `segs` guarda el orden en que llegaron
 * (texto → tarjeta → texto) para mostrarlos igual y no dejar la frase que
 * sigue a una herramienta arriba de su tarjeta. `saludo` marca la bienvenida
 * (no va al servidor); `sinOpciones`, que el chat se abrió con un tema.
 */
type Msg = { id: number; role: "user" | "assistant"; text: string; cards: Card[]; segs?: Seg[]; saludo?: boolean; sinOpciones?: boolean };

function conTexto(m: Msg, text: string): Msg {
  const segs = [...(m.segs ?? [])];
  const last = segs[segs.length - 1];
  if (last?.t === "text") segs[segs.length - 1] = { t: "text", text: last.text + text };
  else segs.push({ t: "text", text });
  return { ...m, text: m.text + text, segs };
}

function conCard(m: Msg, card: Card): Msg {
  return { ...m, cards: [...m.cards, card], segs: [...(m.segs ?? []), { t: "card", card }] };
}

/**
 * Alto de la hoja a media pantalla: el 55 %, con un piso para que la
 * bienvenida con sus 6 opciones entre sin scroll en un celular bajo (360 × 740).
 */
/** Tanda P3-1: el alto lo pone el estilo (`--hoja-alto`; Institucional, 64 %). */
const MEDIA_HOJA = "var(--hoja-alto)";

const saludo = (id: number, copy: MalejoCopy): Msg => ({ id, role: "assistant", text: copy.greeting, cards: [], saludo: true });

/** El celular de la Fase 6 bis: debajo de 760 px el chat es una hoja. */
function useCelular(): boolean {
  const [cel, setCel] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 759px)");
    const on = () => setCel(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return cel;
}

/**
 * P2.1 (punto 3): en `/soluciones`, desde 760 px, el chat vive **adentro de
 * la columna derecha** (la pestaña "Malejo" del armador, `#malejo-panel`) y
 * no como flotante. Es el mismo componente con la misma sesión: se monta con
 * un portal. Se vuelve a buscar al cambiar de ruta o de ancho.
 */
export const MALEJO_PANEL_ID = "malejo-panel";

function useHostPanel(pathname: string | null): HTMLElement | null {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 760px)");
    const on = () => setHost(mq.matches ? document.getElementById(MALEJO_PANEL_ID) : null);
    const raf = requestAnimationFrame(on);
    mq.addEventListener("change", on);
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", on);
    };
  }, [pathname]);
  return host;
}

/** Teclado abierto: el área visible se achicó mucho (`visualViewport`). */
function useTeclado(activo: boolean): boolean {
  const [abierto, setAbierto] = useState(false);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!activo || !vv) return;
    const on = () => setAbierto(vv.height < window.innerHeight * 0.75);
    on();
    vv.addEventListener("resize", on);
    return () => vv.removeEventListener("resize", on);
  }, [activo]);
  return activo && abierto;
}

export default function MalejoWidget({
  copy,
  turnstileSiteKey,
  pedido,
}: {
  copy: MalejoCopy;
  turnstileSiteKey?: string;
  /** Pedido de apertura de `AbrirChat` (vía `MalejoLoader`): abrir y, si hay tema, enviarlo. */
  pedido?: { tema?: string; n: number } | null;
}) {
  const reduced = useReducedMotion();
  const pathname = usePathname();
  const modo = modoDePagina(pathname);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([saludo(0, copy)]);
  const [ficha, setFicha] = useState<Ficha>({});
  const [grande, setGrande] = useState(false);
  const celular = useCelular();
  const teclado = useTeclado(open && celular);
  const host = useHostPanel(pathname);
  const embebido = Boolean(host);
  /** El chat está a la vista: abierto como flotante o adentro de la columna. */
  const visible = open || embebido;
  const nextId = useRef(1);
  const spriteBtn = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  /** Quién tenía el foco al abrir el chat: ahí vuelve al cerrarlo. */
  const abridor = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (open) return;
    const guardar = () => {
      if (document.activeElement instanceof HTMLElement && document.activeElement !== document.body) abridor.current = document.activeElement;
    };
    document.addEventListener("focusin", guardar);
    return () => document.removeEventListener("focusin", guardar);
  }, [open]);

  // La charla sobrevive a una recarga o a ir y volver de `/demo` (solo en
  // esta pestaña: `sessionStorage`). Se lee en el primer frame.
  const restaurada = useRef(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const s = leerSesion();
      restaurada.current = true;
      if (!s) return;
      setMsgs(s.msgs);
      setFicha(s.ficha);
      nextId.current = Math.max(...s.msgs.map((m) => m.id)) + 1;
    });
    return () => cancelAnimationFrame(raf);
  }, []);
  useEffect(() => {
    if (!restaurada.current || busy) return;
    if (msgs.some((m) => m.role === "user")) guardarSesion({ msgs, ficha });
  }, [msgs, ficha, busy]);

  const reiniciar = useCallback(() => {
    borrarSesion();
    setMsgs([saludo(nextId.current++, copy)]);
    setFicha({});
    inputRef.current?.focus();
  }, [copy]);

  // Tanda P3-1: al abrir el chat, Malejo saluda una vez (el flotante en
  // escritorio y la cara del encabezado). Con movimiento reducido, nada.
  const spriteFlotante = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return;
    // Tanda P3-4: si el chat se abre antes de que salga el recorrido de bienvenida, ya no sale.
    window.dispatchEvent(new CustomEvent(CHAT_ABIERTO_EVENT));
    const raf = requestAnimationFrame(() => {
      void reproducir(spriteFlotante.current?.querySelector("[data-sprite]"), "saludo");
    });
    return () => cancelAnimationFrame(raf);
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
    setGrande(false);
    // El foco vuelve al sprite si se ve; si no (celular, Soluciones), a quien abrió el chat.
    if (spriteBtn.current?.offsetParent) spriteBtn.current.focus();
    else if (abridor.current?.isConnected && abridor.current.offsetParent) abridor.current.focus();
    else document.querySelector<HTMLElement>("[data-malejo-abrir]")?.focus();
  }, []);

  useEffect(() => {
    if (!open || embebido) return;
    // En el celular a media pantalla no se abre el teclado solo: se lee la bienvenida.
    if (!celular) inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close, celular, embebido]);

  // La hoja a media pantalla avisa su alto: la barra del armado queda encima.
  const media = open && celular && !grande && !teclado;
  useEffect(() => {
    const html = document.documentElement;
    html.style.setProperty("--malejo-hoja", media ? MEDIA_HOJA : "0px");
    return () => html.style.setProperty("--malejo-hoja", "0px");
  }, [media]);

  /* ─── Scroll al leer (Fase 5 bis) ─── */
  const abajo = useRef(true);
  const leido = useRef(-1);
  const onScroll = () => {
    const el = listRef.current;
    if (el) abajo.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
  };
  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el || !visible) return;
    const ultimo = msgs[msgs.length - 1];
    if (!ultimo) return;
    if (ultimo.role === "user") {
      el.scrollTo({ top: el.scrollHeight });
      abajo.current = true;
      return;
    }
    const tieneAlgo = Boolean(ultimo.text.trim() || ultimo.cards.length);
    if (ultimo.id !== leido.current && tieneAlgo) {
      // Un mensaje nuevo de Malejo: desde su primera línea.
      leido.current = ultimo.id;
      const nodo = el.querySelector<HTMLElement>(`[data-msg="${ultimo.id}"]`);
      if (nodo && !ultimo.saludo) {
        el.scrollTo({ top: Math.max(0, nodo.offsetTop - 12) });
        abajo.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
        return;
      }
    }
    if (abajo.current) el.scrollTo({ top: el.scrollHeight });
  }, [msgs, visible]);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || busy) return;
      const user: Msg = { id: nextId.current++, role: "user", text: content, cards: [] };
      const bot: Msg = { id: nextId.current++, role: "assistant", text: "", cards: [] };
      const history = armarHistorial([...msgs, user]);
      const shownCards = firmasMostradas(msgs);
      setMsgs((m) => [...m, user, bot]);
      setInput("");
      setBusy(true);
      // Embudo (Vercel Analytics): solo conteos, nunca el texto.
      track("chat_mensaje", { n: msgs.filter((m) => m.role === "user").length + 1 });

      const patch = (fn: (m: Msg) => Msg) => setMsgs((all) => all.map((m) => (m.id === bot.id ? fn(m) : m)));
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          // El armado va como la ficha: el servidor lo valida y no lo guarda.
          body: JSON.stringify({ messages: history, ficha, shownCards, pagina: location.pathname, armado: leer(), kitEnviado: kitEnviado() }),
        });
        if (!res.ok || !res.body) throw new Error(String(res.status));
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.trim()) continue;
            const ev = JSON.parse(line) as { type: string; text?: string; card?: Card; ficha?: Ficha };
            if ((ev.type === "text" || ev.type === "error") && ev.text) patch((m) => conTexto(m, ev.text!));
            if (ev.type === "card" && ev.card) {
              patch((m) => conCard(m, ev.card!));
              track("chat_tarjeta", { tipo: ev.card.kind });
            }
            if (ev.type === "ficha" && ev.ficha) setFicha((f) => mergeFicha(f, ev.ficha!));
          }
        }
      } catch {
        patch((m) =>
          conCard(m.text ? m : conTexto(m, copy.errorText), { kind: "whatsapp", href: waLink(mensajeWhatsApp(ficha, ultimaQuote(msgs))) }),
        );
      } finally {
        setBusy(false);
      }
    },
    [busy, msgs, ficha, copy.errorText],
  );

  // Pedido de `AbrirChat`: abre y, si trae tema, lo manda como primer
  // mensaje (sin las opciones de la bienvenida). El estado se escribe en el
  // primer frame (no en el cuerpo del efecto) y el pedido se marca atendido
  // recién ahí: con StrictMode el efecto corre dos veces y el primer frame
  // se cancela.
  const sendRef = useRef(send);
  useEffect(() => {
    sendRef.current = send;
  });
  const atendido = useRef(0);
  useEffect(() => {
    if (!pedido || pedido.n === atendido.current) return;
    const raf = requestAnimationFrame(() => {
      atendido.current = pedido.n;
      setOpen(true);
      // Adentro de la columna no hay ventana que abrir: el foco va al campo.
      if (document.getElementById(MALEJO_PANEL_ID)?.offsetParent) requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
      track("chat_abierto", { origen: pedido.tema ? "tema" : "boton" });
      if (pedido.tema) {
        setMsgs((ms) => (ms.some((x) => x.role === "user") ? ms : ms.map((x) => (x.saludo ? { ...x, sinOpciones: true } : x))));
        sendRef.current(pedido.tema);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [pedido]);

  const sinMensajes = !msgs.some((m) => m.role === "user");
  const opciones = modo === "armado" ? copy.chipsArmado : copy.chips;

  // Un solo formato para "Hablar con Mauro" y el error: la ficha (con el
  // armado) y la última cotización mostrada (`lib/agencia/chat/whatsapp.ts`).
  const waHref = waLink(mensajeWhatsApp(ficha, ultimaQuote(msgs)));

  // Tanda P3-1: en espera, el idle; mientras escribe, pensando; con una
  // tarjeta o sugerencia a la vista, ok.
  const ultimo = msgs[msgs.length - 1];
  const pose: Pose = open && busy ? "pensando" : open && ultimo?.role === "assistant" && ultimo.cards.length ? "ok" : "normal";
  const completa = celular && (grande || teclado);

  // El chat en sí: igual como flotante, como hoja en el celular o adentro de la columna de Soluciones.
  const cuerpo = (
    <>
      {celular ? (
        <button
          type="button"
          onClick={() => setGrande((g) => !g)}
          aria-label={grande ? copy.header.achicar : copy.header.expandir}
          className="flex h-4 flex-none items-center justify-center pt-1.5"
        >
          <span aria-hidden="true" className="block h-1.5 w-10 rounded-full bg-border-h" />
        </button>
      ) : null}
      <ChatHeader
        copy={copy}
        // Adentro de la columna no se cierra: se cambia de pestaña.
        onClose={embebido ? undefined : close}
        waHref={waHref}
        onRestart={sinMensajes ? undefined : reiniciar}
        expandir={celular ? { grande, toggle: () => setGrande((g) => !g) } : undefined}
      />

      <div ref={listRef} onScroll={onScroll} className="scroll-fino flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-3 py-2.5 max-[379px]:py-1.5 min-[760px]:px-4 min-[760px]:py-3" aria-live="polite">
        {msgs.map((msg) => {
          const ultimo = msg.id === msgs[msgs.length - 1]?.id;
          return msg.saludo ? (
            <Bienvenida
              key={msg.id}
              id={msg.id}
              copy={copy}
              opciones={msg.sinOpciones ? [] : opciones}
              activas={ultimo && !busy}
              onOpcion={(t) => {
                track("chat_opcion", { origen: "bienvenida" });
                send(t);
              }}
            />
          ) : (
            <MessageView
              key={msg.id}
              msg={msg}
              copy={copy}
              turnstileSiteKey={turnstileSiteKey}
              enSoluciones={modo === "armado"}
              // Las respuestas sugeridas solo se pueden tocar en el último mensaje.
              onOpcion={
                !busy && ultimo
                  ? (t) => {
                      track("chat_opcion");
                      send(t);
                    }
                  : undefined
              }
            />
          );
        })}
        {busy && !msgs[msgs.length - 1]?.text && !msgs[msgs.length - 1]?.cards.length ? (
          <div className="flex items-center gap-2 pl-10" aria-label={copy.typing} role="status">
            {[0, 1, 2].map((i) => (
              <span key={i} className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" />
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-none flex-col gap-1.5 border-t border-border px-3 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2.5 min-[760px]:gap-2 min-[760px]:px-4 min-[760px]:pb-3 min-[760px]:pt-3">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <label htmlFor="malejo-input" className="sr-only">
            {copy.inputLabel}
          </label>
          <input
            id="malejo-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={2000}
            autoComplete="off"
            placeholder={copy.placeholder}
            className="h-11 min-w-0 flex-1 rounded-14 border border-border bg-bg px-3.5 text-[16px] shadow-inset placeholder:text-muted focus:outline-none focus-visible:outline-2 focus-visible:outline-acc-text min-[760px]:text-[15px]"
          />
          <button type="submit" aria-label={copy.send} disabled={busy || !input.trim()} className="btn btn-p h-11 w-11 flex-none rounded-14 p-0 disabled:opacity-60">
            <Icon name="send" size={18} />
          </button>
        </form>
        <p className="m-0 text-[11px] leading-snug text-muted">
          {copy.privacy}{" "}
          <Link href="/legal/privacidad" className="text-acc-text underline underline-offset-2">
            {copy.privacyLink}
          </Link>
        </p>
      </div>
    </>
  );

  return (
    <LazyMotion features={domAnimation}>
      <div className="pointer-events-none fixed bottom-3 right-3 z-[60] flex items-end gap-3 min-[760px]:bottom-0 min-[760px]:right-7">
        <AnimatePresence>
          {open && !embebido ? (
            <m.div
              key="chat"
              role="dialog"
              aria-labelledby="malejo-chat-title"
              initial={reduced ? false : celular ? { y: "100%" } : { opacity: 0, scale: 0.96 }}
              animate={celular ? { y: 0 } : { opacity: 1, scale: 1 }}
              exit={reduced ? { opacity: 0 } : celular ? { y: "100%" } : { opacity: 0, scale: 0.96 }}
              transition={celular && !reduced ? { type: "spring", stiffness: 420, damping: 38, mass: 0.9 } : { duration: 0.22, ease: "easeOut" }}
              style={{ transformOrigin: "100% 100%", ...(celular ? { height: completa ? "100dvh" : MEDIA_HOJA } : {}) }}
              className={`card panel-madera pointer-events-auto fixed inset-x-0 bottom-0 z-[75] flex flex-col overflow-hidden overscroll-contain min-[760px]:static min-[760px]:z-auto min-[760px]:mb-[18px] min-[760px]:h-[min(600px,calc(100vh-110px))] min-[760px]:w-[380px] min-[760px]:rounded-24 ${
                completa ? "rounded-none" : "rounded-b-none rounded-t-24"
              }`}
            >
              {cuerpo}
            </m.div>
          ) : null}
        </AnimatePresence>

        {/* Soluciones desde 760 px: el mismo chat, adentro de la pestaña "Malejo" de la columna. */}
        {host
          ? createPortal(
              <div role="region" aria-labelledby="malejo-chat-title" className="pointer-events-auto flex min-h-0 flex-1 flex-col">
                {cuerpo}
              </div>,
              host,
            )
          : null}

        {/*
          El sprite flotante, desde 760 px: en el celular, Malejo está en la barra
          inferior. En Soluciones tampoco va: pisaría el carrito, que ya tiene
          "Preguntale a Malejo" (y el header, "Hablá con Malejo").
        */}
        <button
          ref={spriteBtn}
          type="button"
          aria-label={open ? copy.close : copy.open}
          aria-expanded={open}
          onClick={() => {
            if (open) return close();
            setOpen(true);
            track("chat_abierto", { origen: "flotante" });
          }}
          className={`pointer-events-auto hidden flex-col items-center gap-1 rounded-lg ${modo === "armado" ? "" : "min-[760px]:flex"}`}
        >
          <span className="lbl rounded-7 bg-acc px-[7px] py-1 text-[10px] font-semibold text-acc-ink shadow-btn">{open ? copy.chipOpen : copy.chip}</span>
          <span key={pose} ref={spriteFlotante} className="sprite-fundido inline-flex">
            <Sprite pose={pose} alto={120} alt="" animaciones={["saludo"]} />
          </span>
        </button>
      </div>
    </LazyMotion>
  );
}

/**
 * La cara de Malejo (tanda P3-4: `CaraMalejo`, recortada por la caja `cara`
 * de cada dibujo). En el encabezado es un botón que pasa al dibujo siguiente.
 */
function Avatar({ size, cambiar }: { size: 32 | 40; cambiar?: string }) {
  const radio = size === 40 ? "rounded-13" : "rounded-11";
  const caja = `inline-flex flex-none ${radio}`;
  const sprite = <CaraMalejo tamano={size} className={`bg-ic-bg ${radio}`} />;
  if (!cambiar) return sprite;
  return (
    <button
      type="button"
      data-avatar-malejo=""
      className={caja}
      aria-label={cambiar}
      title={cambiar}
      onClick={() => {
        const sig = dibujoSiguiente();
        elegirDibujo(sig);
        track("personaje_cambiado", { dibujo: sig });
      }}
    >
      {sprite}
    </button>
  );
}

function rich(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part,
  );
}


function ChatHeader({
  copy,
  onClose,
  waHref,
  onRestart,
  expandir,
}: {
  copy: MalejoCopy;
  onClose?: () => void;
  waHref: string;
  onRestart?: () => void;
  /** Celular: agrandar a pantalla completa o volver a media pantalla. */
  expandir?: { grande: boolean; toggle: () => void };
}) {
  return (
    <div className="flex flex-none items-center gap-2.5 border-b border-border px-4 py-2 max-[379px]:py-1 min-[760px]:gap-3 min-[760px]:py-3">
      <Avatar size={40} cambiar={copy.header.cambiarDibujo} />
      <div className="min-w-0 flex-1">
        <div id="malejo-chat-title" className="h flex items-center gap-1.5 text-[17px]">
          {copy.header.name}
          <span className="inline-block h-2 w-2 rounded-full bg-ok" aria-hidden="true" />
        </div>
        <div className="truncate text-xs text-muted">{copy.header.status}</div>
      </div>
      {onRestart ? (
        <button type="button" className="ibtn h-11 w-11 rounded-xl min-[760px]:h-9 min-[760px]:w-9" aria-label={copy.header.restart} title={copy.header.restart} onClick={onRestart}>
          <span aria-hidden="true" className="text-[17px] leading-none">↺</span>
        </button>
      ) : null}
      {/* "Hablar con Mauro" (Fase 5 bis): texto en escritorio, ícono en el celular. */}
      <a
        href={waHref}
        target="_blank"
        rel="noopener"
        onClick={() => track("chat_clic", { destino: "whatsapp" })}
        className="ibtn h-11 w-11 flex-none gap-1.5 rounded-xl text-acc-text min-[760px]:h-9 min-[760px]:w-auto min-[760px]:px-2.5 min-[760px]:text-[13px] min-[760px]:font-semibold"
        aria-label={copy.header.whatsapp}
        title={copy.header.whatsappTip}
      >
        <Icon name="whatsapp" size={18} />
        <span className="hidden min-[760px]:inline">{copy.header.mauro}</span>
      </a>
      {expandir ? (
        <button
          type="button"
          className="ibtn h-11 w-11 rounded-xl"
          aria-label={expandir.grande ? copy.header.achicar : copy.header.expandir}
          aria-pressed={expandir.grande}
          onClick={expandir.toggle}
        >
          <Icon name="expand" size={16} />
        </button>
      ) : null}
      {onClose ? (
        <button type="button" className="ibtn h-11 w-11 rounded-xl min-[760px]:h-9 min-[760px]:w-9" aria-label={copy.header.close} onClick={onClose}>
          <Icon name="close" size={16} />
        </button>
      ) : null}
    </div>
  );
}

const OPCIONES_VARIANTES = {
  oculto: {},
  visible: { transition: { staggerChildren: 0.04 } },
};
const OPCION_VARIANTES = {
  oculto: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.18 } },
};

/**
 * La bienvenida (Fase 5 bis): una burbuja de Malejo con el saludo, una línea
 * chica y las opciones **adentro**, en grilla. Las opciones entran
 * escalonadas (40 ms, `data-reveal`); con movimiento reducido, sin animación.
 * Se tocan solo mientras la bienvenida es el último mensaje; después quedan
 * en gris con `aria-disabled`.
 */
function Bienvenida({
  id,
  copy,
  opciones,
  activas,
  onOpcion,
}: {
  id: number;
  copy: MalejoCopy;
  opciones: OpcionBienvenida[];
  activas: boolean;
  onOpcion: (texto: string) => void;
}) {
  const reduced = useReducedMotion();
  return (
    // Sin avatar al lado (ya está en el encabezado): la burbuja gana ancho y las opciones entran en la hoja.
    <div data-msg={id} className="flex">
      <div className="min-w-0 flex-1 burbuja-malejo border border-border bg-surf-2 px-3 py-2.5 text-sm leading-[1.45] max-[379px]:px-2.5 max-[379px]:py-2 max-[379px]:text-[13px]">
        <p className="saludo-malejo m-0">{copy.greeting}</p>
        {opciones.length ? (
          <>
            <p className="m-0 mt-0.5 text-[12px] text-muted">{copy.greetingHint}</p>
            <m.div
              role="group"
              aria-label={copy.chipsLabel}
              variants={OPCIONES_VARIANTES}
              initial={reduced ? false : "oculto"}
              animate="visible"
              className="mt-2 grid grid-cols-2 gap-1.5 max-[339px]:grid-cols-1"
            >
              {opciones.map((o, i) => (
                <m.button
                  key={o.text}
                  type="button"
                  data-reveal
                  variants={OPCION_VARIANTES}
                  aria-disabled={!activas || undefined}
                  onClick={() => activas && onOpcion(o.text)}
                  className={`opcion-tono tono-${[1, 2, 3, 3, 1, 2][i % 6]} flex min-h-11 items-center gap-1.5 rounded-12 border border-border bg-surf px-2 py-1 text-left text-[14px] font-medium leading-[1.2] ${
                    activas ? "hover:border-border-h" : "cursor-default opacity-50"
                  }`}
                >
                  <Icon name={o.icon} size={15} className="flex-none text-acc-text" />
                  <span className="line-clamp-2 min-w-0 min-[760px]:line-clamp-3">{o.text}</span>
                </m.button>
              ))}
            </m.div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function MessageView({
  msg,
  copy,
  turnstileSiteKey,
  enSoluciones,
  onOpcion,
}: {
  msg: Msg;
  copy: MalejoCopy;
  turnstileSiteKey?: string;
  enSoluciones: boolean;
  onOpcion?: (texto: string) => void;
}) {
  if (msg.role === "user") {
    return (
      <div data-msg={msg.id} className="max-w-[80%] self-end whitespace-pre-wrap burbuja-yo bg-ic-bg px-[13px] py-2.5 text-sm leading-[1.45] text-user-text">
        {msg.text}
      </div>
    );
  }
  const segs: Seg[] = (msg.segs ?? [{ t: "text", text: msg.text }, ...msg.cards.map((card) => ({ t: "card" as const, card }))]).filter(
    (s) => (s.t === "card" ? true : s.text.trim()),
  );
  if (!segs.length) return null;
  return (
    <div data-msg={msg.id} className="flex items-end gap-2">
      <Avatar size={32} />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        {segs.map((s, i) =>
          s.t === "text" ? (
            <div
              key={i}
              className="self-start whitespace-pre-wrap burbuja-malejo border border-border bg-surf-2 px-[13px] py-2.5 text-sm leading-[1.45]"
            >
              {rich(s.text.trim())}
            </div>
          ) : s.card.kind === "opciones" ? (
            // Las respuestas sugeridas: tocables solo en el último mensaje; después, en gris.
            <div key={i} role="group" aria-label={copy.opcionesLabel} className="flex flex-wrap gap-2">
              {s.card.opciones.map((o) => (
                <button
                  key={o}
                  type="button"
                  aria-disabled={!onOpcion || undefined}
                  className={`chip h-auto min-h-11 py-1.5 text-left ${onOpcion ? "" : "cursor-default opacity-50"}`}
                  onClick={() => onOpcion?.(o)}
                >
                  {o}
                </button>
              ))}
            </div>
          ) : s.card.kind === "armado" ? (
            <ArmadoCard key={i} card={s.card} copy={copy} enSoluciones={enSoluciones} />
          ) : (
            <CardView key={i} card={s.card} copy={copy} turnstileSiteKey={turnstileSiteKey} />
          ),
        )}
      </div>
    </div>
  );
}

/**
 * La sugerencia de `sugerir_armado` (tanda P2, D5): cada ítem con su precio,
 * el porqué y "Agregar al armado". **El clic es de la persona**: emite
 * `malejo:armado` con `origen: "malejo"` y el carrito lo marca "Sugerido por
 * Malejo". Fuera de Soluciones, un solo botón: "Abrir en Soluciones".
 */
function ArmadoCard({ card, copy, enSoluciones }: { card: Extract<Card, { kind: "armado" }>; copy: MalejoCopy; enSoluciones: boolean }) {
  const armado = useArmado();
  const esta = (id: string) => armado.items.some((i) => i.id === id) || armado.extras.includes(id);
  return (
    <div className="card hi flex flex-col gap-2 rounded-18 p-3.5">
      <span className="lbl lbl-o text-[10px]">{copy.armado.label}</span>
      <ul className="m-0 flex list-none flex-col p-0">
        {card.items.map((it) => (
          <li key={it.id} className="flex flex-col gap-1 border-t border-border py-2.5 first:border-t-0 first:pt-0.5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-2">
              <span className="h text-[15px]">{it.nombre}</span>
              <span className="text-[12px] text-muted">{it.precio}</span>
            </div>
            <p className="m-0 text-[13px] leading-snug text-muted">{it.porque}</p>
            {enSoluciones ? (
              esta(it.id) ? (
                <span className="inline-flex min-h-11 items-center text-[13px] font-semibold text-ok-text">{copy.armado.agregado}</span>
              ) : (
                <button
                  type="button"
                  className="btn btn-p btn-sm min-h-11 self-start"
                  onClick={() => {
                    emitir({ accion: "agregar", id: it.id, origen: "malejo" }, (x) => ({ id: x, tipo: it.tipo }));
                    track("armado_sugerencia_aceptada", { id: it.id });
                    track("armado_agregar", { origen: "malejo", id: it.id });
                    vibrar();
                  }}
                >
                  {copy.armado.agregar}
                </button>
              )
            ) : null}
          </li>
        ))}
      </ul>
      {enSoluciones ? null : (
        <Link href={card.href} onClick={() => track("chat_clic", { destino: "soluciones" })} className="btn btn-p btn-sm min-h-11 w-full">
          {copy.armado.abrir}
        </Link>
      )}
    </div>
  );
}

function CardView({
  card,
  copy,
  turnstileSiteKey,
}: {
  card: Card;
  copy: MalejoCopy;
  turnstileSiteKey?: string;
}) {
  if (card.kind === "quote") {
    return (
      <div className="card hi flex flex-col gap-2 rounded-18 p-3.5">
        <div className="flex justify-between">
          <span className="lbl lbl-o text-[10px]">{copy.quote.label}</span>
          <span className="lbl text-[10px]">{card.medio === "mp" ? copy.quote.mpLabel : copy.quote.listLabel}</span>
        </div>
        <div className="h text-[17px]">{card.titulo}</div>
        <div className="flex flex-wrap items-baseline gap-1.5">
          {card.desde ? <span className="text-sm text-muted">{copy.quote.from}</span> : null}
          <span className="h text-[26px]">{fmt(card.implementacion)}</span>
          {card.mensual ? (
            <span className="text-[13px] text-muted">
              + {fmt(card.mensual)}
              {copy.quote.perMonth}
            </span>
          ) : null}
          {card.anual ? (
            <span className="text-[13px] text-muted">
              + {fmt(card.anual)}
              {copy.quote.perYear}
            </span>
          ) : null}
        </div>
        {/* Tanda P1: "o 3 pagos de $X sin interés", escrita en el servidor. Naranja de texto: no es la acción. */}
        {card.pagos ? <p className="m-0 text-[13px] font-semibold text-acc-text">{card.pagos}</p> : null}
        {card.usd ? (
          <p className="m-0 text-[13px] text-muted">
            ≈ {fmtUsd(card.usd.implementacion)}
            {card.usd.mensual ? ` + ${fmtUsd(card.usd.mensual)}${copy.quote.perMonth}` : ""} · {copy.quote.usd}
          </p>
        ) : null}
        {card.aCotizar.map((t) => (
          <p key={t} className="m-0 text-[13px] text-muted">
            + {t}
          </p>
        ))}
        <Link href={card.demoHref} onClick={() => track("chat_clic", { destino: "demo" })} className="btn btn-p btn-sm w-full">
          {card.sena?.tipo === "plan-escrito"
            ? copy.quote.planEscrito.replace("{SENA}", fmt(card.sena.monto))
            : card.sena?.tipo === "sin-cargo"
              ? copy.quote.demoSinCargo
              : card.sena
                ? copy.quote.demo.replace("{SENA}", fmt(card.sena.monto))
                : copy.quote.demoSolo}
        </Link>
      </div>
    );
  }
  if (card.kind === "compare") return <CompareCard card={card} copy={copy} />;
  if (card.kind === "proyectos") {
    return (
      <div className="card flex flex-col gap-2 rounded-18 p-3.5">
        <span className="lbl lbl-o text-[10px]">{copy.proyectos.label}</span>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {card.items.map((p) => (
            <li key={p.nombre}>
              <a href={p.href} target="_blank" rel="noopener" className="flex flex-col rounded-xl border border-border px-3 py-2 hover:border-border-h">
                <span className="text-sm font-semibold">{p.nombre} ↗</span>
                <span className="line-clamp-2 text-[12px] leading-snug text-muted">{p.que}</span>
              </a>
            </li>
          ))}
        </ul>
        <Link href={card.portfolio.href} className="btn btn-s btn-sm w-full">
          {copy.proyectos.portfolio}
        </Link>
      </div>
    );
  }
  if (card.kind === "demo") {
    return (
      <div className="card hi flex flex-col gap-2 rounded-18 p-3.5">
        <span className="lbl lbl-o text-[10px]">{copy.demo.label}</span>
        <Link href={card.demoHref} onClick={() => track("chat_clic", { destino: "demo" })} className="btn btn-p btn-sm w-full">
          {copy.demo.demo}
        </Link>
        <a href={card.agendaHref} target="_blank" rel="noopener" className="btn btn-s btn-sm w-full">
          {copy.demo.agenda}
        </a>
      </div>
    );
  }
  if (card.kind === "whatsapp") {
    return (
      <a href={card.href} target="_blank" rel="noopener" onClick={() => track("chat_clic", { destino: "whatsapp" })} className="btn btn-s btn-sm self-start">
        <Icon name="chat" size={16} />
        {copy.whatsapp.cta}
      </a>
    );
  }
  if (card.kind === "opciones" || card.kind === "armado") return null;
  if (card.kind === "formContacto") return <ContactFormCard card={card} copy={copy} turnstileSiteKey={turnstileSiteKey} />;
  return <ConsentCard card={card} copy={copy} turnstileSiteKey={turnstileSiteKey} />;
}

/**
 * Alternativas lado a lado (`comparar`): una fila por opción y **ningún
 * total**. Misma familia visual que la tarjeta de cotización (DISENO.md §5).
 */
function CompareCard({ card, copy }: { card: Extract<Card, { kind: "compare" }>; copy: MalejoCopy }) {
  return (
    <div className="card hi flex flex-col gap-2 rounded-18 p-3.5">
      <div className="flex justify-between gap-2">
        <span className="lbl lbl-o text-[10px]">{copy.compare.label}</span>
        <span className="lbl text-[10px]">{card.medio === "mp" ? copy.quote.mpLabel : copy.quote.listLabel}</span>
      </div>
      <p className="m-0 text-[12px] text-muted">{copy.compare.hint}</p>
      <ul className="m-0 flex list-none flex-col p-0">
        {card.filas.map((f) => (
          <li key={f.id} className="flex flex-col gap-1 border-t border-border py-2.5 first:border-t-0 first:pt-1">
            <div className="flex items-start justify-between gap-2">
              <span className="h text-[15px]">{f.nombre}</span>
              {f.recomendado ? <span className="tag flex-none text-[10px]">{copy.compare.recommended}</span> : null}
            </div>
            <div className="flex flex-wrap items-baseline gap-1.5">
              {f.precio == null ? (
                <span className="text-sm font-semibold">{f.texto}</span>
              ) : (
                <>
                  {f.tipo === "desde" ? <span className="text-[12px] text-muted">{copy.quote.from}</span> : null}
                  <span className="h text-[19px]">{fmt(f.precio)}</span>
                  {f.unidad === "/mes" ? <span className="text-[12px] text-muted">{copy.compare.perMonth}</span> : null}
                </>
              )}
              {f.abono ? (
                <span className="text-[12px] text-muted">
                  + {fmt(f.abono)}
                  {copy.compare.perMonth}
                </span>
              ) : null}
              {f.plazo ? <span className="text-[12px] text-muted">· ⏱ {f.plazo}</span> : null}
            </div>
            {f.pagos ? <span className="text-[12px] font-semibold text-acc-text">{f.pagos}</span> : null}
            {f.usd ? (
              <span className="text-[12px] text-muted">
                ≈ {fmtUsd(f.usd.precio)}
                {f.usd.abono ? ` + ${fmtUsd(f.usd.abono)}${copy.compare.perMonth}` : ""}
              </span>
            ) : null}
            {f.paraQuien ? <span className="text-[12px] leading-snug text-muted">{f.paraQuien}</span> : null}
            {f.alt ? (
              <span className="text-[12px] leading-snug text-muted">
                {copy.compare.alt} {f.alt}
              </span>
            ) : null}
            <Link href={`/demo?plan=${encodeURIComponent(f.id)}`} className="lnk self-start text-[13px]">
              {copy.compare.choose} →
            </Link>
          </li>
        ))}
      </ul>
      {card.tipoDeCambio ? <p className="m-0 text-[11px] text-muted">{copy.compare.usd}</p> : null}
    </div>
  );
}

/**
 * Casilla de consentimiento. Sin la casilla marcada no se manda nada; con
 * ella, el pedido firmado va a `/api/contacto`, que vuelve a verificar todo.
 */
function ConsentCard({
  card,
  copy,
  turnstileSiteKey,
}: {
  card: Extract<Card, { kind: "consent" }>;
  copy: MalejoCopy;
  turnstileSiteKey?: string;
}) {
  const [checked, setChecked] = useState(false);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");
  const [captcha, setCaptcha] = useState<string>();
  const box = useRef<HTMLDivElement>(null);

  useTurnstile(turnstileSiteKey, box, setCaptcha);

  const save = async () => {
    if (!checked) {
      setError(copy.consent.needCheck);
      return;
    }
    setState("saving");
    setError("");
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ consent: true, token: card.token, payload: card.payload, turnstile: captcha }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) throw new Error(data.error);
      setState("saved");
      track("chat_contacto_guardado");
    } catch (e) {
      setState("error");
      setError((e as Error).message || copy.errorText);
    }
  };

  if (state === "saved") {
    return (
      <div role="status" className="card rounded-18 p-3.5 text-sm">
        {copy.consent.saved}
      </div>
    );
  }

  return (
    <div className="card hi flex flex-col gap-2.5 rounded-18 p-3.5 text-sm">
      <span className="lbl lbl-o text-[10px]">{copy.consent.label}</span>
      <p className="m-0 text-[13px] text-muted">
        {card.payload.nombre} · {card.payload.whatsapp} · {card.payload.rubro}
      </p>
      <label className="flex cursor-pointer items-start gap-2">
        <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-0.5 h-4 w-4 accent-(--acc)" />
        <span>
          {copy.consent.check}.{" "}
          <Link href="/legal/privacidad" className="text-acc-text underline underline-offset-2">
            {copy.consent.privacy}
          </Link>
        </span>
      </label>
      <div ref={box} />
      {error ? (
        <p role="alert" className="m-0 text-[13px] text-acc-text">
          {error}
        </p>
      ) : null}
      <button type="button" onClick={save} disabled={state === "saving"} className="btn btn-p btn-sm w-full disabled:opacity-60">
        {state === "saving" ? copy.consent.saving : copy.consent.save}
      </button>
    </div>
  );
}

/**
 * Formulario de contacto (`pedir_contacto`, tanda R3): la persona escribe
 * nombre y WhatsApp y marca la casilla; el ticket firmado (rubro y
 * resumen de la ficha) va con el envío. Sin la casilla no se manda nada.
 */
function ContactFormCard({
  card,
  copy,
  turnstileSiteKey,
}: {
  card: Extract<Card, { kind: "formContacto" }>;
  copy: MalejoCopy;
  turnstileSiteKey?: string;
}) {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");
  const [captcha, setCaptcha] = useState<string>();
  const box = useRef<HTMLDivElement>(null);
  useTurnstile(turnstileSiteKey, box, setCaptcha);
  const f = copy.form;

  const enviar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const nombre = String(data.get("nombre") ?? "").trim();
    const whatsapp = String(data.get("whatsapp") ?? "").trim();
    if (!data.get("consent")) return setError(f.needCheck);
    if (nombre.length < 2 || whatsapp.replace(/\D/g, "").length < 10) return setError(f.invalid);
    setState("saving");
    setError("");
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ consent: true, ticket: card.ticket, token: card.token, nombre, whatsapp, turnstile: captcha }),
      });
      const r = (await res.json()) as { ok: boolean; error?: string };
      if (!r.ok) throw new Error(r.error);
      setState("saved");
      track("chat_contacto_guardado", { via: "formulario" });
    } catch (err) {
      setState("error");
      setError((err as Error).message || copy.errorText);
    }
  };

  if (state === "saved") {
    return (
      <div role="status" className="card rounded-18 p-3.5 text-sm">
        {f.saved}
      </div>
    );
  }
  const campo = "h-11 w-full rounded-12 border border-border-2 bg-bg px-3 text-[15px] text-text";
  return (
    <form onSubmit={enviar} className="card hi flex flex-col gap-2.5 rounded-18 p-3.5 text-sm">
      <span className="lbl lbl-o text-[10px]">{f.label}</span>
      <label className="flex flex-col gap-1">
        <span className="text-[13px] font-semibold">{f.nombre}</span>
        <input name="nombre" autoComplete="name" maxLength={80} className={campo} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[13px] font-semibold">{f.whatsapp}</span>
        <input name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" maxLength={30} className={campo} />
      </label>
      <label className="flex min-h-11 cursor-pointer items-center gap-2.5">
        <input type="checkbox" name="consent" className="h-5 w-5 flex-none accent-(--acc)" />
        <span>
          {f.check}.{" "}
          <Link href="/legal/privacidad" className="text-acc-text underline underline-offset-2">
            {f.privacy}
          </Link>
        </span>
      </label>
      <div ref={box} />
      {error ? (
        <p role="alert" className="m-0 text-[13px] text-acc-text">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={state === "saving"} className="btn btn-p btn-sm min-h-11 w-full disabled:opacity-60">
        {state === "saving" ? f.saving : f.save}
      </button>
    </form>
  );
}
