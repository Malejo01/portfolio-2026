/**
 * Los estilos de la web (tanda P3-1, `docs/agencia/plan-p3-estilos-sprites-easter-eggs.md`).
 * Fuente única: el selector, el script inline del layout, los heroes por
 * estilo y el test de contraste salen de acá.
 *
 * Cada estilo representa un tipo de web que hace Malejo (`categoria` es la
 * key de la categoría de `precios.json`) y cambia solo la **piel** del
 * sitio: los tokens de `app/(agencia)/estilos.css` por `[data-estilo]`. La
 * home suma además su propio hero (`components/agencia/home/estilos/<id>/`).
 * Ningún componente ramifica por estilo en JS.
 *
 * Se publican de a uno: lo que tiene `disponible: false` aparece en el
 * selector como "Próximamente" y el script lo ignora.
 */

export type EstiloId = "tech" | "institucional" | "aula" | "tienda";
export type Dibujo = "16bit" | "chibi" | "anime";
export type Pose = "normal" | "pensando" | "ok";

export interface Estilo {
  id: EstiloId;
  nombre: string;
  /** La línea corta de la miniatura del selector. */
  descripcion: string;
  /** Key de la categoría que representa (`precios.json → categorias`). */
  categoria: string;
  /** El nombre de esa categoría en la miniatura ("Web institucional"). */
  etiquetaCategoria: string;
  disponible: boolean;
  /**
   * El tema con el que arranca el estilo cuando la persona nunca eligió uno
   * (no hay cookie `malejo-theme`). Sin esto, oscuro: el de siempre.
   */
  temaDeEntrada?: "claro" | "oscuro";
  /** La frase del hero (va en el ejemplo, no reemplaza al H1). */
  fraseHero: string;
  /** El ejemplo visual del hero. Tech no tiene: su hero es el de siempre. */
  ejemploHero?: EjemploHero;
}

export interface EjemploHero {
  /** "Así se vería tu web institucional" (etiqueta arriba del ejemplo). */
  etiqueta: string;
  /** La dirección de la ventana del navegador. */
  direccion: string;
  marca: string;
  menu: string;
  novedad: { etiqueta: string; titulo: string; bajada: string };
  laterales: { titulo: string; accion: string }[];
  /** "Así se vería tu web institucional →", hacia `/soluciones?cat=<categoria>`. */
  link: string;
}

export const estilos: Estilo[] = [
  {
    id: "tech",
    nombre: "Tech / IA",
    descripcion: "El de siempre: oscuro con naranja.",
    categoria: "ia",
    etiquetaCategoria: "Webs, sistemas e IA",
    disponible: true,
    fraseHero: "Así se ve un asistente con IA",
  },
  {
    id: "institucional",
    nombre: "Institucional",
    descripcion: "Para empresas, cooperativas y organismos.",
    categoria: "webs",
    etiquetaCategoria: "Web institucional",
    disponible: true,
    temaDeEntrada: "claro",
    fraseHero: "Así se vería tu web institucional",
    ejemploHero: {
      etiqueta: "Así se vería tu web institucional",
      direccion: "cooperativadelvalle.org.ar",
      marca: "Cooperativa del Valle",
      menu: "Institucional · Servicios · Noticias · Contacto",
      novedad: { etiqueta: "Novedad", titulo: "Abrimos turnos online para socios", bajada: "Pedí tu turno sin hacer fila." },
      laterales: [
        { titulo: "Trámites en línea", accion: "Ingresar →" },
        { titulo: "Preguntas", accion: "Ver todas →" },
      ],
      link: "Así se vería tu web institucional →",
    },
  },
  {
    id: "aula",
    nombre: "Aula virtual",
    descripcion: "Próximamente",
    categoria: "ia",
    etiquetaCategoria: "Plataformas educativas",
    disponible: false,
    fraseHero: "Así se vería tu aula virtual",
  },
  {
    id: "tienda",
    nombre: "Tienda",
    descripcion: "Próximamente",
    categoria: "tiendas",
    etiquetaCategoria: "Catálogos y tiendas",
    disponible: false,
    fraseHero: "Así se vería tu tienda",
  },
];

export const ESTILO_ORIGINAL: EstiloId = "tech";
export const estilosDisponibles = estilos.filter((e) => e.disponible);

export function getEstilo(id: string): Estilo | undefined {
  return estilos.find((e) => e.id === id);
}

export const dibujos: { id: Dibujo; nombre: string }[] = [
  { id: "16bit", nombre: "Pixel" },
  { id: "chibi", nombre: "Chibi" },
  { id: "anime", nombre: "Anime" },
];

export const DIBUJO_ORIGINAL: Dibujo = "16bit";

/** Copy del selector y del selector rápido de personaje. */
export const estiloCopy = {
  pestana: "Estilos",
  abrir: "Mirá la web en otro estilo",
  titulo: "Mirá la web en otro estilo",
  bajada: "Cada estilo muestra un tipo de web que puedo hacer para vos.",
  cerrar: "Cerrar",
  actual: "estilo actual",
  proximamente: "Próximamente",
  personaje: "Personaje",
  personajeGrupo: "Elegí el personaje",
  personajeCorto: "Personaje:",
  cambiarPersonaje: "Cambiar el dibujo de Mauro",
  sorprendeme: "Sorprendeme",
  original: "Volver al original",
  /** Alt de los sprites, por pose. */
  alt: {
    normal: "Mauro dibujado, con las manos en los bolsillos",
    pensando: "Mauro dibujado, pensando",
    ok: "Mauro dibujado, haciendo el gesto de OK",
  } satisfies Record<Pose, string>,
  /** Las líneas de la barra de arriba del estilo Institucional. */
  barra: {
    izquierda: "Malejo · Software con IA para negocios e instituciones",
    derecha: "Salta, Argentina · Atención de lunes a viernes",
  },
  /** El hero de Institucional (sin emojis: es sobrio). */
  hero: {
    label: "Mauro Lizárraga · Salta, Argentina",
    labelCorto: "Mauro Lizárraga · Salta",
    antes: "Software con ",
    acento: "IA",
    despues: " para tu negocio.",
    primary: "Hablar con Malejo",
    secondary: "Armar mi kit",
    /** Los chips en el celular, en una sola fila. */
    chipsCortos: ["Precios publicados", "Demo antes", "3 pagos"],
  },
};
