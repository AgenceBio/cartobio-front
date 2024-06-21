import { describe, test, expect, vi } from 'vitest'
import { usePermissions } from '@/stores/permissions.js'
import { createTestingPinia } from "@pinia/testing"

import Exporter from './CertisudExporter.js'
import record from '@/utils/__fixtures__/record-for-exports.json' assert { type: 'json' }

const pinia = createTestingPinia({ createSpy: vi.fn })
const permissions = usePermissions(pinia)
permissions.isOc = true

describe('CertisudExporter', () => {
  test('groups features by CULTURE, ENGAGEMENT and DATE', () => {
    const exporter = new Exporter({
      featureCollection: record.parcelles,
      operator: record.operator,
      record: record,
      permissions
    })

    const expectation = [
      [
        'Cultures en place lors du contrôle',
        'Surfaces déclarées',
        'Autres infos (ilot.parcelle, semis, etc.)',
        'Classement proposé',
        'Depuis',
        'Id. Parcelles'
      ],
      [
        '[ERREUR] culture absente',
        0.753054443359375,
        '4.1',
        '',
        '',
        '6'
      ],
      [
        '[ERREUR] culture inconnue (01.19.99)',
        0.753054443359375,
        '3.1',
        '',
        '',
        '5'
      ],
      [
        'Luzerne',
        // expect.closeTo(2.1), // in vite@5 + vitest@1
        1.50610888671875,
        '1.1 (nom personnalisé), Visitée ; 1.2, Prélèvement effectué, À risque',
        'C1',
        new Date('2023-01-01T00:00:00.000Z'),
        '1,2'
      ],
      [
        'Luzerne',
        // expect.closeTo(1.0), // in vite@5 + vitest@1
        0.753054443359375,
        '2.1, 0.70ha, Réduction de conversion (Dérogation acceptée)',
        'AB',
        new Date('2021-01-01T00:00:00.000Z'),
        '3'
      ],
      [
        'Trèfle',
        // expect.closeTo(1.0), // in vite@5 + vitest@1
        0.753054443359375,
        '2.1, 4 feuilles, semis le 01/03/2023, 0.30ha, Réduction de conversion (Dérogation acceptée)',
        'AB',
        new Date('2021-01-01T00:00:00.000Z'),
        '3'
      ],
      [
        'Trèfle',
        // expect.closeTo(1.0), // in vite@5 + vitest@1
        0.753054443359375,
        '2.2, 4 feuilles, semis le 01/03/2023',
        'AB',
        new Date('2015-01-01T00:00:00.000Z'),
        '4'
      ]
    ]

    expect(exporter.toJSON()).toEqual(expectation)
  })
})
