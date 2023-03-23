/**
 * @typedef CadastreReference
 *
 * @property {String} commune
 * @property {String} prefix
 * @property {String} section
 * @property {String} number
 */

// via https://github.com/datagistips/memos/blob/main/regexes.md
const FRENCH_CADASTRE_REFERENCE_RE = /^(?<commune>(0[1-9]|1[0-9]|2[AB]|2[1-9]|[3-9][0-9])\d{3}|97[1-6]\d{2})(?<prefix>\d{3})(?<section>((0|[A-Z])[A-Z]|\d{2}))(?<number>[0-9]{3,4}[a-z]?)$/
const trimLeadingZero = (ref) => ref.replace(/^0+([^0]+)$/, '$1')

/**
 * @param {String} reference
 * @returns {CadastreReference?}
 */
export function parseReference (reference) {
  const match = reference.trim()
    .toLocaleUpperCase()
    .match(FRENCH_CADASTRE_REFERENCE_RE)

    if (!match) {
      return null
    }

  const { commune, prefix, section, number } = match.groups

  return {
    commune: trimLeadingZero(commune),
    prefix: trimLeadingZero(prefix),
    section,
    number: trimLeadingZero(number)
  }
}
