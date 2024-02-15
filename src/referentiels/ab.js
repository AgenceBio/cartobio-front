import { fromCodeCpf } from "@agencebio/rosetta-cultures"
import { featureName } from "@/components/Features/index.js"

export const LEVEL_UNKNOWN = undefined
export const LEVEL_CONVENTIONAL = 'CONV'
export const LEVEL_C1 = 'C1'
export const LEVEL_C2 = 'C2'
export const LEVEL_C3 = 'C3'
export const LEVEL_AB = 'AB'
export const LEVEL_MAYBE_AB = 'AB?'

/** @enum {string} */
export const CERTIFICATION_STATE = {
  OPERATOR_DRAFT: 'OPERATOR_DRAFT', // Phase 2
  AUDITED: 'AUDITED', // Phase 3
  PENDING_CERTIFICATION: 'PENDING_CERTIFICATION', // Phase 4
  CERTIFIED: 'CERTIFIED', // Phase 5
}

/**
 * @param {CERTIFICATION_STATE} state
 * @returns {Boolean}
 */
export function isCertificationImmutable (state) {
  return [
    CERTIFICATION_STATE.PENDING_CERTIFICATION,
    CERTIFICATION_STATE.CERTIFIED,
  ].includes(state)
}

export const conversionLevels = [
  {
    value: LEVEL_UNKNOWN,
    label: 'Niveau de conversion inconnu',
    shortLabel: 'Inconnue',
  },
  {
    value: LEVEL_CONVENTIONAL,
    label: 'Conventionnel',
    shortLabel: 'Conventionnel',
    is_selectable: true,
  },
  {
    value: LEVEL_MAYBE_AB,
    label: 'AB — niveau de conversion à préciser',
    shortLabel: 'AB',
  },
  {
    value: LEVEL_C1,
    label: 'C1 — Première année de conversion',
    shortLabel: 'C1',
    is_selectable: true,
  },
  {
    value: LEVEL_C2,
    label: 'C2 — Deuxième année de conversion',
    shortLabel: 'C2',
    is_selectable: true,
  },
  {
    value: LEVEL_C3,
    label: 'C3 — Troisième année de conversion',
    shortLabel: 'C3',
    is_selectable: true,
  },
  {
    value: LEVEL_AB,
    label: 'AB — Agriculture biologique',
    shortLabel: 'AB',
    is_selectable: true,
  },
]

export const userFacingConversionLevels = conversionLevels.filter(({ is_selectable }) => is_selectable)

export const RULE_NAME = 'NAME'
export const RULE_NOT_EMPTY = 'NOT_EMPTY'
export const RULE_CONVERSION_LEVEL = 'CONVERSION_LEVEL'
export const RULE_ENGAGEMENT_DATE = 'ENGAGEMENT_DATE'
export const RULE_MAYBE_AB = 'MAYBE_AB'

export const RULE_CPF = 'CPF'

const VALIDATION_RULES = {
  // la culture a un nom
  [RULE_NAME] (feature) {
    return Boolean(featureName(feature, { placeholder: '' }))
  },
  // la culture est renseignée
  [RULE_NOT_EMPTY] (feature) {
    return Array.isArray(feature.properties.cultures) && feature.properties.cultures.length > 0 && feature.properties.cultures.every(({ CPF }) => Boolean(CPF))
  },
  // le code CPF est explicite (il n'y a pas plusieurs choix possibles pour un code)
  [RULE_CPF] (feature) {
    return (feature.properties.cultures ?? []).every(({ CPF }) => Boolean(!CPF) || fromCodeCpf(CPF)?.is_selectable)
  },
  // le niveau de conversion n'est pas renseigné si une culture existe
  [RULE_CONVERSION_LEVEL] (feature) {
    const { conversion_niveau } = feature.properties
    const conversionLevel = getConversionLevel(conversion_niveau)

    return ((feature.properties.cultures ?? []).every(({ CPF }) => Boolean(CPF)) && conversionLevel.value === LEVEL_UNKNOWN) === false
  },
  // le produit est "bio", mais on ne sait pas de quel niveau de bio il s'agit
  [RULE_MAYBE_AB] (feature) {
    const { conversion_niveau } = feature.properties
    const conversionLevel = getConversionLevel(conversion_niveau)

    return !(conversionLevel.value === LEVEL_MAYBE_AB)
  },
  // la date d'engagement est manquante pour des conversions récentes
  // on dit que c'est OK de ne pas l'avoir en AB, pour accepter des parcellaires certifiés depuis longtemps, avant l'obligation de tracer leur date d'engagement ou de passage en bio
  [RULE_ENGAGEMENT_DATE] (feature) {
    const { conversion_niveau, engagement_date } = feature.properties
    const conversionLevel = getConversionLevel(conversion_niveau)

    if ([LEVEL_C1, LEVEL_C2, LEVEL_C3].includes(conversionLevel.value) && !engagement_date) {
      return false
    }

    return true
  }
}

export const OPERATOR_RULES = [RULE_NOT_EMPTY, RULE_CPF]
export const AUDITOR_RULES = [RULE_NOT_EMPTY, RULE_CPF, RULE_CONVERSION_LEVEL, RULE_MAYBE_AB, RULE_ENGAGEMENT_DATE]

export function getConversionLevel (level) {
  return conversionLevels.find(({ value }) => value === level) ?? getConversionLevel(LEVEL_UNKNOWN)
}

export function isABLevel (level) {
  return ABLevels.includes(level)
}

export function applyValidationRules (rules, ...features) {
  let total = 0
  let success = 0
  let failures = 0
  const applicableRules = rules.filter(r => r)

  const results = applicableRules.reduce((obj, ruleId) => ({
    ...obj,
    [ruleId]: { success: 0, failures: 0 }
  }), {})
  const featuresResults = features.reduce((obj, feature) => ({
    ...obj,
    [feature.id]: { success: 0, failures: 0 }
  }), {})

  features.forEach(feature => {
    applicableRules.forEach((ruleId) => {
      const result = VALIDATION_RULES[ruleId](feature)
      total++
      result ? success++ : failures++
      results[ruleId][result ? 'success' : 'failures']++
      featuresResults[feature.id][result ? 'success' : 'failures']++
    })
  })

  return { total, success, failures, rules: results, features: featuresResults }
}

export const ABLevels = [LEVEL_C1, LEVEL_C2, LEVEL_C3, LEVEL_AB]

/**
 * @enum {String}
 */
export const ANNOTATIONS = {
  DOWNGRADED: 'downgraded',
  // v metadata keys
  METADATA_STATE: 'state',
  // NEWLY_ADDED: 'newly-added',
  REDUCED_CONVERSION_PERIOD: 'reduction-conversion',
  RISKY: 'risky',
  SAMPLED: 'sampled',
  // SOWED: 'sowed',
  SURVEYED: 'surveyed'
}

/**
 * @enum {String}
 */
export const CERTIFICATION_BODY_DECISION = {
  PENDING: '',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected'
}

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
    label: 'Réduction de conversion',
    metadata: {
      [ANNOTATIONS.METADATA_STATE]: {
        [CERTIFICATION_BODY_DECISION.PENDING]: {
          label: 'En cours de traitement'
        },
        [CERTIFICATION_BODY_DECISION.ACCEPTED]: {
          label: 'Dérogation acceptée'
        },
        [CERTIFICATION_BODY_DECISION.REJECTED]: {
          label: 'Dérogation refusée'
        },
      }
    }
  },
  [ANNOTATIONS.DOWNGRADED]: {
    featured: () => true,
    label: 'Déclassement',
    metadata: {
      [ANNOTATIONS.METADATA_STATE]: {
        [CERTIFICATION_BODY_DECISION.ACCEPTED]: {
          label: 'Déclassement approuvé'
        },
        [CERTIFICATION_BODY_DECISION.REJECTED]: {
          label: 'Déclassement refusé'
        }
      }
    }
  },
  [ANNOTATIONS.RISKY]: {
    label: 'À risque',
  },
  [ANNOTATIONS.SAMPLED]: {
    label: 'Prélèvement effectué'
  },
  [ANNOTATIONS.SURVEYED]: {
    label: 'Visitée'
  }
}

/**
 * Return the label of an annotation.
 * Also works with its 'state' metadata (suffixed)
 * @param {UserAnnotation} annotation
 * @returns {String}
 */
export function getAnnotationLabel ({ code, metadata }) {
  let text = AnnotationTags[code].label
  const state = (metadata ?? {})[ANNOTATIONS.METADATA_STATE]

  if (state) {
    text += ` (${AnnotationTags[code].metadata[ANNOTATIONS.METADATA_STATE][state].label})`
  }

  return text
}

export const certificationDateFin = {
  /**
   * It's the standard rule.
   *
   * @param {Date} date
   * @returns {string}
   */
  MoisPlusDixHuit (date) {
    const d = new Date(date)
    d.setMonth(d.getMonth() + 18)
    return d
  },
  /**
   * It's a more commonly practiced rule.
   *
   * @param {Date} date
   * @returns {string}
   */
  AnneePlusDeux (date) {
    const d = new Date(date)
    d.setDate(31)
    d.setMonth(2) /* march */
    d.setUTCFullYear(d.getUTCFullYear() + 2)
    return d
  }
}
