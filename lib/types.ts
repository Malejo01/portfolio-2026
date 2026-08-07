export type Locale = "es" | "en";

export const LOCALES: readonly Locale[] = ["es", "en"] as const;
export const DEFAULT_LOCALE: Locale = "es";
export const LOCALE_COOKIE = "locale";

export type Theme = "light" | "dark";
export const THEME_COOKIE = "theme";

export interface NavContent {
  wordmark: string;
  links: { href: string; label: string }[];
  themeToggleLabel: string;
  themeToggleAria: string;
  localeToggleAria: string;
  backToHome: string;
  skipToContent: string;
}

export interface AsideItem {
  /** Ausente cuando la fila no lleva título (p. ej. la línea de disponibilidad) */
  term?: string;
  lines: string[];
}

export interface HeroContent {
  eyebrow: string;
  headline: string;
  lede: string;
  ctaPrimary: string;
  ctaCv: string;
  status: string;
  aside: AsideItem[];
}

export interface ProfileContent {
  label: string;
  title: string;
  paragraphs: string[];
  closing: string;
  aside: AsideItem[];
}

export interface ExperienceRow {
  period: string;
  title: string;
  body: string;
}

export interface ExperienceContent {
  label: string;
  rows: ExperienceRow[];
}

export interface CaseCard {
  slug: "que-pinta-salta" | "maestria";
  status: string;
  statusTone: "live" | "wip";
  year: string;
  kicker?: string;
  title: string;
  summary: string;
  highlights?: string[];
  stackLabel?: string;
  stack: string[];
  cta: string;
}

export interface CasesContent {
  label: string;
  note: string;
  cards: CaseCard[];
  ctaLive: string;
  ctaRepo: string;
}

export interface ProjectRow {
  /**
   * Discriminante para resolver la URL en `lib/links.ts`, igual que `slug`
   * en `CaseCard`. La URL no vive acá: la copy no guarda enlaces.
   */
  slug: "salta-pay" | "automotive";
  title: string;
  meta: string;
  body: string;
  stack: string;
}

export interface ProjectsContent {
  label: string;
  note: string;
  rows: ProjectRow[];
}

export interface ContactContent {
  label: string;
  title: string;
  body: string;
  email: string;
  ctaLinkedin: string;
  ctaGithub: string;
  ctaCv: string;
  aside: AsideItem[];
  responseTime: string;
}

export interface FooterContent {
  credit: string;
  built: string;
  scale: string;
}

export interface DiagramLabels {
  alt: string;
  sources: { title: string; a: string; b: string };
  instagram: { title: string; sub: string };
  normalize: { title: string; sub: string };
  model: { title: string; sub: string };
  gate: { title: string; sub1: string; sub2: string };
  published: { title: string; sub: string };
  review: { title: string; sub: string };
  caption: string;
}

export interface CaseStudyQps {
  slug: "que-pinta-salta";
  status: string;
  year: string;
  title: string;
  subtitle: string;
  roleLabel: string;
  role: string;
  problemHeading: string;
  problem: string[];
  decisionHeading: string;
  decisionModel: string;
  decisionModelNote: string;
  decisionCode: string;
  decisionCodeNote: string;
  decisionBody: string[];
  gateAsideLabel: string;
  gateAside: string;
  howHeading: string;
  diagram: DiagramLabels;
  afterDiagram: string[];
  formulaNote: string;
  resultLabel: string;
  result: string;
  stackLabel: string;
  stack: string[];
  ctaLive: string;
  ctaRepo: string;
  ctaInterview: string;
}

export interface CaseStudyMaestria {
  slug: "maestria";
  status: string;
  year: string;
  kicker: string;
  title: string;
  subtitle: string;
  roleLabel: string;
  role: string;
  problemHeading: string;
  problem: string[];
  decisionLabel: string;
  decisionHeadline: string;
  decisionBody: string[];
  whatHeading: string;
  steps: string[];
  closing: string;
  resultLabel: string;
  result: string;
  stackLabel: string;
  stack: string[];
  ctaRepo: string;
}

export interface MetaContent {
  title: string;
  description: string;
  caseQpsTitle: string;
  caseQpsDescription: string;
  caseMaestriaTitle: string;
  caseMaestriaDescription: string;
}

export interface Content {
  nav: NavContent;
  hero: HeroContent;
  profile: ProfileContent;
  experience: ExperienceContent;
  cases: CasesContent;
  projects: ProjectsContent;
  contact: ContactContent;
  footer: FooterContent;
  caseQps: CaseStudyQps;
  caseMaestria: CaseStudyMaestria;
  meta: MetaContent;
}
