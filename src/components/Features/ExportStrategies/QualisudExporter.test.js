import { describe, test, expect } from 'vitest'
import Exporter from './QualisudExporter.js'
import record from '@/components/Features/__fixtures__/record-for-exports.json' assert { type: 'json' }

describe('QualisudExporter', () => {
  test('list by features', () => {
    const exporter = new Exporter({
      featureCollection: record.parcelles,
      operator: record.operator,
      record: record
    })

    const expectation = [
      [
        "Production (code CPF)",
        "Notes de l'auditeur",
        "Nom",
        "Surface",
        "Classe",
        "Date d'engagement",
        "Id. Parcelle"
      ],
      [
        '01.19.10.8',
        '',
        '',
        1.0464881572673355,
        'C1',
        new Date('2023-01-01T00:00:00.000Z'),
        '1'
      ],
      [
        '01.19.10.8',
        '',
        '',
        1.0464881572673355,
        'C1',
        new Date('2023-01-01T00:00:00.000Z'),
        '2'
      ],
      [
        '01.19.10.8',
        ' / 01.19.10.7 Trèfle, 4 feuilles, semis le 01/03/2023',
        '',
        1.0464881572673355,
        'AB',
        new Date('2021-01-01T00:00:00.000Z'),
        '3'
      ],
      [
        '01.19.10.7',
        '4 feuilles, semis le 01/03/2023',
        '',
        1.0464881572673355,
        'AB',
        new Date('2015-01-01T00:00:00.000Z'),
        '4'
      ],
      [
        '[ERREUR] culture inconnue',
        '01.19.99 Culture inconnue',
        '',
        1.0464881572673355,
        '',
        '',
        '5'
      ]
    ]

    expect(exporter.toJSON()).toEqual(expectation)
  })
})
