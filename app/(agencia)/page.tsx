import type { Metadata } from "next";
import { HomePage } from "@/components/agencia/home/HomePage";

/** Hereda título, descripción y OG del layout; solo declara su canonical. */
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Page() {
  return <HomePage />;
}
