<template>
  <div class="pa-3">
    <v-subheader class="text--cyan">Bénéficiaire de la PAC</v-subheader>

    <p class="body-1 grey--text text--darken-3">
      Renseignez le numéro PACAGE de l'opérateur&nbsp;bio n°{{ operator.numeroBio }}.
      Nous récupérerons ensuite ses parcelles depuis sa dernière déclaration PAC.
    </p>

    <v-form v-model="isValid">
      <v-text-field outline autofocus
                    label="Numéro PACAGE"
                    v-model="newPacage"
                    clearable full-width
                    browser-autocomplete="off"
                    :rules="[rules.pacage]"
                    counter loading>
        <template v-slot:progress>
          <v-progress-linear
            :value="progress"
            color="red"
            height="5" />
        </template>
      </v-text-field>

      <v-btn round color="#b9d065" @click="savePacage(newPacage)" :disabled="!newPacage || !isValid" :loading="isLoading">Enregistrer le PACAGE</v-btn>
    </v-form>

    <v-divider class="mt-4 mb-1" />

    <v-subheader class="text--cyan">Exploitation hors PAC</v-subheader>

    <p class="body-1 grey--text text--darken-3">
      Nous vous inviterons alors à renseigner les parcelles ou zones de ruchers de l'opérateur&nbsp;bio n°{{ operator.numeroBio }}.
    </p>

    <v-btn round color="#b9d065" @click="newPacage='';savePacage(newPacage)" :disabled="newPacage === ''" :loading="isLoading">
      {{ newPacage === '' ? 'Enregistré comme hors PAC' : 'Enregistrer comme hors PAC' }}
    </v-btn>
  </div>
</template>

<script>
import {mapState} from 'vuex';

export default {
  name: "OperatorSidebarPacage",
  props: {
    operator: Object,
  },

  data () {
    return {
      isValid: false,
      newPacage: null,
      rules: {
        pacage: (value) => /^[0-9]{0,9}$/.test(value) || `L'identifiant PACAGE contient 9 chiffres.`
      }
    }
  },

  methods: {
    savePacage (newPacage) {
      const {numeroBio} = this.operator
      const numeroPacage = newPacage ? String(newPacage).trim() : newPacage

      this.$store.dispatch('operators/UPDATE_OPERATOR', { numeroBio, numeroPacage })
        .catch(console.error)
    }
  },

  computed: {
    ...mapState('user', ['apiToken']),
    ...mapState({
      isLoading: state => state.operators.isUpdatingOperator,
    }),

    progress () {
      const charsNumber = (this.newPacage || '').trim().length
      return Math.round(charsNumber / 9 * 100)
    },

    hasPacage () {
      return this.operator.pacage
    },
    hasNoPacage () {
      return this.operator.pacage === ''
    },
    isPacageUnknown () {
      return this.operator.pacage === null
    }
  }
};
</script>
<style lang="scss" scoped>
/deep/ .v-subheader {
  padding-left: 0;
  text-transform: uppercase;
}

.text--cyan {
  color : #457382;
}

.v-btn {
  margin: 0;
}

.outline-button {
  border: 1px solid #b9d065;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: .5em;
  text-align: left;

  .v-icon {
    color: #b9d065;
    margin-right: .5em;
  }

  &:hover,
  &:focus {
    background-color: lighten(#b9d065, 25%);
    border-color: darken(#b9d065, 25%);

    .v-icon {
      color: darken(#b9d065, 25%);
    }
  }

}
</style>
