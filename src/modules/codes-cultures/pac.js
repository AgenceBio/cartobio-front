import codes from './data.json'

const KEY_CODE_CULTURE = 'Code Culture';
const KEY_CODE = 'Code'

export function fromCode (code){
  const found = codes.find((row) => row[KEY_CODE_CULTURE] === code || row[row[KEY_CODE]] === code)

  const label = found['Libellé'] || found['Libellé Culture'] || 'Non Connu'
  const {'Libellé Groupe Culture':groupLabel} = found
  const {'Code Groupe Culture':groupCode} = found

  if (!label) {
    console.warn(`[CARTOBIO] Culture code "${code}" could not be found.`)
  }

  return {label, groupCode, groupLabel}
}
