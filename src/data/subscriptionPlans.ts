/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Subscription Plans Catalog & Shared Data Models
 */

export interface SubscriptionPerks {
  discountPercent?: number;
  freeShipping?: boolean;
  extendedWarrantyMonths?: number;
  unlimitedSync?: boolean;
  commissionRatePercent?: number;
  maxInventoryItems?: number;
  priorityPlacement?: boolean;
  priorityWhatsAppHotline?: boolean;
  net30Invoicing?: boolean;
  multiBranchManagement?: boolean;
  fleetSanawiaManager?: boolean;
  zeroMarketplaceFees?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  roleTarget: 'customer' | 'supplier' | 'workshop';
  tierCode: 'free' | 'pro' | 'enterprise' | 'prime' | 'fleet';
  name: string;
  nameAr: string;
  tagline: string;
  taglineAr: string;
  priceMonthlyUSD: number;
  priceMonthlyIQD: number;
  priceYearlyUSD: number;
  priceYearlyIQD: number;
  popular?: boolean;
  badge?: string;
  badgeAr?: string;
  features: string[];
  featuresAr: string[];
  perks: SubscriptionPerks;
}

export interface ActiveUserSubscription {
  id: string;
  userId: string;
  planId: string;
  role: 'customer' | 'supplier' | 'workshop' | 'admin';
  tierName: string;
  status: 'ACTIVE' | 'TRIAL' | 'CANCELLED' | 'EXPIRED';
  billingCycle: 'monthly' | 'yearly';
  priceUSD: number;
  priceIQD: number;
  paymentMethod: string;
  perks: SubscriptionPerks;
  startsAt: string;
  expiresAt: string;
  autoRenew: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  // 1. CUSTOMER (BUYER) PLANS
  {
    id: 'cust_free',
    roleTarget: 'customer',
    tierCode: 'free',
    name: 'Basic Buyer',
    nameAr: 'المشتري الأساسي',
    tagline: 'Standard access to parts marketplace & quote requests',
    taglineAr: 'بحث وتصفح قطع الغيار وطلب عروض الأسعار مجاناً',
    priceMonthlyUSD: 0,
    priceMonthlyIQD: 0,
    priceYearlyUSD: 0,
    priceYearlyIQD: 0,
    features: [
      'Search 10,000+ Genuine & OEM parts',
      'Request price bids from verified Iraqi dealers',
      'Vehicle Sanawia OCR specification scan',
      'Standard delivery rates',
      'Standard 30-day seller warranty',
    ],
    featuresAr: [
      'تصفح أكثر من 10,000 قطعة أصلية وتجارية',
      'طلب عروض أسعار من المتاجر المعتمدة',
      'مسح وقراءة السنوية بالذكاء الاصطناعي',
      'أجور توصيل قياسية',
      'ضمان التاجر القياسي 30 يوماً',
    ],
    perks: {
      discountPercent: 0,
      freeShipping: false,
      extendedWarrantyMonths: 1,
    },
  },
  {
    id: 'cust_prime',
    roleTarget: 'customer',
    tierCode: 'prime',
    name: 'IQAutoMarket Prime',
    nameAr: 'برايم المشتري (Prime)',
    tagline: 'Zero delivery fees, 1-year extended warranty & VIP parts concierge',
    taglineAr: 'توصيل مجاني لجميع الطلبات مع ضمان سنة كاملة ومساعد قطع مخصص',
    priceMonthlyUSD: 9,
    priceMonthlyIQD: 12000,
    priceYearlyUSD: 89,
    priceYearlyIQD: 119000,
    popular: true,
    badge: 'MOST POPULAR',
    badgeAr: 'الأكثر طلباً',
    features: [
      '100% Free Express Shipping on all orders over $30',
      '1-Year Extended Warranty Guarantee on all Genuine & OEM parts',
      '100% Fitment Insurance (Free instant returns if part doesn’t fit)',
      'Dedicated VIP WhatsApp parts specialist & live sourcing',
      'Exclusive Prime flash sales & seasonal discounts',
    ],
    featuresAr: [
      'توصيل سريع مجاني 100% لجميع الطلبات فوق 30$',
      'ضمان ممتد لمدة سنة كاملة على جميع القطع الأصلية و OEM',
      'تأمين المطابقة 100% (إرجاع واستبدال مجاني وفوري في حال عدم التطابق)',
      'مستشار قطع غيار خاص عبر واتساب 24/7 للمساعدة والبحث',
      'عروض حصرية وخصومات موسمية للأعضاء',
    ],
    perks: {
      discountPercent: 3,
      freeShipping: true,
      extendedWarrantyMonths: 12,
      priorityWhatsAppHotline: true,
    },
  },

  // 2. WORKSHOP & GARAGE PLANS
  {
    id: 'wrk_basic',
    roleTarget: 'workshop',
    tierCode: 'free',
    name: 'Standard Garage',
    nameAr: 'الورشة الأساسية',
    tagline: 'Order parts on-demand for repair jobs',
    taglineAr: 'طلب القطع عند الحاجة لصيانة سيارات العملاء',
    priceMonthlyUSD: 0,
    priceMonthlyIQD: 0,
    priceYearlyUSD: 0,
    priceYearlyIQD: 0,
    features: [
      'Digital garage repair order workflow',
      'Broadcast part requests directly to distributors',
      'Direct WhatsApp communication with dealers',
      'Standard payment on delivery',
    ],
    featuresAr: [
      'إدارة أوامر صيانة سيارات الورشة رقمياً',
      'إرسال طلبات تسعير للموزعين وتجار الجملة',
      'تواصل مباشر عبر الواتساب مع التجار',
      'دفع نقدي قياسي عند الاستلام',
    ],
    perks: {
      discountPercent: 0,
      freeShipping: false,
      net30Invoicing: false,
    },
  },
  {
    id: 'wrk_pro_pass',
    roleTarget: 'workshop',
    tierCode: 'pro',
    name: 'Workshop Pro Pass',
    nameAr: 'اشتراك الورشة الاحترافي (Pro Pass)',
    tagline: '5% instant trade discount & 2-hour priority express courier',
    taglineAr: 'خصم تجاري فوري 5% على جميع القطع مع توصيل سريع بأولوية قصوى',
    priceMonthlyUSD: 29,
    priceMonthlyIQD: 39000,
    priceYearlyUSD: 290,
    priceYearlyIQD: 385000,
    popular: true,
    badge: 'RECOMMENDED FOR WORKSHOPS',
    badgeAr: 'موصى به لورش الصيانة',
    features: [
      '5% Instant Trade Discount on all orders across all verified dealers',
      'Priority 2-Hour Express Delivery to your workshop bay',
      'Net-15 Deferred Invoicing (Pay twice monthly)',
      'Direct OEM Parts Diagram & cross-reference lookup tool',
      'Verified Workshop Partner badge on public directory',
    ],
    featuresAr: [
      'خصم تجاري فوري 5% على كافة الطلبات من جميع المتاجر المعتمدة',
      'توصيل سريع بأولوية قصوى خلال ساعتين لموقع الورشة',
      'فوترة آجلة كل 15 يوماً للورش المعتمدة',
      'دخول كامل لمخططات القطع الأصلية وجداول المطابقة',
      'شارة ورشة معتمدة وموثوقة في الدليل العام للعملاء',
    ],
    perks: {
      discountPercent: 5,
      freeShipping: true,
      net30Invoicing: true,
      priorityWhatsAppHotline: true,
    },
  },
  {
    id: 'wrk_fleet_master',
    roleTarget: 'workshop',
    tierCode: 'fleet',
    name: 'Fleet Master 360',
    nameAr: 'باقة إدارة الأساطيل والشركات (Fleet Master)',
    tagline: '10% wholesale trade discount, Net-30 billing & Multi-Vehicle fleet portal',
    taglineAr: 'خصم جملة 10%، دفع آجل 30 يوماً، ونظام متكامل لإدارة صيانة أساطيل السيارات',
    priceMonthlyUSD: 89,
    priceMonthlyIQD: 119000,
    priceYearlyUSD: 890,
    priceYearlyIQD: 1180000,
    features: [
      '10% Wholesale Discount on all Genuine & OEM catalog parts',
      'Net-30 Corporate Invoicing with automated tax receipts',
      'Multi-vehicle Fleet Sanawia Manager with automated service alerts',
      'Unlimited Free Nationwide Freight on bulk orders',
      'Dedicated Key Account Manager & rapid procurement hotline',
    ],
    featuresAr: [
      'خصم جملة 10% على كامل كتالوج القطع الأصلية و OEM',
      'فوترة شركات آجلة 30 يوماً مع كشوف حسابات رسمية',
      'نظام إدارة أسطول المركبات ومتابعة السنويات ومواعيد الصيانة الدورية',
      'شحن مجاني لكافة محافظات العراق للطلبات المجمعة',
      'مدير حساب خاص لخدمة أسطول الشركة وسرعة توريد القطع النادرة',
    ],
    perks: {
      discountPercent: 10,
      freeShipping: true,
      net30Invoicing: true,
      fleetSanawiaManager: true,
      priorityWhatsAppHotline: true,
    },
  },

  // 3. DEALER & SUPPLIER PLANS
  {
    id: 'dlr_starter',
    roleTarget: 'supplier',
    tierCode: 'free',
    name: 'Starter Dealer',
    nameAr: 'التاجر المبتدئ',
    tagline: 'Basic store presence with manual inventory management',
    taglineAr: 'متجر أساسي لإضافة القطع واستقبال الطلبات يدوياً',
    priceMonthlyUSD: 0,
    priceMonthlyIQD: 0,
    priceYearlyUSD: 0,
    priceYearlyIQD: 0,
    features: [
      'Up to 100 manual inventory part listings',
      'Receive buyer quote requests in your province',
      'Standard marketplace commission: 5.0%',
      'Manual CSV stock upload',
    ],
    featuresAr: [
      'إدراج حتى 100 قطعة غيار يدوياً',
      'استقبال طلبات التسعير من المشترين في محافظتك',
      'عمولة المنصة القياسية: 5.0%',
      'رفع مخزون يدوي بملفات CSV',
    ],
    perks: {
      commissionRatePercent: 5.0,
      maxInventoryItems: 100,
      unlimitedSync: false,
      priorityPlacement: false,
    },
  },
  {
    id: 'dlr_pro',
    roleTarget: 'supplier',
    tierCode: 'pro',
    name: 'Pro Dealer DMS',
    nameAr: 'اشتراك التاجر المحترف (Pro Dealer)',
    tagline: 'Automated ERP/DMS live sync, lower 2.5% commission & verified badge',
    taglineAr: 'ربط مباشر تلقائي مع نظام ERP/DMS للتاجر، عمولة مخفضة 2.5% وشارة موثق',
    priceMonthlyUSD: 49,
    priceMonthlyIQD: 65000,
    priceYearlyUSD: 490,
    priceYearlyIQD: 650000,
    popular: true,
    badge: 'MOST POPULAR FOR DEALERS',
    badgeAr: 'الخيار الأفضل للتجار',
    features: [
      'Automated hourly ERP/DMS synchronization (Odoo, SAP, Custom REST)',
      'Reduced marketplace commission to 2.5% (Save 50% on fees)',
      'Up to 10,000 active inventory SKUs',
      'Official Blue Verified Dealer badge with customer trust ranking',
      'Multi-branch stock allocation (Baghdad, Erbil, Basra branches)',
      'Priority Quote Room alerts with instant WhatsApp bid notifications',
    ],
    featuresAr: [
      'مزامنة آلية كل ساعة مع أنظمة المحاسبة والمخازن (Odoo, SAP, REST API)',
      'تخفيض عمولة المنصة إلى 2.5% فقط (توفير 50% من رسوم البيع)',
      'إدراج حتى 10,000 قطعة غيار نشطة مع التحديث التلقائي للأسعار',
      'شارة التاجر المعتمد والموثوق لزيادة مبيعاتك وثقة المشترين',
      'إدارة مخزون الفروع المتعددة (بغداد، أربيل، البصرة)',
      'تنبيهات فورية بطلبات التسعير ذات القيمة العالية عبر واتساب',
    ],
    perks: {
      commissionRatePercent: 2.5,
      maxInventoryItems: 10000,
      unlimitedSync: true,
      priorityPlacement: true,
      multiBranchManagement: true,
    },
  },
  {
    id: 'dlr_enterprise',
    roleTarget: 'supplier',
    tierCode: 'enterprise',
    name: 'Enterprise VIP Supplier',
    nameAr: 'الباقة الماسية للشركات والموزعين (Enterprise VIP)',
    tagline: '0% marketplace commission, real-time webhooks & featured placement',
    taglineAr: 'عمولة 0% على كافة المبيعات، ربط فوري Webhooks، وظهور مميز بالصفحة الأولى',
    priceMonthlyUSD: 149,
    priceMonthlyIQD: 195000,
    priceYearlyUSD: 1490,
    priceYearlyIQD: 1950000,
    features: [
      '0% Marketplace Commission (Keep 100% of your sales revenue)',
      'Unlimited SKUs & Real-time Webhook inventory zero-latency syncing',
      'Featured VIP placement on home page and brand storefront banner',
      'B2B Direct Wholesale Contracting with fleets and verified workshops',
      'Dedicated integration engineer & customized EDI/API connector',
      'Advanced sales analytics, demand heatmaps & parts trend forecasts',
    ],
    featuresAr: [
      'عمولة 0% على جميع مبيعات المنصة (احتفظ بـ 100% من أرباحك)',
      'قطع ومخزون غير محدود مع مزامنة فورية عبر Real-time Webhooks',
      'ظهور مميز في الصفحة الأولى والبنرات الإعلانية للوكالات',
      'عقود توريد B2B مباشرة مع كبرى الشركات وورش الصيانة المعتمدة',
      'مهندس دعم تقني مخصص للربط البرمجي مع أنظمة شركتك المعقدة',
      'تحليلات وتقارير متقدمة بحركة الطلب والقطع الأكثر طلباً في السوق العراقي',
    ],
    perks: {
      commissionRatePercent: 0.0,
      zeroMarketplaceFees: true,
      maxInventoryItems: 100000,
      unlimitedSync: true,
      priorityPlacement: true,
      multiBranchManagement: true,
    },
  },
];
