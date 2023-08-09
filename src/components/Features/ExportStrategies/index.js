import DefaultExporter from './DefaultExporter.js'
import BureauVeritasExporter from './BureauVeritasExporter.js'
import CertipaqExporter from './CertipaqExporter.js'
import ControlUnionExporter from "@/components/Features/ExportStrategies/ControlUnionExporter.js"
import OcaciaExporter from "@/components/Features/ExportStrategies/OcaciaExporter.js";
import QualisudExporter from "@/components/Features/ExportStrategies/QualisudExporter.js";

export default DefaultExporter
export { BureauVeritasExporter, CertipaqExporter, ControlUnionExporter, OcaciaExporter, QualisudExporter }

const isProduction = Boolean(import.meta.env.PROD)

const exporters = new Map([
  // Use a custom exporter in development to ease testing
  [1, isProduction ? DefaultExporter : QualisudExporter],
  // Production exports
  [2, BureauVeritasExporter],
  [3, CertipaqExporter],
  [4, QualisudExporter],
  // [5, CertisudExporter],
  // [6, CertisExporter],
  // [7, BureauAlpesControlesExporter],
  [10, ControlUnionExporter],
  [11, OcaciaExporter],
])

export function fromId (ocId) {
  return exporters.has(ocId) ? exporters.get(ocId) : DefaultExporter
}
