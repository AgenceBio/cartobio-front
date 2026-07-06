export enum ErrorCode {
  // Import
  UNKNOWN_NUMERO_BIO = 'UNKNOWN_NUMERO_BIO',
  NOT_PRODUCTION = 'NOT_PRODUCTION',
  NO_OC = 'NO_OC',
  OC_MISMATCH = 'OC_MISMATCH',
  INVALID_JSON = 'INVALID_JSON',

  // Validation des dates
  INVALID_DATE_CERTIFICATION_DEBUT = 'INVALID_DATE_CERTIFICATION_DEBUT',
  INVALID_DATE_CERTIFICATION_FIN = 'INVALID_DATE_CERTIFICATION_FIN',
  INVALID_DATE_AUDIT = 'INVALID_DATE_AUDIT',

  // Validation des parcelles - erreurs
  INVALID_ETAT_PRODUCTION = 'INVALID_ETAT_PRODUCTION',
  MISSING_DATE_ENGAGEMENT = 'MISSING_DATE_ENGAGEMENT',
  INVALID_DATE_ENGAGEMENT = 'INVALID_DATE_ENGAGEMENT',
  MISSING_CULTURES = 'MISSING_CULTURES',
  INVALID_CPF = 'INVALID_CPF',
  INVALID_GEOM = 'INVALID_GEOM',

  // Validation des parcelles - warnings
  MISSING_GEOM = 'MISSING_GEOM',
  GEOM_OUT_OF_BOUNDS = 'GEOM_OUT_OF_BOUNDS',
  GEOM_CORRECTED = 'GEOM_CORRECTED',
  GEOM_INVALID_NOT_CORRECTED = 'GEOM_INVALID_NOT_CORRECTED',

  // Interne
  DB_ERROR='DB_ERROR'
}

export enum ErrorType {
  ERROR = 'error',
  WARNING = 'warning',
}

export type MessageVariant = 'full' | 'short';

export const ErrorMessages: Record<
  ErrorCode,
  Record<MessageVariant, string>
> = {
  [ErrorCode.UNKNOWN_NUMERO_BIO]: {
    full: 'Numéro bio inconnu du portail de notification',
    short: 'Numéro bio inconnu',
  },

  [ErrorCode.NOT_PRODUCTION]: {
    full: 'Numéro bio sans notification liée à une activité de production',
    short: 'Aucune activité de production',
  },

  [ErrorCode.NO_OC]: {
    full: 'Aucun organisme certificateur pour ce numéro bio.',
    short: 'Aucun organisme certificateur',
  },

  [ErrorCode.OC_MISMATCH]: {
    full: 'Numéro client différent',
    short: 'Numéro client différent',
  },

  [ErrorCode.INVALID_JSON]: {
    full: 'Le fichier JSON est invalide.',
    short: 'JSON invalide',
  },

  [ErrorCode.INVALID_DATE_CERTIFICATION_DEBUT]: {
    full: 'Champ dateCertificationDebut incorrect',
    short: 'Date de certification de début invalide',
  },

  [ErrorCode.INVALID_DATE_CERTIFICATION_FIN]: {
    full: 'Champ dateCertificationFin incorrect',
    short: 'Date de certification de fin invalide',
  },

  [ErrorCode.INVALID_DATE_AUDIT]: {
    full: 'Champ dateAudit incorrect',
    short: 'Date d’audit invalide',
  },

  [ErrorCode.INVALID_ETAT_PRODUCTION]: {
    full: 'Champ etatProduction incorrect',
    short: 'État de production invalide',
  },

  [ErrorCode.MISSING_DATE_ENGAGEMENT]: {
    full: 'Champ dateEngagement obligatoire lorsque la parcelle est en conversion',
    short: 'Date d’engagement obligatoire',
  },

  [ErrorCode.INVALID_DATE_ENGAGEMENT]: {
    full: 'Champ dateEngagement incorrect',
    short: 'Date d’engagement invalide',
  },

  [ErrorCode.MISSING_CULTURES]: {
    full: 'Cultures absentes',
    short: 'Cultures absentes',
  },

  [ErrorCode.INVALID_CPF]: {
    full: 'Cultures inconnues : {codes}',
    short: 'Cultures inconnues',
  },

  [ErrorCode.INVALID_GEOM]: {
    full: 'Champ geom incorrect : {detail}',
    short: 'Géométrie invalide',
  },

  [ErrorCode.MISSING_GEOM]: {
    full: "Parcelle {id} n'a pas de géométrie",
    short: 'Géométrie absente',
  },

  [ErrorCode.GEOM_OUT_OF_BOUNDS]: {
    full: 'Parcelle {id} en dehors des régions autorisées',
    short: 'Hors zone autorisée',
  },

  [ErrorCode.GEOM_CORRECTED]: {
    full: 'Ces parcelles ont été corrigées : {ids}',
    short: 'Géométrie corrigée',
  },

  [ErrorCode.GEOM_INVALID_NOT_CORRECTED]: {
    full: "Ces parcelles n'ont pas été corrigées mais sont invalides : {ids}",
    short: 'Géométrie invalide non corrigée',
  },
  [ErrorCode.DB_ERROR]: {
    full: "Une erreur interne est survenue dans Cartobio",
    short: 'Erreur interne à Cartobio',
  },
};

export const ErrorTypes: Partial<Record<ErrorCode, ErrorType>> = {
  [ErrorCode.MISSING_GEOM]: ErrorType.WARNING,
  [ErrorCode.GEOM_OUT_OF_BOUNDS]: ErrorType.WARNING,
  [ErrorCode.GEOM_CORRECTED]: ErrorType.WARNING,
  [ErrorCode.GEOM_INVALID_NOT_CORRECTED]: ErrorType.WARNING,
};

export const getErrorMessage = (
  code: ErrorCode,
  variant: MessageVariant = 'full',
  params?: Record<string, string | number>,
): string => {
  let message = ErrorMessages[code]?.[variant] ?? code;

  if (!params) {
    return message;
  }

  Object.entries(params).forEach(([key, value]) => {
    message = message.replace(`{${key}}`, String(value));
  });

  return message;
};

export const getErrorType = (code: ErrorCode): ErrorType =>
  ErrorTypes[code] ?? ErrorType.ERROR;

export const ErrorGroups = {
  import: [
    ErrorCode.UNKNOWN_NUMERO_BIO,
    ErrorCode.NOT_PRODUCTION,
    ErrorCode.NO_OC,
    ErrorCode.OC_MISMATCH,
    ErrorCode.INVALID_JSON,
  ],

  dateValidation: [
    ErrorCode.INVALID_DATE_CERTIFICATION_DEBUT,
    ErrorCode.INVALID_DATE_CERTIFICATION_FIN,
    ErrorCode.INVALID_DATE_AUDIT,
  ],

  parcelErrors: [
    ErrorCode.INVALID_ETAT_PRODUCTION,
    ErrorCode.MISSING_DATE_ENGAGEMENT,
    ErrorCode.INVALID_DATE_ENGAGEMENT,
    ErrorCode.MISSING_CULTURES,
    ErrorCode.INVALID_CPF,
    ErrorCode.INVALID_GEOM,
  ],

  parcelWarnings: [
    ErrorCode.MISSING_GEOM,
    ErrorCode.GEOM_OUT_OF_BOUNDS,
    ErrorCode.GEOM_CORRECTED,
    ErrorCode.GEOM_INVALID_NOT_CORRECTED,
  ],
} as const;

export const ErrorColors: Record<ErrorCode, string> = {
  [ErrorCode.UNKNOWN_NUMERO_BIO]: "#E3C324",
  [ErrorCode.NOT_PRODUCTION]: "#D17A00",
  [ErrorCode.NO_OC]: "#9C6B30",
  [ErrorCode.OC_MISMATCH]: "#C94C4C",
  [ErrorCode.INVALID_JSON]: "#7F1D1D",

  [ErrorCode.INVALID_DATE_CERTIFICATION_DEBUT]: "#7B61FF",
  [ErrorCode.INVALID_DATE_CERTIFICATION_FIN]: "#5B45C8",
  [ErrorCode.INVALID_DATE_AUDIT]: "#A55CAE",

  [ErrorCode.INVALID_ETAT_PRODUCTION]: "#D1495B",
  [ErrorCode.MISSING_DATE_ENGAGEMENT]: "#CC5F00",
  [ErrorCode.INVALID_DATE_ENGAGEMENT]: "#A13D63",
  [ErrorCode.MISSING_CULTURES]: "#FF833D",
  [ErrorCode.INVALID_CPF]: "#CC6C2B",
  [ErrorCode.INVALID_GEOM]: "#5850EC",

  [ErrorCode.MISSING_GEOM]: "#6667E9",
  [ErrorCode.GEOM_OUT_OF_BOUNDS]: "#0078A3",
  [ErrorCode.GEOM_CORRECTED]: "#008C6A",
  [ErrorCode.GEOM_INVALID_NOT_CORRECTED]: "#5C5C5C",
};

export const getErrorColor = (code: ErrorCode | string): string => {
  return ErrorColors[code as ErrorCode] ?? "#929292";
};

export const getErrorTextColor = (code: ErrorCode | string): string => {
  const color = getErrorColor(code).replace("#", "");

  const red = parseInt(color.slice(0, 2), 16);
  const green = parseInt(color.slice(2, 4), 16);
  const blue = parseInt(color.slice(4, 6), 16);

  const luminance = (red * 0.299 + green * 0.587 + blue * 0.114) / 255;

  return luminance > 0.62 ? "#161616" : "#FFFFFF";
};