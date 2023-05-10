import { defineStore } from 'pinia'
import { computed, readonly, shallowRef } from 'vue'
import { useFeaturesStore } from './features.js'


export const useOperatorStore = defineStore('operator', () => {
  const profile = shallowRef({})
  const notifications = computed(() => profile.value.notifications ?? [])
  const certifications = computed(() => profile.value.certifications ?? [])
  const features = useFeaturesStore()

  function set (profileData) {
    profile.value = profileData
  }

  return {
    profile: readonly(profile),
    // getters
    notifications,
    certifications,
    // methods
    set,
  }
})
