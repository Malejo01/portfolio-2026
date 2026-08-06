import { ImageResponse } from "next/og";
import { getContent } from "@/lib/content";
import { getLocale } from "@/lib/locale";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Mauro Lizárraga — AI Engineer & Fullstack Developer";

/**
 * El hero sobre panel oscuro, con los tokens del sistema. Sin fuentes
 * remotas: `ImageResponse` no puede pedirle a Google Fonts en build, y
 * cargar el .ttf agrega ~300 KB al bundle de la ruta para un beneficio
 * marginal. El satori default sostiene bien la jerarquía a este tamaño.
 */
export default async function OpengraphImage() {
  const { hero, meta } = getContent(await getLocale());

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#16130F",
          color: "#F7F3EC",
          padding: "76px 80px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 24,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "#9CBC91",
              marginBottom: 40,
            }}
          >
            Mauro Alejandro Lizárraga
          </div>
          <div
            style={{
              fontSize: 74,
              lineHeight: 1.08,
              fontWeight: 600,
              letterSpacing: -2,
              maxWidth: 900,
            }}
          >
            {hero.headline}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ height: 1, background: "#39322B", marginBottom: 28 }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 24,
              color: "#B7AFA4",
            }}
          >
            <span>{meta.title.split("—")[1]?.trim() ?? "AI Engineer & Fullstack Developer"}</span>
            <span>malejo.com.ar</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
