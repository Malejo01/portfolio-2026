import type { Metadata } from "next";
import { Landing } from "@/components/pages/Landing";
import { homeMetadata } from "@/lib/metadata";

export const metadata: Metadata = homeMetadata("es");

export default function Page() {
  return <Landing locale="es" />;
}
