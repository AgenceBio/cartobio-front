import DefaultExporter from './DefaultExporter.js'
import BureauVeritasExporter from './BureauVeritasExporter.js'
import CertipaqExporter from './CertipaqExporter.js'
import CertisExporter from './CertisExporter.js'
import CertisudExporter from './CertisudExporter.js'
import ControlUnionExporter from "./ControlUnionExporter.js"
import OcaciaExporter from "./OcaciaExporter.js";
import QualisudExporter from "./QualisudExporter.js";

export default DefaultExporter
export { BureauVeritasExporter, CertipaqExporter, CertisExporter, ControlUnionExporter, OcaciaExporter, QualisudExporter }

const isProduction = Boolean(import.meta.env.PROD)

const exporters = new Map([
  // Use a custom exporter in development to ease testing
  [1, isProduction ? DefaultExporter : CertisExporter],
  // Production exports
  [2, BureauVeritasExporter],
  [3, CertipaqExporter],
  [4, QualisudExporter],
  [5, CertisudExporter],
  [6, CertisExporter],
  // [7, BureauAlpesControlesExporter],
  [10, ControlUnionExporter],
  [11, OcaciaExporter],
])

export function fromId (ocId) {
  return exporters.has(ocId) ? exporters.get(ocId) : DefaultExporter
}
