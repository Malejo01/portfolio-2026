/** Copy del flotante de Malejo (DISENO.md §5, `11-flotante-*.png`). Sin toast del portfolio desde R2. */
export const malejoCopy = {
  open: "Abrir chat con Malejo",
  close: "Cerrar chat con Malejo",
  chip: "Chat",
  chipOpen: "Cerrar",
  spriteAlt: "",
  header: {
    name: "Malejo",
    status: "Responde al instante · Lo supervisa Mauro",
    close: "Cerrar chat",
    restart: "Empezar una charla nueva",
    whatsapp: "Escribirle a Mauro por WhatsApp con el resumen de esta charla",
    whatsappTip: "WhatsApp con Mauro",
  },
  greeting:
    "Hola, soy Malejo, el asistente de Mauro. Contame qué te pasa en tu negocio y te digo qué te conviene y cuánto sale.",
  typing: "Malejo está escribiendo",
  placeholder: "Escribí tu consulta...",
  send: "Enviar",
  inputLabel: "Tu mensaje",
  /**
   * Chips por problema (tanda R2): se ven hasta el primer mensaje. Cada uno
   * se envía como mensaje del usuario; "Hablar con Mauro" abre WhatsApp con
   * la ficha y queda siempre visible.
   */
  chipsLabel: "Elegí un tema o escribime",
  chips: [
    "Que me encuentren en Google",
    "Vender por WhatsApp o internet",
    "Que saquen turno solos",
    "Ordenar stock y pedidos",
    "Responder las 24 h",
    "No sé qué necesito",
  ],
  mauro: "Hablar con Mauro",
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
    demo: "Pedir demo con seña de {SENA}",
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
