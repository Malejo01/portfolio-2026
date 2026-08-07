import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { StatusPage } from "@/components/layout/StatusPage";
import { ButtonLink, ButtonRow } from "@/components/ui/ButtonLink";
import { getContent } from "@/lib/content";
import { errors } from "@/lib/content/errors";
import { getLocale } from "@/lib/locale";

/**
 * `robots` se declara aunque Next ya emita su propio `noindex` en esta
 * ruta: sin el override, la página hereda el `index, follow` del root
 * layout y el HTML sale con dos directivas que se contradicen. Duplicada y
 * coherente es mejor que heredada y contradictoria.
 */
export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: true },
};

/**
 * Vive en el root, no en `(marketing)`: para una URL que no matchea
 * ninguna ruta, Next resuelve el 404 contra el root layout y un
 * `not-found.tsx` dentro del route group nunca se dispara. Por eso monta
 * `SiteShell` explícitamente — sin esto la página sale sin nav ni footer,
 * en inglés y con los estilos inline del default de Next, que pisan el
 * fondo del tema.
 */
export default async function NotFound() {
  const locale = await getLocale();
  const copy = errors[locale];
  const { nav, cases } = getContent(locale);

  return (
    <SiteShell>
      <StatusPage label={copy.notFoundLabel} title={copy.notFoundTitle} body={copy.notFoundBody}>
        <ButtonRow>
          <ButtonLink href="/" tone="solid" surface="paper">
            {nav.backToHome}
          </ButtonLink>
          <ButtonLink href="/#casos" surface="paper">
            {cases.label}
          </ButtonLink>
        </ButtonRow>
      </StatusPage>
    </SiteShell>
  );
}
