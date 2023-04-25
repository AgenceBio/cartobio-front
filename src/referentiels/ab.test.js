import { describe, test, expect } from 'vitest';

import { applyValidationRules, OPERATOR_RULES, AUDITOR_RULES } from './ab.js'

describe('applyValidationRules', () => {
  test('operator requires culture type', () => {
    const features = [{ properties: { TYPE: 'BTH' }}, { properties: { TYPE: '' }}]
    const result = applyValidationRules(OPERATOR_RULES, ...features)

    expect(result).toEqual({
      failures: 1,
      success: 1,
      total: 2,
      rules: {
        NOT_EMPTY: { success: 1, failures: 1 }
      }
    })
  })

  test('operator requires culture type, and engagement_date only if Cx', () => {
    const features = [
      { properties: { TYPE: '' }},
      // below are NOT_EMPTY ok
      { properties: { TYPE: 'BTH' }},
      { properties: { TYPE: 'AIL', conversion_niveau: 'C1' }},
      // below are okay
      { properties: { TYPE: 'AIL', conversion_niveau: 'AB' }},
      { properties: { TYPE: 'AIL', conversion_niveau: 'C1', engagement_date: '2023-04-23' }},
    ]
    const result = applyValidationRules(AUDITOR_RULES, ...features)

    expect(result).toEqual({
      failures: 4,
      success: 6,
      total: 10,
      rules: {
        NOT_EMPTY: { success: 4, failures: 1 },
        ENGAGEMENT_DATE: { success: 2, failures: 3 }
      }
    })
  })
})
