import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

/**
 * Posts del blog: `content/agencia/blog/*.mdx` con frontmatter (`titulo`,
 * `fecha`, `resumen`, `etiquetas`). Se leen en el build: `/blog` y
 * `/blog/[slug]` son estáticas. El slug es el nombre del archivo.
 */
const DIR = path.join(process.cwd(), "content", "agencia", "blog");

export interface PostMeta {
  slug: string;
  titulo: string;
  fecha: string;
  resumen: string;
  etiquetas: string[];
}

export interface Post extends PostMeta {
  source: string;
}

function meta(slug: string, data: Record<string, unknown>): PostMeta {
  const fecha = data.fecha instanceof Date ? data.fecha.toISOString().slice(0, 10) : String(data.fecha ?? "");
  return {
    slug,
    titulo: String(data.titulo ?? slug),
    fecha,
    resumen: String(data.resumen ?? ""),
    etiquetas: Array.isArray(data.etiquetas) ? data.etiquetas.map(String) : [],
  };
}

export async function getPosts(): Promise<PostMeta[]> {
  const files = (await fs.readdir(DIR)).filter((f) => f.endsWith(".mdx"));
  const posts = await Promise.all(
    files.map(async (f) => {
      const { data } = matter(await fs.readFile(path.join(DIR, f), "utf8"));
      return meta(f.replace(/\.mdx$/, ""), data);
    }),
  );
  return posts.sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export async function getPost(slug: string): Promise<Post | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    const { data, content } = matter(await fs.readFile(path.join(DIR, `${slug}.mdx`), "utf8"));
    return { ...meta(slug, data), source: content };
  } catch {
    return null;
  }
}

/** "2026-11-06" → "6 de noviembre de 2026". */
export function fechaLarga(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}
