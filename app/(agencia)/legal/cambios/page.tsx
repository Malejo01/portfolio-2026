import { LegalPage } from "@/components/agencia/LegalPage";
import { legalDocs, legalMetadata, legalRelated } from "@/content/agencia/legal-pages";

export const metadata = legalMetadata("cambios");

export default function Page() {
  return <LegalPage doc={legalDocs.cambios} related={legalRelated("cambios")} />;
}
