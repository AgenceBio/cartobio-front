const REFERENCE_RE = /((000)?\s*([a-z]{1,2})\s*([0-9]{1,4}))(?:\W|$)/ig

export function parseReferences(string, { com }) {
  const references = Array.from(string.matchAll(REFERENCE_RE)).map(([,, prefixe, section, parcelle]) => {
    if (section) {
      return `${com}${prefixe || '000'}${section}${parcelle.padStart(4, 0)}`
    }
  })

  return references
}
