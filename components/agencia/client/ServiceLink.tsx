"use client";

import { OPEN_CATEGORY_EVENT } from "@/lib/agencia/motion";

/**
 * "Ver precios →" de cada tarjeta de servicio: deja que el ancla lleve a
 * `#precios` y le avisa a `PricingCatalog` qué pestaña abrir. Sin JS el
 * link igual baja a precios (en la pestaña Webs).
 */
export function ServiceLink({
  category,
  className,
  children,
}: {
  category: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href="#precios"
      className={className}
      onClick={() => window.dispatchEvent(new CustomEvent(OPEN_CATEGORY_EVENT, { detail: category }))}
    >
      {children}
    </a>
  );
}
