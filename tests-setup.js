import { beforeEach, vi } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import { config } from '@vue/test-utils'
import { createHead } from '@unhead/vue'
import { createPinia, setActivePinia } from "pinia"
import routes from '~pages'

setActivePinia(createPinia())

// Enables default Vue Component, such as <router-link />
// via https://test-utils.vuejs.org/guide/advanced/vue-router.html#using-a-real-router
// and https://test-utils.vuejs.org/api/#config-global
const head = createHead()
const router = createRouter({ routes, history: createWebHistory() })

config.global.plugins = [head, router]

vi.mock('@/cartobio-api.js')

vi.mock('maplibre-gl', () => ({
  Map: vi.fn(() => ({
    addControl: vi.fn(),
    on: vi.fn(),
    once: vi.fn(),
    remove: vi.fn(),
    setGlyphs: vi.fn(),
    loadImage: vi.fn(),
    addSource: vi.fn(),
    addLayer: vi.fn(),
    getLayer: vi.fn(),
    getSource: vi.fn(),
    getStyle: vi.fn().mockImplementation(() => ({layers: []})),
    resize: vi.fn(),
  })),
  NavigationControl: vi.fn(),
}));

vi.stubGlobal('matchMedia', vi.fn(() => ({
  addEventListener: vi.fn(),
  matches: vi.fn().mockReturnValue(true)
})))

vi.spyOn(global, 'navigator', 'get').mockImplementation(() => ({
  clipboard: {
    writeText: vi.fn()
  }
}))

beforeEach(() => vi.clearAllMocks())
