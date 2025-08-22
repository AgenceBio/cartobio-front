<template>
  <div>
    <span v-if="isRotaErrors" class="badge-rota fr-ml-2w">
      <i class="ri-exchange-funds-line fr-mr-1w"></i> ROTATION À CONTRÔLER
    </span>

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
              <i v-if="getHistoriqueRota(index)" class="ri-exchange-funds-line"></i>

              <span>{{
                item.cultures.length > 1 ? "Multiculture" : fromCodeCpf(item.cultures[0].CPF).libelle_code_cpf
              }}</span>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ConversionLevel from "@/components/records/Table/ConversionLevel.vue";
import { fromCodeCpf } from "@agencebio/rosetta-cultures";
import { getConversionLevel } from "@/referentiels/ab.js";

const props = defineProps<{
  historique:
    | {
        cultures: { CPF: string }[];
        conversion_niveau: string;
        annee_controle: number;
        correspondance_geometrie: string;
      }[]
    | null;
}>();

const getHistoriqueRota = (index: number) => {
  const currentCultures = props.historique[index];

  if (currentCultures.cultures.length !== 1) return null;

  let count = 1;
  const nbHisto = props.historique.filter(
    (y) =>
      (y.annee_controle === currentCultures.annee_controle + 1 ||
        y.annee_controle === currentCultures.annee_controle - 1) &&
      currentCultures.cultures.some((a) => y.cultures.some((e) => e.CPF === a.CPF)),
  ).length;
  if (nbHisto) count = count + nbHisto;

  if (count === 2) return "yellow";
  if (count === 3) return "red";
  return null;
};

const isRotaErrors = computed(() => {
  let max = 0;
  if (props.historique) {
    props.historique.forEach((e) => {
      const tempo = props.historique.filter(
        (y) =>
          (y.annee_controle === e.annee_controle + 1 || y.annee_controle === e.annee_controle - 1) &&
          e.cultures.some((a) => y.cultures.some((e) => e.CPF === a.CPF)),
      ).length;

      if (!(tempo + 1 <= max)) max = tempo + 1;
    });
    return max >= 3 ? "rouge" : max > 1 ? "jaune" : null;
  } else return null;
});
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

.badge-rota {
  background: #ffc107;
  color: #000;
  padding: 0.2rem 0.5rem;
  border-radius: 0.3rem;
  font-size: 0.75rem;
  font-weight: bold;
}
</style>
