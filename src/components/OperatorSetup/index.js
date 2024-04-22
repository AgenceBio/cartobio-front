import { markRaw } from 'vue'
import { sources } from '@/referentiels/imports.js'

import AnyGeoFeaturesImport from '@/components/OperatorSetup/Sources/AnyGeo.vue'
import GeofoliaFeaturesImport from '@/components/OperatorSetup/Sources/Geofolia.vue'
import RPGFeaturesImport from '@/components/OperatorSetup/Sources/RPG.vue'
import CviFeaturesImport from '@/components/OperatorSetup/Sources/Cvi.vue'
import MesParcellesFeaturesImport from '@/components/OperatorSetup/Sources/MesParcelles.vue'
import TelepacFeaturesImport from '@/components/OperatorSetup/Sources/Telepac.vue'

const { VUE_APP_PRELOADED_CAMPAGNE_PAC: CAMPAGNE_PAC } = import.meta.env

export default {
  [sources.ANYGEO]: {
    label: 'Fichier géographique',
    component: markRaw(AnyGeoFeaturesImport),
  },
  [sources.CVI]: {
    label: 'ProDouanes (CVI)',
    component: markRaw(CviFeaturesImport),
  },
  [sources.GEOFOLIA]: {
    label: 'Geofolia',
    component: markRaw(GeofoliaFeaturesImport),
  },
  [sources.MESPARCELLES]: {
    label: 'MesParcelles',
    component: markRaw(MesParcellesFeaturesImport),
  },
  [sources.RPG]: {
    label: `RPG ${CAMPAGNE_PAC}`,
    component: markRaw(RPGFeaturesImport),
  },
  [sources.TELEPAC]: {
    label: 'Telepac',
    component: markRaw(TelepacFeaturesImport),
  }
}

export const DEFAULT_SOURCE = sources.TELEPAC
