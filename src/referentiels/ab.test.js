import { describe, test, expect } from 'vitest';

import { applyValidationRules, OPERATOR_RULES, AUDITOR_RULES } from './ab.js'
import { useFeaturesStore } from "@/stores/index.js"

describe('applyValidationRules', () => {
  test('operator requires culture cpf', () => {
    const features = [
      { id: 1, properties: { cultures: [ { TYPE: 'BTH', CPF: '01.11.12' } ] }},
      { id: 2, properties: { cultures: [ { TYPE: '' } ] }}
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
      { id: 1, properties: { cultures: [ { TYPE: '' } ] }},
      // below is NOT_EMPTY ok but CPF and CONVERSION_LEVEL are not
      { id: 2, properties: { cultures: [ { TYPE: 'AGR', CPF: '01.23.11,01.23.12,01.23.13,01.23.14,01.23.19' } ] }},
      // below is NOT_EMPTY and CPF ok, but CONVERSION_LEVEL fails
      { id: 3, properties: { cultures: [ { TYPE: 'AIL', CPF: '01.13.42' } ], conversion_niveau: 'C1' }},
      // below is MAYBE_AB
      { id: 4, properties: { cultures: [ { TYPE: 'AIL', CPF: '01.13.42' } ], conversion_niveau: 'AB?' }},
      // below are okay (CONVERSION_LEVEL succeeds)
      { id: 5, properties: { cultures: [ { TYPE: 'AIL', CPF: '01.13.42' } ], conversion_niveau: 'AB' }},
      { id: 6, properties: { cultures: [ { TYPE: 'AIL', CPF: '01.13.42' } ], conversion_niveau: 'C1', engagement_date: '2023-04-23' }},
    ]
    const store = useFeaturesStore()
    store.setAll(features)
    const result = applyValidationRules(AUDITOR_RULES, ...store.collection.features)

    expect(result).toEqual({
      failures: 5,
      success: 25,
      total: 30,
      rules: {
        NOT_EMPTY: { success: 5, failures: 1 },
        CPF: { success: 5, failures: 1 },
        MAYBE_AB: { success: 5, failures: 1 },
        ENGAGEMENT_DATE: { success: 5, failures: 1 },
        CONVERSION_LEVEL: { success: 5, failures: 1 },
      },
      features: {
        1: { success: 4, failures: 1 },
        2: { success: 3, failures: 2 },
        3: { success: 4, failures: 1 },
        4: { success: 4, failures: 1 },
        5: { success: 5, failures: 0 },
        6: { success: 5, failures: 0 },
      },
    })
  })
})
