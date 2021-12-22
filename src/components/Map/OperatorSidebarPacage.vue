<template>
  <div class="pa-3">
    <v-subheader class="text--cyan">Bénéficiaire de la PAC</v-subheader>

    <p class="body-1 grey--text text--darken-3">
      Renseignez le numéro PACAGE de l'opérateur&nbsp;bio n°{{ operator.numeroBio }}.
      Nous récupérerons ensuite ses parcelles depuis sa dernière déclaration PAC.
    </p>

    <v-form @submit.prevent="validateAndSave">
      <v-text-field outline autofocus
                    label="Numéro PACAGE"
                    v-model="newPacage"
                    clearable full-width
                    browser-autocomplete="off"
                    :error="Boolean(currentErrors.length)"
                    :error-count="currentErrors.length"
                    :error-messages="currentErrors"
                    type="number"
                    class="pacage"
                    hint="L'identifiant PACAGE contient 9 chiffres"
                    counter loading>

        <template v-slot:progress>
          <v-progress-linear
            :value="progress"
            color="green"
            height="5" />
        </template>
      </v-text-field>

      <v-btn round color="#b9d065" type="submit" :disabled="!isValid || currentError !== ''" :loading="isLoading">
        Enregistrer le PACAGE
      </v-btn>
    </v-form>

    <v-divider class="mt-4 mb-1" />

    <v-subheader class="text--cyan">Exploitation hors PAC</v-subheader>

    <p class="body-1 grey--text text--darken-3">
      Nous vous inviterons ensuite à renseigner les parcelles ou zones de ruchers de l'opérateur&nbsp;bio n°{{ operator.numeroBio }}.
    </p>

    <v-btn round color="#b9d065" @click="savePacage('')" :disabled="isLoading" :loading="isLoading">
      Enregistrer comme hors PAC
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
      currentError: '',
      newPacage: '',
    }
  },

  methods: {
    async validateAndSave () {
      try {
        await this.verifyPacage(this.newPacage)
        this.savePacage(this.newPacage)
      }
      catch (error) {
        this.currentError = error.message
      }
    },

    async verifyPacage (numeroPacage) {
      const { numeroBio } = await this.$store.dispatch('pacage/VERIFY', { numeroPacage })

      if (numeroBio) {
        throw new Error(`Ce numéro PACAGE est déjà assigné à l'opérateur bio n°${numeroBio}).`)
      }
    },

    savePacage (newPacage) {
      const {numeroBio} = this.operator
      const numeroPacage = newPacage ? String(newPacage).trim() : newPacage

      this.$store.dispatch('operators/UPDATE_OPERATOR', { numeroBio, numeroPacage })
        .catch(error => this.currentError = error.message)
    }
  },

  computed: {
    ...mapState({
      isLoading: state => state.operators.isUpdatingOperator || state.pacage.isValidating,
    }),

    currentErrors () {
      return [this.currentError].filter(value => value)
    },

    isValid () {
      return /^[0-9]{9}$/.test(this.newPacage)
    },

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
  },

  watch: {
    // We reset the error state when the input has changed
    newPacage (newValue, previousValue) {
      if (newValue !== previousValue) {
        this.currentError = ''
      }
    }
  }
};
</script>
<style lang="scss" scoped>
::v-deep .v-subheader {
  padding-left: 0;
  text-transform: uppercase;
}

.text--cyan {
  color : #457382;
}

.v-btn {
  margin: 0;
}

.pacage ::v-deep input[type="number"] {
  appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    appearance: none;
    margin: 0;
  }
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
