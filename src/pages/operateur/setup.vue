<template>
  <p class="notification is-success">
    <vue-feather type="check" />
    Nous avons bien pu valider votre identité.
    Vous pourrez utiliser CartoBio grâce à ce même email quand vous le souhaitez.
  </p>

  <h2>
    Votre parcellaire
    <small class="tag">Cet outil est actuellement en phase de test</small>
  </h2>

  <p>
    Sélectionner l’outil où votre parcellaire est maintenu à jour.
  </p>

  <ul class="sources">
    <li v-for="(source, sourceId) in featureSources">
      <button :disabled="source.active === false" type="button" :aria-current="sourceId === featureSource" @click="featureSource = sourceId">{{ source.label }}</button>
    </li>
  </ul>

  <section v-if="featureSource === 'telepac'">
    <!-- <article>
      <button type="button" @click.prevent="$router.push('/operateur/parcellaire')">
        🔐 Connecter mon compte TelePAC
      </button>
    </article> -->

    <article>
      <h3>Import de déclaration PAC</h3>

      <p class="help">
        <vue-feather type="help-circle" />

        Le fichier <b>Parcelles déclarées {{ campagnePacAnnee }} › Fichier de parcelles</b> se trouve sur le <a href="https://www.telepac.agriculture.gouv.fr/" target="_blank">portail Telepac</a>,
        dans la <a :href="campagnePacUrl" target="_blank">téléprocédure <b>Dossier PAC {{ campagnePacAnnee }}</b></a>,
        dans l'onglet bleu "Import/export" puis <a :href="campagnePacExportUrl" target="_blank">Export îlots et parcelles</a>.

        <img src="/import/telepac-export.png" class="screenshot" alt="Écran Import/Export du dossier PAC sur le service en ligne Telepac" />
      </p>

      <button type="button" @click.prevent="$router.push('/operateur/parcellaire')">
        <vue-feather type="upload-cloud" /> Importer ma dernière déclaration PAC
      </button>
    </article>
  </section>

</template>

<script setup>
import { ref, readonly, computed } from 'vue'

const featureSource = ref('')
const campagnePacAnnee = ref(2021)
const campagnePacAnneeShort = computed(() => String(campagnePacAnnee.value).slice(-2))
const campagnePacUrl = computed(() => `https://www.telepac.agriculture.gouv.fr/telepac/tas${campagnePacAnneeShort.value}/auth/accueilTas.action?campagne=${campagnePacAnnee.value}&titreApplication=Dossier+PAC+${campagnePacAnnee.value}`)
const campagnePacExportUrl = computed(() => `https://www.telepac.agriculture.gouv.fr/telepac/tas${campagnePacAnneeShort.value}/ie/exportShpIlots.action`)

const featureSources = readonly({
  telepac: {
    label: 'Déclaration PAC',
    active: true,
  },
  mesparcelles: {
    label: 'MesParcelles',
    active: false,
  },
  geofolia: {
    label: 'Géofolia',
    active: false,
  },
  smagfarmer: {
    label: 'SMAG Farmer',
    active: false,
  },
  ncvi: {
    label: 'ProDouanes (nCVI)',
    active: false,
  }
})
</script>

<style scoped>
[aria-current="true"] {
  font-weight: bold;
}

.sources {
  display: flex;
  gap: 1rem;
  list-style: none;
  padding: 0;
}

article .screenshot {
  max-width: min(500px, 50vw);
}
</style>

<style scoped>
.notification {
  background: var(--type-default);
  color: var(--type-default--text);
  padding: 1rem;
}

  .notification.is-success {
    background-color: var(--type-success);
    color: var(--type-success--text);
  }
</style>
