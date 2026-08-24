import type { Metadata } from "next";
import { CaseQps } from "@/components/pages/CaseQps";
import { caseMetadata } from "@/lib/metadata";

export const metadata: Metadata = caseMetadata("es", "qps");

export default function Page() {
  return <CaseQps locale="es" />;
}
