import { afterAll, beforeAll, describe, test, expect, vi } from 'vitest';

import { certificationDateFin, getConversionLevel, isCertificationImmutable, isABLevel, CERTIFICATION_STATE } from './ab.js'
import { LEVEL_UNKNOWN, LEVEL_CONVENTIONAL, LEVEL_C1, LEVEL_C2, LEVEL_C3, LEVEL_AB, LEVEL_MAYBE_AB } from './ab.js'

const dateNow = new Date('2021-01-01T09:00:00.000+02:00')

afterAll(() => vi.useRealTimers())
beforeAll(() => {
  vi.useFakeTimers()
  vi.setSystemTime(dateNow)
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
  test('returns a M+18 date (feb 2024)', () => {
    const d = new Date('2024-02-19T09:00:00.000+02:00')
    const result = certificationDateFin.MoisPlusDixHuit(d)
    expect(result.toISOString()).toMatch('2025-08-19T')
  })

  test('returns a Y+2 31/03 date (feb 2024)', () => {
    const d = new Date('2024-02-19T09:00:00.000+02:00')
    const result = certificationDateFin.AnneePlusDeux(d)
    expect(result.toISOString()).toMatch('2026-03-31T')
  })

  test('returns a M+18 date (end of year)', () => {
    const d = new Date('2023-12-31T09:00:00.000+02:00')
    const result = certificationDateFin.MoisPlusDixHuit(d)
    expect(result.toISOString()).toMatch('2025-07-01T')
  })

  test('returns a Y+2 31/03 date (end of year)', () => {
    const d = new Date('2023-12-31T09:00:00.000+02:00')
    const result = certificationDateFin.AnneePlusDeux(d)
    expect(result.toISOString()).toMatch('2025-03-31T')
  })

  test('returns a Y+2 31/03 date (same day)', () => {
    const d = new Date('2023-03-31T09:00:00.000+02:00')
    const result = certificationDateFin.AnneePlusDeux(d)
    expect(result.toISOString()).toMatch('2025-03-31T')
  })
})
