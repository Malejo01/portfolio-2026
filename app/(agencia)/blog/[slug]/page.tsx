import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MdxContent } from "@/components/agencia/blog/MdxContent";
import { fechaLarga, getPost, getPosts } from "@/lib/agencia/blog";
import { siteUrl } from "@/lib/links";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.titulo,
    description: post.resumen,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.titulo, description: post.resumen, url: `/blog/${post.slug}`, publishedTime: post.fecha, images: ["/og"] },
  };
}

export default async function PostPage({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.titulo,
    description: post.resumen,
    datePublished: post.fecha,
    inLanguage: "es-AR",
    url: `${siteUrl}/blog/${post.slug}`,
    author: { "@type": "Person", name: "Mauro Lizárraga", url: `${siteUrl}/portfolio` },
    publisher: { "@type": "Organization", name: "Malejo", url: siteUrl },
  }).replace(/</g, "\\u003c");

  return (
    <article className="wrap pb-24 pt-10 sm:pt-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <div className="mx-auto max-w-[760px]">
        <Link href="/blog" className="lnk">
          ← Blog
        </Link>
        <div className="mt-6 flex flex-wrap gap-1.5">
          {post.etiquetas.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
        <h1 className="h mt-3 text-[34px] leading-[1.08] sm:text-[44px]">{post.titulo}</h1>
        <p className="mt-3 text-[17px] text-muted">{post.resumen}</p>
        <time dateTime={post.fecha} className="text-sm text-muted">
          {fechaLarga(post.fecha)} · Mauro Lizárraga
        </time>
        <div className="prose-ag mt-8 border-t border-border pt-6">
          <MdxContent source={post.source} />
        </div>
        <div className="card hi mt-12 flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0 text-[15px]">¿Querés ver cuánto sale lo tuyo?</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/demo" className="btn btn-p btn-sm">
              Pedí tu demo
            </Link>
            <Link href="/cotizador" className="btn btn-s btn-sm">
              Abrir el cotizador
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
