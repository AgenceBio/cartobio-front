<template>
  <div>
    <h2 class="section-title">Partenaires</h2>
    <div flex>
      <img alt="IGN logo" src="../assets/ign.png" class="logo">
      <a
        href="https://entrepreneur-interet-general.etalab.gouv.fr/defis/2019/cartobio.html"
        target="_blank"
      >
        <img alt="EIG logo" src="../assets/logo-eig2.png" class="logo">
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: "partners"
};
</script>

<style scoped>
.logo {
  max-height: 100px;
  width: auto;
  margin-left: 20px;
  margin-right: 20px;
}

.section-title {
  margin-bottom: 100px;
}
</style>
