import { computed, ref, type Ref } from "vue";
import { fetchBilanEnvois } from "@/api/endpoints/tableau-de-bord.api";
import { formatStartOfDay, formatEndOfDay } from "@/utils/date.formatters";
import type { BilanFiltres, BilanEnvoiItem, PageResult, OrdreTri } from "@/types/tableau-de-bord";

export const STATUT_OPTIONS = [
  { value: "VALID", label: "Validé" },
  { value: "REJECTED", label: "Rejeté" },
];

export const ETAT_OPTIONS = [
  { value: "CREATION", label: "Création" },
  { value: "UPDATED", label: "Mise à jour" },
  { value: "UNKNOWN", label: "—" },
];

export function useBilanFiltres(options: {
  fromBase: Ref<Date | null>;
  toBase: Ref<Date | null>;
  bilanEnvois: Ref<PageResult<BilanEnvoiItem>>;
  isLoading: Ref<boolean>;
}) {
  const { fromBase, toBase, bilanEnvois, isLoading } = options;

  const statutFiltreBrouillon = ref<string[]>([]);
  const etatFiltreBrouillon = ref<string[]>([]);
  const filtresBilanAppliques = ref<BilanFiltres>({});
  const rechercheBilanBrouillon = ref<string>("");
  const filtreMenuOuvert = ref<boolean>(false);
  const ordreDate = ref<OrdreTri>("desc");

  const nombreFiltresActifs = computed(
    () => (filtresBilanAppliques.value.statuts?.length ?? 0) + (filtresBilanAppliques.value.etats?.length ?? 0),
  );

  function toggleFiltreMenu() {
    if (!filtreMenuOuvert.value) {
      statutFiltreBrouillon.value = [...(filtresBilanAppliques.value.statuts ?? [])];
      etatFiltreBrouillon.value = [...(filtresBilanAppliques.value.etats ?? [])];
    }
    filtreMenuOuvert.value = !filtreMenuOuvert.value;
  }

  async function chargerBilanEnvois(page: number) {
    if (!fromBase.value || !toBase.value) return;
    isLoading.value = true;
    bilanEnvois.value = await fetchBilanEnvois(page, formatStartOfDay(fromBase.value), formatEndOfDay(toBase.value), {
      ...filtresBilanAppliques.value,
      ordreDate: ordreDate.value,
    });
    isLoading.value = false;
  }

  async function changerTriDate() {
    ordreDate.value = ordreDate.value === "asc" ? "desc" : "asc";
    await chargerBilanEnvois(1);
  }

  async function validerFiltresBilan() {
    filtresBilanAppliques.value = {
      ...filtresBilanAppliques.value,
      statuts: [...statutFiltreBrouillon.value],
      etats: [...etatFiltreBrouillon.value],
    };
    filtreMenuOuvert.value = false;
    await chargerBilanEnvois(1);
  }

  function reinitialiserFiltresBilan() {
    statutFiltreBrouillon.value = [];
    etatFiltreBrouillon.value = [];
  }

  async function validerRechercheBilan() {
    filtresBilanAppliques.value = {
      ...filtresBilanAppliques.value,
      recherche: rechercheBilanBrouillon.value.trim(),
    };
    await chargerBilanEnvois(1);
  }

  async function changerPageBilan(page: number) {
    await chargerBilanEnvois(page);
  }

  return {
    statutFiltreBrouillon,
    etatFiltreBrouillon,
    filtresBilanAppliques,
    rechercheBilanBrouillon,
    filtreMenuOuvert,
    nombreFiltresActifs,
    ordreDate,
    toggleFiltreMenu,
    chargerBilanEnvois,
    changerTriDate,
    validerFiltresBilan,
    reinitialiserFiltresBilan,
    validerRechercheBilan,
    changerPageBilan,
  };
}
