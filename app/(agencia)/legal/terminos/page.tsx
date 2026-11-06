import { LegalPage } from "@/components/agencia/LegalPage";
import { legalDocs, legalMetadata, legalRelated } from "@/content/agencia/legal-pages";

export const metadata = legalMetadata("terminos");

export default function Page() {
  return <LegalPage doc={legalDocs.terminos} related={legalRelated("terminos")} />;
}
