import { describe, test, expect, vi } from 'vitest'
import { usePermissions } from '@/stores/index.js'
import { createTestingPinia } from "@pinia/testing"

import Exporter from './QualisudExporter.js'
import record from '@/components/Features/__fixtures__/record-for-exports.json' assert { type: 'json' }

const pinia = createTestingPinia({ createSpy: vi.fn })
const permissions = usePermissions(pinia)
permissions.isOc = true

describe('QualisudExporter', () => {
  test('list by features', () => {
    const exporter = new Exporter({
      featureCollection: record.parcelles,
      operator: record.operator,
      record: record,
      permissions
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
        'Visitée',
        'ilot 1, parcelle 1',
        1.0464881572673355,
        'C1',
        new Date('2023-01-01T00:00:00.000Z'),
        '1'
      ],
      [
        '01.19.10.8',
        'Prélèvement effectué, À risque',
        'ilot 1, parcelle 2',
        1.0464881572673355,
        'C1',
        new Date('2023-01-01T00:00:00.000Z'),
        '2'
      ],
      [
        '01.19.10.8',
        '01.19.10.7 Trèfle, 4 feuilles, semis le 01/03/2023, Réduction de conversion (Dérogation acceptée)',
        'ilot 2, parcelle 1',
        1.0464881572673355,
        'AB',
        new Date('2021-01-01T00:00:00.000Z'),
        '3'
      ],
      [
        '01.19.10.7',
        '4 feuilles, semis le 01/03/2023',
        'ilot 2, parcelle 2',
        1.0464881572673355,
        'AB',
        new Date('2015-01-01T00:00:00.000Z'),
        '4'
      ],
      [
        '[ERREUR] culture inconnue',
        '01.19.99 Culture inconnue',
        'ilot 3, parcelle 1',
        1.0464881572673355,
        '',
        '',
        '5'
      ]
    ]

    expect(exporter.toJSON()).toEqual(expectation)
  })
})
