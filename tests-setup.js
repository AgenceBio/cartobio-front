import { beforeEach, vi } from "vitest";
import { createRouter, createWebHistory } from "vue-router";
import { config } from "@vue/test-utils";
import { createHead } from "@unhead/vue";
import { createPinia, setActivePinia } from "pinia";
import routes from "~pages";
import record from "@/utils/__fixtures__/record-with-features.json";
import operator from "@/utils/__fixtures__/operator.json";

setActivePinia(createPinia());

// Enables default Vue Component, such as <router-link />
// via https://test-utils.vuejs.org/guide/advanced/vue-router.html#using-a-real-router
// and https://test-utils.vuejs.org/api/#config-global
const head = createHead();
const router = createRouter({ routes, history: createWebHistory() });

config.global.plugins = [head, router];

vi.mock("axios", async (importActual) => {
  const axios = await importActual();
  const createMock = {
    delete: vi.fn(),
    get: vi.fn((path) => {
      if (path.includes("/operator") && path.includes("/records")) return { data: [record] };
      if (path.includes("/operator")) return { data: operator };
      if (path.includes("/audits")) return { data: record };
    }),
    post: vi.fn(),
    head: vi.fn(),
    patch: vi.fn(),
    defaults: {
      headers: {
        common: {},
      },
    },
  };
  return {
    __esModule: true,
    default: {
      create: vi.fn().mockReturnValue(createMock),
      __createMock: createMock,
      delete: vi.fn(),
      get: vi.fn((path) => {
        if (path.includes("operator") && path.includes("records")) return { data: [record] };
        if (path.includes("operator")) return { data: operator };
        if (path.includes("audits")) return { data: record };
      }),
      head: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
    },
    post: vi.fn(),
    AxiosError: axios.AxiosError,
  };
});

vi.mock("maplibre-gl", () => ({
  Map: vi.fn(() => ({
    addControl: vi.fn(),
    on: vi.fn(),
    once: vi.fn(),
    remove: vi.fn(),
    setGlyphs: vi.fn(),
    loadImage: vi.fn(),
    addSource: vi.fn(),
    addLayer: vi.fn(),
    fitBounds: vi.fn(),
    getLayer: vi.fn(),
    getSource: vi.fn(),
    getZoom: vi.fn(),
    getStyle: vi.fn().mockImplementation(() => ({ layers: [] })),
    isStyleLoaded: vi.fn().mockReturnValue(true),
    setLayoutProperty: vi.fn(),
    resize: vi.fn(),
  })),
  NavigationControl: vi.fn(),
  ScaleControl: vi.fn(),
}));

vi.stubGlobal("localStorage", {
  getItem: vi.fn(),
  setItem: vi.fn(),
});

vi.mock("@vueuse/core", async (importActual) => {
  const vueuse = await importActual();
  return {
    __esModule: true,
    ...vueuse,
    useOnline: vi.fn().mockImplementation(() => ({ value: true })),
  };
});

vi.stubGlobal(
  "matchMedia",
  vi.fn(() => ({
    addEventListener: vi.fn(),
    matches: vi.fn().mockReturnValue(true),
  }))
);

vi.spyOn(global, "navigator", "get").mockImplementation(() => ({
  clipboard: {
    writeText: vi.fn(),
  },
  onLine: true,
}));

beforeEach(() => vi.clearAllMocks());
