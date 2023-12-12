import { describe, test, expect, vi } from 'vitest'
import { usePermissions } from '@/stores/index.js'
import { createTestingPinia } from "@pinia/testing"
import Exporter from './CertisExporter.js'
import record from '@/components/Features/__fixtures__/record-for-exports.json' assert { type: 'json' }

const pinia = createTestingPinia({ createSpy: vi.fn })
const permissions = usePermissions(pinia)
permissions.isOc = true

describe('CertisExporter', () => {
  test('list by features', () => {
    const exporter = new Exporter({
      featureCollection: record.parcelles,
      operator: record.operator,
      record: record,
      permissions
    })

    const expectation = [
      [
        "Nom de la parcelle",
        "Ilot",
        "N° parcelle",
        "Surface graphique (ha)",
        "Date de début de conversion",
        "Précédent\n(année n-1)",
        "Type de culture",
        "Liste secondaire",
        "Espèces implantées",
        "Degré de conversion de la parcelle/ilot",
        "Date de semis/implantation",
        "Semence C2/Bio/Conv",
        "Date de dérogation\n(NA si non applicable)",
        "Conformité ?",
        "Type/Nature des ferti/amendements/effluents",
        "Conformité ?",
        "Type/Nature des traitements phytos",
        "Conformité ?",
        "Rendement\n(qté/ha)",
        "Rendement cohérent",
        "Récolte gardée pour semence fermière",
        "Culture prévue",
        "Justificatif (facture d\'achat ou semences fermières) vu lors de l\'audit ?",
        "Commentaire sur cet ilot/parcelle",
        "Id. Parcelle"
      ],
      [
        '',
        '1',
        '1',
        1.0464881572673355,
        new Date('2023-01-01T00:00:00.000Z'),
        '',
        '01.19.10.8',
        'Luzerne',
        '',
        'C1',
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
        '',
        'Visitée',
        '1'
      ],
      [
        '',
        '1',
        '2',
        1.0464881572673355,
        new Date('2023-01-01T00:00:00.000Z'),
        '',
        '01.19.10.8',
        'Luzerne',
        '',
        'C1',
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
        '',
        'Prélèvement effectué, À risque',
        '2'
      ],
      [
        '',
        '2',
        '1',
        1.0464881572673355,
        new Date('2021-01-01T00:00:00.000Z'),
        '',
        '01.19.10.8',
        'Luzerne',
        '01.19.10.7 Trèfle, 4 feuilles',
        'AB',
        '01.19.10.7 Trèfle, semis le 01/03/2023',
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
        'Réduction de conversion (Dérogation acceptée)',
        '3'
      ],
      [
        '',
        '2',
        '2',
        1.0464881572673355,
        new Date('2015-01-01T00:00:00.000Z'),
        '',
        '01.19.10.7',
        'Trèfle',
        '4 feuilles',
        'AB',
        'semis le 01/03/2023',
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
        '',
        '4'
      ],
      [
        '',
        '3',
        '1',
        1.0464881572673355,
        '',
        '',
        '[ERREUR] culture inconnue',
        '',
        '01.19.99 Culture inconnue',
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
        '',
        '5'
      ]
    ]

    expect(exporter.toJSON()).toEqual(expectation)
  })
})