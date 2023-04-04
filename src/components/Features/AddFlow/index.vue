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
          <input type="search" class="fr-input" id="form-commune" v-model="commune" required autofocus />
        </div>
      </div>

      <p class="fr-h6">
        Limites de la parcelle
      </p>

      <article class="fr-pl-5w">
        <div class="fr-radio-group fr-ml-n4w fr-mb-2w">
          <input type="radio" id="radio-inline-1" name="radio-inline">
          <label class="fr-label" for="radio-inline-1">
            Par référence(s) cadastrale(s)
          </label>
        </div>

        <CadastreField v-for="(reference, index) in landParcels" :reference="reference" :commune="commune" @change="updateReference(index, $event)" />
      </article>

      <div class="fr-input-group fr-mt-4w">
        <button class="fr-btn" type="submit">Suivant</button>
      </div>
    </form>
  </section>
</template>

<script setup>
import axios from 'axios'
import { reactive, ref } from 'vue'
import CadastreField from '@/components/Forms/CadastreField.vue';
import { toString } from '@/components/cadastre.js';

const commune = ref('26108')
const landParcels = reactive(['26108000AI0341'])

function updateReference (index, reference) {
  console.log({ index, reference })

  axios.get('https://apicarto.ign.fr/api/cadastre/parcelle', {
    params: {
      code_insee: reference.commune,
      section: reference.section,
      numero: reference.number,
      com_abs: reference.prefix,
      _limit: 2,
      source_ign: 'PCI'
    }
  }).then(({ data }) => console.log(data))

  landParcels[index] = toString(reference)
}
</script>

<style scoped>
label[for="form-commune"] + div {
  max-width: 25em;
}
</style>
