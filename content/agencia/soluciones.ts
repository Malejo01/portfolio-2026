/**
 * Copy de `/soluciones`, el armador (tanda P2, D1–D6). `/precios` y
 * `/cotizador` se fusionaron acá. Los precios nunca se escriben a mano:
 * salen de `lib/agencia/pricing.ts` (`estimarArmado`, `lineaDePagos`,
 * `senaPara`). `{X}`, `{Y}`, `{N}` y `{MONTO}` se reemplazan en el render.
 */
export const solucionesCopy = {
  metaTitle: "Soluciones y precios: webs, sistemas y asistentes con IA",
  description:
    "Armá lo que necesita tu negocio: páginas web, tiendas, turnos, sistemas y asistentes con IA, con precios publicados y un estimado al instante. El precio final lo cerramos en una charla.",
  breadcrumb: { inicio: "Inicio", soluciones: "Soluciones" },

  /** Encabezado con los dos caminos (D6). */
  label: "Soluciones",
  title: "Armá lo que necesita tu negocio",
  lead: "Elegí lo que te sirve y mirá un estimado. El precio final lo cerramos en una charla.",
  yaSe: "Ya sé lo que quiero",
  /** Abre a Malejo sin tema: la bienvenida del modo armado trae sus opciones (Fase 5 bis). */
  ayudame: "Ayudame a elegir",

  /** Catálogo. */
  catalogoLabel: "Catálogo",
  tabsLabel: "Categorías",
  /** "Estás viendo: Turnos y reservas". `{CAT}` = la categoría. */
  viendo: "Estás viendo: {CAT}",
  /** `{N}` = cuántos ítems de esa categoría hay en el armado. */
  enArmado: "{N} en tu armado",
  /** Carrusel de celular: "Plan 2 de 3". */
  carrusel: { anterior: "Plan anterior", siguiente: "Plan siguiente", punto: "Plan {N} de {T}", puntos: "Elegí qué plan ver", combos: "Combos de esta categoría" },

  /** El botón de cada tarjeta en modo armado (D5: nada entra sin un clic). */
  agregar: "Agregar al armado",
  /** En la fila de un extra. */
  agregarCorto: "Agregar",
  agregado: "✓ Agregado",
  quitar: "Quitar",
  /** Sin JS, cada plan lleva a la demo. */
  sinJsDemo: "Pedí tu demo",

  /** El carrito (D2, D3). */
  carrito: {
    label: "Tu armado",
    vacio: "Todavía no agregaste nada. Elegí una categoría o tocá \"Ayudame a elegir\".",
    desde: "desde",
    porMes: "por mes",
    porAnio: "por año",
    aCotizar: "a cotizar",
    sugerido: "Sugerido por Malejo",
    quitar: "Quitar",
    /** `{NOMBRE}` = el ítem. */
    quitarAria: "Quitar {NOMBRE} del armado",
    mensualLabel: "Por mes",
    anualLabel: "Por año",
    extras: "Sumale extras",
    extrasLead: "Se suman a cualquier plan.",
    estimadoLabel: "Estimado",
    /** `{X}` y `{Y}`: el piso y el techo. */
    estimado: "entre {X} y {Y}",
    /** Solo lo mensual: no hay pago único. */
    soloMensual: "Sin pago único: solo lo de cada mes",
    nota: "Lo publicado es el mínimo. Si tu caso suma algo, lo ves antes de pagar.",
    /** `{AHORRO}` = la diferencia en pesos. */
    combo: "Se aplicó el combo: ahorrás {AHORRO}",
    ayuda: "¿No sabés qué elegir? Preguntale a Malejo",
    ayudaTema: "Mirá mi armado y decime si me sirve",
    vaciar: "Vaciar",
    vaciarPregunta: "¿Vaciar el armado?",
    vaciarSi: "Sí, vaciar",
    vaciarNo: "No",
    compartir: "Compartir",
    copiado: "Link copiado",
    /** El texto de `navigator.share`. `{ITEMS}` = los nombres. */
    compartirTitulo: "Mi armado en Malejo",
    compartirTexto: "Mirá lo que armé en Malejo: {ITEMS}",
    compartido: "Te compartieron este armado. Podés cambiarlo.",
    enviar: "Mandale tu armado a Mauro",
    /** Celular: la barra fija. `{N}` = cantidad, `{X}` = el piso. */
    barra: "Tu armado · {N}",
    barraDesde: "desde {X}",
    abrir: "Ver tu armado",
    cerrar: "Cerrar",
    /** `{N}` = cantidad, para lectores de pantalla. */
    cantidad: "{N} en tu armado",
  },

  /** "Mandale tu armado a Mauro" (D3): el formulario dentro del carrito. */
  form: {
    titulo: "Mandale tu armado a Mauro",
    lead: "Te escribe por WhatsApp para charlarlo en una videollamada gratis. Ahí cierran el precio y, si conviene, la demo.",
    nombre: "Tu nombre",
    whatsapp: "Tu WhatsApp (con código de área)",
    rubro: "Rubro de tu negocio (opcional)",
    rubroPlaceholder: "Peluquería, ferretería, consultorio…",
    nota: "¿Algo más que quieras contarle? (opcional)",
    consent: "Acepto que Mauro me contacte por WhatsApp por este armado",
    privacy: "Política de privacidad",
    enviar: "Mandar mi armado",
    enviando: "Enviando…",
    volver: "Volver al armado",
    needCheck: "Marcá la casilla para que Mauro pueda escribirte.",
    invalid: "Revisá el nombre y el WhatsApp (con código de área).",
    error: "No pude mandarlo ahora. Escribile por WhatsApp con tu armado.",
    errorWhatsapp: "Mandarlo por WhatsApp",
  },

  /** Pantalla de éxito. */
  exito: {
    titulo: "Listo, Mauro te escribe en hasta 2 días hábiles",
    lead: "Si querés adelantarte, agendá la videollamada ahora.",
    agenda: "Agendá la videollamada ahora",
    whatsapp: "Escribile por WhatsApp",
    otro: "Armar otra cosa",
  },

  /** El texto de WhatsApp con el armado. `{ITEMS}`, `{X}`, `{Y}` y `{SENA}`. */
  whatsapp: {
    intro: "Hola Mauro, armé esto en malejo.com.ar:",
    estimado: "Estimado: entre {X} y {Y}",
  },

  /** Sin JS: el carrito se reemplaza por esto. */
  sinJs: {
    titulo: "¿Ya sabés qué querés?",
    lead: "Escribime y lo armamos juntos.",
    whatsapp: "Escribime por WhatsApp",
    contame: "Contame qué necesitás",
  },
} as const;

export type SolucionesCopy = typeof solucionesCopy;
