<template>
  <v-layout row justify-center>
    <v-dialog v-model="dialog" persistent max-width="600px">
      <template v-slot:activator="{ on }">
        <v-btn flat v-on="on">Connexion</v-btn>
      </template>
      <v-card v-on:keyup.enter="tryLogin()">
        <v-card-title>
          <div>
            <h3 class="headline mb-0">Connexion</h3>
            <div>Connectez vous avec votre compte Agence Bio</div>
          </div>
        </v-card-title>
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
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="dialog = false" :disabled="loading">Annuler</v-btn>
          <v-btn
            color="blue darken-1"
            flat
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
const axios = require("axios");
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
    tryLogin: function() {
      this.loader = "loading";
      this.loading = true;
      this.loginFailed = false;
      let params = {
        email: this.login,
        motDePasse: this.password
      };
      axios
        .post(
          "https://preprod-notification.agencebio.org:444/portail/auth/login",
          params
        )
        .then(data => this.treatAuthToken(data.data.token))
        .then(data => {
          return axios.get(
            "https://preprod-notification.agencebio.org:444/portail/users/" +
              data.id
          );
        })
        .then(data => {
          this.user = data.data;
          console.log(this.user);
          this.loading = false;
          this.loader = null;
        })
        .then(() => this.$store.commit("setUser", this.user))
        .then(() => this.$store.commit("setUserCategory", this.user.groupes[0].nom))
        .catch(error => {
          console.error(error);
          this.loading = false;
          this.loader = null;
          this.loginFailed = true;
        });
    },
    treatAuthToken: function(token) {
      axios.defaults.headers.common["Authorization"] = "Bearer " + token;
      let decodedToken = this.parseJwt(token);
      this.$ls.set("token", token, decodedToken.exp);
      return decodedToken;
    },
    parseJwt: function(token) {
      var base64Url = token.split(".")[1];
      var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      var jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function(c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      return JSON.parse(jsonPayload);
    }
  }
};
</script>
