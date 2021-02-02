<template>
  <v-form v-model="valid">
    <h2>Saisie du parcellaire</h2>

    <v-flex class="row xs12 d-flex" v-for="plot in plots" :key="plot.ilot + '.' + plot.parcelle">
      <v-text-field label="Ilot" clearable outline v-model="plot.ilot" />
      <v-text-field label="Parcelle" clearable outline v-model="plot.parcelle" />
      <v-autocomplete label="Commune" clearable outline v-model="plot.com" :item-text="itemText" item-value="com" :items="_communes" />
      <v-text-field label="Id cadastral" hint="Sous la forme AZ01, AN0005, etc." persistent-hint clearable outline v-model="plot.cadastre_suffix" />
      <v-autocomplete label="Type de culture" clearable outline :items="knownCultures" item-text="Libellé Culture" item-value="Code Culture" v-model="plot.culture_type" />
      <v-select label="Statut conversion" outline v-model="plot.niveau_conversion" :items="conversion_levels" />
      <v-menu v-model="conversionDateMenu" lazy transition="scale-transition" offset-y full-width max-width="320px">
        <template v-slot:activator="{ on }">
          <v-text-field outline clearable label="Date de conversion" v-on="on" readonly :disabled="!plot.niveau_conversion || plot.niveau_conversion === 'CONV'" v-model="plot.engagement_date" />
        </template>

        <v-date-picker outline @input="conversionDateMenu = false" type="month" v-model="plot.engagement_date" show-current locale="fr-FR" />
      </v-menu>
    </v-flex>

    <v-btn color="info" @click="addPlot">Ajouter une parcelle</v-btn>

    <hr class="my-4" />

    <details>
      <summary>Vue tabulaire</summary>

      <table class="summary">
        <thead>
          <tr>
            <td>Production végétale</td>
            <td>Date engagement</td>
            <td>Réf cadastrale</td>
            <td>Parcelle<td>
            <td>Classement</td>
            <td>Surface</td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="plot in structuredPlots" :key="plot.plot_id">
            <td>{{ plot.culture_type }}</td>
            <td>{{ plot.engagement_date }}</td>
            <td>{{ plot.cadastre_id }}</td>
            <td>{{ plot.plot_id }}</td>
            <td>{{ plot.niveau_conversion }}</td>
            <td>{{ plot.surface }}</td>
          </tr>
        </tbody>
      </table>
    </details>
  </v-form>
</template>

<script>
import communes from '@/api/insee/communes.json'
import {codes} from '@/modules/codes-cultures/pac.js'

export default {
  computed: {
    structuredPlots () {
      return this.plots
    }
  },


  data () {
    return {
      conversionDateMenu: false,

      valid: false,

      conversion_levels: [
        { value: "C1", text: "C1" },
        { value: "C2", text: "C2" },
        { value: "C3", text: "C3" },
        { value: "BIO", text: "Bio" },
        { value: "CONV", text: "Conventionnel" }
      ],

      knownCultures: codes.sort((a, b) => a['Libellé Culture'].localeCompare(b['Libellé Culture'])),

      plots: [
        {
          "ilot": 1,
          "parcelle": 1,
          "com": "26108"
        }
      ]
    };
  },

  created () {
    this._communes = communes
  },

  watch: {
    commune_search (val) {
      if (!val && val.length < 3) {
        this.communes = []
        return
      }

      const search = val.toLocaleLowerCase()
      this.communes = communes.filter(({ libelle }) => {
        return libelle.toLocaleLowerCase().includes(search)
      })
    }
  },

  methods: {
    addPlot () {
      const lastLine = this.plots[ this.plots.length - 1 ] ?? {}
      const { com, ilot, parcelle, engagement_date } = lastLine

      this.plots.push({ com, ilot, parcelle: parcelle+1, engagement_date })
    },

    itemText ({ com, libelle }) {
      return `${libelle} (${com})`
    }
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
</style>
