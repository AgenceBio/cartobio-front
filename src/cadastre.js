const REFERENCE_RE = /(?=\W|^)((000|\d{3})?\s*([a-z]{1,2})\s*([0-9]{1,4}))(?=\W|$)/ig
const ALSACE_MOSELLE_RE = /(?=\W|^)((000|\d{3})?\s*([0-9]{0,2}[1-9]{1})\s*([0-9]{1,4}))(?=\W|$)/ig

export function parseReferences(string, { com }) {
  const RE = ['57', '67', '68'].includes(com.slice(0, 2)) ? ALSACE_MOSELLE_RE : REFERENCE_RE

  const references = Array.from(string.matchAll(RE)).map(([,, prefixe, section, parcelle]) => {
    if (section) {
      return `${com}${prefixe || '000'}${RE === REFERENCE_RE ? section : section.padStart(2, 0)}${parcelle.padStart(4, 0)}`
    }
  })

  return references
}
