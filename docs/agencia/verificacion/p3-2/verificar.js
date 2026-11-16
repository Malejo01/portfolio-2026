/* eslint-disable @typescript-eslint/no-require-imports -- script suelto de Node (CommonJS), no es parte de la app */
// Verificación de la tanda P3-2 (estilo Aula virtual).
// Uso, con un build de producción:
//   CHAT_ALLOWED_ORIGINS=http://localhost:3001 npx next start -p 3001
//   node docs/agencia/verificacion/p3-2/verificar.js http://localhost:3001
//
//  1. Aula × claro/oscuro × 360, 390 y 1280 px, en la home, /soluciones, una
//     solución, /demo, el 404 y la home con el chat abierto: sin overflow,
//     contraste AA contra el fondo efectivo y ningún garabato encima de
//     texto o botones.
//  2. Celular: los 2 botones del hero arriba del pliegue.
//  3. Personaje: Aula sin dibujo elegido muestra el anime; con chibi elegido,
//     se queda el chibi.
//  4. Tema: Aula sin tema elegido, oscuro; con claro elegido, la pizarra blanca.
//  5. El selector ya no dice "Próximamente" en Aula.
// Las fuentes de Aula van sin precarga y con `display: optional`: cada
// contexto carga la página una vez antes de medir (como quien llega desde el
// selector, que las descarga antes de cambiar).
// Escribe `resultado.json` y las capturas en esta carpeta.
const { chromium } = require("playwright");
const path = require("node:path");
const fs = require("node:fs");

const BASE = process.argv[2] || "http://localhost:3001";
const DIR = __dirname;
const FORZAR = "[data-reveal]{opacity:1!important;transform:none!important}";
const ESTILOS = ["aula"];
const TEMAS = ["light", "dark"];
const PAGINAS = ["/", "/soluciones?a=landing-profesional,turnos-online", "/servicios/ia", "/demo", "/no-existe-esta-pagina", "/#chat"];
const ANCHOS = [
  [360, 740],
  [390, 844],
  [1280, 900],
];
const fallas = [];
const falla = (m) => {
  fallas.push(m);
  console.log("✗", m);
};

async function contexto(b, { estilo, tema, w, h, js = true, reducido = false, dibujo }) {
  const ctx = await b.newContext({
    viewport: { width: w, height: h },
    javaScriptEnabled: js,
    reducedMotion: reducido ? "reduce" : "no-preference",
  });
  if (estilo) {
    await ctx.addInitScript(
      ([e, d]) => {
        try {
          if (!sessionStorage.getItem("__p31")) {
            sessionStorage.setItem("__p31", "1");
            localStorage.setItem("malejo-estilo", e);
            if (d) localStorage.setItem("malejo-dibujo", d);
          }
        } catch {}
      },
      [estilo, dibujo || ""],
    );
  }
  if (tema) await ctx.addCookies([{ name: "malejo-theme", value: tema, url: BASE }]);
  return ctx;
}

/** Abre el chat como cualquier botón "Hablar con Malejo" (`lib/agencia/abrir-chat.ts`). */
async function abrirChat(p) {
  await p.evaluate(() => window.dispatchEvent(new CustomEvent("malejo:abrir", { cancelable: true, detail: {} })));
}

/** Primera carga para que las fuentes queden en caché (ver arriba). */
async function calentar(p) {
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.evaluate(() => Promise.all(["700 1em Caveat", "400 1em Nunito", "800 1em Nunito"].map((f) => document.fonts.load(f))));
}

/**
 * Garabatos que tapan texto o botones. Se compara la caja del garabato con
 * las cajas del texto (Range) y de los botones y enlaces, no con la caja de
 * bloque de un título, que ocupa todo el ancho aunque el texto no. Lo que es
 * `position: fixed` (el flotante de Malejo, la barra inferior) no cuenta:
 * pasa por encima de todo según el scroll.
 */
function garabatosEncima() {
  const visible = (e) => e.getClientRects().length && getComputedStyle(e).visibility !== "hidden";
  const fijo = (e) => {
    for (let n = e; n; n = n.parentElement) if (getComputedStyle(n).position === "fixed") return true;
    return false;
  };
  const gs = [...document.querySelectorAll(".garabato")].filter(visible).map((g) => [g, g.getBoundingClientRect()]).filter(([, r]) => r.width > 0);
  const cajas = [];
  for (const el of document.querySelectorAll("a, button")) {
    if (!visible(el) || el.closest(".garabato") || fijo(el)) continue;
    cajas.push([el, el.getBoundingClientRect()]);
  }
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) {
    const t = w.currentNode;
    const el = t.parentElement;
    if (!t.textContent.trim() || !el || !visible(el) || el.closest(".garabato") || fijo(el)) continue;
    const rango = document.createRange();
    rango.selectNodeContents(t);
    for (const r of rango.getClientRects()) cajas.push([el, r]);
  }
  const choques = [];
  for (const [g, r] of gs) {
    for (const [o, q] of cajas) {
      if (g.contains(o)) continue;
      const x = Math.min(r.right, q.right) - Math.max(r.left, q.left);
      const y = Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top);
      if (x > 4 && y > 4) choques.push(`${(g.textContent || "trazo").trim().slice(0, 20)} sobre ${o.tagName} "${(o.textContent || "").trim().slice(0, 30)}"`);
    }
  }
  return [...new Set(choques)];
}

async function abrir(p, url) {
  await p.goto(BASE + url, { waitUntil: "networkidle" });
  await p.addStyleTag({ content: FORZAR }).catch(() => {});
  await p.waitForTimeout(400);
}

/** Contraste de todo el texto visible contra su fondo efectivo. */
function medirContraste() {
  const parse = (c) => {
    const m = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
    return m ? [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]] : null;
  };
  const lum = ([r, g, b]) => {
    const f = (x) => {
      x /= 255;
      return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const mezclar = (arriba, abajo) => [0, 1, 2].map((i) => arriba[i] * arriba[3] + abajo[i] * (1 - arriba[3])).concat(1);
  const fondo = (el) => {
    const capas = [];
    for (let n = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage !== "none" && !cs.backgroundImage.startsWith("linear-gradient(90deg")) return null; // degradé o imagen: no se mide
      const c = parse(cs.backgroundColor);
      if (c && c[3] > 0) {
        capas.push(c);
        if (c[3] >= 1) break;
      }
    }
    let base = [255, 255, 255, 1];
    for (let i = capas.length - 1; i >= 0; i--) base = mezclar(capas[i], base);
    return base;
  };
  const opaco = (el) => {
    for (let n = el; n; n = n.parentElement) if (parseFloat(getComputedStyle(n).opacity) < 0.99) return false;
    return true;
  };
  const malos = [];
  const vistos = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const t = walker.currentNode;
    if (!t.textContent.trim()) continue;
    const el = t.parentElement;
    if (!el || vistos.has(el)) continue;
    vistos.add(el);
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0 || r.bottom < 0 || r.top > innerHeight) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || el.closest(".sr-only,[aria-hidden='true'] svg") || !opaco(el)) continue;
    if (el.closest("button:disabled,[aria-disabled='true'],.shot")) continue;
    const bg = fondo(el);
    const fg = parse(cs.color);
    if (!bg || !fg) continue;
    const c = mezclar(fg, bg);
    const [a, b] = [lum(c), lum(bg)].sort((x, y) => y - x);
    const ratio = (a + 0.05) / (b + 0.05);
    const px = parseFloat(cs.fontSize);
    const grande = px >= 24 || (px >= 18.66 && parseInt(cs.fontWeight) >= 700);
    const min = grande ? 3 : 4.5;
    if (ratio < min - 0.01) malos.push(`${ratio.toFixed(2)} "${t.textContent.trim().slice(0, 40)}" (${cs.color} sobre rgb(${bg.slice(0, 3).map(Math.round)}))`);
  }
  return malos;
}

async function recorrido(b) {
  const out = {};
  for (const estilo of ESTILOS)
    for (const tema of TEMAS)
      for (const [w, h] of ANCHOS) {
        const ctx = await contexto(b, { estilo, tema, w, h });
        const p = await ctx.newPage();
        await calentar(p);
        for (const url of PAGINAS) {
          await abrir(p, url.replace("#chat", ""));
          if (url.endsWith("#chat")) {
            await abrirChat(p);
            await p.waitForTimeout(2600);
          }
          const r = await p.evaluate(medirContraste);
          const info = await p.evaluate(() => ({
            estilo: document.documentElement.dataset.estilo,
            overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          }));
          const clave = `${estilo}/${tema}/${w}${url}`;
          if (info.estilo !== estilo) falla(`${clave}: data-estilo=${info.estilo}`);
          if (info.overflow > 0) falla(`${clave}: overflow ${info.overflow}px`);
          if (r.length) falla(`${clave}: contraste ${JSON.stringify(r.slice(0, 4))}`);
          const choques = await p.evaluate(garabatosEncima);
          if (choques.length) falla(`${clave}: garabatos encima ${JSON.stringify(choques.slice(0, 4))}`);
          out[clave] = { overflow: info.overflow, contraste: r.length, garabatos: choques.length };
        }
        await ctx.close();
      }
  console.log("✓ recorrido de estilos, temas y anchos");
  return out;
}

async function pliegue(b) {
  const out = {};
  for (const estilo of ESTILOS)
    for (const [w, h] of [
      [390, 844],
      [360, 740],
    ]) {
      const ctx = await contexto(b, { estilo, w, h });
      const p = await ctx.newPage();
      await calentar(p);
      await abrir(p, "/");
      const r = await p.evaluate(() => {
        const hero = [...document.querySelectorAll("#inicio > section")].find((s) => s.offsetParent);
        const nav = document.querySelector(".nav-inf")?.getBoundingClientRect().top ?? innerHeight;
        const botones = [...hero.querySelectorAll(".btn")].filter((x) => x.offsetParent).map((x) => Math.round(x.getBoundingClientRect().bottom));
        const chips = Math.round(hero.querySelector("ul").getBoundingClientRect().bottom);
        return { botones, chips, nav: Math.round(nav) };
      });
      if (r.botones.length < 2 || r.botones.some((y) => y > r.nav) || r.chips > r.nav) falla(`pliegue ${estilo} ${w}×${h}: ${JSON.stringify(r)}`);
      out[`${estilo}/${w}x${h}`] = r;
      await ctx.close();
    }
  console.log("✓ primera pantalla del celular");
  return out;
}

async function personajeYTema(b) {
  const r = {};
  const leer = (p) => p.evaluate(() => ({ estilo: document.documentElement.dataset.estilo, dibujo: document.documentElement.dataset.dibujo, dark: document.documentElement.classList.contains("dark") }));
  // Entrar a Aula desde el selector, sin dibujo ni tema elegidos.
  let ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  let p = await ctx.newPage();
  await abrir(p, "/");
  await p.click(".estilos-pestana");
  const mini = p.locator(".estilos-dlg button", { hasText: "Aula virtual" });
  r.proximamente = await mini.evaluate((e) => e.disabled || e.textContent.includes("Próximamente"));
  if (r.proximamente) falla("la miniatura de Aula sigue deshabilitada o dice Próximamente");
  await mini.click();
  await p.waitForTimeout(1800);
  r.desdeSelector = await leer(p);
  if (r.desdeSelector.estilo !== "aula" || r.desdeSelector.dibujo !== "anime" || !r.desdeSelector.dark) falla(`Aula sin elegir dibujo ni tema: ${JSON.stringify(r.desdeSelector)}`);
  r.fuentes = await p.evaluate(() => document.fonts.check("700 1em Caveat") && document.fonts.check("400 1em Nunito"));
  if (!r.fuentes) falla("las fuentes de Aula no estaban cargadas al cambiar desde el selector");
  await p.reload({ waitUntil: "networkidle" });
  r.recarga = await leer(p);
  if (r.recarga.dibujo !== "anime" || r.recarga.estilo !== "aula") falla(`recarga en Aula: ${JSON.stringify(r.recarga)}`);
  // Elegir chibi, ir a Tech y volver a Aula: se queda el chibi.
  await p.locator('.hero-aula [role="group"] button', { hasText: /chibi/i }).click();
  await p.waitForTimeout(400);
  for (const nombre of ["Tech / IA", "Aula virtual"]) {
    await p.click(".estilos-pestana");
    await p.locator(".estilos-dlg button", { hasText: nombre }).click();
    await p.waitForTimeout(1800);
    await p.keyboard.press("Escape").catch(() => {});
  }
  r.chibiElegido = await leer(p);
  if (r.chibiElegido.dibujo !== "chibi" || r.chibiElegido.estilo !== "aula") falla(`chibi elegido y vuelta a Aula: ${JSON.stringify(r.chibiElegido)}`);
  await ctx.close();
  // Con el tema claro elegido, Aula es la pizarra blanca.
  ctx = await contexto(b, { estilo: "aula", tema: "light", w: 1280, h: 900 });
  p = await ctx.newPage();
  await abrir(p, "/");
  r.claroElegido = await leer(p);
  if (r.claroElegido.dark) falla(`Aula con tema claro elegido: ${JSON.stringify(r.claroElegido)}`);
  await ctx.close();
  console.log("✓ personaje y tema");
  return r;
}

async function capturas(b) {
  for (const tema of TEMAS)
    for (const [w, h] of [
      [390, 844],
      [1280, 900],
    ]) {
      const nombre = tema === "light" ? "claro" : "oscuro";
      const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: w < 500 ? 2 : 1 });
      await ctx.addInitScript(() => localStorage.setItem("malejo-estilo", "aula"));
      await ctx.addCookies([{ name: "malejo-theme", value: tema, url: BASE }]);
      const p = await ctx.newPage();
      await calentar(p);
      await abrir(p, "/");
      await p.waitForTimeout(1500);
      await p.screenshot({ path: path.join(DIR, `${w}-home-aula-${nombre}.png`) });
      await abrir(p, "/soluciones?a=landing-profesional");
      if (w < 500) {
        await abrirChat(p);
        await p.waitForTimeout(2600);
      }
      await p.waitForTimeout(1200);
      await p.screenshot({ path: path.join(DIR, `${w}-soluciones-aula-${nombre}${w < 500 ? "-malejo" : ""}.png`) });
      await ctx.close();
    }
  const ref = path.resolve(DIR, "../../estilos/aula");
  for (const [f, w, h] of [
    ["F-home-claro", 1440, 2000],
    ["F-home-oscuro", 1440, 2000],
    ["F-home-celular", 390, 844],
    ["F-soluciones", 1440, 1100],
    ["F-soluciones-celular", 390, 844],
  ]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    const p = await ctx.newPage();
    await p.goto("file://" + path.join(ref, f + ".html"), { waitUntil: "load" }).catch(() => {});
    await p.waitForTimeout(1000);
    await p.screenshot({ path: path.join(DIR, `ref-${f}.png`) });
    await ctx.close();
  }
  console.log("✓ capturas guardadas");
}

(async () => {
  const b = await chromium.launch();
  const resultado = { fecha: new Date().toISOString(), base: BASE };
  resultado.recorrido = await recorrido(b);
  resultado.pliegue = await pliegue(b);
  resultado.personajeYTema = await personajeYTema(b);
  await capturas(b);
  resultado.fallas = fallas;
  fs.writeFileSync(path.join(DIR, "resultado.json"), JSON.stringify(resultado, null, 2) + "\n");
  await b.close();
  console.log(fallas.length ? `\n${fallas.length} fallas` : "\nTodo en orden");
  process.exit(fallas.length ? 1 : 0);
})();
