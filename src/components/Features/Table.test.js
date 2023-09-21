import { beforeEach, describe, expect, test, vi } from "vitest"
import { createTestingPinia } from "@pinia/testing"
import { mount } from "@vue/test-utils"

import { useRecordStore } from "@/stores/index.js"
import { OPERATOR_RULES } from "@/referentiels/ab.js"

import record from './__fixtures__/record-with-features.json' assert { type: 'json' }
import TableComponent from "./Table.vue"

const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false })
const recordStore = useRecordStore(pinia)

const operator = {
  id: 1,
  nom: "Test"
}

describe("Features Table", () => {
  beforeEach(() => {
    recordStore.reset()
    recordStore.update(record)
  })

  test("features are listed as 2 groups of 1 and 2 features", () => {
    const wrapper = mount(TableComponent, {
      props: { operator, validationRules: { rules: OPERATOR_RULES } }
    })

    expect(wrapper.find('tr.summary td:nth-child(2)').text()).toBe("3 parcelles")
    expect(wrapper.findAll('table tbody')).toHaveLength(2)
  })
})
