import { ref, type Ref } from "vue";
import { fetchHistoriqueParcellaire } from "@/api/endpoints/tableau-de-bord.api";
import type { HistoriqueEnvoi, ModalContext } from "@/types/tableau-de-bord";

export function useHistoriqueParcellaire(options: { isLoading: Ref<boolean> }) {
  const { isLoading } = options;

  const modalHistoriqueEnvoi = ref<boolean>(false);
  const vueModal = ref<"historique" | "detail">("historique");
  const currentNumeroBio = ref<string | null>(null);
  const currentNumeroClient = ref<string | null>(null);
  const currentAuditDate = ref<string | null>(null);
  const historiqueCurrentParcellaire = ref<HistoriqueEnvoi[]>([]);
  const selectedEnvoi = ref<HistoriqueEnvoi | null>(null);
  const envoiOrigine = ref<HistoriqueEnvoi | null>(null);
  const modalContext = ref<ModalContext | null>(null);

  async function openDetailsEnvoi(envoi: {
    numeroClient: string | null;
    numeroBio: string | null;
    auditDate?: string | null;
    jobId: number | string;
  }) {
    isLoading.value = true;
    modalContext.value = {
      numeroClient: envoi.numeroClient,
      numeroBio: envoi.numeroBio,
      auditDate: envoi.auditDate ?? null,
    };
    currentNumeroClient.value = envoi.numeroClient;
    currentNumeroBio.value = envoi.numeroBio;
    currentAuditDate.value = envoi.auditDate ?? null;
    historiqueCurrentParcellaire.value = await fetchHistoriqueParcellaire(
      envoi.numeroClient,
      envoi.numeroBio,
      envoi.auditDate,
    );
    selectedEnvoi.value =
      historiqueCurrentParcellaire.value.find((item) => String(item.jobId) === String(envoi.jobId)) ??
      historiqueCurrentParcellaire.value[0] ??
      null;
    envoiOrigine.value = selectedEnvoi.value;
    vueModal.value = "detail";
    modalHistoriqueEnvoi.value = true;
    isLoading.value = false;
  }

  function selectHistoriqueEnvoi(envoi: HistoriqueEnvoi) {
    selectedEnvoi.value = envoi;
    vueModal.value = "detail";
  }

  function retourHistorique() {
    vueModal.value = "historique";
  }

  function retournerEnvoiOrigine() {
    selectedEnvoi.value = envoiOrigine.value;
    vueModal.value = "detail";
  }

  function fermerModalHistorique() {
    modalHistoriqueEnvoi.value = false;
    vueModal.value = "historique";
    selectedEnvoi.value = null;
    envoiOrigine.value = null;
  }

  return {
    modalHistoriqueEnvoi,
    vueModal,
    currentNumeroBio,
    currentNumeroClient,
    currentAuditDate,
    historiqueCurrentParcellaire,
    selectedEnvoi,
    envoiOrigine,
    modalContext,
    openDetailsEnvoi,
    selectHistoriqueEnvoi,
    retourHistorique,
    retournerEnvoiOrigine,
    fermerModalHistorique,
  };
}
