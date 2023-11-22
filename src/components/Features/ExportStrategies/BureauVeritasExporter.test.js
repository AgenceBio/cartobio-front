import { describe, test, expect, vi } from 'vitest'
import { usePermissions } from '@/stores/index.js'
import { createTestingPinia } from "@pinia/testing"
import Exporter from './BureauVeritasExporter.js'
import record from '@/components/Features/__fixtures__/record-for-exports.json' assert { type: 'json' }

const pinia = createTestingPinia({ createSpy: vi.fn })
const permissions = usePermissions(pinia)
permissions.isOc = true

describe('BureauVeritasExporter', () => {
  test('list by features', () => {
    const exporter = new Exporter({
      featureCollection: record.parcelles,
      operator: record.operator,
      record: record,
      permissions
    })

    const expectation = [
      [
        "SITE ID de l'opérateur",
        "Numéro PACAGE",
        "Numéro Bio",
        "Statut Cartobio",
        "Id Parcelle",
        "Numéro Ilôt",
        "Numéro Parcelle",
        "BIO",
        "Classement",
        "Date de conversion",
        "Auditeur_note / Autres infos",
        "Code CPF",
        "Code Produit",
        "Catégorie",
        "Produit",
        "Surface",
        "Variété / Complément certificat",
        "Date de semis"
      ],
      [
        '27B/6',
        '',
        1,
        'Certifié',
        '1',
        '1',
        '1',
        1,
        'C1',
        new Date('2023-01-01T00:00:00.000Z'),
        'Visitée',
        '01.19.10.8',
        '1125',
        'Surfaces fourragères',
        'Luzerne',
        1.0464881572673355,
        '',
        ''
      ],
      [
        '27B/6',
        '',
        1,
        'Certifié',
        '2',
        '1',
        '2',
        1,
        'C1',
        new Date('2023-01-01T00:00:00.000Z'),
        'Prélèvement effectué, À risque',
        '01.19.10.8',
        '1125',
        'Surfaces fourragères',
        'Luzerne',
        1.0464881572673355,
        '',
        ''
      ],
      [
        '27B/6',
        '',
        1,
        'Certifié',
        '3',
        '2',
        '1',
        1,
        'AB',
        new Date('2021-01-01T00:00:00.000Z'),
        '01.19.10.7 Trèfle, Réduction de conversion (Dérogation acceptée)',
        '01.19.10.8',
        '1125',
        'Surfaces fourragères',
        'Luzerne',
        1.0464881572673355,
        '01.19.10.7 Trèfle, 4 feuilles',
        '01.19.10.7 Trèfle, semis le 01/03/2023'
      ],
      [
        '27B/6',
        '',
        1,
        'Certifié',
        '4',
        '2',
        '2',
        1,
        'AB',
        new Date('2015-01-01T00:00:00.000Z'),
        '',
        '01.19.10.7',
        '1124',
        'Surfaces fourragères',
        'Trèfle',
        1.0464881572673355,
        '4 feuilles',
        'semis le 01/03/2023'
      ],
      [
        '27B/6',
        '',
        1,
        'Certifié',
        '5',
        '3',
        '1',
        0,
        '',
        '',
        '01.19.99 Culture inconnue',
        '',
        '',
        '',
        '[ERREUR] culture inconnue',
        1.0464881572673355,
        '01.19.99 Culture inconnue',
        '01.19.99 Culture inconnue'
      ]
    ]

    expect(exporter.toJSON()).toEqual(expectation)
  })
})
