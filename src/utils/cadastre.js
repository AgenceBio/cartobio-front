/**
 * @typedef CadastreReference
 *
 * @property {String} commune
 * @property {String} prefix
 * @property {String} section
 * @property {String} number
 */

// via https://github.com/datagistips/memos/blob/main/regexes.md
const FRENCH_CADASTRE_REFERENCE_RE =
  /^(?<commune>(0[1-9]|1[0-9]|2[AB]|2[1-9]|[3-8][0-9]|9[0-5])\d{3}|97[1-6]\d{2})(?<prefix>\d{3})(?<section>((0|[A-Z])[A-Z]|\d{2}))(?<number>[0-9]{3,4}[a-z]?)$/;
export const trimLeadingZero = (ref) => ref.replace(/^0+([^0]+)$/, "$1");
const NON_ALPHA_NUM_RE = /[^a-z0-9]+/gi;

export function cleanInput(formInput) {
  return (typeof formInput === "string" ? formInput : "").trim().replace(NON_ALPHA_NUM_RE, "");
}

/**
 * @param {String|Number} ref
 * @param {Number} max
 * @returns {String}
 */
const padLeadingZero = (ref, max) => String(ref).padStart(max, "0");

/**
 * @param {String} objectReference
 * @returns {Boolean}
 */
export function isValidReference(reference) {
  return Boolean(reference.match(FRENCH_CADASTRE_REFERENCE_RE));
}

/**
 * @param {String} reference
 * @returns {CadastreReference?}
 */
export function parseReference(reference) {
  const match = reference.trim().toLocaleUpperCase().match(FRENCH_CADASTRE_REFERENCE_RE);

  if (!match) {
    return null;
  }

  const { commune, prefix, section, number } = match.groups;

  return {
    commune,
    prefix,
    section,
    number,
  };
}

/**
 * Turns an object into a well-formatted string reference
 *
 * @param {CadastreReference} objectReference
 * @returns {String}
 */
export function toString(objectReference) {
  const { commune, prefix = "000", section = "", number = "" } = objectReference;
  return `${padLeadingZero(commune, 5)}${padLeadingZero(prefix, 3)}${padLeadingZero(section, 2)}${padLeadingZero(number, 4)}`;
}
