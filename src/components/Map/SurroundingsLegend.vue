<template>
  <Legend class="map-legend">
    <ul class="legend-list fr-my-1w">
      <li><div class="legend-square legend-square--mes-parcelles" />{{
        $props.operateur ? 'Mes parcelles' : 'Parcelles de l\'exploitation'
        }}</li>
      <li>
        <div class="legend-square legend-square--risque">
          <img src="/src/assets/map/warning.png" alt="Parcelle conventionnelle à risque" class="legend-square__icon" />
        </div>
        Conv. à risque
      </li>
      <li><div class="legend-square legend-square--conventionnelle" />Conventionnelle</li>
      <li><div class="legend-square legend-square--sans-culture" />Sans culture</li>
      <li><div class="legend-square legend-square--bio" />En bio</li>
    </ul>
  </Legend>
</template>

<script setup>
import Legend from "@/components/Map/Legend.vue";

defineProps({
  operateur: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.map-legend {
  font-size: .9rem;
}
.legend-list {
  list-style: none;
}

.legend-list li {
  margin-bottom: .5em;
}

.legend-square {
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
  margin-right: .5rem;
  border-radius: 2px;
  vertical-align: middle;
}

.legend-square__icon {
  display: block;
  width: 100%;
  height: auto;
}

.legend-square--mes-parcelles {
  color: #fff;
  background-color: var(--map-legend-mes-parcelles);
  border: 2px solid var(--map-legend-mes-parcelles-border);
}
.legend-square--risque {
  color: #fff;
  background-color: var(--map-legend-conventionnelle);
  border: 2px solid var(--map-legend-conventionnelle-border);
}
.legend-square--conventionnelle {
  /* color: var(--); */
  background-color: var(--map-legend-conventionnelle);
  border: 2px solid var(--map-legend-conventionnelle-border);
}
.legend-square--sans-culture {
  color: #fff;
  background-color: var(--map-legend-sans-culture);
  border: 2px solid var(--map-legend-sans-culture-border);
}
.legend-square--bio {
  color: #fff;
  background-color: var(--map-legend-bio);
  border: 2px solid var(--map-legend-bio-border);
}
</style>
