// Script de las capturas y mediciones de la tanda R2 (Playwright). Uso:
//   npx next start -p 3005   (y el build de ea4ee29 en 3006 para el "antes")
//   node docs/agencia/verificacion/r2/capturas.js docs/agencia/verificacion/r2 antes
const { chromium } = require("playwright");
const fs = require("fs");
const OUT = process.argv[2];
const FORZAR = "[data-reveal]{opacity:1!important;transform:none!important}";
const rutas = ["/", "/precios", "/servicios", "/servicios/webs", "/servicios/tiendas", "/servicios/turnos", "/servicios/gestion", "/servicios/ia", "/servicios/mant", "/servicios/grandes", "/cotizador", "/demo"];
const PROHIBIDO = /foto profesional|\blandings?\b|\bSEO\b|\bhosting\b|\babonos?\b|\bAPI\b|\bn8n\b|\bsprints?\b/i;
async function medir(base, prefijo, lista, capturar) {
  const b = await chromium.launch(); const filas = {}; const jerga = [];
  for (const [nombre, vp] of [["escritorio", { width: 1440, height: 900 }], ["celular", { width: 390, height: 844 }]]) {
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 1 }); const p = await ctx.newPage();
    for (const r of lista) {
      await p.goto(base + r, { waitUntil: "networkidle" }); await p.addStyleTag({ content: FORZAR });
      // Los videos de proyectos quedan en su póster: la captura es estable.
      await p.evaluate(() => document.querySelectorAll("video").forEach((v) => v.pause()));
      await p.waitForTimeout(3200);
      const h = await p.evaluate(() => document.documentElement.scrollHeight);
      filas[r] = { ...(filas[r] || {}), [nombre]: [h, +(h / vp.height).toFixed(1)] };
      if (nombre === "escritorio") { const t = await p.evaluate(() => document.querySelector("main").innerText); const m = t.match(new RegExp(PROHIBIDO, "gi")); if (m) jerga.push(`${r}: ${[...new Set(m)].join(", ")}`); }
      if (capturar) { const f = `${OUT}/${prefijo}${nombre}${r === "/" ? "-home" : r.replaceAll("/", "-")}.jpg`; await p.screenshot({ path: f, fullPage: true, type: "jpeg", quality: 70 }); }
    }
    await ctx.close();
  }
  await b.close(); return { filas, jerga };
}
(async () => {
  const despues = await medir("http://localhost:3005", "", rutas, true);
  const antes = await medir("http://localhost:3006", "antes-", ["/", "/servicios", "/servicios/webs", "/servicios/grandes", "/cotizador", "/demo"], process.argv[3] === "antes");
  console.log(JSON.stringify({ despues, antes }, null, 1));
})();
