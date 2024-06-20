import DefaultExporter from '@/utils/export-strategies/DefaultExporter.js'
import BureauVeritasExporter from '@/utils/export-strategies/BureauVeritasExporter.js'
import CertipaqExporter from '@/utils/export-strategies/CertipaqExporter.js'
import CertisExporter from '@/utils/export-strategies/CertisExporter.js'
import CertisudExporter from '@/utils/export-strategies/CertisudExporter.js'
import ControlUnionExporter from "@/utils/export-strategies/ControlUnionExporter.js"
import OcaciaExporter from "@/utils/export-strategies/OcaciaExporter.js";
import QualisudExporter from "@/utils/export-strategies/QualisudExporter.js";

export default DefaultExporter
export { BureauVeritasExporter, CertipaqExporter, CertisExporter, ControlUnionExporter, OcaciaExporter, QualisudExporter }

const isProduction = Boolean(import.meta.env.PROD)

const exporters = new Map([
  // Use a custom exporter in development to ease testing
  [1, isProduction ? DefaultExporter : CertisudExporter],
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
