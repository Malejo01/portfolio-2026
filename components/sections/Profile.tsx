import { Reveal } from "@/components/motion/Reveal";
import { Aside } from "@/components/ui/Aside";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { ProfileContent } from "@/lib/types";

export function Profile({ profile }: { profile: ProfileContent }) {
  return (
    <Reveal
      as="section"
      className="flex flex-wrap items-start gap-main pt-section pb-[clamp(32px,5vw,56px)]"
    >
      <div id="perfil" className="min-w-0 max-w-[64ch] flex-1 basis-[38ch]">
        <SectionLabel className="mb-3.5">{profile.label}</SectionLabel>

        <h2 className="mt-0 mb-lede font-display text-title leading-[1.1] font-semibold opsz-48 tracking-[-0.02em]">
          {profile.title}
        </h2>

        {profile.paragraphs.map((text) => (
          <p key={text.slice(0, 24)} className="mt-0 mb-4 text-ink-soft">
            {text}
          </p>
        ))}

        <p className="m-0 font-medium text-ink">{profile.closing}</p>
      </div>

      <Aside items={profile.aside} separated />
    </Reveal>
  );
}
