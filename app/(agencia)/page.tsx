/**
 * Home provisoria de F1: solo menú y pie (los pone el layout). La home real
 * llega en F2. Mientras tanto `/` sigue redirigiendo a `/portfolio` desde
 * `next.config.ts`, así que esta página solo se ve en desarrollo.
 */
export default function Page() {
  return <div className="min-h-[60vh]" />;
}
