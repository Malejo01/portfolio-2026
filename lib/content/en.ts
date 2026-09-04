import type { Content } from "@/lib/types";

export const en: Content = {
  nav: {
    wordmark: "Mauro Lizárraga",
    links: [
      { href: "/#perfil", label: "Profile" },
      { href: "/#experiencia", label: "Experience" },
      { href: "/#casos", label: "Case studies" },
      { href: "/#proyectos", label: "Projects" },
      { href: "/#contacto", label: "Contact" },
    ],
    themeToggleLabel: "Theme",
    themeToggleAria: "Toggle theme",
    localeToggleAria: "Switch language to Spanish",
    backToHome: "Back to home",
    skipToContent: "Skip to content",
  },

  hero: {
    eyebrow: "Mauro Alejandro Lizárraga",
    headline: "I build AI systems that run on their own in production.",
    lede: "AI Engineer and Fullstack Developer. I design pipelines where the model extracts and the code decides — because an auditable architecture is worth more than an impressive demo.",
    ctaPrimary: "View case studies",
    ctaCv: "Download CV",
    status: "Available · full-time or contract",
    aside: [
      { term: "Based in", lines: ["Salta, Argentina · remote", "LATAM · US · Europe"] },
      { term: "Education", lines: ["Mathematics Teacher", "BA in Education"] },
      { term: "Previously", lines: ["Accenture · higher-ed teaching"] },
    ],
  },

  profile: {
    label: "Profile",
    title: "Two trades, one method",
    paragraphs: [
      "I'm an AI Engineer and Fullstack Developer. I'm also a Mathematics Teacher with a BA in Education, and I teach Probability and Statistics at college level.",
      "These aren't two parallel careers. Designing an assessment and designing a system are the same exercise: define what evidence you need, what can go wrong, and how to tell a correct result from one that merely looks correct.",
      "I come from Accenture, where I maintained and built internal platforms for a globally scaled organization — the kind of system where the code you write is inherited by another team. Before that, I trained more than 120 primary school teachers across several Argentine provinces, traveling to coordinate with supervisors in Misiones and Corrientes.",
    ],
    closing: "I'm looking for a team where both sides add up.",
    aside: [
      {
        term: "I work with",
        lines: ["TypeScript · Next.js · React", "Node · PostgreSQL · Supabase", "Neon · Tailwind · Vercel"],
      },
      {
        term: "Applied AI",
        lines: ["Gemini · LLM APIs · RAG · pgvector", "structured extraction · pipelines", "with deterministic validation"],
      },
      {
        term: "Languages",
        lines: ["Spanish (native)", "English — technical standups", "and meetings at Accenture"],
      },
    ],
  },

  experience: {
    label: "Experience",
    rows: [
      {
        period: "Technical leadership · Aug 2026 – present",
        title: "Technical Lead — Tuki",
        body: "A five-person team across two departments, a five-phase, three-month plan, and single point of technical contact with an institutional client: scope, estimation, data access and security commitments.",
      },
      {
        period: "Software · Apr 2025 – Feb 2026",
        title: "Accenture — Packaged App Development Analyst",
        body:
          "Three internal platforms in eleven months, each on a different stack: Vue, React and Angular over C# and .NET. I built the last one from scratch — a conversational assistant for internal employee queries — writing the technical documentation and defining scope with product and design.\n\nThat was my first contact with agent architecture. Everything since came through that door.",
      },
      {
        period: "Teaching · 10+ years",
        title: "Mathematics Teacher",
        body: "Probability and Statistics at college level. The classroom is where you find out whether a criterion is explainable.",
      },
      {
        period: "Teacher training",
        title: "120+ primary school teachers",
        body: "Training across several provinces, coordinating with supervisors in Misiones and Corrientes.",
      },
    ],
  },

  cases: {
    label: "Case studies",
    note: "Summary · open the full case for the architecture",
    ctaLive: "View live",
    ctaPrototype: "View prototype",
    ctaRepo: "GitHub",
    cards: [
      {
        slug: "tuki",
        status: "In proposal",
        statusTone: "wip",
        year: "2026",
        kicker: "Institutional client · GovTech",
        title: "Tuki",
        summary:
          "A civic assistant that only answers what the city actually publishes. RAG over the official corpus of municipal procedures: every answer resolves to its source document and, if the procedure isn't there, it refers you onward instead of improvising.",
        highlights: [
          "133 procedures · full corpus",
          "Team of 5 · 2 departments",
          "Web and mobile deployed",
          "3-month plan · 5 phases",
        ],
        role: {
          term: "Role",
          lines: [
            "Technical lead",
            "Team of 5 · 2 departments",
            "5-phase · 3-month plan",
            "Single point of technical",
            "contact with the client",
          ],
        },
        stack: [
          "Next.js · TypeScript",
          "React Native (Expo)",
          "Supabase · pgvector",
          "Google Gemini",
          "Vercel",
        ],
        cta: "Read the full case",
      },
      {
        slug: "que-pinta-salta",
        status: "In production",
        statusTone: "live",
        year: "2026",
        title: "Qué Pinta Salta",
        summary:
          "Five sources, one place: Salta's cultural calendar fed automatically. The model extracts from the flyers; a deterministic TypeScript filter decides what gets published.",
        highlights: ["5 sources", "2 cron jobs", "Autonomous since Jun. 2026", "Real users in Salta"],
        stackLabel: "Stack",
        stack: [
          "Next.js 16 · TypeScript",
          "Supabase (RLS)",
          "Gemini 2.5 Flash · Apify",
          "Tailwind 4 · Framer Motion",
          "Resend · Vercel",
        ],
        cta: "Read the full case",
      },
      {
        slug: "maestria",
        status: "In development · 2026",
        statusTone: "wip",
        year: "2026",
        kicker: "Independent product · EdTech",
        title: "MaestrIA",
        summary:
          "Assessments aligned to your syllabus, with AI that teaches instead of solving. The core decision isn't technical: it's pedagogical.",
        highlights: [
          "5 to 40 questions per quiz",
          "4 question types",
          "Exports to Moodle (GIFT)",
          "Tested across 3 courses with real students",
        ],
        stack: ["Next.js · TypeScript", "Neon Postgres", "Vercel AI SDK · Zod", "NextAuth v5 · Vitest"],
        cta: "Read the full case",
      },
    ],
  },

  projects: {
    label: "Other projects",
    note: "Brief treatment · they don't compete with the case studies",
    rows: [
      {
        slug: "salta-pay",
        title: "Salta Pay",
        meta: "Hackathon · 2026",
        body: "Stellar payments for tourists. A QR that converts foreign currency into the merchant's currency in a single step, no exchange bureaus. Working MVP built in 48 hours with a team formed at the event.",
        stack: "Stellar · Blockchain · TypeScript",
      },
      {
        slug: "automotive",
        title: "Automotive conversational assistant",
        meta: "Self-initiated · 2026",
        body: "LLM agent for car dealerships. Model queries, availability and lead qualification in a guided flow. Designed as a reusable template: catalog, persona and knowledge base are configurable.",
        stack: "LLM APIs · Next.js",
      },
    ],
  },

  contact: {
    label: "Contact",
    title: "Let's work together",
    body: "I'm looking for full-time or contract roles in AI and development. Remote from Salta, Argentina — available for teams in LATAM, the United States and Europe.",
    email: "lizarragamauroalejandro@gmail.com",
    ctaLinkedin: "LinkedIn",
    ctaGithub: "GitHub",
    ctaCv: "Download CV",
    responseTime: "I reply within 24 h",
    aside: [
      { term: "Setup", lines: ["Remote · full-time or contract"] },
      { term: "Time zone", lines: ["GMT-3 (Salta, Argentina)"] },
    ],
  },

  footer: {
    credit: "Mauro Lizárraga · Salta, Argentina · 2026",
    built: "Built with Next.js, Tailwind and Framer Motion",
    scale: "Type scale: 1.25 ratio · 17px base",
  },

  caseTuki: {
    slug: "tuki",
    status: "In proposal",
    year: "2026",
    kicker: "Institutional client · GovTech",
    title: "Tuki",
    subtitle: "A civic assistant that only answers what the city actually publishes",
    roleLabel: "Role",
    role: "Technical lead of a five-person team and single point of technical contact with the client.",
    problemHeading: "The problem",
    problem: [
      "Information about municipal procedures exists, but it's scattered across pages, PDFs and departments. Citizens don't know what they need, where to file it or what it costs, and end up going in person to ask.",
      "A generic chatbot makes it worse: it confidently answers with information that may be wrong. In a public service, an invented answer about a requirement is not a minor error.",
    ],
    decisionHeading: "The decision that defines the system",
    decisionHeadline: "Anchor every answer to an official document.",
    decisionBody: [
      "Tuki doesn't answer from the model's general knowledge. It retrieves the relevant fragments from the corpus the city loads and controls, and limits itself to restating that information in plain language.",
      "The consequence is twofold: what Tuki says is what the city publishes, and every answer can be traced back to its source document. If a procedure isn't in the corpus, it says so and refers you to the right channel instead of improvising.",
    ],
    traceAsideLabel: "Traceability",
    traceAside:
      "Every answer resolves to its source document · outside the corpus, it refers onward instead of improvising",
    howHeading: "How it works",
    diagram: {
      alt: "Diagram of the answer flow: the citizen's question becomes a 768-dimension embedding and is searched by cosine distance in pgvector. A gate decides whether corpus fragments were found. If so, Gemini restates the information citing the source document; if not, the system refers the query to the right channel instead of improvising.",
      question: { title: "Question", sub: "from the citizen" },
      embed: { title: "Embedding", sub: "768 dimensions" },
      search: { title: "Search", sub: "pgvector · cosine" },
      gate: { title: "Fragment found?", sub: "in the corpus" },
      yes: "yes",
      no: "no",
      answer: { title: "Gemini restates", sub1: "citing the source", sub2: "document" },
      refer: { title: "Refers onward", sub1: "right channel", sub2: "no improvising" },
      caption:
        "The accent marks the only point where the model steps in. Both exits are the same size on purpose: knowing when not to answer is a design decision, not an edge case.",
    },
    how: [
      "A corpus of 133 procedures —every one the city publishes— scraped from the official site, chunked and embedded with gemini-embedding-001 at 768 dimensions into Supabase with pgvector.",
      "Retrieval uses cosine distance over an ivfflat index rebuilt after load. If relevant fragments exist, Gemini restates that information citing the source document. If they don't, the system says so and refers the query to the right channel.",
    ],
    evalAsideLabel: "Validation",
    evalAside: "A 40-question evaluation bank built for the project",
    shots: [
      "Home screen of the Tuki web prototype: the assistant introduces itself as an advisor for municipal procedures, with the query field and three promises alongside: 100% online, instant answers and official information.",
      "Frequent queries in the prototype: six sample questions, from opening a food truck to getting a first driver's licence, and a footer note that Tuki only answers with the official information loaded.",
      "The official-sources block at the foot of an answer: four corpus documents with their category and the date they were verified. That is what every answer resolves to.",
    ],
    shotsHint: "Open any screenshot to view it full size",
    builtHeading: "What's built",
    builtIntro:
      "It started at a public-sector innovation hackathon in August 2026. Today it's at the formal proposal stage with the client, and all three pieces run.",
    built: [
      "The hackathon web prototype, deployed and public.",
      "The MVP demo presented to the client, deployed with the web integration.",
      "A React Native (Expo) mobile app with the assistant integrated, running on device and used in institutional presentations.",
    ],
    teamHeading: "How the work was organized",
    team: [
      "Technical lead of a five-person team organized in two departments: engineering and product/communications. I defined the architecture, the role assignment and the delivery structure over a five-phase, three-month plan.",
      "I'm the single point of technical contact with the client: scope, effort estimation, data-access requirements and security commitments.",
    ],
    planAsideLabel: "Plan",
    planAside: "5 phases · 3 months · 2 departments · 5 people",
    resultLabel: "Status",
    result:
      "Formal proposal under evaluation by the client. What's built and deployed is what's described here: the web prototype, the MVP demo and the mobile app running on device.",
    stackLabel: "Stack",
    stack: [
      "Next.js · TypeScript",
      "React Native (Expo)",
      "Supabase (PostgreSQL + pgvector)",
      "Google Gemini API",
      "Vercel",
    ],
    ctaLive: "View prototype",
    ctaRepo: "Code on GitHub",
  },

  caseQps: {
    slug: "que-pinta-salta",
    status: "In production",
    year: "2026",
    title: "Qué Pinta Salta",
    subtitle: "Five sources, one place: Salta's cultural calendar fed automatically",
    roleLabel: "Role",
    role: "Architecture, ingestion pipeline and product design — solo development.",
    problemHeading: "The problem",
    problem: [
      "Salta's event listings live fragmented across four ticketing sites that don't talk to each other and, above all, across Instagram flyers — where the information exists as an image, not as data.",
      "For the user: there's no single place to see what's on tonight. For the organizer: their event shows up scattered, or doesn't show up at all.",
      "Loading everything by hand doesn't scale. That was the real problem.",
    ],
    decisionHeading: "The decision that defines the system",
    decisionModel: "The model extracts.",
    decisionModelNote: "model lane",
    decisionCode: "The code decides.",
    decisionCodeNote: "deterministic lane",
    decisionBody: [
      "Gemini 2.5 Flash reads the flyer and the caption and returns structured JSON. But it publishes nothing. The gate is a deterministic TypeScript filter that validates four fields by shape —title, date, time, venue— and decides whether the event goes live or falls to human review.",
      "This is deliberate. An LLM that is confidently wrong is more dangerous than one that fails outright. Putting the decision in code makes the criterion auditable, versionable and explainable — and when extraction fails, the flyer isn't lost: it enters the review queue with the original caption as context.",
    ],
    gateAsideLabel: "Gate",
    gateAside: "4 fields validated by shape: title · date · time · venue",
    howHeading: "How it works",
    diagram: {
      alt: "Pipeline diagram: four structured sources are normalized with TypeScript code; Instagram goes through Gemini 2.5 Flash, which extracts JSON; both lanes converge on a deterministic gate that validates four fields and routes to published or to human review.",
      sources: { title: "Structured sources", a: "NorteTicket · Vamosgob", b: "EntradaUno · AlPogo" },
      instagram: { title: "Instagram", sub: "flyer + caption" },
      normalize: { title: "Normalization", sub: "TypeScript code" },
      model: { title: "Gemini 2.5 Flash", sub: "extracts JSON" },
      gate: { title: "Gate", sub1: "deterministic filter", sub2: "validates 4 fields" },
      published: { title: "Published", sub: "Jaccard dedup" },
      review: { title: "Review", sub: "human queue" },
      caption: "The accent color marks the only lane where the model intervenes.",
    },
    afterDiagram: [
      "Five active sources. Four return structured data and are normalized with code. Only Instagram goes through the LLM, because it's the only one where the data lives as an image.",
      "Events that appear in several sources aren't duplicated: a Jaccard similarity algorithm scoped to same venue and same day merges them, keeping every purchase link and the lowest price.",
    ],
    formulaNote: "Set similarity between tokenized titles, scoped to same venue and same day.",
    resultLabel: "Result",
    result: "Autonomous pipeline since June 2026, with a human review queue for whatever the gate rejects.",
    stackLabel: "Stack",
    stack: [
      "Next.js 16 · TypeScript",
      "Supabase (RLS)",
      "Gemini 2.5 Flash · Apify",
      "Tailwind 4 · Framer Motion",
      "Resend · Vercel",
    ],
    shots: [
      "Qué Pinta Salta home page: the featured event is a Salta Symphony Orchestra concert with date, venue and price, labelled \"imported automatically from entradauno\" — the pipeline filled the whole record with no manual step.",
      "Category grid with a per-section event count and a \"Show social flyers\" switch — the Instagram lane seen from the user's side: events extracted from flyers sit alongside those from the ticketing sites.",
      "Mi Radar Salteño: email alert setup, with delivery frequency and destination inbox.",
      "Mi Radar Salteño: picking categories of interest and followed Instagram organizers, which decide what goes into each digest.",
    ],
    shotsHint: "Open any screenshot to view it full size",
    ctaLive: "View live",
    ctaRepo: "Code on GitHub",
    ctaInterview: "Interview on El Diez TV",
  },

  caseMaestria: {
    slug: "maestria",
    status: "In development",
    year: "2026",
    kicker: "Independent product · EdTech",
    title: "MaestrIA",
    subtitle: "Assessments aligned to your syllabus, with AI that teaches instead of solving",
    roleLabel: "Role",
    role: "I designed and built it alone — architecture, prompts, backend and frontend.",
    problemHeading: "The problem",
    problem: [
      "I've been teaching math for more than ten years. I know exactly what happens when a student asks a chatbot: they get the right answer and learn nothing.",
      "A student's mistake isn't noise — it's information. It tells you where the reasoning broke. A tool that skips past it to reach the result destroys precisely the most valuable material in the classroom.",
    ],
    decisionLabel: "The decision that defines the system",
    decisionHeadline: "Diagnose instead of answering.",
    decisionBody: [
      "When the student gets it wrong, the model doesn't correct: it identifies what kind of error they made and returns an explanation anchored in the context of that student and that topic. The right answer does arrive, but after the diagnosis — never instead of it.",
      "This isn't a technical decision, it's a pedagogical one. I could make it because I know the classroom, not because I know the API.",
    ],
    howHeading: "How the correction works",
    diagram: {
      alt: "Diagram of the feedback loop: the student's answer enters a gate that decides whether it is correct. On yes, the system returns a confirmation and stops. On no, the model classifies the type of error and explains it in context, and only then does the correct answer appear.",
      answer: "Student's answer",
      gate: "Is it correct?",
      yes: "Yes",
      no: "No",
      confirm: "Confirmation",
      classify: "Classifies the error",
      explain: "Explains in context",
      correct: "Correct answer",
      caption:
        "The accent color marks the error branch: there, and only there, the model steps in — it classifies and explains before the answer appears.",
    },
    whatHeading: "What it does",
    steps: [
      "Separate teacher and student roles (progress history and metrics still in development).",
      "You configure subject, grade/year, level, and evaluation type — theoretical, practical, or both.",
      "Generates 5 to 40 questions combining multiple choice, true/false, short answer, and numeric with an approximation margin.",
      "Exports the quiz to Moodle in GIFT format — I used it to build the practical assignments for Mathematical Analysis, Algebra, and Probability and Statistics.",
    ],
    closing: "It started as a math tool. Today it works with any subject and any level.",
    resultLabel: "Result",
    result:
      "Today I use it myself, and along the way students from Systems Analysis and from the Data Science and AI program tested it across Mathematical Analysis, Algebra, and Probability and Statistics. It generates quizzes of 5 to 40 questions — multiple choice, short answer, true/false, and numeric with an approximation margin — and exports them to Moodle in GIFT format. I used it to build the practical assignments for those three courses.",
    stackLabel: "Stack",
    stack: [
      "Next.js",
      "TypeScript",
      "Neon Postgres",
      "Vercel AI SDK (generateObject)",
      "Zod",
      "NextAuth v5 · signed-cookie guest sessions",
      "Vitest",
      "Tailwind",
    ],
    shots: [
      "MaestrIA configuration screen for a 5th-year secondary Physics quiz built from four topics: theoretical, practical or mixed; a question count from 5 to 40; basic, intermediate or advanced difficulty; and the four available question types.",
      "A generated Physics quiz, with the options to save it to the teacher's panel, export it to Moodle in GIFT format or open the interactive preview, followed by the question list with formulas rendered.",
      "Interactive preview, question 1 of 20: multiple choice on simple harmonic motion, with four alternatives.",
      "Interactive preview, question 2 of 20: numeric answer on the oscillation period of a simple pendulum.",
      "Interactive preview, question 3 of 20: true or false on the direction of vibration in a transverse wave.",
      "Interactive preview, question 5 of 20: short answer on the dual nature of light, graded by the model.",
    ],
    shotsHint: "Open any screenshot to view it full size",
    ctaRepo: "Code on GitHub",
    ctaLive: "View live",
  },

  meta: {
    title: "Mauro Lizárraga — AI Engineer & Fullstack Developer",
    description:
      "I build AI systems that run on their own in production. Case studies on RAG assistants, LLM pipelines, EdTech platforms and automation.",
    caseTukiTitle: "Tuki — Case study",
    caseTukiDescription:
      "A civic assistant with RAG over a city's official corpus of procedures: every answer is anchored to its source document and, outside the corpus, it refers onward instead of improvising.",
    caseQpsTitle: "Qué Pinta Salta — Case study",
    caseQpsDescription:
      "A five-source ingestion pipeline: the model extracts from the flyers and a deterministic TypeScript filter decides what gets published.",
    caseMaestriaTitle: "MaestrIA — Case study",
    caseMaestriaDescription:
      "EdTech platform that generates assessments aligned to the teacher's syllabus. The model diagnoses the error instead of solving it.",
  },
};
