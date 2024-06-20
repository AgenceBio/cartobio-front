import { describe, test, expect, vi } from 'vitest'
import { usePermissions } from '@/stores/permissions.js'
import { createTestingPinia } from "@pinia/testing"
import Exporter from './CertipaqExporter.js'
import record from '@/utils/__fixtures__/record-for-exports.json' assert { type: 'json' }

const pinia = createTestingPinia({ createSpy: vi.fn })
const permissions = usePermissions(pinia)
permissions.isOc = true

describe('CertipaqExporter', () => {
  test('list by features', () => {
    const exporter = new Exporter({
      featureCollection: record.parcelles,
      operator: record.operator,
      record: record,
      permissions
    })

    const expectation = [
      [
        "Commune",
        "Ilot",
        "Culture",
        "Variété / infos",
        "C0",
        "AB",
        "C1",
        "C2",
        "C3",
        "Date conv",
        "Observation / date de semis",
        "Précédent",
        "Anté précédent",
        "Produit",
        "Date",
        "Id. Parcelle",
        "Code culture"
      ],
      [
        '',
        '1_1',
        'Luzerne',
        'nom personnalisé',
        '',
        '',
        '0,75',
        '',
        '',
        new Date('2023-01-01T00:00:00.000Z'),
        'Visitée',
        '',
        '',
        '',
        '',
        '1',
        '01.19.10.8'
      ],
      [
        '',
        '1_2',
        'Luzerne',
        '',
        '',
        '',
        '0,75',
        '',
        '',
        new Date('2023-01-01T00:00:00.000Z'),
        'Prélèvement effectué, À risque',
        '',
        '',
        '',
        '',
        '2',
        '01.19.10.8'
      ],
      [
        '',
        '2_1',
        'Luzerne',
        'Trèfle, 4 feuilles',
        '',
        '0,75',
        '',
        '',
        '',
        new Date('2021-01-01T00:00:00.000Z'),
        '0.70ha / 01.19.10.7 Trèfle, semis le 01/03/2023, 0.30ha, Réduction de conversion (Dérogation acceptée)',
        '',
        '',
        '',
        '',
        '3',
        '01.19.10.8'
      ],
      [
        '',
        '2_2',
        'Trèfle',
        '4 feuilles',
        '',
        '0,75',
        '',
        '',
        '',
        new Date('2015-01-01T00:00:00.000Z'),
        'semis le 01/03/2023',
        '',
        '',
        '',
        '',
        '4',
        '01.19.10.7'
      ],
      [
        '',
        '3_1',
        '[ERREUR] culture inconnue (01.19.99)',
        'Culture inconnue',
        '',
        '',
        '',
        '',
        '',
        '',
        '01.19.99 Culture inconnue',
        '',
        '',
        '',
        '',
        '5',
        ''
      ],
      [
        '',
        '4_1',
        '[ERREUR] culture absente',
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
        '6',
        ''
      ]
    ]

    expect(exporter.toJSON()).toEqual(expectation)
  })
})
