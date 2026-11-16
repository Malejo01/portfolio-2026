/* eslint-disable @typescript-eslint/no-require-imports -- script suelto de Node (CommonJS), no es parte de la app */
// Tanda P3-3.1 · capturas de /soluciones en Tienda con la franja de los planes
// y el título del ticket, a 390 y 1280 px en claro y oscuro, al lado de
// F-soluciones.html y F-soluciones-celular.html.
// Uso: node docs/agencia/verificacion/p3-3-1/tienda.js http://localhost:3001
const { chromium } = require("playwright");
const path = require("node:path");

const BASE = process.argv[2] || "http://localhost:3001";
const DIR = __dirname;
const URL = "/soluciones?cat=tiendas&a=catalogo-con-pedidos-por-whatsapp";

(async () => {
  const b = await chromium.launch();
  for (const tema of ["light", "dark"])
    for (const w of [390, 1280]) {
      const nombre = tema === "light" ? "claro" : "oscuro";
      const ctx = await b.newContext({ viewport: { width: w, height: w < 500 ? 844 : 1000 }, deviceScaleFactor: w < 500 ? 2 : 1, reducedMotion: "reduce" });
      await ctx.addInitScript(() => localStorage.setItem("malejo-estilo", "tienda"));
      await ctx.addCookies([{ name: "malejo-theme", value: tema, url: BASE }]);
      const p = await ctx.newPage();
      await p.goto(BASE + "/", { waitUntil: "networkidle" });
      await p.evaluate(() => Promise.all(["700 1em Fredoka", "400 1em Nunito", "800 1em Nunito"].map((f) => document.fonts.load(f))));
      await p.goto(BASE + URL, { waitUntil: "networkidle" });
      await p.addStyleTag({ content: "[data-reveal]{opacity:1!important;transform:none!important}" });
      await p.evaluate(() => document.getElementById("sol-titulo-tiendas").scrollIntoView({ block: "start", behavior: "instant" }));
      await p.evaluate(() => window.scrollBy(0, -120));
      await p.waitForTimeout(800);
      await p.screenshot({ path: path.join(DIR, `${w}-soluciones-tienda-${nombre}.png`) });
      if (w < 500) {
        // El ticket en el celular: la hoja del kit.
        await p.click(".barra-armado button");
        await p.waitForTimeout(800);
        await p.screenshot({ path: path.join(DIR, `${w}-soluciones-tienda-${nombre}-kit.png`) });
      }
      await ctx.close();
    }
  for (const [f, w, h] of [
    ["F-soluciones", 1440, 1100],
    ["F-soluciones-celular", 390, 844],
  ]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    const p = await ctx.newPage();
    await p.goto("file://" + path.resolve(DIR, "../../estilos/tienda", f + ".html"), { waitUntil: "load" }).catch(() => {});
    await p.waitForTimeout(1000);
    await p.screenshot({ path: path.join(DIR, `ref-${f}.png`) });
    await ctx.close();
  }
  await b.close();
  console.log("✓ capturas de Tienda en", DIR);
})();
