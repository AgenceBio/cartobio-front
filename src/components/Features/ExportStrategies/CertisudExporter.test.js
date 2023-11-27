import { describe, test, expect } from 'vitest'
import Exporter from './CertisudExporter.js'
import record from '@/components/Features/__fixtures__/record-for-exports.json' assert { type: 'json' }

describe('CertisudExporter', () => {
  test('groups features by CULTURE, ENGAGEMENT and DATE', () => {
    const exporter = new Exporter({
      featureCollection: record.parcelles,
      operator: record.operator,
      record: record
    })

    const expectation = [
      [
        'Cultures en place lors du contrôle',
        'Surfaces déclarées',
        'Réf parcelle (n° ilot, cadastre)',
        'Classement proposé',
        'Depuis'
      ],
      [
        'Luzerne',
        // expect.closeTo(2.1), // in vite@5 + vitest@1
        2.092976314534671,
        '',
        'C1',
        new Date('2023-01-01T00:00:00.000Z'),
      ],
      [
        'Luzerne',
        // expect.closeTo(1.0), // in vite@5 + vitest@1
        1.0464881572673355,
        '',
        'AB',
        new Date('2021-01-01T00:00:00.000Z'),
      ],
      [
        'Trèfle',
        // expect.closeTo(1.0), // in vite@5 + vitest@1
        1.0464881572673355,
        '4 feuilles, semis le 01/03/2023',
        'AB',
        new Date('2021-01-01T00:00:00.000Z'),
      ],
      [
        'Trèfle',
        // expect.closeTo(1.0), // in vite@5 + vitest@1
        1.0464881572673355,
        '4 feuilles, semis le 01/03/2023',
        'AB',
        new Date('2015-01-01T00:00:00.000Z'),
      ],
      [
        '[ERREUR] correspondance manquante avec 01.19.99',
        1.0464881572673355,
        '',
        '',
        '',
      ]
    ]

    expect(exporter.toJSON()).toEqual(expectation)
  })
})
