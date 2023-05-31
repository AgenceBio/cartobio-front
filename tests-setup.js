import { afterEach, vi } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from "pinia"
import routes from '~pages'

setActivePinia(createPinia())

// Enables default Vue Component, such as <router-link />
// via https://test-utils.vuejs.org/guide/advanced/vue-router.html#using-a-real-router
// and https://test-utils.vuejs.org/api/#config-global
const router = createRouter({ routes, history: createWebHistory() })
config.global.plugins = [router]

afterEach(() => vi.clearAllMocks())
