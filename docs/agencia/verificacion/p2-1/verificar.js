/* eslint-disable @typescript-eslint/no-require-imports -- script suelto de Node (CommonJS), no es parte de la app */
// Verificación de la tanda P2.1 (correcciones de Mauro sobre el preview de P2).
// Uso, con un build de producción (y el modelo simulado si se quiere la charla):
//   CHAT_ALLOWED_ORIGINS=http://localhost:3001 npx next start -p 3001
//   node docs/agencia/verificacion/p2-1/verificar.js http://localhost:3001
//
//  1. Al cambiar de categoría desde el fondo de la página, el título de la
//     categoría queda visible, sin taparse con el header ni con la fila de
//     chips, y con el foco (1280 y 390 px, las 7 categorías).
//  2. "Proyectos a medida" y las tarjetas: ningún badge pasa el borde de su
//     tarjeta, ningún título de paso tiene más de 3 renglones, los precios no
//     parten renglón y no hay overflow (1024 a 2560 px).
//  3. La columna derecha: con 8 ítems, a 1024–2560 px de ancho y 720–1300 de
//     alto, el pie con el estimado y el botón se ve completo, el panel no
//     scrollea entero (solo la lista) y no hay flotante encima.
// Escribe `resultado.json` y las capturas en esta carpeta.
const { chromium } = require("playwright");
const path = require("node:path");
const fs = require("node:fs");

const BASE = process.argv[2] || "http://localhost:3001";
const DIR = __dirname;
const FORZAR = "[data-reveal]{opacity:1!important;transform:none!important}";
const CATS = ["tiendas", "turnos", "gestion", "ia", "mant", "grandes", "webs"];
const OCHO = "landing-profesional,catalogo-con-pedidos-por-whatsapp,turnos-online,tablero-de-ventas,asistente-ia-para-tu-web,mantenimiento-basico,blog,pagina-adicional";
const fallas = [];
const falla = (m) => {
  fallas.push(m);
  console.log("✗", m);
};

async function abrir(p, url) {
  await p.goto(url, { waitUntil: "networkidle" });
  await p.addStyleTag({ content: FORZAR });
  await p.waitForTimeout(500);
}

async function categorias(b) {
  const out = {};
  for (const [w, h] of [[1280, 900], [390, 844]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await abrir(p, `${BASE}/soluciones?cat=webs`);
    for (const c of CATS) {
      await p.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
      await p.waitForTimeout(500);
      await p.click(w > 700 ? `#sol-tab-${c}` : `.chips-fijos [data-cat="${c}"]`);
      await p.waitForTimeout(1100);
      const r = await p.evaluate((c) => {
        const t = document.getElementById(`sol-titulo-${c}`).getBoundingClientRect();
        const header = document.querySelector("header").getBoundingClientRect().bottom;
        const chips = document.querySelector(".chips-fijos")?.getBoundingClientRect().bottom ?? 0;
        return { top: Math.round(t.top), tapa: Math.round(Math.max(header, chips)), foco: document.activeElement?.id === `sol-titulo-${c}` };
      }, c);
      if (!(r.top >= r.tapa && r.top < h - 80) || !r.foco) falla(`categoría ${c} a ${w}: ${JSON.stringify(r)}`);
      (out[w] ??= {})[c] = r;
    }
    await p.close();
  }
  console.log("✓ cambio de categoría revisado");
  return out;
}

async function tarjetas(b) {
  const out = {};
  for (const w of [390, 1024, 1280, 1536, 1920, 2560]) {
    const p = await b.newPage({ viewport: { width: w, height: 1000 } });
    for (const cat of ["grandes", "webs", "tiendas", "turnos", "gestion", "ia", "mant"]) {
      await abrir(p, `${BASE}/soluciones?cat=${cat}`);
      const r = await p.evaluate((cat) => {
        const panel = document.getElementById(`sol-panel-${cat}`);
        const fuera = [...panel.querySelectorAll(".tag")].filter((t) => {
          const card = t.closest(".card");
          if (!card) return false;
          const a = t.getBoundingClientRect();
          const c = card.getBoundingClientRect();
          return a.width > 0 && (a.right > c.right + 0.5 || a.left < c.left - 0.5);
        }).length;
        const lineas = (el) => Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight));
        return {
          badgesFuera: fuera,
          titulos: [...panel.querySelectorAll("ol h3")].map(lineas),
          precios: [...panel.querySelectorAll("ol .h.whitespace-nowrap")].map(lineas),
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      }, cat);
      if (r.badgesFuera || r.titulos.some((x) => x > 3) || r.precios.some((x) => x > 1) || r.overflow > 0) falla(`tarjetas ${cat} a ${w}: ${JSON.stringify(r)}`);
      (out[w] ??= {})[cat] = r;
    }
    await p.close();
  }
  console.log("✓ tarjetas y badges revisados");
  return out;
}

async function columna(b) {
  const out = {};
  for (const w of [1024, 1280, 1536, 2560]) {
    for (const h of [720, 900, 1300]) {
      const p = await b.newPage({ viewport: { width: w, height: h } });
      await abrir(p, `${BASE}/soluciones?a=${OCHO}`);
      await p.evaluate(() => {
        const y = document.getElementById("catalogo").getBoundingClientRect().top + scrollY + 300;
        window.scrollTo({ top: y, behavior: "instant" });
      });
      await p.waitForTimeout(400);
      const r = await p.evaluate(() => {
        const aside = document.querySelector('aside[aria-label="Tu kit y Malejo"]');
        const pie = aside.querySelector("#panel-kit > .flex-none")?.getBoundingClientRect();
        const lista = aside.querySelector("#panel-kit .scroll-fino");
        const flot = document.querySelector('button[aria-label="Abrir chat con Malejo"]')?.getBoundingClientRect();
        return {
          pieAbajo: pie ? Math.round(pie.bottom) : null,
          panelScrollea: aside.scrollHeight > aside.clientHeight + 1,
          listaScrollea: lista.scrollHeight > lista.clientHeight + 1,
          flotante: Boolean(flot && flot.width > 0),
        };
      });
      if (r.pieAbajo == null || r.pieAbajo > h || r.panelScrollea || r.flotante) falla(`columna a ${w}×${h}: ${JSON.stringify(r)}`);
      out[`${w}x${h}`] = r;
      await p.close();
    }
  }
  console.log("✓ columna derecha revisada");
  return out;
}

async function capturas(b) {
  for (const w of [1280, 2560]) {
    const ctx = await b.newContext({ viewport: { width: w, height: w > 2000 ? 1300 : 900 }, deviceScaleFactor: w > 2000 ? 1 : 2 });
    const p = await ctx.newPage();
    await abrir(p, `${BASE}/soluciones?cat=grandes&a=landing-profesional,turnos-online`);
    await p.evaluate(() => document.getElementById("sol-titulo-grandes").scrollIntoView({ behavior: "instant" }));
    await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(DIR, `${w}-soluciones-proyectos-a-medida.png`) });
    await p.click("#panel-tab-malejo");
    await p.waitForTimeout(2500);
    await p.screenshot({ path: path.join(DIR, `${w}-soluciones-pestana-malejo.png`) });
    await ctx.close();
  }
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await abrir(p, `${BASE}/soluciones?a=landing-profesional,turnos-online,blog`);
  await p.click(".barra-armado button");
  await p.waitForTimeout(700);
  await p.screenshot({ path: path.join(DIR, "390-soluciones-hoja-del-kit.png") });
  await ctx.close();
  console.log("✓ capturas guardadas");
}

(async () => {
  const b = await chromium.launch();
  const resultado = { fecha: new Date().toISOString(), base: BASE, categorias: await categorias(b), tarjetas: await tarjetas(b), columna: await columna(b) };
  await capturas(b);
  resultado.fallas = fallas;
  fs.writeFileSync(path.join(DIR, "resultado.json"), JSON.stringify(resultado, null, 2) + "\n");
  await b.close();
  console.log(fallas.length ? `\n${fallas.length} fallas` : "\nTodo en orden");
  process.exit(fallas.length ? 1 : 0);
})();
