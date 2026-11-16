/**
 * Copy del recorrido de bienvenida (tanda P3-4). Tres pasos, los mismos en
 * celular y escritorio aunque cambie dónde está cada botón: el objetivo de
 * cada paso se marca con `data-recorrido="<id>"` en el elemento real (ver
 * `lib/agencia/recorrido.ts`). `{N}`, `{T}` y `{TITULO}` se reemplazan en la
 * isla.
 */
export type PasoId = "malejo" | "kit" | "estilos";

export const recorridoCopy = {
  pasos: [
    {
      id: "malejo",
      titulo: "Hablá con Malejo",
      texto: "Soy Malejo, el asistente de Mauro. Contame qué necesita tu negocio y te ayudo a elegir. Si preferís, te paso con Mauro por WhatsApp.",
    },
    {
      id: "kit",
      titulo: "Armá tu kit",
      texto: "Acá están todas las soluciones con su precio. Sumá lo que te sirve y mirás un estimado al instante.",
    },
    {
      id: "estilos",
      titulo: "Probá otro estilo",
      texto: "¿Querés ver cómo se vería una web de tu rubro? Mirá esta página como Institucional, Aula virtual o Tienda.",
    },
  ] satisfies { id: PasoId; titulo: string; texto: string }[],
  siguiente: "Siguiente",
  saltar: "Saltar",
  listo: "¡Listo!",
  /** Arriba del globito: "1 de 3". */
  contador: "{N} de {T}",
  /** Lo que anuncia el lector de pantalla al cambiar de paso. */
  aviso: "Paso {N} de {T}: {TITULO}",
  /** El enlace para volver a verlo (pie, menú del celular y panel de estilos). */
  enlace: "¿Cómo uso la página?",
};

export type RecorridoCopy = typeof recorridoCopy;
