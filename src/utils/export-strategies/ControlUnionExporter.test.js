import { describe, test, expect, vi } from "vitest";
import { usePermissions } from "@/stores/permissions.js";
import { createTestingPinia } from "@pinia/testing";

import Exporter from "./ControlUnionExporter.js";
import record from "@/utils/__fixtures__/record-for-exports.json" assert { type: "json" };

const pinia = createTestingPinia({ createSpy: vi.fn });
const permissions = usePermissions(pinia);
permissions.isOc = true;

describe("ControlUnionExporter", () => {
  test("list by features", () => {
    const exporter = new Exporter({
      featureCollection: record.parcelles,
      operator: record.operator,
      record: record,
      permissions,
    });

    const expectation = [
      [
        "Identification (références cadastrales)",
        "Production",
        "Quantité",
        "Date de début de conversion",
        "Niveau de la parcelle au jour de l'audit (C1/C2/C3/AB)",
        "Autres infos",
        "Id. Parcelle",
        "Code culture",
      ],
      [
        "",
        "Luzerne",
        0.753054443359375,
        new Date("2023-01-01T00:00:00.000Z"),
        "C1",
        "1.1 (nom personnalisé), Visitée",
        "1",
        "01.19.10.8",
      ],
      [
        "",
        "Luzerne",
        0.753054443359375,
        new Date("2023-01-01T00:00:00.000Z"),
        "C1",
        "1.2, Prélèvement effectué, À risque",
        "2",
        "01.19.10.8",
      ],
      [
        "",
        "Luzerne",
        0.753054443359375,
        new Date("2021-01-01T00:00:00.000Z"),
        "AB",
        "2.1, 0.70ha / 01.19.10.7 Trèfle, 4 feuilles, semis le 01/03/2023, 0.30ha, Réduction de conversion (Dérogation acceptée)",
        "3",
        "01.19.10.8",
      ],
      [
        "",
        "Trèfle",
        0.753054443359375,
        new Date("2015-01-01T00:00:00.000Z"),
        "AB",
        "2.2, 4 feuilles, semis le 01/03/2023",
        "4",
        "01.19.10.7",
      ],
      [
        "",
        "[ERREUR] culture inconnue (01.19.99)",
        0.753054443359375,
        "",
        "",
        "3.1, 01.19.99 Culture inconnue",
        "5",
        "",
      ],
      ["", "[ERREUR] culture absente", 0.753054443359375, "", "", "4.1", "6", ""],
    ];

    expect(exporter.toJSON()).toEqual(expectation);
  });
});
