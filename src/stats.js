import { onMounted } from "vue"

/**
 * @param {Array} args
 */
export function statsPush (args) {
  if (typeof window?._paq?.push === 'function') {
    window._paq.push(args)
  }
}

export function useContentTracking () {
  onMounted(() => {
    statsPush(['trackContentImpressionsWithinNode', document.getElementById('app')]);
  })
}
