import { describe, test, expect } from 'vitest';

import { applyValidationRules, OPERATOR_RULES, AUDITOR_RULES } from './ab.js'
import { useFeaturesStore } from "@/stores/index.js"

describe('applyValidationRules', () => {
  test('operator requires culture cpf', () => {
    const features = [
      { id: 1, properties: { TYPE: 'BTH' }},
      { id: 2, properties: { TYPE: '' }}
    ]
    const store = useFeaturesStore()
    store.setAll(features)
    const result = applyValidationRules(OPERATOR_RULES, ...store.collection.features)

    expect(result).toEqual({
      failures: 1,
      success: 3,
      total: 4,
      features: {
        1: { success: 2, failures: 0 },
        2: { success: 1, failures: 1 }
      },
      rules: {
        CPF: { success: 2, failures: 0 },
        NOT_EMPTY: { success: 1, failures: 1 },
      }
    })
  })

  test('operator requires culture type, and engagement_date only if Cx', () => {
    const features = [
      // NOT_EMPTY not ok CPF ok
      { id: 1, properties: { TYPE: '' }},
      // below is NOT_EMPTY ok but CPF is not
      { id: 2, properties: { TYPE: 'AGR' }},
      // below is NOT_EMPTY and CPF ok
      { id: 3, properties: { TYPE: 'AIL', conversion_niveau: 'C1' }},
      // below are okay
      { id: 4, properties: { TYPE: 'AIL', conversion_niveau: 'AB' }},
      { id: 5, properties: { TYPE: 'AIL', conversion_niveau: 'C1', engagement_date: '2023-04-23' }},
    ]
    const store = useFeaturesStore()
    store.setAll(features)
    const result = applyValidationRules(AUDITOR_RULES, ...store.collection.features)

    expect(result).toEqual({
      failures: 5,
      success: 10,
      total: 15,
      rules: {
        NOT_EMPTY: { success: 4, failures: 1 },
        CPF: { success: 4, failures: 1 },
        ENGAGEMENT_DATE: { success: 2, failures: 3 }
      },
      features: {
        1: { success: 1, failures: 2 },
        2: { success: 1, failures: 2 },
        3: { success: 2, failures: 1 },
        4: { success: 3, failures: 0 },
        5: { success: 3, failures: 0 },
      },
    })
  })
})
