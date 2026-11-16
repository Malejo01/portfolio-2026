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
  /** El plan de esa categoría que representa, si es uno solo (Aula: la plataforma educativa). */
  plan?: string;
  /** El nombre de esa categoría en la miniatura ("Web institucional"). */
  etiquetaCategoria: string;
  disponible: boolean;
  /**
   * El tema con el que arranca el estilo cuando la persona nunca eligió uno
   * dentro de ese estilo (no hay `malejo-tema-<estilo>`, tanda P3-4). Sin
   * esto, oscuro: el de siempre.
   */
  temaDeEntrada?: "claro" | "oscuro";
  /**
   * Tanda P3-2: el dibujo del personaje con el que se ve el estilo si la
   * persona nunca eligió uno a mano. Sin esto, el shuffle bag de P3-1.
   */
  dibujoPorDefecto?: Dibujo;
  /**
   * Las fuentes propias del estilo, como las pide `document.fonts.load()`.
   * Van sin precarga y con `display: optional`: el selector las descarga
   * antes de cambiar de estilo, así no se ve la de respaldo.
   */
  fuentes?: string[];
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
    temaDeEntrada: "oscuro",
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
    fuentes: ['600 1em "Source Serif 4"'],
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
    descripcion: "Pizarrón y tizas, para escuelas y profes.",
    categoria: "ia",
    /** El plan que representa dentro de `ia`. */
    plan: "plataforma-educativa-con-ia",
    etiquetaCategoria: "Plataformas educativas",
    disponible: true,
    temaDeEntrada: "oscuro",
    dibujoPorDefecto: "anime",
    fuentes: ["700 1em Caveat", "400 1em Nunito"],
    fraseHero: "Así se vería tu aula virtual",
  },
  {
    id: "tienda",
    nombre: "Tienda",
    descripcion: "Toma pedidos.",
    categoria: "tiendas",
    etiquetaCategoria: "Catálogos y tiendas",
    disponible: true,
    temaDeEntrada: "claro",
    dibujoPorDefecto: "chibi",
    fuentes: ["700 1em Fredoka", "400 1em Nunito"],
    fraseHero: "Así se vería tu almacén",
  },
];

export const ESTILO_ORIGINAL: EstiloId = "tech";
export const estilosDisponibles = estilos.filter((e) => e.disponible);

export function getEstilo(id: string): Estilo | undefined {
  return estilos.find((e) => e.id === id);
}

/**
 * `nombrePor`: el nombre que lleva el dibujo en un estilo puntual (Tienda le
 * dice "16-bit", como su referencia; el resto, "Pixel").
 */
export const dibujos: { id: Dibujo; nombre: string; nombrePor?: Partial<Record<EstiloId, string>> }[] = [
  { id: "16bit", nombre: "Pixel", nombrePor: { tienda: "16-bit" } },
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
  /** La barra verde de arriba de Tienda. */
  barraTienda: "Precios publicados · 3 pagos sin interés · Demo antes de pagar",
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
  /**
   * Tanda P3-3: Tienda. El ejemplo «Almacén Doña Rosa» es una ilustración
   * (`aria-hidden`, con `alt` para lectores): precios de mentira, que se
   * escriben con `fmt()`; el total y la cantidad se calculan, no se escriben.
   */
  tienda: {
    masPedido: "El más pedido",
    cambiar: "Cambiar",
    ejemplo: {
      alt: "Ejemplo: un almacén que recibe pedidos por WhatsApp",
      etiqueta: "Así se vería tu almacén",
      ejemploCelular: "Ejemplo · así lo ve tu cliente",
      nombre: "Almacén Doña Rosa",
      rubro: "Almacén · Dulces caseros",
      abierto: "Abierto · hasta 21 h",
      modos: ["Delivery", "Retiro"],
      categorias: ["Almacén", "Caseros", "Bebidas"],
      productos: [
        { nombre: "Pan casero", detalle: "1 kg, del día", precio: 3500, cantidad: 1, icono: "pan", tono: 1 },
        { nombre: "Dulce de leche", detalle: "Casero, 500 g", precio: 4800, cantidad: 1, icono: "frasco", tono: 2 },
        { nombre: "Huevos de campo", detalle: "La docena", precio: 3900, cantidad: 0, icono: "huevos", tono: 3 },
      ],
      tuPedido: "Tu pedido",
      total: "Total",
      enviar: "Enviar pedido por WhatsApp",
      pagar: "Pagar con Mercado Pago",
      link: "Así se vería tu almacén →",
    },
  },
  /** Tanda P3-2: el hero de Aula virtual y sus garabatos (decorativos). */
  aula: {
    label: "Mauro Lizárraga · profe de matemática y desarrollador",
    labelCorto: "Mauro Lizárraga · profe y desarrollador",
    garabatos: {
      formula: "f(idea) = idea + IA",
      mira: "¡mirá!",
      clientes: "∑ clientes ✓",
      demo: "demo en ≈ 72 h ★",
      recomendado: "¡recomendado!",
    },
    ejemplo: {
      etiqueta: "Así se vería tu aula virtual",
      instituto: "Instituto del Sol · Aula virtual",
      saludo: "Hola, Sofía",
      curso: "Matemática I · Funciones",
      avance: "Tu avance",
      avanceDe: "2 de 3 clases",
      /** Porcentaje de la barra de avance. */
      avancePct: 66,
      clases: [
        { texto: "Clase 1 · ¿Qué es una función?", hecha: true },
        { texto: "Clase 2 · Dominio e imagen", hecha: true },
        { texto: "Clase 3 · Gráficos", hecha: false },
      ],
      clasesLabel: "Clases del curso",
      hecha: "vista",
      asistente: "Asistente con IA:",
      pregunta: "“¿Me explicás de nuevo qué es el dominio?”",
      link: "Así se vería tu aula virtual →",
    },
  },
};

/**
 * Lo que necesitan las islas del selector (`EstiloSelector`,
 * `PersonajeRapido`): solo esto viaja al cliente, no los ejemplos de los
 * heroes (P3-3: el payload de la home crecía con cada estilo).
 */
export const selectorCopy = {
  pestana: estiloCopy.pestana,
  abrir: estiloCopy.abrir,
  titulo: estiloCopy.titulo,
  bajada: estiloCopy.bajada,
  cerrar: estiloCopy.cerrar,
  actual: estiloCopy.actual,
  proximamente: estiloCopy.proximamente,
  personaje: estiloCopy.personaje,
  personajeGrupo: estiloCopy.personajeGrupo,
  personajeCorto: estiloCopy.personajeCorto,
  sorprendeme: estiloCopy.sorprendeme,
  original: estiloCopy.original,
};
