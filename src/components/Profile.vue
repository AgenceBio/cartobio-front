<template>
  <v-menu bottom offset-y>
    <template v-slot:activator="{ on }">
      <v-btn flat v-on="on" :data-id="user.id" :data-ocid="user.organismeCertificateurId">
        <v-icon class="mr-2">person</v-icon>
        {{ user.nom }}
        <span class="ml-1" v-if="isDemoAccount">(démo)</span>
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
import { mapGetters, mapMutations, mapActions } from 'vuex';

export default {
  name: "Profile",
  props: [],

  methods: {
    ...mapMutations(['resetUser']),
    ...mapMutations({
      resetOperators: 'operators/CLEAR',
      userLogout: 'user/LOGOUT'
    }),
    ...mapActions("user", ["trackEvent"]),

    logout () {
      this.resetUser()
      this.userLogout()
      this.resetOperators()

      this.trackEvent(['logout'])

      window._paq.push(['resetUserId'])
      window._paq.push(['deleteCustomVariable', 1, "visit"])
      window._paq.push(['deleteCustomVariable', 2, "visit"])
      window._paq.push(['appendToTrackingUrl', ''])

      this.$ls.remove("token")
      this.$ls.remove("cartobioToken")
    },
  },
  computed: {
    ...mapGetters({ user: 'getProfile' }),
    ...mapGetters('user', ['isDemoAccount'])
  }
};
</script>
