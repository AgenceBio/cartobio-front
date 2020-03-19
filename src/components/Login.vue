<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" persistent max-width="600px">
      <template v-slot:activator="{ on }">
        <v-btn flat v-on="on">Connexion</v-btn>
      </template>
      <v-card v-on:keyup.enter="tryLogin()">
        <v-toolbar card color="#b9d065">
          <v-card-title>
            <h3 class="headline mb-0">Connexion à CartoBio</h3>
          </v-card-title>
          <v-spacer />
          <v-btn icon outline @click="dialog = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12>
                <p
                  v-show="loginFailed"
                  class="red--text text-xs-center"
                >Email ou mot de passe erroné</p>
              </v-flex>
              <v-flex xs12>
                <v-text-field label="Email*" v-model="login" autofocus required></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field label="Mot de passe*" v-model="password" type="password" required></v-text-field>
              </v-flex>
              <div><a href="https://notification.agencebio.org/forgotPassword" target="_blank">Mot de passe oublié ?</a></div>
        
            </v-layout>
          </v-container>
          </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" flat @click="dialog = false" :disabled="loading">Annuler</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            type="submit"
            @click="tryLogin()"
            :loading="loading"
            :disabled="loading"
          >Connexion</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
import getObjectValue from 'lodash/get';

import {mapActions} from 'vuex'
import {authenticateWithCredentials} from '@/api/user.js'

export default {
  name: "Login",
  props: [""],
  data: () => ({
    loginFailed: false,
    login: "",
    password: "",
    dialog: false,
    loader: null,
    loading: false,
    user: {}
  }),
  methods: {
    ...mapActions('user', ['getProfile']),
    tryLogin: function() {
      this.loader = "loading";
      this.loading = true;
      this.loginFailed = false;

      const {login, password} = this;

      authenticateWithCredentials({login, password})
        .then(({token, decodedToken}) => {
          this.$ls.set("token", token, decodedToken.exp);
          return this.getProfile(token);
        })
        .then(userData => {
          this.user = userData;
           window._paq.push(['trackEvent',
            "login", // event category : login
            "Success", // event Action : success
            getObjectValue(this.user, ["organismeCertificateur", "nom"], "Utilisateur non OC") // event name : name of the OC
          ]);
          this.loading = false;
          this.loader = null;

          return userData
        })
        .then(
          () =>
            function() {
              if (
                this.$store.getters.getUserCategory ===
                this.$store.getters.getCategories.oc
              ) {
                this.$router.push("notifications");
              }
            }
        )
        .catch(error => {
          console.error(error);
          this.loading = false;
          this.loader = null;
          this.loginFailed = true;
          window._paq.push(['trackEvent',
            "login",
            "Failed",
            error
          ]);
        });
    }
  },

  watch: {
    dialog (newValue) {
      if (newValue === false) {
        this.$refs.form.reset()
      }
    }
  }
};
</script>
