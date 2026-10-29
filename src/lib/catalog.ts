import { cacheLife, cacheTag } from "next/cache";
import type { Catalog, DeliveryDestination, GovService } from "./types";

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
  ["inside_egypt", "Egypt", "EG", 50],
  ["outside_egypt", "Saudi Arabia", "SA", 250],
  ["outside_egypt", "United Arab Emirates", "AE", 250],
  ["outside_egypt", "Qatar", "QA", 250],
  ["outside_egypt", "United Kingdom", "GB", 400],
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

export async function getCatalog(): Promise<Catalog> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");

  try {
    const [services, destinations] = await Promise.all([
      getJson<GovService[]>("/services"),
      getJson<DeliveryDestination[]>("/delivery/destinations"),
    ]);
    return {
      services: services.map((s) => ({ ...s, servicePrice: Number(s.servicePrice) })),
      destinations: destinations.map((d) => ({ ...d, deliveryFee: Number(d.deliveryFee) })),
      live: true,
    };
  } catch {
    return { services: fallbackServices, destinations: fallbackDestinations, live: false };
  }
}
