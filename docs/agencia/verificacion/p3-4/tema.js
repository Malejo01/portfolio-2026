/* eslint-disable @typescript-eslint/no-require-imports -- script suelto de Node (CommonJS), no es parte de la app */
// Tanda P3-4 · el tema por estilo, en perfiles limpios (como incógnito).
// Uso: node docs/agencia/verificacion/p3-4/tema.js http://localhost:3001
//
// 1. Sin nada guardado, cada estilo arranca en su tema: Tech oscuro,
//    Institucional claro, Aula oscuro, Tienda claro (eligiéndolo en el
//    selector y al recargar).
// 2. Institucional → oscuro con el botón → Tech → volver a Institucional:
//    Institucional sigue oscuro y Tech no cambió.
// 3. La cookie vieja `malejo-theme` (oscuro y claro): pasa a
//    `malejo-tema-tech` una vez, se borra, y no toca a Institucional.
// 4. El 404 respeta todo lo anterior.
// Escribe `tema.json`.
const { chromium } = require("playwright");
const path = require("node:path");
const fs = require("node:fs");

const BASE = process.argv[2] || "http://localhost:3001";
const ESTADO = () => ({
  estilo: document.documentElement.getAttribute("data-estilo"),
  tema: document.documentElement.classList.contains("dark") ? "oscuro" : "claro",
  claves: Object.fromEntries(Object.keys(localStorage).filter((k) => k.startsWith("malejo-tema-")).map((k) => [k, localStorage.getItem(k)])),
  cookie: document.cookie.includes("malejo-theme=") ? document.cookie.match(/malejo-theme=([^;]*)/)[1] : null,
});

(async () => {
  const b = await chromium.launch();
  const casos = [];
  const fallas = [];
  const chequear = (nombre, obtenido, esperado) => {
    const ok = Object.entries(esperado).every(([k, v]) => JSON.stringify(obtenido[k]) === JSON.stringify(v));
    casos.push({ nombre, ok, obtenido, esperado });
    console.log(ok ? "✓" : "✗", nombre, ok ? "" : JSON.stringify({ obtenido, esperado }));
    if (!ok) fallas.push(nombre);
  };
  const perfil = async (cookie) => {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
    // Sin recorrido: no tapa el selector.
    await ctx.addInitScript(() => localStorage.setItem("malejo-recorrido", "visto"));
    if (cookie) await ctx.addCookies([{ name: "malejo-theme", value: cookie, url: BASE }]);
    const p = await ctx.newPage();
    return { ctx, p };
  };
  const elegir = async (p, nombre) => {
    await p.locator(".estilos-pestana").click();
    await p.locator(".estilos-dlg button.estilo-mini", { hasText: nombre }).click();
    await p.waitForTimeout(900);
    if (await p.locator(".estilos-dlg[open]").count()) await p.keyboard.press("Escape");
    await p.waitForTimeout(200);
  };
  const toggle = async (p) => {
    await p.locator('header button[aria-label^="Cambiar a modo"]').first().click();
    await p.waitForTimeout(300);
  };

  // 1. Cada estilo en su tema de entrada.
  {
    const { ctx, p } = await perfil();
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    chequear("sin nada: Tech oscuro", await p.evaluate(ESTADO), { estilo: "tech", tema: "oscuro" });
    for (const [nombre, id, tema] of [
      ["Institucional", "institucional", "claro"],
      ["Aula virtual", "aula", "oscuro"],
      ["Tienda", "tienda", "claro"],
      ["Tech / IA", "tech", "oscuro"],
    ]) {
      await elegir(p, nombre);
      chequear(`selector: ${nombre} ${tema}`, await p.evaluate(ESTADO), { estilo: id, tema, claves: {} });
      await p.reload({ waitUntil: "networkidle" });
      chequear(`recarga: ${nombre} ${tema}`, await p.evaluate(ESTADO), { estilo: id, tema });
    }
    await ctx.close();
  }

  // 2. Lo que se cambia queda en su estilo.
  {
    const { ctx, p } = await perfil();
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    await elegir(p, "Institucional");
    await toggle(p);
    chequear("Institucional → oscuro", await p.evaluate(ESTADO), {
      estilo: "institucional",
      tema: "oscuro",
      claves: { "malejo-tema-institucional": "dark" },
    });
    await elegir(p, "Tech / IA");
    chequear("→ Tech: sigue oscuro (su entrada)", await p.evaluate(ESTADO), { estilo: "tech", tema: "oscuro" });
    await elegir(p, "Institucional");
    chequear("→ Institucional: sigue oscuro", await p.evaluate(ESTADO), { estilo: "institucional", tema: "oscuro" });
    await elegir(p, "Tech / IA");
    await toggle(p);
    await elegir(p, "Institucional");
    chequear("Tech → claro no toca a Institucional", await p.evaluate(ESTADO), {
      estilo: "institucional",
      tema: "oscuro",
      claves: { "malejo-tema-institucional": "dark", "malejo-tema-tech": "light" },
    });
    await elegir(p, "Tech / IA");
    chequear("Tech recuerda claro", await p.evaluate(ESTADO), { estilo: "tech", tema: "claro" });
    // 4. El 404 con lo mismo guardado.
    await elegir(p, "Institucional");
    await p.goto(BASE + "/no-existe-p34", { waitUntil: "networkidle" });
    chequear("404: Institucional oscuro", await p.evaluate(ESTADO), { estilo: "institucional", tema: "oscuro" });
    await p.evaluate(() => localStorage.setItem("malejo-estilo", "tech"));
    await p.reload({ waitUntil: "networkidle" });
    chequear("404: Tech claro", await p.evaluate(ESTADO), { estilo: "tech", tema: "claro" });
    await p.evaluate(() => localStorage.setItem("malejo-estilo", "tienda"));
    await p.reload({ waitUntil: "networkidle" });
    chequear("404: Tienda claro (nada guardado)", await p.evaluate(ESTADO), { estilo: "tienda", tema: "claro" });
    await ctx.close();
  }

  // 3. La cookie vieja.
  for (const valor of ["dark", "light"]) {
    const tema = valor === "dark" ? "oscuro" : "claro";
    const { ctx, p } = await perfil(valor);
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    chequear(`cookie vieja ${tema}: Tech ${tema}, migrada y borrada`, await p.evaluate(ESTADO), {
      estilo: "tech",
      tema,
      claves: { "malejo-tema-tech": valor },
      cookie: null,
    });
    await elegir(p, "Institucional");
    chequear(`cookie vieja ${tema}: Institucional claro`, await p.evaluate(ESTADO), { estilo: "institucional", tema: "claro" });
    await ctx.close();
  }
  {
    // En el 404, primera visita con la cookie vieja.
    const { ctx, p } = await perfil("light");
    await p.goto(BASE + "/no-existe-p34", { waitUntil: "networkidle" });
    chequear("404 con la cookie vieja clara: Tech claro, migrada", await p.evaluate(ESTADO), {
      estilo: "tech",
      tema: "claro",
      claves: { "malejo-tema-tech": "light" },
      cookie: null,
    });
    await ctx.close();
  }

  await b.close();
  fs.writeFileSync(path.join(__dirname, "tema.json"), JSON.stringify({ base: BASE, fallas, casos }, null, 2) + "\n");
  console.log(fallas.length ? `\n${fallas.length} fallas` : "\nTodo OK");
  process.exitCode = fallas.length ? 1 : 0;
})();
