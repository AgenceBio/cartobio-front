<template>
  <div>
    <HomeNavbar></HomeNavbar>
    <v-content>
      <section id="title">
        <v-parallax :src="require('../../src/assets/coquelicots.jpg')" height="400">
          <Title msg="Bienvenue sur CartoBIO"/>
        </v-parallax>
      </section>
      <section id="objectives">
        <v-layout column wrap class="my-5" align-center>
          <Problem/>
        </v-layout>
      </section>
      <section id="demo">
        <v-parallax :src="require('../../src/assets/coquelicots.jpg')" height="400">
          <v-layout align-center column justify-center>
            <div>
              <v-card>
                <v-card-title primary-title>
                  <div>
                    <div class="headline">Démo</div>
                    <span class="grey--text">Petite application avec des fonctionnalités réduites</span>
                  </div>
                </v-card-title>
                <v-card-actions>
                  <v-layout align-center column justify-center>
                    <router-link to="/map">
                      <v-btn large color="#b9d065">Go</v-btn>
                    </router-link>
                  </v-layout>
                </v-card-actions>
              </v-card>
            </div>
          </v-layout>
        </v-parallax>
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
  </div>
</template>

<script>
// @ is an alias to /src
import HomeNavbar from "@/components/HomeNavbar";
import Title from "@/views/Title";
import About from "@/views/About";
import Problem from "@/views/Problem";
import Partners from "@/components/Partners";

export default {
  name: "Home",
  components: {
    HomeNavbar,
    Title,
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
  text-decoration: none;
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
  background-image: url("../../src/assets/eig.png");
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
.primary-green--text {
  color: #b9d065 !important;
}
</style>
