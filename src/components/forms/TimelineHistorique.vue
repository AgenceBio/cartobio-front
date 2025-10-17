<template>
  <div>
    <div v-if="isRotaErrors" class="fr-ml-2w" :class="isRotaErrors === 'jaune' ? 'badge-rota-2' : 'badge-rota-3'">
      <div v-if="isRotaErrors === 'jaune'"><i class="ri-exchange-funds-line fr-mr-1w"></i> ROTATION À CONTRÔLER</div>
      <div v-if="isRotaErrors === 'rouge'"><i class="ri-exchange-funds-line fr-mr-1w"></i> ROTATION NON CONFORME</div>
    </div>

    <div class="history-tl-container">
      <ul class="tl">
        <li v-for="(item, index) in historique" :key="index" class="tl-item">
          <template v-if="index > 0">
            <div class="tl-point"></div>
            <div class="tl-content">
              <div class="timestamp">
                {{ item.annee_controle }}
              </div>
              <div class="item-detail">
                <ConversionLevel :level="getConversionLevel(item.conversion_niveau)" noIcon labelSelector />
                <i v-if="getHistoriqueRota(index) > 1" class="ri-exchange-funds-line"></i>

                <p v-if="item.cultures.length > 1" class="fr-mb-0">
                  Multiculture <span class="fr-sr-only"> : </span>
                  <br />
                  <small v-for="(culture, i) in item.cultures" :key="i">
                    <span v-if="i">, </span> {{ cultureLabel(culture) }}
                  </small>
                </p>
                <span v-else>{{ fromCodeCpf(item.cultures[0].CPF)?.libelle_code_cpf ?? "-" }}</span>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="current-point">
              <div class="tl-point-actual"></div>
              <div class="timestamp">En cours</div>
            </div>
            <div class="tl-content currentelement">
              <div class="item-detail">
                <ConversionLevel :level="getConversionLevel(item.conversion_niveau)" noIcon labelSelector />
                <i v-if="getHistoriqueRota(index) > 1" class="ri-exchange-funds-line"></i>

                <p v-if="item.cultures.length > 1" class="fr-mb-0">
                  Multiculture <span class="fr-sr-only"> : </span>
                  <br />
                  <small v-for="(culture, i) in item.cultures" :key="i">
                    <span v-if="i">, </span> {{ cultureLabel(culture) }}
                  </small>
                </p>
                <span v-else>{{ fromCodeCpf(item.cultures[0].CPF)?.libelle_code_cpf ?? "-" }}</span>
              </div>
            </div>
          </template>
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
import { cultureLabel } from "@/utils/features.js";

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
  if (!currentCultures || currentCultures.cultures.length !== 1) return 0;

  let count = 1;

  for (let i = index - 1; i >= 0; i--) {
    const voisin = props.historique[i];
    if (!voisin) break;

    const match = voisin.cultures.some((c) => currentCultures.cultures.some((a) => c.CPF === a.CPF));
    if (match) {
      count++;
    } else {
      break;
    }
  }
  for (let i = index + 1; i < props.historique.length; i++) {
    const voisin = props.historique[i];
    if (!voisin) break;

    const match = voisin.cultures.some((c) => currentCultures.cultures.some((a) => c.CPF === a.CPF));
    if (match) {
      count++;
    } else {
      break;
    }
  }

  return count;
};

const isRotaErrors = computed(() => {
  if (!props.historique) return null;
  const max = getHistoriqueRota(0);

  return max >= 3 ? "rouge" : max > 1 ? "jaune" : null;
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
  background: #95e257;
  z-index: 0;
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
  background: #95e257;
  border-radius: 50%;
  height: 16px;
  width: 16px;
}

.tl-point-actual {
  background: #00450d;
  border-radius: 50%;
  height: 16px;
  width: 16px;
  z-index: 2;
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

.badge-rota-2 > div {
  background: rgba(254, 236, 194, 1);
  color: rgba(113, 96, 67, 1);
  padding: 0.1rem 0.3rem;
  border-radius: 0.3rem;
  font-size: 0.75rem;
  font-weight: bold;
  width: fit-content;
}

.badge-rota-3 > div {
  background: var(--red-marianne-925-125);
  color: #000;
  padding: 0.1rem 0.3rem;
  border-radius: 0.3rem;
  font-size: 0.75rem;
  font-weight: bold;
  width: fit-content;
}

.current-point {
  background-color: rgba(149, 226, 87, 1);
  position: absolute;
  left: -41px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 4px 5px;
  gap: 3px;
  display: flex;
  border-radius: 20px;
  z-index: 10;
}

.currentelement {
  margin-left: 80px;
}
</style>
