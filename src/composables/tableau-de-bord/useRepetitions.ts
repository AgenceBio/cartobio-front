import { computed, ref } from "vue";
import type { RepetitionGroupe, RepetitionEnvoi } from "@/types/tableau-de-bord";

export function clefGroupe(groupe: RepetitionGroupe): string {
  return `${groupe.numeroBio}-${groupe.numeroClient}-${groupe.auditDate}`;
}

export function typeRepetition(groupe: RepetitionGroupe): "envois" | "refus" {
  return groupe.envois[0]?.statut === "VALID" ? "envois" : "refus";
}

export function labelRepetition(groupe: RepetitionGroupe): string {
  return groupe.numeroClient ? `N°Client ${groupe.numeroClient}` : `N°Bio ${groupe.numeroBio}`;
}

const APERCU_NB = 3;

export function useRepetitions() {
  const repetitions = ref<RepetitionGroupe[]>([]);
  const repetitionsMasquees = ref<Set<string>>(new Set());
  const modalAlertes = ref(false);
  const vueAlertes = ref<"liste" | "detail">("liste");
  const selectedRepetitionGroupe = ref<RepetitionGroupe | null>(null);
  const selectedRepetitionEnvoi = ref<RepetitionEnvoi | null>(null);
  const groupeAOuvrirKey = ref<string | null>(null);
  const rechercheAlertesBrouillon = ref("");
  const rechercheAlertesAppliquee = ref("");

  const alertesPage = ref(1);
  const alertesLimit = ref(8);
  const alertesTotal = ref(0);
  const alertesMaxPage = computed(() => Math.max(1, Math.ceil(alertesTotal.value / alertesLimit.value)));

  const repetitionsVisibles = computed(() =>
    repetitions.value.filter((groupe) => !repetitionsMasquees.value.has(clefGroupe(groupe))),
  );

  const repetitionsApercu = computed(() => repetitionsVisibles.value.slice(0, APERCU_NB));

  const repetitionsRestantes = computed(() => Math.max(repetitionsVisibles.value.length - APERCU_NB, 0));

  function masquerRepetition(groupe: RepetitionGroupe) {
    repetitionsMasquees.value.add(clefGroupe(groupe));
  }

  function ouvrirModalAlertes(groupe?: RepetitionGroupe) {
    modalAlertes.value = true;
    vueAlertes.value = "liste";
    groupeAOuvrirKey.value = groupe ? clefGroupe(groupe) : null;
  }

  function fermerModalAlertes() {
    modalAlertes.value = false;
    vueAlertes.value = "liste";
    selectedRepetitionGroupe.value = null;
    selectedRepetitionEnvoi.value = null;
    groupeAOuvrirKey.value = null;
  }

  function ouvrirDetailRepetition(groupe: RepetitionGroupe, envoi: RepetitionEnvoi) {
    selectedRepetitionGroupe.value = groupe;
    selectedRepetitionEnvoi.value = envoi;
    vueAlertes.value = "detail";
  }

  function retourListeAlertes() {
    vueAlertes.value = "liste";
  }

  function validerRechercheAlertes() {
    rechercheAlertesAppliquee.value = rechercheAlertesBrouillon.value.trim();
    alertesPage.value = 1;
  }

  function changerPageAlertes(page: number) {
    alertesPage.value = page;
  }

  return {
    repetitions,
    repetitionsMasquees,
    modalAlertes,
    vueAlertes,
    selectedRepetitionGroupe,
    selectedRepetitionEnvoi,
    groupeAOuvrirKey,
    rechercheAlertesBrouillon,
    rechercheAlertesAppliquee,
    alertesPage,
    alertesLimit,
    alertesTotal,
    alertesMaxPage,
    repetitionsVisibles,
    repetitionsApercu,
    repetitionsRestantes,
    masquerRepetition,
    ouvrirModalAlertes,
    fermerModalAlertes,
    ouvrirDetailRepetition,
    retourListeAlertes,
    validerRechercheAlertes,
    changerPageAlertes,
  };
}
