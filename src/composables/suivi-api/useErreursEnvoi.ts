import { computed, type Ref } from "vue";
import { isInErrorGroup } from "@/utils/error-api.utils";
import type { ErreurEnvoi, GroupeErreursParcelle } from "@/types/suivi-api";

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

export function useErreursEnvoi(source: Ref<{ erreurs?: ErreurEnvoi[]; statut?: string | null } | null>) {
  const erreurs = computed<ErreurEnvoi[]>(() => source.value?.erreurs ?? []);

  const erreursOperateur = computed(() => erreurs.value.filter((e) => isInErrorGroup("import", e.code)));

  const erreursDatesParcellaire = computed(() => erreurs.value.filter((e) => isInErrorGroup("dateValidation", e.code)));

  const erreursParcelles = computed(() => erreurs.value.filter((e) => isInErrorGroup("parcelErrors", e.code)));

  const erreursParcellesGroupees = computed(() => grouperErreursParcelles(erreursParcelles.value));

  const warningsParcelles = computed(() =>
    erreurs.value.filter((e) => e.parcelleId && isInErrorGroup("parcelWarnings", e.code)),
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
