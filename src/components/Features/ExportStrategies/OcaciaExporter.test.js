import { describe, test, expect } from 'vitest'
import Exporter from './OcaciaExporter.js'
import record from '@/components/Features/__fixtures__/record-for-exports.json' assert { type: 'json' }

describe('OcaciaExporter', () => {
  test('list by features', () => {
    const exporter = new Exporter({
      featureCollection: record.parcelles,
      operator: record.operator,
      record: record
    })

    const expectation = [
      [
        'Commune',
        'Ilot',
        'Culture',
        'N° Cadastre',
        'Variété / infos',
        'C0',
        'AB',
        'C1',
        'C2',
        'C3',
        'Date conv',
        'Observation',
        'Précédent',
        'Anté précédent',
        'Produit',
        'Date',
        'Code culture',
        'Id. CartoBio'
      ],
      [
        '',
        '',
        'Luzerne',
        '',
        '',
        '',
        '',
        1.0464881572673355,
        '',
        '',
        new Date('2023-01-01T00:00:00.000Z'),
        '',
        '',
        '',
        '',
        '',
        '01.19.10.8',
        '1'
      ],
      [
        '',
        '',
        'Luzerne',
        '',
        '',
        '',
        '',
        1.0464881572673355,
        '',
        '',
        new Date('2023-01-01T00:00:00.000Z'),
        '',
        '',
        '',
        '',
        '',
        '01.19.10.8',
        '2'
      ],
      [
        '',
        '',
        'Luzerne',
        '',
        ' / 01.19.10.7 Trèfle, 4 feuilles, semis le 01/03/2023',
        '',
        1.0464881572673355,
        '',
        '',
        '',
        new Date('2021-01-01T00:00:00.000Z'),
        '',
        '',
        '',
        '',
        '',
        '01.19.10.8',
        '3'
      ],
      [
        '',
        '',
        'Trèfle',
        '',
        '4 feuilles, semis le 01/03/2023',
        '',
        1.0464881572673355,
        '',
        '',
        '',
        new Date('2015-01-01T00:00:00.000Z'),
        '',
        '',
        '',
        '',
        '',
        '01.19.10.7',
        '4'
      ],
      [
        '',
        '',
        '[ERREUR] culture inconnue',
        '',
        '01.19.99 Culture inconnue',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '5'
      ]
    ]

    expect(exporter.toJSON()).toEqual(expectation)
  })
})
