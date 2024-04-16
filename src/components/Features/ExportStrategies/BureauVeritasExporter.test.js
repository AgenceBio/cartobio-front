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
        "Catégorie",
        "Produit",
        "Code Produit",
        "Complément certificat",
        "Autres infos",
        "Surface",
        "Unité",
        "Classement",
        "Date conversion"
      ],
      [
        "27B/6",
        "",
        "[ERREUR] culture absente",
        "",
        "",
        "Ilots : 4.1",
        1.0464881572673355,
        "ha",
        "",
        "",
      ],
      [
        "PV",
        "",
        "[ERREUR] culture inconnue (01.19.99)",
        "",
        "",
        "Ilots : 3.1",
        1.0464881572673355,
        "ha",
        "",
        "",
      ],
      [
        "",
        "Surfaces fourragères",
        "Luzerne",
        "1125",
        "",
        "Ilots : 1.1 (nom personnalisé) ; 1.2",
        2.092976314534671,
        "ha",
        "C1",
        "2023-01-01",
      ],
      [
        "",
        "Surfaces fourragères",
        "Luzerne",
        "1125",
        "",
        "Ilots : 2.1, 0.70ha",
        1.0464881572673355,
        "ha",
        "AB",
        "2021-01-01",
      ],
      [
        "",
        "Surfaces fourragères",
        "Trèfle",
        "1124",
        "4 feuilles",
        "Ilots : 2.1, 4 feuilles, semis le 01/03/2023, 0.30ha",
        1.0464881572673355,
        "ha",
        "AB",
        "2021-01-01",
      ],
      [
        "",
        "Surfaces fourragères",
        "Trèfle",
        "1124",
        "4 feuilles",
        "Ilots : 2.2, 4 feuilles, semis le 01/03/2023",
        1.0464881572673355,
        "ha",
        "AB",
        "2015-01-01",
      ],
    ]

    expect(exporter.toJSON()).toEqual(expectation)
  })
})
