/* eslint-disable @typescript-eslint/no-require-imports -- script suelto de Node (CommonJS), no es parte de la app */
// Tanda P3-3.1 · capturas deterministas para comparar píxel a píxel contra `main`.
// Uso: node docs/agencia/verificacion/p3-3-1/capturas.js <base> <carpeta> [estilos separados por coma]
//
// Home y /soluciones (con un kit cargado) a 390 y 1280 px, claro y oscuro, de
// página completa. Para que dos corridas del mismo build den los mismos
// píxeles: movimiento reducido (sin idle, sin tecleo, sin balanceo), las
// entradas al scroll forzadas a su estado final, las fuentes ya cargadas, los
// videos de los proyectos en su póster y el flotante de Malejo oculto (carga
// diferida: según cuándo llega, aparece o no en la captura). El resaltado
// del menú que pone SectionSpy al recorrer la página también se limpia.
const { chromium } = require("playwright");
const path = require("node:path");
const fs = require("node:fs");

const BASE = process.argv[2] || "http://localhost:3001";
const OUT = path.resolve(process.argv[3] || ".");
const ESTILOS = (process.argv[4] || "tech,institucional,aula").split(",");
const FIJAR = `[data-reveal]{opacity:1!important;transform:none!important}
video{visibility:hidden!important}
*,*::before,*::after{caret-color:transparent!important;transition:none!important;animation:none!important}
.pointer-events-none.fixed.bottom-3.right-3{display:none!important}`;
const FUENTES = ["700 1em Fredoka", "700 1em Caveat", "400 1em Nunito", "800 1em Nunito", '600 1em "Source Serif 4"', "800 1em Outfit", "400 1em Inter"];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  for (const estilo of ESTILOS)
    for (const tema of ["light", "dark"])
      for (const w of [390, 1280]) {
        const ctx = await b.newContext({ viewport: { width: w, height: w < 500 ? 844 : 900 }, reducedMotion: "reduce" });
        await ctx.addInitScript((e) => localStorage.setItem("malejo-estilo", e), estilo);
        await ctx.addCookies([{ name: "malejo-theme", value: tema, url: BASE }]);
        const p = await ctx.newPage();
        await p.goto(BASE + "/", { waitUntil: "networkidle" });
        await p.evaluate((f) => Promise.all(f.map((x) => document.fonts.load(x))), FUENTES);
        for (const [nombre, url] of [
          ["home", "/"],
          ["soluciones", "/soluciones?a=landing-profesional,turnos-online"],
        ]) {
          await p.goto(BASE + url, { waitUntil: "networkidle" });
          await p.addStyleTag({ content: FIJAR });
          // Recorre la página para que carguen las imágenes en lazy, y vuelve arriba.
          const alto = await p.evaluate(() => document.documentElement.scrollHeight);
          // Pausado, para que cada garabato y cada imagen en lazy llegue a entrar a la vista.
          for (let y = 0; y < alto; y += 400) {
            await p.evaluate((y) => window.scrollTo(0, y), y);
            await p.waitForTimeout(150);
          }
          await p.evaluate(() => window.scrollTo(0, 0));
          await p.waitForTimeout(1200);
          await p.evaluate(() => document.fonts.ready);
          // El menú marca la sección a la vista (SectionSpy) según el recorrido: se limpia.
          await p.evaluate(() => document.querySelectorAll("[data-nav-section][aria-current]").forEach((a) => a.removeAttribute("aria-current")));
          await p.screenshot({ path: path.join(OUT, `${w}-${nombre}-${estilo}-${tema === "light" ? "claro" : "oscuro"}.png`), fullPage: true });
        }
        await ctx.close();
      }
  await b.close();
  console.log("✓ capturas en", OUT);
})();
