import { ref, computed, type Ref } from "vue";
import { fetchEnvoisRejetes } from "@/api/endpoints/tableau-de-bord.api";
import { formatStartOfDay, formatEndOfDay } from "@/utils/date.formatters";
import { ErrorGroups, type ErrorCode } from "@/utils/error-api.utils";
import type { PageResult, BilanEnvoiItem, OrdreTri } from "@/types/tableau-de-bord";

export type GroupeAnomalie = keyof typeof ErrorGroups;

export function useEnvoisRejetes(options: { fromBase: Ref<Date | null>; toBase: Ref<Date | null> }) {
  const { fromBase, toBase } = options;

  const envoisRejetes = ref<PageResult<BilanEnvoiItem>>({
    data: [],
    meta: { total: 0, page: 1, limit: 5 },
  });
  const rechercheRejetsBrouillon = ref<string>("");
  const rechercheRejetsAppliquee = ref<string>("");
  const ordreDate = ref<OrdreTri>("desc");

  const filtreGroupeOuvert = ref(false);
  const groupeFiltreBrouillon = ref<GroupeAnomalie | null>(null);
  const groupeFiltreApplique = ref<GroupeAnomalie | null>(null);

  const codesFiltres = computed<ErrorCode[] | undefined>(() =>
    groupeFiltreApplique.value ? [...ErrorGroups[groupeFiltreApplique.value]] : undefined,
  );

  function optionsRequete(limit?: number) {
    return {
      recherche: rechercheRejetsAppliquee.value,
      ordreDate: ordreDate.value,
      codes: codesFiltres.value,
      ...(limit ? { limit } : {}),
    };
  }

  async function chargerEnvoisRejetes(page: number) {
    if (!fromBase.value || !toBase.value) return;
    envoisRejetes.value = await fetchEnvoisRejetes(
      page,
      formatStartOfDay(fromBase.value),
      formatEndOfDay(toBase.value),
      optionsRequete(),
    );
  }

  function fetchRejetsFiltres(page: number, from: string, to: string, limit?: number) {
    return fetchEnvoisRejetes(page, from, to, optionsRequete(limit));
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

  function toggleFiltreGroupe() {
    filtreGroupeOuvert.value = !filtreGroupeOuvert.value;
  }

  async function validerFiltreGroupe() {
    groupeFiltreApplique.value = groupeFiltreBrouillon.value;
    filtreGroupeOuvert.value = false;
    await chargerEnvoisRejetes(1);
  }

  async function reinitialiserFiltreGroupe() {
    groupeFiltreBrouillon.value = null;
    groupeFiltreApplique.value = null;
    await chargerEnvoisRejetes(1);
  }

  return {
    envoisRejetes,
    rechercheRejetsBrouillon,
    rechercheRejetsAppliquee,
    ordreDate,
    filtreGroupeOuvert,
    groupeFiltreBrouillon,
    groupeFiltreApplique,
    codesFiltres,
    changerTriDate,
    chargerEnvoisRejetes,
    fetchRejetsFiltres,
    validerRechercheRejets,
    changerPageRejetes,
    toggleFiltreGroupe,
    validerFiltreGroupe,
    reinitialiserFiltreGroupe,
  };
}
