const codes = require('./data.json')

const KEY_CODE_CULTURE = 'Code Culture';
const KEY_CODE = 'Code'

function fromCode (code){
  const found = codes.find((row) => row[KEY_CODE_CULTURE] === code || row[row[KEY_CODE]] === code)

  if (!found) {
    return {label: '', groupCode: '', groupLabel: ''}
  }

  const label = found['Libellé'] || found['Libellé Culture'] || 'Non Connu'
  const {'Libellé Groupe Culture':groupLabel} = found
  const {'Code Groupe Culture':groupCode} = found

  if (!label) {
    console.warn(`[CARTOBIO] Culture code "${code}" could not be found.`)
  }

  return {label, groupCode, groupLabel}
}

module.exports = { fromCode }
