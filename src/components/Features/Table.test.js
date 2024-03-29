import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { defineComponent, markRaw } from "vue"
import { createTestingPinia } from "@pinia/testing"
import { flushPromises, mount } from "@vue/test-utils"
import axios from 'axios'

import { DeletionReasonsCode, GROUPE_COMMUNE } from "@/components/Features/index.js"
import { useFeaturesStore, usePermissions, useRecordStore } from "@/stores/index.js"

import record from './__fixtures__/record-with-features.json' assert { type: 'json' }
import Modal from "@/components/Modal.vue"
import DeleteFeatureModal from "@/components/record/modals/DeleteFeatureModal.vue"
import EditForm from "@/components/Features/SingleItemOperatorForm.vue"
import TableComponent from "../record/Table.vue"

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
  })

  test("features are listed as 3 groups of 2 and 1 and 2 features (one being multi-crops)", () => {
    const wrapper = mount(TableComponent)

    expect(wrapper.find('tr.summary td:nth-child(2)').text()).toBe("4 parcelles")
    expect(wrapper.findAll('table tbody')).toHaveLength(3)
    expect(wrapper.find('#parcelle-1').attributes()).toHaveProperty('hidden', '')
  })

  test("we toggle all features in one click", async () => {
    const wrapper = mount(TableComponent)

    expect(wrapper.find('#radio-mass-edit').exists()).toEqual(false)
    await wrapper.find('#radio-select-all').trigger('click')

    expect(featuresStore.selectedIds).toEqual(['1', '2', '3', '4'])
    expect(wrapper.find('#radio-mass-edit').exists()).toEqual(true)
  })

  test("we not be able to see and activate facets as an Agri", async () => {
    const wrapper = mount(TableComponent)

    expect(wrapper.find('.fr-tags-group--annotations').exists()).toEqual(false)
  })

  test("we should be able to see and activate facets only when we are a Certification Body", async () => {
    const wrapper = mount(TableComponent)

    expect(wrapper.find('.fr-tags-group--tags').exists()).toEqual(false)

    permissions.isOc = true
    await flushPromises()

    expect(wrapper.find('.fr-tags-group--tags').exists()).toEqual(true)

    // toggle two filters
    await wrapper.find('.fr-tags-group--tags .tag--annotation_downgraded').trigger('click')
    await wrapper.find('.fr-tags-group--tags .tag--annotation_risky').trigger('click')
    await wrapper.find('.fr-tags-group--tags .tag--annotation_surveyed').trigger('click')
    await wrapper.find('.fr-tags-group--tags .tag--annotation_surveyed').trigger('click')
    await flushPromises()

    expect(wrapper.find('tr.summary td:nth-child(2)').text()).toBe("1 parcelles")
    expect(wrapper.findAll('tr.parcelle')).toHaveLength(1)
    expect(featuresStore.all).toHaveLength(4)
  })

  test("we group by town", async () => {
    const wrapper = mount(TableComponent)

    wrapper.find('#plots-group-by').setValue(GROUPE_COMMUNE)

    // await rendering
    await flushPromises()
    const groups = wrapper.findAll('table tbody')

    expect(groups.at(0).find('th[scope="row"]').text()).toEqual('26108')
    expect(groups.at(1).find('th[scope="row"]').text()).toEqual('26113')
  })

  test("we select a feature and its unfolds the group", async () => {
    const wrapper = mount(TableComponent)

    // await wrapper.find('#parcelle-1 th .single-checkbox input[type="checkbox"]')
    featuresStore.toggleSingleSelected(1)
    await flushPromises()

    expect(wrapper.find('#parcelle-1').attributes()).not.toHaveProperty('hidden')
  })

  test("we click on a row to edit a feature in a Modal, then save", async () => {
    const AsyncComponent = defineComponent({
      components: { TableComponent },
      template: '<Suspense><TableComponent v-bind="$attrs" /></Suspense>'
    })

    const wrapper = mount(AsyncComponent, {
      props: { editForm: markRaw(EditForm) }
    })

    const table = wrapper.getComponent(TableComponent)
    await table.find('tr#parcelle-2 td').trigger('click')
    await flushPromises()

    axios.__createMock.put.mockResolvedValueOnce(record)

    // this throws if the modal form does not exist
    // it catches the Component reference even if it has been Teleport-ed in the <body>
    const form = wrapper.getComponent(EditForm)
    expect(table.vm.editedFeatureId).toEqual('2')

    //submit form
    await form.find('.fr-modal__footer button.fr-btn').trigger('click')

    // modal is down, and the table should be updated
    expect(axios.__createMock.put).toHaveBeenCalled()
    expect(wrapper.findComponent(EditForm).exists()).toEqual(false)
  })

  test("we delete a feature", async () => {
    permissions.canDeleteFeature = true

    const wrapper = mount(TableComponent)

    await wrapper.find('.group-header').trigger('click')
    await wrapper.find('#parcelle-3 .show-actions').trigger('click')
    await wrapper.find('.fr-icon-delete-line').trigger('click')

    // we trigger the deletion
    axios.__createMock.delete.mockResolvedValueOnce(record)

    const modal = wrapper.getComponent(DeleteFeatureModal)
    await modal.find('#deletion-reason').setValue(DeletionReasonsCode.OTHER)
    await modal.find('#deletion-details').setValue('Parce que')
    await modal.find('button.fr-icon-delete-line').trigger('click')

    expect(modal.emitted('submit')).toHaveProperty('0.0.id', '3')
    expect(modal.emitted('submit')).toHaveProperty('0.0.reason', {
      code: DeletionReasonsCode.OTHER,
      details: 'Parce que'
    })
  })

  test("we open a modal and test various cases it should remain open, or close", async () => {
    permissions.isOc = false
    permissions.isAgri = true
    permissions.canDeleteFeature = true
    permissions.canChangeCulture = true

    const AsyncComponent = defineComponent({
      components: { TableComponent },
      template: '<Suspense><TableComponent v-bind="$attrs" /></Suspense>'
    })

    const wrapper = mount(AsyncComponent, {
      props: { editForm: markRaw(EditForm) }
    })

    const table = wrapper.getComponent(TableComponent)

    let modal

    // we click outside the edit modal (the background of the <dialog> element)
    // it closes itself because it is not "dirty"
    table.find('tr.parcelle td').trigger('click')
    await flushPromises()
    modal = wrapper.getComponent(Modal)
    await modal.trigger('click')
    await flushPromises()
    expect(modal.exists()).toEqual(false)

    // now, we change a field and we should not be able to close it
    axios.__createMock.put.mockResolvedValueOnce(record)

    table.find('tr.parcelle td').trigger('click')
    await flushPromises()
    modal = wrapper.getComponent(Modal)
    await modal.find('#feature-nom').setValue('aa')
    await modal.trigger('click')
    await flushPromises()
    expect(modal.exists()).toEqual(true)

    // we click outside the delete modal
    await wrapper.find('.group-header').trigger('click')
    await wrapper.find('#parcelle-3 .show-actions').trigger('click')
    await wrapper.find('.fr-icon-delete-line').trigger('click')
    modal = wrapper.getComponent(DeleteFeatureModal)
    await modal.trigger('click')
    await flushPromises()
    expect(modal.exists()).toEqual(false)


    // we click inside, so the modal should still exist
    await wrapper.find('.group-header').trigger('click')
    await wrapper.find('#parcelle-3 .show-actions').trigger('click')
    await wrapper.find('.fr-icon-delete-line').trigger('click')
    await flushPromises()
    modal = wrapper.getComponent(Modal)
    await modal.find('#modal-title').trigger('click')
    await flushPromises()
    expect(modal.exists()).toEqual(true)
  })

})
