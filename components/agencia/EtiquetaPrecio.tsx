/**
 * La etiqueta de precio (tanda P3-3). Server Component sin estado: recibe el
 * texto ya formateado (los montos salen de `lib/agencia/pricing.ts`) y no
 * calcula nada.
 *
 * En Tech, Institucional y Aula es texto común (la clase no tiene estilos
 * ahí). En Tienda es la etiqueta mostaza colgante, con su agujero, que nunca
 * pasa el ancho de la tarjeta (`max-width: 100%`, sin cortar renglón) y se
 * balancea una vez al entrar (`SpritesVivos` le pone `data-visto`; `i` es
 * el orden para el escalonado de 60 ms).
 *
 * "Desde" va aparte, arriba, cuando se pasa en `desde`.
 */
export function EtiquetaPrecio({
  children,
  tamano = "chico",
  desde,
  i = 0,
  className = "",
}: {
  children: React.ReactNode;
  tamano?: "chico" | "grande";
  desde?: string;
  i?: number;
  className?: string;
}) {
  const etiqueta = (
    <span
      data-etiqueta-precio=""
      className={`etiqueta-precio ${tamano === "grande" ? "etiqueta-precio-grande" : ""} ${className}`}
      style={{ "--i": i } as React.CSSProperties}
    >
      {children}
    </span>
  );
  if (!desde) return etiqueta;
  // En los demás estilos se lee "Desde $X" en la misma línea; en Tienda,
  // "Desde" va arriba y aparte (estilos.css, `.etiqueta-desde`).
  return (
    <span className="etiqueta-desde">
      <span className="etiqueta-desde-txt">{desde}</span> {etiqueta}
    </span>
  );
}
