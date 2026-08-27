import { computed, type Ref } from "vue";
import { ErrorGroups, type ErrorCode } from "@/utils/error-api.utils";
import type { ErreurEnvoi, GroupeErreursParcelle } from "@/types/tableau-de-bord";

export function grouperErreursParcelles(erreurs: ErreurEnvoi[]): GroupeErreursParcelle[] {
  const groupes = new Map<string, GroupeErreursParcelle>();
  for (const erreur of erreurs) {
    const key =
      erreur.parcelleId !== null && erreur.parcelleId !== undefined
        ? `id-${erreur.parcelleId}`
        : `name-${erreur.parcelleName ?? "inconnue"}`;
    if (!groupes.has(key)) {
      groupes.set(key, {
        key,
        label: erreur.parcelleName ?? `Parcelle ${erreur.parcelleId ?? "inconnue"}`,
        erreurs: [],
      });
    }
    groupes.get(key)!.erreurs.push(erreur);
  }
  return [...groupes.values()];
}

export function useErreursEnvoi(source: Ref<{ erreurs?: ErreurEnvoi[]; statut?: string } | null>) {
  const erreurs = computed<ErreurEnvoi[]>(() => source.value?.erreurs ?? []);

  const erreursOperateur = computed(() =>
    erreurs.value.filter((e) => !e.parcelleId && ErrorGroups.import.includes(e.code as ErrorCode)),
  );

  const erreursDatesParcellaire = computed(() =>
    erreurs.value.filter((e) => !e.parcelleId && ErrorGroups.dateValidation.includes(e.code as ErrorCode)),
  );

  const erreursParcelles = computed(() =>
    erreurs.value.filter((e) => ErrorGroups.parcelErrors.includes(e.code as ErrorCode)),
  );

  const erreursParcellesGroupees = computed(() => grouperErreursParcelles(erreursParcelles.value));

  const warningsParcelles = computed(() =>
    erreurs.value.filter((e) => e.parcelleId && ErrorGroups.parcelWarnings.includes(e.code as ErrorCode)),
  );

  const isInternalJobError = computed(() => source.value?.statut?.toUpperCase() === "ERROR");

  return {
    erreurs,
    erreursOperateur,
    erreursDatesParcellaire,
    erreursParcelles,
    erreursParcellesGroupees,
    warningsParcelles,
    isInternalJobError,
  };
}
