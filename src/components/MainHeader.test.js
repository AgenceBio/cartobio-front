import { afterEach, describe, expect, test, vi } from "vitest"
import { createTestingPinia } from "@pinia/testing"
import { flushPromises, mount } from "@vue/test-utils"
import { usePermissions, useUserStore } from "@/stores/index.js"
import { ROLES } from "@/stores/user.js"

import MainHeader from "./MainHeader.vue"

const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false })
const user = useUserStore(pinia)
const permissions = usePermissions(pinia)

describe("MainHeader", () => {
  afterEach(() => {
    user.$reset()
    permissions.$reset()
    vi.unstubAllEnvs()
  })

  test("as a guest", () => {
    const wrapper = mount(MainHeader)

    expect(wrapper.find('.tool-username').exists()).toEqual(false)
    expect(wrapper.find('.fr-header__tools').text()).toEqual('Connexion')
  })

  test("with a warning header", async () => {
    delete import.meta.env.VUE_APP_PRODUCTION

    const wrapper = mount(MainHeader)
    expect(wrapper.find('.fr-notice').exists()).toEqual(true)
  })

  test("without a warning header", async () => {
    vi.stubEnv('VUE_APP_PRODUCTION', true)

    const wrapper = mount(MainHeader)
    expect(wrapper.find('.fr-notice').exists()).toEqual(false)
  })

  test("as a guest, on a general audience page", () => {
    const wrapper = mount(MainHeader, {
      global: {
        mocks: {
          $route: {
            meta: { generalAudience: true }
          }
        }
      }
    })

    expect(wrapper.find('.tool-username').exists()).toEqual(false)
    expect(wrapper.find('.fr-header__tools').text()).toEqual('Accès professionnel')
    expect(wrapper.find('[role="navigation"] a[target="_blank"]').exists()).toEqual(false)
  })

  test("as a certification body", async () => {
    const wrapper = mount(MainHeader)
    user.isLogged = true
    user.roles = [ROLES.OC_AUDIT]
    await flushPromises()

    expect(wrapper.find('.tool-username a').classes('fr-icon-medal-fill')).toEqual(true)
    expect(wrapper.find('[role="navigation"] a').attributes('href')).toEqual('/certification/exploitations')
    expect(wrapper.find('[role="navigation"] a[target="_blank"]').attributes('href')).toEqual('https://docs-cartobio.agencebio.org/organisme-certification')

    await wrapper.find('.tool-logout a').trigger('click')
    await flushPromises()
  })

  test("as a farmer", async () => {
    const wrapper = mount(MainHeader)
    user.isLogged = true
    user.roles = [ROLES.OPERATEUR]
    await flushPromises()

    expect(wrapper.find('.tool-username a').classes('fr-icon-plant-fill')).toEqual(true)
    expect(wrapper.find('[role="navigation"] a').attributes('href')).toEqual('/exploitations')
    expect(wrapper.find('[role="navigation"] a[target="_blank"]').attributes('href')).toEqual('https://docs-cartobio.agencebio.org/agriculteurs.trices')
  })

  test("as unknown role", async () => {
    const wrapper = mount(MainHeader)
    user.isLogged = true
    user.roles = []
    await flushPromises()

    expect(wrapper.find('.tool-username a').classes('fr-icon-account-circle-fill')).toEqual(true)
    expect(wrapper.find('[role="navigation"]').exists()).toEqual(false)
  })
})
