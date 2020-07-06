<template>
  <div class="pa-3">
    <v-subheader class="text--cyan">Numéro de PACAGE</v-subheader>

    <p class="body-1 grey--text text--darken-2">
      Renseigner le numéro de PACAGE de l'opérateur&nbsp;bio n°{{ operator.numeroBio }}
      ({{ operator.title }}) pour afficher les parcelles de l'exploitation.
    </p>

    <v-form v-model="isValid">
      <v-text-field outline autofocus single-line
                    v-model="newPacage"
                    :counter="9"
                    :rules="[rules.required, rules.digitsonly, rules.pacagepattern]"
                    clearable full-width
                    browser-autocomplete="off"
                    :loading="isLoading" />

      <v-btn round color="#b9d065" @click="savePacage(newPacage)" :disabled="!isValid" :loading="isLoading">Sauvegarder et afficher</v-btn>
    </v-form>

    <v-divider class="my-4" />

    <button class="outline-button" @click="newPacage=null;savePacage(newPacage)">
      <v-icon>info</v-icon>
      Cette exploitation ne demande pas d'aides PAC.
    </button>
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
        required: (value) => !!value || 'Champ obligatoire.',
        digitsonly: (value) => /^[ 0-9]+$/.test(value) || 'L\'identifiant PACAGE contient 9 chiffres.',
        pacagepattern: (value) => /[0-9]{9}/.test(value) || `L'identifiant PACAGE contient 9 chiffres (il en manque ${9 - String(value).trim().length}).`
      }
    }
  },

  methods: {
    savePacage (newPacage) {
      const {numeroBio} = this.operator
      const pacage = newPacage ? String(newPacage).trim() : newPacage

      this.$store.dispatch('operators/UPDATE_OPERATOR', { numeroBio, pacage })
    }
  },

  computed: {
    ...mapState('user', ['apiToken']),
    ...mapState({
      isLoading: state => state.operators.isUpdatingOperator,
    }),

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
