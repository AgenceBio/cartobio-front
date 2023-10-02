import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { defineComponent, markRaw, Suspense } from "vue"
import { createTestingPinia } from "@pinia/testing"
import { flushPromises, mount } from "@vue/test-utils"
import { deleteSingleFeature, updateSingleFeatureProperties } from '@/cartobio-api.js'

import { GROUPE_COMMUNE, DeletionReasonsCode } from "@/components/Features/index.js"
import { useRecordStore, useFeaturesStore, usePermissions } from "@/stores/index.js"
import { OPERATOR_RULES } from "@/referentiels/ab.js"

import record from './__fixtures__/record-with-features.json' assert { type: 'json' }
import Modal from "@/components/Modal.vue"
import DeleteFeatureModal from "@/components/Features/DeleteFeatureModal.vue"
import EditForm from "@/components/Features/SingleItemOperatorForm.vue"
import FeatureGroup from "@/components/Features/FeatureGroup.vue"
import TableComponent from "./Table.vue"

const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false })
const recordStore = useRecordStore(pinia)
const featuresStore = useFeaturesStore(pinia)
const permissions = usePermissions(pinia)

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
    await wrapper.find('#radio-select-all').trigger('click')

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

    // await wrapper.find('#parcelle-1 th .single-checkbox input[type="checkbox"]')
    featuresStore.toggleSingleSelected(1)
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
    await table.find('tr.parcelle td').trigger('click')
    await flushPromises()

    updateSingleFeatureProperties.mockResolvedValue(record)

    // this throws if the modal form does not exist
    // it catches the Component reference even if it has been Teleport-ed in the <body>
    const form = wrapper.getComponent(EditForm)
    expect(table.vm.editedFeatureId).toEqual(2)

    //submit form
    await form.find('.fr-modal__footer button.fr-btn').trigger('click')

    // modal is down, and the table should be updated
    expect(updateSingleFeatureProperties).toHaveBeenCalled()
    expect(wrapper.findComponent(EditForm).exists()).toEqual(false)
  })

  test("we open a modal and test various cases it should remain open, or close", async () => {
    const AsyncComponent = defineComponent({
      components: { TableComponent },
      template: '<Suspense><TableComponent v-bind="$attrs" /></Suspense>'
    })

    const wrapper = mount(AsyncComponent, {
      props: { operator, validationRules: { rules: OPERATOR_RULES }, editForm: markRaw(EditForm) }
    })

    const table = wrapper.getComponent(TableComponent)
    // await table.find('tr.parcelle td').trigger('click')

    let modal

    // we click outside the modal (the background of the <dialog> element)
    await table.find('tr.parcelle td').trigger('click')
    modal = wrapper.getComponent(Modal)
    await modal.trigger('click')
    expect(modal.exists()).toEqual(false)

    // we click inside, so the modal should still exist
    await table.find('tr.parcelle td').trigger('click')
    modal = wrapper.getComponent(Modal)
    await modal.find('#modal-title').trigger('click')
    expect(modal.exists()).toEqual(true)

    // then we close the modal with the Close button
    await modal.find('.fr-modal__header .fr-btn--close').trigger('click')
    expect(modal.exists()).toEqual(false)
  })

  test("we delete a feature", async () => {
    permissions.canDeleteFeature = true

    const wrapper = mount(TableComponent, {
      props: { operator, validationRules: { rules: OPERATOR_RULES } }
    })

    await wrapper.find('.group-header').trigger('click')
    await wrapper.find('#parcelle-3 .show-actions').trigger('click')
    await wrapper.find('.fr-icon-delete-line').trigger('click')

    // we trigger the deletion
    deleteSingleFeature.mockResolvedValue(record)

    const modal = wrapper.getComponent(DeleteFeatureModal)
    await modal.find('#deletion-reason').setValue(DeletionReasonsCode.OTHER)
    await modal.find('#deletion-details').setValue('Parce que')
    await modal.find('button.fr-icon-delete-line').trigger('click')

    expect(modal.emitted('submit')).toHaveProperty('0.0.id', 3)
    expect(modal.emitted('submit')).toHaveProperty('0.0.reason', {
      code: DeletionReasonsCode.OTHER,
      details: 'Parce que'
    })
  })
})
