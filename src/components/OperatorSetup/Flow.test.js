import { describe, expect, it } from "vitest"
import { markRaw } from "vue"
import { flushPromises, mount } from "@vue/test-utils"
import { createPinia, setActivePinia } from "pinia"
import axios, { AxiosError } from "axios"

import OperatorSetupFlow from './Flow.vue'
import ActionFromScratch from './Actions/FromScratch.vue'
import ActionFromSource from './Actions/FromSource.vue'
import FlowMultiSources from './Flows/MultiSources.vue'
import CviComponent from "./Sources/Cvi.vue"

import record from '../Features/__fixtures__/record-with-features.json' assert { type: 'json' }
import { sources } from '@/referentiels/imports.js'

setActivePinia(createPinia())

const operatorSetupActions = [
  {
    id: 'source',
    selector: markRaw(ActionFromSource),
    wizzard: markRaw(FlowMultiSources),
    extraProps: {
      sources: [sources.TELEPAC, sources.GEOFOLIA, sources.RPG, sources.CVI]
    }
  },
  { id: 'manual', selector: markRaw(ActionFromScratch) },
]

const featureCollectionFixture = {
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
}

describe("OperatorSetupFlow", () => {
  it("should render the flow selector at first", async () => {
    const wrapper = mount(OperatorSetupFlow, {
      props: {
        actions: operatorSetupActions,
        operator: record.operator
      }
    })

    expect(wrapper.findAll('.fr-card')).toHaveLength(2)
    expect(wrapper.find('.fr-stepper__state').exists()).toBe(false)
  })

  it("should render the flow selector with a visual stepper", async () => {
    const wrapper = mount(OperatorSetupFlow, {
      props: {
        actions: operatorSetupActions,
        operator: record.operator,
        withStepper: true
      }
    })

    expect(wrapper.findAll('.fr-card')).toHaveLength(2)
    expect(wrapper.find('.fr-stepper__state').exists()).toBe(true)
    expect(wrapper.find('.fr-stepper__state').text()).toBe('Étape 1 sur 4')
  })

  it("should render the source selector with telepac tab with a pre-established flowId", async () => {
    const wrapper = mount(OperatorSetupFlow, {
      props: {
        actions: operatorSetupActions,
        flowId: 'source',
        operator: record.operator
      }
    })

    await flushPromises()

    const tabs = wrapper.findAll('.fr-tabs__tab')
    expect(tabs).toHaveLength(4)
    expect(tabs.at(0).attributes()).toHaveProperty('aria-selected', 'true')
    expect(tabs.at(0).text()).toBe('Telepac')

    expect(wrapper.text()).toContain('Sélectionner ma dernière déclaration PAC')
  })

  it("should render tab content for telepac", () => {
    const wrapper = mount(OperatorSetupFlow, {
      props: {
        actions: operatorSetupActions,
        flowId: 'source',
        operator: record.operator
      }
    })

    expect(wrapper.text()).toContain('Sélectionner ma dernière déclaration PAC')
  })

  it("should render tab content for Geofolia when selected", async () => {
    const wrapper = mount(OperatorSetupFlow, {
      props: {
        actions: operatorSetupActions,
        flowId: 'source',
        operator: record.operator
      }
    })

    // Click on geofolia tab
    await wrapper.find('ul').find('.import-source-tab--geofolia').trigger('click')
    expect(wrapper.text()).toContain(`Sélectionner mon fichier de parcelles et d'interventions`)
  })

  it("should render tab content for RPG when selected", async () => {
    const wrapper = mount(OperatorSetupFlow, {
      props: {
        actions: operatorSetupActions,
        flowId: 'source',
        operator: record.operator
      }
    })

    // Click on rpg tab
    await wrapper.find('ul').find('.import-source-tab--rpg').trigger('click')
    expect(wrapper.text()).toContain(`Vous pouvez importer le dernier Registre parcellaire graphique (RPG) instruit`)

  })

  it("should render tab content for CVI when selected", async () => {
    const wrapper = mount(OperatorSetupFlow, {
      props: {
        actions: operatorSetupActions,
        flowId: 'source',
        operator: record.operator
      }
    })

    // Submit an invalid EVV
    const error = new AxiosError('EVV et SIRET non correspondants')
    error.response = { status : 401, data: { error: 'EVV et SIRET non correspondants' } }
    axios.__createMock.get.mockRejectedValueOnce(error)

    await wrapper.find('ul').find('.import-source-tab--cvi').trigger('click')

    wrapper.getComponent(CviComponent)
    await wrapper.find('#ncvi-evv').setValue('99999')

    // surprisingly, the click on the submit button… does not trigger the submit event
    // although it works in a browser UI
    await wrapper.find('form').trigger('submit')
    // await wrapper.find('.fr-btn').trigger('click')
    await flushPromises()

    expect(wrapper.find('.fr-input-group').classes()).toContain('fr-input-group--error')
    expect(wrapper.find('.fr-input').classes()).toContain('fr-input--error')
    expect(wrapper.find('.fr-error-text').exists()).toBe(true)
  })

  it("should render no tabs otherwise", () => {
    const wrapper = mount(OperatorSetupFlow, {
      props: {
        actions: [],
        operator: record.operator
      }
    })

    expect(wrapper.findAll('.fr-tabs__tab')).toHaveLength(0)
  })

  it("should submit convert and save a telepac import", async () => {
    const wrapper = mount(OperatorSetupFlow, {
      props: {
        actions: operatorSetupActions,
        flowId: 'source',
        operator: record.operator
      }
    })

    axios.__createMock.post.mockResolvedValueOnce({
      data: featureCollectionFixture
    })

    await wrapper.find('input[type="file"]').setValue('')
    await flushPromises()

    // it is now called during preview
    const confirmBtn = await wrapper.find('.fr-btn')
    expect(confirmBtn.text()).toEqual('Importer ces données')
  })

  it("should handle the case where it cannot convert telepac file (invalid file)", async () => {
    const wrapper = mount(OperatorSetupFlow, {
      props: {
        actions: [ ...operatorSetupActions ],
        flowId: 'source',
        operator: record.operator
      }
    })

    const error = new AxiosError('Fichier invalide')
    error.response = { status : 400 }

    axios.__createMock.post.mockRejectedValueOnce(error)

    await wrapper.find('input[type="file"]').setValue('')
    await flushPromises()

    expect(wrapper.text()).toContain('Votre fichier ne semble pas être une déclaration')
  })

  it('should handle incorrect PACAGE numbers', async () => {
    const wrapper = mount(OperatorSetupFlow, {
      props: {
        actions: operatorSetupActions,
        flowId: 'source',
        operator: record.operator
      }
    })

    // Click on rpg tab
    await wrapper.find('ul').find('.import-source-tab--rpg').trigger('click')
    await wrapper.find('#input-pacage').setValue('12345')
    await wrapper.find('.fr-btn').trigger('click')
    expect(wrapper.text()).toContain(`Le numéro de PACAGE est composé de minimum 7 chiffres.`)
  })

  it('should handle correct PACAGE numbers', async () => {
    const wrapper = mount(OperatorSetupFlow, {
      props: {
        actions: operatorSetupActions,
        flowId: 'source',
        operator: record.operator
      }
    })

    axios.__createMock.get.mockResolvedValueOnce({
      data: featureCollectionFixture
    })

    // Click on rpg tab
    await wrapper.find('ul').find('.import-source-tab--rpg').trigger('click')
    await wrapper.find('#input-pacage').setValue('012345678')
    await wrapper.find('.fr-btn').trigger('click')
    await flushPromises()

    expect(axios.__createMock.get).toHaveBeenCalledOnce()
    const confirmBtn = await wrapper.find('.fr-btn')
    expect(confirmBtn.text()).toEqual('Importer ces données')
  })
})
