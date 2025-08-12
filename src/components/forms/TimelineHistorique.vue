<template>
  <div class="history-tl-container">
    <ul class="tl">
      <li v-for="(item, index) in historique" :key="index" class="tl-item">
        <div class="tl-point"></div>
        <div class="tl-content">
          <div class="timestamp">
            {{ item.annee_controle }}
          </div>
          <div class="item-detail">
            <ConversionLevel :level="getConversionLevel(item.conversion_niveau)" />
            <span>{{
              item.cultures.length > 1 ? "Multiculture" : fromCodeCpf(item.cultures[0].CPF).libelle_code_cpf
            }}</span>
            <span v-if="getHistoriqueRota(index)" class="badge">Rotation</span>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import ConversionLevel from "@/components/records/Table/ConversionLevel.vue";
import { fromCodeCpf } from "@agencebio/rosetta-cultures";
import { LEVEL_MAYBE_AB, LEVEL_UNKNOWN, getConversionLevel, isABLevel } from "@/referentiels/ab.js";

const props = defineProps<{
  historique: {
    cultures: { CPF: string }[];
    conversion_niveau: string;
    annee_controle: number;
    correspondance_geometrie: string;
  }[];
}>();

const getHistoriqueRota = (index: number) => {
  const currentCultures = props.historique[index].cultures.map((c) => c.CPF);

  if (currentCultures.length !== 1) return null;
  const cpf = currentCultures[0];

  let count = 1;
  if (index < props.historique.length - 1) {
    const prev = props.historique[index + 1].cultures.map((c) => c.CPF);
    if (prev.includes(cpf)) count++;
  }
  // année suivante
  if (index > 0) {
    const next = props.historique[index - 1].cultures.map((c) => c.CPF);
    if (next.includes(cpf)) count++;
  }

  if (count === 2) return "yellow";
  if (count === 3) return "red";
  return null;
};
</script>

<style scoped>
.history-tl-container {
  width: 100%;
  position: relative;
  margin: 2rem 0;
}

.tl {
  padding: 0;
  list-style: none;
  position: relative;
}

.tl::before {
  content: "";
  position: absolute;
  top: 0;
  left: 20px;
  width: 4px;
  height: 100%;
  background: #33c24d;
}

.tl-item {
  position: relative;
  display: flex;
  align-items: center;
  margin-left: 50px;
  margin-bottom: 1rem;
}

.tl-point {
  position: absolute;
  left: -36px;
  background: #33c24d;
  border-radius: 50%;
  height: 16px;
  width: 16px;
}

.tl-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.timestamp {
  font-weight: bold;
  color: #161616;
  font-size: 1rem;
}

.item-detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* .badge {
  background: #ffc107;
  color: #000;
  padding: 0.2rem 0.5rem;
  border-radius: 0.3rem;
  font-size: 0.75rem;
  font-weight: bold;
} */
</style>
