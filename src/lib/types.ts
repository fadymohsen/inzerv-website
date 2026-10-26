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
  fields: ServiceField[];
  requiredDocuments: ServiceDocument[];
};

export type DeliveryDestination = {
  id: string;
  zone: "inside_egypt" | "outside_egypt";
  country: string;
  countryCode: string;
  deliveryFee: number;
};

export type Catalog = {
  services: GovService[];
  destinations: DeliveryDestination[];
  live: boolean;
};

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};
