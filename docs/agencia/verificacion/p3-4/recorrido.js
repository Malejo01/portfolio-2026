/* eslint-disable @typescript-eslint/no-require-imports -- script suelto de Node (CommonJS), no es parte de la app */
// Tanda P3-4 · el recorrido de bienvenida en 4 estilos × claro/oscuro ×
// 360/390/768/1280.
// Uso: node docs/agencia/verificacion/p3-4/recorrido.js http://localhost:3001
//
// Por cada combinación, en un perfil limpio (sin `malejo-recorrido`):
// 1. el recorrido sale solo en la home (4 s después del hero, con el
//    navegador libre) y los 3 pasos encuentran su objetivo;
// 2. en cada paso el globito queda entero en la vista, no se superpone al
//    hueco ni a la barra inferior (salvo que el objetivo esté en ella) y el
//    foco está en "Siguiente"; contraste AA de los textos del globito contra
//    su fondo;
// 3. al terminar queda "visto" y al recargar no reaparece;
// 4. "¿Cómo uso la página?" lo reabre sin tocar la marca, Tab no sale del
//    globito y Esc lo cierra y devuelve el foco al enlace.
// Además, por ancho: si antes se abre el chat, no sale (marca "saltado").
//
// Escribe `recorrido.json` y las capturas `recorrido-<estilo>-<tema>-<ancho>-<paso>.png`
// (el paso 1 en todas las combinaciones; los 3 pasos en 390 y 1280 con el
// tema de entrada de cada estilo).
const { chromium } = require("playwright");
const path = require("node:path");
const fs = require("node:fs");

const BASE = process.argv[2] || "http://localhost:3001";
const DIR = __dirname;
const ESTILOS = ["tech", "institucional", "aula", "tienda"];
const ENTRADA = { tech: "dark", institucional: "light", aula: "dark", tienda: "light" };
const TEMAS = ["light", "dark"];
const ANCHOS = [360, 390, 768, 1280];
const alto = (w) => (w === 360 ? 740 : w === 390 ? 844 : w === 768 ? 1024 : 800);

/** Lo que se mide en la página en cada paso. */
function medirPaso() {
  const g = document.querySelector(".recorrido-globo");
  const h = document.querySelector(".recorrido-hueco");
  if (!g || !h) return null;
  const gr = g.getBoundingClientRect();
  const hr = h.getBoundingClientRect();
  const vw = document.documentElement.clientWidth;
  const vh = innerHeight;
  const navInf = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-inf")) || 0;
  // Qué hay debajo del centro del hueco (sin las capas del recorrido): el objetivo.
  const capas = [...document.querySelectorAll(".recorrido-capa, .recorrido-hueco, .recorrido-globo")];
  capas.forEach((c) => (c.style.visibility = "hidden"));
  const debajo = document.elementFromPoint(hr.x + hr.width / 2, hr.y + hr.height / 2);
  capas.forEach((c) => (c.style.visibility = ""));
  const objetivo = debajo?.closest("[data-recorrido]");
  const enBarra = !!objetivo?.closest(".nav-inf");

  // Colores resueltos con un canvas (sirve para rgb, color(), oklch…).
  const cv = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgba = (c) => {
    cv.clearRect(0, 0, 1, 1);
    cv.fillStyle = "#000";
    cv.fillStyle = c;
    cv.fillRect(0, 0, 1, 1);
    const [r, gg, b, a] = cv.getImageData(0, 0, 1, 1).data;
    return [r, gg, b, a / 255];
  };
  const fondoDe = (el) => {
    let capasFondo = [];
    for (let e = el; e; e = e.parentElement) {
      const c = rgba(getComputedStyle(e).backgroundColor);
      if (c[3] > 0) capasFondo.push(c);
      if (c[3] >= 1) break;
    }
    let out = [255, 255, 255];
    for (const c of capasFondo.reverse()) out = out.map((v, i) => v * (1 - c[3]) + c[i] * c[3]);
    return out;
  };
  const lum = ([r, gg, b]) => {
    const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(r) + 0.7152 * f(gg) + 0.0722 * f(b);
  };
  const contraste = (el) => {
    const bg = fondoDe(el);
    const c = rgba(getComputedStyle(el).color);
    const fg = c.slice(0, 3).map((v, i) => v * c[3] + bg[i] * (1 - c[3]));
    const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
    return Math.round(((a + 0.05) / (b + 0.05)) * 100) / 100;
  };
  const textos = {
    contador: g.querySelector(".lbl"),
    titulo: g.querySelector("h2"),
    texto: g.querySelector("h2 + p"),
    saltar: g.querySelectorAll("button")[0],
    siguiente: g.querySelectorAll("button")[1],
  };
  const ratios = Object.fromEntries(Object.entries(textos).map(([k, el]) => [k, el ? contraste(el) : null]));

  const solapa = (a, b) => !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
  return {
    paso: g.querySelector(".lbl")?.textContent,
    titulo: g.querySelector("h2")?.textContent,
    objetivo: objetivo?.getAttribute("data-recorrido") ?? null,
    entero: gr.left >= 0 && gr.top >= 0 && gr.right <= vw + 0.5 && gr.bottom <= vh + 0.5,
    tapaHueco: solapa(gr, hr),
    tapaBarra: !enBarra && navInf > 0 && gr.bottom > vh - navInf + 0.5,
    foco: g.contains(document.activeElement) ? document.activeElement.textContent : "(afuera)",
    velo: getComputedStyle(h).boxShadow.match(/rgba?\([^)]*\)/)?.[0] ?? null,
    contraste: ratios,
    aa: Object.entries(ratios).every(([, v]) => v === null || v >= 4.5),
  };
}

(async () => {
  const b = await chromium.launch();
  const resultados = [];
  const fallas = [];
  const falla = (clave, msg) => {
    fallas.push(`${clave}: ${msg}`);
    console.log("  ✗", msg);
  };

  for (const estilo of ESTILOS) {
    for (const tema of TEMAS) {
      for (const w of ANCHOS) {
        const clave = `${estilo}-${tema === "light" ? "claro" : "oscuro"}-${w}`;
        console.log(clave);
        const ctx = await b.newContext({ viewport: { width: w, height: alto(w) } });
        await ctx.addInitScript(([e, t]) => {
          if (sessionStorage.getItem("ya-sembrado")) return;
          sessionStorage.setItem("ya-sembrado", "1");
          localStorage.setItem("malejo-estilo", e);
          localStorage.setItem("malejo-tema-" + e, t);
        }, [estilo, tema]);
        const p = await ctx.newPage();
        const errores = [];
        p.on("pageerror", (e) => errores.push(e.message));
        await p.goto(BASE + "/", { waitUntil: "networkidle" });
        const r = { clave, estilo, tema, ancho: w, pasos: [] };
        try {
          await p.waitForSelector(".recorrido-globo", { state: "visible", timeout: 12000 });
        } catch {
          falla(clave, "el recorrido no salió solo");
          resultados.push(r);
          await ctx.close();
          continue;
        }
        const conTodos = w === 390 || w === 1280 ? tema === ENTRADA[estilo] : false;
        for (let k = 1; k <= 3; k++) {
          await p.waitForTimeout(450);
          const m = await p.evaluate(medirPaso);
          r.pasos.push(m);
          if (!m) {
            falla(clave, `paso ${k}: sin globito`);
            break;
          }
          if (m.paso !== `${k} de 3`) falla(clave, `paso ${k}: contador "${m.paso}"`);
          if (!m.objetivo) falla(clave, `paso ${k}: el hueco no está sobre un objetivo`);
          if (!m.entero) falla(clave, `paso ${k}: el globito se sale de la vista`);
          if (m.tapaHueco) falla(clave, `paso ${k}: el globito tapa el hueco`);
          if (m.tapaBarra) falla(clave, `paso ${k}: el globito pisa la barra inferior`);
          if (!m.aa) falla(clave, `paso ${k}: contraste ${JSON.stringify(m.contraste)}`);
          if (m.foco !== (k === 3 ? "¡Listo!" : "Siguiente")) falla(clave, `paso ${k}: foco en "${m.foco}"`);
          if (k === 1 || conTodos) await p.screenshot({ path: path.join(DIR, `recorrido-${clave}-${k}.png`) });
          await p.keyboard.press("Enter");
        }
        await p.waitForTimeout(300);
        r.marcaAlTerminar = await p.evaluate(() => localStorage.getItem("malejo-recorrido"));
        if (r.marcaAlTerminar !== "visto") falla(clave, `marca al terminar: ${r.marcaAlTerminar}`);
        if (await p.locator(".recorrido-globo").count()) falla(clave, "el globito sigue abierto al terminar");

        // Al recargar no reaparece.
        await p.reload({ waitUntil: "networkidle" });
        await p.waitForTimeout(6000);
        r.reaparece = (await p.locator(".recorrido-globo").count()) > 0;
        if (r.reaparece) falla(clave, "reapareció al recargar");

        // El enlace lo reabre, Tab no sale, Esc cierra y el foco vuelve.
        const enlace = p.locator("footer button.js-only");
        await enlace.scrollIntoViewIfNeeded();
        await enlace.focus();
        await p.keyboard.press("Enter");
        try {
          await p.waitForSelector(".recorrido-globo", { state: "visible", timeout: 6000 });
          await p.waitForTimeout(450);
          for (let t = 0; t < 3; t++) await p.keyboard.press("Tab");
          r.tabDentro = await p.evaluate(() => document.querySelector(".recorrido-globo").contains(document.activeElement));
          if (!r.tabDentro) falla(clave, "Tab sacó el foco del globito");
          await p.keyboard.press("Escape");
          await p.waitForTimeout(300);
          r.escCierra = (await p.locator(".recorrido-globo").count()) === 0;
          r.focoVuelve = await p.evaluate(() => document.activeElement?.closest("footer") !== null && document.activeElement.tagName === "BUTTON");
          r.marcaTrasEnlace = await p.evaluate(() => localStorage.getItem("malejo-recorrido"));
          if (!r.escCierra) falla(clave, "Esc no cerró");
          if (!r.focoVuelve) falla(clave, "el foco no volvió al enlace");
          if (r.marcaTrasEnlace !== "visto") falla(clave, `el enlace tocó la marca: ${r.marcaTrasEnlace}`);
        } catch {
          falla(clave, "el enlace no abrió el recorrido");
        }
        if (errores.length) falla(clave, `errores de página: ${errores.join(" | ")}`);
        resultados.push(r);
        await ctx.close();
      }
    }
  }

  // Si antes se abre el chat, no sale solo.
  for (const w of ANCHOS) {
    const clave = `chat-primero-${w}`;
    const ctx = await b.newContext({ viewport: { width: w, height: alto(w) } });
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    await p.evaluate(() => window.dispatchEvent(new CustomEvent("malejo:abrir", { cancelable: true, detail: {} })));
    await p.waitForTimeout(7000);
    const r = {
      clave,
      sale: (await p.locator(".recorrido-globo").count()) > 0,
      marca: await p.evaluate(() => localStorage.getItem("malejo-recorrido")),
    };
    console.log(clave, JSON.stringify(r));
    if (r.sale) falla(clave, "salió con el chat abierto");
    if (r.marca !== "saltado") falla(clave, `marca: ${r.marca}`);
    resultados.push(r);
    await ctx.close();
  }

  await b.close();
  fs.writeFileSync(path.join(DIR, "recorrido.json"), JSON.stringify({ base: BASE, fallas, resultados }, null, 2) + "\n");
  console.log(fallas.length ? `\n${fallas.length} fallas` : "\nTodo OK");
  process.exitCode = fallas.length ? 1 : 0;
})();
