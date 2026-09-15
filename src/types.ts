/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'customer' | 'workshop' | 'supplier' | 'admin';

export type QualityClassification = 'genuine' | 'oem' | 'aftermarket' | 'used' | 'reconditioned';

export type StockStatus = 'in_stock_today' | 'in_stock_2days' | 'order_on_demand' | 'out_of_stock';

export interface StockAlert {
  id: string;
  partId: string;
  partNumber: string;
  partName: string;
  supplierId?: string;
  supplierName?: string;
  email: string;
  phone?: string;
  preferredQuality?: string;
  notifyAnySupplier?: boolean;
  createdAt: string;
  status: 'active' | 'notified';
}

export type VerificationLevel = 'Pending' | 'Verified Business' | 'Authorized Dealer' | 'Genuine Parts Partner' | 'Trusted Dealer';

export interface Vehicle {
  id?: string;
  make: string;
  model: string;
  generation?: string;
  year: number;
  engine: string;
  trim?: string;
  bodyType?: string;
  vin?: string;
  nickname?: string;
}

export interface VehicleFitment {
  make: string;
  model: string;
  generation?: string;
  yearStart: number;
  yearEnd: number;
  engine: string;
  trim?: string;
  position?: string; // e.g. Front, Rear, Left, Right
}

export interface SupplierOffer {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierLogo?: string;
  supplierRating: number;
  verifiedInteractionsCount: number;
  repeatPurchaseRate: number; // e.g. 96
  quality: QualityClassification;
  brand: string; // e.g. Toyota Genuine, Denso, Brembo, Bosch, 555
  priceUSD: number;
  priceIQD: number;
  stockStatus: StockStatus;
  stockQuantity: number;
  warranty: string; // e.g. "12-Month Official Warranty"
  deliveryTime: string; // e.g. "Same Day Delivery (2-4 hrs)", "1-2 Days"
  deliveryOptions: ('pickup' | 'supplier_delivery' | 'express_courier')[];
  supplierCity: string;
  supplierLocationDetail: string;
  notes?: string;
}

export interface MasterPart {
  id: string;
  partNumber: string;
  oemNumber?: string;
  alternativeNumbers?: string[];
  partName: string;
  partNameArabic?: string;
  manufacturer: string;
  brand: string;
  category: 'Brake' | 'Engine' | 'Suspension' | 'Electrical' | 'Filters' | 'Body Parts' | 'Transmission' | 'Cooling';
  subcategory?: string;
  description: string;
  descriptionArabic?: string;
  specifications: Record<string, string>;
  imageUrl: string;
  compatibleVehicles: VehicleFitment[];
  offers: SupplierOffer[];
  crossReferences?: { brand: string; code: string }[];
}

export interface Supplier {
  id: string;
  companyName: string;
  companyNameArabic?: string;
  legalName: string;
  businessType: 'Importer' | 'Authorized Distributor' | 'Dealer' | 'Genuine Agency';
  city: string;
  address: string;
  phone: string;
  whatsapp?: string;
  email: string;
  verificationLevel: VerificationLevel;
  rating: number; // e.g. 4.8
  performanceScore: number; // e.g. 96/100
  responseSpeedRating: number; // e.g. 4.9
  communicationRating: number; // e.g. 4.8
  accuracyRating: number; // e.g. 4.7
  fulfillmentRating: number; // e.g. 4.9
  priceValueRating: number; // e.g. 4.6
  verifiedInteractionsCount: number;
  repeatCustomerPercentage: number; // e.g. 96
  authorizedBrands: string[];
  specializationBrands?: string[];
  warrantyPolicy: string;
  deliveryCoverage: string[];
  bio: string;
  activeProductsCount: number;
}

export interface PartRequest {
  id: string;
  requestNumber: string; // e.g. REQ-9042
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehicle: Vehicle;
  partName: string;
  partDescription: string;
  partNumberHint?: string;
  quantity: number;
  qualityPreference: 'genuine_only' | 'genuine_or_oem' | 'any_new' | 'used_acceptable';
  requiredDate: string;
  preferredCity: string;
  photoUrl?: string;
  quotationFileUrl?: string;
  status: 'open' | 'offers_received' | 'accepted' | 'expired' | 'closed';
  createdAt: string;
  offers: RequestOffer[];
}

export interface RequestOffer {
  id: string;
  requestId: string;
  supplierId: string;
  supplierName: string;
  supplierRating: number;
  verifiedInteractionsCount: number;
  partName: string;
  partNumber: string;
  brand: string;
  quality: QualityClassification;
  priceUSD: number;
  priceIQD: number;
  availability: string; // "In Stock - Immediate", "Available in 24 hrs"
  deliveryTime: string;
  warranty: string;
  offerExpiryHours: number;
  notes?: string;
  badge?: 'BEST VALUE' | 'LOWEST PRICE' | 'GENUINE' | 'FASTEST';
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface PrefilledPartRequest {
  partName?: string;
  partNumberHint?: string;
  partDescription?: string;
  vehicle?: Vehicle;
  qualityPreference?: 'genuine_only' | 'genuine_or_oem' | 'any_new' | 'used_acceptable';
}

export interface RepairOrderItem {
  partName: string;
  partNumber?: string;
  quantity: number;
  preferredQuality?: QualityClassification;
  notes?: string;
}

export interface RepairOrder {
  id: string;
  orderNumber: string; // e.g. RO-10283
  workshopName: string;
  vehicle: Vehicle;
  clientName: string;
  status: 'draft' | 'procuring' | 'completed';
  date: string;
  items: RepairOrderItem[];
}

export interface ProcurementCombination {
  type: 'cheapest' | 'fastest' | 'genuine' | 'best_value' | 'one_supplier';
  title: string;
  badge: string;
  totalPriceUSD: number;
  estimatedDelivery: string;
  supplierCount: number;
  breakdown: {
    partName: string;
    partNumber: string;
    supplierName: string;
    quality: QualityClassification;
    priceUSD: number;
    deliveryTime: string;
  }[];
}

export interface OrderItem {
  masterPartId: string;
  partName: string;
  partNumber: string;
  brand: string;
  quality: QualityClassification;
  quantity: number;
  unitPriceUSD: number;
  unitPriceIQD: number;
  supplierId: string;
  supplierName: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. ORD-7821
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehicleInfo: string;
  items: OrderItem[];
  totalUSD: number;
  totalIQD: number;
  deliveryMethod: 'pickup' | 'supplier_delivery' | 'express_delivery';
  deliveryAddress?: string;
  paymentMethod: 'cash_on_delivery' | 'pay_at_pickup';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'dispatched' | 'delivered' | 'completed' | 'cancelled' | 'disputed';
  createdAt: string;
  estimatedDeliveryDate: string;
  supplierId: string;
  supplierName: string;
  isRated?: boolean;
}

export interface DealerReview {
  id: string;
  orderId?: string;
  requestId?: string;
  supplierId: string;
  customerName?: string;
  reviewerName?: string;
  reviewerType?: 'individual' | 'workshop' | string;
  reviewType?: 'Verified Purchase' | 'Verified Request' | 'Verified Quote' | 'Verified Inquiry' | 'Verified Completed Order' | string;
  overallRating: number; // 1-5
  categoryRatings: {
    responseSpeed?: number;
    communication?: number;
    accuracy?: number;
    priceValue?: number;
    fulfillment?: number;
    partAccuracy?: number;
    deliverySpeed?: number;
  };
  wouldDealAgain: boolean;
  comment: string;
  vehicleDetails?: string;
  partPurchased?: string;
  date: string;
  isVerifiedBuyer?: boolean;
}

export interface Dispute {
  id: string;
  disputeNumber: string; // e.g. D-1023
  orderId: string;
  orderNumber: string;
  customerName: string;
  supplierName: string;
  reason: 'wrong_part' | 'damaged' | 'defective' | 'not_as_described' | 'incompatible' | 'other';
  description: string;
  status: 'under_review' | 'resolved' | 'rejected';
  createdAt: string;
}

export interface DemandIntelligenceItem {
  id?: string;
  searchTerm: string;
  partNumber?: string;
  partName?: string;
  category: string;
  targetVehicle: string;
  searchVolume30d?: number;
  searchVolumeWeekly?: number;
  availableSuppliersCount?: number;
  activeSuppliersCount?: number;
  opportunityLevel?: 'HIGH SUPPLY SHORTAGE' | 'MODERATE' | 'WELL SERVED';
  trend?: 'surging' | 'high' | 'stable' | string;
  unmetRequestsCount?: number;
  region?: string;
  avgMarketPriceUSD: number;
  topDemandedCity: string;
}

export interface ChatMessage {
  id: string;
  senderRole: 'customer' | 'supplier';
  senderName: string;
  text: string;
  timestamp: string;
  attachmentUrl?: string;
}

export interface AuctionBid {
  id: string;
  auctionId: string;
  bidderName: string;
  bidderCity: string;
  amountUSD: number;
  amountIQD: number;
  timestamp: string;
  isHighBid: boolean;
  isUserBid?: boolean;
}

export interface CarAuction {
  id: string;
  lotNumber: string;
  title: string;
  titleAr?: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  category: 'Performance' | 'Trucks & 4x4' | 'Luxury & Exotic' | 'Classic & Muscle' | 'Daily & Electric';
  mileage: number;
  engine: string;
  transmission: string;
  drivetrain: '4WD' | 'AWD' | 'RWD' | 'FWD';
  vin: string;
  exteriorColor: string;
  interiorColor: string;
  currentBidUSD: number;
  startingBidUSD: number;
  reservePriceUSD?: number;
  isReserveMet: boolean;
  buyItNowPriceUSD?: number;
  minIncrementUSD: number;
  bidsCount: number;
  endTime: string; // ISO string
  locationCity: string;
  locationCountry: string;
  seller: {
    id: string;
    name: string;
    dealerType: string;
    rating: number;
    phone?: string;
    verified: boolean;
  };
  condition: 'Mint / Collector' | 'Excellent' | 'Custom / Tuned' | 'Clean Driver';
  titleStatus: 'Clean Title' | 'Export Ready' | 'Certified Pre-Owned';
  images: string[];
  highlights: string[];
  highlightsAr?: string[];
  modifications?: string[];
  bids: AuctionBid[];
  isWatchlisted?: boolean;
  viewsCount?: number;
}
