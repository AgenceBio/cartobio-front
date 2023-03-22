import { describe, test, expect } from 'vitest';
import { parseReference } from "./cadastre.js";

describe('parseReference', () => {
  test('parse a valid reference', () => {
    expect(parseReference('26108000AI0341')).toEqual({
      commune: '26108', section: 'AI', prefix: '000', number: '0341'
    })

    expect(parseReference('33063000PD0174')).toEqual({
      commune: '33063', section: 'PD', prefix: '000', number: '0174'
    })

    expect(parseReference('67338000020044')).toEqual({
      commune: '67338', section: '02', prefix: '000', number: '0044'
    })

    expect(parseReference('97100000AO289')).toEqual({
      commune: '97100', section: 'AO', prefix: '000', number: '0289'
    })
  })
})
