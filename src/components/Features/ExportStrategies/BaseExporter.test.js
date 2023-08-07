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
              date_semis: '2023-03-31'
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

    expect(generateAutresInfos(features)).toBe('1.1, 01.13.41.1 Carottes, Chantenay à cœur rouge, 2023-03-31 ; 1.2, 01.13.41.1 Carottes, Coucou')
    expect(generateAutresInfos(features, { withNotes: false })).toBe('1.1, 01.13.41.1 Carottes, Chantenay à cœur rouge, 2023-03-31 ; 1.2, 01.13.41.1 Carottes')
    expect(generateAutresInfos(features, { withNotes: false, withName: false })).toBe('01.13.41.1 Carottes, Chantenay à cœur rouge, 2023-03-31 ; 01.13.41.1 Carottes')
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

    expect(generateAutresInfos(features)).toBe('1.1, 01.13.41.1 Carottes, Chantenay à cœur rouge, 2023-03-31 / 01.13.41.1 Carottes, Nantaise de Grasseval ; 1.2, 01.13.41.1 Carottes / 01.13.42 Ail, Lautrec, 2022-02-01, Coucou')
    expect(generateAutresInfos(features, { withNotes: false })).toBe('1.1, 01.13.41.1 Carottes, Chantenay à cœur rouge, 2023-03-31 / 01.13.41.1 Carottes, Nantaise de Grasseval ; 1.2, 01.13.41.1 Carottes / 01.13.42 Ail, Lautrec, 2022-02-01')
    expect(generateAutresInfos(features, { withNotes: false, withName: false })).toBe('01.13.41.1 Carottes, Chantenay à cœur rouge, 2023-03-31 / 01.13.41.1 Carottes, Nantaise de Grasseval ; 01.13.41.1 Carottes / 01.13.42 Ail, Lautrec, 2022-02-01')
  })
})
