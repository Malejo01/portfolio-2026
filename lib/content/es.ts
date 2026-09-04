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
    ctaPrimary: "Ver casos",
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
        lines: ["TypeScript · Next.js · React", "Node · PostgreSQL · Supabase", "Neon · Tailwind · Vercel"],
      },
      {
        term: "IA aplicada",
        lines: [
          "Gemini · Claude · LLM APIs",
          "RAG · pgvector · tool calling",
          "MCP · agentes con compuertas",
          "y revisión humana",
        ],
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
        period: "Liderazgo técnico · ago. 2026 – hoy",
        title: "Referente técnico — Tuki",
        body: "Equipo de cinco personas en dos departamentos, plan de cinco fases y tres meses, y punto único de contacto técnico con un cliente institucional: alcance, estimación, acceso a datos y compromisos de seguridad.",
      },
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
    ctaPrototype: "Ver prototipo",
    ctaRepo: "GitHub",
    cards: [
      {
        slug: "tuki",
        status: "En propuesta",
        statusTone: "wip",
        year: "2026",
        kicker: "Cliente institucional · GovTech",
        title: "Tuki",
        summary:
          "Un asistente ciudadano que solo responde lo que el municipio efectivamente publica. RAG sobre el corpus oficial de trámites: cada respuesta resuelve a su documento de origen y, si el trámite no está, deriva en vez de improvisar.",
        highlights: [
          "133 trámites · corpus completo",
          "Equipo de 5 · 2 departamentos",
          "Web y móvil desplegados",
          "Plan de 3 meses · 5 fases",
        ],
        role: {
          term: "Rol",
          lines: [
            "Referente técnico",
            "Equipo de 5 · 2 departamentos",
            "Plan de 5 fases · 3 meses",
            "Punto único de contacto",
            "técnico con el cliente",
          ],
        },
        stack: [
          "Next.js · TypeScript",
          "React Native (Expo)",
          "Supabase · pgvector",
          "Google Gemini",
          "Vercel",
        ],
        cta: "Ver caso completo",
      },
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
          "De 5 a 40 preguntas por cuestionario",
          "4 tipos de pregunta",
          "Exporta a Moodle (GIFT)",
          "Probado en 3 materias con alumnos reales",
        ],
        stack: ["Next.js · TypeScript", "Neon Postgres", "Vercel AI SDK · Zod", "NextAuth v5 · Vitest"],
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
        body: "Agente conversacional para concesionarias. Flujo guiado por etapas —consultas de modelos, disponibilidad y calificación de leads— que responde desde el catálogo y la base de conocimiento cargados. Plantilla reutilizable: catálogo, persona y base de conocimiento son configurables.",
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

  caseTuki: {
    slug: "tuki",
    status: "En propuesta",
    year: "2026",
    kicker: "Cliente institucional · GovTech",
    title: "Tuki",
    subtitle: "Un asistente ciudadano que solo responde lo que el municipio efectivamente publica",
    roleLabel: "Rol",
    role: "Referente técnico de un equipo de cinco personas y punto único de contacto técnico con el cliente.",
    problemHeading: "El problema",
    problem: [
      "La información de trámites municipales existe, pero está dispersa entre páginas, PDFs y dependencias. El ciudadano no sabe qué necesita, dónde presentarlo ni cuánto cuesta, y termina yendo presencialmente a preguntar.",
      "Un chatbot genérico empeora el problema: responde con seguridad información que puede estar mal. En un servicio público, una respuesta inventada sobre un requisito no es un error menor.",
    ],
    decisionHeading: "La decisión que define el sistema",
    decisionHeadline: "Anclar cada respuesta a un documento oficial.",
    decisionBody: [
      "Tuki no responde desde el conocimiento general del modelo. Recupera los fragmentos pertinentes del corpus que el municipio carga y controla, y se limita a reformular esa información en lenguaje claro.",
      "La consecuencia es doble: lo que Tuki dice es lo que el municipio publica, y toda respuesta puede rastrearse hasta su documento de origen. Si un trámite no está en el corpus, lo indica y deriva al canal correspondiente, en lugar de improvisar.",
    ],
    traceAsideLabel: "Trazabilidad",
    traceAside:
      "Cada respuesta resuelve a su documento de origen · fuera del corpus, deriva en vez de improvisar",
    howHeading: "Cómo funciona",
    diagram: {
      alt: "Diagrama del flujo de respuesta: la pregunta del ciudadano se convierte en un embedding de 768 dimensiones y se busca por distancia coseno en pgvector. Una compuerta decide si hay fragmentos del corpus. Si los hay, Gemini reformula la información citando el documento de origen; si no, el sistema deriva al canal correspondiente sin improvisar.",
      question: { title: "Pregunta", sub: "del ciudadano" },
      embed: { title: "Embedding", sub: "768 dimensiones" },
      search: { title: "Búsqueda", sub: "pgvector · coseno" },
      gate: { title: "¿Hay fragmento?", sub: "en el corpus" },
      yes: "sí",
      no: "no",
      answer: { title: "Gemini reformula", sub1: "cita el documento", sub2: "de origen" },
      refer: { title: "Deriva al canal", sub1: "correspondiente", sub2: "no improvisa" },
      caption:
        "El acento marca el único punto donde interviene el modelo. Las dos salidas tienen el mismo tamaño a propósito: saber cuándo no responder es una decisión de diseño, no un caso de borde.",
    },
    how: [
      "Corpus de 133 trámites —la totalidad de los publicados por el municipio— scrapeados del sitio oficial, chunkeados y embebidos con gemini-embedding-001 a 768 dimensiones en Supabase con pgvector.",
      "La recuperación usa distancia coseno sobre un índice ivfflat reconstruido tras la carga. Si hay fragmentos pertinentes, Gemini reformula esa información citando el documento de origen. Si no los hay, el sistema lo dice y deriva al canal que corresponde.",
    ],
    evalAsideLabel: "Validación",
    evalAside: "Banco de 40 preguntas de evaluación construido para el proyecto",
    builtHeading: "Qué está construido",
    builtIntro:
      "Nació en una hackathon de innovación pública en agosto de 2026. Hoy está en etapa de propuesta formal con el cliente, y las tres piezas corren.",
    built: [
      "Prototipo web del hackathon, desplegado y público.",
      "Demo del MVP presentado al cliente, desplegado con la integración web.",
      "Aplicación móvil en React Native (Expo) con el asistente integrado, corriendo en dispositivo y usada en presentaciones institucionales.",
    ],
    teamHeading: "Cómo se organizó el trabajo",
    team: [
      "Referente técnico de un equipo de cinco personas, organizado en dos departamentos: técnico y producto/comunicación. Definí la arquitectura, la asignación de roles y la estructura de entrega sobre un plan de cinco fases y tres meses.",
      "Soy el punto único de contacto técnico con el cliente: alcance, estimación de esfuerzo, requerimientos de acceso a datos y compromisos de seguridad.",
    ],
    planAsideLabel: "Plan",
    planAside: "5 fases · 3 meses · 2 departamentos · 5 personas",
    resultLabel: "Estado",
    result:
      "Propuesta formal en evaluación por el cliente. Lo que hay construido y desplegado es lo que se describe acá: prototipo web, demo del MVP y app móvil corriendo en dispositivo.",
    stackLabel: "Stack",
    stack: [
      "Next.js · TypeScript",
      "React Native (Expo)",
      "Supabase (PostgreSQL + pgvector)",
      "Google Gemini API",
      "Vercel",
    ],
    ctaLive: "Ver prototipo",
    ctaRepo: "Código en GitHub",
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
      sources: { title: "Fuentes estructuradas", a: "NorteTicket · Vamosgob", b: "EntradaUno · AlPogo" },
      instagram: { title: "Instagram", sub: "flyer + caption" },
      normalize: { title: "Normalización", sub: "código TypeScript" },
      model: { title: "Gemini 2.5 Flash", sub: "extrae JSON" },
      gate: { title: "Compuerta", sub1: "filtro determinista", sub2: "valida 4 campos" },
      published: { title: "Publicado", sub: "dedup Jaccard" },
      review: { title: "Revisión", sub: "cola humana" },
      caption: "El color acento marca el único carril donde interviene el modelo.",
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
    shots: [
      "Home de Qué Pinta Salta: el evento destacado de la portada es un concierto de la Orquesta Sinfónica de Salta con fecha, sala y precio, rotulado \"Evento importado automáticamente desde entradauno\" — el pipeline cargó la ficha entera sin intervención manual.",
      "Grilla de categorías con el contador de eventos por sección y el interruptor \"Mostrar flyers de redes\", que es el carril de Instagram visto desde el lado del usuario: los eventos extraídos de flyers conviven con los de las ticketeras.",
      "Mi Radar Salteño: configuración de las alertas por correo, con la frecuencia de envío y la casilla de destino.",
      "Mi Radar Salteño: selección de categorías de interés y de organizadores de Instagram seguidos, que definen qué eventos entran en cada envío.",
    ],
    shotsHint: "Abrí cualquier captura para verla a tamaño completo",
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
      caption:
        "El color acento marca la rama del error: ahí, y solo ahí, interviene el modelo — clasifica y explica antes de que aparezca la respuesta.",
    },
    whatHeading: "Qué hace",
    steps: [
      "Roles diferenciados para docente y estudiante (historial y métricas de progreso, en desarrollo).",
      "Configurás materia, año/grado, nivel y tipo de evaluación — teórico, práctico o ambos.",
      "Genera de 5 a 40 preguntas combinando opción múltiple, verdadero/falso, respuesta corta y numérica con margen de aproximación.",
      "Exporta el cuestionario a Moodle en formato GIFT — así armé los trabajos prácticos de Análisis Matemático, Álgebra y Probabilidad y Estadística.",
    ],
    closing: "Nació como herramienta de matemática. Hoy funciona con cualquier materia y cualquier nivel.",
    resultLabel: "Resultado",
    result:
      "Hoy lo uso yo, y en el proceso lo probaron mis alumnos de Análisis de Sistemas y de la carrera de Ciencia de Datos e Inteligencia Artificial, en las materias de Análisis Matemático, Álgebra y Probabilidad y Estadística. Genera cuestionarios de 5 a 40 preguntas — múltiple choice, respuesta corta, verdadero/falso y numéricas con margen de aproximación — y los exporta a Moodle en formato GIFT. Los usé para armar los trabajos prácticos de esas tres materias.",
    stackLabel: "Stack",
    stack: [
      "Next.js",
      "TypeScript",
      "Neon Postgres",
      "Vercel AI SDK (generateObject)",
      "Zod",
      "NextAuth v5 · invitados con cookie firmada",
      "Vitest",
      "Tailwind",
    ],
    shots: [
      "Pantalla de configuración de MaestrIA para un cuestionario de Física de 5to año de secundario armado sobre cuatro temas: tipo teórico, práctico o mixto; cantidad de preguntas de 5 a 40; dificultad básica, intermedia o avanzada; y los cuatro tipos de pregunta disponibles.",
      "Cuestionario de Física ya generado, con las opciones de guardarlo en el panel del docente, exportarlo a Moodle en formato GIFT o abrir la previsualización interactiva, seguidas de la lista de preguntas con las fórmulas renderizadas.",
      "Previsualización interactiva, pregunta 1 de 20: opción múltiple sobre movimiento armónico simple, con cuatro alternativas.",
      "Previsualización interactiva, pregunta 2 de 20: respuesta numérica sobre el período de oscilación de un péndulo simple.",
      "Previsualización interactiva, pregunta 3 de 20: verdadero o falso sobre la dirección de vibración en una onda transversal.",
      "Previsualización interactiva, pregunta 5 de 20: respuesta corta sobre la doble naturaleza de la luz, que corrige el modelo.",
    ],
    shotsHint: "Abrí cualquier captura para verla a tamaño completo",
    ctaRepo: "Código en GitHub",
    ctaLive: "Ver en producción",
  },

  meta: {
    title: "Mauro Lizárraga — AI Engineer & Fullstack Developer",
    description:
      "Construyo sistemas con IA que corren solos en producción. Casos de estudio de asistentes RAG, pipelines LLM, plataformas EdTech y automatización.",
    caseTukiTitle: "Tuki — Caso de estudio",
    caseTukiDescription:
      "Asistente ciudadano con RAG sobre el corpus oficial de trámites de un municipio: cada respuesta se ancla a su documento de origen y, fuera del corpus, deriva en vez de improvisar.",
    caseQpsTitle: "Qué Pinta Salta — Caso de estudio",
    caseQpsDescription:
      "Pipeline de ingesta con cinco fuentes: el modelo extrae de los flyers y un filtro determinista en TypeScript decide qué se publica.",
    caseMaestriaTitle: "MaestrIA — Caso de estudio",
    caseMaestriaDescription:
      "Plataforma EdTech que genera evaluaciones alineadas al programa del docente. El modelo diagnostica el error en lugar de resolverlo.",
  },
};
