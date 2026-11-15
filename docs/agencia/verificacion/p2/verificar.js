/* eslint-disable @typescript-eslint/no-require-imports -- script suelto de Node (CommonJS), no es parte de la app */
// Verificación de la tanda P2 (Playwright). Uso, con un build de producción
// y el modelo simulado (no gasta tokens):
//   npx tsx <script que levanta lib/agencia/chat/mock-anthropic.ts con una sugerencia>
//   ANTHROPIC_API_KEY=x ANTHROPIC_BASE_URL=<url del mock> CHAT_ALLOWED_ORIGINS=http://localhost:3001 npx next start -p 3001
//   node docs/agencia/verificacion/p2/verificar.js http://localhost:3001
//
// Escribe `resultado.json` y las capturas a 390 y 1280 px en esta carpeta.
// Las animaciones de entrada se fuerzan al estado final (como en P1).
//
//  1. Pantallas por página (390 × 844 y 1440 × 900) y palabras en <main>.
//  2. Sin overflow horizontal a 320, 360, 375, 390, 412, 430, 768, 1024 y 1280 px.
//  3. Primera pantalla de la home arriba del pliegue, con la barra inferior.
//  4. /soluciones: sin solapes entre la barra inferior, la barra del armado,
//     la fila de chips y la hoja de Malejo; la barra no tapa el último plan;
//     en tableta y escritorio, categorías, planes y carrito no se pisan.
//  5. El carrusel hace snap; las hojas abren, atrapan el foco, cierran con
//     Esc y devuelven el foco.
//  6. La bienvenida de Malejo entra sin scroll en la hoja a 360, 390 y 412 px.
//  7. Flujo completo: agregar y quitar, combo aplicado, ?a= en otra pestaña,
//     "Ayudame a elegir" → sugerencia → "Agregar" → "Sugerido por Malejo",
//     mandar el armado (la respuesta de /api/contacto se simula: sin base no
//     hay insert) y la pantalla de éxito.
//  8. Sin JS: todas las categorías en <details>, "Pedí tu demo" por plan y
//     WhatsApp en lugar del carrito.
const { chromium } = require("playwright");
const path = require("node:path");
const fs = require("node:fs");

const BASE = process.argv[2] || "http://localhost:3001";
const DIR = __dirname;
const FORZAR = "[data-reveal]{opacity:1!important;transform:none!important}";
const PAGINAS = ["/", "/soluciones", "/soluciones?cat=turnos", "/servicios/webs", "/servicios/ia", "/servicios/grandes", "/demo", "/demo?a=landing-profesional,turnos-online", "/demo?plan=sitio-pyme,pedidos-y-clientes", "/blog", "/legal/terminos"];
const ANCHOS = [320, 360, 375, 390, 412, 430, 768, 1024, 1280];
const CELULARES = [[320, 640], [360, 740], [375, 667], [390, 844], [412, 915], [430, 932]];
const ARMADO = "landing-profesional,turnos-online";
const fallas = [];
const falla = (m) => {
  fallas.push(m);
  console.log("✗", m);
};
const ok = (m) => console.log("✓", m);

async function abrir(p, url, { forzar = true } = {}) {
  await p.goto(url, { waitUntil: "networkidle" });
  if (forzar) await p.addStyleTag({ content: FORZAR });
  await p.evaluate(() => document.querySelectorAll("video").forEach((v) => v.pause()));
  await p.waitForTimeout(400);
}

const solapan = (a, b) => a && b && a.width > 0 && b.width > 0 && a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;

async function pantallasYPalabras(b) {
  const out = {};
  for (const [nombre, vp] of [["celular", { width: 390, height: 844 }], ["escritorio", { width: 1440, height: 900 }]]) {
    const p = await b.newPage({ viewport: vp });
    for (const r of PAGINAS) {
      await abrir(p, BASE + r);
      await p.waitForTimeout(r === "/" ? 2200 : 200);
      const m = await p.evaluate(() => {
        const t = document.querySelector("main").innerText;
        return { palabras: t.split(/\s+/).filter((x) => /[\p{L}\p{N}]/u.test(x)).length, alto: document.documentElement.scrollHeight };
      });
      (out[r] ??= {})[nombre] = { palabras: m.palabras, pantallas: +(m.alto / vp.height).toFixed(2) };
    }
    await p.close();
  }
  if (out["/"].escritorio.pantallas > 3.5) falla(`home: ${out["/"].escritorio.pantallas} pantallas en escritorio (tope 3,5)`);
  if (out["/"].celular.pantallas > 5.5) falla(`home: ${out["/"].celular.pantallas} pantallas en celular (tope 5,5)`);
  return out;
}

async function overflow(b) {
  const out = {};
  for (const w of ANCHOS) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    for (const r of [...PAGINAS, `/soluciones?a=${ARMADO}`]) {
      await abrir(p, BASE + r);
      const o = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (o > 0) falla(`overflow de ${o}px en ${r} a ${w}`);
      (out[w] ??= {})[r] = o;
    }
    await p.close();
  }
  ok("overflow horizontal revisado");
  return out;
}

async function pliegue(b) {
  const out = {};
  for (const [w, h] of CELULARES) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await abrir(p, BASE + "/");
    const r = await p.evaluate(() => {
      const chips = document.querySelector("#inicio ul[aria-label]").getBoundingClientRect();
      const nav = document.querySelector("nav.nav-inf").getBoundingClientRect();
      const botones = [...document.querySelectorAll("#inicio a.btn")].map((a) => a.getBoundingClientRect());
      return { chipsAbajo: Math.round(chips.bottom), navArriba: Math.round(nav.top), botonesAncho: botones.map((x) => Math.round(x.width)) };
    });
    if (r.chipsAbajo > r.navArriba) falla(`home ${w}×${h}: la primera pantalla no entra (${r.chipsAbajo} > ${r.navArriba})`);
    out[`${w}x${h}`] = r;
    await p.close();
  }
  ok("primera pantalla de la home medida");
  return out;
}

async function solapesSoluciones(b) {
  const out = {};
  for (const [w, h] of CELULARES) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await abrir(p, `${BASE}/soluciones?a=${ARMADO}&cat=turnos`);
    await p.evaluate(() => window.scrollTo(0, 1400));
    await p.waitForTimeout(700);
    const sinChat = await p.evaluate(() => {
      const q = (s) => document.querySelector(s)?.getBoundingClientRect() ?? null;
      const panel = document.querySelector("#sol-panel-turnos")?.parentElement;
      return {
        nav: q("nav.nav-inf"),
        barra: q(".barra-armado"),
        chips: q(".chips-fijos"),
        header: q("header nav"),
        relleno: panel ? parseFloat(getComputedStyle(panel).paddingBottom) : 0,
      };
    });
    if (!sinChat.barra) falla(`/soluciones ${w}: no aparece la barra del armado`);
    if (!sinChat.chips) falla(`/soluciones ${w}: no aparece la fila de chips al bajar`);
    if (solapan(sinChat.barra, sinChat.nav)) falla(`/soluciones ${w}: la barra del armado pisa la barra inferior`);
    if (solapan(sinChat.chips, sinChat.barra)) falla(`/soluciones ${w}: los chips pisan la barra del armado`);
    if (sinChat.barra && sinChat.relleno < sinChat.barra.height) falla(`/soluciones ${w}: el relleno (${sinChat.relleno}) es menor que la barra (${sinChat.barra.height})`);
    // Con Malejo a media pantalla, la barra del armado queda encima de la hoja.
    await p.evaluate(() => window.dispatchEvent(new CustomEvent("malejo:abrir", { detail: {}, cancelable: true })));
    await p.waitForTimeout(1500);
    const conChat = await p.evaluate(() => ({
      hoja: document.querySelector("[aria-labelledby=malejo-chat-title]")?.getBoundingClientRect() ?? null,
      barra: document.querySelector(".barra-armado")?.getBoundingClientRect() ?? null,
    }));
    if (!conChat.hoja) falla(`/soluciones ${w}: Malejo no abrió`);
    if (solapan(conChat.barra, conChat.hoja)) falla(`/soluciones ${w}: la barra del armado pisa la hoja de Malejo`);
    out[w] = { sinChat, conChat };
    await p.close();
  }
  for (const w of [768, 1024, 1280]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    await abrir(p, `${BASE}/soluciones?a=${ARMADO}&cat=webs`);
    const r = await p.evaluate(() => {
      const q = (s) => document.querySelector(s)?.getBoundingClientRect() ?? null;
      return { tabs: q("[role=tablist]"), panel: q("#sol-panel-webs"), carrito: q('aside[aria-label="Tu armado"]'), widget: q('button[aria-label="Abrir chat con Malejo"]') };
    });
    if (solapan(r.tabs, r.panel) || solapan(r.panel, r.carrito) || solapan(r.tabs, r.carrito)) falla(`/soluciones ${w}: categorías, planes y carrito se pisan`);
    if (solapan(r.carrito, r.widget)) falla(`/soluciones ${w}: el carrito pisa el botón de Malejo`);
    out[w] = r;
    await p.close();
  }
  ok("solapes de /soluciones revisados");
  return out;
}

async function carruselYHojas(b) {
  const out = {};
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  await abrir(p, `${BASE}/soluciones?a=${ARMADO}&cat=webs`);
  // Snap: se desliza 120 px y el carrusel termina centrado en una tarjeta.
  out.snap = await p.evaluate(async () => {
    const c = document.querySelector("#sol-panel-webs .carrusel");
    c.scrollBy({ left: 120 });
    await new Promise((r) => setTimeout(r, 900));
    const centro = c.scrollLeft + c.clientWidth / 2;
    const d = Math.min(...[...c.children].map((s) => Math.abs(s.offsetLeft + s.offsetWidth / 2 - centro)));
    return { scrollLeft: c.scrollLeft, distanciaAlCentro: Math.round(d), activa: [...c.children].findIndex((s) => s.hasAttribute("data-activa")) };
  });
  if (out.snap.distanciaAlCentro > 2) falla(`el carrusel no hizo snap (${out.snap.distanciaAlCentro}px)`);
  // Hoja del armado: abre, foco adentro, Esc cierra y devuelve el foco.
  await p.click(".barra-armado button");
  await p.waitForTimeout(600);
  out.hoja = await p.evaluate(() => {
    const d = document.querySelector("dialog.hoja[open]");
    return { abierta: Boolean(d), focoAdentro: Boolean(d && d.contains(document.activeElement)) };
  });
  await p.screenshot({ path: path.join(DIR, "390-soluciones-hoja-armado.png") });
  await p.keyboard.press("Escape");
  await p.waitForTimeout(400);
  out.hoja.cerro = await p.evaluate(() => !document.querySelector("dialog.hoja[open]"));
  out.hoja.focoVuelve = await p.evaluate(() => Boolean(document.activeElement?.closest(".barra-armado")));
  if (!out.hoja.abierta || !out.hoja.focoAdentro || !out.hoja.cerro || !out.hoja.focoVuelve) falla(`hoja del armado: ${JSON.stringify(out.hoja)}`);
  // Hoja de Contacto de la barra inferior.
  const contacto = p.locator("nav.nav-inf button", { hasText: "Contacto" });
  await contacto.click();
  await p.waitForTimeout(600);
  out.contacto = await p.evaluate(() => {
    const d = [...document.querySelectorAll("dialog.hoja")].find((x) => x.open);
    return { abierta: Boolean(d), opciones: d ? d.querySelectorAll("a.btn").length : 0 };
  });
  await p.keyboard.press("Escape");
  await p.waitForTimeout(400);
  out.contacto.focoVuelve = await p.evaluate(() => document.activeElement?.textContent?.includes("Contacto") ?? false);
  if (!out.contacto.abierta || out.contacto.opciones !== 3 || !out.contacto.focoVuelve) falla(`hoja de contacto: ${JSON.stringify(out.contacto)}`);
  await p.close();
  ok("carrusel y hojas revisados");
  return out;
}

async function bienvenida(b) {
  const out = {};
  for (const [w, h] of [[360, 740], [390, 844], [412, 915]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await abrir(p, BASE + "/soluciones");
    await p.evaluate(() => window.dispatchEvent(new CustomEvent("malejo:abrir", { detail: {}, cancelable: true })));
    await p.waitForTimeout(1800);
    const r = await p.evaluate(() => {
      const d = document.querySelector("[aria-labelledby=malejo-chat-title]");
      const lista = d.querySelector("[aria-live=polite]");
      return {
        hoja: Math.round(d.getBoundingClientRect().height),
        opciones: d.querySelectorAll('[role=group] button').length,
        sinScroll: lista.scrollHeight <= lista.clientHeight + 1,
        textos: [...d.querySelectorAll('[role=group] button')].map((x) => x.textContent.trim()),
      };
    });
    if (!r.sinScroll) falla(`bienvenida a ${w}×${h}: hace falta scroll`);
    if (r.opciones !== 6) falla(`bienvenida a ${w}: ${r.opciones} opciones`);
    if (w === 390) await p.screenshot({ path: path.join(DIR, "390-soluciones-malejo-media-pantalla.png") });
    out[`${w}x${h}`] = r;
    await p.close();
  }
  ok("bienvenida medida");
  return out;
}

async function flujo(b) {
  const out = {};
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  // Sin base de datos no hay insert: la respuesta de /api/contacto se simula.
  let enviado = null;
  await p.route("**/api/contacto", async (route) => {
    enviado = JSON.parse(route.request().postData() || "{}");
    await route.fulfill({ json: { ok: true } });
  });
  await abrir(p, `${BASE}/soluciones?cat=webs`);
  const aside = p.locator('aside[aria-label="Tu armado"]');
  await p.locator("#sol-panel-webs button", { hasText: "Agregar al armado" }).first().click();
  await p.locator("#sol-tab-turnos").click();
  await p.locator("#sol-panel-turnos button", { hasText: "Agregar al armado" }).first().click();
  await p.waitForTimeout(400);
  const texto = (await aside.innerText()).replace(/\s+/g, " ");
  out.combo = /Se aplicó el combo/.test(texto);
  out.rango = /entre \$[\d.]+ y \$[\d.]+/.test(texto);
  out.url = await p.evaluate(() => location.search);
  if (!out.combo) falla("no se aplicó el combo al agregar sus partes");
  if (!out.rango) falla("el carrito no muestra el rango");
  // Quitar.
  await aside.getByRole("button", { name: /Quitar Combo/ }).click();
  await p.waitForTimeout(300);
  out.quitado = /Todavía no agregaste nada/.test(await aside.innerText());
  if (!out.quitado) falla("quitar no vació el armado");
  // ?a= en otra pestaña (otra sesión): el aviso de armado compartido.
  const otra = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  await abrir(otra, `${BASE}/soluciones?a=${ARMADO}`);
  out.compartido = await otra.locator('aside[aria-label="Tu armado"]').innerText();
  if (!/Te compartieron este armado/.test(out.compartido)) falla("?a= no muestra el aviso de compartido");
  out.compartido = out.compartido.split("\n").slice(0, 6).join(" | ");
  await otra.close();
  // "Ayudame a elegir" → opción → sugerencia (modelo simulado) → Agregar.
  await p.locator("a.btn", { hasText: "Ayudame a elegir" }).click();
  await p.waitForTimeout(1500);
  await p.locator('[aria-labelledby=malejo-chat-title] [role=group] button', { hasText: "Doy servicios con turno" }).click();
  await p.waitForTimeout(2500);
  const agregar = p.locator('[aria-labelledby=malejo-chat-title] button', { hasText: "Agregar al armado" });
  out.sugerencia = await agregar.count();
  if (!out.sugerencia) falla("no llegó la tarjeta de sugerencia del armado");
  else {
    await agregar.first().click();
    await p.waitForTimeout(500);
    const t = await aside.innerText();
    out.sugerido = /Sugerido por Malejo/i.test(t);
    if (!out.sugerido) falla("lo agregado desde Malejo no lleva la marca");
  }
  await p.locator('[aria-labelledby=malejo-chat-title] button[aria-label="Cerrar chat"]').click();
  // Mandar el armado.
  await aside.getByRole("button", { name: "Mandale tu armado a Mauro" }).click();
  await aside.getByLabel("Tu nombre").fill("Ana Prueba");
  await aside.getByLabel("Tu WhatsApp (con código de área)").fill("3875813233");
  await aside.getByRole("checkbox").check();
  await aside.getByRole("button", { name: "Mandar mi armado" }).click();
  await p.waitForTimeout(800);
  out.envio = enviado && { armado: enviado.armado, campos: Object.keys(enviado) };
  out.exito = /Mauro te escribe en hasta 2 días hábiles/.test(await aside.innerText());
  if (!out.exito) falla("no apareció la pantalla de éxito");
  if (enviado && JSON.stringify(enviado).match(/\$/)) falla("el cliente mandó precios: tiene que mandar solo ids");
  await ctx.close();
  // La pantalla de éxito a 390 px, para la captura.
  const cel = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage();
  await cel.route("**/api/contacto", (route) => route.fulfill({ json: { ok: true } }));
  await abrir(cel, `${BASE}/soluciones?a=${ARMADO}`);
  await cel.click(".barra-armado button");
  await cel.waitForTimeout(500);
  const hoja = cel.locator("dialog.hoja[open]");
  await hoja.getByRole("button", { name: "Mandale tu armado a Mauro" }).click();
  await hoja.getByLabel("Tu nombre").fill("Ana Prueba");
  await hoja.getByLabel("Tu WhatsApp (con código de área)").fill("3875813233");
  await hoja.getByRole("checkbox").check();
  await hoja.getByRole("button", { name: "Mandar mi armado" }).click();
  await cel.waitForTimeout(800);
  await cel.screenshot({ path: path.join(DIR, "390-soluciones-exito.png") });
  await cel.close();
  ok("flujo completo recorrido");
  return out;
}

async function sinJs(b) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const p = await ctx.newPage();
  await p.goto(BASE + "/soluciones", { waitUntil: "load" });
  const r = await p.evaluate(() => {
    const visible = (el) => el && getComputedStyle(el).display !== "none" && el.getBoundingClientRect().height > 0;
    const detalles = [...document.querySelectorAll("details.cat-panel")];
    return {
      categorias: detalles.length,
      demos: [...document.querySelectorAll('a[href^="/demo?plan="]')].filter(visible).length,
      agregarVisibles: [...document.querySelectorAll("button")].filter((x) => /Agregar al armado/.test(x.textContent) && visible(x)).length,
      whatsapp: [...document.querySelectorAll(".nojs-only a")].some((a) => /WhatsApp/.test(a.textContent) && visible(a)),
      contame: [...document.querySelectorAll(".nojs-only a")].some((a) => /Contame qué necesitás/.test(a.textContent) && visible(a)),
      carrito: visible(document.querySelector('aside[aria-label="Tu armado"]')),
      barraInferior: visible(document.querySelector("nav.nav-inf")),
    };
  });
  await p.locator("details.cat-panel >> nth=2").evaluate((d) => (d.open = true));
  r.abreOtra = await p.evaluate(() => document.querySelectorAll("details.cat-panel")[2].querySelectorAll('a[href^="/demo?plan="]').length > 0);
  if (r.categorias !== 7) falla(`sin JS: ${r.categorias} categorías en <details>`);
  if (!r.demos || r.agregarVisibles) falla("sin JS: falta \"Pedí tu demo\" o se ve \"Agregar al armado\"");
  if (!r.whatsapp || !r.contame || r.carrito || r.barraInferior) falla(`sin JS: ${JSON.stringify(r)}`);
  await ctx.close();
  ok("camino sin JS revisado");
  return r;
}

async function capturas(b) {
  const tomas = [
    ["390-home-primera-pantalla.png", "/", 390, 844],
    ["390-soluciones-entrada.png", "/soluciones", 390, 844],
    ["390-soluciones-categoria.png", `/soluciones?cat=turnos&a=${ARMADO}`, 390, 844, 1100],
    ["1280-home.png", "/", 1280, 900],
    ["1280-soluciones.png", `/soluciones?cat=turnos&a=${ARMADO}`, 1280, 900, 420],
  ];
  for (const [archivo, ruta, w, h, scroll] of tomas) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    await abrir(p, BASE + ruta);
    await p.waitForTimeout(ruta === "/" ? 2600 : 300);
    if (scroll) {
      await p.evaluate((y) => window.scrollTo(0, y), scroll);
      await p.waitForTimeout(700);
    }
    await p.screenshot({ path: path.join(DIR, archivo) });
    await ctx.close();
  }
  ok("capturas guardadas");
}

(async () => {
  const b = await chromium.launch();
  const resultado = {
    fecha: new Date().toISOString(),
    base: BASE,
    pantallas: await pantallasYPalabras(b),
    overflow: await overflow(b),
    pliegue: await pliegue(b),
    solapes: await solapesSoluciones(b),
    carruselYHojas: await carruselYHojas(b),
    bienvenida: await bienvenida(b),
    flujo: await flujo(b),
    sinJs: await sinJs(b),
  };
  await capturas(b);
  resultado.fallas = fallas;
  fs.writeFileSync(path.join(DIR, "resultado.json"), JSON.stringify(resultado, null, 2) + "\n");
  await b.close();
  console.log(fallas.length ? `\n${fallas.length} fallas` : "\nTodo en orden");
  process.exit(fallas.length ? 1 : 0);
})();
