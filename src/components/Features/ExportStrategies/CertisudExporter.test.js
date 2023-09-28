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
        '',
        '2,1 ha',
        'C1',
        new Date('2023-01-01T00:00:00.000Z'),
      ],
      [
        'Luzerne',
        '',
        '1,0 ha',
        'AB',
        new Date('2021-01-01T00:00:00.000Z'),
      ],
      [
        'Trèfle',
        '4 feuilles, 2023-03-01',
        '1,0 ha',
        'AB',
        new Date('2021-01-01T00:00:00.000Z'),
      ],
      [
        'Trèfle',
        '4 feuilles, 2023-03-01',
        '1,0 ha',
        'AB',
        new Date('2015-01-01T00:00:00.000Z'),
      ],
      [
        '[ERREUR] correspondance manquante avec 01.19.99',
        '',
        '1,0 ha',
        '',
        '',
      ]
    ]

    expect(exporter.toJSON()).toEqual(expectation)
  })
})
