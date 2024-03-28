import { beforeEach, describe, expect, it, vi } from "vitest"
import { flushPromises, mount } from "@vue/test-utils"
import { createTestingPinia } from "@pinia/testing"
import axios from 'axios'

import Notification from "./Notification.ce.vue"

import operator from '@/components/Features/__fixtures__/operator.json' assert { type: 'json' }

const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false })

describe("Notification", () => {
  beforeEach(() => {
    axios.__createMock.get.mockResolvedValue({
      data: {
        /* contains { "numeroBio": "30022", "userId": 151243 } */
        operator: operator,
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJudW1lcm9CaW8iOiIzMDAyMiJ9.aUCeFG3apcJB7DG6TbHPo3mfIZ8xuuELSF25ZfXXBj4"
      }
    })
  })

  it("should render loading state then Telepac form", async () => {
    const wrapper = mount(Notification, {
      props: {
        'auth-token': "token",
      }
    })

    expect(wrapper.text()).toContain("Établissement d'une connexion sécurisée")

    await flushPromises()
    expect(axios.__createMock.get).toHaveBeenCalledOnce()
    expect(wrapper.text()).toContain("Sélectionner ma dernière déclaration PAC")
  })

  it("should render error state when exchangeNotificationToken fails", async () => {
    axios.__createMock.get.mockRejectedValueOnce(new Error("Error"))

    const wrapper = mount(Notification, {
      props: {
        'auth-token': "token",
      },
      global: {
        config: {
          errorHandler (error) {
            expect(error.message).toBe('Error')
          }
        }
      }
    })

    await flushPromises()
    expect(axios.__createMock.get).toHaveBeenCalledOnce()
    expect(wrapper.text()).toContain("Impossible d'établir une connexion sécurisée")
  })
})
