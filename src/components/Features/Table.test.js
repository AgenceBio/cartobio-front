import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { defineComponent, markRaw, Suspense } from "vue"
import { createTestingPinia } from "@pinia/testing"
import { flushPromises, mount } from "@vue/test-utils"
import { updateSingleFeatureProperties } from '@/cartobio-api.js'

import { GROUPE_COMMUNE } from "@/components/Features/index.js"
import { useRecordStore, useFeaturesStore } from "@/stores/index.js"
import { OPERATOR_RULES } from "@/referentiels/ab.js"

import record from './__fixtures__/record-with-features.json' assert { type: 'json' }
import FeatureGroup from "@/components/Features/FeatureGroup.vue"
import TableComponent from "./Table.vue"
import EditForm from "@/components/Features/SingleItemOperatorForm.vue"

const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false })
const recordStore = useRecordStore(pinia)
const featuresStore = useFeaturesStore(pinia)

const operator = {
  id: 1,
  nom: "Test"
}

describe("Features Table", () => {
  beforeEach(() => {
    recordStore.reset()
    recordStore.update(record)
  })

  afterEach(() => {
    document.body.outerHTML = ''
    vi.clearAllMocks()
  })

  test("features are listed as 3 groups of 2 and 1 and 1 features (multi-crops)", () => {
    const wrapper = mount(TableComponent, {
      props: { operator, validationRules: { rules: OPERATOR_RULES } }
    })

    expect(wrapper.find('tr.summary td:nth-child(2)').text()).toBe("3 parcelles")
    expect(wrapper.findAll('table tbody')).toHaveLength(3)
    expect(wrapper.find('#parcelle-1').attributes()).toHaveProperty('hidden', '')
  })

  test("we toggle all features in one click", async () => {
    const wrapper = mount(TableComponent, {
      props: { operator, validationRules: { rules: OPERATOR_RULES } }
    })

    expect(wrapper.find('#radio-mass-edit').exists()).toEqual(false)
    wrapper.find('#radio-select-all').trigger('click')

    // await rendering
    await flushPromises()

    expect(featuresStore.selectedIds).toEqual([1, 2, 3])
    expect(wrapper.find('#radio-mass-edit').exists()).toEqual(true)
  })

  test("we group by town", async () => {
    const wrapper = mount(TableComponent, {
      props: { operator, validationRules: { rules: OPERATOR_RULES } }
    })

    wrapper.find('#plots-group-by').setValue(GROUPE_COMMUNE)

    // await rendering
    await flushPromises()
    const groups = wrapper.findAll('table tbody')

    expect(groups.at(0).find('th[scope="row"]').text()).toEqual('26108')
    expect(groups.at(1).find('th[scope="row"]').text()).toEqual('26113')
  })

  test("we select a feature and its unfolds the group", async () => {
    const wrapper = mount(TableComponent, {
      props: { operator, validationRules: { rules: OPERATOR_RULES } }
    })

    featuresStore.toggleSingleSelected(1)

    // await rendering
    await flushPromises()

    expect(wrapper.vm.selectedFeatureIds).toEqual([1])
    expect(wrapper.find('#parcelle-1').attributes()).not.toHaveProperty('hidden')
  })

  test("we click on a row to edit a feature in a Modal, then save", async () => {
    const AsyncComponent = defineComponent({
      components: { TableComponent },
      template: '<Suspense><TableComponent v-bind="$attrs" /></Suspense>'
    })

    const wrapper = mount(AsyncComponent, {
      props: { operator, validationRules: { rules: OPERATOR_RULES }, editForm: markRaw(EditForm) }
    })

    const table = wrapper.getComponent(TableComponent)
    table.find('tr.parcelle td').trigger('click')
    await flushPromises()

    updateSingleFeatureProperties.mockResolvedValue(record)

    // this throws if the modal form does not exist
    // it catches the Component reference even if it has been Teleport-ed in the <body>
    const form = wrapper.getComponent(EditForm)
    expect(table.vm.editedFeatureId).toEqual(2)

    //submit form
    form.find('button.fr-btn').trigger('click')
    await flushPromises()

    // modal is down, and the table should be updated
    expect(updateSingleFeatureProperties).toHaveBeenCalled()
    expect(wrapper.findComponent(EditForm).exists()).toEqual(false)
  })
})
