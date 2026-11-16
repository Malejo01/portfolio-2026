import { senaCopy } from "@/content/agencia/pricing";
import { filasDeSena } from "@/lib/agencia/pricing";

/**
 * La tabla de la seña escalonada (tanda P2, D4): un renglón por tramo, el
 * mínimo con IA, el plan por escrito y la renovación sin cargo. Server
 * Component: va dentro de los modales `info` ("¿Cómo funciona la seña?"),
 * de `/demo` y del armador. Los montos salen de `filasDeSena()`.
 */
export function SenaTabla({ titulo = true }: { titulo?: boolean }) {
  const t = senaCopy.tabla;
  return (
    <div className="flex flex-col gap-2">
      {titulo ? <h3 className="lbl m-0">{t.titulo}</h3> : null}
      <dl className="m-0 flex flex-col">
        {filasDeSena().map((f) => (
          <div key={f.label} className="flex items-start justify-between gap-4 border-b border-border py-2 last:border-b-0">
            <dt className="min-w-0 text-muted">{f.label}</dt>
            <dd className="m-0 flex-none text-right font-semibold">{f.monto}</dd>
          </div>
        ))}
      </dl>
      <p className="m-0 text-[13px] text-muted">{t.nota}</p>
    </div>
  );
}
