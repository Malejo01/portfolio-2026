import type { Metadata } from "next";
import Link from "next/link";
import { fechaLarga, getPosts } from "@/lib/agencia/blog";

const title = "Blog";
const description = "Avances de los proyectos de Malejo y novedades de IA aplicada a negocios.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/blog/rss.xml" } },
  openGraph: { title, description, url: "/blog", images: ["/og"] },
};

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <section className="wrap pb-24 pt-10 sm:pt-16">
      <span className="lbl lbl-o">Blog</span>
      <h1 className="h h2">Avances y novedades</h1>
      <p className="mb-0 mt-2 max-w-[40em] text-[17px] text-muted">{description}</p>
      <ul className="m-0 mt-8 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <li key={p.slug} className="flex">
            <article className="card lift relative flex flex-1 flex-col gap-3 p-[26px]">
              <div className="flex flex-wrap gap-1.5">
                {p.etiquetas.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
              <h2 className="h text-[22px] leading-tight">
                <Link href={`/blog/${p.slug}`} className="no-underline after:absolute after:inset-0 after:rounded-[22px] after:content-['']">
                  {p.titulo}
                </Link>
              </h2>
              <p className="m-0 text-[15px] leading-normal text-muted">{p.resumen}</p>
              <time dateTime={p.fecha} className="mt-auto border-t border-border pt-3.5 text-sm text-muted">
                {fechaLarga(p.fecha)}
              </time>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
