import { conocimiento } from "@/content/agencia/conocimiento";
import { fmt } from "@/lib/agencia/format";

/**
 * Bloque de conocimiento del system prompt, **generado** desde
 * `content/agencia/conocimiento.ts` (igual que el catálogo sale de
 * `pricing.ts`). Determinista para el mismo monto de seña: es parte del
 * prefijo cacheado. Los links de los proyectos no se le pasan al modelo a
 * propósito: nunca escribe URLs, los muestra la tarjeta de proyectos.
 */
export function bloqueConocimiento(senaMonto: number): string {
  const sena = fmt(senaMonto);
  const k = conocimiento;
  const s = (t: string) => t.replaceAll("{SENA}", sena);
  return [
    `## Quién es Mauro\n${k.quienSoy}`,
    `## Cómo se trabaja\n${s(k.proceso)}`,
    `## Pagos\n${k.pagos.map((p) => `- ${s(p)}`).join("\n")}`,
    `## Dominio, código y tecnología\n- ${k.dominio}\n- ${k.propiedad}\n- ${k.tecnologia}`,
    `## Mantenimiento\n${k.mantenimiento}`,
    `## Garantía\n${k.garantia}`,
    `## Tiempo de respuesta de Mauro\n${k.tiempoRespuesta}`,
    `## Proyectos para mostrar (con mostrar_proyectos)\n${k.proyectos
      .map((p) => `- ${p.nombre}: ${p.que} Demuestra: ${p.demuestra} Plan parecido: ${p.parecido}.`)
      .join("\n")}\n- Y el portfolio de Mauro, con todos los casos.`,
    `## Preguntas frecuentes\n${k.faq.map((f) => `- ${f.q} ${s(f.a)}`).join("\n")}`,
  ].join("\n\n");
}
