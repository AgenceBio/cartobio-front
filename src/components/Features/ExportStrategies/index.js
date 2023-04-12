import DefaultStrategy from './default.js'
import Certipaq from './certipaq.js'
import BureauVeritas from './bureau-veritas.js'

export default DefaultStrategy
export { Certipaq, BureauVeritas }

const strategies = new Map([
  // Temporary, use it with Ecocert test account
  [1, BureauVeritas],
  [2, BureauVeritas],
  [3, Certipaq],
])

export function fromId (ocId) {
  return strategies.has(ocId) ? strategies.get(ocId) : DefaultStrategy
}
