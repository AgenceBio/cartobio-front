<template>
  <section>
    <h5 class="fr-h5">Nouvelle parcelle</h5>

    <form @submit.prevent="">
      <p class="fr-h6">
        Localisation de la parcelle
      </p>

      <div class="fr-input-group">
        <label for="form-commune" class="fr-label">Commune</label>

        <div class="fr-input-wrap fr-icon-road-map-fill">
          <input type="search" class="fr-input" id="form-commune" required autofocus />
        </div>
      </div>

      <p class="fr-h6">
        Limites de la parcelle
      </p>

      <article>
        <p>Par référence cadastrale</p>

        <CadastreField v-for="parcel in landParcels" :parcel="parcel" />
      </article>
    </form>
  </section>
</template>

<script setup>
import { reactive } from 'vue'
import CadastreField from '@/components/Forms/CadastreField.vue';

const landParcels = reactive(['26108000AI0341'])
</script>

<style scoped>
label[for="form-commune"] + div {
  max-width: 25em;
}
</style>
