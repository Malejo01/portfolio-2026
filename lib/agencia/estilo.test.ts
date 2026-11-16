import { afterEach, describe, expect, it } from "vitest";
import { DIBUJO_ORIGINAL, ESTILO_ORIGINAL, estilos } from "@/content/agencia/estilos";
import { arrancar, configArranque, resolverTema, scriptDeArranque, temaKey } from "./estilo";

/** Tanda P3-4 · el tema por estilo. */
const entrada = configArranque(estilos, ESTILO_ORIGINAL, DIBUJO_ORIGINAL).estilos;

describe("resolverTema", () => {
  it("sin nada guardado, cada estilo arranca en su tema de entrada", () => {
    expect(resolverTema("tech", null, null, entrada, "tech").tema).toBe("dark");
    expect(resolverTema("institucional", null, null, entrada, "tech").tema).toBe("light");
    expect(resolverTema("aula", null, null, entrada, "tech").tema).toBe("dark");
    expect(resolverTema("tienda", null, null, entrada, "tech").tema).toBe("light");
  });

  it("la clave guardada del estilo manda", () => {
    expect(resolverTema("institucional", "dark", null, entrada, "tech")).toEqual({ tema: "dark", migrar: false });
    expect(resolverTema("aula", "light", null, entrada, "tech")).toEqual({ tema: "light", migrar: false });
  });

  it("un valor raro guardado no cuenta", () => {
    expect(resolverTema("tienda", "azul", null, entrada, "tech").tema).toBe("light");
  });

  it("la cookie vieja solo cuenta para Tech, y pide migrarse", () => {
    expect(resolverTema("tech", null, "light", entrada, "tech")).toEqual({ tema: "light", migrar: true });
    expect(resolverTema("institucional", null, "dark", entrada, "tech")).toEqual({ tema: "light", migrar: false });
    expect(resolverTema("aula", null, "light", entrada, "tech")).toEqual({ tema: "dark", migrar: false });
  });

  it("con la clave de Tech ya guardada, la cookie vieja no cuenta", () => {
    expect(resolverTema("tech", "dark", "light", entrada, "tech")).toEqual({ tema: "dark", migrar: false });
  });
});

/** Un `document` y un `localStorage` mínimos para correr el script del `<head>` en Node. */
function entorno(guardado: Record<string, string>, cookie = "") {
  const almacen = new Map(Object.entries(guardado));
  const attrs = new Map<string, string>();
  const clases = new Set<string>();
  const escrito: string[] = [];
  const documento = {
    cookie,
    documentElement: {
      classList: {
        add: (c: string) => clases.add(c),
        toggle: (c: string, on: boolean) => (on ? clases.add(c) : clases.delete(c)),
      },
      setAttribute: (k: string, v: string) => attrs.set(k, v),
      style: {} as Record<string, string>,
    },
    querySelector: () => null,
    write: (s: string) => escrito.push(s),
    head: { appendChild: () => {} },
    createElement: () => ({ setAttribute: () => {} }),
  };
  const ventana = {
    localStorage: {
      getItem: (k: string) => almacen.get(k) ?? null,
      setItem: (k: string, v: string) => void almacen.set(k, v),
      removeItem: (k: string) => void almacen.delete(k),
    },
  };
  Object.assign(globalThis, { document: documento, window: ventana });
  return { almacen, attrs, clases, documento };
}

afterEach(() => {
  delete (globalThis as { document?: unknown }).document;
  delete (globalThis as { window?: unknown }).window;
});

describe("arrancar (script del <head> y respaldo del 404)", () => {
  const cfg = configArranque(estilos, ESTILO_ORIGINAL, DIBUJO_ORIGINAL, { institucional: "/i.css", aula: "/a.css", tienda: "/t.css" });

  it("Institucional sin nada guardado arranca claro; Aula, oscuro", () => {
    let e = entorno({ "malejo-estilo": "institucional" });
    arrancar(cfg, false);
    expect(e.clases.has("dark")).toBe(false);
    e = entorno({ "malejo-estilo": "aula" });
    arrancar(cfg, false);
    expect(e.clases.has("dark")).toBe(true);
  });

  it("el tema de Institucional no cambia el de Tech", () => {
    const e = entorno({ "malejo-estilo": "tech", [temaKey("institucional")]: "dark" });
    arrancar(cfg, false);
    expect(e.clases.has("dark")).toBe(true);
    const f = entorno({ "malejo-estilo": "tech", [temaKey("institucional")]: "light" });
    arrancar(cfg, false);
    expect(f.clases.has("dark")).toBe(true);
  });

  it("migra la cookie vieja a Tech una vez y la borra", () => {
    const e = entorno({}, "malejo-theme=light");
    arrancar(cfg, false);
    expect(e.clases.has("dark")).toBe(false);
    expect(e.almacen.get(temaKey("tech"))).toBe("light");
    expect(e.documento.cookie).toContain("max-age=0");
  });

  it("con la cookie vieja en oscuro, Institucional igual arranca claro", () => {
    const e = entorno({ "malejo-estilo": "institucional" }, "malejo-theme=dark");
    arrancar(cfg, false);
    expect(e.clases.has("dark")).toBe(false);
    expect(e.almacen.has(temaKey("tech"))).toBe(false);
  });

  it("el script serializado trae el resolvedor y no depende de nada de afuera", () => {
    const s = scriptDeArranque(cfg);
    const e = entorno({ "malejo-estilo": "tienda" });
    new Function(s)();
    expect(e.attrs.get("data-estilo")).toBe("tienda");
    expect(e.clases.has("dark")).toBe(false);
  });
});
