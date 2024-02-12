import { describe, test, expect } from 'vitest'
import { generateAutresInfos } from './BaseExporter.js'

describe('generateAutresInfos', () => {
  test('with two features and one culture each', () => {
    const features = [
      {
        properties: {
          NUMERO_I: '1',
          NUMERO_P: '1',
          cultures: [
            {
              CPF: '01.13.41.1',
              variete: 'Chantenay à cœur rouge',
              date_semis: '2023-03-31',
              surface: '1'
            }
          ]
        }
      },
      {
        properties: {
          auditeur_notes: 'Coucou',
          NUMERO_I: '1',
          NUMERO_P: '2',
          cultures: [
            {
              CPF: '01.13.41.1'
            }
          ]
        }
      }
    ]

    expect(generateAutresInfos(features)).toBe('1.1, 01.13.41.1 Carottes, Chantenay à cœur rouge, semis le 31/03/2023, 1ha ; 1.2, 01.13.41.1 Carottes, Coucou')

    // in case we display by feature, and we have
    expect(generateAutresInfos(features, { initialCulture: undefined })).toBe('1.1, 01.13.41.1 Carottes, Chantenay à cœur rouge, semis le 31/03/2023, 1ha ; 1.2, 01.13.41.1 Carottes, Coucou')
    expect(generateAutresInfos(features, { initialCulture: '01.13.41.1' })).toBe('1.1, Chantenay à cœur rouge, semis le 31/03/2023, 1ha ; 1.2, Coucou')

    expect(generateAutresInfos(features, { withNotes: false })).toBe('1.1, 01.13.41.1 Carottes, Chantenay à cœur rouge, semis le 31/03/2023, 1ha ; 1.2, 01.13.41.1 Carottes')
    expect(generateAutresInfos(features, { withName: falsewith, Notes: false })).toBe('01.13.41.1 Carottes, Chantenay à cœur rouge, semis le 31/03/2023, 1ha ; 01.13.41.1 Carottes')
    expect(generateAutresInfos(features, { withName: false, withNotes: false, withVariete: false })).toBe('01.13.41.1 Carottes, semis le 31/03/2023, 1ha ; 01.13.41.1 Carottes')
    expect(generateAutresInfos(features, { withDate: false, withName: false, withNotes: false })).toBe('01.13.41.1 Carottes, Chantenay à cœur rouge, 1ha ; 01.13.41.1 Carottes')
    expect(generateAutresInfos(features, { withDate: false, withName: false, withNotes: false, withSurface: false })).toBe('01.13.41.1 Carottes, Chantenay à cœur rouge ; 01.13.41.1 Carottes')

    expect(generateAutresInfos(features, { withCode: false, withCulture: true, withDate: false, withName: false, withNotes: false, withSurface: false })).toBe('Carottes, Chantenay à cœur rouge ; Carottes')
    expect(generateAutresInfos(features, { withCode: false, withCulture: false, withDate: false, withName: false, withNotes: false, withSurface: false })).toBe('Chantenay à cœur rouge')
  })

  test('with two features with multiple cultures each', () => {
    const features = [
      {
        properties: {
          NUMERO_I: '1',
          NUMERO_P: '1',
          cultures: [
            {
              CPF: '01.13.41.1',
              variete: 'Chantenay à cœur rouge',
              date_semis: '2023-03-31'
            },
            {
              CPF: '01.13.41.1',
              variete: 'Nantaise de Grasseval'
            }
          ]
        }
      },
      {
        properties: {
          auditeur_notes: 'Coucou',
          NUMERO_I: '1',
          NUMERO_P: '2',
          cultures: [
            {
              CPF: '01.13.41.1'
            },
            {
              CPF: '01.13.42',
              variete: 'Lautrec',
              date_semis: '2022-02-01'
            }
          ]
        }
      }
    ]

    expect(generateAutresInfos(features)).toBe('1.1, 01.13.41.1 Carottes, Chantenay à cœur rouge, semis le 31/03/2023 / 01.13.41.1 Carottes, Nantaise de Grasseval ; 1.2, 01.13.41.1 Carottes / 01.13.42 Ail, Lautrec, semis le 01/02/2022, Coucou')
    expect(generateAutresInfos(features, { withNotes: false })).toBe('1.1, 01.13.41.1 Carottes, Chantenay à cœur rouge, semis le 31/03/2023 / 01.13.41.1 Carottes, Nantaise de Grasseval ; 1.2, 01.13.41.1 Carottes / 01.13.42 Ail, Lautrec, semis le 01/02/2022')
    expect(generateAutresInfos(features, { withNotes: false, withName: false })).toBe('01.13.41.1 Carottes, Chantenay à cœur rouge, semis le 31/03/2023 / 01.13.41.1 Carottes, Nantaise de Grasseval ; 01.13.41.1 Carottes / 01.13.42 Ail, Lautrec, semis le 01/02/2022')
  })

  test('with two features with a pivot on a given culture', () => {
    const features = [
      {
        properties: {
          auditeur_notes: 'Coucou !',
          NUMERO_I: '1',
          NUMERO_P: '1',
          cultures: [
            {
              CPF: '01.13.41.1',
              variete: 'Chantenay à cœur rouge',
              date_semis: '2023-03-31'
            },
            {
              CPF: '01.13.41.1',
              variete: 'Nantaise de Grasseval'
            }
          ]
        }
      },
      {
        properties: {
          NUMERO_I: '1',
          NUMERO_P: '2',
          cultures: [
            {
              CPF: '01.13.41.1'
            },
            {
              CPF: '01.13.42',
              variete: 'Lautrec',
              date_semis: '2022-02-01'
            }
          ]
        }
      }
    ]

    expect(generateAutresInfos(features, { pivot: '01.13.41.1' })).toBe('1.1, Chantenay à cœur rouge, semis le 31/03/2023 / Nantaise de Grasseval, Coucou ! ; 1.2')
    expect(generateAutresInfos(features, { pivot: '01.13.41.1', withDate: false, withNotes: false })).toBe('1.1, Chantenay à cœur rouge / Nantaise de Grasseval ; 1.2')
  })
})
