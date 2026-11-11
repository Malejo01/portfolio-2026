/* eslint-disable @typescript-eslint/no-require-imports -- script suelto de Node (CommonJS), no es parte de la app */
// Verificación de la tanda P1 (Playwright). Uso, con un build de producción:
//   CHAT_ALLOWED_ORIGINS=http://localhost:3001 npx next start -p 3001
//   (y el build de main en 3002 para el "antes", opcional)
//   node docs/agencia/verificacion/p1/verificar.js http://localhost:3001 [http://localhost:3002]
//
// Mide y verifica, sin capturas (las animaciones se fuerzan al estado final):
// 1. Pantallas de la home como `r2/capturas.js` (1440×900 y 390×844).
// 2. Palabras y precios visibles en `<main>` y overflow horizontal, a 1280 y 390 px.
// 3. El modal: abre, atrapa el foco, cierra con Esc y devuelve el foco al disparador.
// 4. Sin JS: el disparador lleva a /servicios/<cat>#<id> y el detalle se ve.
// 5. Fase 3 bis C: sin rectángulos superpuestos en la grilla de categorías, las
//    tarjetas y los extras, a 320, 360, 390 y 412 px, en las 7 categorías.
const { chromium } = require("playwright");
const [DESPUES, ANTES] = process.argv.slice(2);
const FORZAR = "[data-reveal]{opacity:1!important;transform:none!important}";
const PAGINAS = ["/", "/precios", "/servicios/webs", "/servicios/ia", "/servicios/tiendas", "/servicios/gestion", "/servicios/turnos", "/servicios/mant", "/servicios/grandes", "/cotizador", "/demo", "/demo?plan=landing-profesional"];
const CATS = ["webs", "tiendas", "turnos", "gestion", "ia", "mant", "grandes"];
const fallas = [];
const falla = (m) => fallas.push(m);

async function abrir(p, url) {
  await p.goto(url, { waitUntil: "networkidle" });
  await p.addStyleTag({ content: FORZAR });
  await p.evaluate(() => document.querySelectorAll("video").forEach((v) => v.pause()));
  await p.waitForTimeout(300);
}

async function pantallas(b, base) {
  const out = {};
  for (const [nombre, vp] of [["escritorio", { width: 1440, height: 900 }], ["celular", { width: 390, height: 844 }]]) {
    const p = await b.newPage({ viewport: vp });
    await abrir(p, base + "/");
    await p.waitForTimeout(2500);
    out[nombre] = +((await p.evaluate(() => document.documentElement.scrollHeight)) / vp.height).toFixed(2);
    await p.close();
  }
  return out;
}

async function palabras(b, base) {
  const out = {};
  for (const w of [1280, 390]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    for (const r of [...PAGINAS, ...CATS.map((c) => `/precios?cat=${c}`)]) {
      await abrir(p, base + r);
      const m = await p.evaluate(() => {
        const t = document.querySelector("main").innerText;
        return {
          palabras: t.split(/\s+/).filter((x) => /[\p{L}\p{N}]/u.test(x)).length,
          precios: (t.match(/\$\s?\d{1,3}(?:\.\d{3})+/g) ?? []).length,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });
      if (m.overflow > 0) falla(`overflow ${m.overflow}px en ${r} a ${w}`);
      (out[r] ??= {})[w] = m;
    }
    await p.close();
  }
  return out;
}

async function modal(b, base) {
  const out = [];
  for (const w of [1280, 390]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } });
    for (const [r, sel] of [
      ["/", "button[aria-haspopup=dialog]"],
      ["/precios", "a[aria-haspopup=dialog]"],
      ["/servicios/webs", "a[aria-haspopup=dialog]"],
      ["/servicios/ia", "button[aria-haspopup=dialog]"],
    ]) {
      await abrir(p, base + r);
      const t = p.locator(`main ${sel}:visible`).first();
      await t.scrollIntoViewIfNeeded();
      await t.click();
      await p.waitForTimeout(400);
      const abierto = await p.evaluate(() => {
        const d = document.querySelector("dialog[open]");
        return {
          abierto: Boolean(d),
          modal: d?.matches(":modal") ?? false,
          foco: Boolean(d && d.contains(document.activeElement)),
          scrollBloqueado: getComputedStyle(document.documentElement).overflow === "hidden",
        };
      });
      // El foco no se escapa a la página: en 30 Tab seguidos queda adentro del
      // modal. Al pasar el último, el `<dialog>` nativo lo lleva a la interfaz
      // del navegador (en headless, `body`) y vuelve al primero: eso vale.
      let escapa = false;
      for (let i = 0; i < 30; i++) {
        await p.keyboard.press("Tab");
        const donde = await p.evaluate(() => {
          const a = document.activeElement;
          return !a || a === document.body ? "navegador" : document.querySelector("dialog[open]")?.contains(a) ? "modal" : a.outerHTML.slice(0, 80);
        });
        if (donde !== "modal" && donde !== "navegador") escapa = donde;
      }
      await p.keyboard.press("Escape");
      await p.waitForTimeout(200);
      const cerrado = await p.evaluate(() => ({
        cerrado: !document.querySelector("dialog[open]"),
        foco: document.activeElement?.getAttribute("aria-haspopup") === "dialog",
        scroll: getComputedStyle(document.documentElement).overflow !== "hidden",
      }));
      const ok = abierto.abierto && abierto.modal && abierto.foco && abierto.scrollBloqueado && !escapa && cerrado.cerrado && cerrado.foco && cerrado.scroll;
      if (!ok) falla(`modal en ${r} a ${w}: ${JSON.stringify({ abierto, escapa, cerrado })}`);
      out.push(`${r}@${w}: ${ok ? "ok" : "FALLA"}`);
    }
    // Clic en el fondo también cierra.
    await abrir(p, base + "/precios");
    await p.locator("main a[aria-haspopup=dialog]:visible").first().click();
    await p.waitForTimeout(300);
    await p.mouse.click(5, 5);
    await p.waitForTimeout(200);
    if (await p.evaluate(() => Boolean(document.querySelector("dialog[open]")))) falla(`el clic en el fondo no cierra a ${w}`);
    await p.close();
  }
  return out;
}

async function sinJs(b, base) {
  const ctx = await b.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  const out = [];
  await p.goto(base + "/precios", { waitUntil: "load" });
  const hrefs = await p.$$eval("main a[aria-haspopup=dialog]", (as) => [...new Set(as.map((a) => a.getAttribute("href")))]);
  if (!hrefs.length) falla("sin JS: /precios no tiene disparadores con href");
  for (const href of hrefs) {
    await p.goto(base + href, { waitUntil: "load" });
    // El sitio tiene `scroll-behavior: smooth`: se espera a que el ancla llegue.
    await p.waitForTimeout(1500);
    const id = href.split("#")[1];
    const r = await p.evaluate((id) => {
      const el = document.getElementById(id);
      const d = el?.closest("details");
      const rect = el?.getBoundingClientRect();
      return { existe: Boolean(el), abierto: d?.open ?? false, alto: rect?.height ?? 0, enPantalla: rect ? rect.top < innerHeight && rect.bottom > 0 : false };
    }, id);
    const ok = r.existe && r.abierto && r.alto > 50 && r.enPantalla;
    if (!ok) falla(`sin JS: ${href} → ${JSON.stringify(r)}`);
    out.push(`${href}: ${ok ? "ok" : "FALLA"}`);
  }
  // Los modales chicos (seña, formas de pago) caen en un <details> visible.
  await p.goto(base + "/", { waitUntil: "load" });
  const sena = await p.evaluate(() => [...document.querySelectorAll("main details.nojs-only")].some((d) => d.getBoundingClientRect().height > 0));
  if (!sena) falla("sin JS: la home no muestra el <details> de la seña");
  await ctx.close();
  return out;
}

/** Pares de rectángulos que se pisan (más de 1 px en los dos ejes). */
function pisadas(rects) {
  const malos = [];
  for (let i = 0; i < rects.length; i++)
    for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i], c = rects[j];
      const x = Math.min(a.r, c.r) - Math.max(a.l, c.l);
      const y = Math.min(a.b, c.b) - Math.max(a.t, c.t);
      if (x > 1 && y > 1) malos.push([a.n, c.n]);
    }
  return malos;
}

async function solapes(b, base) {
  const out = [];
  for (const w of [320, 360, 390, 412]) {
    const p = await b.newPage({ viewport: { width: w, height: 800 } });
    for (const cat of CATS) {
      await abrir(p, `${base}/precios?cat=${cat}`);
      const grupos = await p.evaluate(() => {
        const r = (el, n) => { const x = el.getBoundingClientRect(); return { n, l: x.left, r: x.right, t: x.top, b: x.bottom }; };
        const vis = (el) => el.getClientRects().length > 0;
        const tabs = [...document.querySelectorAll("[role=tab]")].map((e, i) => r(e, `tab${i}`));
        const tabHijos = [...document.querySelectorAll("[role=tab]")].map((e, i) => [...e.children].filter(vis).map((c, k) => r(c, `tab${i}.${k}`)));
        const panel = [...document.querySelectorAll("[role=tabpanel]")].find((x) => !x.hidden);
        const cards = [...panel.querySelectorAll("article.card")].map((e, i) => r(e, `card${i}`));
        const ancho = Math.max(...[...panel.querySelectorAll("*")].filter(vis).map((e) => e.getBoundingClientRect().right));
        return { tabs, tabHijos, cards, ancho, vw: document.documentElement.clientWidth };
      });
      const malos = [...pisadas(grupos.tabs), ...grupos.tabHijos.flatMap(pisadas), ...pisadas(grupos.cards)];
      if (malos.length) falla(`solapes en /precios?cat=${cat} a ${w}: ${JSON.stringify(malos)}`);
      if (grupos.ancho > grupos.vw + 0.5) falla(`algo del panel ${cat} sale del ancho a ${w} (${grupos.ancho} > ${grupos.vw})`);
      out.push(`${cat}@${w}: ${malos.length ? "FALLA" : "ok"}`);
    }
    // Extras: el modal "Sumale extras", fila por fila.
    await abrir(p, `${base}/precios`);
    await p.getByRole("button", { name: "Sumale extras" }).click();
    await p.waitForTimeout(400);
    const extras = await p.evaluate(() => {
      const d = document.querySelector("dialog[open]");
      const filas = [...d.querySelectorAll("li")];
      const r = (el, n) => { const x = el.getBoundingClientRect(); return { n, l: x.left, r: x.right, t: x.top, b: x.bottom }; };
      return {
        filas: filas.map((f, i) => r(f, `fila${i}`)),
        partes: filas.map((f, i) => [...f.children].map((c, k) => r(c, `fila${i}.${k}`))),
        sale: filas.some((f) => [...f.children].some((c) => c.getBoundingClientRect().right > d.getBoundingClientRect().right + 0.5)),
      };
    });
    const malos = [...pisadas(extras.filas), ...extras.partes.flatMap(pisadas)];
    if (malos.length || extras.sale) falla(`extras a ${w}: ${JSON.stringify({ malos, sale: extras.sale })}`);
    out.push(`extras@${w}: ${malos.length || extras.sale ? "FALLA" : "ok"}`);
    await p.close();
  }
  return out;
}

(async () => {
  const b = await chromium.launch();
  const res = {
    despues: { pantallas: await pantallas(b, DESPUES), palabras: await palabras(b, DESPUES) },
    modal: await modal(b, DESPUES),
    sinJs: await sinJs(b, DESPUES),
    solapes: await solapes(b, DESPUES),
  };
  if (ANTES) res.antes = { pantallas: await pantallas(b, ANTES), palabras: await palabras(b, ANTES) };
  await b.close();
  res.fallas = fallas;
  console.log(JSON.stringify(res, null, 1));
  if (fallas.length) process.exitCode = 1;
})();
