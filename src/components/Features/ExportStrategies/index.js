import DefaultExporter from './DefaultExporter.js'
import CertipaqExporter from './CertipaqExporter.js'
import BureauVeritasExporter from './BureauVeritasExporter.js'
import OcaciaExporter from "@/components/Features/ExportStrategies/OcaciaExporter.js";

export default DefaultExporter
export { CertipaqExporter, BureauVeritasExporter, OcaciaExporter }


const exporters = new Map([
  // Temporary, use it with Ecocert test account
  [1, CertipaqExporter],
  [2, BureauVeritasExporter],
  [3, CertipaqExporter],
  [11, OcaciaExporter],
])

export function fromId (ocId) {
  return exporters.has(ocId) ? exporters.get(ocId) : DefaultExporter
}
