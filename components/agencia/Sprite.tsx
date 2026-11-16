/* eslint-disable @next/next/no-img-element -- pixel art chico: sin optimizar a propósito (next/image lo suavizaría) */
import type { Dibujo, Pose } from "@/content/agencia/estilos";
import { DIBUJOS_SPRITE, medida, srcPose, srcTira } from "@/lib/agencia/sprites";

/**
 * El personaje (tanda P3-1): `<Sprite pose alto />`.
 *
 * Renderiza los 3 dibujos y `estilos.css` muestra el de `data-dibujo` (sin JS,
 * el 16-bit): no hace falta JS para elegir la imagen. Los ocultos no se
 * descargan (`loading="lazy"` con `display: none`).
 *
 * - `normal` es la tira `idle` (respira y parpadea con CSS `steps()`); se
 *   anima solo a la vista (`SpritesVivos` pone `data-visible`) y nunca con
 *   movimiento reducido: ahí queda el primer cuadro, la pose quieta.
 * - `pensando` y `ok` son quietas.
 * - `animaciones` suma las tiras de saludo o festejo, que se reproducen una
 *   vez cuando alguien pone `data-anim` en el contenedor (`reproducir()` de
 *   `lib/agencia/sprite-anim.ts`).
 *
 * Sin hooks ni APIs de servidor: lo usan los Server Components y el widget
 * de Malejo. `alto` es el alto del personaje en px, de la cabeza a los pies;
 * cada dibujo ajusta su escala y se apoya por los pies (sin CLS: `width` y
 * `height` explícitos).
 */
export function Sprite({
  pose = "normal",
  alto,
  alt,
  animaciones = [],
  className = "",
  saludoAlEntrar = false,
}: {
  pose?: Pose;
  alto: number;
  /** Vacío = decorativo. */
  alt: string;
  animaciones?: ("saludo" | "festejo")[];
  className?: string;
  /** El saludo de la primera visita al hero (una vez por sesión). */
  saludoAlEntrar?: boolean;
}) {
  return (
    <span
      data-sprite=""
      data-pose={pose}
      data-saludo-entrada={saludoAlEntrar ? "" : undefined}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className={`sprite-caja ${className}`}
    >
      {DIBUJOS_SPRITE.map((d) => (
        <SpriteDibujo key={d} dibujo={d} pose={pose} alto={alto} animaciones={animaciones} />
      ))}
    </span>
  );
}

function SpriteDibujo({ dibujo, pose, alto, animaciones }: { dibujo: Dibujo; pose: Pose; alto: number; animaciones: ("saludo" | "festejo")[] }) {
  return <DibujoEnPantalla dibujo={dibujo} pose={pose} animaciones={animaciones} {...medida(dibujo, alto)} />;
}

/**
 * Un dibujo con un tamaño en pantalla dado (y, si se pasa, corrido a `x`,
 * `y` dentro de un contenedor posicionado: lo usa `CaraMalejo`). El mismo
 * marcado de siempre (`.sprite` y las tiras), así `SpritesVivos` y
 * `reproducir()` funcionan igual.
 */
export function DibujoEnPantalla({
  dibujo,
  pose,
  animaciones,
  w,
  h,
  x,
  y,
}: {
  dibujo: Dibujo;
  pose: Pose;
  animaciones: ("saludo" | "festejo")[];
  w: number;
  h: number;
  x?: number;
  y?: number;
}) {
  const lugar = x === undefined ? {} : { position: "absolute" as const, left: x, top: y };
  return (
    <span data-solo-dibujo={dibujo} className="sprite" style={{ width: w, height: h, ...lugar }}>
      {pose === "normal" ? (
        <img src={srcTira(dibujo, "idle")} alt="" width={w * 3} height={h} loading="lazy" decoding="async" className="sprite-tira tira-idle" />
      ) : (
        <img src={srcPose(dibujo, pose)} alt="" width={w} height={h} loading="lazy" decoding="async" className="sprite-quieta" />
      )}
      {animaciones.map((a) => (
        <img key={a} src={srcTira(dibujo, a)} alt="" width={w * 3} height={h} loading="lazy" decoding="async" className={`sprite-tira tira-${a}`} />
      ))}
    </span>
  );
}
