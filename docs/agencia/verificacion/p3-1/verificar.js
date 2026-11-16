/* eslint-disable @typescript-eslint/no-require-imports -- script suelto de Node (CommonJS), no es parte de la app */
// Verificación de la tanda P3-1 (estilos, Institucional y el personaje en 3 dibujos).
// Uso, con un build de producción:
//   CHAT_ALLOWED_ORIGINS=http://localhost:3001 npx next start -p 3001
//   node docs/agencia/verificacion/p3-1/verificar.js http://localhost:3001
//
//  1. Tech e Institucional × claro/oscuro × 390 y 1280 px, en la home,
//     /soluciones, una solución, /demo, el 404 y la home con el chat abierto:
//     sin overflow horizontal y con contraste AA calculado contra el fondo
//     efectivo (texto visible; 3:1 si es grande).
//  2. Celular (390 × 844): los 2 botones del hero arriba del pliegue, con la
//     barra inferior.
//  3. El personaje mide lo mismo en pantalla en los 3 dibujos (hero y equipo).
//  4. Sin JS: Tech/IA, dibujo 16-bit, el hero de Tech visible y el resto oculto.
//  5. Primera visita y persistencia: Tech + 16-bit; elegir Institucional y
//     volver a entrar lo mantiene; un dibujo elegido a mano se mantiene al
//     cambiar de estilo; sin elegir, el cambio de estilo saca otro dibujo.
//  6. Saludo al abrir el chat una sola vez; con movimiento reducido no se
//     mueve nada. No queda ningún uso de la animación vieja.
// Escribe `resultado.json` y las capturas en esta carpeta.
const { chromium } = require("playwright");
const path = require("node:path");
const fs = require("node:fs");

const BASE = process.argv[2] || "http://localhost:3001";
const DIR = __dirname;
const FORZAR = "[data-reveal]{opacity:1!important;transform:none!important}";
const ESTILOS = ["tech", "institucional"];
const TEMAS = ["light", "dark"];
const PAGINAS = ["/", "/soluciones?a=landing-profesional,turnos-online", "/servicios/webs", "/demo", "/no-existe-esta-pagina", "/#chat"];
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
      for (const [w, h] of [
        [390, 844],
        [1280, 900],
      ]) {
        const ctx = await contexto(b, { estilo, tema, w, h });
        const p = await ctx.newPage();
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
          out[clave] = { overflow: info.overflow, contraste: r.length };
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

async function tamanos(b) {
  const out = {};
  for (const dibujo of ["16bit", "chibi", "anime"]) {
    const ctx = await contexto(b, { estilo: "institucional", w: 1280, h: 900, dibujo });
    const p = await ctx.newPage();
    await abrir(p, "/");
    out[dibujo] = await p.evaluate(async () => {
      const datos = await (await fetch("/agencia/sprites/sprites.json")).json();
      const d = document.documentElement.dataset.dibujo;
      return [...document.querySelectorAll("[data-sprite]")]
        .map((c) => [...c.querySelectorAll(".sprite")].find((s) => getComputedStyle(s).display !== "none"))
        .filter((s) => s && s.getBoundingClientRect().height > 0)
        .map((s) => {
          const h = s.getBoundingClientRect().height;
          return Math.round((h * (datos[d].alto - datos[d].aire)) / datos[d].alto);
        });
    });
    await ctx.close();
  }
  const largo = out["16bit"].length;
  for (let i = 0; i < largo; i++) {
    const alturas = ["16bit", "chibi", "anime"].map((d) => out[d][i]);
    if (Math.max(...alturas) - Math.min(...alturas) > 2) falla(`tamaño del personaje #${i}: ${alturas}`);
  }
  console.log("✓ mismo tamaño en los 3 dibujos", JSON.stringify(out));
  return out;
}

async function sinJs(b) {
  const ctx = await contexto(b, { js: false, w: 1280, h: 900 });
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  const r = await p.evaluate(() => {
    const visible = (sel) => [...document.querySelectorAll(sel)].some((e) => e.getClientRects().length > 0 && getComputedStyle(e).display !== "none");
    return {
      estilo: document.documentElement.dataset.estilo ?? null,
      heroTech: visible('[data-solo-estilo="tech"].wrap'),
      heroInst: visible("section.hero-inst"),
      dibujo16: visible('[data-solo-dibujo="16bit"]'),
      chibi: visible('[data-solo-dibujo="chibi"]'),
      selector: visible(".estilos-pestana"),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  if (r.estilo !== null || !r.heroTech || r.heroInst || !r.dibujo16 || r.chibi || r.selector || r.overflow > 0) falla(`sin JS: ${JSON.stringify(r)}`);
  await p.screenshot({ path: path.join(DIR, "1280-sin-js.png") });
  await ctx.close();
  console.log("✓ sin JS: Tech y 16-bit");
  return r;
}

async function persistencia(b) {
  const r = {};
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await abrir(p, "/");
  const leer = () => p.evaluate(() => ({ estilo: document.documentElement.dataset.estilo, dibujo: document.documentElement.dataset.dibujo, dark: document.documentElement.classList.contains("dark") }));
  r.primera = await leer();
  if (r.primera.estilo !== "tech" || r.primera.dibujo !== "16bit" || !r.primera.dark) falla(`primera visita: ${JSON.stringify(r.primera)}`);
  await p.click(".estilos-pestana");
  await p.locator(".estilos-dlg button", { hasText: "Institucional" }).click();
  await p.waitForTimeout(500);
  r.trasElegir = await leer();
  if (r.trasElegir.estilo !== "institucional" || r.trasElegir.dark) falla(`elegir Institucional (claro de entrada): ${JSON.stringify(r.trasElegir)}`);
  if (r.trasElegir.dibujo === "16bit") falla(`sin elegir dibujo, el cambio de estilo debía sacar otro de la bolsa: ${JSON.stringify(r.trasElegir)}`);
  await p.reload({ waitUntil: "networkidle" });
  r.recarga = await leer();
  if (r.recarga.estilo !== "institucional" || r.recarga.dibujo !== r.trasElegir.dibujo) falla(`recarga: ${JSON.stringify(r.recarga)}`);
  await p.keyboard.press("Escape");
  await p.locator('.hero-inst [role="group"] button', { hasText: "Anime" }).click();
  await p.waitForTimeout(400);
  await p.click(".estilos-pestana");
  await p.locator(".estilos-dlg button", { hasText: "Tech / IA" }).click();
  await p.waitForTimeout(500);
  r.elegidoYCambio = await leer();
  if (r.elegidoYCambio.dibujo !== "anime" || r.elegidoYCambio.estilo !== "tech") falla(`dibujo elegido a mano: ${JSON.stringify(r.elegidoYCambio)}`);
  await ctx.close();
  console.log("✓ primera visita y persistencia");
  return r;
}

async function animaciones(b) {
  const r = {};
  const ctx = await contexto(b, { estilo: "tech", w: 1280, h: 900 });
  const p = await ctx.newPage();
  await abrir(p, "/");
  r.heroSaludo = await p.evaluate(() => {
    const c = [...document.querySelectorAll("[data-saludo-entrada]")].find((x) => x.offsetParent);
    return c?.getAttribute("data-anim") ?? sessionStorage.getItem("malejo-saludo-hero");
  });
  await abrirChat(p);
  const vistos = [];
  for (let i = 0; i < 16; i++) {
    vistos.push(await p.evaluate(() => document.querySelector(".sprite-fundido [data-sprite]")?.getAttribute("data-anim") ?? "-"));
    await p.waitForTimeout(250);
  }
  r.chat = vistos.join(" ");
  if (!vistos.includes("saludo") || vistos[vistos.length - 1] !== "-") falla(`saludo al abrir el chat: ${r.chat}`);
  await ctx.close();

  const ctx2 = await contexto(b, { estilo: "institucional", w: 1280, h: 900, reducido: true });
  const p2 = await ctx2.newPage();
  await abrir(p2, "/");
  await abrirChat(p2);
  await p2.waitForTimeout(800);
  r.reducido = await p2.evaluate(() => ({
    idle: [...document.querySelectorAll(".tira-idle")].map((i) => getComputedStyle(i).animationName).filter((n) => n !== "none").length,
    anim: document.querySelectorAll("[data-anim]").length,
  }));
  if (r.reducido.idle || r.reducido.anim) falla(`movimiento reducido: ${JSON.stringify(r.reducido)}`);
  await ctx2.close();
  console.log("✓ saludo una vez y movimiento reducido");
  return r;
}

async function capturas(b) {
  for (const estilo of ESTILOS)
    for (const tema of TEMAS)
      for (const [w, h] of [
        [390, 844],
        [1280, 900],
      ]) {
        const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: w < 500 ? 2 : 1 });
        await ctx.addInitScript((e) => localStorage.setItem("malejo-estilo", e), estilo);
        await ctx.addCookies([{ name: "malejo-theme", value: tema, url: BASE }]);
        const p = await ctx.newPage();
        await abrir(p, "/");
        await p.screenshot({ path: path.join(DIR, `${w}-home-${estilo}-${tema === "light" ? "claro" : "oscuro"}.png`) });
        if (estilo === "institucional" && tema === "light") {
          await abrir(p, "/soluciones?a=landing-profesional");
          if (w < 500) {
            await abrirChat(p);
            await p.waitForTimeout(2600);
          }
          await p.screenshot({ path: path.join(DIR, `${w}-soluciones-${estilo}-claro${w < 500 ? "-malejo" : ""}.png`) });
          if (w > 500) {
            await abrir(p, "/");
            await p.click(".estilos-pestana");
            await p.waitForTimeout(500);
            await p.screenshot({ path: path.join(DIR, `${w}-selector.png`) });
          }
        }
        await ctx.close();
      }
  // Las pantallas aprobadas, para ponerlas al lado.
  const ref = path.resolve(DIR, "../../estilos/institucional");
  for (const [f, w, h] of [
    ["F-home-claro", 1440, 2000],
    ["F-home-oscuro", 1440, 2000],
    ["F-home-celular", 390, 844],
    ["F-soluciones", 1440, 1100],
    ["F-soluciones-celular", 390, 844],
    ["F-selector", 980, 680],
  ]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    const p = await ctx.newPage();
    await p.goto("file://" + path.join(ref, f + ".html"), { waitUntil: "load" }).catch(() => {});
    await p.waitForTimeout(800);
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
  resultado.tamanos = await tamanos(b);
  resultado.sinJs = await sinJs(b);
  resultado.persistencia = await persistencia(b);
  resultado.animaciones = await animaciones(b);
  await capturas(b);
  resultado.fallas = fallas;
  fs.writeFileSync(path.join(DIR, "resultado.json"), JSON.stringify(resultado, null, 2) + "\n");
  await b.close();
  console.log(fallas.length ? `\n${fallas.length} fallas` : "\nTodo en orden");
  process.exit(fallas.length ? 1 : 0);
})();
