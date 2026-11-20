import { cacheLife, cacheTag } from "next/cache";
import type { Catalog, DeliveryDestination, ExtrasConfig, GovService } from "./types";

import { API_URL } from "./config";

// Shown only when the API cannot be reached at render time. Mirrors the backend seed.
const fallbackServices: GovService[] = [
  {
    id: "",
    type: "birth_certificate",
    nameEn: "Birth Certificate",
    nameAr: "شهادة الميلاد المميكنة",
    descriptionEn:
      "Official birth registration document issued by the Egyptian civil registry.",
    descriptionAr: "وثيقة التسجيل الرسمية للمواليد الصادرة من مصلحة الأحوال المدنية المصرية.",
    servicePrice: 150,
    estimatedProcessingTime: "5–7 business days",
    fields: [],
    requiredDocuments: [],
  },
  {
    id: "",
    type: "family_record",
    nameEn: "Family Record",
    nameAr: "القيد العائلي",
    descriptionEn: "Official family registry extract showing the members of a family unit.",
    descriptionAr: "مستخرج رسمي من سجل الأسرة يوضح أفراد الأسرة.",
    servicePrice: 200,
    estimatedProcessingTime: "7–10 business days",
    fields: [],
    requiredDocuments: [],
  },
  {
    id: "",
    type: "marriage_certificate",
    nameEn: "Marriage Certificate",
    nameAr: "وثيقة الزواج",
    descriptionEn: "Official marriage registration document issued by Egyptian authorities.",
    descriptionAr: "وثيقة رسمية لتسجيل الزواج صادرة من الجهات المصرية.",
    servicePrice: 175,
    estimatedProcessingTime: "5–7 business days",
    fields: [],
    requiredDocuments: [],
  },
];

const fallbackDestinations: DeliveryDestination[] = [
  // Egypt — one entry per delivery zone (zone id used as countryCode prefix for lookup)
  ["inside_egypt", "Egypt — Greater Cairo", "EG", 0],
  ["inside_egypt", "Egypt — Alexandria", "EG", 0],
  ["inside_egypt", "Egypt — Nile Delta & North Coast", "EG", 0],
  ["inside_egypt", "Egypt — Canal Cities", "EG", 0],
  ["inside_egypt", "Egypt — Upper Egypt", "EG", 0],
  ["inside_egypt", "Egypt — Remote & Border Areas", "EG", 0],
  // Gulf countries (approved)
  ["outside_egypt", "Saudi Arabia", "SA", 3790],
  ["outside_egypt", "United Arab Emirates", "AE", 3790],
  ["outside_egypt", "Kuwait", "KW", 3790],
  ["outside_egypt", "Qatar", "QA", 3790],
].map(([zone, country, countryCode, deliveryFee]) => ({
  id: "",
  zone: zone as DeliveryDestination["zone"],
  country: country as string,
  countryCode: countryCode as string,
  deliveryFee: deliveryFee as number,
}));

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`${path} ${res.status}`);
  return res.json() as Promise<T>;
}

const fallbackExtras: ExtrasConfig = {
  authPrice: 500,
  translationPrice: 350,
  languages: [
    { value: "en", label: "English" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "es", label: "Spanish" },
    { value: "it", label: "Italian" },
    { value: "ru", label: "Russian" },
    { value: "zh", label: "Chinese" },
    { value: "ja", label: "Japanese" },
    { value: "pt", label: "Portuguese" },
    { value: "nl", label: "Dutch" },
    { value: "tr", label: "Turkish" },
    { value: "el", label: "Greek" },
    { value: "pl", label: "Polish" },
    { value: "cs", label: "Czech" },
    { value: "ko", label: "Korean" },
    { value: "sv", label: "Swedish" },
    { value: "da", label: "Danish" },
    { value: "hu", label: "Hungarian" },
    { value: "ro", label: "Romanian" },
    { value: "id", label: "Indonesian" },
    { value: "th", label: "Thai" },
    { value: "ur", label: "Urdu" },
    { value: "sw", label: "Swahili" },
    { value: "he", label: "Hebrew" },
  ],
};

export async function getCatalog(): Promise<Catalog> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");

  try {
    const [services, destinations, extras] = await Promise.all([
      getJson<GovService[]>("/services"),
      getJson<DeliveryDestination[]>("/delivery/destinations"),
      getJson<ExtrasConfig>("/services/extras").catch(() => fallbackExtras),
    ]);
    return {
      services: services.map((s) => ({ ...s, servicePrice: Number(s.servicePrice) })),
      destinations: destinations.map((d) => ({ ...d, deliveryFee: Number(d.deliveryFee) })),
      extras,
      live: true,
    };
  } catch {
    return { services: fallbackServices, destinations: fallbackDestinations, extras: fallbackExtras, live: false };
  }
}
