/* eslint-disable @typescript-eslint/no-require-imports -- script suelto de Node (CommonJS), no es parte de la app */
// Tanda P3-4 · las caras de Malejo en cada recorte, en los 3 dibujos.
// Uso: node docs/agencia/verificacion/p3-4/caras.js http://localhost:3001
//
// Recorta, con el chat abierto y una charla cargada, el avatar del
// encabezado (40 px), el de los mensajes (32 px), el botón de la barra
// inferior (56 px), el "Soy Mauro" del hero de Tech y el retrato del equipo,
// y arma `caras-<dibujo>.png` y `caras-todas.png` (los 3 dibujos en fila, al
// lado de la imagen de referencia `caras-hoy-vs-propuesta.png`).
const { chromium } = require("playwright");
const path = require("node:path");
const fs = require("node:fs");

const BASE = process.argv[2] || "http://localhost:3001";
const DIR = __dirname;
const CHARLA = {
  msgs: [
    { id: 1, role: "user", text: "Hola", cards: [] },
    { id: 2, role: "assistant", text: "¡Hola! Contame qué necesita tu negocio.", cards: [] },
  ],
  ficha: {},
};

(async () => {
  const b = await chromium.launch();
  const recortes = {};
  for (const dibujo of ["16bit", "chibi", "anime"]) {
    recortes[dibujo] = [];
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 4, reducedMotion: "reduce" });
    await ctx.addInitScript(([d, c]) => {
      localStorage.setItem("malejo-dibujo", d);
      localStorage.setItem("malejo-recorrido", "visto");
      sessionStorage.setItem("malejo-chat-v1", JSON.stringify(c));
    }, [dibujo, CHARLA]);
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    await p.addStyleTag({ content: "[data-reveal]{opacity:1!important;transform:none!important}" });
    await p.waitForTimeout(600);
    const foto = async (sel, nombre) => {
      const el = p.locator(sel).first();
      await el.scrollIntoViewIfNeeded();
      await p.waitForTimeout(400);
      const archivo = path.join(DIR, `cara-${dibujo}-${nombre}.png`);
      await el.screenshot({ path: archivo });
      recortes[dibujo].push(archivo);
    };
    await foto('.nav-inf button[data-malejo-abrir] > span', "barra-56");
    await foto('[data-solo-estilo="tech"] .cara-malejo', "hero-tech");
    await foto('#proyectos .cara-malejo >> visible=true', "equipo");
    await p.evaluate(() => window.dispatchEvent(new CustomEvent("malejo:abrir", { cancelable: true, detail: {} })));
    await p.waitForSelector("[data-avatar-malejo]", { state: "visible", timeout: 15000 });
    await p.waitForTimeout(800);
    await foto("[data-avatar-malejo]", "chat-40");
    await foto('[data-msg="2"] .cara-malejo', "chat-32");
    await ctx.close();
  }
  await b.close();
  fs.writeFileSync(path.join(DIR, "caras.json"), JSON.stringify(recortes, null, 2) + "\n");
  console.log("✓ recortes de las caras en", DIR);
})();
