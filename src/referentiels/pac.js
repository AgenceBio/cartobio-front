import { computed, readonly } from "vue";
const { VUE_APP_PRELOADED_CAMPAGNE_PAC: PRELOADED_CAMPAGNE_PAC } = import.meta.env;

/**
 * @typedef {Object} CodePac
 * @property {string} CODE_CULTURE
 * @property {string} LIBELLE_CULTURE
 * @property {string} CODE_GROUPE_CULTURE
 * @property {string} LIBELLE_GROUPE_CULTURE
 */

/**
 * Détermine la campagne PAC actuelle
 *
 * Elle commence en général au 14/04 de l'année en cours.
 *
 * @param {Date} referenceDate
 */
export function resolveCampagneFromDate(referenceDate) {
  const referenceCampagneStartDate = new Date(`${referenceDate.getFullYear()}-04-14`);

  return referenceCampagneStartDate.getFullYear() - (referenceDate < referenceCampagneStartDate ? 1 : 0);
}

/**
 * Derive informations from an upload filename
 *
 * Filename can look like:
 * - Dossier-PAC-2020_dossier_999100540_20201216111411.xml
 * - Dossier-PAC-2020_parcelle-2020_082020054_20201113091213.zip
 *
 * @param {String} filename
 * @returns {?{campagne: String, pacage: String}}
 */
export function deriveFromFilename(filename) {
  const result = String(filename).match(/-PAC-(?<campagne>\d{4})_.+_(?<pacage>\d{9})_/);

  if (!result) {
    return { pacage: null, campagne: null };
  }

  return result.groups;
}

export function useTélépac(referenceDate = new Date()) {
  const campagne = computed(() => resolveCampagneFromDate(referenceDate));
  const campagneShort = computed(() => String(campagne.value).slice(-2));
  const preloadedCampagne = computed(() => parseInt(PRELOADED_CAMPAGNE_PAC, 10));

  const urls = readonly({
    home: `https://www.telepac.agriculture.gouv.fr/telepac/tas${campagneShort.value}/auth/accueilTas.action?campagne=${campagneShort.value}&titreApplication=Dossier+PAC+${campagneShort.value}`,
    exportHome: `https://www.telepac.agriculture.gouv.fr/telepac/tas${campagneShort.value}/ie/exportShpIlots.action`,
    exportShapefile: `https://www.telepac.agriculture.gouv.fr/telepac/tas${campagneShort.value}/ie/exportShpFichierParcelles.action?anneeCampagne=${campagneShort.value}`,
    exportXml: `https://www.telepac.agriculture.gouv.fr/telepac/tas${campagneShort.value}/ie/exportDossierCourant.action`,
  });

  function pacageFilename(pacage = "123456789") {
    return computed(
      () => `Dossier-PAC-${campagne.value}_parcelle-${campagne.value}_${pacage}_${campagne.value}0131155301.zip`,
    );
  }

  return { urls, campagne, campagneShort, preloadedCampagne, pacageFilename };
}

export function normalize(input) {
  return String(input).trim().padStart(9, "0");
}

export function isValid(input) {
  return /^(97\d|(0[1-9][0-9]|0[0-9][1-9]))\d{6}$/i.test(normalize(input));
}
