<template>
  <span :class="['fr-badge', typeInfo.color]" v-if="typeId">
    {{ typeInfo.label }}
  </span>
</template>

<script setup>
import { readonly, computed } from 'vue'

import { EventType } from '@agencebio/cartobio-types'
import { CERTIFICATION_STATE } from '@/referentiels/ab.js'
import { sources } from '@/referentiels/imports.js'
import { usePermissions } from '@/stores/index.js'

const permissions = usePermissions()

const props = defineProps({
  metadata: {
    type: Object,
    default: (rawProps) => rawProps?.metadata ?? {},
  },
  state: {
    type: String,
    default: (rawProps) => rawProps.state ?? ''
  },
  type: {
    type: String,
    default: (rawProps) => !rawProps.type && rawProps.state ? EventType.CERTIFICATION_STATE_CHANGE : (rawProps.type ?? '')
  },
})

const TYPES_MAP = readonly({
  [EventType.CERTIFICATION_STATE_CHANGE]: {
    // Phase 2
    [CERTIFICATION_STATE.OPERATOR_DRAFT]: {
      label: props.metadata?.source === sources.MANUAL ? 'Parcellaire créé' : 'Parcellaire importé',
      color: 'fr-badge--info fr-badge--icon-left fr-icon-info-line'
    },
    // Phase 3
    [CERTIFICATION_STATE.AUDITED]: {
      label: permissions.isAgri ? 'Certification en cours' : 'Audit terminé',
      color: 'fr-badge--new fr-badge--icon-left fr-icon-flashlight-fill'
    },
    // Phase 4
    [CERTIFICATION_STATE.PENDING_CERTIFICATION]: {
      label: 'Certification en cours',
      color: 'fr-badge--new fr-badge--icon-left fr-icon-flashlight-fill'
    },
    // Phase 5
    [CERTIFICATION_STATE.CERTIFIED]: {
      label: 'Certifié',
      color: 'fr-badge--success fr-badge--icon-left fr-icon-checkbox-circle-fill'
    },
  },
  [EventType.FEATURE_COLLECTION_CREATE]: {
    label: props.metadata?.source === sources.MANUAL ? 'Parcellaire créé' : 'Parcellaire importé',
    color: 'fr-badge--blue-cumulus fr-badge--icon-left fr-icon-info-line'
  },
  [EventType.FEATURE_COLLECTION_DELETE]: {
    label: 'Parcellaire supprimé',
    color: 'fr-badge--brown-caramel fr-badge--icon-left fr-icon-delete-line'
  },
  [EventType.FEATURE_COLLECTION_UPDATE]: {
    label: 'Parcelles modifiées',
    color: 'fr-badge--icon-left fr-icon-info-line'
  },
  [EventType.FEATURE_CREATE]: {
    label: 'Nouvelle parcelle',
    color: 'fr-badge--icon-left fr-icon-add-line'
  },
  [EventType.FEATURE_DELETE]: {
    label: 'Parcelle supprimée',
    color: 'fr-badge--icon-left fr-icon-minus-line'
  },
  [EventType.FEATURE_UPDATE]: {
    label: 'Parcelle modifiée',
    color: 'fr-badge--icon-left fr-icon-info-line'
  },
})

const typeId = computed(() => props.type in TYPES_MAP ? props.type : null)
const typeInfo = computed(() => TYPES_MAP[typeId.value][props.state] ?? TYPES_MAP[typeId.value])
</script>

<style scoped>
.fr-badge {
  white-space: nowrap;
}

.warning {
  background-color: var(--warning-950-100);
}
</style>
