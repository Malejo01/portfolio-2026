import { getPost } from "@/lib/agencia/blog";
import { getCategory } from "@/content/agencia/pricing";
import { solucion } from "@/content/agencia/servicios";

/**
 * Desde qué página escribe la persona (tanda R3). El widget manda
 * `location.pathname`; acá se valida contra las rutas del sitio y se
 * traduce a una línea para el bloque sin caché del prompt. Una ruta
 * desconocida no se le pasa al modelo (podría ser texto inventado).
 */
export async function contextoDePagina(path: string | undefined): Promise<string | null> {
  if (!path || !/^\/[a-z0-9/_-]*$/i.test(path) || path.length > 120) return null;
  const p = path.replace(/\/+$/, "") || "/";
  if (p === "/") return "la home";
  if (p === "/precios") return "la página con todos los precios";
  if (p === "/servicios") return "la lista de soluciones";
  if (p === "/cotizador") return "el cotizador (está armando un presupuesto)";
  if (p === "/demo") return "el formulario para pedir la demo";
  if (p === "/blog") return "el blog";
  const s = /^\/servicios\/([a-z]+)$/.exec(p);
  if (s) {
    const cat = getCategory(s[1]);
    const sol = cat && solucion(cat.key);
    return sol ? `la solución "${sol.title}" (categoría ${cat.label})` : null;
  }
  const b = /^\/blog\/([a-z0-9-]+)$/.exec(p);
  if (b) {
    const post = await getPost(b[1]).catch(() => null);
    return post ? `el artículo del blog "${post.titulo}"` : null;
  }
  if (p.startsWith("/legal/")) return "los términos legales";
  return null;
}
