import DefaultExporter from './DefaultExporter.js'
import CertipaqExporter from './CertipaqExporter.js'
import BureauVeritasExporter from './BureauVeritasExporter.js'

export default DefaultExporter
export { CertipaqExporter, BureauVeritasExporter }


const exporters = new Map([
  // Temporary, use it with Ecocert test account
  [1, BureauVeritasExporter],
  [2, BureauVeritasExporter],
  [3, CertipaqExporter],
])

export function fromId (ocId) {
  return exporters.has(ocId) ? exporters.get(ocId) : DefaultExporter
}
