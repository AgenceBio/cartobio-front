const ddmmyy = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium'
})

export function dateFormat (date) {
  return ddmmyy.format(new Date(date))
}
