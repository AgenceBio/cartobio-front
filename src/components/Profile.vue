<template>
  <v-menu bottom offset-y>
    <template v-slot:activator="{ on }">
      <v-btn flat v-on="on"  :data-id="user.id" :data-ocid="user.organismeCertificateurId">
        <v-icon>person</v-icon>
        {{ user.nom }}
      </v-btn>
    </template>
    <v-list>
      <v-list-tile @click="logout">
        <v-list-tile-title>Se Déconnecter</v-list-tile-title>
      </v-list-tile>
    </v-list>
  </v-menu>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';

export default {
  name: "Profile",
  props: [],
  methods: {
    ...mapMutations(['resetUser']),
    ...mapMutations({
      resetOperators: 'operators/CLEAR',
      userLogout: 'user/LOGOUT'
    }),

    logout () {
      this.resetUser()
      this.userLogout()
      this.resetOperators()

      this.$ls.remove("token")
      this.$ls.remove("cartobioToken")
    },
  },
  computed: {
    ...mapGetters({
      user: 'getProfile'
    })
  }
};
</script>
