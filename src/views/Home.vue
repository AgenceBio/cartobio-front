<template>
  <div>
    <h1>{{msg}}</h1>
  </div>
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
<style lang="scss">
h1 {
  top: 30px;
  position: fixed;
  color: #ffffff;
}
</style>
