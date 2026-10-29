/** Governorates / states per country-code used in the delivery form. */

type Region = { en: string; ar: string };

const data: Record<string, Region[]> = {
  EG: [
    { en: "Cairo", ar: "القاهرة" },
    { en: "Giza", ar: "الجيزة" },
    { en: "Alexandria", ar: "الإسكندرية" },
    { en: "Qalyubia", ar: "القليوبية" },
    { en: "Dakahlia", ar: "الدقهلية" },
    { en: "Sharqia", ar: "الشرقية" },
    { en: "Gharbia", ar: "الغربية" },
    { en: "Monufia", ar: "المنوفية" },
    { en: "Beheira", ar: "البحيرة" },
    { en: "Kafr El Sheikh", ar: "كفر الشيخ" },
    { en: "Damietta", ar: "دمياط" },
    { en: "Port Said", ar: "بورسعيد" },
    { en: "Ismailia", ar: "الإسماعيلية" },
    { en: "Suez", ar: "السويس" },
    { en: "North Sinai", ar: "شمال سيناء" },
    { en: "South Sinai", ar: "جنوب سيناء" },
    { en: "Beni Suef", ar: "بني سويف" },
    { en: "Fayoum", ar: "الفيوم" },
    { en: "Minya", ar: "المنيا" },
    { en: "Assiut", ar: "أسيوط" },
    { en: "Sohag", ar: "سوهاج" },
    { en: "Qena", ar: "قنا" },
    { en: "Luxor", ar: "الأقصر" },
    { en: "Aswan", ar: "أسوان" },
    { en: "Red Sea", ar: "البحر الأحمر" },
    { en: "New Valley", ar: "الوادي الجديد" },
    { en: "Matrouh", ar: "مطروح" },
  ],
  SA: [
    { en: "Riyadh", ar: "الرياض" },
    { en: "Makkah", ar: "مكة المكرمة" },
    { en: "Madinah", ar: "المدينة المنورة" },
    { en: "Eastern Province", ar: "المنطقة الشرقية" },
    { en: "Asir", ar: "عسير" },
    { en: "Tabuk", ar: "تبوك" },
    { en: "Hail", ar: "حائل" },
    { en: "Northern Borders", ar: "الحدود الشمالية" },
    { en: "Jazan", ar: "جازان" },
    { en: "Najran", ar: "نجران" },
    { en: "Al Baha", ar: "الباحة" },
    { en: "Al Jawf", ar: "الجوف" },
    { en: "Qassim", ar: "القصيم" },
  ],
  AE: [
    { en: "Abu Dhabi", ar: "أبو ظبي" },
    { en: "Dubai", ar: "دبي" },
    { en: "Sharjah", ar: "الشارقة" },
    { en: "Ajman", ar: "عجمان" },
    { en: "Umm Al Quwain", ar: "أم القيوين" },
    { en: "Ras Al Khaimah", ar: "رأس الخيمة" },
    { en: "Fujairah", ar: "الفجيرة" },
  ],
  QA: [
    { en: "Doha", ar: "الدوحة" },
    { en: "Al Rayyan", ar: "الريان" },
    { en: "Al Wakrah", ar: "الوكرة" },
    { en: "Al Khor", ar: "الخور" },
    { en: "Al Shamal", ar: "الشمال" },
    { en: "Al Daayen", ar: "الضعاين" },
    { en: "Umm Salal", ar: "أم صلال" },
    { en: "Al Shahaniya", ar: "الشحانية" },
  ],
  GB: [
    { en: "England", ar: "إنجلترا" },
    { en: "Scotland", ar: "اسكتلندا" },
    { en: "Wales", ar: "ويلز" },
    { en: "Northern Ireland", ar: "أيرلندا الشمالية" },
  ],
};

export function getRegions(countryCode: string): Region[] {
  return data[countryCode] ?? [];
}
