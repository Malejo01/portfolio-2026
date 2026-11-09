"use client";

import { track } from "@vercel/analytics";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/agencia/icons";
import type { MalejoCopy } from "@/content/agencia/malejo";
import type { Card } from "@/lib/agencia/chat/cards";
import { mergeFicha, type Ficha } from "@/lib/agencia/chat/ficha";
import { armarHistorial, firmasMostradas, ultimaQuote } from "@/lib/agencia/chat/history";
import { borrarSesion, guardarSesion, leerSesion } from "@/lib/agencia/chat/sesion";
import { mensajeWhatsApp } from "@/lib/agencia/chat/whatsapp";
import { waLink } from "@/lib/agencia/config";
import { fmt, fmtUsd } from "@/lib/agencia/format";
import { useTurnstile } from "./turnstile";

/**
 * El flotante de Malejo (DISENO.md §5, `11-flotante-*.png`): sprite-botón y
 * ventana de chat. Lo carga `MalejoLoader` con `next/dynamic` (`ssr: false`)
 * cuando el navegador está libre o cuando un botón `AbrirChat` lo pide
 * (`pedido`), así que no pesa en el primer render.
 *
 * Tanda R2: Malejo es el asesor principal. Arranca con chips por problema
 * (hasta el primer mensaje) y, si se abrió con un tema, ese tema sale ya
 * enviado como primer mensaje. El toast del portfolio se apagó. En celular
 * el botón es compacto: solo la cabeza del sprite.
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
 * sigue a una herramienta arriba de su tarjeta.
 */
type Msg = { id: number; role: "user" | "assistant"; text: string; cards: Card[]; segs?: Seg[] };

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

export default function MalejoWidget({
  copy,
  senaMonto,
  turnstileSiteKey,
  pedido,
}: {
  copy: MalejoCopy;
  senaMonto: number;
  turnstileSiteKey?: string;
  /** Pedido de apertura de `AbrirChat` (vía `MalejoLoader`): abrir y, si hay tema, enviarlo. */
  pedido?: { tema?: string; n: number } | null;
}) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, role: "assistant", text: copy.greeting, cards: [] }]);
  const [ficha, setFicha] = useState<Ficha>({});
  const nextId = useRef(1);
  const spriteBtn = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

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
    setMsgs([{ id: nextId.current++, role: "assistant", text: copy.greeting, cards: [] }]);
    setFicha({});
    inputRef.current?.focus();
  }, [copy.greeting]);

  const close = useCallback(() => {
    setOpen(false);
    spriteBtn.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [msgs, open]);

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
          body: JSON.stringify({ messages: history, ficha, shownCards, pagina: location.pathname }),
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
  // mensaje. El estado se escribe en el primer frame (no en el cuerpo del
  // efecto) y el pedido se marca atendido recién ahí: con StrictMode el
  // efecto corre dos veces y el primer frame se cancela.
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
      track("chat_abierto", { origen: pedido.tema ? "tema" : "boton" });
      if (pedido.tema) sendRef.current(pedido.tema);
    });
    return () => cancelAnimationFrame(raf);
  }, [pedido]);

  const sinMensajes = !msgs.some((m) => m.role === "user");

  // Un solo formato para el ícono del encabezado, la chip y el error:
  // la ficha y la última cotización mostrada (`lib/agencia/chat/whatsapp.ts`).
  const waHref = waLink(mensajeWhatsApp(ficha, ultimaQuote(msgs)));

  const pose = open && busy ? "pensando" : "ok";

  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-[60] flex items-end gap-3 sm:bottom-0 sm:right-7">
      <AnimatePresence>
        {open ? (
          <motion.div
            key="chat"
            role="dialog"
            aria-labelledby="malejo-chat-title"
            initial={reduced ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{ transformOrigin: "100% 100%" }}
            className="card pointer-events-auto fixed inset-0 z-[61] flex flex-col overflow-hidden rounded-none sm:static sm:mb-[18px] sm:h-[min(600px,calc(100vh-110px))] sm:w-[380px] sm:rounded-[24px]"
          >
            <ChatHeader copy={copy} onClose={close} waHref={waHref} onRestart={sinMensajes ? undefined : reiniciar} />

            <div ref={listRef} className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4" aria-live="polite">
              {msgs.map((m) => (
                <MessageView key={m.id} msg={m} copy={copy} senaMonto={senaMonto} turnstileSiteKey={turnstileSiteKey} />
              ))}
              {busy && !msgs[msgs.length - 1]?.text && !msgs[msgs.length - 1]?.cards.length ? (
                <div className="flex items-center gap-2 pl-10" aria-label={copy.typing} role="status">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" />
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-2.5 border-t border-border px-4 pb-3 pt-3">
              <div className="flex flex-wrap gap-2" role="group" aria-label={copy.chipsLabel}>
                {sinMensajes
                  ? copy.chips.map((c) => (
                      <button key={c} type="button" className="chip" onClick={() => send(c)} disabled={busy}>
                        {c}
                      </button>
                    ))
                  : null}
                <a href={waHref} target="_blank" rel="noopener" className="chip">
                  <Icon name="whatsapp" size={14} />
                  {copy.mauro}
                </a>
              </div>
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
                  className="h-11 min-w-0 flex-1 rounded-[14px] border border-border bg-bg px-3.5 text-[15px] shadow-inset placeholder:text-muted focus:outline-none focus-visible:outline-2 focus-visible:outline-acc-text"
                />
                <button type="submit" aria-label={copy.send} disabled={busy || !input.trim()} className="btn btn-p h-11 w-11 flex-none rounded-[14px] p-0 disabled:opacity-60">
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
          </motion.div>
        ) : null}
      </AnimatePresence>

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
        className={`breathe pointer-events-auto flex-col items-center gap-1 rounded-lg ${open ? "hidden sm:flex" : "flex"}`}
      >
        <span className="lbl hidden rounded-[7px] bg-acc px-[7px] py-1 text-[10px] font-semibold text-acc-ink shadow-btn sm:inline">
          {open ? copy.chipOpen : copy.chip}
        </span>
        {/* Celular: solo la cabeza, en una caja de 56 × 64 (no tapa tarjetas). */}
        <span className="relative inline-flex h-16 w-14 justify-center overflow-hidden rounded-[18px] border border-border bg-ic-bg shadow-card sm:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element -- recorte del sprite */}
          <img
            src={`/agencia/sprites/malejo-${pose}.png`}
            alt=""
            width={64}
            height={146}
            className="pixel mt-1 block h-[146px] w-16 max-w-none flex-none"
          />
          <span className="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full border-2 border-ic-bg bg-ok" aria-hidden="true" />
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element -- pixel art chico, sin optimizar a propósito */}
        <img
          src={`/agencia/sprites/malejo-${pose}.png`}
          alt=""
          width={54}
          height={123}
          className="pixel hidden h-[123px] w-[54px] sm:block"
        />
      </button>
    </div>
  );
}

function Avatar({ size }: { size: 32 | 40 }) {
  return (
    <span
      className={`inline-flex flex-none justify-center overflow-hidden bg-ic-bg ${size === 40 ? "h-10 w-10 rounded-[13px]" : "h-8 w-8 rounded-[11px]"}`}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- recorte del sprite */}
      <img
        src="/agencia/sprites/malejo-ok.png"
        alt=""
        width={size}
        height={size === 40 ? 91 : 73}
        className={`pixel mt-0.5 block max-w-none flex-none self-start ${size === 40 ? "h-[91px] w-10" : "h-[73px] w-8"}`}
      />
    </span>
  );
}

function ChatHeader({ copy, onClose, waHref, onRestart }: { copy: MalejoCopy; onClose: () => void; waHref: string; onRestart?: () => void }) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3">
      <Avatar size={40} />
      <div className="flex-1">
        <div id="malejo-chat-title" className="h flex items-center gap-1.5 text-[17px]">
          {copy.header.name}
          <span className="inline-block h-2 w-2 rounded-full bg-ok" aria-hidden="true" />
        </div>
        <div className="text-xs text-muted">{copy.header.status}</div>
      </div>
      {onRestart ? (
        <button type="button" className="ibtn h-9 w-9 rounded-xl" aria-label={copy.header.restart} title={copy.header.restart} onClick={onRestart}>
          <span aria-hidden="true" className="text-[17px] leading-none">↺</span>
        </button>
      ) : null}
      <a
        href={waHref}
        target="_blank"
        rel="noopener"
        onClick={() => track("chat_clic", { destino: "whatsapp" })}
        className="ibtn h-9 w-9 rounded-xl"
        aria-label={copy.header.whatsapp}
        title={copy.header.whatsappTip}
      >
        <Icon name="whatsapp" size={18} />
      </a>
      <button type="button" className="ibtn h-9 w-9 rounded-xl" aria-label={copy.header.close} onClick={onClose}>
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}

/** `**negrita**` y saltos de línea; nada más del markdown. */
function rich(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part,
  );
}

function MessageView({
  msg,
  copy,
  senaMonto,
  turnstileSiteKey,
}: {
  msg: Msg;
  copy: MalejoCopy;
  senaMonto: number;
  turnstileSiteKey?: string;
}) {
  if (msg.role === "user") {
    return (
      <div className="max-w-[80%] self-end whitespace-pre-wrap rounded-[16px_16px_6px_16px] bg-ic-bg px-[13px] py-2.5 text-sm leading-[1.45] text-user-text">
        {msg.text}
      </div>
    );
  }
  const segs: Seg[] = (msg.segs ?? [{ t: "text", text: msg.text }, ...msg.cards.map((card) => ({ t: "card" as const, card }))]).filter(
    (s) => s.t === "card" || s.text.trim(),
  );
  if (!segs.length) return null;
  return (
    <div className="flex items-end gap-2">
      <Avatar size={32} />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        {segs.map((s, i) =>
          s.t === "text" ? (
            <div
              key={i}
              className="self-start whitespace-pre-wrap rounded-[16px_16px_16px_6px] border border-border bg-surf-2 px-[13px] py-2.5 text-sm leading-[1.45]"
            >
              {rich(s.text.trim())}
            </div>
          ) : (
            <CardView key={i} card={s.card} copy={copy} senaMonto={senaMonto} turnstileSiteKey={turnstileSiteKey} />
          ),
        )}
      </div>
    </div>
  );
}

function CardView({
  card,
  copy,
  senaMonto,
  turnstileSiteKey,
}: {
  card: Card;
  copy: MalejoCopy;
  senaMonto: number;
  turnstileSiteKey?: string;
}) {
  if (card.kind === "quote") {
    return (
      <div className="card hi flex flex-col gap-2 rounded-[18px] p-3.5">
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
          {copy.quote.demo.replace("{SENA}", fmt(senaMonto))}
        </Link>
      </div>
    );
  }
  if (card.kind === "compare") return <CompareCard card={card} copy={copy} />;
  if (card.kind === "proyectos") {
    return (
      <div className="card flex flex-col gap-2 rounded-[18px] p-3.5">
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
      <div className="card hi flex flex-col gap-2 rounded-[18px] p-3.5">
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
  return <ConsentCard card={card} copy={copy} turnstileSiteKey={turnstileSiteKey} />;
}

/**
 * Alternativas lado a lado (`comparar`): una fila por opción y **ningún
 * total**. Misma familia visual que la tarjeta de cotización (DISENO.md §5).
 */
function CompareCard({ card, copy }: { card: Extract<Card, { kind: "compare" }>; copy: MalejoCopy }) {
  return (
    <div className="card hi flex flex-col gap-2 rounded-[18px] p-3.5">
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
      <div role="status" className="card rounded-[18px] p-3.5 text-sm">
        {copy.consent.saved}
      </div>
    );
  }

  return (
    <div className="card hi flex flex-col gap-2.5 rounded-[18px] p-3.5 text-sm">
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
