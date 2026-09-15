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

export interface BranchStock {
  branchId: string;
  branchName: string;
  city: string;
  availableQty: number;
  reservedQty: number;
  onHandQty: number;
  priceUSD?: number;
  priceIQD?: number;
  pickupAvailable: boolean;
  deliveryEstimatedHours: number;
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
  reservedQuantity?: number;
  warranty: string; // e.g. "12-Month Official Warranty"
  deliveryTime: string; // e.g. "Same Day Delivery (2-4 hrs)", "1-2 Days"
  deliveryOptions: ('pickup' | 'supplier_delivery' | 'express_courier')[];
  supplierCity: string;
  supplierLocationDetail: string;
  notes?: string;
  // B2B Integration & Multi-Branch additions
  externalProductId?: string;
  externalSku?: string;
  syncSource?: 'manual' | 'api' | 'csv' | 'erp' | 'dms';
  lastSyncedAt?: string;
  branches?: BranchStock[];
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

// ==========================================
// IQAutoMarket Dealer Integration Data Models
// ==========================================

export type IntegrationProviderType =
  | 'erp'
  | 'dms'
  | 'pos'
  | 'inventory_system'
  | 'wms'
  | 'excel_csv'
  | 'custom'
  | 'other';

export type IntegrationMethod =
  | 'api'
  | 'csv_excel'
  | 'sftp'
  | 'webhook'
  | 'custom_connector';

export type IntegrationStatus = 'active' | 'paused' | 'error' | 'syncing' | 'pending_setup';

export type DataQualityStatus =
  | 'valid'
  | 'valid_with_warnings'
  | 'requires_review'
  | 'invalid'
  | 'rejected'
  | 'published'
  | 'archived';

export interface DealerBranch {
  id: string;
  dealerId: string;
  externalBranchCode?: string;
  branchName: string;
  branchNameAr?: string;
  city: 'Baghdad' | 'Erbil' | 'Sulaymaniyah' | 'Basra' | 'Duhok' | 'Najaf' | 'Karbala' | 'Kirkuk' | 'Mosul';
  address: string;
  phone: string;
  isWarehouse: boolean;
  isShowroom: boolean;
  offersPickup: boolean;
  offersLocalDelivery: boolean;
  avgDeliveryHours: number;
}

export interface IntegrationSyncRules {
  syncFrequency: 'realtime' | 'every_15min' | 'hourly' | 'daily' | 'manual_only';
  autoPublishNewProducts: boolean;
  requireAdminApproval: boolean;
  priceSource: 'retail' | 'wholesale' | 'dealer_cost_markup';
  currency: 'USD' | 'IQD';
  stockSource: 'available' | 'on_hand_minus_reserved';
  hideOutOfStock: boolean;
  autoUpdatePrices: boolean;
  syncOrdersBackToDealer: boolean;
  stockReservationMode: 'marketplace' | 'dealer_system';
  includedBranchIds: string[];
}

export interface IntegrationFieldMapping {
  id: string;
  integrationId: string;
  sourceField: string; // e.g., 'ItemCode'
  destinationField: string; // e.g., 'partNumber'
  transformationRule?: 'trim' | 'uppercase' | 'multiply_by_exchange_rate' | 'none' | 'prefix_sku';
  defaultValue?: string;
  required: boolean;
}

export interface DealerIntegration {
  id: string;
  dealerId: string;
  dealerName: string;
  providerName: string; // e.g. "CDK Global DMS", "SAP Business One", "Custom POS"
  providerVersion?: string;
  providerType: IntegrationProviderType;
  integrationMethod: IntegrationMethod;
  status: IntegrationStatus;
  apiKey?: string;
  maskedApiKey?: string;
  webhookSecret?: string;
  endpointUrl?: string;
  sftpHost?: string;
  sftpUsername?: string;
  syncRules: IntegrationSyncRules;
  fieldMappings: IntegrationFieldMapping[];
  lastSyncAt?: string;
  nextSyncAt?: string;
  syncHealthScore: number; // 0 - 100
  totalProductsSynced: number;
  totalInventorySynced: number;
  totalPriceRecordsSynced: number;
  failedRecordsCount: number;
  pendingUpdatesCount: number;
  apiCallsLast24h: number;
  webhookStatus: 'active' | 'degraded' | 'idle' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationSyncJob {
  id: string;
  integrationId: string;
  dealerId: string;
  dealerName: string;
  syncType: 'full' | 'incremental' | 'price_only' | 'inventory_only' | 'manual' | 'webhook';
  status: 'running' | 'completed' | 'failed' | 'completed_with_warnings';
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  errorSummary?: string;
}

export interface IntegrationSyncError {
  id: string;
  syncJobId?: string;
  integrationId: string;
  dealerId: string;
  dealerName: string;
  externalRecordId: string;
  productNameHint?: string;
  errorType:
    | 'missing_part_number'
    | 'invalid_price'
    | 'negative_stock'
    | 'unrecognized_brand'
    | 'unmatched_vehicle'
    | 'unmapped_branch'
    | 'api_auth_failed'
    | 'duplicate_sku'
    | 'rate_limit_exceeded';
  errorMessage: string;
  suggestedSolution: string;
  rawPayloadSample?: string;
  status: 'open' | 'investigating' | 'resolved' | 'ignored';
  dateDetected: string;
  resolvedAt?: string;
}

export interface ExternalProduct {
  id: string;
  integrationId: string;
  dealerId: string;
  externalProductId: string;
  externalSku?: string;
  externalPartNumber: string;
  iqautomarketProductId?: string;
  title: string;
  brand: string;
  priceUSD: number;
  priceIQD: number;
  totalQuantity: number;
  dataQualityStatus: DataQualityStatus;
  lastSeenAt: string;
  syncStatus: 'synced' | 'pending' | 'failed' | 'moderation_needed';
}

export interface ExternalInventoryRecord {
  id: string;
  integrationId: string;
  dealerId: string;
  externalInventoryId: string;
  externalProductId: string;
  branchId: string;
  externalQuantity: number;
  normalizedAvailableQty: number;
  reservedQty: number;
  lastSyncedAt: string;
}

export interface ExternalOrder {
  id: string;
  integrationId: string;
  dealerId: string;
  iqautomarketOrderId: string;
  externalOrderId?: string;
  exportStatus: 'pending_export' | 'exported' | 'awaiting_dealer_confirmation' | 'confirmed' | 'rejected' | 'failed';
  lastSyncAt: string;
  syncError?: string;
}

export interface IntegrationWebhook {
  id: string;
  integrationId: string;
  dealerId: string;
  eventType: 'product.created' | 'product.updated' | 'stock.changed' | 'price.changed' | 'order.created' | 'order.status_changed';
  eventId: string;
  receivedAt: string;
  processedAt?: string;
  status: 'success' | 'failed' | 'retry_scheduled';
  retryCount: number;
  payloadSummary: string;
}

