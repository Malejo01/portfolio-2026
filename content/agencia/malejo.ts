/** Copy del flotante de Malejo (DISENO.md §5, `11-flotante-*.png`). Sin toast del portfolio desde R2. */
import type { IconName } from "@/components/agencia/icons";

/** Una opción de la bienvenida: texto e ícono de `icons.tsx`. */
export type OpcionBienvenida = { text: string; icon: IconName };

export const malejoCopy = {
  open: "Abrir chat con Malejo",
  close: "Cerrar chat con Malejo",
  chip: "Chat",
  chipOpen: "Cerrar",
  spriteAlt: "",
  header: {
    name: "Malejo",
    status: "Asistente con IA · Responde al instante",
    close: "Cerrar chat",
    restart: "Empezar una charla nueva",
    whatsapp: "Escribirle a Mauro por WhatsApp con el resumen de esta charla",
    whatsappTip: "WhatsApp con Mauro",
    /** Tanda P2 (Fase 5 bis): "Hablar con Mauro" pasa del pie al encabezado. */
    mauro: "Hablar con Mauro",
    /** Celular: la hoja a media pantalla se agranda o se achica. */
    expandir: "Ver el chat en pantalla completa",
    achicar: "Volver a media pantalla",
    /** Tanda P3-1: tocar el avatar pasa al dibujo siguiente de Mauro. */
    cambiarDibujo: "Cambiar el dibujo de Malejo",
  },
  /** Tanda P2 (Fase 5 bis): la bienvenida es una burbuja con las opciones adentro. */
  greeting: "Hola, soy Malejo, el asistente de Mauro 👋 Contame qué necesitás en tu negocio y te ayudo a elegir.",
  greetingHint: "Tocá una opción o escribime.",
  typing: "Malejo está escribiendo",
  placeholder: "Escribí tu consulta...",
  send: "Enviar",
  inputLabel: "Tu mensaje",
  /**
   * Las opciones de la bienvenida (tanda R2; P2 las mete en la burbuja).
   * Cada una se envía como mensaje del usuario. Se pueden tocar solo
   * mientras la bienvenida es el último mensaje. `icon` = `icons.tsx`.
   */
  chipsLabel: "Elegí un tema o escribime",
  chips: [
    { text: "Que me encuentren en Google", icon: "web" },
    { text: "Vender por WhatsApp o internet", icon: "cart" },
    { text: "Que saquen turno solos", icon: "calendar" },
    { text: "Ordenar stock y pedidos", icon: "box" },
    { text: "Responder las 24 h", icon: "ia" },
    { text: "No sé qué necesito", icon: "chat" },
  ] as OpcionBienvenida[],
  /** En `/soluciones` (modo armado). */
  chipsArmado: [
    { text: "Tengo un comercio", icon: "cart" },
    { text: "Doy servicios con turno", icon: "calendar" },
    { text: "Vendo por redes", icon: "chat" },
    { text: "Tengo una pyme con equipo", icon: "box" },
    { text: "Quiero atender con IA", icon: "ia" },
    { text: "No sé por dónde empezar", icon: "grid" },
  ] as OpcionBienvenida[],
  opcionesLabel: "Respuestas sugeridas",
  privacy: "Si me dejás tu nombre y WhatsApp, los uso solo para contactarte.",
  privacyLink: "Privacidad",
  quote: {
    label: "Cotización",
    listLabel: "Precio de lista",
    mpLabel: "Mercado Pago",
    from: "desde",
    perMonth: "/mes",
    perYear: "/año",
    usd: "al dólar oficial del día",
    /** Tanda P2: la seña escalonada de lo cotizado, calculada en el servidor. */
    demo: "Pedir demo · seña {SENA}",
    planEscrito: "Pedir el plan por escrito · {SENA}",
    demoSinCargo: "Pedir demo sin cargo",
    demoSolo: "Pedir demo",
  },
  compare: {
    label: "Comparación",
    hint: "Son alternativas: elegí una",
    recommended: "Recomendado",
    perMonth: "/mes",
    usd: "Dólares al oficial del día",
    alt: "Otra forma de pago:",
    choose: "Pedir demo",
  },
  proyectos: { label: "Proyectos de Mauro", portfolio: "Ver todo en el portfolio" },
  /** Tanda P2: la tarjeta de `sugerir_armado`. Nada entra sin el clic (D5). */
  armado: {
    label: "Mi sugerencia",
    agregar: "Agregar al kit",
    agregado: "✓ En tu kit",
    abrir: "Abrir en Soluciones",
  },
  form: {
    label: "Que Mauro te escriba",
    nombre: "Tu nombre",
    whatsapp: "Tu WhatsApp (con código de área)",
    check: "Acepto que Mauro me contacte por WhatsApp",
    privacy: "Política de privacidad",
    save: "Que me escriba",
    saving: "Enviando…",
    saved: "Listo: Mauro te escribe por WhatsApp en hasta 2 días hábiles.",
    needCheck: "Marcá la casilla para que pueda guardar tus datos.",
    invalid: "Revisá el nombre y el WhatsApp (con código de área).",
  },
  demo: { label: "Tu demo", demo: "Pedir mi demo", agenda: "Agendar videollamada" },
  whatsapp: { label: "WhatsApp", cta: "Escribirle a Mauro" },
  consent: {
    label: "Tus datos",
    check: "Acepto que Mauro me contacte por WhatsApp",
    privacy: "Política de privacidad",
    save: "Guardar mis datos",
    saving: "Guardando…",
    saved: "Listo: Mauro te escribe por WhatsApp.",
    needCheck: "Marcá la casilla para que pueda guardar tus datos.",
  },
  errorText: "No pude responder ahora. Escribime por WhatsApp y te contesta Mauro.",
};

export type MalejoCopy = typeof malejoCopy;
