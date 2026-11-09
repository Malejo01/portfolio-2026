"use client";

import { track } from "@vercel/analytics";
import { abrirChat } from "@/lib/agencia/abrir-chat";

/**
 * Botón que abre el chat de Malejo ("Contame qué necesitás", "Hablá con
 * Malejo", "Preguntale a Malejo"). Es un `<a>` a WhatsApp con el texto
 * genérico: sin JS, o si el widget no está disponible, el link funciona
 * igual (progressive enhancement). Con JS dispara `malejo:abrir` y, si
 * `MalejoLoader` lo atiende, cancela la navegación.
 *
 * La copy llega por props desde un Server Component (o como `children`).
 */
export function AbrirChat({
  href,
  tema,
  className,
  children,
  ariaLabel,
}: {
  /** Respaldo: WhatsApp con el texto genérico (`waLink(WHATSAPP_TEXTO)`). */
  href: string;
  tema?: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className={className}
      aria-label={ariaLabel}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        // Embudo: qué botón trae a la gente al chat (o a WhatsApp, si el chat no está).
        const abierto = abrirChat({ tema });
        track("cta_chat", { pagina: location.pathname, tema: Boolean(tema), destino: abierto ? "chat" : "whatsapp" });
        if (abierto) e.preventDefault();
      }}
    >
      {children}
    </a>
  );
}
