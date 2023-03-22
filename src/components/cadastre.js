/**
 * @typedef CadastreReference
 *
 * @property {String} commune
 * @property {String} prefix
 * @property {String} section
 * @property {String} number
 */

// via https://github.com/datagistips/memos/blob/main/regexes.md
const FRENCH_CADASTRE_REFERENCE_RE = /^([013-9]\d|2[AB1-9])(\d{3})((0|[A-Z])[A-Z])([0-9]{4}[a-z]?)$/

/**
 * @param {String} reference
 * @returns {CadastreReference}
 */
export function parseReference (reference) {
  const [commune, prefix, section, number] = reference.trim().toLocaleUpperCase().match(FRENCH_CADASTRE_REFERENCE_RE) ?? ['', '', '', '']

  return { commune, prefix, section, number }
}
