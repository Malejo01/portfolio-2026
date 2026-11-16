import { estiloCopy } from "@/content/agencia/estilos";

/**
 * Piezas de composición que solo muestran algunos estilos (tanda P3-1). Son
 * Server Components: se renderizan siempre y `estilos.css` oculta las que no
 * van con `data-solo-estilo`. Sin JS (Tech/IA) no se ven.
 */

/** La franja de 3 colores y la barra de arriba de Institucional. */
export function BarraEstilo() {
  const { barra } = estiloCopy;
  return (
    <>
      <div aria-hidden="true" className="franja" />
      <div data-solo-estilo="institucional" className="est-barra text-[13px]">
        <div className="wrap flex flex-wrap justify-between gap-x-4 py-2 max-[759px]:hidden">
          <span>{barra.izquierda}</span>
          <span>{barra.derecha}</span>
        </div>
      </div>
    </>
  );
}

/** El logo de Institucional: la "M" serif en un cuadrado con borde. */
export function LogoEstilo() {
  return (
    <span
      aria-hidden="true"
      data-solo-estilo="institucional"
      className="inline-flex h-9 w-9 flex-none items-center justify-center border-[1.5px] border-marca font-titulo text-[17px] font-bold text-marca"
    >
      M
    </span>
  );
}
