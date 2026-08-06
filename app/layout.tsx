import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, JetBrains_Mono, Public_Sans } from "next/font/google";
import { cookies } from "next/headers";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getContent } from "@/lib/content";
import { getLocale } from "@/lib/locale";
import { siteUrl } from "@/lib/links";
import { THEME_COOKIE, type Theme } from "@/lib/types";
import "./globals.css";

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
 * Corre antes del primer paint y hace dos cosas.
 *
 * 1. `js`: marca que hay JavaScript vivo. Framer Motion serializa el estado
 *    inicial (`opacity:0`) en el HTML del servidor, así que sin esta marca
 *    un visitante sin JS —o con los scripts bloqueados— vería la página en
 *    blanco. La regla de globals.css revierte el estado oculto cuando la
 *    clase no está. Se agrega primero, antes de cualquier salida temprana.
 * 2. Tema: solo cuando no hay cookie. Si la hay, el servidor ya puso la
 *    clase en <html> y esto no toca nada.
 */
const bootScript = `(function(){try{
document.documentElement.classList.add('js');
if(document.cookie.indexOf('${THEME_COOKIE}=')>-1)return;
if(window.matchMedia('(prefers-color-scheme: dark)').matches){
document.documentElement.classList.add('dark');
document.documentElement.style.colorScheme='dark';}
}catch(e){}})();`;

export async function generateMetadata(): Promise<Metadata> {
  const { meta } = getContent(await getLocale());
  return {
    metadataBase: new URL(siteUrl),
    title: { default: meta.title, template: "%s · Mauro Lizárraga" },
    description: meta.description,
    authors: [{ name: "Mauro Lizárraga", url: siteUrl }],
    creator: "Mauro Lizárraga",
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: "Mauro Lizárraga",
      url: siteUrl,
      title: meta.title,
      description: meta.description,
    },
    twitter: { card: "summary_large_image", title: meta.title, description: meta.description },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#17150f" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [locale, store] = await Promise.all([getLocale(), cookies()]);
  const cookieTheme = store.get(THEME_COOKIE)?.value;
  const theme: Theme | null = cookieTheme === "dark" || cookieTheme === "light" ? cookieTheme : null;

  return (
    <html
      lang={locale}
      className={`${bricolage.variable} ${publicSans.variable} ${jetbrainsMono.variable}${
        theme === "dark" ? " dark" : ""
      }`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <ThemeProvider initialTheme={theme}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
