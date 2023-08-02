import DefaultExporter from './DefaultExporter.js'
import CertipaqExporter from './CertipaqExporter.js'
import BureauVeritasExporter from './BureauVeritasExporter.js'
import OcaciaExporter from "@/components/Features/ExportStrategies/OcaciaExporter.js";
import ControlUnionExporter from "@/components/Features/ExportStrategies/ControlUnionExporter.js"

export default DefaultExporter
export { CertipaqExporter, BureauVeritasExporter, OcaciaExporter, ControlUnionExporter }

const isProduction = Boolean(import.meta.env.PROD)

const exporters = new Map([
  // Use a custom exporter in development to ease testing
  [1, isProduction ? DefaultExporter : CertipaqExporter],
  // Production exports
  [2, BureauVeritasExporter],
  [3, CertipaqExporter],
  [10, ControlUnionExporter],
  [11, OcaciaExporter],
])

export function fromId (ocId) {
  return exporters.has(ocId) ? exporters.get(ocId) : DefaultExporter
}
