import { describe, test, expect } from '@jest/globals'
import { parseReferences } from './cadastre.js'

describe('parseReferences()', () => {
  test('empty input', () => {
    expect(parseReferences('', { })).toStrictEqual([])
    expect(parseReferences('000 108', { })).toStrictEqual([])
    expect(parseReferences('000 108')).toStrictEqual([])
  })

  test('non-matching reference', () => {
    expect(parseReferences('', { com: '26108' })).toStrictEqual([])
    expect(parseReferences('000 108', { com: '26108' })).toStrictEqual([])
  })

  test('single reference', () => {
    expect(parseReferences('E108', { com: '26108' })).toStrictEqual(['26108000E0108'])
    expect(parseReferences('E 108', { com: '26108' })).toStrictEqual(['26108000E0108'])
    expect(parseReferences('000E0108', { com: '26108' })).toStrictEqual(['26108000E0108'])
    expect(parseReferences(' 000 E 0108 ,', { com: '26108' })).toStrictEqual(['26108000E0108'])
    expect(parseReferences('   E 108    ,', { com: '26108' })).toStrictEqual(['26108000E0108'])
  })

  // they match, but technically there is no way section 199 exists (most of the time)
  // we keep them because it makes RE easier to write
  test('ambiguous matching', () => {
    expect(parseReferences('199E108', { com: '26108' })).toStrictEqual(['26108199E0108'])
    expect(parseReferences('199 E 108', { com: '26108' })).toStrictEqual(['26108199E0108'])
  })

  test('single reference (Alsace/Moselle)', () => {
    expect(parseReferences('', { com: '68013' })).toStrictEqual([])
    expect(parseReferences('011', { com: '68013' })).toStrictEqual(['68013000010001'])
    expect(parseReferences('01 1', { com: '68013' })).toStrictEqual(['68013000010001'])
    expect(parseReferences('00001001', { com: '68013' })).toStrictEqual(['68013000010001'])
    expect(parseReferences(' 000 1 1 ,', { com: '68013' })).toStrictEqual(['68013000010001'])
    expect(parseReferences('   1 1    ,', { com: '68013' })).toStrictEqual(['68013000010001'])
  })

  test('multi references', () => {
    expect(parseReferences('E108 E109', { com: '26108' })).toStrictEqual(['26108000E0108', '26108000E0109'])
    expect(parseReferences('E 108, E109', { com: '26108' })).toStrictEqual(['26108000E0108', '26108000E0109'])
    expect(parseReferences('E 108 E 109', { com: '26108' })).toStrictEqual(['26108000E0108', '26108000E0109'])
    expect(parseReferences('  E 108 , E 109   ', { com: '26108' })).toStrictEqual(['26108000E0108', '26108000E0109'])
    expect(parseReferences(' 000 E 108 , 001  E 109   ', { com: '26108' })).toStrictEqual(['26108000E0108', '26108000E0109'])
    expect(parseReferences(' E 108 ------ E 109 ', { com: '26108' })).toStrictEqual(['26108000E0108', '26108000E0109'])
  })
})
