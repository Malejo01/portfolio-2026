import type { Content } from "@/lib/types";

export const es: Content = {
  nav: {
    wordmark: "Mauro Lizárraga",
    links: [
      { href: "/#perfil", label: "Perfil" },
      { href: "/#experiencia", label: "Experiencia" },
      { href: "/#casos", label: "Casos" },
      { href: "/#proyectos", label: "Proyectos" },
      { href: "/#contacto", label: "Contacto" },
    ],
    themeToggleLabel: "Tema",
    themeToggleAria: "Cambiar tema",
    localeToggleAria: "Cambiar idioma a inglés",
    backToHome: "Volver al inicio",
    skipToContent: "Saltar al contenido",
  },

  hero: {
    eyebrow: "Mauro Alejandro Lizárraga",
    headline: "Construyo sistemas con IA que corren solos en producción.",
    lede: "AI Engineer y Fullstack Developer. Diseño pipelines donde el modelo extrae y el código decide — porque una arquitectura auditable vale más que una demo impresionante.",
    ctaPrimary: "Ver perfil",
    ctaCv: "Descargar CV",
    status: "Disponible · full-time o proyecto",
    aside: [
      { term: "Base", lines: ["Salta, Argentina · remoto", "LATAM · EE.UU. · Europa"] },
      { term: "Formación", lines: ["Prof. de Matemática", "Lic. en Educación"] },
      { term: "Antes", lines: ["Accenture · docencia terciaria"] },
    ],
  },

  profile: {
    label: "Perfil",
    title: "Dos oficios, un mismo método",
    paragraphs: [
      "Soy AI Engineer y Fullstack Developer. También soy Profesor de Matemática y Licenciado en Educación, y doy Probabilidad y Estadística a nivel terciario.",
      "No son dos carreras paralelas. Diseñar una evaluación y diseñar un sistema son el mismo ejercicio: definir qué evidencia necesitás, qué puede salir mal, y cómo distinguir un resultado correcto de uno que solo parece correcto.",
      "Vengo de Accenture, donde mantuve y construí plataformas internas para una organización de escala global — el tipo de sistema donde el código que escribís lo hereda otro equipo. Antes de eso, formé a más de 120 docentes de primaria en varias provincias del país, viajando a coordinar con supervisoras a Misiones y Corrientes.",
    ],
    closing: "Hoy busco un equipo donde las dos cosas sumen.",
    aside: [
      {
        term: "Trabajo con",
        lines: ["TypeScript · Next.js · React", "Node · PostgreSQL · Supabase", "Prisma · Tailwind · Vercel"],
      },
      {
        term: "IA aplicada",
        lines: ["Gemini · LLM APIs · extracción", "estructurada · pipelines con", "validación determinista"],
      },
      {
        term: "Idiomas",
        lines: ["Español (nativo)", "Inglés — dailies y reuniones", "técnicas en Accenture"],
      },
    ],
  },

  experience: {
    label: "Experiencia",
    rows: [
      {
        period: "Software · abr. 2025 – feb. 2026",
        title: "Accenture — Packaged App Development Analyst",
        body:
          "Tres plataformas internas en once meses, cada una con un stack distinto: Vue, React y Angular sobre C# y .NET. La última la construí desde cero — un asistente conversacional para consultas internas de empleados, donde además escribí la documentación técnica y definí el alcance con product y diseño.\n\nAhí fue el primer contacto con arquitectura de agentes. Todo lo que vino después salió de esa puerta.",
      },
      {
        period: "Docencia · 10+ años",
        title: "Profesor de Matemática",
        body: "Probabilidad y Estadística a nivel terciario. El aula es donde se prueba si un criterio es explicable.",
      },
      {
        period: "Formación docente",
        title: "+120 docentes de primaria",
        body: "Capacitación en varias provincias, coordinando con supervisoras en Misiones y Corrientes.",
      },
    ],
  },

  cases: {
    label: "Casos de estudio",
    note: "Resumen · abrí el caso completo si querés la arquitectura",
    ctaLive: "Ver en producción",
    ctaRepo: "GitHub",
    cards: [
      {
        slug: "que-pinta-salta",
        status: "En producción",
        statusTone: "live",
        year: "2026",
        title: "Qué Pinta Salta",
        summary:
          "Cinco fuentes, un solo lugar: la agenda cultural de Salta alimentada automáticamente. El modelo extrae de los flyers; un filtro determinista en TypeScript decide qué se publica.",
        highlights: ["5 fuentes", "2 cron jobs", "Autónomo desde jun. 2026", "Usuarios reales en Salta"],
        stackLabel: "Stack",
        stack: [
          "Next.js 16 · TypeScript",
          "Supabase (RLS)",
          "Gemini 2.5 Flash · Apify",
          "Tailwind 4 · Framer Motion",
          "Resend · Vercel",
        ],
        cta: "Ver caso completo",
      },
      {
        slug: "maestria",
        status: "En desarrollo · 2026",
        statusTone: "wip",
        year: "2026",
        kicker: "Producto propio · EdTech",
        title: "MaestrIA",
        summary:
          "Evaluaciones alineadas a tu programa, con IA que enseña en vez de resolver. La decisión central no es técnica: es didáctica.",
        highlights: [
          "Hasta 40 preguntas por cuestionario",
          "4 tipos de pregunta",
          "Exporta a Moodle (GIFT)",
          "Probado en 3 materias con alumnos reales",
        ],
        stack: ["Next.js · TypeScript", "Prisma · PostgreSQL", "Tailwind · LLM APIs"],
        cta: "Ver caso completo",
      },
    ],
  },

  projects: {
    label: "Otros proyectos",
    note: "Tratamiento breve · no compiten con los casos",
    rows: [
      {
        slug: "salta-pay",
        title: "Salta Pay",
        meta: "Hackathon · 2026",
        body: "Pagos con Stellar para turistas. QR que convierte moneda extranjera a la moneda del comercio en un solo paso, sin casas de cambio. MVP funcional construido en 48 horas con un equipo armado en el evento.",
        stack: "Stellar · Blockchain · TypeScript",
      },
      {
        slug: "automotive",
        title: "Asistente conversacional automotriz",
        meta: "Desarrollo propio · 2026",
        body: "Agente LLM para concesionarias. Consultas de modelos, disponibilidad y calificación de leads en un flujo guiado. Diseñado como plantilla reutilizable: catálogo, persona y base de conocimiento son configurables.",
        stack: "LLM APIs · Next.js",
      },
    ],
  },

  contact: {
    label: "Contacto",
    title: "Trabajemos juntos",
    body: "Busco posiciones full-time o por proyecto en IA y desarrollo. Remoto desde Salta, Argentina — disponible para equipos en LATAM, Estados Unidos y Europa.",
    email: "lizarragamauroalejandro@gmail.com",
    ctaLinkedin: "LinkedIn",
    ctaGithub: "GitHub",
    ctaCv: "Descargar CV",
    responseTime: "Respondo dentro de 24 h",
    aside: [
      { term: "Modalidad", lines: ["Remoto · full-time o proyecto"] },
      { term: "Zona horaria", lines: ["GMT-3 (Salta, Argentina)"] },
    ],
  },

  footer: {
    credit: "Mauro Lizárraga · Salta, Argentina · 2026",
    built: "Construido con Next.js, Tailwind y Framer Motion",
    scale: "Escala tipográfica: razón 1.25 · base 17px",
  },

  caseQps: {
    slug: "que-pinta-salta",
    status: "En producción",
    year: "2026",
    title: "Qué Pinta Salta",
    subtitle: "Cinco fuentes, un solo lugar: la agenda cultural de Salta alimentada automáticamente",
    roleLabel: "Rol",
    role: "Diseño de arquitectura, pipeline de ingesta y producto — desarrollo individual.",
    problemHeading: "El problema",
    problem: [
      "La oferta de eventos de Salta vive fragmentada entre cuatro ticketeras que no se hablan entre sí y, sobre todo, entre flyers de Instagram — donde la información existe como imagen, no como dato.",
      "Para el usuario: no hay un solo lugar donde ver qué hay esta noche. Para el organizador: su evento aparece disperso o directamente no aparece.",
      "Cargar todo a mano no escala. Ese era el problema real.",
    ],
    decisionHeading: "La decisión que define el sistema",
    decisionModel: "El modelo extrae.",
    decisionModelNote: "carril del modelo",
    decisionCode: "El código decide.",
    decisionCodeNote: "carril determinista",
    decisionBody: [
      "Gemini 2.5 Flash lee el flyer y el caption y devuelve un JSON estructurado. Pero no publica nada. La compuerta es un filtro determinista en TypeScript que valida cuatro campos por forma —título, fecha, hora, lugar— y decide si el evento sale al aire o cae a revisión humana.",
      "Esto es deliberado. Un LLM que se equivoca con confianza es más peligroso que uno que falla. Al poner la decisión en código, el criterio es auditable, versionable y explicable — y cuando la extracción falla, el flyer no se pierde: entra a la cola de revisión con el caption original como contexto.",
    ],
    gateAsideLabel: "Compuerta",
    gateAside: "4 campos validados por forma: título · fecha · hora · lugar",
    howHeading: "Cómo funciona",
    diagram: {
      alt: "Diagrama del pipeline: cuatro fuentes estructuradas se normalizan con código TypeScript; Instagram pasa por Gemini 2.5 Flash que extrae JSON; ambos carriles convergen en una compuerta determinista que valida cuatro campos y deriva a publicado o a revisión humana.",
      sources: { title: "Fuentes estructuradas", a: "Vamosgob · EntradaUno", b: "Alpogo · Cines" },
      instagram: { title: "Instagram", sub: "flyer + caption" },
      normalize: { title: "Normalización", sub: "código TypeScript" },
      model: { title: "Gemini 2.5 Flash", sub: "extrae JSON" },
      gate: { title: "Compuerta", sub1: "filtro determinista", sub2: "valida 4 campos" },
      published: { title: "Publicado", sub: "dedup Jaccard" },
      review: { title: "Revisión", sub: "cola humana" },
      caption: "El color acento marca el único punto donde interviene el modelo.",
    },
    afterDiagram: [
      "Cinco fuentes activas. Cuatro devuelven datos estructurados y se normalizan con código. Solo Instagram pasa por el LLM, porque es la única donde el dato vive como imagen.",
      "Los eventos que aparecen en varias fuentes no se duplican: un algoritmo de similitud Jaccard acotado a mismo lugar y mismo día los fusiona, conservando todos los links de compra y el precio más bajo.",
    ],
    formulaNote: "Similitud de conjuntos entre títulos tokenizados, acotada a mismo lugar y mismo día.",
    resultLabel: "Resultado",
    result: "Pipeline autónomo desde junio 2026, con cola de revisión humana para lo que la compuerta rechaza.",
    stackLabel: "Stack",
    stack: [
      "Next.js 16 · TypeScript",
      "Supabase (RLS)",
      "Gemini 2.5 Flash · Apify",
      "Tailwind 4 · Framer Motion",
      "Resend · Vercel",
    ],
    ctaLive: "Ver en producción",
    ctaRepo: "Código en GitHub",
    ctaInterview: "Entrevista en El Diez TV",
  },

  caseMaestria: {
    slug: "maestria",
    status: "En desarrollo",
    year: "2026",
    kicker: "Producto propio · EdTech",
    title: "MaestrIA",
    subtitle: "Evaluaciones alineadas a tu programa, con IA que enseña en vez de resolver",
    roleLabel: "Rol",
    role: "Lo diseñé y construí solo — arquitectura, prompts, backend y frontend.",
    problemHeading: "El problema",
    problem: [
      "Doy clases de matemática hace más de diez años. Sé exactamente qué pasa cuando un alumno le pregunta a un chatbot: obtiene la respuesta correcta y no aprende nada.",
      "El error de un estudiante no es ruido — es información. Dice dónde se rompió el razonamiento. Una herramienta que lo saltea para llegar al resultado destruye justamente el material más valioso que hay en el aula.",
    ],
    decisionLabel: "La decisión que define el sistema",
    decisionHeadline: "Diagnosticar en lugar de responder.",
    decisionBody: [
      "Cuando el alumno se equivoca, el modelo no corrige: identifica qué tipo de error cometió y devuelve una explicación anclada en el contexto de ese estudiante y de ese tema. La respuesta correcta llega, pero después del diagnóstico — nunca en lugar de él.",
      "Esto no es una decisión técnica, es una decisión didáctica. La pude tomar porque conozco el aula, no porque conozca la API.",
    ],
    howHeading: "Cómo funciona la corrección",
    diagram: {
      alt: "Diagrama del ciclo de corrección: la respuesta del alumno entra a una compuerta que decide si es correcta. Por sí, el sistema devuelve una confirmación y termina. Por no, el modelo clasifica el tipo de error y lo explica en contexto, y recién después aparece la respuesta correcta.",
      answer: "Respuesta del alumno",
      gate: "¿Es correcta?",
      yes: "Sí",
      no: "No",
      confirm: "Confirmación",
      classify: "Clasifica el error",
      explain: "Explica en contexto",
      correct: "Respuesta correcta",
      caption: "El color acento marca el único punto donde interviene el modelo.",
    },
    whatHeading: "Qué hace",
    steps: [
      "Roles diferenciados para docente y estudiante (historial y métricas de progreso, en desarrollo).",
      "Configurás materia, año/grado, nivel y tipo de evaluación — teórico, práctico o ambos.",
      "Genera hasta 40 preguntas combinando opción múltiple, verdadero/falso, respuesta corta y numérica con margen de aproximación.",
      "Exporta el cuestionario a Moodle en formato GIFT — así armé los trabajos prácticos de Análisis Matemático, Álgebra y Probabilidad y Estadística.",
    ],
    closing: "Nació como herramienta de matemática. Hoy funciona con cualquier materia y cualquier nivel.",
    resultLabel: "Resultado",
    result:
      "Hoy lo uso yo, y en el proceso lo probaron mis alumnos de Análisis de Sistemas y de la carrera de Ciencia de Datos e Inteligencia Artificial, en las materias de Análisis Matemático, Álgebra y Probabilidad y Estadística. Genera cuestionarios de hasta 40 preguntas — múltiple choice, respuesta corta, verdadero/falso y numéricas con margen de aproximación — y los exporta a Moodle en formato GIFT. Los usé para armar los trabajos prácticos de esas tres materias.",
    stackLabel: "Stack",
    stack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Tailwind", "LLM APIs"],
    shots: [
      "Pantalla de configuración de MaestrIA mostrando los parámetros de un cuestionario de Matemática para 3er año de secundario, con selector de cantidad de preguntas hasta 40 y los cuatro tipos de pregunta disponibles.",
      "Previsualización de una pregunta de Matemática generada por MaestrIA sobre semejanza de figuras geométricas.",
      "Confirmación de exportación a Moodle: el cuestionario descargado en formato GIFT, listo para importar.",
    ],
    ctaRepo: "Código en GitHub",
    ctaLive: "Ver en producción",
  },

  meta: {
    title: "Mauro Lizárraga — AI Engineer & Fullstack Developer",
    description:
      "Construyo sistemas con IA que corren solos en producción. Casos de estudio de pipelines LLM, plataformas EdTech y automatización.",
    caseQpsTitle: "Qué Pinta Salta — Caso de estudio",
    caseQpsDescription:
      "Pipeline de ingesta con cinco fuentes: el modelo extrae de los flyers y un filtro determinista en TypeScript decide qué se publica.",
    caseMaestriaTitle: "MaestrIA — Caso de estudio",
    caseMaestriaDescription:
      "Plataforma EdTech que genera evaluaciones alineadas al programa del docente. El modelo diagnostica el error en lugar de resolverlo.",
  },
};
