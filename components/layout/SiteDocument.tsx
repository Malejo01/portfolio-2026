import { Bricolage_Grotesque, JetBrains_Mono, Public_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getContent } from "@/lib/content";
import { links, siteUrl } from "@/lib/links";
import { THEME_COOKIE, type Locale } from "@/lib/types";
import "@/app/globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
  axes: ["opsz"],
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-public-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

/**
 * Las tres variables de fuente. Van en `<body>` y no en `<html>` a propósito:
 * el `<html>` no debe tener ningún `className` administrado por React.
 *
 * El script de abajo agrega `js` y `dark` a `<html>` por fuera de React. Si
 * el `<html>` tuviera `className` como prop, cualquier render del layout en
 * el cliente —pasa en el 404: Next vuelve a montar el árbol— lo escribiría
 * entero y borraría esas dos clases: la página se iría a claro en medio de
 * la visita y `html:not(.js)` desactivaría las animaciones. Sin la prop,
 * React no toca el atributo y las clases sobreviven. Las custom properties
 * heredan, así que ponerlas un nivel más abajo no cambia nada para el CSS.
 */
const FONT_VARIABLES = `${bricolage.variable} ${publicSans.variable} ${jetbrainsMono.variable}`;

/**
 * Corre antes del primer paint y hace dos cosas.
 *
 * 1. `js`: marca que hay JavaScript vivo. Framer Motion serializa el estado
 *    inicial (`opacity:0`) en el HTML del servidor, así que sin esta marca
 *    un visitante sin JS vería la página en blanco. La regla de globals.css
 *    revierte el estado oculto cuando la clase no está.
 * 2. Tema, **las dos ramas**: la cookie si existe, `prefers-color-scheme` si
 *    no.
 *
 * Antes esta segunda parte estaba partida: el servidor leía la cookie y
 * escribía `class="dark"`, y el script se hacía a un lado cuando la cookie
 * existía. Esa lectura era `cookies()` en el root layout, o sea una Dynamic
 * API, y volvía dinámicas las tres rutas del sitio. Unificar acá es lo que
 * permite que vuelvan a prerenderizarse.
 *
 * No hay flash: un `<script>` inline sin `async`/`defer` frena el parser y
 * corre antes de que exista `<body>`, así que la clase está en `<html>`
 * antes del primer píxel. Es el mismo camino que ya cubría a cualquier
 * primera visita con el sistema en oscuro.
 *
 * ── El aviso de React en desarrollo ──────────────────────────────────────
 *
 * Al caer en un 404 (`[...notFound]` → `notFound()`) o en un error
 * boundary, Next sirve una cáscara (`<html id="__next_error__">`) y monta
 * este layout del lado del cliente. Ahí este script viaja como dato del
 * payload RSC, no como etiqueta, y React no lo ejecuta: en desarrollo lo
 * dice en consola ("Encountered a script tag while rendering React
 * component") y en producción simplemente no corre. Por eso `ThemeProvider`
 * tiene un respaldo que replica estas líneas cuando detecta que `<html>`
 * no tiene la clase `js`. En una ruta válida el script es una etiqueta
 * real del `<head>`, corre antes del primer paint y el respaldo no hace
 * nada. El aviso de consola en desarrollo queda; es el síntoma esperado
 * de ese camino, no un bug.
 *
 * No se "arregla" con `next/script` a propósito. En App Router,
 * `strategy="beforeInteractive"` con contenido inline **no** emite un
 * script nativo: lo encola en `self.__next_s` y lo ejecuta el runtime de
 * Next cuando carga (ver `next/dist/client/script.js`, rama `appDir`). Eso
 * es después del primer paint, o sea exactamente el flash de tema que este
 * script existe para evitar. Un `<script async src>` externo tampoco sirve:
 * React lo eleva sin avisar, pero `async` no frena el parser.
 */
const bootScript = `(function(){try{
var d=document.documentElement;
d.classList.add('js');
var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=(dark|light)/);
var dark=m?m[1]==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;
if(dark){d.classList.add('dark');d.style.colorScheme='dark';}
}catch(e){}})();`;

/**
 * JSON-LD de tipo Person. `sameAs` es lo que le permite a un buscador
 * unificar el sitio con los perfiles externos, así que filtra los strings
 * vacíos de lib/links.ts con el mismo criterio que los CTAs: un perfil que
 * todavía no existe no se declara.
 *
 * Se serializa con JSON.stringify y se escapa `<` para que ningún string
 * de la copy pueda cerrar el <script> antes de tiempo.
 */
function personJsonLd(locale: Locale, description: string): string {
  const sameAs = [links.linkedin, links.github].filter(Boolean);

  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Mauro Alejandro Lizárraga",
    alternateName: "Mauro Lizárraga",
    jobTitle: "AI Engineer & Fullstack Developer",
    description,
    url: siteUrl,
    image: `${siteUrl}/opengraph-image`,
    email: `mailto:${links.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Salta",
      addressCountry: "AR",
    },
    knowsLanguage: ["es", "en"],
    inLanguage: locale,
    ...(sameAs.length ? { sameAs } : {}),
  }).replace(/</g, "\\u003c");
}

/**
 * El `<html>` del sitio. Existe como componente porque hay **dos** root
 * layouts —uno por idioma, ver `app/(es)` y `app/(en)`— y cada uno necesita
 * su propio `<html lang>`. El locale llega por prop y no de una cookie: esa
 * es toda la diferencia entre una ruta estática y una dinámica.
 */
export function SiteDocument({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const jsonLd = personJsonLd(locale, getContent(locale).meta.description);

  return (
    <html lang={locale} suppressHydrationWarning>
      {/* `<head>` explícito: el script del tema tiene que estar antes del
          `<body>` para correr antes del primer paint. La regla que se
          silencia apunta al `<Head />` del Pages Router y no aplica acá. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      </head>
      <body className={FONT_VARIABLES}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
