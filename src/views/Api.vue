<template>
  <div>
    <HomeNavbar></HomeNavbar>

    <v-content>
      <v-container>
        <h1>{{ title }}</h1>

        <v-layout flex>
          <v-flex xs12 md9>
            <markdown />
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>

    <Partners />
  </div>
</template>

<script>
import HomeNavbar from "@/components/HomeNavbar";
import Partners from "@/components/Partners";
import {vue, attributes} from "../../docs/api.md";

export default {
  name: "Changelog",
  components: {
    HomeNavbar,
    Partners,
    markdown: vue.component,
  },

  data () {
    return attributes
  },

  metaInfo: {
    title: attributes.title,
  }
};
</script>


<style lang="scss">
  @import "~prismjs/themes/prism.css";

  code {
    -webkit-box-shadow: none !important;
    box-shadow: none !important;

    &::before,
    &::after {
      content: "";
      display: none;
    }
  }

  .footnotes-sep {
    display: none;
  }

  .footnotes {
    border: 2px dashed #bbb;
    padding: 1em;
    margin: 1.5em 0;
    text-align: left;
  }
</style>
