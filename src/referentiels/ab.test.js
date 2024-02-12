import { afterAll, beforeAll, describe, test, expect, vi } from 'vitest';

import { applyValidationRules, certificationDateFin, getConversionLevel, isCertificationImmutable, isABLevel, OPERATOR_RULES, AUDITOR_RULES, CERTIFICATION_STATE } from './ab.js'
import { LEVEL_UNKNOWN, LEVEL_CONVENTIONAL, LEVEL_C1, LEVEL_C2, LEVEL_C3, LEVEL_AB, LEVEL_MAYBE_AB } from './ab.js'
import { useFeaturesStore } from "@/stores/index.js"

const dateNow = new Date('2021-01-01T09:00:00.000+02:00')

afterAll(() => vi.useRealTimers())
beforeAll(() => {
  vi.useFakeTimers()
  vi.setSystemTime(dateNow)
})

describe('applyValidationRules', () => {
  test('operator requires culture cpf', () => {
    const features = [
      { id: '1', properties: { cultures: [ { TYPE: 'BTH', CPF: '01.11.12' } ] }},
      { id: '2', properties: { cultures: [ { TYPE: '' } ] }},
      { id: '3', properties: { cultures: [] }}
    ]
    const store = useFeaturesStore()
    store.setAll(features)
    const result = applyValidationRules(OPERATOR_RULES, ...store.collection.features)

    expect(result).toEqual({
      failures: 2,
      success: 4,
      total: 6,
      features: {
        1: { success: 2, failures: 0 },
        2: { success: 1, failures: 1 },
        3: { success: 1, failures: 1 }
      },
      rules: {
        CPF: { success: 3, failures: 0 },
        NOT_EMPTY: { success: 1, failures: 2 },
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

describe('isCertificationImmutable', () => {
  test('immutable with Operateur and Auditeur when Pending Certification and Certified', () => {
    expect(isCertificationImmutable(CERTIFICATION_STATE.OPERATOR_DRAFT)).toEqual(false)
    expect(isCertificationImmutable(CERTIFICATION_STATE.AUDITED)).toEqual(false)
    expect(isCertificationImmutable(CERTIFICATION_STATE.PENDING_CERTIFICATION)).toEqual(true)
    expect(isCertificationImmutable(CERTIFICATION_STATE.CERTIFIED)).toEqual(true)
  })
})

describe('getConversionLevel', () => {
  test('returns UNKNOWN when not recognized', () => {
    expect(getConversionLevel('AAA')).toHaveProperty('value', LEVEL_UNKNOWN)
  })

  test('returns conversion level informations when known', () => {
    expect(getConversionLevel(LEVEL_AB)).toEqual({
      value: LEVEL_AB,
      shortLabel: 'AB',
      label: 'AB — Agriculture biologique',
      is_selectable: true
    })
  })
})

describe('isABLevel', () => {
  test('C1, C2, C3 and AB are AB Levels', () => {
    expect(isABLevel(LEVEL_UNKNOWN)).toEqual(false)
    expect(isABLevel(LEVEL_CONVENTIONAL)).toEqual(false)
    expect(isABLevel(LEVEL_C1)).toEqual(true)
    expect(isABLevel(LEVEL_C2)).toEqual(true)
    expect(isABLevel(LEVEL_C3)).toEqual(true)
    expect(isABLevel(LEVEL_AB)).toEqual(true)
    expect(isABLevel(LEVEL_MAYBE_AB)).toEqual(false)
  })
})

describe('certificationDateFin', () => {
  test('returns a M+18 date', () => {
    const d = new Date()
    const result = certificationDateFin.MoisPlusDixHuit(d)
    expect(result.toISOString()).toMatch('2022-07-01T')
    expect(d).toEqual(dateNow)
  })

  test('returns a Y+2 31/03 date', () => {
    const d = new Date()
    const result = certificationDateFin.AnneePlusDeux(d)
    expect(result.toISOString()).toMatch('2023-03-31T')
    expect(d).toEqual(dateNow)
  })
})
