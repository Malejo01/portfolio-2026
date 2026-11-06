import { home } from "@/content/agencia/home";
import { agendaLink, waLink } from "@/lib/agencia/config";
import { Icon } from "../icons";
import { MalejoMark } from "../MalejoMark";
import { Reveal } from "../client/Reveal";

/** Cierre "¿Lo charlamos?" (`09-cierre-*.png`). */
export function Cta() {
  const { cta } = home;

  return (
    <section id="contacto" className="wrap pb-24 pt-[72px] sm:pt-24">
      <Reveal>
        <div className="card card-big hi grid grid-cols-1 items-center gap-10 bg-[radial-gradient(80%_120%_at_100%_0%,var(--ic-bg)_0%,var(--surf)_55%)] p-7 sm:p-14 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="relative flex flex-col gap-4">
            <MalejoMark size={56} className="text-acc" />
            <span className="lbl lbl-o">{cta.label}</span>
            <h2 className="h text-[40px] leading-none sm:text-[52px]">{cta.title}</h2>
            <p className="m-0 text-[17px] leading-[1.55] text-muted sm:text-lg">{cta.lead}</p>
          </div>
          <div className="flex flex-col gap-3">
            <a href={waLink(cta.whatsappText)} className="btn btn-p h-14" target="_blank" rel="noopener">
              <Icon name="chat" size={20} />
              {cta.whatsapp}
            </a>
            <a href={agendaLink()} className="btn btn-s h-14" target="_blank" rel="noopener">
              {cta.agenda}
            </a>
            <span className="text-center text-[13px] text-muted">{cta.hint}</span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
