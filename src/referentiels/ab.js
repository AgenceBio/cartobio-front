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
    labelFilter: "Pas de parcellaire",
  },
  ["NONE"]: {
    label: "Non renseigné",
    labelFilter: "Pas de parcellaire",
  },

  [CertificationState.OPERATOR_DRAFT]: {
    label: "Parcellaire importé",
    color: "fr-badge--info",
    labelFilter: "En attente de contrôle",
  },
  [CertificationState.AUDITED]: {
    label: "Contrôle terminé",
    color: "fr-badge--new",
    labelFilter: "A soumettre",
  },
  [CertificationState.PENDING_CERTIFICATION]: {
    label: "En attente de certification",
    color: "fr-badge--new",
    labelFilter: "En attente de certification",
    icon: "fr-icon-time-line",
  },
  [CertificationState.CERTIFIED]: {
    label: "Certifié",
    color: "fr-badge--success",
    icon: "fr-icon-award-line",
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
    icon: "fr-icon-culture-legumes",
    labelSelector: "Conv.",
  },
  {
    value: LEVEL_MAYBE_AB,
    label: "AB — niveau de conversion à préciser",
    shortLabel: "AB",
  },
  {
    value: LEVEL_C1,
    label: "Première année de conversion",
    shortLabel: "C1",
    labelSelector: "C1",
    is_selectable: true,
    icon: "fr-icon-culture-grandes-cultures",
  },
  {
    value: LEVEL_C2,
    label: "Deuxième année de conversion",
    shortLabel: "C2",
    labelSelector: "C2",

    is_selectable: true,
    icon: "fr-icon-culture-fruits",
  },
  {
    value: LEVEL_C3,
    label: "Troisième année de conversion",
    shortLabel: "C3",
    labelSelector: "C3",

    is_selectable: true,
    icon: "fr-icon-culture-autres-surfaces",
  },
  {
    value: LEVEL_AB,
    label: "BIO",
    shortLabel: "AB",
    labelSelector: "BIO",
    is_selectable: true,
    icon: "fr-icon-culture-legumes",
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
  return record.annee_reference_controle ?? "";
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

export const notificationsStateLevel = {
  ["ENGAGEE"]: {
    label: "Engagée",
    color: "#DFFDF7",
    textColor: "#37635F",
    icon: "fr-icon--sm fr-icon-check-line",
    displayFilter: true,
  },

  ["ENGAGEE FUTUR"]: {
    label: "Engagée future",
    color: "#F4F6FE",
    textColor: "#2F4077",
    icon: "ri-calendar-check-line",
    displayFilter: true,
  },
  ["SUSPENDUE"]: {
    label: "Suspendue",
    color: "#FEE9E7",
    textColor: "#A94645",
    icon: "fr-icon--sm fr-icon-pause-circle-line",
    displayFilter: true,
  },
  ["NON ENGAGEE"]: {
    label: "Non engagée",
    color: "#FEF5E8",
    textColor: "#695240",
    icon: "fr-icon--sm fr-icon-time-line",
    displayFilter: true,
  },
  ["ARRETEE"]: {
    label: "Arrêtée",
    color: "#FFE9E9",
    textColor: "#CE0500",
    icon: "fr-icon--sm fr-icon-error-fill",
    displayFilter: true,
  },
  ["RETIREE"]: {
    label: "Retirée",
    color: "#EEE4D9",
    textColor: "#6A6156",
    icon: "fr-icon--sm fr-icon-close-circle-line",
    displayFilter: true,
  },

  ["BROUILLON"]: {
    label: "Brouillon",
    color: "#E5E5E5",
    textColor: "#666666",
    displayFilter: false,
  },
};

export const engagementList = {
  ["AB"]: {
    label: "100% AB",
    tooltipText: "En 100% AB, toutes les parcelles de l'exploitation ont atteint le niveau AB",
  },
  ["ABCONV"]: {
    label: "AB/en conversion",
    tooltipText: "Présence sur l’exploitation de parcelles en conversion sans parcelle en conventionnel",
  },
  ["MIXTE"]: {
    label: "Mixte",
    tooltipText: "Présence sur l’exploitation de parcelles en conventionnel",
  },
};

export const etatCertificationList = [
  { key: "ALL", label: "Toutes" },
  { key: "CERTIFIED", label: "Certifiées" },
  { key: "NO_CERTIFIED", label: "Non certifiées" },
];

export const sortOperatorListKeys = [
  { key: "nom-ASC", label: "Nom (A à Z)" },
  { key: "nom-DESC", label: "Nom (Z à A)" },
  { key: "date-audit-DESC", label: "Date d'audit plus récente à plus ancienne" },
  { key: "date-audit-ASC", label: "Date d'audit plus ancienne à plus récente" },
];
