import type { Pose } from "@/content/agencia/estilos";
import { DIBUJOS_SPRITE, medidaCara } from "@/lib/agencia/sprites";
import { DibujoEnPantalla } from "./Sprite";

/**
 * La cara de Malejo (tanda P3-4): `<CaraMalejo tamano={40} forma="redondeada" />`.
 *
 * Los recortes chicos (el avatar del chat, el botón de la barra inferior, el
 * "Soy Mauro" del hero de Tech y el retrato del equipo) recortaban el sprite
 * de cuerpo entero alineado arriba: con el 16-bit se veía la cara, pero con
 * el chibi solo el pelo y con el anime el cuerpo entero chiquito. Ahora cada
 * dibujo se escala para que su caja `cara` (`sprites.json`, la calcula
 * `limpiar.py` desde `scripts/sprites/config.json`) llene el contenedor.
 *
 * Igual que `Sprite`: renderiza los 3 dibujos, el CSS muestra el de
 * `data-dibujo`, los ocultos no se descargan (`lazy` con `display: none`) y
 * lleva `width` y `height` explícitos (sin CLS). Sin hooks: sirve en el
 * servidor y en el widget. Por defecto, la pose `ok`; con `normal` usa el
 * idle animado, y `animaciones` suma saludo o festejo (`reproducir()`).
 */
export function CaraMalejo({
  tamano,
  alto,
  forma = "redondeada",
  pose = "ok",
  animaciones = [],
  alt = "",
  saludoAlEntrar = false,
  className = "",
}: {
  /** Ancho en px (y alto, si no se pasa `alto`). */
  tamano: number;
  alto?: number;
  /** "circulo" (la barra inferior) o "redondeada" (el radio lo pone `className`). */
  forma?: "circulo" | "redondeada";
  pose?: Pose;
  animaciones?: ("saludo" | "festejo")[];
  /** Vacío = decorativa. */
  alt?: string;
  saludoAlEntrar?: boolean;
  className?: string;
}) {
  const h = alto ?? tamano;
  return (
    <span
      data-sprite=""
      data-pose={pose}
      data-saludo-entrada={saludoAlEntrar ? "" : undefined}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className={`cara-malejo ${forma === "circulo" ? "rounded-full" : ""} ${className}`}
      style={{ width: tamano, height: h }}
    >
      {DIBUJOS_SPRITE.map((d) => (
        <DibujoEnPantalla key={d} dibujo={d} pose={pose} animaciones={animaciones} {...medidaCara(d, tamano, h)} />
      ))}
    </span>
  );
}
