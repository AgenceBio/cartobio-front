import { beforeEach, describe, expect, it, vi } from "vitest"
import { flushPromises, mount } from "@vue/test-utils"

import Notification from "./Notification.ce.vue"
import { exchangeNotificationToken } from "@/cartobio-api.js"
import { createPinia, setActivePinia } from "pinia"

import record from '@/components/Features/__fixtures__/record-with-features.json' assert { type: 'json' }

vi.mock('@/cartobio-api.js', () => ({
  exchangeNotificationToken: vi.fn().mockImplementation(() => {
    /* contains { "numeroBio": "30022", "userId": 151243 } */
    return Promise.resolve({
      operator: record.operator,
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJudW1lcm9CaW8iOiIzMDAyMiJ9.aUCeFG3apcJB7DG6TbHPo3mfIZ8xuuELSF25ZfXXBj4"
    })
  }),
  setAuthorization: vi.fn()
}))

beforeEach(() => setActivePinia(createPinia()) )

describe("Notification", () => {
  it("should render loading state then Telepac form", async () => {
    const wrapper = mount(Notification, {
      props: {
        'auth-token': "token",
      }
    })

    expect(wrapper.text()).toContain("Établissement d'une connexion sécurisée")

    await flushPromises()
    expect(exchangeNotificationToken).toHaveBeenCalledOnce()
    expect(wrapper.text()).toContain("Sélectionner ma dernière déclaration PAC")
  })

  it("should render error state when exchangeNotificationToken fails", async () => {
    exchangeNotificationToken.mockRejectedValueOnce(new Error("Error"))

    const wrapper = mount(Notification, {
      props: {
        'auth-token': "token",
      }
    })

    await flushPromises()
    expect(exchangeNotificationToken).toHaveBeenCalledOnce()
    expect(wrapper.text()).toContain("Impossible d'établir une connexion sécurisée")
  })
})
