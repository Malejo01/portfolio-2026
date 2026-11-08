import { CALCOM_URL, waLink } from "@/lib/agencia/config";

/**
 * Destino de "Agendá la consultoría" (proyectos grandes): Cal.com si existe
 * `NEXT_PUBLIC_CALCOM_URL`; si no, WhatsApp con el pedido ya escrito.
 */
export const agendaGrandesHref: string =
  CALCOM_URL || waLink("Hola Mauro, vengo de malejo.com.ar y quiero agendar la consultoría inicial para un proyecto grande.");
