/**
 * Copy del marco del sitio de la agencia: menú, explorador de celular, pie y
 * metadata. Textos exactos de `docs/agencia/referencia.html` y DISENO.md §4.
 *
 * Los `href` internos son absolutos (`/#como-trabajo`) para que el mismo
 * menú funcione desde la home, las soluciones, el blog y los legales. El
 * portfolio no va en el menú (tanda R2): queda en el pie como "Mi CV".
 */

export interface NavLink {
  label: string;
  href: string;
  /** id de la sección de la home que activa el link al estar visible. */
  section?: string;
  chip?: string;
}

export interface FooterColumn {
  label: string;
  links: { label: string; href: string }[];
}

export const site = {
  name: "Malejo",
  title: "Malejo · Webs y apps potenciadas con IA",
  description:
    "Webs, sistemas y asistentes con IA para tu negocio. Listos en días, con precios publicados.",
  skip: "Saltar al contenido",

  nav: {
    ariaLabel: "Principal",
    home: "Malejo, inicio",
    /**
     * `section` = qué ítem se marca activo: el id de la sección visible en la
     * home, o el de la ruta (`SectionSpy` lo resuelve). Cada página marca el
     * suyo: `/servicios/*` → Soluciones, `/precios` → Precios, `/blog/*` → Blog.
     */
    links: [
      { label: "Soluciones", href: "/servicios", section: "servicios" },
      { label: "Precios", href: "/precios", section: "precios" },
      { label: "Cómo trabajo", href: "/#como-trabajo", section: "como-trabajo" },
      { label: "Proyectos", href: "/#proyectos", section: "proyectos" },
      { label: "Blog", href: "/blog", section: "blog" },
    ] satisfies NavLink[],
    /** El botón principal del menú abre el chat de Malejo. */
    cta: "Hablá con Malejo",
    /** Celular: el header suma WhatsApp al lado del ☰. */
    whatsapp: "Escribime por WhatsApp",
    themeToDark: "Cambiar a modo oscuro",
    themeToLight: "Cambiar a modo claro",
  },

  /** Menú lateral de celular (DISENO.md §8, `12-celular-*.png`). */
  explorer: {
    open: "Abrir menú",
    close: "Cerrar menú",
    title: "Menú",
    links: [
      { label: "Inicio", href: "/#inicio", section: "inicio" },
      { label: "Soluciones", href: "/servicios", section: "servicios" },
      { label: "Precios", href: "/precios", section: "precios" },
      { label: "Cómo trabajo", href: "/#como-trabajo", section: "como-trabajo" },
      { label: "Proyectos", href: "/#proyectos", section: "proyectos" },
      { label: "Blog", href: "/blog", section: "blog" },
    ] satisfies NavLink[],
    darkLabel: "Modo oscuro",
    lightLabel: "Modo claro",
  },

  footer: {
    tagline: "Desarrollado y gestionado por Mauro Lizárraga · Salta, Argentina.",
    columns: [
      {
        label: "Agencia",
        links: [
          { label: "Soluciones", href: "/servicios" },
          { label: "Precios", href: "/precios" },
          { label: "Cotizador", href: "/cotizador" },
          { label: "Proyectos", href: "/#proyectos" },
          { label: "Blog", href: "/blog" },
        ],
      },
      {
        label: "Mauro",
        links: [
          { label: "Quién soy", href: "/#sobre-mi" },
          { label: "Mi CV (en inglés)", href: "/portfolio/en" },
        ],
      },
      {
        label: "Legal",
        links: [
          { label: "Términos y política de cambios", href: "/legal/terminos" },
          { label: "Privacidad y datos personales", href: "/legal/privacidad" },
        ],
      },
    ] satisfies FooterColumn[],
  },

  notFound: {
    label: "Error 404",
    title: "Esta página no existe.",
    body: "Puede que el enlace esté roto o que la página se haya mudado. Desde acá podés volver a la home o ir al portfolio.",
    home: "Volver al inicio",
    portfolio: "Ver portfolio",
  },
} as const;
