import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { defineComponent, markRaw, Suspense } from "vue"
import { createTestingPinia } from "@pinia/testing"
import { flushPromises, mount } from "@vue/test-utils"

import { GROUPE_COMMUNE, getFeatureGroups } from "@/components/Features/index.js"
import { useFeaturesStore } from "@/stores/features.js"
import { usePermissions } from "@/stores/permissions.js"

import record from './__fixtures__/record-with-features.json' assert { type: 'json' }
import FeatureGroup from "@/components/Features/FeatureGroup.vue"
import EditForm from "@/components/Features/SingleItemOperatorForm.vue"

const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false })
const featuresStore = useFeaturesStore(pinia)
const permissions = usePermissions(pinia)

describe("FeatureGroup", () => {
  let featureGroup

  beforeEach(() => {
    featureGroup = getFeatureGroups(record.parcelles).at(0)
  })

  afterEach(() => {
    document.body.outerHTML = ''
    permissions.$reset()
  })

  test('properly renders a group', async () => {
    const wrapper = mount(FeatureGroup, {
      props: { featureGroup, selectedIds: [], hoveredId: null }
    })
    const header = wrapper.find('.intermediate-header')

    expect(wrapper.vm.open).toEqual(false)
    expect(header.attributes()).toHaveProperty('hidden')

    await wrapper.find('.group-header').trigger('click')
    expect(wrapper.vm.open).toEqual(true)
    expect(header.attributes()).not.toHaveProperty('hidden')

    // we have default columns
    const headers = header.findAll('th')
    expect(headers.at(0).text()).toEqual('')
    expect(headers.at(1).text()).toEqual('Nom')
    expect(headers.at(2).text()).toEqual('Certification')
    expect(headers.at(3).text()).toEqual('Surface')

    // we should have a multi culture name within the 3rd cell
    expect(wrapper.find('#parcelle-2 .feature-precision').text()).toEqual('Multi-culture')

    // we should have a single culture name within the 3rd cell
    expect(wrapper.find('#parcelle-4 .culture-name').text()).toEqual('ilot 2, parcelle 1')
  })

  test('non-culture grouping has different column name', async () => {
    const featureGroup = getFeatureGroups(record.parcelles, GROUPE_COMMUNE).at(0)
    const wrapper = mount(FeatureGroup, {
      props: { featureGroup, selectedIds: [], hoveredId: null }
    })
    const header = wrapper.find('.intermediate-header')
    await wrapper.find('.group-header').trigger('click')

    // we have default columns
    const headers = header.findAll('*')
    expect(headers.at(1).text()).toEqual('Culture')

    // we should have a multi culture name within the 3rd cell
    expect(wrapper.find('#parcelle-2 .culture-type').text()).toEqual('Multi-cultures : Ail, Pomelos et pamplemousses')

    // we should have a single culture name within the 3rd cell
    expect(wrapper.find('#parcelle-4 .culture-name').text()).toEqual('Ail')
    expect(wrapper.find('#parcelle-4 .feature-precision').text()).toEqual('ilot 2, parcelle 1')
  })

  test('toggles on and off all group items', async () => {
    const wrapper = mount(FeatureGroup, {
      props: { featureGroup, selectedIds: [], hoveredId: null }
    })

    expect(wrapper.vm.selectedIds).toEqual([])

    // hidden elements cannot be clicked…
    await wrapper.find('.group-header').trigger('click')

    const selectAllCheckbox = wrapper.find('.group-header .single-checkbox input[type="checkbox"]')
    await selectAllCheckbox.trigger('click')
    expect(featuresStore.selectedIds).toEqual(['4', '2'])

    await selectAllCheckbox.trigger('click')
    expect(featuresStore.selectedIds).toEqual([])

    // we close the header
    // then we click again on a single checkbox
    await wrapper.find('.group-header').trigger('click')
    await wrapper.find('#parcelle-2 .single-checkbox input[type="checkbox"]').trigger('click')
    expect(featuresStore.selectedIds).toEqual(['2'])
    expect(wrapper.vm.open).toEqual(true)
  })

  test('we trigger an edit form', async () => {
    const AsyncComponent = defineComponent({
      components: { FeatureGroup },
      template: '<Suspense><FeatureGroup v-bind="$attrs" /></Suspense>'
    })

    const wrapper = mount(AsyncComponent, {
      props: { featureGroup, selectedIds: [], hoveredId: null, editForm: markRaw(EditForm) }
    })

    const group = wrapper.getComponent(FeatureGroup)
    await wrapper.find('.group-header').trigger('click')
    await wrapper.find('#parcelle-2 td').trigger('click')

    expect(group.emitted('edit:featureId')).toHaveProperty('0', ['2'])
  })

  test('we trigger a delete form', async () => {
    const wrapper = mount(FeatureGroup, {
      props: { featureGroup, selectedIds: [], hoveredId: null }
    })

    await wrapper.find('.group-header').trigger('click')
    await wrapper.find('#parcelle-2 .show-actions').trigger('click')

    // menu is open
    const menu = wrapper.find('#parcelle-2 .fr-menu')
    expect(menu.exists()).toEqual(true)

    // delete item is not active unless we have the permissions (after flushPromises/re-render)
    expect(menu.find('.fr-icon-delete-line').attributes()).toHaveProperty('disabled')
    permissions.canDeleteFeature = true
    await flushPromises()
    expect(menu.find('.fr-icon-delete-line').attributes()).not.toHaveProperty('disabled')
    await menu.find('.fr-icon-delete-line').trigger('click')
    expect(wrapper.emitted('delete:featureId')).toHaveProperty('0', ['2'])
  })
})
