import { ref, type Ref } from "vue";
import { fetchEnvoisRejetes } from "@/api/endpoints/tableau-de-bord.api";
import { formatStartOfDay, formatEndOfDay } from "@/utils/date.formatters";
import type { PageResult, BilanEnvoiItem, OrdreTri } from "@/types/tableau-de-bord";

export function useEnvoisRejetes(options: { fromBase: Ref<Date | null>; toBase: Ref<Date | null> }) {
  const { fromBase, toBase } = options;

  const envoisRejetes = ref<PageResult<BilanEnvoiItem>>({
    data: [],
    meta: { total: 0, page: 1, limit: 5 },
  });
  const rechercheRejetsBrouillon = ref<string>("");
  const rechercheRejetsAppliquee = ref<string>("");
  const ordreDate = ref<OrdreTri>("desc");

  async function chargerEnvoisRejetes(page: number) {
    if (!fromBase.value || !toBase.value) return;
    envoisRejetes.value = await fetchEnvoisRejetes(
      page,
      formatStartOfDay(fromBase.value),
      formatEndOfDay(toBase.value),
      { recherche: rechercheRejetsAppliquee.value, ordreDate: ordreDate.value },
    );
  }

  async function changerTriDate() {
    ordreDate.value = ordreDate.value === "asc" ? "desc" : "asc";
    await chargerEnvoisRejetes(1);
  }

  async function validerRechercheRejets() {
    rechercheRejetsAppliquee.value = rechercheRejetsBrouillon.value.trim();
    await chargerEnvoisRejetes(1);
  }

  async function changerPageRejetes(page: number) {
    await chargerEnvoisRejetes(page);
  }

  return {
    envoisRejetes,
    rechercheRejetsBrouillon,
    rechercheRejetsAppliquee,
    ordreDate,
    changerTriDate,
    chargerEnvoisRejetes,
    validerRechercheRejets,
    changerPageRejetes,
  };
}
