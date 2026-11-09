"use client";

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
        if (abrirChat({ tema })) e.preventDefault();
      }}
    >
      {children}
    </a>
  );
}
