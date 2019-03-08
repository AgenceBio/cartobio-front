<template>
  <h1>{{msg}}</h1>
</template>

<script>
// @ is an alias to /src
export default {
  name: "Home",
  components: {},
  props: {
    msg: String
  }
};
</script>
<style lang="scss" scoped>
h1 {
  top: 50px;
  position: fixed;
  color: #ffffff;
}
</style>
