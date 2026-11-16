import { conocimiento, fraseDeCosto } from "@/content/agencia/conocimiento";

/**
 * Bloque de conocimiento del system prompt, **generado** desde
 * `content/agencia/conocimiento.ts` (igual que el catálogo sale de
 * `pricing.ts`). Determinista: es parte del prefijo cacheado. La seña ya
 * viene escrita en el conocimiento (escalonada, tanda P2). Los links de los proyectos no se le pasan al modelo a
 * propósito: nunca escribe URLs, los muestra la tarjeta de proyectos.
 */
export function bloqueConocimiento(): string {
  const k = conocimiento;
  return [
    `## Quién es Mauro\n${k.quienSoy}`,
    `## Cómo se trabaja\n${k.proceso}`,
    `## Pagos\n${k.pagos.map((p) => `- ${p}`).join("\n")}`,
    `## Qué pagás y a quién (el auto, el taller y la nafta)\n${[k.modeloDeCostos.sistema, k.modeloDeCostos.mantenimiento, k.modeloDeCostos.uso].map((p) => `- ${fraseDeCosto(p)}`).join("\n")}`,
    `## Dominio, código y tecnología\n- ${k.dominio}\n- ${k.propiedad}\n- ${k.tecnologia}`,
    `## Mantenimiento\n${k.mantenimiento}`,
    `## Garantía\n${k.garantia}`,
    `## Tiempo de respuesta de Mauro\n${k.tiempoRespuesta}`,
    `## Proyectos para mostrar (con mostrar_proyectos)\n${k.proyectos
      .map((p) => `- ${p.nombre}: ${p.que} Demuestra: ${p.demuestra} Plan parecido: ${p.parecido}.`)
      .join("\n")}\n- Y el portfolio de Mauro, con todos los casos.`,
    `## Preguntas frecuentes\n${k.faq.map((f) => `- ${f.q} ${f.a}`).join("\n")}`,
  ].join("\n\n");
}
