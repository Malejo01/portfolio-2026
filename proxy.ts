import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE, LOCALES, type Locale } from "@/lib/types";

const YEAR = 60 * 60 * 24 * 365;

function isLocale(value: string | undefined): value is Locale {
  return value === "es" || value === "en";
}

function fromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  for (const part of header.split(",")) {
    const base = part.split(";")[0]?.trim().toLowerCase().split("-")[0];
    if (base && LOCALES.includes(base as Locale)) return base as Locale;
  }
  return null;
}

/**
 * Solo persiste la negociación del navegador la primera vez. Si ya hay
 * cookie —puesta acá o por el toggle del nav— el proxy no la toca.
 */
export function proxy(request: NextRequest) {
  if (isLocale(request.cookies.get(LOCALE_COOKIE)?.value)) return NextResponse.next();

  const detected = fromAcceptLanguage(request.headers.get("accept-language")) ?? "es";

  // Escribir también en la request para que `cookies()` la vea en este mismo
  // render, no recién en la navegación siguiente.
  request.cookies.set(LOCALE_COOKIE, detected);
  const response = NextResponse.next({ request });
  response.cookies.set(LOCALE_COOKIE, detected, {
    path: "/",
    maxAge: YEAR,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|pdf|ico)$).*)"],
};
