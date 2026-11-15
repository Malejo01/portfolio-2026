import type { Metadata } from "next";
import Link from "next/link";
import { Armador, type CategoriaArmador } from "@/components/agencia/client/Armador";
import { Caminos } from "@/components/agencia/client/Caminos";
import { PlanDialog } from "@/components/agencia/client/PlanDialog";
import { Icon } from "@/components/agencia/icons";
import { CondicionesModal, CostosFranja, ExtrasModal } from "@/components/agencia/InfoPagos";
import { SenaTabla } from "@/components/agencia/SenaTabla";
import { PanelArmado } from "@/components/agencia/soluciones/PanelArmado";
import { WHATSAPP_TEXTO, home } from "@/content/agencia/home";
import { categories, senaCopy } from "@/content/agencia/pricing";
import { solucion } from "@/content/agencia/servicios";
import { solucionesCopy as copy } from "@/content/agencia/soluciones";
import { waLink } from "@/lib/agencia/config";
import { siteUrl } from "@/lib/links";

export const metadata: Metadata = {
  title: { absolute: `${copy.metaTitle} · Malejo` },
  description: copy.description,
  alternates: { canonical: "/soluciones" },
  openGraph: { title: copy.metaTitle, description: copy.description, url: "/soluciones", images: ["/og"] },
};

/** `BreadcrumbList`: Inicio → Soluciones. `<` escapado, como el resto del JSON-LD. */
function breadcrumb(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: copy.breadcrumb.inicio, item: siteUrl },
      { "@type": "ListItem", position: 2, name: copy.breadcrumb.soluciones, item: `${siteUrl}/soluciones` },
    ],
  }).replace(/</g, "\\u003c");
}

/**
 * `/soluciones` (tanda P2, D1): `/precios` y `/cotizador` en una sola
 * página-armador. Estática (`○`): `?cat=` y `?a=` se leen en el cliente.
 *
 * Arriba, los dos caminos (D6) y la franja del auto, el taller y la nafta.
 * Abajo, el armador: la isla `Armador` con los paneles que arma el
 * servidor (`PanelArmado`), los extras y la tabla de la seña como modales.
 * Sin JS, todo el catálogo queda en `<details>` y el carrito se reemplaza
 * por WhatsApp y "Contame qué necesitás".
 */
export default function SolucionesPage() {
  const wa = waLink(WHATSAPP_TEXTO);
  const tabs: CategoriaArmador[] = categories.map((c) => {
    const s = solucion(c.key);
    return { key: c.key, label: c.label, short: s?.label ?? c.label, icon: s?.icon ?? "web" };
  });
  const paneles = Object.fromEntries(categories.map((c) => [c.key, <PanelArmado key={c.key} category={c} />]));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumb() }} />
      <section className="wrap pb-24 pt-8 sm:pt-14">
        <span className="lbl lbl-o">{copy.label}</span>
        <h1 className="h h2 max-w-[16em]">{copy.title}</h1>
        <p className="mb-0 mt-2 max-w-[40em] text-[17px] text-muted">{copy.lead}</p>
        <Caminos yaSe={copy.yaSe} ayudame={copy.ayudame} whatsapp={wa} />
        <div className="mt-6">
          <CostosFranja />
        </div>

        {/* Sin JS: no hay carrito; WhatsApp y el formulario de siempre. */}
        <div className="nojs-only card mt-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="h m-0 text-[20px]">{copy.sinJs.titulo}</p>
            <p className="m-0 text-[15px] text-muted">{copy.sinJs.lead}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a href={wa} target="_blank" rel="noopener" className="btn btn-p">
              <Icon name="whatsapp" size={18} />
              {copy.sinJs.whatsapp}
            </a>
            <Link href="/demo" className="btn btn-s">
              {copy.sinJs.contame}
            </Link>
          </div>
        </div>

        <Armador
          categorias={tabs}
          paneles={paneles}
          copy={copy}
          extrasSlot={<ExtrasModal armado />}
          senaSlot={
            <PlanDialog variant="info" label={senaCopy.tabla.titulo} title={senaCopy.tabla.titulo} closeLabel={home.pricing.modal.cerrar} triggerClassName="lnk min-h-11 text-[13px]">
              <SenaTabla titulo={false} />
            </PlanDialog>
          }
          turnstileSiteKey={process.env.TURNSTILE_SITE_KEY || undefined}
        />

        <div className="mt-10">
          <CondicionesModal />
        </div>
      </section>
    </>
  );
}
