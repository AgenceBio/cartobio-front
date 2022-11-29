export const LEVEL_UNKNOWN = undefined
export const LEVEL_CONVENTIONAL = 'CONV'
export const LEVEL_C1 = 'C1'
export const LEVEL_C2 = 'C2'
export const LEVEL_C3 = 'C3'
export const LEVEL_AB = 'AB'

export const conversionLevels = [
  { value: LEVEL_UNKNOWN, label: 'Niveau de conversion inconnu', shortLabel: 'Donnée inconnue' },
  { value: LEVEL_CONVENTIONAL, label: 'Conventionnel', shortLabel: 'Conventionnel' },
  { value: LEVEL_C1, label: 'C1 — Première année de conversion', shortLabel: 'C1' },
  { value: LEVEL_C2, label: 'C2 — Deuxième année de conversion', shortLabel: 'C2' },
  { value: LEVEL_C3, label: 'C3 — Troisième année de conversion', shortLabel: 'C3' },
  { value: LEVEL_AB, label: 'AB — Agriculture biologique', shortLabel: 'AB' },
]

export const userFacingConversionLevels = conversionLevels.filter(({ value }) => value !== undefined)

const VALIDATION_RULES = {
  NOT_EMPTY (feature) {
    const { conversion_niveau, engagement_date, TYPE } = feature.properties
    const conversionLevel = getConversionLevel(conversion_niveau)

    if (!TYPE || conversionLevel.value === LEVEL_UNKNOWN || (isABLevel(conversion_niveau) && !engagement_date)) {
      return false
    }

    return true
  }
}

export function getConversionLevel (level) {
  return conversionLevels.find(({ value }) => value === level) ?? getConversionLevel(LEVEL_UNKNOWN)
}

export function isABLevel (level) {
  return ABLevels.includes(level)
}

export function applyValidationRules (...features) {
  let total = 0
  let success = 0
  let failures = 0
  const rules = {}

  features.forEach(feature => {
    Object.entries(VALIDATION_RULES).forEach(([id, validationFn]) => {
      rules[id] = validationFn(feature)
      total++
      rules[id] ? success++ : failures++
    })
  })

  return { total, success, failures, rules }
}

export const ABLevels = [LEVEL_C1, LEVEL_C2, LEVEL_C3, LEVEL_AB]
