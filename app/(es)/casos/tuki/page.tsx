import type { Metadata } from "next";
import { CaseTuki } from "@/components/pages/CaseTuki";
import { caseMetadata } from "@/lib/metadata";

export const metadata: Metadata = caseMetadata("es", "tuki");

export default function Page() {
  return <CaseTuki locale="es" />;
}
