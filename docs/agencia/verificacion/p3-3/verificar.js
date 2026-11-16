/* eslint-disable @typescript-eslint/no-require-imports -- script suelto de Node (CommonJS), no es parte de la app */
// Verificación de la tanda P3-3 (estilo Tienda).
// Uso, con un build de producción:
//   CHAT_ALLOWED_ORIGINS=http://localhost:3001 npx next start -p 3001
//   node docs/agencia/verificacion/p3-3/verificar.js http://localhost:3001
//
//  1. Tienda × claro/oscuro × 360, 390 y 1280 px, en la home, /soluciones,
//     una solución, /demo, el 404 y la home con el chat abierto: sin
//     overflow, contraste AA contra el fondo efectivo y ninguna etiqueta de
//     precio más ancha que su tarjeta (con "Desde $747.000" incluida).
//  2. Celular: los 2 botones del hero arriba del pliegue (el ejemplo, abajo).
//  3. Personaje: Tienda sin dibujo elegido muestra el chibi; con anime
//     elegido, se queda el anime.
//  4. Tema: Tienda sin tema elegido, claro; con oscuro elegido, Noche cálida.
//  5. El ejemplo «Almacén Doña Rosa»: nada tabulable adentro y el lector
//     anuncia solo su texto alternativo.
//  6. El selector ya no dice "Próximamente" en Tienda.
// Las fuentes van sin precarga y con `display: optional`: cada contexto carga
// la página una vez antes de medir (como quien llega desde el selector).
// Escribe `resultado.json` y las capturas en esta carpeta.
const { chromium } = require("playwright");
const path = require("node:path");
const fs = require("node:fs");

const BASE = process.argv[2] || "http://localhost:3001";
const DIR = __dirname;
const FORZAR = "[data-reveal]{opacity:1!important;transform:none!important}";
const ESTILOS = ["tienda"];
const TEMAS = ["light", "dark"];
const PAGINAS = ["/", "/soluciones?a=landing-profesional,turnos-online", "/soluciones?cat=tiendas", "/servicios/tiendas", "/demo", "/no-existe-esta-pagina", "/#chat"];
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
  await p.evaluate(() => Promise.all(["700 1em Fredoka", "400 1em Nunito", "800 1em Nunito"].map((f) => document.fonts.load(f))));
}

/** Etiquetas de precio más anchas que su tarjeta (o con el texto cortado). */
function etiquetasAnchas() {
  const out = [];
  for (const e of document.querySelectorAll("[data-etiqueta-precio]")) {
    if (!e.getClientRects().length) continue;
    const r = e.getBoundingClientRect();
    const card = e.closest(".card, article, li");
    const c = card ? card.getBoundingClientRect() : null;
    const cortada = e.scrollWidth > e.clientWidth + 1;
    if ((c && (r.right > c.right + 0.5 || r.left < c.left - 0.5)) || cortada) out.push(`${e.textContent.trim()} (${Math.round(r.width)} px${cortada ? ", cortada" : ""})`);
  }
  return out;
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
          const anchas = await p.evaluate(etiquetasAnchas);
          if (anchas.length) falla(`${clave}: etiquetas más anchas que su tarjeta ${JSON.stringify(anchas.slice(0, 4))}`);
          out[clave] = { overflow: info.overflow, contraste: r.length, etiquetas: await p.evaluate(() => document.querySelectorAll("[data-etiqueta-precio]").length) };
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
  let ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  let p = await ctx.newPage();
  await abrir(p, "/");
  await p.click(".estilos-pestana");
  const mini = p.locator(".estilos-dlg button", { hasText: "Tienda" });
  r.proximamente = await mini.evaluate((e) => e.disabled || e.textContent.includes("Próximamente"));
  if (r.proximamente) falla("la miniatura de Tienda sigue deshabilitada o dice Próximamente");
  await mini.click();
  await p.waitForTimeout(1800);
  r.desdeSelector = await leer(p);
  if (r.desdeSelector.estilo !== "tienda" || r.desdeSelector.dibujo !== "chibi" || r.desdeSelector.dark) falla(`Tienda sin elegir dibujo ni tema: ${JSON.stringify(r.desdeSelector)}`);
  r.fuentes = await p.evaluate(() => document.fonts.check("700 1em Fredoka") && document.fonts.check("400 1em Nunito"));
  if (!r.fuentes) falla("las fuentes de Tienda no estaban cargadas al cambiar desde el selector");
  r.nombre16 = await p.evaluate(() => [...document.querySelectorAll(".hero-tienda [role=group] button")].map((x) => x.innerText.trim()));
  if (!r.nombre16.includes("16-bit")) falla(`el dibujo pixelado no se llama "16-bit" en Tienda: ${r.nombre16}`);
  // El ejemplo: nada tabulable y solo el texto alternativo.
  r.ejemplo = await p.evaluate(() => {
    const ej = document.querySelector('.hero-tienda .ejemplo-almacen');
    const tab = ej.querySelectorAll("a, button, input, select, textarea, [tabindex]").length;
    return { alt: ej.getAttribute("aria-label"), tabulables: tab, ocultoAdentro: ej.firstElementChild.getAttribute("aria-hidden") };
  });
  if (r.ejemplo.tabulables || r.ejemplo.ocultoAdentro !== "true" || !r.ejemplo.alt) falla(`ejemplo: ${JSON.stringify(r.ejemplo)}`);
  const foco = [];
  await p.keyboard.press("Escape").catch(() => {});
  await p.evaluate(() => document.activeElement && document.activeElement.blur());
  for (let i = 0; i < 40; i++) {
    await p.keyboard.press("Tab");
    foco.push(await p.evaluate(() => Boolean(document.activeElement && document.activeElement.closest('.hero-tienda .ejemplo-almacen'))));
  }
  r.tabEnEjemplo = foco.filter(Boolean).length;
  if (r.tabEnEjemplo) falla(`el Tab entra al ejemplo ${r.tabEnEjemplo} veces`);
  // Elegir anime, ir a Tech y volver a Tienda: se queda el anime.
  await p.locator('.hero-tienda [role="group"] button', { hasText: "Anime" }).click();
  await p.waitForTimeout(400);
  for (const nombre of ["Tech / IA", "Tienda"]) {
    await p.click(".estilos-pestana");
    await p.locator(".estilos-dlg button", { hasText: nombre }).click();
    await p.waitForTimeout(1800);
    await p.keyboard.press("Escape").catch(() => {});
  }
  r.animeElegido = await leer(p);
  if (r.animeElegido.dibujo !== "anime" || r.animeElegido.estilo !== "tienda") falla(`anime elegido y vuelta a Tienda: ${JSON.stringify(r.animeElegido)}`);
  await ctx.close();
  ctx = await contexto(b, { estilo: "tienda", tema: "dark", w: 1280, h: 900 });
  p = await ctx.newPage();
  await abrir(p, "/");
  r.oscuroElegido = await leer(p);
  if (!r.oscuroElegido.dark) falla(`Tienda con tema oscuro elegido: ${JSON.stringify(r.oscuroElegido)}`);
  await ctx.close();
  console.log("✓ personaje, tema y ejemplo");
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
      await ctx.addInitScript(() => localStorage.setItem("malejo-estilo", "tienda"));
      await ctx.addCookies([{ name: "malejo-theme", value: tema, url: BASE }]);
      const p = await ctx.newPage();
      await calentar(p);
      await abrir(p, "/");
      await p.waitForTimeout(1500);
      await p.screenshot({ path: path.join(DIR, `${w}-home-tienda-${nombre}.png`) });
      await abrir(p, w < 500 ? "/soluciones?a=landing-profesional" : "/soluciones?cat=tiendas&a=catalogo-con-pedidos-por-whatsapp");
      if (w < 500) {
        await abrirChat(p);
        await p.waitForTimeout(2600);
      }
      await p.waitForTimeout(1200);
      await p.screenshot({ path: path.join(DIR, `${w}-soluciones-tienda-${nombre}${w < 500 ? "-malejo" : ""}.png`) });
      await ctx.close();
    }
  const ref = path.resolve(DIR, "../../estilos/tienda");
  for (const [f, w, h] of [
    ["F-home-claro", 1440, 2000],
    ["F-home-oscuro", 1440, 2000],
    ["F-home-celular", 390, 844],
    ["F-soluciones", 1440, 1100],
    ["F-soluciones-celular", 390, 844],
    ["F-pedido-celular", 390, 844],
    ["F-selector", 980, 700],
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
