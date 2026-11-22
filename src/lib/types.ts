export type ServiceField = {
  id: string;
  keyName: string;
  labelEn: string;
  labelAr: string;
  fieldType: "text" | "date" | "select" | "number";
  isRequired: boolean;
  showForAnotherPerson: boolean;
  options: { value: string; labelEn: string; labelAr: string; price?: number }[] | null;
  sortOrder: number;
};

export type ServiceDocument = {
  id: string;
  keyName: string;
  labelEn: string;
  labelAr: string;
  isRequired: boolean;
  showForAnotherPerson: boolean;
  allowedTypes: string[] | null;
  maxSizeMb: number | null;
  sortOrder: number;
  /** Frontend-only: hint text shown below the upload label. */
  hintEn?: string;
  hintAr?: string;
  /** Frontend-only: allow picking multiple files for this document slot. */
  allowMultiple?: boolean;
};

export type GeoRule = { code: string; cities: { en: string; ar: string }[] | null }[];

export type GovService = {
  id: string;
  type: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  servicePrice: number;
  estimatedProcessingTime: string | null;
  sortOrder?: number;
  subtitleEn?: string | null;
  subtitleAr?: string | null;
  iconKey?: string | null;
  accentColor?: string | null;
  /** Policy set in the admin console. Missing on older backends: treat as permissive. */
  allowMyself?: boolean;
  allowOther?: boolean;
  isBlocked?: boolean;
  relationshipRule?: "first" | "both";
  residenceRule?: GeoRule | null;
  deliveryRule?: GeoRule | null;
  paymentNoticeEn?: string | null;
  paymentNoticeAr?: string | null;
  /** null/undefined = unlimited copies. 1 = hide copies selector, lock to 1. */
  maxCopies?: number | null;
  fields: ServiceField[];
  requiredDocuments: ServiceDocument[];
};

export type DeliveryDestination = {
  id: string;
  zone: "inside_egypt" | "outside_egypt";
  country: string;
  countryCode: string;
  deliveryFee: number;
  zoneNameEn?: string | null;
  zoneNameAr?: string | null;
  /** Governorates the admin assigned to this zone (Egypt). */
  governorates?: { en: string; ar: string }[] | null;
};

export type ExtrasConfig = {
  authPrice: number;
  translationPrice: number;
  languages: { value: string; label: string }[];
};

export type Catalog = {
  services: GovService[];
  destinations: DeliveryDestination[];
  extras: ExtrasConfig;
  live: boolean;
};

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};
