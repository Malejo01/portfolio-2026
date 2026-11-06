/**
 * Formato de montos en pesos para es-AR: `$180.000`. Sin decimales: todos
 * los precios del catálogo son enteros (y el recargo redondea a $100).
 *
 * No usa `style: "currency"` porque ICU agrega un espacio duro entre el
 * signo y el número (`$ 180.000`), y el diseño lo escribe pegado.
 */
const NUMBER = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

export function fmt(n: number): string {
  return `$${NUMBER.format(Math.round(n))}`;
}
