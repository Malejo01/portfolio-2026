/* eslint-disable @typescript-eslint/no-require-imports -- script suelto de Node (CommonJS), no es parte de la app */
// Tanda P3-3.1 · el personaje del hero y el botón flotante del chat no se tocan.
// Uso, con un build de producción:
//   CHAT_ALLOWED_ORIGINS=http://localhost:3001 npx next start -p 3001
//   node docs/agencia/verificacion/p3-3-1/superposicion.js http://localhost:3001
//
// Los 4 estilos × 768, 1024, 1280, 1440 y 1920 px × claro y oscuro, en la
// home con el chat cerrado. Compara el rectángulo del sprite visible del hero
// con el del botón flotante de Malejo (fijo abajo a la derecha). El peor caso
// es con la página arriba de todo: al bajar, el hero sube y se aleja del
// botón. Criterio: al menos 16 px de aire entre los dos rectángulos, y que
// el personaje no tape texto, enlaces ni botones del hero.
// Escribe `superposicion.json` en esta carpeta y sale con 1 si hay choques.
const { chromium } = require("playwright");
const path = require("node:path");
const fs = require("node:fs");

const BASE = process.argv[2] || "http://localhost:3001";
const AIRE = 16;
const ESTILOS = ["tech", "institucional", "aula", "tienda"];
const PANTALLAS = [
  [768, 1024],
  [1024, 768],
  [1280, 800],
  [1440, 900],
  [1920, 1080],
];

(async () => {
  const b = await chromium.launch();
  const out = {};
  const choques = [];
  for (const estilo of ESTILOS)
    for (const tema of ["light", "dark"])
      for (const [w, h] of PANTALLAS) {
        const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: "reduce" });
        await ctx.addInitScript((e) => localStorage.setItem("malejo-estilo", e), estilo);
        await ctx.addCookies([{ name: "malejo-theme", value: tema, url: BASE }]);
        const p = await ctx.newPage();
        await p.goto(BASE + "/", { waitUntil: "networkidle" });
        // El widget de Malejo carga diferido: se espera al botón.
        await p.waitForSelector('button[aria-label="Abrir chat con Malejo"]', { state: "visible", timeout: 15000 });
        await p.waitForTimeout(300);
        const r = await p.evaluate(() => {
          // El rectángulo que se ve: recortado por los contenedores con overflow (el
          // recuadro de "Soy Mauro" en Tech recorta el sprite a la cabeza).
          const visible = (el) => {
            const q = el.getBoundingClientRect();
            let { left, top, right, bottom } = q;
            for (let n = el.parentElement; n; n = n.parentElement) {
              const cs = getComputedStyle(n);
              if (cs.overflowX !== "visible" || cs.overflowY !== "visible") {
                const c = n.getBoundingClientRect();
                left = Math.max(left, c.left);
                top = Math.max(top, c.top);
                right = Math.min(right, c.right);
                bottom = Math.min(bottom, c.bottom);
              }
            }
            return { left, top, right, bottom };
          };
          const caja = (el) => {
            const q = visible(el);
            return { x: Math.round(q.left), y: Math.round(q.top), r: Math.round(q.right), b: Math.round(q.bottom) };
          };
          const hero = [...document.querySelectorAll("#inicio > section")].find((s) => s.offsetParent);
          const sprites = [...hero.querySelectorAll("[data-sprite] .sprite")].filter((s) => getComputedStyle(s).display !== "none" && s.getBoundingClientRect().width > 0 && s.offsetParent);
          const boton = document.querySelector('button[aria-label="Abrir chat con Malejo"]');
          // Además, que el personaje no tape texto ni botones del hero (cajas del texto real).
          const tapa = [];
          for (const s of sprites) {
            const q = visible(s);
            const w = document.createTreeWalker(hero, NodeFilter.SHOW_TEXT);
            while (w.nextNode()) {
              const t = w.currentNode;
              const el = t.parentElement;
              if (!t.textContent.trim() || !el || !el.offsetParent || el.closest("[aria-hidden='true']") || s.contains(el)) continue;
              const rango = document.createRange();
              rango.selectNodeContents(t);
              for (const c of rango.getClientRects()) {
                const x = Math.min(q.right, c.right) - Math.max(q.left, c.left);
                const y = Math.min(q.bottom, c.bottom) - Math.max(q.top, c.top);
                if (x > 2 && y > 2) tapa.push(t.textContent.trim().slice(0, 30));
              }
            }
            for (const el of hero.querySelectorAll("a, button")) {
              if (!el.offsetParent) continue;
              const c = el.getBoundingClientRect();
              const x = Math.min(q.right, c.right) - Math.max(q.left, c.left);
              const y = Math.min(q.bottom, c.bottom) - Math.max(q.top, c.top);
              if (x > 2 && y > 2) tapa.push(`[${el.tagName}] ${(el.textContent || "").trim().slice(0, 30)}`);
            }
          }
          return { sprites: sprites.map(caja), boton: caja(boton), tapa: [...new Set(tapa)] };
        });
        const aire = (a, c) => Math.max(c.x - a.r, a.x - c.r, c.y - a.b, a.y - c.b);
        const minimo = r.sprites.length ? Math.min(...r.sprites.map((s) => aire(s, r.boton))) : null;
        const clave = `${estilo}/${tema}/${w}x${h}`;
        out[clave] = { ...r, aire: minimo };
        if (minimo != null && minimo < AIRE) choques.push(`${clave}: ${minimo} px`);
        if (r.tapa.length) choques.push(`${clave}: el personaje tapa ${JSON.stringify(r.tapa)}`);
        await ctx.close();
      }
  await b.close();
  fs.writeFileSync(path.join(__dirname, "superposicion.json"), JSON.stringify({ fecha: new Date().toISOString(), base: BASE, aireMinimo: AIRE, choques, medidas: out }, null, 2) + "\n");
  for (const [k, v] of Object.entries(out)) console.log(`${(v.aire == null || v.aire >= AIRE) && !v.tapa.length ? "✓" : "✗"} ${k}: aire ${v.aire ?? "sin sprite a la vista"}${v.tapa.length ? ` · tapa ${JSON.stringify(v.tapa)}` : ""}`);
  console.log(choques.length ? `\n${choques.length} choques` : "\nSin choques");
  process.exit(choques.length ? 1 : 0);
})();
