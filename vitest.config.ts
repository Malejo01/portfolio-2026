import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/** Solo la lógica de precios de la agencia tiene tests (`npm test`). */
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  test: { include: ["lib/**/*.test.ts"], environment: "node" },
});
