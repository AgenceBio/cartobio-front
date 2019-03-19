<template>
  <v-app>
    <v-toolbar app color="#b9d065">
      <a href="https://www.agencebio.org/" target="_blank">
        <img alt="Agence Bio logo" :src="require('../src/assets/agence-bio.png')" class="logo">
      </a>
      <v-toolbar-title>CartoBIO</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items class="hidden-sm-and-down">
        <v-btn flat href="#/home" @click="$vuetify.goTo('#home', options)">Accueil</v-btn>
        <v-btn flat href="#/objectives" @click="$vuetify.goTo('#problem', options)">Objectifs</v-btn>
        <v-btn flat href="#/about" @click="$vuetify.goTo('#about', options)">L'équipe</v-btn>
        <v-btn flat href="#/partners" @click="$vuetify.goTo('#partners', options)">Partenaires</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-content>
      <section id="home">
        <v-parallax :src="require('../src/assets/coquelicots.jpg')" height="400">
          <Home msg="Bienvenue sur CartoBIO"/>
        </v-parallax>
      </section>
      <section id="problem">
        <v-layout column wrap class="my-5" align-center>
          <Problem/>
        </v-layout>
      </section>
      <section id="parallax">
        <v-parallax :src="require('../src/assets/coquelicots.jpg')" height="400"></v-parallax>
      </section>
      <section id="about">
        <v-layout column wrap class="my-5" align-center>
          <About/>
        </v-layout>
      </section>
    </v-content>
    <v-footer id="partners" height="auto" color="#b9d065">
      <Partners/>
    </v-footer>
  </v-app>
</template>

<script>
// @ is an alias to /src
import Home from "@/views/Home";
import About from "@/views/About";
import Problem from "@/views/Problem";
import Partners from "@/components/Partners";

export default {
  name: "App",
  components: {
    Home,
    Problem,
    About,
    Partners
  },
  data() {
    return {};
  }
};
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
}

a {
  color: white;
}

section {
  text-align: center;
}

.logo {
  height: 40px;
}

.section-container {
  height: calc(100% - 70px);
}

.centered {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}

.icon-eig {
  background-image: url("../src/assets/eig.png");
  background-position: center;
  background-size: 24px;
}

.v-icon.bio-green.theme--light {
  color: #b9d065;
}

.primary-green {
  background-color: #b9d065 !important;
  border-color: #b9d065 !important;
}
</style>
