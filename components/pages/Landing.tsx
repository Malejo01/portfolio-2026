import { CaseStudies } from "@/components/sections/CaseStudies";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { OtherProjects } from "@/components/sections/OtherProjects";
import { Profile } from "@/components/sections/Profile";
import { getContent } from "@/lib/content";
import type { Locale } from "@/lib/types";

/**
 * El cuerpo del home. Vive acá y no en un `page.tsx` porque hay dos rutas
 * que lo renderizan —`/` y `/en`— y cada una tiene su propio archivo de
 * ruta en su árbol de idioma. Lo único que cambia entre las dos es este
 * `locale`.
 */
export function Landing({ locale }: { locale: Locale }) {
  const content = getContent(locale);

  return (
    <>
      <Hero hero={content.hero} contactTerm={content.contact.label} locale={locale} />
      <Profile profile={content.profile} />
      <Experience experience={content.experience} />
      <CaseStudies cases={content.cases} locale={locale} />
      <OtherProjects projects={content.projects} />
      <Contact contact={content.contact} />
    </>
  );
}
