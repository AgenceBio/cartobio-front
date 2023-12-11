import { describe, test, expect, vi } from 'vitest'
import { usePermissions } from '@/stores/index.js'
import { createTestingPinia } from "@pinia/testing"

import Exporter from './DefaultExporter.js'
import record from '@/components/Features/__fixtures__/record-for-exports.json' assert { type: 'json' }

const pinia = createTestingPinia({ createSpy: vi.fn })
const permissions = usePermissions(pinia)
permissions.isOc = true

describe('DefaultExporter', () => {
  const headers = [
    "Identifiant CartoBio",
    "N°Ilot",
    "N°Parcelle",
    "Surfaces graphique (ha)",
    "Code culture",
    "Libellé culture",
    "PACAGE",
    "Niveau de conversion",
    "Date de conversion",
    "Pac / Hors Pac / Cueillette",
    "Commentaire agriculteur",
    "Notes d'audit"
  ]

  test('list by features', () => {
    const exporter = new Exporter({
      featureCollection: record.parcelles,
      operator: record.operator,
      record: record,
      permissions
    })

    const expectation = [
      headers,
      [
        '1',
        '1',
        '1',
        1.0464881572673355,
        '01.19.10.8',
        'Luzerne',
        '',
        'C1',
        new Date('2023-01-01T00:00:00.000Z'),
        '',
        'Visitée',
        ''
      ],
      [
        '2',
        '1',
        '2',
        1.0464881572673355,
        '01.19.10.8',
        'Luzerne',
        '',
        'C1',
        new Date('2023-01-01T00:00:00.000Z'),
        '',
        'Prélèvement effectué, À risque',
        ''
      ],
      [
        '3',
        '2',
        '1',
        1.0464881572673355,
        '01.19.10.8',
        'Luzerne',
        '',
        'AB',
        new Date('2021-01-01T00:00:00.000Z'),
        '',
        '01.19.10.7 Trèfle, 4 feuilles, semis le 01/03/2023, Réduction de conversion (Dérogation acceptée)',
        ''
      ],
      [
        '4',
        '2',
        '2',
        1.0464881572673355,
        '01.19.10.7',
        'Trèfle',
        '',
        'AB',
        new Date('2015-01-01T00:00:00.000Z'),
        '',
        '4 feuilles, semis le 01/03/2023',
        ''
      ],
      [
        '5',
        '3',
        '1',
        1.0464881572673355,
        '01.19.99',
        '',
        '',
        '',
        '',
        '',
        '',
        ''
      ]
    ]

    expect(exporter.toJSON()).toEqual(expectation)
  })

  test('toCSV()', () => {
    const exporter = new Exporter({
      featureCollection: record.parcelles,
      operator: record.operator,
      record: record,
      permissions
    })

    expect(exporter.toCSV()).toMatch(`${headers.join('\t')}\n1\t1\t1`)
  })

  test.skip('toClipboard()', async () => {
    const exporter = new Exporter({
      featureCollection: record.parcelles,
      operator: record.operator,
      record: record,
      permissions
    })

    await exporter.toClipboard()
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(exporter.toCSV())
  })
})
