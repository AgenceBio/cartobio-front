import { describe, test, expect } from 'vitest';

import { deriveFromFilename, isValid, resolveCampagneFromDate } from './pac.js'

describe('deriveFromFilename', () => {
  test('valid filename', () => {
    expect(deriveFromFilename('Dossier-PAC-2020_dossier_999100540_20201216111411.xml')).toEqual({ pacage: '999100540', campagne: '2020' })
    expect(deriveFromFilename('Dossier-PAC-2020_parcelle-2020_082020054_20201113091213.zip')).toEqual({ pacage: '082020054', campagne: '2020' })
  })

  test('invalid filename', () => {
    expect(deriveFromFilename('Client95_Parcelles et Interventions (ZIP)_20211217153622.zip')).toEqual({ pacage: null, campagne: null })
  })
})

describe('isValid', () => {
  test('valid pacage numbers', () => {
    expect(isValid('12345678')).toBe(true)
    expect(isValid('001234567')).toBe(true)
    expect(isValid('976345678')).toBe(true)
  })

  test('should fail with invalid numbers', () => {
    expect(isValid(null)).toBe(false)
    expect(isValid(undefined)).toBe(false)
    expect(isValid('')).toBe(false)
    expect(isValid('123456789')).toBe(false)
    expect(isValid('00000000')).toBe(false)
    expect(isValid('000000000')).toBe(false)
    expect(isValid('000000001')).toBe(false)
    expect(isValid('000000012')).toBe(false)
    expect(isValid('000000123')).toBe(false)
    expect(isValid('000001234')).toBe(false)
    expect(isValid('000012345')).toBe(false)
    expect(isValid('000123456')).toBe(false)
    expect(isValid('966345678')).toBe(false)

  })
})

describe('resolveCampagneFromDate', () => {
  test('it is the current year', () => {
    expect(resolveCampagneFromDate(new Date('2023-04-14'))).toBe(2023)
    expect(resolveCampagneFromDate(new Date('2023-04-15'))).toBe(2023)
  })

  test('it is the previous year', () => {
    expect(resolveCampagneFromDate(new Date('2023-04-01'))).toBe(2022)
  })
})
