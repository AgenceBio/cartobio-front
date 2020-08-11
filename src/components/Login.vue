<template>
  <v-dialog v-model="show" persistent max-width="600px">
    <v-card v-on:keyup.enter="tryLogin()">
      <v-toolbar card color="#b9d065">
        <v-card-title>
          <h3 class="headline mb-0">Connexion à CartoBio</h3>
        </v-card-title>
        <v-spacer />
        <v-btn icon outline @click="close">
          <v-icon>close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text>
        <v-form :lazy-validation="true" ref="form">
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12>
                <p>
                  Ce service se base sur vos identifiants du
                  <a href="https://notification.agencebio.org/" target="_blank" title="Portail des notifications de l'Agence Bio">portail de <b>notifications de l'Agence Bio</b></a>.
                </p>
                <p v-show="loginFailed" class="red--text text-xs-center">
                  Email ou mot de passe erroné.
                </p>
              </v-flex>
              <v-flex xs12>
                <v-text-field box label="Email" placeholder="" :rules="[rules.required]" v-model="login" autofocus></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field box label="Mot de passe du Portail Notifications" placeholder="" v-model="password" :type="showPassword ? 'text' : 'password'" @click:append="showPassword = !showPassword"  :append-icon="showPassword ? 'visibility' : 'visibility_off'" :rules="[rules.required]"></v-text-field>
                <p>
                  <a href="https://notification.agencebio.org/forgotPassword" target="_blank" class="font-weight-bold">
                    <v-icon small>help_outline</v-icon>
                    Mot de passe oublié
                  </a>
                </p>
              </v-flex>

            </v-layout>
          </v-container>
      </v-form>
      </v-card-text>
      <v-divider class="pt-2"></v-divider>
      <v-card-actions>
        <v-btn color="blue darken-1" flat @click="close" :disabled="loading">Annuler</v-btn>
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
</template>

<script>
import {mapActions, mapMutations} from 'vuex'
import {authenticateWithCredentials} from '@/api/user.js'

export default {
  name: "Login",

  props: {
    show: Boolean
  },

  data: () => ({
    loginFailed: false,
    login: "",
    password: "",
    showPassword: false,
    loading: false,
    rules: {
      required: value => !!value || 'Ce champ est obligatoire.',
    }
  }),

  methods: {
    ...mapActions('user', ['setProfile']),
    ...mapMutations({
      userLogout: 'user/LOGOUT'
    }),

    close () {
      this.userLogout()
      this.$refs.form.reset()
      this.login = ''
      this.password = ''
      this.loginFailed = false
    },

    tryLogin: function() {
      this.loading = true;
      this.loginFailed = false;

      const {login, password} = this;

      authenticateWithCredentials({login, password})
        .then(({ token, decodedToken, cartobioToken }) => {

          this.$ls.set("token", token, decodedToken.exp);
          this.$ls.set("cartobioToken", cartobioToken, decodedToken.exp);

          return this.setProfile(cartobioToken);
        })
        .then(userData => {
           window._paq.push(['trackEvent',
            "login", // event category : login
            "Success", // event Action : success
            userData.organismeCertificateurId ? userData.organismeCertificateur.nom : "Utilisateur non OC" // event name : name of the OC
          ]);
        })
        .catch(error => {
          console.error(error);
          this.loginFailed = true;
          window._paq.push(['trackEvent',
            "login",
            "Failed",
            error
          ]);
        })
        .finally(() => this.loading = false)
    }
  }
};
</script>
