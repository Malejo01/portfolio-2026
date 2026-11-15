/**
 * Copy de `/demo` (F5; seña escalonada desde la tanda P2). `{SENA}` = un
 * monto formateado (la seña que corresponde, o la más chica para "desde");
 * `{PLAN}` = el precio del plan del proyecto por escrito.
 */
export const demoCopy = {
  metaTitle: "Pedí tu demo",
  description: "Contame tu idea, pagá la seña según el tamaño del proyecto y en 72 horas hábiles tenés una demo con tu marca. La seña se descuenta del total.",
  label: "Tu demo",
  title: "Pedí tu demo",
  lead: "Tres pasos: me contás qué necesitás, pagás la seña según el tamaño del proyecto (desde {SENA}) y agendamos la videollamada para verla juntos.",
  /** Tanda P2: si lo elegido pasa el último tramo, la página cambia (D4). */
  planEscrito: {
    label: "Tu proyecto",
    title: "Primero el plan por escrito",
    lead: "Lo que elegiste es grande para una demo de 72 horas. Primero charlamos gratis 20 minutos y después te paso el plan del proyecto por escrito ({PLAN}): qué hay que hacer y cuánto sale cada etapa. Se descuenta del total.",
    charla: "Agendá la charla gratis",
  },
  steps: { brief: "Paso 1", sena: "Paso 2", agenda: "Paso 3" },
  /** Tanda P1 (§4.5): el resumen de lo que llega en `?plan=` o `?a=`. */
  resumen: {
    label: "Lo que elegiste",
    unico: "Pago único",
    desde: "desde",
  },
  brief: {
    title: "Contame tu idea",
    nombre: "Tu nombre",
    contacto: "WhatsApp o email",
    contactoHint: "Por acá te escribo.",
    rubro: "Rubro de tu negocio",
    rubroPlaceholder: "Veterinaria, gimnasio, inmobiliaria…",
    necesidad: "¿Qué necesitás?",
    necesidadPlaceholder: "Contame qué querés lograr, qué tenés hoy y si tenés una fecha en mente.",
    plan: "Plan que te interesa",
    planNone: "Todavía no sé",
    presupuesto: "Presupuesto aproximado",
    presupuestos: ["No sé todavía", "Hasta $300.000", "De $300.000 a $700.000", "De $700.000 a $1.500.000", "Más de $1.500.000"],
    consent: "Acepto que Mauro me contacte por WhatsApp o email por esta consulta.",
    privacy: "Política de privacidad",
    submit: "Enviar mi consulta",
    sending: "Enviando…",
    errorsTitle: "Revisá estos campos:",
    /** Campo trampa (invisible): solo lo ven los lectores de pantalla que lo ignoran por `aria-hidden`. */
    trampa: "No completes este campo",
    delChat: "Completé lo que ya le contaste a Malejo. Revisalo y cambiá lo que haga falta.",
    bloqueado: "No pude verificar el envío. Probá de nuevo en unos minutos o mandámelo por WhatsApp.",
  },
  success: {
    title: "¡Listo! Recibí tu consulta.",
    body: "Te escribo en hasta 2 días hábiles. Mientras, podés pagar la seña y agendar la videollamada acá abajo.",
    fallbackTitle: "No pude guardar tu consulta.",
    fallbackBody: "Mandámelo por WhatsApp con este botón y lo vemos por ahí.",
    fallbackCta: "Mandar por WhatsApp",
    /** Después de enviar bien: el cliente puede avisar por WhatsApp para no quedarse esperando. */
    avisarCta: "Avisale a Mauro por WhatsApp",
  },
  sena: {
    /** Sin nada elegido: la escala, con la seña más chica. */
    desde: "Seña desde {SENA}, según el proyecto",
    /** Con lo elegido en la URL: el monto que corresponde. */
    title: "Seña de {SENA}",
    body: "Se descuenta completa del total si contratás. La demo está lista en 72 horas hábiles desde que recibo la seña y el material.",
    bodyDesde: "El monto depende del tamaño de lo que contratás y se descuenta completo del total. Si vas a renovar tu web actual, la demo previa es sin cargo.",
    planEscrito: "Plan del proyecto por escrito: {SENA}",
    planEscritoBody: "Se paga por adelantado, después de la charla gratis, y se descuenta del total si seguimos.",
    sinCargo: "Demo sin cargo",
    sinCargoBody: "Para renovar tu web actual, la demo previa no lleva seña. Coordinamos por WhatsApp.",
    pay: "Pagar la seña",
    payPlan: "Pagar el plan por escrito",
    alias: "Transferí al alias",
    whatsapp: "Pedir los datos para la seña",
    whatsappText: "Hola Mauro, quiero pagar la seña para la demo.",
    whatsappPlanText: "Hola Mauro, quiero el plan del proyecto por escrito.",
    whatsappSinCargoText: "Hola Mauro, quiero la demo para renovar mi web.",
    whatsappSinCargo: "Coordinar por WhatsApp",
    tabla: "¿Cuánto es la seña?",
  },
  agenda: {
    title: "Agendá la videollamada",
    body: "20 minutos para ver la demo juntos. Decidís sin compromiso.",
    whatsapp: "Coordinar por WhatsApp",
    frameTitle: "Agenda de Mauro en Cal.com",
  },
};

export type DemoCopy = typeof demoCopy;
