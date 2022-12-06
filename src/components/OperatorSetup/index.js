import GeofoliaPanel from './Geofolia.vue'
import MesParcellesPanel from './MesParcelles.vue'
import TelepacPanel from './Telepac.vue'

import { sources } from '@/referentiels/imports.js'

export default {
  [sources.MES_PARCELLES]: {
    label: 'MesParcelles',
    component: MesParcellesPanel,
  },
  [sources.GEOFOLIA]: {
    label: 'Géofolia',
    component: GeofoliaPanel,
  },
  [sources.TELEPAC]: {
    label: 'Telepac',
    component: TelepacPanel,
  },
  [sources.NCVI]: {
    label: 'ProDouanes (nCVI)',
  },
  [sources.SMAG_FARMER]: {
    label: 'SMAG Farmer',
  },
}
