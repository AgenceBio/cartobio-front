import { utils, write } from "xlsx";
import { fromCodeCpf } from "@agencebio/rosetta-cultures";
import { certificationStatesLabels, yearLabel } from "@/referentiels/ab.js";

import BaseExporter, { generateAutresInfos } from "@/utils/export-strategies/BaseExporter.js";
import { featureName, getFeatureGroups, GROUPE_NIVEAU_CONVERSION, legalProjectionSurface } from "@/utils/features.js";

const { aoa_to_sheet, sheet_add_aoa, book_append_sheet, book_new } = utils;
const { decode_range: R } = utils;

function getSheet() {
  const { featureCollection, operator, permissions, record } = this;
  const adresse = `${operator.codePostal} ${operator.commune}`.trim();
  const annee = yearLabel(record);
  const statut = certificationStatesLabels[record.certification_state].label;

  const sheet = aoa_to_sheet([
    [
      operator.nom,
      adresse,
      statut,
      annee,
      "",
      "Surfaces en ha",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "Dernier intrant non autorisé en AB",
      "",
      "",
      "",
    ],
    ["", "", "", "", "", "0", "0", "0", "0", "0", "", "", "", "", "", "", "", ""],
    [
      "Commune",
      "Ilot",
      "Culture",
      "N° Cadastre",
      "Variété / infos",
      "C0",
      "AB",
      "C1",
      "C2",
      "C3",
      "Date conv",
      "Observation",
      "Précédent",
      "Anté précédent",
      "Produit",
      "Date",
      "Code culture",
      "Id. Parcelle",
    ],
  ]);

  sheet["!merges"] = [R("F1:H1"), R("O1:P2")];

  sheet["!cols"] = [
    // Commune
    { wch: 16 },
    // Ilot
    { wch: 12 },
    // Culture
    { wch: 40 },
    // N° Cadastre
    { wch: 16 },
    // Variété/infos
    { wch: 16 },
    // C0 - AB - C1 - C2 - C3
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    // Date Conv
    { wch: 12 },
    // Observation
    { wch: 40 },
    // Précédent - Anté précédent
    { wch: 10 },
    { wch: 10 },
    // Produit - Date
    { wch: 10 },
    { wch: 10 },
    // Id. Parcelle
    { wch: 16 },
  ];

  sheet_add_aoa(
    sheet,
    this.getSortedFeatures().map((feature) => {
      const { id, geometry, properties: props } = feature;
      const surfaceHa = legalProjectionSurface(feature) / 10_000;
      const culture = props.cultures.at(0)
        ? fromCodeCpf(props.cultures.at(0)?.CPF)
        : { libelle_code_cpf: "[ERREUR] culture absente" };

      return [
        // Commune
        props.COMMUNE_LABEL,
        // Ilot
        featureName(
          { properties: props },
          { explicitName: false, ilotLabel: "", parcelleLabel: "", separator: ".", placeholder: "" },
        ),
        // Culture
        culture?.libelle_code_cpf ?? `[ERREUR] culture inconnue (${props.cultures.at(0)?.CPF})`,
        // N° Cadastre
        props.cadastre,
        // Variété / infos
        generateAutresInfos([{ id, geometry, properties: props }], {
          withDate: false,
          withExplicitName: false,
          withName: false,
          withNotes: false,
          withSurface: false,
          withVariete: true,
          initialCulture: culture?.code_cpf,
        }),
        // C0 - AB - C1 - C2 - C3
        props.conversion_niveau === "CONV" ? surfaceHa : "",
        props.conversion_niveau === "AB" ? surfaceHa : "",
        props.conversion_niveau === "C1" ? surfaceHa : "",
        props.conversion_niveau === "C2" ? surfaceHa : "",
        props.conversion_niveau === "C3" ? surfaceHa : "",
        // Date conv #K
        props.engagement_date ? new Date(props.engagement_date) : "",
        // Observation / date de semis
        generateAutresInfos([{ id, geometry, properties: props }], {
          withAnnotations: true,
          withDate: true,
          withExplicitName: true,
          withName: false,
          withNotes: true,
          withSurface: true,
          withVariete: false,
          initialCulture: culture?.code_cpf,
          permissions,
        }),
        // Précédent
        "",
        // Anté précédent
        "",
        // Produit
        "",
        // Date
        "",
        // Code culture (CPF) #Q
        culture?.code_cpf,
        // Id. Parcelle #R
        String(props.id),
      ];
    }),
    { origin: "A4", cellDates: true },
  );

  // Formattage des cellules, s'il y a une valeur
  featureCollection.features.forEach((feature, index) => {
    const rowIndex = index + 4;

    ["F", "G", "H", "I", "J"]
      .filter((col) => sheet[`${col}${rowIndex}`].v !== "")
      .forEach((col) => (sheet[`${col}${rowIndex}`].w = sheet[`${col}${rowIndex}`].v.toString().replace(".", ",")));

    if (sheet[`K${rowIndex}`].v) {
      sheet[`K${rowIndex}`].t = "d";
      sheet[`K${rowIndex}`].z = "dd/mm/yyyy";
    }

    // the id is always displayed as a string
    sheet[`R${rowIndex}`].t = "s";
  });

  // totals
  const groups = Object.fromEntries(
    getFeatureGroups(featureCollection, GROUPE_NIVEAU_CONVERSION).map(({ key, features }) => [
      key,
      legalProjectionSurface(features) / 10_000,
    ]),
  );

  sheet_add_aoa(
    sheet,
    [
      [
        groups.CONV?.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) ?? 0,
        groups.AB?.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) ?? 0,
        groups.C1?.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) ?? 0,
        groups.C2?.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) ?? 0,
        groups.C3?.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) ?? 0,
      ],
    ],
    { origin: "F2" },
  );

  sheet["I1"].v = (legalProjectionSurface(featureCollection) / 10_000)?.toLocaleString("fr-FR", {
    maximumFractionDigits: 2,
  });

  return sheet;
}

class OcaciaExporter extends BaseExporter {
  label = "Tableur";
  extension = "xlsx";
  mimetype = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  range = "A3:R999";

  getSheet = getSheet;

  toFileData() {
    const sheet = this.getSheet();
    const workbook = book_new();
    book_append_sheet(workbook, sheet, "Parcellaire");

    return new Blob([write(workbook, { bookType: this.extension, type: "array" })], { type: this.mimetype });
  }
}

export default OcaciaExporter;
