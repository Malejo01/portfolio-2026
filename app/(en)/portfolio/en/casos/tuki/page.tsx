import type { Metadata } from "next";
import { CaseTuki } from "@/components/pages/CaseTuki";
import { caseMetadata } from "@/lib/metadata";

export const metadata: Metadata = caseMetadata("en", "tuki");

export default function Page() {
  return <CaseTuki locale="en" />;
}
