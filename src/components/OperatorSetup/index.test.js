import { describe, it, expect, vi, afterEach } from "vitest"
import { mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"

import OperatorSetup from "@/components/OperatorSetup/index.vue"
import featureSources from '@/components/OperatorSetup/index.js'
import { convertShapefileArchiveToGeoJSON, submitParcellesChanges } from "@/cartobio-api.js"
import { AxiosError } from "axios"

setActivePinia(createPinia())

vi.mock('@/cartobio-api.js', () => ({
  submitParcellesChanges: vi.fn().mockImplementation(() => {
    return Promise.resolve()
  }),
  convertShapefileArchiveToGeoJSON: vi.fn()
}))

describe("OperatorSetup", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("should render only telepac tab if there is only telepac source in props", () => {
    const wrapper = mount(OperatorSetup, {
      props: {
        sources: ['telepac']
      }
    })

    expect(wrapper.find('ul').findAll('li').length).toBe(1)
    expect(wrapper.text()).toContain('Importer ma dernière déclaration PAC')
  })

  it("should render tab content for telepac", () => {
const wrapper = mount(OperatorSetup, {
      props: {
        sources: ['telepac']
      }
    })

    expect(wrapper.text()).toContain('Importer ma dernière déclaration PAC')
  })

  it("should render tab content for Geofolia when selected", async () => {
    const wrapper = mount(OperatorSetup, {
      props: {
        sources: ['telepac', 'geofolia']
      }
    })

    // Click on geofolia tab
    await wrapper.find('ul').findAll('li')[1].find('button').trigger('click')
    expect(wrapper.text()).toContain('logiciel Géofolia, édité par Isagri')
  })

  it("should render all tabs otherwise", () => {
    const wrapper = mount(OperatorSetup)

    expect(wrapper.find('ul').findAll('li').length).toBe(Object.keys(featureSources).length)
  })

  it("should submit convert and save a telepac import", async () => {
    const wrapper = mount(OperatorSetup, {
      props: {
        sources: ['telepac']
      }
    })

    await wrapper.find('input[type="file"]').setValue('')
    expect(convertShapefileArchiveToGeoJSON).toHaveBeenCalledOnce()
    expect(submitParcellesChanges).toHaveBeenCalled()
  })

  it("should handle the case where it cannot convert telepac file (invalid file)", async () => {
    const wrapper = mount(OperatorSetup, {
      props: {
        sources: ['telepac']
      }
    })

    convertShapefileArchiveToGeoJSON.mockImplementationOnce(
      async () => { throw new AxiosError('Fichier invalide') }
    )
    await wrapper.find('input[type="file"]').setValue('')
    expect(convertShapefileArchiveToGeoJSON).toHaveBeenCalledOnce()
    expect(submitParcellesChanges).not.toHaveBeenCalled()
    await new Promise(setImmediate)
    expect(wrapper.text()).toContain('Erreur')
  })
})
