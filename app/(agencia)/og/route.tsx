import { ImageResponse } from "next/og";
import { site } from "@/content/agencia/site";

/**
 * Imagen OG de la agencia en `/og`. No es un `opengraph-image.tsx` porque
 * esa convención en la raíz del grupo `(agencia)` resolvería a la misma URL
 * que `app/opengraph-image.tsx` (la del portfolio) y Next no permite dos
 * rutas iguales en grupos distintos. Estática: se genera en el build.
 *
 * Los hex van acá porque `ImageResponse` no lee CSS: son los tokens oscuros
 * de `agencia.css` (`--bg`, `--text`, `--muted`, `--acc`, `--acc-text`).
 */
export const dynamic = "force-static";

const SIZE = { width: 1200, height: 630 };

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0A0B0F",
          color: "#EDEDEF",
          padding: "72px 80px",
          position: "relative",
        }}
      >
        <svg
          viewBox="-22.2 -29.7 144.4 144.4"
          width="560"
          height="560"
          style={{ position: "absolute", right: -110, bottom: -150, opacity: 0.12 }}
        >
          <g fill="none" stroke="#FF5A1F" strokeWidth="3.2" strokeLinejoin="round">
            <path d="M-11.8 0 L-11.8 85 A11.8 11.8 0 0 0 11.8 85 L11.8 0 A11.8 11.8 0 0 0 -11.8 0 Z" />
            <path d="M88.2 0 L88.2 85 A11.8 11.8 0 0 0 111.8 85 L111.8 0 A11.8 11.8 0 0 0 88.2 0 Z" />
            <path d="M-8.34 8.34 L41.66 58.34 A11.8 11.8 0 0 0 58.34 41.66 L8.34 -8.34 A11.8 11.8 0 0 0 -8.34 8.34 Z" />
            <path d="M91.66 -8.34 L41.66 41.66 A11.8 11.8 0 0 0 58.34 58.34 L108.34 8.34 A11.8 11.8 0 0 0 91.66 -8.34 Z" />
            <circle cx="0" cy="0" r="9.8" />
            <circle cx="0" cy="85" r="9.8" />
            <circle cx="100" cy="0" r="9.8" />
            <circle cx="100" cy="85" r="9.8" />
            <circle cx="50" cy="50" r="9.8" />
          </g>
        </svg>
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 3, color: "#FF8A5C", textTransform: "uppercase" }}>
          AI Developer · Argentina y LATAM
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3 }}>
            Webs y apps
          </div>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3 }}>
            potenciadas con&nbsp;<span style={{ color: "#FF5A1F" }}>IA.</span>
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 30, color: "#A1A6AF", maxWidth: 820 }}>
            {site.description}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 34, fontWeight: 800 }}>malejo.com.ar</div>
      </div>
    ),
    SIZE,
  );
}
