import DefaultStrategy from './default.js'
import Certipaq from './certipaq.js'

export default DefaultStrategy
export { Certipaq }

const strategies = new Map([
  // Temporary, use it with Ecocert test account
  [1, Certipaq],
  [3, Certipaq],
])

export function fromId (ocId) {
  return strategies.has(ocId) ? strategies.get(ocId) : DefaultStrategy
}
