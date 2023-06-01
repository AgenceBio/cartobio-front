import { defineComponent } from "vue"
import { describe, it, expect } from "vitest"
import { flushPromises, mount } from "@vue/test-utils"
import { useRouter } from "vue-router"

import LoginPage from "./login.vue"

describe("Login.vue", () => {
  it("should render the OperatorLogin component first", () => {
    const wrapper = mount(LoginPage)

    expect(wrapper.find('[aria-controls="exploitation"]').attributes('aria-selected')).toBe('true')
    expect(wrapper.find('.fr-tabs__panel').attributes('id')).toBe('exploitation')
  })

  it("should switch to the Certification tab on click", async () => {
    const wrapper = mount(LoginPage)

    await wrapper.find('[aria-controls="certification"]').trigger('click')

    expect(wrapper.find('[aria-controls="exploitation"]').attributes('aria-selected')).toBe('false')
    expect(wrapper.find('[aria-controls="certification"]').attributes('aria-selected')).toBe('true')
    expect(wrapper.find('.fr-tabs__panel').attributes('id')).toBe('certification')
  })

  it("should select tab based on router query string", async () => {
    const TestComponent = defineComponent({
      components: { LoginPage },
      template: '<LoginPage />',
      setup: () => {
        const router = useRouter()
        router.replace({ name: 'login', query: { mode: 'certification' } })
      }
    })

    // the the `router.replace()` is async, this operation enables to wait until the side effects happened
    await flushPromises()

    const wrapper = mount(TestComponent)
    expect(wrapper.find('[aria-controls="certification"]').attributes('aria-selected')).toBe('true')
  })
})
