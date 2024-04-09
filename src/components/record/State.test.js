import { describe, expect, it } from "vitest"
import { mount } from "@vue/test-utils"

import { CERTIFICATION_STATE } from '@/referentiels/ab.js'
import State from "./State.vue"

describe("CertificationState", () => {
  it("renders N/C for an unknown or empty state", async () => {
    let wrapper = mount(State, { props: { record: { certification_state: undefined } } })
    expect(wrapper.text()).toContain("Non renseigné")

    wrapper = mount(State, { props: { record: { certification_state: CERTIFICATION_STATE.UNKNOWN } } })
    expect(wrapper.text()).toContain("Non renseigné")
    expect(wrapper.attributes()).toHaveProperty('aria-label', "Non renseigné")
  })

  it("renders a date suffix when provided", async () => {
    const wrapper = mount(State, { props: {
      record: { 'certification_state': CERTIFICATION_STATE.CERTIFIED, certification_date_debut: new Date('2023-01-01') }
  } })
    expect(wrapper.text()).toContain("Certifié 2023")
    expect(wrapper.attributes()).toHaveProperty('aria-label', "Certifié en 2023")
  })
})
