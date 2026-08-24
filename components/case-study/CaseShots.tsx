import Image from "next/image";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import type { DiagramSurface } from "@/components/case-study/diagram-kit";

export interface CaseShot {
  src: string;
  /** Ancho intrínseco del PNG. Es también el tope de render. */
  width: number;
  height: number;
}

/**
 * Las capturas de producto de los dos casos. A diferencia de los diagramas
 * —cuya geometría es parte del argumento y por eso no se comparte— acá el
 * bloque es idéntico en ambas páginas y lo único que cambia es la superficie.
 *
 * ── Por qué cada captura es un enlace ────────────────────────────────────
 *
 * Las capturas miden ~1818px de ancho. En un teléfono de 375px el hueco
 * disponible es de 267px, o sea que se ven a 0.15×: el texto de la interfaz,
 * que en el archivo mide unos 19px, queda en menos de 3px. Ilegible.
 *
 * Y no hay forma de arreglarlo achicando márgenes. Ni sacando el marco y el
 * gutter —eso da 375px, apenas 3.9px de texto— se llega a algo leíble: para
 * que esos 19px lleguen a los ~11px que hacen falta, la imagen necesita unos
 * 1050px de ancho, casi tres veces el viewport del teléfono. Ninguna
 * composición que entre en la pantalla resuelve esto.
 *
 * Quedan dos caminos: recortar variantes de móvil (asumiendo decisiones
 * editoriales sobre capturas ajenas, y duplicando los archivos) o dejar que
 * la persona amplíe. El segundo es mejor y encima sale gratis: el ancla al
 * archivo original abre el PNG en una pestaña, y ahí el zoom con dos dedos
 * lo pone el navegador. Cero JavaScript, funciona con teclado, y en desktop
 * sirve igual para mirar un detalle (el marco rinde a ~990px sobre 1818).
 *
 * El `cursor-zoom-in` es la pista en desktop; en táctil no hay hover, así que
 * la pista es la línea de texto de arriba.
 */
export function CaseShots({
  shots,
  alts,
  hint,
  surface = "paper",
  className = "",
}: {
  shots: readonly CaseShot[];
  /** Textos alternativos, en el mismo orden que `shots`. */
  alts: string[];
  hint: string;
  surface?: DiagramSurface;
  className?: string;
}) {
  // Array vacío = todavía no hay capturas. Mismo criterio que el string vacío
  // de `lib/links.ts`: no renderizar nada es mejor que un hueco.
  if (shots.length === 0) return null;

  const onPanel = surface === "panel";
  const frameClass = onPanel ? "border-panel-hair bg-panel-2" : "border-hair bg-paper-2";
  const hintClass = onPanel ? "text-panel-soft" : "text-ink-soft";

  return (
    <div className={className}>
      <p className={`mt-0 mb-[clamp(12px,1.8vw,18px)] font-mono text-meta ${hintClass}`}>{hint}</p>

      <RevealGroup className="grid gap-[clamp(12px,2vw,20px)]">
        {shots.map((shot, i) => (
          <RevealItem
            key={shot.src}
            className={`hairline overflow-hidden rounded-card ${frameClass} p-[clamp(10px,1.6vw,16px)]`}
          >
            <a
              href={shot.src}
              target="_blank"
              rel="noreferrer noopener"
              className="block cursor-zoom-in"
            >
              <Image
                src={shot.src}
                alt={alts[i]}
                width={shot.width}
                height={shot.height}
                sizes={`(min-width: ${shot.width}px) ${shot.width}px, 100vw`}
                style={{ maxWidth: shot.width }}
                className="mx-auto block h-auto w-full rounded-[3px]"
              />
            </a>
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
