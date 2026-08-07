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
    ctaPrimary: "See profile",
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
      "I'm an AI Engineer and Fullstack Developer. I'm also a Mathematics Teacher with a BA in Education, and I teach Probability and Statistics at the tertiary level.",
      "These aren't two parallel careers. Designing an assessment and designing a system are the same exercise: define what evidence you need, what can go wrong, and how to tell a correct result from one that merely looks correct.",
      "I come from Accenture, where I wrote code other teams maintain for international clients. Before that, I trained more than 120 primary school teachers across several Argentine provinces, travelling to coordinate with supervisors in Misiones and Corrientes.",
    ],
    closing: "I'm looking for a team where both sides add up.",
    aside: [
      {
        term: "I work with",
        lines: ["TypeScript · Next.js · React", "Node · PostgreSQL · Supabase", "Prisma · Tailwind · Vercel"],
      },
      {
        term: "Applied AI",
        lines: ["Gemini · LLM APIs · structured", "extraction · pipelines with", "deterministic validation"],
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
        period: "Software",
        title: "Accenture — Development",
        body: "Production code for international clients, maintained by other teams.",
      },
      {
        period: "Teaching · 10+ years",
        title: "Mathematics Teacher",
        body: "Probability and Statistics at the tertiary level. The classroom is where you find out whether a criterion is explainable.",
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
    ctaRepo: "GitHub",
    cards: [
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
        kicker: "Own product · EdTech",
        title: "MaestrIA",
        summary:
          "Assessments aligned to your syllabus, with AI that teaches instead of solving. The core decision isn't technical: it's pedagogical.",
        stack: ["Next.js · TypeScript", "Prisma · PostgreSQL", "Tailwind · LLM APIs · v0"],
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
        meta: "Own development · 2026",
        body: "LLM agent for car dealerships. Model queries, availability and lead qualification in a guided flow. Designed as a reusable template: catalogue, persona and knowledge base are configurable.",
        stack: "LLM APIs · Next.js",
      },
      {
        slug: "restaurant",
        title: "Restaurant management system",
        meta: "Personal project · 2024",
        body: "Orders and admin panel. Customer ordering flow plus a dashboard with real-time status tracking (pending, in the kitchen, delivered), category filtering and checkout.",
        stack: "Next.js · React · Vercel",
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
      "For the user: there's no single place to see what's on tonight. For the organiser: their event shows up scattered, or doesn't show up at all.",
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
      alt: "Pipeline diagram: four structured sources are normalised with TypeScript code; Instagram goes through Gemini 2.5 Flash, which extracts JSON; both lanes converge on a deterministic gate that validates four fields and routes to published or to human review.",
      sources: { title: "Structured sources", a: "Vamosgob · EntradaUno", b: "Alpogo · Cinemas" },
      instagram: { title: "Instagram", sub: "flyer + caption" },
      normalize: { title: "Normalisation", sub: "TypeScript code" },
      model: { title: "Gemini 2.5 Flash", sub: "extracts JSON" },
      gate: { title: "Gate", sub1: "deterministic filter", sub2: "validates 4 fields" },
      published: { title: "Published", sub: "Jaccard dedup" },
      review: { title: "Review", sub: "human queue" },
      caption: "The accent colour marks the single point where the model intervenes.",
    },
    afterDiagram: [
      "Five active sources. Four return structured data and are normalised with code. Only Instagram goes through the LLM, because it's the only one where the data lives as an image.",
      "Events that appear in several sources aren't duplicated: a Jaccard similarity algorithm scoped to same venue and same day merges them, keeping every purchase link and the lowest price.",
    ],
    formulaNote: "Set similarity between tokenised titles, scoped to same venue and same day.",
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
    ctaLive: "View live",
    ctaRepo: "Code on GitHub",
    ctaInterview: "Interview on El Diez TV",
  },

  caseMaestria: {
    slug: "maestria",
    status: "In development",
    year: "2026",
    kicker: "Own product · EdTech",
    title: "MaestrIA",
    subtitle: "Assessments aligned to your syllabus, with AI that teaches instead of solving",
    problemHeading: "The problem",
    problem: [
      "I've been teaching maths for more than ten years. I know exactly what happens when a student asks a chatbot: they get the right answer and learn nothing.",
      "A student's mistake isn't noise — it's information. It tells you where the reasoning broke. A tool that skips past it to reach the result destroys precisely the most valuable material in the classroom.",
    ],
    decisionLabel: "The decision that defines the system",
    decisionHeadline: "Diagnose instead of answering.",
    decisionBody: [
      "When the student gets it wrong, the model doesn't correct: it identifies what kind of error they made and returns an explanation anchored in the context of that student and that topic. The right answer does arrive, but after the diagnosis — never instead of it.",
      "This isn't a technical decision, it's a pedagogical one. I could make it because I know the classroom, not because I know the API.",
    ],
    whatHeading: "What it does",
    steps: [
      "The teacher uploads their syllabus as a PDF or DOCX.",
      "The system extracts units and topics, and generates assessments and coursework aligned to that specific syllabus.",
      "Separate roles: teacher and student, with persistent history and progress metrics.",
      "Assisted planning module: the AI proposes activities based on grade and context, the teacher accepts or discards with a swipe and can edit each prompt.",
    ],
    closing: "It started as a maths tool. Today it works with any subject and any level.",
    stackLabel: "Stack",
    stack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Tailwind", "LLM APIs", "v0"],
    ctaRepo: "Code on GitHub",
  },

  meta: {
    title: "Mauro Lizárraga — AI Engineer & Fullstack Developer",
    description:
      "I build AI systems that run on their own in production. Case studies on LLM pipelines, EdTech platforms and automation.",
    caseQpsTitle: "Qué Pinta Salta — Case study",
    caseQpsDescription:
      "A five-source ingestion pipeline: the model extracts from the flyers and a deterministic TypeScript filter decides what gets published.",
    caseMaestriaTitle: "MaestrIA — Case study",
    caseMaestriaDescription:
      "EdTech platform that generates assessments aligned to the teacher's syllabus. The model diagnoses the error instead of solving it.",
  },
};
