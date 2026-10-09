/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket Ecommerce Configuration - Coupons, Discounts & City Shipping Rates
 */

export interface Coupon {
  id: string;
  code: string;
  description: string;
  descriptionAr: string;
  discountType: 'percentage' | 'fixed_usd';
  discountValue: number; // e.g. 15 for 15% or 10 for $10 USD
  minOrderUSD: number;
  maxDiscountUSD: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: string;
  applicableCities?: string[]; // empty or undefined means all cities
  isActive: boolean;
}

export interface CityShippingRate {
  id: string;
  city: string;
  cityAr: string;
  standardShippingUSD: number;
  standardDeliveryDays: string;
  expressShippingUSD: number;
  expressDeliveryHours: string;
  freeShippingThresholdUSD: number;
  isActive: boolean;
}

export type ShippingSpeed = 'standard' | 'express' | 'pickup';

export const DEFAULT_COUPONS: Coupon[] = [
  {
    id: 'cpn_welcome10',
    code: 'WELCOME10',
    description: '10% discount on your first genuine spare parts order',
    descriptionAr: 'خصم 10% على أول طلبية قطع غيار أصلية',
    discountType: 'percentage',
    discountValue: 10,
    minOrderUSD: 40,
    maxDiscountUSD: 30,
    usageLimit: 1000,
    usedCount: 243,
    expiresAt: '2027-12-31',
    isActive: true,
  },
  {
    id: 'cpn_baghdad50',
    code: 'BAGHDAD50',
    description: '$15 off on orders over $150 delivered anywhere in Baghdad',
    descriptionAr: 'خصم 15 دولار للطلبات فوق 150 دولار داخل محافظة بغداد',
    discountType: 'fixed_usd',
    discountValue: 15,
    minOrderUSD: 150,
    maxDiscountUSD: 15,
    usageLimit: 500,
    usedCount: 118,
    expiresAt: '2027-06-30',
    applicableCities: ['Baghdad'],
    isActive: true,
  },
  {
    id: 'cpn_proworkshop20',
    code: 'PROWORKSHOP20',
    description: '20% bulk discount for verified garages & mechanical workshops',
    descriptionAr: 'خصم 20% لورش الصيانة وميكانيك السيارات المعتمدة',
    discountType: 'percentage',
    discountValue: 20,
    minOrderUSD: 200,
    maxDiscountUSD: 100,
    usageLimit: 300,
    usedCount: 89,
    expiresAt: '2027-12-31',
    isActive: true,
  },
  {
    id: 'cpn_ramadan15',
    code: 'RAMADAN15',
    description: 'Seasonal 15% discount on all cooling & AC automotive parts',
    descriptionAr: 'خصم موسمي 15% على قطع منظومة التبريد والتكييف',
    discountType: 'percentage',
    discountValue: 15,
    minOrderUSD: 50,
    maxDiscountUSD: 45,
    usageLimit: 800,
    usedCount: 312,
    expiresAt: '2027-08-31',
    isActive: true,
  },
  {
    id: 'cpn_vipfitment',
    code: 'VIPFITMENT',
    description: '$25 instant credit on certified OEM Toyota & Hyundai parts',
    descriptionAr: 'خصم فوري 25 دولار على قطع تويوتا وهيونداي الأصلية المعتمدة',
    discountType: 'fixed_usd',
    discountValue: 25,
    minOrderUSD: 250,
    maxDiscountUSD: 25,
    usageLimit: 200,
    usedCount: 64,
    expiresAt: '2027-12-31',
    isActive: true,
  },
];

export const DEFAULT_CITY_SHIPPING_RATES: CityShippingRate[] = [
  {
    id: 'ship_baghdad',
    city: 'Baghdad',
    cityAr: 'بغداد',
    standardShippingUSD: 5,
    standardDeliveryDays: '1-2 Days',
    expressShippingUSD: 12,
    expressDeliveryHours: '2-4 Hours (Same Day)',
    freeShippingThresholdUSD: 120,
    isActive: true,
  },
  {
    id: 'ship_erbil',
    city: 'Erbil',
    cityAr: 'أربيل',
    standardShippingUSD: 4,
    standardDeliveryDays: '1-2 Days',
    expressShippingUSD: 10,
    expressDeliveryHours: '2-3 Hours (Same Day)',
    freeShippingThresholdUSD: 100,
    isActive: true,
  },
  {
    id: 'ship_basra',
    city: 'Basra',
    cityAr: 'البصرة',
    standardShippingUSD: 7,
    standardDeliveryDays: '2-3 Days',
    expressShippingUSD: 16,
    expressDeliveryHours: '4-6 Hours (Same Day)',
    freeShippingThresholdUSD: 150,
    isActive: true,
  },
  {
    id: 'ship_sulaymaniyah',
    city: 'Sulaymaniyah',
    cityAr: 'السليمانية',
    standardShippingUSD: 5,
    standardDeliveryDays: '1-2 Days',
    expressShippingUSD: 12,
    expressDeliveryHours: '3-4 Hours (Same Day)',
    freeShippingThresholdUSD: 120,
    isActive: true,
  },
  {
    id: 'ship_najaf',
    city: 'Najaf',
    cityAr: 'النجف الأشرف',
    standardShippingUSD: 6,
    standardDeliveryDays: '2-3 Days',
    expressShippingUSD: 14,
    expressDeliveryHours: '4-6 Hours',
    freeShippingThresholdUSD: 140,
    isActive: true,
  },
  {
    id: 'ship_karbala',
    city: 'Karbala',
    cityAr: 'كربلاء المقدسة',
    standardShippingUSD: 6,
    standardDeliveryDays: '2-3 Days',
    expressShippingUSD: 14,
    expressDeliveryHours: '4-6 Hours',
    freeShippingThresholdUSD: 140,
    isActive: true,
  },
  {
    id: 'ship_kirkuk',
    city: 'Kirkuk',
    cityAr: 'كركوك',
    standardShippingUSD: 6,
    standardDeliveryDays: '1-2 Days',
    expressShippingUSD: 13,
    expressDeliveryHours: '3-5 Hours',
    freeShippingThresholdUSD: 130,
    isActive: true,
  },
  {
    id: 'ship_mosul',
    city: 'Mosul (Nineveh)',
    cityAr: 'الموصل (نينوى)',
    standardShippingUSD: 7,
    standardDeliveryDays: '2-3 Days',
    expressShippingUSD: 15,
    expressDeliveryHours: '4-6 Hours',
    freeShippingThresholdUSD: 150,
    isActive: true,
  },
  {
    id: 'ship_babil',
    city: 'Babil (Hilla)',
    cityAr: 'بابل (الحلة)',
    standardShippingUSD: 6,
    standardDeliveryDays: '2-3 Days',
    expressShippingUSD: 14,
    expressDeliveryHours: '4-6 Hours',
    freeShippingThresholdUSD: 140,
    isActive: true,
  },
  {
    id: 'ship_duhok',
    city: 'Duhok',
    cityAr: 'دهوك',
    standardShippingUSD: 5,
    standardDeliveryDays: '1-2 Days',
    expressShippingUSD: 12,
    expressDeliveryHours: '3-4 Hours',
    freeShippingThresholdUSD: 120,
    isActive: true,
  },
  {
    id: 'ship_anbar',
    city: 'Anbar (Ramadi/Fallujah)',
    cityAr: 'الأنبار (الرمادي / الفلوجة)',
    standardShippingUSD: 8,
    standardDeliveryDays: '2-4 Days',
    expressShippingUSD: 18,
    expressDeliveryHours: '5-8 Hours',
    freeShippingThresholdUSD: 160,
    isActive: true,
  },
  {
    id: 'ship_diyala',
    city: 'Diyala (Baqubah)',
    cityAr: 'ديالى (بعقوبة)',
    standardShippingUSD: 6,
    standardDeliveryDays: '2-3 Days',
    expressShippingUSD: 15,
    expressDeliveryHours: '4-6 Hours',
    freeShippingThresholdUSD: 140,
    isActive: true,
  },
  {
    id: 'ship_wasit',
    city: 'Wasit (Kut)',
    cityAr: 'واسط (الكوت)',
    standardShippingUSD: 7,
    standardDeliveryDays: '2-3 Days',
    expressShippingUSD: 16,
    expressDeliveryHours: '5-7 Hours',
    freeShippingThresholdUSD: 150,
    isActive: true,
  },
  {
    id: 'ship_dhi_qar',
    city: 'Dhi Qar (Nasiriyah)',
    cityAr: 'ذي قار (الناصرية)',
    standardShippingUSD: 8,
    standardDeliveryDays: '2-4 Days',
    expressShippingUSD: 18,
    expressDeliveryHours: '5-8 Hours',
    freeShippingThresholdUSD: 160,
    isActive: true,
  },
  {
    id: 'ship_maysan',
    city: 'Maysan (Amarah)',
    cityAr: 'ميسان (العمارة)',
    standardShippingUSD: 8,
    standardDeliveryDays: '2-4 Days',
    expressShippingUSD: 18,
    expressDeliveryHours: '5-8 Hours',
    freeShippingThresholdUSD: 160,
    isActive: true,
  },
];
