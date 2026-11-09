/**
 * Copy del marco del sitio de la agencia: menú, explorador de celular, pie y
 * metadata. Textos exactos de `docs/agencia/referencia.html` y DISENO.md §4.
 *
 * Los `href` internos son absolutos (`/#precios`) para que el mismo menú
 * funcione desde la home, las páginas de servicio, el blog y los legales.
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
    links: [
      { label: "Servicios", href: "/#servicios", section: "servicios" },
      { label: "Precios", href: "/#precios", section: "precios" },
      { label: "Proyectos", href: "/#proyectos", section: "proyectos" },
      { label: "Cómo trabajo", href: "/#como-trabajo", section: "como-trabajo" },
      { label: "Blog", href: "/blog", section: "blog" },
      { label: "Portfolio", href: "/portfolio", chip: "EN" },
    ] satisfies NavLink[],
    cta: { label: "Pedí tu demo", href: "/demo" },
    themeToDark: "Cambiar a modo oscuro",
    themeToLight: "Cambiar a modo claro",
  },

  /** Explorador lateral de celular (DISENO.md §8, `12-celular-*.png`). */
  explorer: {
    open: "Abrir menú",
    close: "Cerrar menú",
    title: "Menú",
    links: [
      { label: "Inicio", href: "/#inicio", section: "inicio" },
      { label: "Servicios", href: "/#servicios", section: "servicios" },
      { label: "Precios", href: "/#precios", section: "precios" },
      { label: "Proyectos", href: "/#proyectos", section: "proyectos" },
      { label: "Cómo trabajo", href: "/#como-trabajo", section: "como-trabajo" },
      { label: "Blog", href: "/blog", section: "blog" },
      { label: "Sobre mí", href: "/#sobre-mi", section: "sobre-mi" },
    ] satisfies NavLink[],
    portfolio: { label: "Portfolio", href: "/portfolio", chip: "EN" } satisfies NavLink,
    darkLabel: "Modo oscuro",
    lightLabel: "Modo claro",
  },

  footer: {
    tagline: "Desarrollado y gestionado por Mauro Lizárraga · Salta, Argentina.",
    columns: [
      {
        label: "Agencia",
        links: [
          { label: "Servicios", href: "/servicios" },
          { label: "Precios", href: "/#precios" },
          { label: "Cotizador", href: "/cotizador" },
          { label: "Proyectos", href: "/#proyectos" },
          { label: "Blog", href: "/blog" },
        ],
      },
      {
        label: "Mauro",
        links: [
          { label: "Mi CV (en inglés)", href: "/portfolio/en" },
          { label: "Mi historia", href: "/#sobre-mi" },
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
