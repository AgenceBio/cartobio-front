<template>
  <div class="py-3">
    <section class="px-3">
      <p class="d-flex" v-if="isSupposedToHaveParcels">
        <v-icon color="red darken-3 mr-3">warning</v-icon>
        Désolé, nous n'avons pas trouvé de parcelles pour cet opérateur.
      </p>

      <v-subheader class="text--cyan">Renseigner le parcellaire</v-subheader>

      <p class="body-1 grey--text text--darken-2">
        Vous pouvez renseigner le parcellaire de l'opérateur&nbsp;bio n°{{ operator.numeroBio }}
        ({{ operator.title }}) pour les afficher dans CartoBio.
      </p>
    </section>

    <v-expansion-panel elevation-0>
      <v-expansion-panel-content>
        <template v-slot:header>
          <h3 class="subtitle">Par copié/collé</h3>
        </template>

        <v-form class="pa-3">
          <v-textarea outline full-width hide-details rows="10" />
        </v-form>
      </v-expansion-panel-content>


        <v-expansion-panel-content>
          <template v-slot:header>
            <h3 class="subtitle">Par upload de fichier</h3>
          </template>

          <v-form class="pa-3">
            <input type="file">
          </v-form>
        </v-expansion-panel-content>
    </v-expansion-panel>
  </div>
</template>

<script>
import {mapState} from 'vuex';

export default {
  name: "OperatorSidebarParcelsSubmit",
  props: {
    operator: Object,
  },

  data () {
    return {
      isValid: false,
    }
  },

  methods: {

  },

  computed: {
    ...mapState('user', ['apiToken']),
    ...mapState({
      isLoading: state => state.operators.isUpdatingOperator,
      baseDate: state => state.lastDataUpdate,
    }),

    isSupposedToHaveParcels () {
      const baseDate = new Date(this.baseDate)
      const referenceDate = new Date(this.operator.dateEngagement || this.operator.dateMaj)

      return this.operator.numeroPacage && (baseDate >= referenceDate)
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

section {
  text-align: left;
}
</style>
