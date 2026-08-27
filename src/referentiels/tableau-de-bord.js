export const API_ERROR = {
  MISSING_NUMERO_BIO: {
    label: "Numéro bio manquant",
    type: "error",
  },
  MISSING_NUMERO_CLIENT: {
    label: "Numéro client manquant",
    type: "error",
  },

  UNKNOWN_NUMERO_BIO: {
    label: "Numéro bio inconnu du portail de notification",
    type: "error",
  },
  NOT_PRODUCTION: {
    label: "Numéro bio sans notification liée à une activité de production",
    type: "error",
  },
  NO_OC: {
    label: "Aucun organisme certificateur pour ce numéro bio.",
    type: "error",
  },
  OC_MISMATCH: {
    label: "Numéro client différent",
    type: "error",
  },

  INVALID_DATE_CERTIFICATION_DEBUT: {
    label: "champ dateCertificationDebut incorrect",
    type: "error",
  },
  INVALID_DATE_CERTIFICATION_FIN: {
    label: "champ dateCertificationFin incorrect",
    type: "error",
  },
  MISSING_CERTIFICATION_DATES: {
    label: "Dates de certification manquantes",
    type: "error",
  },
  INVALID_DATE_AUDIT: {
    label: "champ dateAudit incorrect",
    type: "error",
  },

  INVALID_ETAT_PRODUCTION: {
    label: "champ etatProduction incorrect",
    type: "error",
  },
  MISSING_DATE_ENGAGEMENT: {
    label: "Champ date d’engagement obligatoire lorsque la parcelle est en conversion",
    type: "error",
  },
  INVALID_DATE_ENGAGEMENT: {
    label: "champ dateEngagement incorrect",
    type: "error",
  },
  MISSING_CULTURES: {
    label: "cultures absentes",
    type: "error",
  },
  INVALID_CPF: {
    label: "cultures inconnues: <liste des codes>",
    type: "error",
  },
  INVALID_GEOM: {
    label: "champ geom incorrect : <détail>",
    type: "error",
  },

  DB_ERROR: {
    label: "Erreur base de données",
    type: "error",
  },

  MISSING_GEOM: {
    label: "Parcelle <id> n'a pas de géométrie",
    type: "warning",
  },
  GEOM_OUT_OF_BOUNDS: {
    label: "Parcelle <id> en dehors des régions autorisées",
    type: "warning",
  },
  GEOM_CORRECTED: {
    label: "Ces parcelles ont été corrigées : <liste des id>",
    type: "warning",
  },
  GEOM_INVALID_NOT_CORRECTED: {
    label: "Ces parcelles n'ont pas été corrigées mais sont invalides : <liste des id>",
    type: "warning",
  },
};
