import { describe, expect, test } from "vitest"
import { mount } from "@vue/test-utils"

import ProductFlow from "./ProductFlow.vue"


describe("ProductFlow", () => {
  test("for professionals", () => {
    const wrapper = mount(ProductFlow, {
      props: {  },
    })

    expect(wrapper.find('.fr-container--fluid').classes('general-audience')).toEqual(false)
    expect(wrapper.find('.big-steps > li').text()).toEqual('Importer votre parcellaireSe connecter')
  })

  test("for general audience", () => {
    const wrapper = mount(ProductFlow, {
      props: { generalAudience: true  }
    })

    expect(wrapper.find('.fr-container--fluid').classes('general-audience')).toEqual(true)
    expect(wrapper.find('.big-steps > li').text()).toEqual('Localiser votre territoireNaviguer sur la carte')
  })
})
