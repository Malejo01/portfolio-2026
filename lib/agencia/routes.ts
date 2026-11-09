import { categories } from "@/content/agencia/pricing";
import { getPosts } from "./blog";

/**
 * Las rutas públicas del sitio de la agencia, para el sitemap. Las del
 * portfolio siguen saliendo de `lib/routes.ts`.
 */
export async function agenciaRoutes(): Promise<{ path: string; priority: number }[]> {
  const posts = await getPosts();
  return [
    { path: "/", priority: 1 },
    { path: "/servicios", priority: 0.9 },
    ...categories.map((c) => ({ path: `/servicios/${c.key}`, priority: 0.8 })),
    { path: "/precios", priority: 0.8 },
    { path: "/cotizador", priority: 0.7 },
    { path: "/demo", priority: 0.9 },
    { path: "/blog", priority: 0.6 },
    ...posts.map((p) => ({ path: `/blog/${p.slug}`, priority: 0.5 })),
    { path: "/legal/terminos", priority: 0.2 },
    { path: "/legal/cambios", priority: 0.2 },
    { path: "/legal/privacidad", priority: 0.2 },
  ];
}
