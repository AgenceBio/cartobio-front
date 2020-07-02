<template>
  <div class="pa-3">
    <v-subheader class="text--cyan">Numéro de PACAGE</v-subheader>

    <p class="body-1 grey--text text--darken-2">
      Renseigner le numéro de PACAGE pour afficher
      les parcelles de l'exploitation.
    </p>

    <v-text-field outline autofocus single-line
                  clearable full-width
                  browser-autocomplete="off"
                  :loading="isLoading" />

    <v-btn round color="#b9d065" :loading="isLoading">Sauvegarder</v-btn>
  </div>
</template>

<script>

export default {
  name: "OperatorSidebarPacage",
  props: {
    operator: Object,
  },
  data () {
    return {
      isLoading: false
    }
  },
  computed: {
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
</style>
