"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

/**
 * Captura animada de un proyecto: MP4 en loop sobre su póster. El `<video>`
 * sale del servidor sin `autoplay` y con `preload="none"`: no baja nada
 * hasta que entra en pantalla, y con reducir movimiento (o sin JS) queda el
 * póster. Se pausa al salir de la pantalla.
 */
export function ProjectVideo({
  src,
  poster,
  label,
  className,
}: {
  src: string;
  poster: string;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video || reduced) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <video
      ref={ref}
      className={className}
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      aria-label={label}
      width={800}
      height={365}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
