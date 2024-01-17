import { describe, test, expect } from 'vitest';
import { cleanInput, isValidReference, parseReference, toString, trimLeadingZero } from "./cadastre.js";

describe('cleanInput', () => {
  test('remove unnecessary chars', () => {
    expect(cleanInput(' A ,Z ')).toEqual('AZ')
    expect(cleanInput('    ')).toEqual('')
    expect(cleanInput('6  2 ')).toEqual('62')
  })

  test('works on non-string values', () => {
    expect(cleanInput(new Date())).toEqual('')
    expect(cleanInput(undefined)).toEqual('')
    expect(cleanInput({})).toEqual('')
  })
})

describe('isValidReference', () => {
  test('recognize valid metropolitan and overseas references', () => {
    expect(isValidReference('013100000A0016')).toEqual(true)
    expect(isValidReference('2A0040000D0037')).toEqual(true)
    expect(isValidReference('26108001ZI0239')).toEqual(true)
    expect(isValidReference('26108000ZI0239')).toEqual(true)
    expect(isValidReference('97411000BP0885')).toEqual(true)
  })

  test('these are not valid references', () => {
    expect(isValidReference('13100000A0016')).toEqual(false)
    expect(isValidReference('2C0040000D0037')).toEqual(false)
    expect(isValidReference('9741100BP0885')).toEqual(false)
    expect(isValidReference('97911000BP0885')).toEqual(false)
    expect(isValidReference('99911000BP0885')).toEqual(false)
  })
})

describe('trimLeadingZero', () => {
  test('removes leading of sections and prefixes', () => {
    expect(trimLeadingZero('0037')).toEqual('37')
    expect(trimLeadingZero('0D')).toEqual('D')
    expect(trimLeadingZero('BP')).toEqual('BP')
  })

  test('without effect on only zeroes', () => {
    expect(trimLeadingZero('000')).toEqual('000')
  })
})

describe('parseReference', () => {
  test('parse nothing', () => {
    expect(parseReference('26400AZ23')).toEqual(null)
  })

  test('parse a regular reference', () => {
    expect(parseReference('26108000AI0341')).toEqual({
      commune: '26108', section: 'AI', prefix: '000', number: '0341'
    })

    expect(parseReference('95476000AI0520')).toEqual({
      commune: '95476', section: 'AI', prefix: '000', number: '0520'
    })

    expect(parseReference('33063000PD0174')).toEqual({
      commune: '33063', section: 'PD', prefix: '000', number: '0174'
    })
  })

  test('parse an Alsace-Moselle section', () => {
    expect(parseReference('67338000020044')).toEqual({
      commune: '67338', section: '02', prefix: '000', number: '0044'
    })
  })

  test('parse a DROM postcode', () => {
    expect(parseReference('97100000AO289')).toEqual({
      commune: '97100', section: 'AO', prefix: '000', number: '289'
    })
    expect(parseReference('97411000BP0867')).toEqual({
      commune: '97411', section: 'BP', prefix: '000', number: '0867'
    })
  })

  test('parse a leading 0 section prefix', () => {
    expect(parseReference('261080000A0341')).toEqual({
      commune: '26108', section: '0A', prefix: '000', number: '0341'
    })
  })

  test('parse a non-000 prefix', () => {
    expect(parseReference('57123987AO0174')).toEqual({
      commune: '57123', section: 'AO', prefix: '987', number: '0174'
    })
  })
})

describe('toString', () => {
  test('turn form inputs into a proper reference', () => {
    let input = toString({ commune: '57123', section: 'A', number: '174' })
    expect(input).toEqual('571230000A0174')

    input = toString({ commune: '97411', section: 'BP', number: '885' })
    expect(input).toEqual('97411000BP0885')
  })
})
