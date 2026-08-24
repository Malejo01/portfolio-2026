import type { Metadata } from "next";
import { CaseMaestria } from "@/components/pages/CaseMaestria";
import { caseMetadata } from "@/lib/metadata";

export const metadata: Metadata = caseMetadata("en", "maestria");

export default function Page() {
  return <CaseMaestria locale="en" />;
}
