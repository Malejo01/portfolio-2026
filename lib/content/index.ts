import type { Content, Locale } from "@/lib/types";
import { es } from "./es";
import { en } from "./en";

export const dictionary: Record<Locale, Content> = { es, en };

export function getContent(locale: Locale): Content {
  return dictionary[locale];
}
