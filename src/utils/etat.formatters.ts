export function formatEtat(etat: string | undefined | null): string {
  if (etat === "UNKNOWN") return "—";
  return etat === "UPDATED" ? "Mise à jour" : "Création";
}

export function formatEtatLong(etat: string | undefined | null): string {
  if (etat === "UNKNOWN") return "—";
  return etat === "UPDATED" ? "Mise à jour du parcellaire" : "Création du parcellaire";
}

export function formatStatut(statut: string | undefined | null): string {
  return statut === "VALID" ? "Validé" : "Rejeté";
}

export function statutBadgeClass(statut: string | undefined | null): string {
  return statut === "VALID" ? "fr-badge--success" : "fr-badge--error";
}
