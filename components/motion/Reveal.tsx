"use client";

import { motion, useReducedMotion } from "framer-motion";
import { STATIC_NODE, VIEWPORT, fadeUp, staggerContainer } from "@/lib/motion";

const NO_STAGGER = { hidden: {}, show: {} };

/**
 * Único wrapper de entrada del sitio. Es client, pero sus hijos llegan como
 * `children` desde un Server Component: nada del contenido se envía al
 * bundle, solo este contenedor.
 */
export function Reveal({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}) {
  const reduced = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      data-reveal=""
      className={className}
      variants={reduced ? STATIC_NODE : fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
    >
      {children}
    </Tag>
  );
}

/** Contenedor de stagger. Los hijos deben ser `<RevealItem>`. */
export function RevealGroup({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "ol" | "ul";
}) {
  const reduced = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      data-reveal=""
      className={className}
      variants={reduced ? NO_STAGGER : staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
    >
      {children}
    </Tag>
  );
}

export function RevealItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "article" | "span";
}) {
  const reduced = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag data-reveal="" className={className} variants={reduced ? STATIC_NODE : fadeUp}>
      {children}
    </Tag>
  );
}
