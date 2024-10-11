import { CertificationState } from "@agencebio/cartobio-types";

export const LEVEL_UNKNOWN = undefined;
export const LEVEL_CONVENTIONAL = "CONV";
export const LEVEL_C1 = "C1";
export const LEVEL_C2 = "C2";
export const LEVEL_C3 = "C3";
export const LEVEL_AB = "AB";
export const LEVEL_MAYBE_AB = "AB?";

export const certificationStatesLabels = {
  [undefined]: {
    label: "Non renseigné",
    color: "fr-badge--warning",
  },
  [CertificationState.OPERATOR_DRAFT]: {
    label: "Parcellaire importé",
    color: "fr-badge--info",
  },
  [CertificationState.AUDITED]: {
    label: "Audit terminé",
    color: "fr-badge--new",
  },
  [CertificationState.PENDING_CERTIFICATION]: {
    label: "Certification en cours",
    color: "fr-badge--new",
  },
  [CertificationState.CERTIFIED]: {
    label: "Certifié",
    color: "fr-badge--success",
  },
};

/**
 * @param {CertificationState} state
 * @returns {Boolean}
 */
export function isCertificationImmutable(state) {
  return [CertificationState.PENDING_CERTIFICATION, CertificationState.CERTIFIED].includes(state);
}

export const conversionLevels = [
  {
    value: LEVEL_UNKNOWN,
    label: "Niveau de conversion inconnu",
    shortLabel: "Inconnue",
  },
  {
    value: LEVEL_CONVENTIONAL,
    label: "Conventionnel",
    shortLabel: "Conventionnel",
    is_selectable: true,
  },
  {
    value: LEVEL_MAYBE_AB,
    label: "AB — niveau de conversion à préciser",
    shortLabel: "AB",
  },
  {
    value: LEVEL_C1,
    label: "C1 — Première année de conversion",
    shortLabel: "C1",
    is_selectable: true,
  },
  {
    value: LEVEL_C2,
    label: "C2 — Deuxième année de conversion",
    shortLabel: "C2",
    is_selectable: true,
  },
  {
    value: LEVEL_C3,
    label: "C3 — Troisième année de conversion",
    shortLabel: "C3",
    is_selectable: true,
  },
  {
    value: LEVEL_AB,
    label: "AB — Agriculture biologique",
    shortLabel: "AB",
    is_selectable: true,
  },
];

export const userFacingConversionLevels = conversionLevels.filter(({ is_selectable }) => is_selectable);

export function getConversionLevel(level) {
  return conversionLevels.find(({ value }) => value === level) ?? getConversionLevel(LEVEL_UNKNOWN);
}

export function isABLevel(level) {
  return ABLevels.includes(level);
}

export const ABLevels = [LEVEL_C1, LEVEL_C2, LEVEL_C3, LEVEL_AB];

/**
 * @enum {String}
 */
export const ANNOTATIONS = {
  DOWNGRADED: "downgraded",
  // v metadata keys
  METADATA_STATE: "state",
  // NEWLY_ADDED: 'newly-added',
  REDUCED_CONVERSION_PERIOD: "reduction-conversion",
  RISKY: "risky",
  SAMPLED: "sampled",
  // SOWED: 'sowed',
  SURVEYED: "surveyed",
};

/**
 * @enum {String}
 */
export const CERTIFICATION_BODY_DECISION = {
  PENDING: "",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
};

/**
 * @typedef {Object} UserAnnotation
 * @property {String} id
 * @property {ANNOTATIONS} code
 * @property {String} date
 * @property {Object.<ANNOTATIONS,String>=} metadata
 */

/**
 * @typedef {Object} AnnotationConfiguration
 * @property {(): Boolean} featured
 * @property {String} label
 * @property {Object.<ANNOTATIONS, AnnotationConfiguration>} metadata
 */

/**
 * @type {Object.<ANNOTATIONS, AnnotationConfiguration>}
 */
export const AnnotationTags = {
  [ANNOTATIONS.REDUCED_CONVERSION_PERIOD]: {
    featured: () => true,
    label: "Réduction de conversion",
    metadata: {
      [ANNOTATIONS.METADATA_STATE]: {
        [CERTIFICATION_BODY_DECISION.PENDING]: {
          label: "En cours de traitement",
        },
        [CERTIFICATION_BODY_DECISION.ACCEPTED]: {
          label: "Dérogation acceptée",
        },
        [CERTIFICATION_BODY_DECISION.REJECTED]: {
          label: "Dérogation refusée",
        },
      },
    },
  },
  [ANNOTATIONS.DOWNGRADED]: {
    featured: () => true,
    label: "Déclassement",
    metadata: {
      [ANNOTATIONS.METADATA_STATE]: {
        [CERTIFICATION_BODY_DECISION.PENDING]: {
          label: "En cours de traitement",
        },
        [CERTIFICATION_BODY_DECISION.ACCEPTED]: {
          label: "Déclassement approuvé",
        },
        [CERTIFICATION_BODY_DECISION.REJECTED]: {
          label: "Déclassement refusé",
        },
      },
    },
  },
  [ANNOTATIONS.RISKY]: {
    featured: () => true,
    label: "À risque",
  },
  [ANNOTATIONS.SAMPLED]: {
    featured: () => true,
    label: "Prélèvement effectué",
  },
  [ANNOTATIONS.SURVEYED]: {
    featured: () => true,
    label: "Visitée",
  },
};

/**
 * Return the label of an annotation.
 * Also works with its 'state' metadata (suffixed)
 * @param {UserAnnotation} annotation
 * @returns {String}
 */
export function getAnnotationLabel({ code, metadata }) {
  let text = AnnotationTags[code].label;
  const state = (metadata ?? {})[ANNOTATIONS.METADATA_STATE];

  if (state) {
    text += ` (${AnnotationTags[code].metadata[ANNOTATIONS.METADATA_STATE][state].label})`;
  }

  return text;
}

export function yearLabel(record) {
  const date = record.certification_date_debut ?? record.audit_date ?? null;
  if (!date) return "";

  return new Date(date).toLocaleDateString("fr-FR", { year: "numeric" });
}

export const certificationDateFin = {
  /**
   * It's the standard rule.
   *
   * @param {Date} date
   * @returns {string}
   */
  MoisPlusDixHuit(date) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 18);
    return d;
  },
  /**
   * It's a more commonly practiced rule.
   *
   * @param {Date} date
   * @returns {string}
   */
  AnneePlusDeux(date) {
    const d = new Date(date);
    d.setMonth(2); /* first, set the month march */
    d.setDate(31); /* then we can set the day */
    d.setUTCFullYear(d.getUTCFullYear() + 2);
    return d;
  },
};
