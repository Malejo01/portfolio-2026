import { CaseStudies } from "@/components/sections/CaseStudies";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { OtherProjects } from "@/components/sections/OtherProjects";
import { Profile } from "@/components/sections/Profile";
import { getContent } from "@/lib/content";
import { getLocale } from "@/lib/locale";

export default async function LandingPage() {
  const content = getContent(await getLocale());

  return (
    <>
      <Hero hero={content.hero} contactTerm={content.contact.label} />
      <Profile profile={content.profile} />
      <Experience experience={content.experience} />
      <CaseStudies cases={content.cases} />
      <OtherProjects projects={content.projects} />
      <Contact contact={content.contact} />
    </>
  );
}
