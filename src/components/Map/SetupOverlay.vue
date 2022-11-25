<template>
  <div class="overlay">
    <slot />
  </div>
</template>

<style scoped>
.overlay {
  background-color: #000a;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-weight: bold;
  height: 100%;
  position: absolute;
  width: 100%;
}
</style>
