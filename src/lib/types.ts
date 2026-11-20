export type ServiceField = {
  id: string;
  keyName: string;
  labelEn: string;
  labelAr: string;
  fieldType: "text" | "date" | "select" | "number";
  isRequired: boolean;
  showForAnotherPerson: boolean;
  options: { value: string; labelEn: string; labelAr: string }[] | null;
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
