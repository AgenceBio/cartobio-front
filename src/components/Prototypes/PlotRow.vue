<template>
  <div v-frag>
    <span>
      <offline-lazy-autocomplete v-model="plot.com" :lazy-items="() => $data._communes" item-value="COM" :item-text="({ LIBELLE, DEP }) => `${LIBELLE} (${DEP})`" :hide-details="!isLastLine" />
    </span>

    <span v-if="!pacage">
      <input type="text" v-model="plot.cadastre_suffixes" :hide-details="!isLastLine" autocomplete="disabled" />
    </span>

    <div class="select-wrapper multiple">
      <select item-text="Libellé Culture" item-value="Code Culture" multiple v-model="plot.culture_type" :hide-details="!isLastLine">
        <option v-for="item in $data._knownCultures" :key="item['Code Culture']" :value="item['Code Culture']">{{ item['Libellé Culture']}}</option>
      </select>
    </div>

    <div class="select-wrapper">
      <select v-model="plot.niveau_conversion" :hide-details="!isLastLine">
        <option v-for="({value, text}) in conversion_levels" :key="value" :value="value">{{text}}</option>
      </select>
    </div>

    <span>
      <input type="date" min="1970-01-01" :disabled="!plot.niveau_conversion || plot.niveau_conversion === 'CONV'" v-model="plot.engagement_date"  :hide-details="!isLastLine" />
    </span>

    <span>
      <textarea v-model="plot.comment" :hide-details="!isLastLine" />
    </span>

    <span>
      <v-btn outline icon @click="$emit('delete', id)"><v-icon color="red darken-4">clear</v-icon></v-btn>
    </span>
  </div>
</template>

<script>
import frag from 'vue-frag';
import OfflineLazyAutocomplete from '@/components/Forms/OfflineLazyAutocomplete.vue'

import {codes} from '@/modules/codes-cultures/pac.js'
import communes from '@/api/insee/communes.json'

export default {
  components: {
    OfflineLazyAutocomplete,
  },

  directives: {
    frag
  },

  props: {
    pacage: {
      type: String
    },

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
    grid-template-columns: subgrid;
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

  /deep/ input[type="text"],
  /deep/ input[type="search"],
  input[type="date"],
  select,
  textarea {
    border: 1px solid #333;
    border-radius: 3px;
    padding: .5em;
    max-width: 100%;

    &:invalid {
      box-shadow: red 0 0 3px;
      border-color: darkred;
    }

    &:disabled {
      border-color: #bbb;
      color: #bbb;
      cursor: default;
    }
  }

  select option:checked {
    background-color: green;
    color: green;
    font-weight: bold;
  }

  .select-wrapper {
    position: relative;
    max-width: 150px;

    &:not(.multiple):after {
      content: "▼";
      font-size: 1rem;
      top: 6px;
      right: 2em;
      position: absolute;
    }
  }

</style>
