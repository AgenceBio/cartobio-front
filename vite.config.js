import { defineConfig, loadEnv, searchForWorkspaceRoot } from "vite";
import vue from "@vitejs/plugin-vue";
import Pages from "vite-plugin-pages";
import legacy from "@vitejs/plugin-legacy";
import { resolve, join, sep } from "path";
import { VitePWA } from "vite-plugin-pwa";

const cwd = process.cwd();

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd(), "");

  return {
    envPrefix: "VUE_APP_",

    define: {
      __APP_VERSION__: JSON.stringify(require("./package.json").version),
    },

    build: {
      sourcemap: true,
      cssMinify : 'esbuild',
      rolldownOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("xlsx")) return "xlsx";
              if (id.includes("@agencebio/rosetta-cultures")) return "rosetta-cultures";
              if (id.includes("@agencebio/cartobio-types")) return "cartobio-types";
              if (
                id.includes("vue-router") ||
                id.includes("@vueuse/core") ||
                id.includes("axios") ||
                id.includes(`${sep}vue${sep}`)
              ) {
                return "framework";
              }
              if (id.includes("@sentry/vue")) return "sentry";
              if (id.includes("proj4")) return "proj4";
            }
          },
        },
      },
    },

    plugins: [
      vue(),
      legacy({
        modernPolyfills: ["es.object.has-own", "es.array.at"],
        renderLegacyChunks: false,
      }),
      Pages({
        extensions: ["vue"],
        importMode: "async",
        extendRoute(route) {
          if (route.name === "certification-exploitations" || route.name === "exploitations") {
            route.props = (route) => ({ ...route.query });
          }

          return route;
        },
      }),
      VitePWA({
        registerType: "autoUpdate",
        manifest: false,
        includeAssets: ["*.woff2", "*.png", "*.svg", "*.jpg"],
        workbox: {
          globPatterns: ["**/*.{js,css,html,woff2,png,svg,jpg,ico}"],
          maximumFileSizeToCacheInBytes: 5000000,
          navigateFallbackDenylist: [/^\/api/, /^\/status\.txt/],
        },
      }),
    ],

    resolve: {
      alias: [
        { find: "@gouvfr/dsfr", replacement: resolve(join(__dirname, "node_modules", "@gouvfr", "dsfr", "dist")) },
        { find: "@/", replacement: resolve(join(__dirname, "src")) + sep },
        { find: "styles", replacement: resolve(join(__dirname, "src", "styles")) },
      ],
    },

    server: {
      host: "127.0.0.1",
      port: 3000,
      fs: {
        allow: [searchForWorkspaceRoot(cwd), resolve(join(__dirname, "node_modules", "@gouvfr", "dsfr"))],
      },
    },

    test: {
      coverage: {
        reporter: ["text", "html", "lcovonly", "clover", "json"],
        provider: "istanbul",
      },
      environment: "jsdom",
      setupFiles: ["./tests-setup.js"],
    },
  };
});
