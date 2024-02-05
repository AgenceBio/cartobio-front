import { describe, test, expect, vi } from 'vitest'
import { usePermissions } from '@/stores/index.js'
import { createTestingPinia } from "@pinia/testing"

import Exporter from './OcaciaExporter.js'
import record from '@/components/Features/__fixtures__/record-for-exports.json' assert { type: 'json' }

const pinia = createTestingPinia({ createSpy: vi.fn })
const permissions = usePermissions(pinia)
permissions.isOc = true

describe('OcaciaExporter', () => {
  test('list by features', () => {
    const exporter = new Exporter({
      featureCollection: record.parcelles,
      operator: record.operator,
      record: record,
      permissions
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
        'Id. Parcelle'
      ],
      [
        '',
        '1.1',
        'Luzerne',
        '',
        '',
        '',
        '',
        1.0464881572673355,
        '',
        '',
        new Date('2023-01-01T00:00:00.000Z'),
        'Visitée',
        '',
        '',
        '',
        '',
        '01.19.10.8',
        '1'
      ],
      [
        '',
        '1.2',
        'Luzerne',
        '',
        '',
        '',
        '',
        1.0464881572673355,
        '',
        '',
        new Date('2023-01-01T00:00:00.000Z'),
        'Prélèvement effectué, À risque',
        '',
        '',
        '',
        '',
        '01.19.10.8',
        '2'
      ],
      [
        '',
        '2.1',
        'Luzerne',
        '',
        '01.19.10.7 Trèfle, 4 feuilles',
        '',
        1.0464881572673355,
        '',
        '',
        '',
        new Date('2021-01-01T00:00:00.000Z'),
        '01.19.10.7 Trèfle, semis le 01/03/2023, Réduction de conversion (Dérogation acceptée)',
        '',
        '',
        '',
        '',
        '01.19.10.8',
        '3'
      ],
      [
        '',
        '2.2',
        'Trèfle',
        '',
        '4 feuilles',
        '',
        1.0464881572673355,
        '',
        '',
        '',
        new Date('2015-01-01T00:00:00.000Z'),
        'semis le 01/03/2023',
        '',
        '',
        '',
        '',
        '01.19.10.7',
        '4'
      ],
      [
        '',
        '3.1',
        '[ERREUR] culture inconnue (01.19.99)',
        '',
        '01.19.99 Culture inconnue',
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
        '',
        '5'
      ]
    ]

    expect(exporter.toJSON()).toEqual(expectation)
  })
})
