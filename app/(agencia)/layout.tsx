import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Footer } from "@/components/agencia/Footer";
import { Header } from "@/components/agencia/Header";
import { AGENCIA_THEME_COOKIE } from "@/lib/agencia/theme";
import { site } from "@/content/agencia/site";
import { siteUrl } from "@/lib/links";
import "./agencia.css";

/**
 * Tercer root layout del repo: el sitio de la agencia Malejo en la raíz del
 * dominio. Convive con `app/(es)` y `app/(en)` (el portfolio) sin un
 * `app/layout.tsx` arriba; navegar entre árboles fuerza recarga completa,
 * que es lo correcto porque son sitios distintos con tokens distintos.
 */
const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800"],
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600"],
  variable: "--font-jetbrains",
});

/** En `<body>`, no en `<html>`: mismo motivo que en `SiteDocument`. */
const FONT_VARIABLES = `${outfit.variable} ${inter.variable} ${jetbrains.variable}`;

/**
 * Antes del primer paint: marca `js` (contrato de `data-reveal`) y pone el
 * tema. Cookie `malejo-theme` si existe; si no, **oscuro** — la agencia no
 * sigue a `prefers-color-scheme` para el default (DISENO.md §2).
 *
 * Es el mismo patrón que `components/layout/SiteDocument.tsx`, con la misma
 * limitación documentada ahí: en un 404 el script no corre y el respaldo
 * vive en `components/agencia/client/theme.ts`. Ningún Server Component lee
 * la cookie: eso volvería dinámicas todas las rutas.
 */
const bootScript = `(function(){try{
var d=document.documentElement;
d.classList.add('js');
var m=document.cookie.match(/(?:^|; )${AGENCIA_THEME_COOKIE}=(dark|light)/);
var dark=!m||m[1]==='dark';
if(dark){d.classList.add('dark');}
d.style.colorScheme=dark?'dark':'light';
}catch(e){}})();`;

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
        <Header />
        <main id="contenido">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
