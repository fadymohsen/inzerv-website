/** Delivery zones for Egypt and approved Gulf countries. */

export type EgyptZone = {
  id: string;
  nameEn: string;
  nameAr: string;
  governorates: { en: string; ar: string }[];
};

export const EGYPT_ZONES: EgyptZone[] = [
  {
    id: "greater_cairo",
    nameEn: "Greater Cairo",
    nameAr: "القاهرة الكبرى",
    governorates: [
      { en: "Cairo", ar: "القاهرة" },
      { en: "Giza", ar: "الجيزة" },
      { en: "Qalyubia", ar: "القليوبية" },
    ],
  },
  {
    id: "alexandria",
    nameEn: "Alexandria",
    nameAr: "الإسكندرية",
    governorates: [{ en: "Alexandria", ar: "الإسكندرية" }],
  },
  {
    id: "delta",
    nameEn: "Nile Delta & North Coast",
    nameAr: "الوجه البحري والدلتا",
    governorates: [
      { en: "Beheira", ar: "البحيرة" },
      { en: "Gharbia", ar: "الغربية" },
      { en: "Monufia", ar: "المنوفية" },
      { en: "Dakahlia", ar: "الدقهلية" },
      { en: "Kafr El Sheikh", ar: "كفر الشيخ" },
      { en: "Damietta", ar: "دمياط" },
      { en: "Sharqia", ar: "الشرقية" },
    ],
  },
  {
    id: "canal",
    nameEn: "Canal Cities",
    nameAr: "مدن القناة",
    governorates: [
      { en: "Port Said", ar: "بورسعيد" },
      { en: "Ismailia", ar: "الإسماعيلية" },
      { en: "Suez", ar: "السويس" },
    ],
  },
  {
    id: "upper_egypt",
    nameEn: "Upper Egypt",
    nameAr: "محافظات الصعيد",
    governorates: [
      { en: "Fayoum", ar: "الفيوم" },
      { en: "Beni Suef", ar: "بني سويف" },
      { en: "Minya", ar: "المنيا" },
      { en: "Assiut", ar: "أسيوط" },
      { en: "Sohag", ar: "سوهاج" },
      { en: "Qena", ar: "قنا" },
      { en: "Luxor", ar: "الأقصر" },
      { en: "Aswan", ar: "أسوان" },
    ],
  },
  {
    id: "remote",
    nameEn: "Remote & Border Areas",
    nameAr: "المناطق البعيدة والحدودية",
    governorates: [
      { en: "Matrouh", ar: "مطروح" },
      { en: "Red Sea", ar: "البحر الأحمر" },
      { en: "New Valley", ar: "الوادي الجديد" },
      { en: "North Sinai", ar: "شمال سيناء" },
      { en: "South Sinai", ar: "جنوب سيناء" },
    ],
  },
];

export const GULF_COUNTRIES: { en: string; ar: string; code: string }[] = [
  { en: "Saudi Arabia", ar: "المملكة العربية السعودية", code: "SA" },
  { en: "United Arab Emirates", ar: "الإمارات العربية المتحدة", code: "AE" },
  { en: "Kuwait", ar: "الكويت", code: "KW" },
  { en: "Qatar", ar: "قطر", code: "QA" },
];

/** Returns the Egypt zone a governorate belongs to, matched by English name. */
export function getEgyptZone(governorateEn: string): EgyptZone | undefined {
  const lower = governorateEn.toLowerCase();
  return EGYPT_ZONES.find((z) =>
    z.governorates.some((g) => g.en.toLowerCase() === lower),
  );
}
