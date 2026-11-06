"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { enviarBrief, type BriefState } from "@/app/(agencia)/demo/actions";
import type { demoCopy } from "@/content/agencia/demo";

/**
 * Formulario del brief (`/demo`). Isla mínima: `useActionState` para los
 * errores y el estado de éxito. El plan llega de `?plan=` (lo leen los
 * links "Lo quiero", el cotizador y el chat); se lee en el cliente para que
 * la página siga siendo estática.
 */
type Copy = typeof demoCopy;

export function DemoForm({ copy, plans }: { copy: Copy; plans: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState<BriefState, FormData>(enviarBrief, { status: "idle" });
  const [plan, setPlan] = useState("");
  const [extraOption, setExtraOption] = useState<{ id: string; name: string } | null>(null);
  const summary = useRef<HTMLDivElement>(null);
  const done = useRef<HTMLDivElement>(null);
  const b = copy.brief;

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const fromUrl = new URLSearchParams(location.search).get("plan");
      if (!fromUrl) return;
      const known = plans.find((p) => p.id === fromUrl);
      if (known) setPlan(known.id);
      else {
        const names = fromUrl.split(",").map((id) => plans.find((p) => p.id === id)?.name).filter(Boolean);
        if (names.length) {
          setExtraOption({ id: fromUrl, name: names.join(" + ") });
          setPlan(fromUrl);
        }
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [plans]);

  useEffect(() => {
    if (state.status === "error") summary.current?.focus();
    if (state.status === "ok" || state.status === "fallback") done.current?.focus();
  }, [state]);

  if (state.status === "ok" || state.status === "fallback") {
    const ok = state.status === "ok";
    return (
      <div ref={done} tabIndex={-1} role="status" className="card hi flex flex-col gap-3 p-6 sm:p-8">
        <h3 className="h text-2xl">{ok ? copy.success.title : copy.success.fallbackTitle}</h3>
        <p className="m-0 text-[15px] leading-relaxed text-muted">{ok ? copy.success.body : copy.success.fallbackBody}</p>
        {!ok && state.whatsapp ? (
          <a href={state.whatsapp} target="_blank" rel="noopener" className="btn btn-p self-start">
            {copy.success.fallbackCta}
          </a>
        ) : null}
      </div>
    );
  }

  const err = state.errors ?? {};
  const v = state.values ?? {};
  const field = "h-12 w-full rounded-[14px] border border-border-2 bg-bg px-3.5 text-[15px] text-text placeholder:text-muted aria-[invalid=true]:border-acc-text";
  const describe = (name: keyof typeof err) => (err[name] ? { "aria-invalid": true, "aria-describedby": `${name}-error` } : {});
  const fieldError = (name: keyof typeof err) =>
    err[name] ? (
      <p id={`${name}-error`} className="m-0 mt-1.5 text-[13px] text-acc-text">
        {err[name]}
      </p>
    ) : null;

  return (
    <form action={action} noValidate className="flex flex-col gap-4">
      {state.status === "error" ? (
        <div ref={summary} tabIndex={-1} role="alert" className="rounded-[14px] border border-hi-b bg-ic-bg p-4 text-sm text-user-text">
          <strong>{b.errorsTitle}</strong>
          <ul className="m-0 mt-1 list-disc pl-5">
            {Object.values(err).map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nombre" className="mb-1.5 block text-sm font-semibold">{b.nombre}</label>
          <input id="nombre" name="nombre" autoComplete="name" required defaultValue={v.nombre} className={field} {...describe("nombre")} />
          {fieldError("nombre")}
        </div>
        <div>
          <label htmlFor="contacto" className="mb-1.5 block text-sm font-semibold">{b.contacto}</label>
          <input id="contacto" name="contacto" autoComplete="tel" required defaultValue={v.contacto} className={field} {...describe("contacto")} />
          {fieldError("contacto")}
        </div>
      </div>
      <div>
        <label htmlFor="rubro" className="mb-1.5 block text-sm font-semibold">{b.rubro}</label>
        <input id="rubro" name="rubro" required placeholder={b.rubroPlaceholder} defaultValue={v.rubro} className={field} {...describe("rubro")} />
        {fieldError("rubro")}
      </div>
      <div>
        <label htmlFor="necesidad" className="mb-1.5 block text-sm font-semibold">{b.necesidad}</label>
        <textarea
          id="necesidad"
          name="necesidad"
          required
          rows={5}
          placeholder={b.necesidadPlaceholder}
          defaultValue={v.necesidad}
          className={`${field} h-auto py-3 leading-relaxed`}
          {...describe("necesidad")}
        />
        {fieldError("necesidad")}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="plan" className="mb-1.5 block text-sm font-semibold">{b.plan}</label>
          {/* No controlado a propósito: React 19 resetea el formulario después de
              la acción. El `key` lo vuelve a montar con el plan de la URL o con
              el que se mandó. */}
          <select key={`${plan}|${v.plan ?? ""}`} id="plan" name="plan" defaultValue={v.plan ?? plan} className={field}>
            <option value="">{b.planNone}</option>
            {extraOption ? <option value={extraOption.id}>{extraOption.name}</option> : null}
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="presupuesto" className="mb-1.5 block text-sm font-semibold">{b.presupuesto}</label>
          <select id="presupuesto" name="presupuesto" defaultValue={v.presupuesto ?? b.presupuestos[0]} className={field}>
            {b.presupuestos.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="flex cursor-pointer items-start gap-2.5 text-sm">
          <input type="checkbox" name="consent" required className="mt-0.5 h-[18px] w-[18px] flex-none accent-(--acc)" {...describe("consent")} />
          <span>
            {b.consent}{" "}
            <Link href="/legal/privacidad" className="text-acc-text underline underline-offset-2">
              {b.privacy}
            </Link>
          </span>
        </label>
        {fieldError("consent")}
      </div>
      <button type="submit" disabled={pending} className="btn btn-p self-start disabled:opacity-60">
        {pending ? b.sending : b.submit}
      </button>
    </form>
  );
}
