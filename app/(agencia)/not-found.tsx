import type { Metadata } from "next";
import Link from "next/link";
import { MalejoMark } from "@/components/agencia/MalejoMark";
import { site } from "@/content/agencia/site";

export const metadata: Metadata = {
  title: "404",
  robots: { index: false, follow: true },
};

/** 404 de la agencia. Lo dispara `[...notFound]` para toda URL de la raíz sin ruta. */
export default function NotFound() {
  const copy = site.notFound;

  return (
    <section className="wrap pb-24 pt-10 sm:pt-16">
      <div className="card card-big relative flex min-h-[420px] flex-col justify-center gap-5 overflow-hidden p-7 sm:p-14">
        <MalejoMark
          size={420}
          strokeWidth={3.2}
          className="pointer-events-none absolute -bottom-[120px] -right-[90px] text-acc opacity-[.07]"
        />
        <span className="lbl lbl-o relative">{copy.label}</span>
        <h1 className="h relative text-[40px] leading-[1.05] sm:text-[56px]">{copy.title}</h1>
        <p className="relative m-0 max-w-[30em] text-[17px] leading-relaxed text-muted">{copy.body}</p>
        <div className="relative flex flex-wrap gap-3">
          <Link href="/" className="btn btn-p">
            {copy.home}
          </Link>
          <Link href="/portfolio" className="btn btn-s">
            {copy.portfolio}
          </Link>
        </div>
      </div>
    </section>
  );
}
