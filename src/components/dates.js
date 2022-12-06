const ddmmyyIntl = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  dateStyle: 'medium'
})

const ddmmmmyyyyIntl = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  dateStyle: 'long'
})

const mmyyIntl = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  month: 'long',
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
  return mmyyIntl.format(new Date(date))
}

/**
 * @returns {string}
 */
export function now () {
  return new Date().toISOString()
}
