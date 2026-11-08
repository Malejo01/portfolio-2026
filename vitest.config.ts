import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Tests de la agencia (`npm test`): precios, herramientas, ficha, WhatsApp,
 * prompt, límites, la ruta del chat contra un modelo simulado y las
 * aserciones de los evals. Sin red: el modelo y dolarapi.com se simulan.
 */
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  test: { include: ["lib/**/*.test.ts"], environment: "node" },
});
