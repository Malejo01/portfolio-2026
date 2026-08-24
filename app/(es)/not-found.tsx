import type { Metadata } from "next";
import { StatusPage } from "@/components/layout/StatusPage";
import { ButtonLink, ButtonRow } from "@/components/ui/ButtonLink";
import { getContent } from "@/lib/content";
import { errors } from "@/lib/content/errors";
import { localized } from "@/lib/routes";

/**
 * `robots` se declara aunque Next ya emita su propio `noindex` en esta
 * ruta: sin el override, la página hereda el `index, follow` del root
 * layout y el HTML sale con dos directivas que se contradicen.
 */
export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: true },
};

/**
 * Ya no monta `SiteShell` por su cuenta: el root layout de este árbol lo
 * pone, y este archivo vive adentro de ese layout. Lo dispara el
 * `[...notFound]` vecino, que es lo que garantiza que una URL no matcheada
 * de este idioma caiga en **este** 404 y no en el del otro árbol.
 */
export default function NotFound() {
  const copy = errors["es"];
  const { nav, cases } = getContent("es");

  return (
    <StatusPage label={copy.notFoundLabel} title={copy.notFoundTitle} body={copy.notFoundBody}>
      <ButtonRow>
        <ButtonLink href={localized("/", "es")} tone="solid" surface="paper">
          {nav.backToHome}
        </ButtonLink>
        <ButtonLink href={localized("/#casos", "es")} surface="paper">
          {cases.label}
        </ButtonLink>
      </ButtonRow>
    </StatusPage>
  );
}
