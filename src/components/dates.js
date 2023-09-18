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

function onValidDate (date, fn) {
  const dateObj = new Date(date)

  if (dateObj.toString() !== 'Invalid Date') {
    return fn(date)
  }
  return ''
}

/**
 * @param {String} date
 * @returns {String} formatted date as DD MMMM YYYY
 */
export function ddmmmmyyyy (date) {
  return onValidDate(date, d => ddmmmmyyyyIntl.format(d))
}

/**
 * @param {String} date
 * @returns {String} formatted date as DD MM YYYY
 */
export function dateFormat (date) {
  return onValidDate(date, d => ddmmyyIntl.format(d))
}

/**
 * @param {String} date
 * @returns {String} formatted date as MM YYYY
 */
export function monthYearDateFormat (date) {
  return onValidDate(date, d => mmmmyyIntl.format(d))
}

/**
 * @param {String} date
 * @returns {String} formatted date as MM YYYY
 */
export function mmyyyy (date) {
  return onValidDate(date, d => mmyyIntl.format(d))
}

/**
 * @returns {string}
 */
export function now () {
  return new Date().toISOString()
}
