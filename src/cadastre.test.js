import { describe, test, expect } from '@jest/globals'
import { parseReferences } from './cadastre.js'

describe('parseReferences()', () => {
  test('single reference', () => {
    expect(parseReferences('', { com: '26108' })).toStrictEqual([])
    expect(parseReferences('E108', { com: '26108' })).toStrictEqual(['26108000E0108'])
    expect(parseReferences('E 108', { com: '26108' })).toStrictEqual(['26108000E0108'])
    expect(parseReferences('000E0108', { com: '26108' })).toStrictEqual(['26108000E0108'])
    expect(parseReferences(' 000 E 0108 ,', { com: '26108' })).toStrictEqual(['26108000E0108'])
    expect(parseReferences('   E 108    ,', { com: '26108' })).toStrictEqual(['26108000E0108'])
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
