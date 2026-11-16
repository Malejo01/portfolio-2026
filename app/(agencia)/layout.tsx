import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Outfit, Source_Serif_4 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Footer } from "@/components/agencia/Footer";
import { Header } from "@/components/agencia/Header";
import { BarraEstilo } from "@/components/agencia/EstiloPiezas";
import { BottomNav } from "@/components/agencia/client/BottomNav";
import { MalejoLoader } from "@/components/agencia/client/MalejoLoader";
import { SpritesVivos } from "@/components/agencia/client/SpritesVivos";
import { WHATSAPP_TEXTO } from "@/content/agencia/home";
import { waLink } from "@/lib/agencia/config";
import { malejoCopy } from "@/content/agencia/malejo";
import { DIBUJO_ORIGINAL, ESTILO_ORIGINAL, estilos } from "@/content/agencia/estilos";
import { configArranque, scriptDeArranque } from "@/lib/agencia/estilo";
import { site } from "@/content/agencia/site";
import { siteUrl } from "@/lib/links";
import "./agencia.css";
import "./estilos.css";
import "./sprites-animaciones.css";

/**
 * Tercer root layout del repo: el sitio de la agencia Malejo en la raíz del
 * dominio. Convive con `app/(es)` y `app/(en)` (el portfolio) sin un
 * `app/layout.tsx` arriba; navegar entre árboles fuerza recarga completa,
 * que es lo correcto porque son sitios distintos con tokens distintos.
 */
/**
 * Variable, sin `weight` (tanda P2): con los pesos fijos ["600", "700",
 * "800"], un build sin caché falla en Turbopack con el mismo error que
 * JetBrains Mono más abajo ("next/font/google queries have exactly one
 * entry"). La variable cubre 600 a 800 en un solo archivo.
 */
const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

/**
 * Variable, sin `weight`: misma configuración que `SiteDocument`. Con pesos
 * fijos ["500", "600"], un build sin caché en Vercel fallaba en Turbopack
 * ("next/font/google queries have exactly one entry") al resolver los
 * archivos de Google Fonts. La variable cubre 500 y 600 igual.
 */
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

/**
 * Tanda P3-1: los titulares y precios del estilo Institucional. Variable
 * (mismo motivo que Outfit) y sin precarga: solo la descarga el navegador
 * cuando el estilo activo la usa, así Tech/IA no paga por ella.
 *
 * `display: "optional"` y no "swap": sin precarga llega tarde, y el cambio
 * de la serif de respaldo (en Android y Linux no hay Times New Roman para
 * el ajuste de métricas) a Source Serif movía el H1 (CLS 0,054 medido).
 * Con "optional" no hay salto: si no llegó a tiempo, esa vista sigue con
 * el respaldo y la próxima ya la tiene en caché.
 */
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "optional",
  preload: false,
  variable: "--font-source-serif",
});

/** En `<body>`, no en `<html>`: mismo motivo que en `SiteDocument`. */
const FONT_VARIABLES = `${outfit.variable} ${inter.variable} ${jetbrains.variable} ${sourceSerif.variable}`;

/**
 * Antes del primer paint: marca `js` (contrato de `data-reveal`), pone el
 * estilo (`data-estilo`), el dibujo del personaje (`data-dibujo`) y el tema.
 * Tema: cookie `malejo-theme` si existe; si no, el tema de entrada del estilo
 * (Institucional arranca en claro) y, por defecto, **oscuro** — la agencia
 * no sigue a `prefers-color-scheme` (DISENO.md §2). La lógica está en
 * `lib/agencia/estilo.ts → arrancar`.
 *
 * Es el mismo patrón que `components/layout/SiteDocument.tsx`, con la misma
 * limitación documentada ahí: en un 404 el script no corre y el respaldo
 * vive en `components/agencia/client/theme.ts`. Ningún Server Component lee
 * la cookie ni el estilo: eso volvería dinámicas todas las rutas.
 */
const bootScript = scriptDeArranque(configArranque(estilos, ESTILO_ORIGINAL, DIBUJO_ORIGINAL));

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: site.title, template: "%s · Malejo" },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: "Mauro Lizárraga", url: siteUrl }],
  creator: "Mauro Lizárraga",
  icons: { icon: [{ url: "/agencia/marca/malejo-app-icon-dark.svg", type: "image/svg+xml" }] },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "es_AR",
    title: site.title,
    description: site.description,
    images: [{ url: "/og", width: 1200, height: 630, alt: site.title }],
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description, images: ["/og"] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0b0f" },
  ],
};

export default function AgenciaRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className={FONT_VARIABLES}>
        <BarraEstilo />
        <Header />
        <main id="contenido">{children}</main>
        <Footer />
        <BottomNav copy={site.bottomNav} whatsapp={waLink(WHATSAPP_TEXTO)} />
        <MalejoLoader copy={malejoCopy} turnstileSiteKey={process.env.TURNSTILE_SITE_KEY || undefined} />
        <SpritesVivos />
        <Analytics />
      </body>
    </html>
  );
}
