import { markRaw } from 'vue'
import { sources } from '@/referentiels/imports.js'

import TelepacFeaturesImport from '@/components/OperatorSetup/Sources/Telepac.vue'
import GeofoliaFeaturesImport from '@/components/OperatorSetup/Sources/Geofolia.vue'

export default {
  [sources.TELEPAC]: {
    label: 'Telepac',
    component: markRaw(TelepacFeaturesImport),
  },
  [sources.GEOFOLIA]: {
    label: 'Geofolia',
    component: markRaw(GeofoliaFeaturesImport),
  },
  [sources.MES_PARCELLES]: {
    label: 'MesParcelles',
  },
}

export const DEFAULT_SOURCE = sources.TELEPAC
