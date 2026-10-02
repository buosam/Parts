import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "ar";

const dict = {
  en: {
    tagline: "Iraq's fitment-guaranteed parts marketplace",
    searchPlaceholder: "Search OEM number or part name…",
    vehicleLocked: "Active vehicle",
    fitmentGuaranteed: "Fitment guaranteed",
    change: "Change",
    heroTitleA: "The right part.",
    heroTitleB: "Verified for your vehicle.",
    heroSub:
      "Live inventory from Al-Sinak warehouses in Baghdad and Erbil's industrial district — every listing checked against your VIN and engine code before you pay.",
    lockVehicle: "Lock vehicle",
    scanCard: "Scan registration card",
    rfqCta: "Request RFQ",
    indexed: "indexed components",
    fitsOnly: "Fits my vehicle",
    allQuality: "All quality",
    allShort: "All",
    genuine: "Genuine OEM",
    oemSpec: "OEM Spec",
    aftermarket: "Aftermarket",
    bestMatch: "Best match",
    priceLow: "Price: low → high",
    priceHigh: "Price: high → low",
    topRated: "Highest rated",
    partsAvailable: "parts available",
    inStock: "In stock",
    onDemand: "On demand",
    order: "Order",
    getOffers: "Get offers",
    fits: "Fits",
    catalogEyebrow: "Live warehouse inventory",
    catalogTitle: "Parts catalog",
    viewGrid: "Grid",
    viewList: "List",
    availability: "Availability",
    brand: "Brand",
    category: "Category",
    quality: "Quality",
    clearAll: "Clear all",
    rfqEyebrow: "Dealer network",
    rfqTitle: "Missing part or rare spec?",
    rfqSub:
      "Tender one RFQ to 45+ verified merchants across Iraq. Offers land in your inbox within hours — no phone calls, no haggling.",
    rfqPlaceholder: "Part name or OEM number…",
    rfqSend: "Send RFQ",
    rfqNote: "Avg. first offer in 3h 40m · free for buyers",
    scanEyebrow: "VIN extraction",
    scanTitle: "Your registration card is the catalog key.",
    scanSub:
      "Photograph your Iraqi registration card. We extract the VIN and engine code, match against the catalog, and lock fitment. Ownership data stays encrypted on your device.",
    scanPoint1: "VIN + engine code extracted in seconds",
    scanPoint2: "Ownership data encrypted, never sold",
    scanPoint3: "Works with all Iraqi governorate cards",
    trust1T: "Fitment guarantee",
    trust1D: "Wrong part? Full refund, return shipping on us.",
    trust2T: "Warehouse-direct",
    trust2D: "Stock synced live from Baghdad & Erbil.",
    trust3T: "45+ verified merchants",
    trust3D: "Every dealer vetted against trade records.",
    trust4T: "Cash on delivery",
    trust4D: "Pay when the part is in your hands.",
    footerTag: "Iraq's automotive spare-parts marketplace.",
    footerCols: ["Marketplace", "Sellers", "Support"],
    footerCities: "Baghdad · Erbil · Basra · Sulaymaniyah",
    navHome: "Home",
    navSearch: "Search",
    navOffers: "Offers",
    navGarage: "Garage",
    navAccount: "Account",
    orderPlaced: "Order placed",
    orderPlacedD: "added to your order — confirmation sent.",
    rfqSent: "RFQ tendered to 45+ merchants",
    rfqSentD: "First offers typically arrive within 4 hours.",
    vehicleSet: "Vehicle locked",
    vehicleSetD: "Catalog now filtered to",
    cart: "Cart",
    resultsFor: "Results for",
    noResults: "No parts match these filters.",
    noResultsD: "Try clearing a filter, or tender an RFQ to the dealer network.",
    filters: "Filters",
  },
  ar: {
    tagline: "سوق قطع الغيار المضمونة التوافق في العراق",
    searchPlaceholder: "ابحث برقم القطعة أو الاسم…",
    vehicleLocked: "المركبة النشطة",
    fitmentGuaranteed: "توافق مضمون",
    change: "تغيير",
    heroTitleA: "القطعة الصحيحة.",
    heroTitleB: "موثّقة لمركبتك.",
    heroSub:
      "مخزون مباشر من مستودعات السناك في بغداد والمنطقة الصناعية في أربيل — كل قطعة تُطابَق مع رقم الهيكل ورمز المحرك قبل الدفع.",
    lockVehicle: "تثبيت المركبة",
    scanCard: "مسح بطاقة التسجيل",
    rfqCta: "طلب عروض أسعار",
    indexed: "قطعة مفهرسة",
    fitsOnly: "تناسب مركبتي فقط",
    allQuality: "كل الجودات",
    allShort: "الكل",
    genuine: "أصلي OEM",
    oemSpec: "مواصفة OEM",
    aftermarket: "تجاري",
    bestMatch: "الأنسب",
    priceLow: "السعر: من الأقل",
    priceHigh: "السعر: من الأعلى",
    topRated: "الأعلى تقييماً",
    partsAvailable: "قطعة متوفرة",
    inStock: "متوفر",
    onDemand: "عند الطلب",
    order: "اطلب",
    getOffers: "اطلب العروض",
    fits: "يناسب",
    catalogEyebrow: "مخزون المستودعات المباشر",
    catalogTitle: "كتالوج القطع",
    viewGrid: "شبكة",
    viewList: "قائمة",
    availability: "التوفر",
    brand: "العلامة",
    category: "الفئة",
    quality: "الجودة",
    clearAll: "مسح الكل",
    rfqEyebrow: "شبكة التجار",
    rfqTitle: "قطعة نادرة أو مواصفة خاصة؟",
    rfqSub:
      "أرسل طلب عرض سعر واحداً إلى أكثر من 45 تاجراً موثّقاً في العراق. تصلك العروض خلال ساعات — بلا مكالمات وبلا مساومة.",
    rfqPlaceholder: "اسم القطعة أو رقم OEM…",
    rfqSend: "أرسل الطلب",
    rfqNote: "أول عرض خلال 3س 40د وسطياً · مجاني للمشترين",
    scanEyebrow: "استخراج رقم الهيكل",
    scanTitle: "بطاقة تسجيلك هي مفتاح الكتالوج.",
    scanSub:
      "صوّر بطاقة التسجيل العراقية. نستخرج رقم الهيكل ورمز المحرك ونطابقهما مع الكتالوج ونثبّت التوافق. بيانات الملكية تبقى مشفّرة على جهازك.",
    scanPoint1: "استخراج رقم الهيكل ورمز المحرك خلال ثوانٍ",
    scanPoint2: "بيانات الملكية مشفّرة ولا تُباع أبداً",
    scanPoint3: "يعمل مع بطاقات كل المحافظات العراقية",
    trust1T: "ضمان التوافق",
    trust1D: "قطعة خاطئة؟ استرداد كامل والشحن علينا.",
    trust2T: "من المستودع مباشرة",
    trust2D: "مخزون متزامن من بغداد وأربيل.",
    trust3T: "+45 تاجراً موثّقاً",
    trust3D: "كل تاجر مُدقَّق في السجلات التجارية.",
    trust4T: "الدفع عند الاستلام",
    trust4D: "ادفع عندما تستلم القطعة بيدك.",
    footerTag: "سوق قطع غيار السيارات في العراق.",
    footerCols: ["السوق", "البائعون", "الدعم"],
    footerCities: "بغداد · أربيل · البصرة · السليمانية",
    navHome: "الرئيسية",
    navSearch: "بحث",
    navOffers: "العروض",
    navGarage: "الكراج",
    navAccount: "حسابي",
    orderPlaced: "تم الطلب",
    orderPlacedD: "أُضيف إلى طلبك — أُرسل التأكيد.",
    rfqSent: "أُرسل الطلب إلى أكثر من 45 تاجراً",
    rfqSentD: "تصل العروض الأولى عادةً خلال 4 ساعات.",
    vehicleSet: "تم تثبيت المركبة",
    vehicleSetD: "الكتالوج مُرشَّح الآن على",
    cart: "السلة",
    resultsFor: "نتائج",
    noResults: "لا توجد قطع تطابق هذه المرشحات.",
    noResultsD: "جرّب مسح مرشح، أو أرسل طلب عرض سعر لشبكة التجار.",
    filters: "المرشحات",
  },
} as const;

export type DictKey = keyof (typeof dict)["en"];

interface LangCtx {
  lang: Lang;
  dir: "ltr" | "rtl";
  t: (k: DictKey) => string;
  tlist: (k: "footerCols") => readonly string[];
  toggle: () => void;
}

const Ctx = createContext<LangCtx>({
  lang: "en",
  dir: "ltr",
  t: (k) => dict.en[k] as string,
  tlist: (k) => dict.en[k],
  toggle: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const value: LangCtx = {
    lang,
    dir,
    t: (k) => dict[lang][k] as string,
    tlist: (k) => dict[lang][k],
    toggle: () => setLang((l) => (l === "en" ? "ar" : "en")),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
