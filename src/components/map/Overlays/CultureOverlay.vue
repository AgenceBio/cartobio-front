<template>
  <div class="openlayers-culture-overlay">
    <div class="badge-container" @click="test">
      <div class="badge" :class="cssClass"><i class="fr-icon" :class="icon" aria-hidden="true" />{{ label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  cssClass: string;
  icon: string;
  label: string;
}

defineProps<Props>();

function test() {
  console.log("hello");
}
</script>

<style scoped>
.openlayers-culture-overlay .badge-container {
  background-color: white;
  padding: 4px;
  border-radius: 21px;
  transform: translate(-52%, -177%);
}
.openlayers-culture-overlay .badge-container::after {
  content: "";
  position: absolute;
  top: 99%;
  right: 50%;
  transform: translateX(50%);
  border-width: 10px;
  border-style: solid;
  border-color: white transparent transparent transparent;
  border-bottom: 4px solid transparent;
}
.openlayers-culture-overlay .badge {
  padding: 4px 12px;
  display: flex;
  gap: 5px;
  border-radius: 16px;
  border: 1px solid;
  align-items: center;
}

.openlayers-culture-overlay .badge-a-modifier {
  color: var(--text-default-error);
  background-color: var(--red-marianne-925-125);
  border: 1px solid var(--red-marianne-925-125);
}
.openlayers-culture-overlay .badge-CONV {
  color: var(--green-tilleul-verveine-sun-418-moon-817);
  background-color: var(--green-tilleul-verveine-925-125);
  border: 1px solid var(--green-tilleul-verveine-850-200);
}
.openlayers-culture-overlay .badge-C1 {
  color: var(--green-bourgeon-sun-425-moon-759);
  background-color: var(--green-bourgeon-975-75);
  border: 1px solid var(--green-bourgeon-850-200);
}
.openlayers-culture-overlay .badge-C2 {
  color: var(--green-bourgeon-sun-425-moon-759);
  background-color: var(--green-bourgeon-950-100);
  border: 1px solid var(--green-bourgeon-850-200);
}
.openlayers-culture-overlay .badge-C3 {
  color: var(--green-bourgeon-sun-425-moon-759);
  background-color: var(--green-bourgeon-925-125);
  border: 1px solid var(--green-bourgeon-850-200);
}
.openlayers-culture-overlay .badge-AB {
  color: white;
  background-color: var(--green-bourgeon-sun-425-moon-759);
  border: 1px solid var(--green-bourgeon-sun-425-moon-759);
}
</style>
