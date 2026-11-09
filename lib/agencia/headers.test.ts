import { describe, expect, it } from "vitest";
import { getPathMatch } from "next/dist/shared/lib/router/utils/path-match";
import nextConfig from "@/next.config";
import { CSP_REPORT_ONLY, FUENTE_AGENCIA, HEADERS_AGENCIA } from "./headers";

/** S10: los headers van en la agencia y no tocan el portfolio. */
describe("headers de seguridad (R2)", () => {
  const coincide = getPathMatch(FUENTE_AGENCIA);

  it("aplican a las rutas de la agencia", () => {
    for (const r of ["/", "/precios", "/servicios/webs", "/demo", "/api/chat", "/blog/como-cotizo", "/legal/terminos"]) {
      expect(coincide(r), r).not.toBe(false);
    }
  });

  it("no aplican al portfolio", () => {
    for (const r of ["/portfolio", "/portfolio/en", "/portfolio/casos/tuki", "/portfolio/en/casos/maestria"]) {
      expect(coincide(r), r).toBe(false);
    }
  });

  it("next.config los declara con esa fuente", async () => {
    const reglas = await nextConfig.headers!();
    expect(reglas).toEqual([{ source: FUENTE_AGENCIA, headers: HEADERS_AGENCIA }]);
    const nombres = HEADERS_AGENCIA.map((h) => h.key);
    expect(nombres).toEqual(["X-Frame-Options", "X-Content-Type-Options", "Referrer-Policy", "Permissions-Policy", "Content-Security-Policy-Report-Only"]);
    expect(nombres).not.toContain("Content-Security-Policy");
  });

  it("la CSP (report-only) permite lo que usa el sitio", () => {
    for (const fuente of ["https://challenges.cloudflare.com", "https://cal.com", "'unsafe-inline'", "media-src 'self'", "frame-ancestors 'none'"]) {
      expect(CSP_REPORT_ONLY).toContain(fuente);
    }
  });
});
