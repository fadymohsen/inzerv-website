import type { Locale } from "./i18n";

/** [English, Arabic] nationality names, alphabetical by English. */
const NATIONALITIES: [string, string][] = [
  ["Afghan", "أفغاني"], ["Albanian", "ألباني"], ["Algerian", "جزائري"], ["American", "أمريكي"], ["Andorran", "أندوري"],
  ["Angolan", "أنغولي"], ["Antiguan", "أنتيغوي"], ["Argentine", "أرجنتيني"], ["Armenian", "أرميني"], ["Australian", "أسترالي"],
  ["Austrian", "نمساوي"], ["Azerbaijani", "أذربيجاني"], ["Bahamian", "باهامي"], ["Bahraini", "بحريني"], ["Bangladeshi", "بنغلاديشي"],
  ["Barbadian", "بربادوسي"], ["Belarusian", "بيلاروسي"], ["Belgian", "بلجيكي"], ["Belizean", "بليزي"], ["Beninese", "بنيني"],
  ["Bhutanese", "بوتاني"], ["Bolivian", "بوليفي"], ["Bosnian", "بوسني"], ["Botswanan", "بوتسواني"], ["Brazilian", "برازيلي"],
  ["British", "بريطاني"], ["Bruneian", "بروناوي"], ["Bulgarian", "بلغاري"], ["Burkinabe", "بوركيني"], ["Burmese", "ميانماري"],
  ["Burundian", "بوروندي"], ["Cambodian", "كمبودي"], ["Cameroonian", "كاميروني"], ["Canadian", "كندي"], ["Cape Verdean", "رأس أخضري"],
  ["Central African", "أفريقي أوسط"], ["Chadian", "تشادي"], ["Chilean", "تشيلي"], ["Chinese", "صيني"], ["Colombian", "كولومبي"],
  ["Comorian", "قمري"], ["Congolese", "كونغولي"], ["Costa Rican", "كوستاريكي"], ["Croatian", "كرواتي"], ["Cuban", "كوبي"],
  ["Cypriot", "قبرصي"], ["Czech", "تشيكي"], ["Danish", "دنماركي"], ["Djiboutian", "جيبوتي"], ["Dominican", "دومينيكاني"],
  ["Dutch", "هولندي"], ["East Timorese", "تيموري"], ["Ecuadorian", "إكوادوري"], ["Egyptian", "مصري"], ["Emirati", "إماراتي"],
  ["Equatorial Guinean", "غيني استوائي"], ["Eritrean", "إريتري"], ["Estonian", "إستوني"], ["Eswatini", "سوازيلندي"], ["Ethiopian", "إثيوبي"],
  ["Fijian", "فيجي"], ["Filipino", "فلبيني"], ["Finnish", "فنلندي"], ["French", "فرنسي"], ["Gabonese", "غابوني"],
  ["Gambian", "غامبي"], ["Georgian", "جورجي"], ["German", "ألماني"], ["Ghanaian", "غاني"], ["Greek", "يوناني"],
  ["Grenadian", "غرينادي"], ["Guatemalan", "غواتيمالي"], ["Guinean", "غيني"], ["Guinea-Bissauan", "غيني بيساوي"], ["Guyanese", "غيانا"],
  ["Haitian", "هايتي"], ["Honduran", "هندوراسي"], ["Hungarian", "مجري"], ["Icelandic", "آيسلندي"], ["Indian", "هندي"],
  ["Indonesian", "إندونيسي"], ["Iranian", "إيراني"], ["Iraqi", "عراقي"], ["Irish", "أيرلندي"], ["Italian", "إيطالي"],
  ["Ivorian", "إيفواري"], ["Jamaican", "جامايكي"], ["Japanese", "ياباني"], ["Jordanian", "أردني"], ["Kazakh", "كازاخستاني"],
  ["Kenyan", "كيني"], ["Kiribati", "كيريباتي"], ["Kosovar", "كوسوفي"], ["Kuwaiti", "كويتي"], ["Kyrgyz", "قيرغيزي"],
  ["Lao", "لاوسي"], ["Latvian", "لاتفي"], ["Lebanese", "لبناني"], ["Liberian", "ليبيري"], ["Libyan", "ليبي"],
  ["Liechtensteiner", "ليختنشتايني"], ["Lithuanian", "ليتواني"], ["Luxembourgish", "لوكسمبورغي"], ["Macedonian", "مقدوني"], ["Malagasy", "مدغشقري"],
  ["Malawian", "مالاوي"], ["Malaysian", "ماليزي"], ["Maldivian", "مالديفي"], ["Malian", "مالي"], ["Maltese", "مالطي"],
  ["Marshallese", "جزر مارشال"], ["Mauritanian", "موريتاني"], ["Mauritian", "موريشيوسي"], ["Mexican", "مكسيكي"], ["Micronesian", "ميكرونيزي"],
  ["Moldovan", "مولدوفي"], ["Monacan", "موناكي"], ["Mongolian", "منغولي"], ["Montenegrin", "جبل أسود"], ["Moroccan", "مغربي"],
  ["Mozambican", "موزمبيقي"], ["Namibian", "ناميبي"], ["Nauruan", "ناوري"], ["Nepalese", "نيبالي"], ["New Zealander", "نيوزيلندي"],
  ["Nicaraguan", "نيكاراغوي"], ["Nigerian", "نيجيري"], ["Nigerien", "نيجري"], ["North Korean", "كوري شمالي"], ["Norwegian", "نرويجي"],
  ["Omani", "عماني"], ["Pakistani", "باكستاني"], ["Palauan", "بالاوي"], ["Palestinian", "فلسطيني"], ["Panamanian", "بنمي"],
  ["Papua New Guinean", "بابوا غينيا الجديدة"], ["Paraguayan", "باراغواي"], ["Peruvian", "بيروفي"], ["Polish", "بولندي"], ["Portuguese", "برتغالي"],
  ["Qatari", "قطري"], ["Romanian", "روماني"], ["Russian", "روسي"], ["Rwandan", "رواندي"], ["Saint Lucian", "سانت لوسي"],
  ["Salvadoran", "سلفادوري"], ["Samoan", "ساموا"], ["San Marinese", "سان مارينو"], ["Sao Tomean", "ساو تومي"], ["Saudi", "سعودي"],
  ["Senegalese", "سنغالي"], ["Serbian", "صربي"], ["Seychellois", "سيشيلي"], ["Sierra Leonean", "سيراليوني"], ["Singaporean", "سنغافوري"],
  ["Slovak", "سلوفاكي"], ["Slovenian", "سلوفيني"], ["Solomon Islander", "جزر سليمان"], ["Somali", "صومالي"], ["South African", "جنوب أفريقي"],
  ["South Korean", "كوري جنوبي"], ["South Sudanese", "جنوب سوداني"], ["Spanish", "إسباني"], ["Sri Lankan", "سريلانكي"], ["Sudanese", "سوداني"],
  ["Surinamese", "سورينامي"], ["Swedish", "سويدي"], ["Swiss", "سويسري"], ["Syrian", "سوري"], ["Taiwanese", "تايواني"],
  ["Tajik", "طاجيكي"], ["Tanzanian", "تنزاني"], ["Thai", "تايلندي"], ["Togolese", "توغولي"], ["Tongan", "تونغي"],
  ["Trinidadian", "ترينيدادي"], ["Tunisian", "تونسي"], ["Turkish", "تركي"], ["Turkmen", "تركماني"], ["Tuvaluan", "توفالو"],
  ["Ugandan", "أوغندي"], ["Ukrainian", "أوكراني"], ["Uruguayan", "أوروغواي"], ["Uzbek", "أوزبكي"], ["Vanuatuan", "فانواتو"],
  ["Venezuelan", "فنزويلي"], ["Vietnamese", "فيتنامي"], ["Yemeni", "يمني"], ["Zambian", "زامبي"], ["Zimbabwean", "زيمبابوي"],
];

export function nationalityOptions(locale: Locale): { value: string; label: string }[] {
  const idx = locale === "ar" ? 1 : 0;
  const list = NATIONALITIES.map((n) => n[idx]);
  if (locale === "ar") list.sort((a, b) => a.localeCompare(b, "ar"));
  return list.map((n) => ({ value: n, label: n }));
}
