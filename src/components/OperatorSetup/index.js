import GeofoliaPanel from './Geofolia.vue'
import MesParcellesPanel from './MesParcelles.vue'
import TelepacPanel from './Telepac.vue'

export default {
  mesparcelles: {
    label: 'MesParcelles',
    component: MesParcellesPanel,
  },
  geofolia: {
    label: 'Géofolia',
    component: GeofoliaPanel,
  },
  telepac: {
    label: 'Déclaration PAC',
    component: TelepacPanel,
  },
  ncvi: {
    label: 'ProDouanes (nCVI)',
  },
  smagfarmer: {
    label: 'SMAG Farmer',
  },
}
