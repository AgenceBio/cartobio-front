import { describe, expect, test, vi } from "vitest"
import { mount } from "@vue/test-utils"
import { NavigationControl, ScaleControl } from 'maplibre-gl'

import MapContainer from "./MapContainer.vue"

describe("MapContainer", () => {
  test('we display navigation with no interactive elements', async () => {
    const wrapper = mount(MapContainer, {
      props: { controls: false }
    })

    expect(NavigationControl).toHaveBeenCalledTimes(0)
    expect(ScaleControl).toHaveBeenCalledTimes(0)
  })

  test('we display navigation control, without attribution', async () => {
    const wrapper = mount(MapContainer, {
      props: { controls: true }
    })

    expect(NavigationControl).toHaveBeenCalledTimes(1)
    expect(ScaleControl).toHaveBeenCalledTimes(0)

    const customMenuSpy = wrapper.vm.map.addControl.mock.calls.at(1)
    expect(customMenuSpy).toHaveProperty('0.onAdd')
    expect(customMenuSpy).toHaveProperty('1', 'bottom-right')
  })

  test('we display navigation control and attribution', async () => {
    const wrapper = mount(MapContainer, {
      props: { showAttribution: true }
    })

    expect(NavigationControl).toHaveBeenCalledOnce()
    expect(ScaleControl).toHaveBeenCalledOnce()

    const attributionSpy = wrapper.vm.map.addControl.mock.calls.at(2)
    expect(attributionSpy).toHaveProperty('0.onAdd')
    expect(attributionSpy).toHaveProperty('1', 'bottom-right')
  })
})
