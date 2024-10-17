<template>
  <div class="fr-container--fluid fr-py-9v">
    <div class="fr-container">
      <div class="fr-grid-row">
        <div class="fr-col-12">
          <h2 class="fr-h4">Les chiffres</h2>
        </div>
      </div>
      <div class="tableauPlaceholder" id="viz1729071118803" style="position: relative">
        <object class="tableauViz" style="display: none">
          <param name="host_url" value="https%3A%2F%2Fpublic.tableau.com%2F" />
          <param name="embed_code_version" value="3" />
          <param name="site_root" value="" />
          <param name="name" value="Pagestatistique/StatistiqueCartoBio" />
          <param name="tabs" value="no" />
          <param name="toolbar" value="yes" />
          <param
            name="static_image"
            value="https://public.tableau.com/static/images/Pa/Pagestatistique/StatistiqueCartoBio/1.png"
          />
          <param name="animate_transition" value="yes" />
          <param name="display_static_image" value="yes" />
          <param name="display_spinner" value="yes" />
          <param name="display_overlay" value="yes" />
          <param name="display_count" value="yes" />
          <param name="language" value="fr-FR" />
          <param name="filter" value="publish=yes" />
        </object>
      </div>
      <div class="fr-grid-row" v-if="$slots['footer-link']">
        <p class="fr-col-12 fr-mt-3w">
          <slot name="footer-link" />
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";

onMounted(async () => {
  const divElement = document.getElementById("viz1729071118803");
  const vizElement = divElement.getElementsByTagName("object")[0];

  if (divElement.offsetWidth > 800) {
    vizElement.style.minWidth = "1069px";
    vizElement.style.maxWidth = "1869px";
    vizElement.style.width = "100%";
    vizElement.style.minHeight = "1360px";
    vizElement.style.maxHeight = "2060px";
    //vizElement.style.height=(divElement.offsetWidth_0.75)+'px';
  } else if (divElement.offsetWidth > 500) {
    vizElement.style.minWidth = "1069px";
    vizElement.style.maxWidth = "1869px";
    vizElement.style.width = "100%";
    vizElement.style.minHeight = "1360px";
    vizElement.style.maxHeight = "2060px";
    //vizElement.style.height=(divElement.offsetWidth_0.75)+'px';
  } else {
    vizElement.style.width = "100%";
    vizElement.style.height = "4327px";
  }

  const scriptElement = document.createElement("script");
  scriptElement.src = "https://public.tableau.com/javascripts/api/viz_v1.js";
  divElement.insertBefore(scriptElement, vizElement);
});
</script>
