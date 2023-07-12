import { fromCodeCpf } from "@agencebio/rosetta-cultures"

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

export function isCertificationImmutable (state) {
  return [
    CERTIFICATION_STATE.PENDING_CERTIFICATION,
    CERTIFICATION_STATE.CERTIFIED,
  ].includes(state)
}

export const conversionLevels = [
  { value: LEVEL_UNKNOWN, label: 'Niveau de conversion inconnu', shortLabel: 'Inconnue', is_selectable: false },
  { value: LEVEL_CONVENTIONAL, label: 'Conventionnel', shortLabel: 'Conventionnel' },
  { value: LEVEL_MAYBE_AB, label: 'AB — niveau de conversion à préciser', shortLabel: 'AB — à préciser', is_selectable: false },
  { value: LEVEL_C1, label: 'C1 — Première année de conversion', shortLabel: 'C1' },
  { value: LEVEL_C2, label: 'C2 — Deuxième année de conversion', shortLabel: 'C2' },
  { value: LEVEL_C3, label: 'C3 — Troisième année de conversion', shortLabel: 'C3' },
  { value: LEVEL_AB, label: 'AB — Agriculture biologique', shortLabel: 'AB' },
]

export const userFacingConversionLevels = conversionLevels.filter(({ is_selectable }) => is_selectable !== false)

export const RULE_NOT_EMPTY = 'NOT_EMPTY'
export const RULE_CONVERSION_LEVEL = 'CONVERSION_LEVEL'
export const RULE_ENGAGEMENT_DATE = 'ENGAGEMENT_DATE'
export const RULE_MAYBE_AB = 'MAYBE_AB'

export const RULE_CPF = 'CPF'

const VALIDATION_RULES = {
  // la culture est renseignée
  [RULE_NOT_EMPTY] (feature) {
    return Boolean(feature.properties.CPF)
  },
  // le code CPF est explicite (il n'y a pas plusieurs choix possibles pour un code)
  [RULE_CPF] (feature) {
    return Boolean(!feature.properties.CPF) || fromCodeCpf(feature.properties.CPF).is_selectable
  },
  // le niveau de conversion n'est pas renseigné si une culture existe
  [RULE_CONVERSION_LEVEL] (feature) {
    const { conversion_niveau } = feature.properties
    const conversionLevel = getConversionLevel(conversion_niveau)

    return (Boolean(feature.properties.CPF) && conversionLevel.value === LEVEL_UNKNOWN) === false
  },
  // le produit est "bio", mais on ne sait pas de quel niveau de bio il s'agit
  [RULE_MAYBE_AB] (feature) {
    const { conversion_niveau } = feature.properties
    const conversionLevel = getConversionLevel(conversion_niveau)

    return (conversionLevel.value === LEVEL_MAYBE_AB) === false
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
  const results = rules.reduce((obj, ruleId) => ({
    ...obj,
    [ruleId]: { success: 0, failures: 0 }
  }), {})
  const featuresResults = features.reduce((obj, feature) => ({
    ...obj,
    [feature.id]: { success: 0, failures: 0 }
  }), {})

  features.forEach(feature => {
    rules.forEach((ruleId) => {
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
