import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"
import { defineComponent, markRaw, Suspense } from "vue"
import { createTestingPinia } from "@pinia/testing"
import { flushPromises, mount } from "@vue/test-utils"
import { updateSingleFeatureProperties } from '@/cartobio-api.js'

import { DeletionReasonsCode } from "@/components/Features/index.js"
import { useRecordStore, useFeaturesStore, usePermissions } from "@/stores/index.js"
import { AnnotationTags, CERTIFICATION_BODY_DECISION, ANNOTATIONS, AUDITOR_RULES, LEVEL_CONVENTIONAL, LEVEL_C1, LEVEL_AB } from "@/referentiels/ab.js"

import record from './__fixtures__/record-with-features.json' assert { type: 'json' }
import EditForm from "@/components/Features/SingleItemCertificationBodyForm.vue"
import TableComponent from "./Table.vue"

const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false })
const recordStore = useRecordStore(pinia)
const permissions = usePermissions(pinia)

const operator = {
  id: 1,
  nom: "Test"
}

describe("SingleItemCertificationBodyForm", () => {
  let wrapper

  beforeEach(async () => {
    recordStore.reset()
    recordStore.update(record)
    permissions.isOc = true

    const AsyncComponent = defineComponent({
      components: { TableComponent },
      template: '<Suspense><TableComponent v-bind="$attrs" /></Suspense>'
    })

    wrapper = mount(AsyncComponent, {
      props: { operator, validationRules: { rules: AUDITOR_RULES }, editForm: markRaw(EditForm) }
    })

    const table = wrapper.getComponent(TableComponent)
    await table.find('tr.parcelle td').trigger('click')
    await flushPromises()
  })

  afterEach(() => {
    document.body.outerHTML = ''
    vi.clearAllMocks()
  })

  test("we assign a certification state", async () => {
    const form = wrapper.getComponent(EditForm)

    // if "Conventionnel", there is no date field
    await form.find(`#conversion-${LEVEL_CONVENTIONAL}`).setValue()
    expect(form.find('#engagement_date').exists()).toEqual(false)

    // if AB, date field is not mandatory
    await form.find(`#conversion-${LEVEL_AB}`).setValue()
    expect(form.find('#engagement_date').attributes()).not.toHaveProperty('required')

    // date field is mandatory otherwise
    await form.find(`#conversion-${LEVEL_C1}`).setValue()
    expect(form.find('#engagement_date').attributes()).toHaveProperty('required', '')
  })

  test("we toggle expanded annotations", async () => {
    const form = wrapper.getComponent(EditForm)

    // We have 2 tags and 1 expand button
    expect(form.findAll('.fr-tags-group--annotations > .annotation-choice')).toHaveLength(2)
    expect(form.find('.fr-tags-group--annotations > .annotation--more').attributes()).not.toHaveProperty('hidden')

    await form.find('.fr-tags-group--annotations > .annotation--more button').trigger('click')

    const expectedChoices = Object.keys(AnnotationTags)
    expect(form.find('.fr-tags-group--annotations > .annotation--more').attributes()).toHaveProperty('hidden')
    expect(form.findAll('.fr-tags-group--annotations > .annotation-choice')).toHaveLength(expectedChoices.length)
  })

  test("we select three choices, and two reasons", async () => {
    const form = wrapper.getComponent(EditForm)

    // We have 2 tags and 1 expand button
    await form.find('.fr-tags-group--annotations > .annotation--more button').trigger('click')
    await form.find(`.fr-tags-group--annotations > .annotation--${ANNOTATIONS.DOWNGRADED} button`).trigger('click')
    await form.find(`.fr-tags-group--annotations > .annotation--${ANNOTATIONS.REDUCED_CONVERSION_PERIOD} button`).trigger('click')
    await form.find(`.fr-tags-group--annotations > .annotation--${ANNOTATIONS.RISKY} button`).trigger('click')

    // we toggle and cancel the tag
    await form.find(`.fr-tags-group--annotations > .annotation--${ANNOTATIONS.SURVEYED} button`).trigger('click')
    await form.find(`.fr-tags-group--annotations > .annotation--${ANNOTATIONS.SURVEYED} button`).trigger('click')

    await form.find('#reduced_conversion_period_state').setValue(CERTIFICATION_BODY_DECISION.REJECTED)
    await form.find('#downgraded_state').setValue(CERTIFICATION_BODY_DECISION.ACCEPTED)

    // click and assess server update
    await form.find('.fr-modal__footer button.fr-btn').trigger('click')

    expect(wrapper.findComponent(EditForm).exists()).toEqual(false)
    expect(updateSingleFeatureProperties.mock.lastCall).toMatchObject([
      { recordId: '054f0d70-c3da-448f-823e-81fcf7c2bf6e' },
      {
        id: 2,
        properties: {
          annotations: [
            {
              code: ANNOTATIONS.DOWNGRADED,
              metadata: {
                [ANNOTATIONS.METADATA_STATE]: CERTIFICATION_BODY_DECISION.ACCEPTED
              }
            },
            {
              code: ANNOTATIONS.REDUCED_CONVERSION_PERIOD,
              metadata: {
                [ANNOTATIONS.METADATA_STATE]: CERTIFICATION_BODY_DECISION.REJECTED
              }
            },
            {
              code: ANNOTATIONS.RISKY
            }
          ]
        }
      }
    ])
  })
})
