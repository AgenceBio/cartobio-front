// 7 déc. 2022
const ddmmyyIntl = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  dateStyle: 'medium'
})

// 7 décembre 2022
const ddmmmmyyyyIntl = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  dateStyle: 'long'
})

// décembre 2022
const mmmmyyIntl = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  month: 'long',
  year: 'numeric'
})

// 12/2022
const mmyyIntl = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  month: 'numeric',
  year: 'numeric'
})

/**
 * @param {String} date
 * @returns {String} formatted date as DD MMMM YYYY
 */
export function ddmmmmyyyy (date) {
  return ddmmmmyyyyIntl.format(new Date(date))
}

/**
 * @param {String} date
 * @returns {String} formatted date as DD MM YYYY
 */
export function dateFormat (date) {
  return ddmmyyIntl.format(new Date(date))
}

/**
 * @param {String} date
 * @returns {String} formatted date as MM YYYY
 */
export function monthYearDateFormat (date) {
  if (!date) return null

  return mmmmyyIntl.format(new Date(date))
}

/**
 * @param {String} date
 * @returns {String} formatted date as MM YYYY
 */
export function mmyyyy (date) {
  return mmyyIntl.format(new Date(date))
}

/**
 * @returns {string}
 */
export function now () {
  return new Date().toISOString()
}
