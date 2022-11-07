const ddmmyy = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  dateStyle: 'medium'
})

const mmyy = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  month: 'long',
  year: 'numeric'
})

export function dateFormat (date) {
  return ddmmyy.format(new Date(date))
}

/**
 *
 * @param {String} date
 * @returns {String} formatted date as MM YYYY
 */
export function monthYearDateFormat (date) {
  return mmyy.format(new Date(date))
}
