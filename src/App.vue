<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-side-icon></v-toolbar-side-icon>
      <img alt="Agence Bio logo" :src="require('../src/assets/agence-bio.png')" class="logo">
      <v-toolbar-title>CartoBIO</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items class="hidden-sm-and-down">
        <v-btn flat href="#home" @click="$refs.fullpage.api.moveTo('home')">Home</v-btn>
        <v-btn flat href="#problem" @click="$refs.fullpage.api.moveTo('problem')">Problem</v-btn>
        <v-btn flat href="#about" @click="$refs.fullpage.api.moveTo('about')">About</v-btn>
        <v-btn flat href="#partners" @click="$refs.fullpage.api.moveTo('partners')">Partners</v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-content>
      <full-page ref="fullpage" :options="options" id="fullpage">
        <div class="section" id="section-1">
          <div class="section-container centered">
            <Home msg="Welcome to CartoBIO"/>
          </div>
        </div>
        <div class="section" id="section-2">
          <div class="section-container centered">
            <Problem/>
          </div>
        </div>
        <div class="section">
          <div class="section-container centered">
            <About/>
          </div>
        </div>
        <div class="section">
          <div class="section-container centered">
            <Partners/>
          </div>
        </div>
      </full-page>
    </v-content>
    <!-- <v-footer app></v-footer> -->
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
    return {
      options: {
        anchors: ["home", "problem", "about", "partners"],
        sectionsColor: ["#ffffff", "#ffffff", "#ffffff", "#ffffff"],
        controlArrows: true
      }
    };
  }
};
</script>

<style lang="scss">
@import "/fullpage.js/dist/fullpage.min.css";
@import "@material/toolbar/mdc-toolbar";
* {
  margin: 0;
  padding: 0;
}

a {
  color: white;
}

.section {
  text-align: center;
  background-size: cover;
}

.logo {
  height: 40px;
}

.section-container {
  height: calc(100% - 70px);
}

#section-1 {
  background-image: url("assets/Campagne-les-Boulonnais_-_Vue_aérienne.jpg");
}

#section-2 {
  background-image: url("assets/bio-free.jpg");
}

.centered {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}
</style>
