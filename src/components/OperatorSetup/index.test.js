import { afterEach, beforeAll, describe, it, expect, vi } from "vitest"
import { mount, flushPromises } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"

import OperatorSetup from "@/components/OperatorSetup/index.vue"
import featureSources from '@/components/OperatorSetup/index.js'
import { convertShapefileArchiveToGeoJSON, createOperatorRecord } from "@/cartobio-api.js"
import { AxiosError } from "axios"

setActivePinia(createPinia())

describe("OperatorSetup", () => {
  beforeAll(() => {
    createOperatorRecord.mockImplementation(async d => d),
    convertShapefileArchiveToGeoJSON.mockResolvedValue({
      type: "FeatureCollection",
      features: [
        {
          "id": 241348481707929,
          "type": "Feature",
          "geometry": {
            "type": "Polygon",
            "coordinates": [[[6.078270281232933,47.68983218066847],[6.077630695731261,47.68673737583907],[6.077276790682129,47.68682804163941],[6.077323749197428,47.68709305155499],[6.077313862256676,47.68710239511393],[6.075499384808161,47.687464147687294],[6.0755065376706705,47.687511624868655],[6.075509558986984,47.687563976669956],[6.075623093601329,47.68854850039209],[6.075368087088886,47.68950738853427],[6.0753390241751815,47.689615399975295],[6.0769513067496845,47.6896708220522],[6.0775442832666595,47.68970512736066],[6.0776362435482145,47.689713506172005],[6.077720385122354,47.689721172010884],[6.077923952581039,47.68973970887201],[6.078146545003976,47.68979914320073],[6.078270281232933,47.68983218066847]],[[6.07701879390926,47.688111446343],[6.076935586303193,47.68813746904597],[6.076791503792409,47.68814841210576],[6.0765342343864175,47.6881551840494],[6.0764554652178635,47.68813580758333],[6.076406212284748,47.68799929070194],[6.07640726138449,47.68785108481969],[6.076356310674983,47.68751876979339],[6.076387157564956,47.68744169341436],[6.076760180177752,47.68736482047356],[6.076823697843435,47.687361088407435],[6.076877084992869,47.68737556069035],[6.076946704762103,47.68777661911073],[6.07701879390926,47.688111446343]]]
          },
          "properties": {}
        }
      ]
    })
  })
  afterEach(() => vi.clearAllMocks())

  it("should render only telepac tab if there is only telepac source in props", () => {
    const wrapper = mount(OperatorSetup, {
      props: {
        sources: ['telepac']
      }
    })

    expect(wrapper.find('ul').findAll('li').length).toBe(1)
    expect(wrapper.text()).toContain('Sélectionner ma dernière déclaration PAC')
  })

  it("should render tab content for telepac", () => {
    const wrapper = mount(OperatorSetup, {
      props: {
        sources: ['telepac']
      }
    })

    expect(wrapper.text()).toContain('Sélectionner ma dernière déclaration PAC')
  })

  it("should render tab content for Geofolia when selected", async () => {
    const wrapper = mount(OperatorSetup, {
      props: {
        sources: ['telepac', 'geofolia']
      }
    })

    // Click on geofolia tab
    await wrapper.find('ul').findAll('li')[1].find('button').trigger('click')
    expect(wrapper.text()).toContain(`Sélectionner mon fichier de parcelles et d'interventions`)
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
    // it is now called during preview
    await flushPromises()
    const confirmBtn = await wrapper.find('.fr-btn')
    expect(createOperatorRecord).not.toHaveBeenCalled()
    expect(confirmBtn.text()).toEqual('Import des données')
  })

  it("should handle the case where it cannot convert telepac file (invalid file)", async () => {
    const wrapper = mount(OperatorSetup, {
      props: {
        sources: ['telepac']
      }
    })

    convertShapefileArchiveToGeoJSON.mockRejectedValueOnce(new AxiosError('Fichier invalide'))
    await wrapper.find('input[type="file"]').setValue('')
    expect(convertShapefileArchiveToGeoJSON.mock.results.at(0).value).toEqual(new AxiosError('Fichier invalide'))
    expect(createOperatorRecord).not.toHaveBeenCalled()
    await flushPromises()
    expect(wrapper.text()).toContain('Erreur')
  })
})
