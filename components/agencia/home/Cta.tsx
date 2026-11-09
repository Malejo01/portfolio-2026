import { WHATSAPP_TEXTO, home } from "@/content/agencia/home";
import { agendaLink, waLink } from "@/lib/agencia/config";
import { Icon } from "../icons";
import { MalejoMark } from "../MalejoMark";
import { AbrirChat } from "../client/AbrirChat";
import { Reveal } from "../client/Reveal";
import { FaqList } from "./Faq";

/**
 * Cierre "¿Lo charlamos?" (`09-cierre-*.png`). Tanda R2: el chat de Malejo
 * es la acción principal; WhatsApp y la videollamada, secundarias. Debajo,
 * 3 preguntas frecuentes en `<details>` (el FAQ largo salió de la home: cada
 * solución tiene el suyo). `id="faq"` mantiene vivos los `/#faq` viejos.
 */
export function Cta() {
  const { cta } = home;
  const wa = waLink(WHATSAPP_TEXTO);

  return (
    <section id="contacto" className="wrap pb-16 pt-14 sm:pb-20 sm:pt-16">
      <Reveal>
        <div className="card card-big hi grid grid-cols-1 items-center gap-6 bg-[radial-gradient(80%_120%_at_100%_0%,var(--ic-bg)_0%,var(--surf)_55%)] p-6 sm:gap-8 sm:p-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="relative flex flex-col gap-3 sm:gap-4">
            <MalejoMark size={48} className="hidden text-acc sm:block" />
            <span className="lbl lbl-o">{cta.label}</span>
            <h2 className="h text-[40px] leading-none sm:text-[52px]">{cta.title}</h2>
            <p className="m-0 text-[17px] leading-[1.55] text-muted sm:text-lg">{cta.lead}</p>
          </div>
          <div className="flex flex-col gap-3">
            <AbrirChat href={wa} className="btn btn-p h-13 sm:h-14">
              <Icon name="chat" size={20} />
              {cta.primary}
            </AbrirChat>
            <a href={wa} className="btn btn-s h-12" target="_blank" rel="noopener">
              <Icon name="whatsapp" size={18} />
              {cta.whatsapp}
            </a>
            <a href={agendaLink()} className="btn btn-s h-12" target="_blank" rel="noopener">
              {cta.agenda}
            </a>
          </div>
          <div id="faq" className="scroll-mt-[104px] lg:col-span-2">
            <h3 className="lbl m-0">{cta.faqLabel}</h3>
            <FaqList items={cta.faq} name="faq-cierre" compact />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
