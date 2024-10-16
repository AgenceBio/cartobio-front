import { utils } from "xlsx";
import { getAnnotationLabel } from "../../referentiels/ab.js";
import { cultureLabel, featureName, sortByAccessor } from "@/utils/features.js";

/**
 * @typedef {import('@agencebio/cartobio-types').CartoBioFeatureCollection} FeatureCollection
 * @typedef {import('@agencebio/cartobio-types').AgenceBioNormalizedOperator} AgenceBioNormalizedOperator
 * @typedef {import('@agencebio/cartobio-types').NormalizedRecord} NormalizedRecord
 */

const { sheet_to_csv, sheet_to_json, json_to_sheet } = utils;

export default class BaseExporter {
  label = "";
  extension = "";
  mimetype = "";
  range = null;

  /**
   * @param {{ featureCollection: FeatureCollection, operator: AgenceBioNormalizedOperator, record: NormalizedRecord, permissions }} params
   */
  constructor({ featureCollection, operator, record, permissions }) {
    this.featureCollection = featureCollection;
    this.operator = operator;
    this.record = record;
    this.permissions = permissions;
  }

  getSortedFeatures() {
    return [...this.featureCollection.features].sort(
      sortByAccessor((f) => {
        return featureName(f, {
          ilotLabel: "",
          parcelleLabel: "",
          separator: ".",
        });
      }),
    );
  }

  toJSON() {
    const ws = this.getSheet();
    return sheet_to_json(ws, {
      blankrows: false,
      defval: "",
      header: 1,
      range: this.range ?? ws["!ref"],
    });
  }

  toCSV() {
    const json = this.toJSON();
    const header = json.at(0);
    const data = json.slice(1).map((row) => {
      return row.reduce(
        (obj, value, index) => ({
          ...obj,
          [header.at(index)]: value,
        }),
        {},
      );
    });

    const sheet = json_to_sheet(data, { header });
    return sheet_to_csv(sheet, { FS: "\t" });
  }

  async toClipboard() {
    const data = this.toCSV();

    return navigator.clipboard.writeText(data);
  }
}

/**
 *
 * @param {Feature[]} features
 * @returns {String}
 */
export function generateAutresInfos(
  features,
  {
    withAnnotations = false,
    withCode = true,
    withCulture = true,
    withDate = true,
    withExplicitName = false,
    withName = true,
    withNotes = true,
    withSurface = true,
    withVariete = true,
    pivot = null,
    initialCulture,
    permissions = {},
  } = {},
) {
  const dateFmnt = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });

  const aggregateAnnotations = (annotations) => annotations.map(getAnnotationLabel).join(", ");
  const dropEmptyItem = (d) => d;

  return features
    .map((feature) => {
      const name = withName
        ? featureName(feature, {
            ilotLabel: "",
            parcelleLabel: "",
            separator: ".",
            placeholder: "",
            explicitName: withExplicitName,
          })
        : withExplicitName
          ? (feature.properties.NOM ?? "")
          : "";
      const notes = withNotes ? feature.properties.auditeur_notes : "";
      const annotations =
        withAnnotations && permissions.canExportAnnotations && Array.isArray(feature.properties.annotations)
          ? aggregateAnnotations(feature.properties.annotations)
          : "";

      const cultures = feature.properties.cultures
        // refine on a given culture, or use everything
        // useful when we display cells in combination with `getFeatureGroups()`
        // as we don't want to repeat the comment in all the 'comment' cells
        .filter(({ CPF }) => (pivot ? CPF === pivot : true))
        .map((c) =>
          [
            // if we refine on a given culture, we certainly have a cell with its label
            // so we don't make it redundant
            pivot || initialCulture === c.CPF || !withCulture ? "" : cultureLabel(c, { withCode }),
            withVariete && c.variete ? c.variete : "",
            withDate && c.date_semis ? `semis le ${dateFmnt.format(new Date(c.date_semis))}` : "",
            withSurface && c.surface ? `${c.surface}ha` : "",
          ]
            .filter(dropEmptyItem)
            .join(", "),
        )
        .filter(dropEmptyItem)
        .join(" / ");

      return [name, cultures, notes, annotations].filter(dropEmptyItem).join(", ");
    })
    .filter(dropEmptyItem)
    .join(" ; ");
}
