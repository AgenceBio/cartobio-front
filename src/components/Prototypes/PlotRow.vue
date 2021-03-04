<template>
  <div>
    <offline-lazy-autocomplete single-line :allow-overflow="false" outline v-model="plot.com" :lazy-items="() => $data._communes" item-value="COM" :item-text="({ LIBELLE, DEP }) => `${LIBELLE} (${DEP})`" :hide-details="!isLastLine" />
    <v-text-field single-line hint="Sous la forme AZ01, AN5, 011K0038 etc." persistent-hint clearable outline v-model="plot.cadastre_suffixes" :hide-details="!isLastLine" />
    <v-autocomplete single-line :allow-overflow="false" outline :items="$data._knownCultures" item-text="Libellé Culture" item-value="Code Culture" multiple v-model="plot.culture_type" :hide-details="!isLastLine" />
    <v-select single-line outline v-model="plot.niveau_conversion" :items="conversion_levels" :hide-details="!isLastLine" />
    <v-text-field single-line clearable outline mask="##/##/####" hint="Format Jour/Mois/Année. Si inconnue, donner la date de conversion prévue" persistent-hint :disabled="!plot.niveau_conversion || plot.niveau_conversion === 'CONV'" v-model="plot.engagement_date"  :hide-details="!isLastLine" />
    <v-text-field single-line hint="Nom de la parcelle, précisions, autres infos ..." persistent-hint clearable outline v-model="plot.comment" :hide-details="!isLastLine" />
    <v-btn flat icon large @click="$emit('delete', id)"><v-icon medium>delete</v-icon></v-btn>
  </div>
</template>

<script>
import OfflineLazyAutocomplete from '@/components/Forms/OfflineLazyAutocomplete.vue'

import {codes} from '@/modules/codes-cultures/pac.js'
import communes from '@/api/insee/communes.json'

export default {
  components: {
    OfflineLazyAutocomplete,
  },

  props: {
    feature: {
      type: Object
    },

    isLastLine: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    id () {
      return this.feature.id
    },

    plot () {
      return this.feature.properties
    }
  },

  data () {
    return {
      // disable variable observation
      // eslint-disable-next-line vue/no-reserved-keys
      _communes: communes,
      // eslint-disable-next-line vue/no-reserved-keys
      _knownCultures: codes.sort((a, b) => a['Libellé Culture'].localeCompare(b['Libellé Culture'])),

      conversion_levels: [
        { value: "Cx", text: "En attente du 1er contrôle AB" },
        { value: "C1", text: "C1" },
        { value: "C2", text: "C2" },
        { value: "C3", text: "C3" },
        { value: "BIO", text: "Bio" },
        { value: "CONV", text: "Conventionnel" },
        { value: "HVE3", text: "Haute Valeur Environnementale (niveau 3)" },
        { value: "HVEx", text: "Haute Valeur Environnementale (niveau 1 ou 2)" },
        { value: "DMTR", text: "Demeter" },
        { value: "N&P", text: "Nature & Progrès" },
        { value: "", text: "Inconnu" }
      ],

    };
  },

};
</script>

<style lang="scss" scoped>
  .d-flex {
    justify-content: space-between;
  }

  .d-flex > * {
    gap: .5em;
  }

  summary {
    cursor: pointer;
  }

  table {
    border-collapse: collapse;
    margin-left: 10px;

    thead {
      background: #dfdfdf;
      font-weight: bold;
      vertical-align: bottom;
    }

    tbody {
      font-family: monospace;
    }

    td {
      border: 1px solid #ccc;
      padding: 0.5rem;
    }
  }

  h2 {
    margin-top : 0;
  }
  .map {
    position: relative;
    width: 100%;
    height: 500px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-column-gap: 5px;
    grid-row-gap: 1em;
    margin: 1em 0;

    span.header {
      font-weight: bold;
      align-self: flex-end;
    }
  }

  .chip {
    background: #ffc;
    border: 1px solid currentColor;
    border-radius: 2em;
    display: inline-block;
    padding-left: 1em;
    padding-right: 1em;

    .v-avatar {
      margin-left: -1em;
    }
  }

</style>
