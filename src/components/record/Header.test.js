import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { defineComponent } from "vue"
import { flushPromises, mount } from "@vue/test-utils"
import { createTestingPinia } from "@pinia/testing"
import { useOperatorStore } from "@/stores/operator.js"
import { useRecordStore } from "@/stores/record.js"
import { useUserStore } from "@/stores/user.js"

import operator from '@/components/Features/__fixtures__/operator.json' assert { type: 'json' }
import record from '@/components/Features/__fixtures__/record-with-features.json' assert { type: 'json' }

import RecordHeader from "./Header.vue"
import EditVersionModal from "@/components/versions/EditVersionModal.vue"

const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false })
const operatorStore = useOperatorStore(pinia)
const recordStore = useRecordStore(pinia)
const userStore = useUserStore(pinia)

describe("RecordHeader", () => {
  const AsyncComponent = defineComponent({
    components: { RecordHeader },
    template: '<Suspense><RecordHeader v-bind="$attrs" /></Suspense>'
  })

  beforeEach(() => {
    recordStore.update(record)
    operatorStore.operator = operator
  })

  afterEach(() => {
    operatorStore.$reset()
    userStore.$reset()
    recordStore.$reset()
  })

  it('should display store informations', () => {
    const wrapper = mount(AsyncComponent)

    expect(wrapper.find('.operator-name').text()).toEqual('test')
    expect(wrapper.find('.operator-name').attributes('data-numerobio')).toEqual('34857')
    expect(wrapper.find('.version-name').text()).toEqual('Version créée le 01/01/2024')
  })

  describe('Modifier la version', () => {
    afterEach(() => userStore.$reset())

    it("should print version name field to everybody", async () => {
      let wrapper = mount(AsyncComponent)
      await wrapper.find('.edit-version-info').trigger('click')

      const modal = wrapper.getComponent(EditVersionModal)
      expect(modal.find('#version_name').exists()).toBe(true)
    })

    it("should print audit date field only for Certification Body", async () => {
      recordStore.update({ certification_state: 'AUDITED', audit_date: '2024-01-01' })
      userStore.isOc = false
      userStore.isOcCertif = false

      let wrapper = mount(AsyncComponent)
      await wrapper.find('.edit-version-info').trigger('click')

      const modal = wrapper.getComponent(EditVersionModal)
      expect(modal.find('#audit_date').exists()).toBe(false)

      userStore.isOc = true
      userStore.isOcCertif = true
      await flushPromises()
      expect(modal.find('#audit_date').exists()).toBe(true)
    })

    it("should print certification date fields only for Certification Body", async () => {
      recordStore.update({ certification_state: 'CERTIFIED', audit_date: '2024-01-01' })
      userStore.isOc = false
      userStore.isOcCertif = false

      let wrapper = mount(AsyncComponent)
      await wrapper.find('.edit-version-info').trigger('click')

      const modal = wrapper.getComponent(EditVersionModal)
      expect(modal.find('#certification_date_debut').exists()).toBe(false)
      expect(modal.find('#certification_date_fin').exists()).toBe(false)

      userStore.isOc = true
      userStore.isOcCertif = true
      await flushPromises()
      console.log(modal.html())
      expect(modal.find('#certification_date_debut').exists()).toBe(true)
      expect(modal.find('#certification_date_fin').exists()).toBe(true)
    })
  })

})
