import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { mount } from "@vue/test-utils"

import Notification from "./Notification.ce.vue"
import { exchangeNotificationToken } from "@/cartobio-api.js"
import { createPinia, setActivePinia } from "pinia"

vi.mock('@/cartobio-api.js', () => ({
  exchangeNotificationToken: vi.fn().mockImplementation(() => {
    return Promise.resolve({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAifQ._aG0ukzancZqhL1wvBTJh8G8d3Det5n0WKcPo5C0DCY" })
  }),
  setAuthorization: vi.fn()
}))

describe("Notification", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render loading state then Telepac form", async () => {
    const wrapper = mount(Notification, {
      props: {
        'auth-token': "token",
      }
    })

    expect(wrapper.text()).toContain("Établissement d'une connexion sécurisée")

    await new Promise(setImmediate)
    expect(exchangeNotificationToken).toHaveBeenCalledOnce()
    expect(wrapper.text()).toContain("Sélectionner ma dernière déclaration PAC")
  })

  it("should render error state when exchangeNotificationToken fails", async () => {
    exchangeNotificationToken.mockImplementationOnce(async () => {
      throw new Error("Error")
    })

    const wrapper = mount(Notification, {
      props: {
        'auth-token': "token",
      }
    })

    await new Promise(setImmediate)
    expect(exchangeNotificationToken).toHaveBeenCalledOnce()
    expect(wrapper.text()).toContain("Impossible d'établir une connexion sécurisée")
  })
})
