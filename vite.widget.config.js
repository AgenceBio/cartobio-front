import { defineConfig } from "vite";
import { resolve, join } from "path";
import vue from "@vitejs/plugin-vue";

import baseConfig from "./vite.config.js";

const libConfig = {
  lib: {
    entry: resolve(join(__dirname, "widget", "main.js")),
    name: "NotificationCartobio",
    fileName: () => "notification-cartobio.js",
    formats: ["iife"],
  },
};

export default defineConfig(({ mode }) => {
  const resolvedConfig = baseConfig({ mode });

  return {
    ...resolvedConfig,

    root: "./widget",
    envDir: resolve(__dirname),
    publicDir: resolve(join(__dirname, "public")),

    plugins: [vue()],

    build: {
      ...libConfig,
      cssMinify: 'esbuild',
      outDir: resolve(join(__dirname, "dist", "notification-webcomponent")),
      emptyOutDir: true,

      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
    },
  };
});