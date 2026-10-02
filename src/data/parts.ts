export type Quality = "Genuine OEM" | "OEM Spec" | "Aftermarket";
export type Stock = "in" | "demand";

export interface Part {
  id: string;
  oem: string;
  brand: string;
  name: string;
  category: CategoryKey;
  quality: Quality;
  price: number;
  stock: Stock;
  warehouse: "Baghdad" | "Erbil" | "Basra" | "Sulaymaniyah";
  leadTime: string;
  fits: boolean;
  rating: number;
}

export type CategoryKey =
  | "brakes"
  | "suspension"
  | "engine"
  | "body"
  | "cooling"
  | "filters";

export const CATEGORIES: { key: CategoryKey; en: string; ar: string }[] = [
  { key: "brakes", en: "Brakes", ar: "المكابح" },
  { key: "suspension", en: "Suspension", ar: "نظام التعليق" },
  { key: "engine", en: "Engine", ar: "المحرك" },
  { key: "body", en: "Body", ar: "الهيكل" },
  { key: "cooling", en: "Cooling & AC", ar: "التبريد والتكييف" },
  { key: "filters", en: "Filters", ar: "الفلاتر" },
];

export const PARTS: Part[] = [
  {
    id: "p01",
    oem: "04465-60290",
    brand: "Toyota",
    name: "Front Brake Pad Set (Ceramic)",
    category: "brakes",
    quality: "Genuine OEM",
    price: 78,
    stock: "in",
    warehouse: "Erbil",
    leadTime: "Same-day dispatch",
    fits: true,
    rating: 4.9,
  },
  {
    id: "p02",
    oem: "43512-60190",
    brand: "Toyota",
    name: "Front Brake Disc Rotor (Vented Pair)",
    category: "brakes",
    quality: "Genuine OEM",
    price: 115,
    stock: "in",
    warehouse: "Erbil",
    leadTime: "Same-day dispatch",
    fits: true,
    rating: 4.8,
  },
  {
    id: "p03",
    oem: "04465-60280",
    brand: "Bosch",
    name: "Front Brake Pad Set (OEM Spec)",
    category: "brakes",
    quality: "OEM Spec",
    price: 46,
    stock: "in",
    warehouse: "Basra",
    leadTime: "2-day delivery",
    fits: true,
    rating: 4.6,
  },
  {
    id: "p04",
    oem: "48068-60030",
    brand: "Toyota",
    name: "Lower Suspension Control Arm (Front Left)",
    category: "suspension",
    quality: "Genuine OEM",
    price: 135,
    stock: "in",
    warehouse: "Erbil",
    leadTime: "Same-day dispatch",
    fits: true,
    rating: 4.9,
  },
  {
    id: "p05",
    oem: "48510-09K30",
    brand: "KYB",
    name: "Front Shock Absorber (Gas, Excel-G)",
    category: "suspension",
    quality: "OEM Spec",
    price: 89,
    stock: "in",
    warehouse: "Baghdad",
    leadTime: "Next-day delivery",
    fits: true,
    rating: 4.7,
  },
  {
    id: "p06",
    oem: "04427-60142",
    brand: "GMB",
    name: "CV Joint Boot Kit (Front Outer)",
    category: "suspension",
    quality: "Aftermarket",
    price: 42,
    stock: "in",
    warehouse: "Erbil",
    leadTime: "Same-day dispatch",
    fits: false,
    rating: 4.4,
  },
  {
    id: "p07",
    oem: "90919-01191",
    brand: "Denso",
    name: "Iridium Long-Life Spark Plugs (Set of 6)",
    category: "engine",
    quality: "Genuine OEM",
    price: 52,
    stock: "in",
    warehouse: "Erbil",
    leadTime: "Same-day dispatch",
    fits: true,
    rating: 5.0,
  },
  {
    id: "p08",
    oem: "90916-03118",
    brand: "Toyota",
    name: "Serpentine Drive Belt (V-Ribbed)",
    category: "engine",
    quality: "Genuine OEM",
    price: 34,
    stock: "in",
    warehouse: "Sulaymaniyah",
    leadTime: "2-day delivery",
    fits: true,
    rating: 4.8,
  },
  {
    id: "p09",
    oem: "16100-39466",
    brand: "Aisin",
    name: "Engine Water Pump Assembly with Gasket",
    category: "cooling",
    quality: "Genuine OEM",
    price: 120,
    stock: "in",
    warehouse: "Erbil",
    leadTime: "Same-day dispatch",
    fits: true,
    rating: 4.9,
  },
  {
    id: "p10",
    oem: "88320-6A560",
    brand: "Denso",
    name: "A/C Compressor Assembly with Clutch",
    category: "cooling",
    quality: "Genuine OEM",
    price: 420,
    stock: "demand",
    warehouse: "Erbil",
    leadTime: "5–7 day sourcing",
    fits: true,
    rating: 4.7,
  },
  {
    id: "p11",
    oem: "87139-30040",
    brand: "Toyota",
    name: "Cabin AC Micro Filter (Activated Carbon)",
    category: "cooling",
    quality: "Genuine OEM",
    price: 18,
    stock: "in",
    warehouse: "Baghdad",
    leadTime: "Next-day delivery",
    fits: true,
    rating: 4.8,
  },
  {
    id: "p12",
    oem: "04152-YZZA1",
    brand: "Toyota",
    name: "Engine Oil Filter Element Cartridge",
    category: "filters",
    quality: "Genuine OEM",
    price: 10,
    stock: "in",
    warehouse: "Baghdad",
    leadTime: "Next-day delivery",
    fits: true,
    rating: 4.9,
  },
  {
    id: "p13",
    oem: "17801-38051",
    brand: "Toyota",
    name: "Engine Air Cleaner Filter Element",
    category: "filters",
    quality: "Genuine OEM",
    price: 16,
    stock: "in",
    warehouse: "Erbil",
    leadTime: "Same-day dispatch",
    fits: true,
    rating: 4.9,
  },
  {
    id: "p14",
    oem: "23300-50110",
    brand: "Denso",
    name: "Fuel Filter Assembly (In-Tank)",
    category: "filters",
    quality: "OEM Spec",
    price: 24,
    stock: "demand",
    warehouse: "Sulaymaniyah",
    leadTime: "4–6 day sourcing",
    fits: false,
    rating: 4.5,
  },
  {
    id: "p15",
    oem: "81150-60M20",
    brand: "Toyota",
    name: "Headlamp Assembly (Right, LED)",
    category: "body",
    quality: "Genuine OEM",
    price: 385,
    stock: "demand",
    warehouse: "Baghdad",
    leadTime: "5–7 day sourcing",
    fits: true,
    rating: 4.6,
  },
];

export interface Vehicle {
  make: string;
  model: string;
  year: string;
  trim: string;
  engine: string;
}

export const VEHICLE_OPTIONS: Record<
  string,
  Record<string, { years: string[]; trims: { name: string; engine: string }[] }>
> = {
  Toyota: {
    Prado: {
      years: ["2023", "2022", "2021", "2020", "2019"],
      trims: [
        { name: "TX-L", engine: "4.0L V6 (1GR-FE)" },
        { name: "VX", engine: "4.0L V6 (1GR-FE)" },
        { name: "TX", engine: "2.7L I4 (2TR-FE)" },
      ],
    },
    LandCruiser: {
      years: ["2023", "2022", "2021", "2020"],
      trims: [
        { name: "GXR", engine: "4.0L V6 (1GR-FE)" },
        { name: "VXR", engine: "5.7L V8 (3UR-FE)" },
      ],
    },
    Corolla: {
      years: ["2024", "2023", "2022", "2021"],
      trims: [{ name: "GLI", engine: "1.6L I4 (1ZR-FE)" }],
    },
  },
  Kia: {
    Sportage: {
      years: ["2023", "2022", "2021"],
      trims: [{ name: "LX", engine: "2.4L I4 (G4KJ)" }],
    },
  },
  Hyundai: {
    Tucson: {
      years: ["2023", "2022", "2021"],
      trims: [{ name: "GLS", engine: "2.0L I4 (G4NA)" }],
    },
  },
};

export const DEFAULT_VEHICLE: Vehicle = {
  make: "Toyota",
  model: "Prado",
  year: "2021",
  trim: "TX-L",
  engine: "4.0L V6 (1GR-FE)",
};
