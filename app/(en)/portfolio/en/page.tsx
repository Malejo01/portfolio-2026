import type { Metadata } from "next";
import { Landing } from "@/components/pages/Landing";
import { homeMetadata } from "@/lib/metadata";

export const metadata: Metadata = homeMetadata("en");

export default function Page() {
  return <Landing locale="en" />;
}
