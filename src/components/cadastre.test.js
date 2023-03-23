import { describe, test, expect } from 'vitest';
import { parseReference } from "./cadastre.js";

describe('parseReference', () => {
  test('parse nothing', () => {
    expect(parseReference('26400AZ23')).toEqual(null)
  })

  test('parse a regular reference', () => {
    expect(parseReference('26108000AI0341')).toEqual({
      commune: '26108', section: 'AI', prefix: '000', number: '341'
    })

    expect(parseReference('33063000PD0174')).toEqual({
      commune: '33063', section: 'PD', prefix: '000', number: '174'
    })
  })

  test('parse an Alsace-Moselle section', () => {
    expect(parseReference('67338000020044')).toEqual({
      commune: '67338', section: '02', prefix: '000', number: '44'
    })
  })

  test('parse a DROM postcode', () => {
    expect(parseReference('97100000AO289')).toEqual({
      commune: '97100', section: 'AO', prefix: '000', number: '289'
    })
  })

  test('parse a leading 0 section prefix', () => {
    expect(parseReference('261080000A0341')).toEqual({
      commune: '26108', section: '0A', prefix: '000', number: '341'
    })
  })

  test('parse a non-000 prefix', () => {
    expect(parseReference('57123987AO0174')).toEqual({
      commune: '57123', section: 'AO', prefix: '987', number: '174'
    })
  })
})
