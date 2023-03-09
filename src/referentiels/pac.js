import { computed } from 'vue'
const { VUE_APP_CURRENT_CAMPAGNE_PAC: CURRENT_CAMPAGNE_PAC } = import.meta.env

/**
 * @typedef {Object} CodePac
 * @property {string} CODE_CULTURE
 * @property {string} LIBELLE_CULTURE
 * @property {string} CODE_GROUPE_CULTURE
 * @property {string} LIBELLE_GROUPE_CULTURE
 */

/**
 * @type {Array<CodePac>}
 */
import codes from './codes-pac.json'

const DEFAULT_LIBELLE = '(inconnu)'

/**
 * @param {string} code
 * @returns {} libelle
 */
export function libelléFromCode (code){
  const found = codes.find((row) => row.CODE_CULTURE === code)

  return found ? found.LIBELLE_CULTURE : DEFAULT_LIBELLE
}

/**
 * @param {string} code
 * @returns {} groupLibellé
 */
export function groupLibelléFromCode (code){
  const found = codes.find((row) => row.CODE_CULTURE === code)

  return found ? found.LIBELLE_GROUPE_CULTURE : DEFAULT_LIBELLE
}

export function useTélépac (campagneYear = CURRENT_CAMPAGNE_PAC) {
  const campagne = computed(() => parseFloat(campagneYear))
  const campagneShort = computed(() => String(campagne.value).slice(-2))
  const previousCampagne = computed(() => campagne.value - 1)

  const urls = computed(() => ({
    home: `https://www.telepac.agriculture.gouv.fr/telepac/tas${campagneShort.value}/auth/accueilTas.action?campagne=${campagneShort.value}&titreApplication=Dossier+PAC+${campagneShort.value}`,
    exportHome: `https://www.telepac.agriculture.gouv.fr/telepac/tas${campagneShort.value}/ie/exportShpIlots.action`,
    exportShapefile: `https://www.telepac.agriculture.gouv.fr/telepac/tas${campagneShort.value}/ie/exportShpFichierParcelles.action?anneeCampagne=${campagneShort.value}`,
    exportXml: `https://www.telepac.agriculture.gouv.fr/telepac/tas${campagneShort.value}/ie/exportDossierCourant.action`
  }))

  function pacageFilename (pacage = '123456789') {
    return computed(() => `Dossier-PAC-${campagne.value}_parcelle-${campagne.value}_${123456789}_${campagne.value}0131155301.zip`)
  }

  return { urls, campagne, campagneShort, previousCampagne, pacageFilename }
}

export function normalize (input) {
  return String(input).trim().padStart(9, '0')
}

export function isValid (input) {
  return /^(97\d|(0[1-9][0-9]|0[0-9][1-9]))\d{6}$/i.test(normalize(input))
}

export const liste = Object.freeze(codes.map(({ CODE_CULTURE, LIBELLE_CULTURE }) => ([CODE_CULTURE, LIBELLE_CULTURE])))
