import { getPosts } from "@/lib/agencia/blog";
import { siteUrl } from "@/lib/links";

/** RSS 2.0 del blog, generado en el build. */
export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const posts = await getPosts();
  const items = posts
    .map(
      (p) => `    <item>
      <title>${esc(p.titulo)}</title>
      <link>${siteUrl}/blog/${p.slug}</link>
      <guid>${siteUrl}/blog/${p.slug}</guid>
      <pubDate>${new Date(`${p.fecha}T12:00:00Z`).toUTCString()}</pubDate>
      <description>${esc(p.resumen)}</description>
${p.etiquetas.map((t) => `      <category>${esc(t)}</category>`).join("\n")}
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Blog de Malejo</title>
    <link>${siteUrl}/blog</link>
    <description>Avances de los proyectos de Malejo y novedades de IA aplicada a negocios.</description>
    <language>es-AR</language>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
