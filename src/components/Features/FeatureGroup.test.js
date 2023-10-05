import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { defineComponent, markRaw, Suspense } from "vue"
import { createTestingPinia } from "@pinia/testing"
import { flushPromises, mount } from "@vue/test-utils"

import { GROUPE_COMMUNE, getFeatureGroups } from "@/components/Features/index.js"
import { useRecordStore, useFeaturesStore, usePermissions } from "@/stores/index.js"
import { OPERATOR_RULES as rules } from "@/referentiels/ab.js"

import record from './__fixtures__/record-with-features.json' assert { type: 'json' }
import FeatureGroup from "@/components/Features/FeatureGroup.vue"
import EditForm from "@/components/Features/SingleItemOperatorForm.vue"

const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false })
const recordStore = useRecordStore(pinia)
const featuresStore = useFeaturesStore(pinia)
const permissions = usePermissions(pinia)

describe("FeatureGroup", () => {
  let featureGroup

  beforeEach(() => {
    featureGroup = getFeatureGroups(record.parcelles).at(1)
  })

  afterEach(() => {
    document.body.outerHTML = ''
    permissions.$reset()
    vi.clearAllMocks()
  })

  test('properly renders a group', async () => {
    const wrapper = mount(FeatureGroup, {
      props: { featureGroup, selectedIds: [], hoveredId: null, validationRules: { rules } }
    })
    const header = wrapper.find('.intermediate-header')

    expect(wrapper.vm.open).toEqual(false)
    expect(header.attributes()).toHaveProperty('hidden')

    await wrapper.find('.group-header').trigger('click')
    expect(wrapper.vm.open).toEqual(true)
    expect(header.attributes()).not.toHaveProperty('hidden')

    // we have default columns
    const headers = header.findAll('*')
    expect(headers.at(0).text()).toEqual('')
    expect(headers.at(1).text()).toEqual('Nom')
    expect(headers.at(2).text()).toEqual('Certification')
    expect(headers.at(3).text()).toEqual('')
  })

  test('non-culture grouping has different column name', async () => {
    const featureGroup = getFeatureGroups(record.parcelles, GROUPE_COMMUNE).at(1)
    const wrapper = mount(FeatureGroup, {
      props: { featureGroup, selectedIds: [], hoveredId: null, validationRules: { rules } }
    })
    const header = wrapper.find('.intermediate-header')
    await wrapper.find('.group-header').trigger('click')

    // we have default columns
    const headers = header.findAll('*')
    expect(headers.at(1).text()).toEqual('Culture')
  })

  test('toggles on and off all group items', async () => {
    const wrapper = mount(FeatureGroup, {
      props: { featureGroup, selectedIds: [], hoveredId: null, validationRules: { rules } }
    })

    expect(wrapper.vm.selectedIds).toEqual([])

    // hidden elements cannot be clicked…
    await wrapper.find('.group-header').trigger('click')

    const selectAllCheckbox = wrapper.find('.group-header .single-checkbox input[type="checkbox"]')
    await selectAllCheckbox.trigger('click')
    expect(featuresStore.selectedIds).toEqual([1, 3])

    await selectAllCheckbox.trigger('click')
    expect(featuresStore.selectedIds).toEqual([])

    // we close the header
    // then we click again on a single checkbox
    await wrapper.find('.group-header').trigger('click')
    await wrapper.find('#parcelle-3 .single-checkbox input[type="checkbox"]').trigger('click')
    expect(featuresStore.selectedIds).toEqual([3])
    expect(wrapper.vm.open).toEqual(true)
  })

  test('we trigger an edit form', async () => {
    const AsyncComponent = defineComponent({
      components: { FeatureGroup },
      template: '<Suspense><FeatureGroup v-bind="$attrs" /></Suspense>'
    })

    const wrapper = mount(AsyncComponent, {
      props: { featureGroup, selectedIds: [], hoveredId: null, validationRules: { rules }, editForm: markRaw(EditForm) }
    })

    const group = wrapper.getComponent(FeatureGroup)
    await wrapper.find('.group-header').trigger('click')
    await wrapper.find('#parcelle-3 td').trigger('click')

    expect(group.emitted('edit:featureId')).toHaveProperty('0', [3])
  })

  test('we trigger a delete form', async () => {
    const wrapper = mount(FeatureGroup, {
      props: { featureGroup, selectedIds: [], hoveredId: null, validationRules: { rules } }
    })

    await wrapper.find('.group-header').trigger('click')
    await wrapper.find('#parcelle-3 .show-actions').trigger('click')

    // menu is open
    const menu = wrapper.find('#parcelle-3 .fr-menu')
    expect(menu.exists()).toEqual(true)

    // delete item is not active unless we have the permissions (after flushPromises/re-render)
    expect(menu.find('.fr-icon-delete-line').attributes()).toHaveProperty('disabled')
    permissions.canDeleteFeature = true
    await flushPromises()
    expect(menu.find('.fr-icon-delete-line').attributes()).not.toHaveProperty('disabled')
    menu.find('.fr-icon-delete-line').trigger('click')
    expect(wrapper.emitted('delete:featureId')).toHaveProperty('0', [3])
  })
})
