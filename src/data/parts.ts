/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket Parts & Vehicle Selector Configuration (Clean Zero Mock Parts)
 */

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

export interface Vehicle {
  make: string;
  model: string;
  year: string;
  trim: string;
  engine: string;
}

export interface ModelDetail {
  years: string[];
  trims: { name: string; engine: string }[];
}

export const VEHICLE_OPTIONS: Record<string, Record<string, ModelDetail>> = {
  Toyota: {
    "Land Cruiser": {
      years: ["2024", "2023", "2022", "2021", "2020", "2019", "2018"],
      trims: [
        { name: "GR-Sport 3.5TT", engine: "3.5L Twin-Turbo V6" },
        { name: "VXR 4.0L", engine: "4.0L V6" },
        { name: "GXR 4.6L", engine: "4.6L V8" },
      ],
    },
    Prado: {
      years: ["2024", "2023", "2022", "2021", "2020", "2019"],
      trims: [
        { name: "TX-L 4.0L", engine: "4.0L V6" },
        { name: "TX 2.7L", engine: "2.7L 4-Cyl" },
      ],
    },
    Camry: {
      years: ["2024", "2023", "2022", "2021", "2020"],
      trims: [
        { name: "GLE 2.5L", engine: "2.5L 4-Cyl" },
        { name: "Grande 3.5L", engine: "3.5L V6" },
        { name: "Hybrid", engine: "2.5L Hybrid" },
      ],
    },
    Hilux: {
      years: ["2024", "2023", "2022", "2021", "2020"],
      trims: [
        { name: "Adventure 4.0L", engine: "4.0L V6" },
        { name: "GLX 2.7L", engine: "2.7L 4-Cyl" },
        { name: "Diesel 2.4L", engine: "2.4L Turbo Diesel" },
      ],
    },
  },
  Hyundai: {
    Tucson: {
      years: ["2024", "2023", "2022", "2021", "2020"],
      trims: [
        { name: "Smart 2.0L", engine: "2.0L 4-Cyl" },
        { name: "Turbo 1.6T", engine: "1.6L Turbo" },
      ],
    },
    SantaFe: {
      years: ["2024", "2023", "2022", "2021"],
      trims: [
        { name: "Calligraphy 2.5T", engine: "2.5L Turbo" },
        { name: "Prestige 3.5L", engine: "3.5L V6" },
      ],
    },
    Elantra: {
      years: ["2024", "2023", "2022", "2021", "2020"],
      trims: [
        { name: "Smart 1.6L", engine: "1.6L 4-Cyl" },
        { name: "Comfort 2.0L", engine: "2.0L 4-Cyl" },
      ],
    },
  },
  Nissan: {
    Patrol: {
      years: ["2024", "2023", "2022", "2021", "2020"],
      trims: [
        { name: "Platinum 5.6L", engine: "5.6L V8" },
        { name: "Titanium 4.0L", engine: "4.0L V6" },
        { name: "Nismo", engine: "5.6L V8 High Output" },
      ],
    },
    Sunny: {
      years: ["2024", "2023", "2022", "2021"],
      trims: [
        { name: "SV 1.6L", engine: "1.6L 4-Cyl" },
        { name: "SL 1.6L", engine: "1.6L 4-Cyl" },
      ],
    },
  },
  Kia: {
    Sportage: {
      years: ["2024", "2023", "2022", "2021"],
      trims: [
        { name: "EX 2.0L", engine: "2.0L 4-Cyl" },
        { name: "GT-Line 1.6T", engine: "1.6L Turbo" },
      ],
    },
    Sorento: {
      years: ["2024", "2023", "2022", "2021"],
      trims: [
        { name: "EX 3.5L", engine: "3.5L V6" },
        { name: "GT-Line 2.5T", engine: "2.5L Turbo" },
      ],
    },
  },
};

export const DEFAULT_VEHICLE: Vehicle = {
  make: "Toyota",
  model: "Land Cruiser",
  year: "2023",
  trim: "GR-Sport 3.5TT",
  engine: "3.5L Twin-Turbo V6",
};

export const PARTS: Part[] = [];
