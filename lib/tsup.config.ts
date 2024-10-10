import { defineConfig } from "tsup";

// some of these settings should be changed when we actually release like splitting and minify and stuff
export default defineConfig({
  entry: ["index.ts"],
  format: ["cjs", "esm"], // Build for commonJS and ESmodules
  dts: true, // Generate declaration file (.d.ts)
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false
});