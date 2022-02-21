/**
 * @type {Array<CodePac>}
 */
import codes from './codes-pac.json'

const DEFAULT_LIBELLE = '(inconnu)'

/**
 * @typedef {Object} CodePac
 * @property {string} CODE_CULTURE
 * @property {string} LIBELLE_CULTURE
 * @property {string} CODE_GROUPE_CULTURE
 * @property {string} LIBELLE_GROUPE_CULTURE
 */

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

export const liste = Object.freeze(codes.map(({ CODE_CULTURE, LIBELLE_CULTURE }) => ([CODE_CULTURE, LIBELLE_CULTURE])))
