/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  UserProfile,
  Vehicle,
  MasterPart,
  Supplier,
  SupplierOffer,
  PartRequest,
  RequestOffer,
  RepairOrder,
  Order,
  DealerReview,
  DemandIntelligenceItem,
  Dispute,
  StockAlert,
  CarAuction,
  AuctionBid,
  PrefilledPartRequest,
  DealerIntegration,
  IntegrationSyncJob,
  IntegrationSyncError,
  ExternalProduct,
  DealerBranch,
  IntegrationFieldMapping,
  IntegrationWebhook,
} from '../types';
import {
  INITIAL_VEHICLES,
  MASTER_PARTS,
  SUPPLIERS,
  INITIAL_REQUESTS,
  INITIAL_REPAIR_ORDERS,
  DEMAND_INTELLIGENCE,
  INITIAL_REVIEWS,
  INITIAL_ORDERS,
  INITIAL_DEALER_INTEGRATIONS,
  INITIAL_SYNC_JOBS,
  INITIAL_SYNC_ERRORS,
  INITIAL_EXTERNAL_PRODUCTS,
  INITIAL_DEALER_BRANCHES,
  DEFAULT_FIELD_MAPPINGS,
} from '../data/mockData';
import { INITIAL_AUCTIONS } from '../data/mockAuctions';

export interface CartItem {
  masterPart: MasterPart;
  offer: SupplierOffer;
  quantity: number;
}

interface MarketplaceContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  currency: 'USD' | 'IQD';
  setCurrency: (curr: 'USD' | 'IQD') => void;
  formatPrice: (amountUSD?: number, amountIQD?: number) => string;
  activeVehicle: Vehicle | null;
  setActiveVehicle: (v: Vehicle | null) => void;
  userVehicles: Vehicle[];
  addUserVehicle: (v: Vehicle) => void;
  masterParts: MasterPart[];
  suppliers: Supplier[];
  partRequests: PartRequest[];
  repairOrders: RepairOrder[];
  orders: Order[];
  reviews: DealerReview[];
  demandIntelligence: DemandIntelligenceItem[];
  disputes: Dispute[];
  cart: CartItem[];
  addToCart: (masterPart: MasterPart, offer: SupplierOffer, quantity?: number) => void;
  removeFromCart: (offerId: string) => void;
  clearCart: () => void;
  createOrder: (orderData: Partial<Order>) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  createPartRequest: (req: Omit<PartRequest, 'id' | 'requestNumber' | 'createdAt' | 'status' | 'offers'>) => PartRequest;
  submitSupplierOffer: (requestId: string, offer: Omit<RequestOffer, 'id' | 'requestId' | 'createdAt' | 'status'>) => void;
  acceptRequestOffer: (requestId: string, offerId: string) => Order | null;
  addDealerReview: (review: Omit<DealerReview, 'id' | 'date'>) => void;
  createDispute: (dispute: Omit<Dispute, 'id' | 'disputeNumber' | 'createdAt' | 'status'>) => Dispute;
  addMasterPart: (part: Omit<MasterPart, 'id'>) => void;
  updateSupplierVerification: (supplierId: string, level: Supplier['verificationLevel']) => void;
  addSupplierOfferToPart: (masterPartId: string, offer: Omit<SupplierOffer, 'id'>) => void;
  bulkUploadProducts: (supplierId: string, mappedRows: { partNumber: string; partName: string; priceUSD: number; stock: number; brand: string; quality: string }[]) => { matchedCount: number; newCount: number };
  createRepairOrder: (ro: Omit<RepairOrder, 'id' | 'orderNumber' | 'status' | 'date'>) => RepairOrder;
  // Authentication & Profiles
  currentUser: UserProfile | null;
  authModalTab: 'signin' | 'signup';
  authTargetRole: UserRole;
  openAuthModal: (role?: UserRole, tab?: 'signin' | 'signup') => void;
  login: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; message?: string }>;
  signup: (data: { name: string; email: string; phone: string; password: string; role: UserRole; companyName?: string; city?: string; businessType?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  // Modals & Navigation triggers
  activeModal: 'photo_search' | 'quote_upload' | 'request_part' | 'vehicle_picker' | 'cart' | 'supplier_store' | 'rate_dealer' | 'auth' | null;
  setActiveModal: (modal: 'photo_search' | 'quote_upload' | 'request_part' | 'vehicle_picker' | 'cart' | 'supplier_store' | 'rate_dealer' | 'auth' | null) => void;
  selectedSupplierIdForStore: string | null;
  setSelectedSupplierIdForStore: (id: string | null) => void;
  selectedOrderForRating: Order | null;
  setSelectedOrderForRating: (order: Order | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  stockAlerts: StockAlert[];
  addStockAlert: (alert: Omit<StockAlert, 'id' | 'createdAt' | 'status'>) => StockAlert;
  removeStockAlert: (alertId: string) => void;
  isPartAlerted: (partId: string, supplierId?: string) => boolean;
  getPartAlert: (partId: string, supplierId?: string) => StockAlert | undefined;
  // Parts Bidding & Reverse Auctions
  prefilledPartRequest: PrefilledPartRequest | null;
  setPrefilledPartRequest: (req: PrefilledPartRequest | null) => void;
  selectedRequestForBid: PartRequest | null;
  setSelectedRequestForBid: (req: PartRequest | null) => void;
  simulateDealerBid: (requestId: string) => void;
  // Car Auctions & Bidding
  carAuctions: CarAuction[];
  placeBid: (auctionId: string, amountUSD: number, bidderName?: string) => { success: boolean; message: string };
  buyItNow: (auctionId: string) => { success: boolean; message: string };
  toggleWatchlistCar: (auctionId: string) => void;
  submitCarAuction: (newAuction: Omit<CarAuction, 'id' | 'currentBidUSD' | 'bidsCount' | 'bids' | 'isReserveMet' | 'lotNumber'>) => CarAuction;
  selectedAuction: CarAuction | null;
  setSelectedAuction: (auction: CarAuction | null) => void;
  isSubmitCarModalOpen: boolean;
  setIsSubmitCarModalOpen: (open: boolean) => void;
  // B2B Dealer Integrations & Inventory Synchronization
  dealerIntegrations: DealerIntegration[];
  syncJobs: IntegrationSyncJob[];
  syncErrors: IntegrationSyncError[];
  externalProducts: ExternalProduct[];
  dealerBranches: DealerBranch[];
  createOrUpdateIntegration: (integration: Partial<DealerIntegration> & { dealerId: string; providerName: string }) => DealerIntegration;
  toggleIntegrationStatus: (integrationId: string, status: DealerIntegration['status']) => void;
  triggerManualSync: (integrationId: string, syncType?: IntegrationSyncJob['syncType']) => Promise<IntegrationSyncJob>;
  resolveSyncError: (errorId: string, action: 'resolve' | 'ignore' | 'retry') => void;
  generateOrRotateApiKey: (integrationId: string) => { apiKey: string; maskedApiKey: string };
  generateWebhookSecret: (integrationId: string) => string;
  saveFieldMappings: (integrationId: string, mappings: IntegrationFieldMapping[]) => void;
  addOrUpdateDealerBranch: (branch: Omit<DealerBranch, 'id'> & { id?: string }) => DealerBranch;
  deleteDealerBranch: (branchId: string) => void;
  processSmartCsvImport: (
    dealerId: string,
    rows: Record<string, any>[],
    mappings: IntegrationFieldMapping[],
    options?: { branchId?: string; currency?: 'USD' | 'IQD'; autoPublish?: boolean }
  ) => { createdCount: number; updatedCount: number; errorCount: number; errors: string[] };
  simulatePartnerWebhook: (dealerId: string, eventType: IntegrationWebhook['eventType'], payload: any) => { success: boolean; message: string };
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('customer');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [currency, setCurrencyState] = useState<'USD' | 'IQD'>(() => {
    const saved = localStorage.getItem('sp_currency');
    return saved === 'IQD' ? 'IQD' : 'USD';
  });

  const setCurrency = (curr: 'USD' | 'IQD') => {
    setCurrencyState(curr);
    localStorage.setItem('sp_currency', curr);
  };

  const formatPrice = (amountUSD?: number, amountIQD?: number): string => {
    const usd = amountUSD ?? 0;
    const iqd = amountIQD ?? Math.round(usd * 1500);

    if (currency === 'IQD') {
      return `${iqd.toLocaleString()} ${language === 'ar' ? 'د.ع' : 'IQD'}`;
    }
    return `$${usd.toLocaleString()}`;
  };

  // Stored state with localStorage cache
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('sp_vehicles');
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(() => {
    const saved = localStorage.getItem('sp_active_vehicle');
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES[0];
  });

  const [masterParts, setMasterParts] = useState<MasterPart[]>(() => {
    const saved = localStorage.getItem('sp_master_parts');
    return saved ? JSON.parse(saved) : MASTER_PARTS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('sp_suppliers');
    return saved ? JSON.parse(saved) : SUPPLIERS;
  });

  const [partRequests, setPartRequests] = useState<PartRequest[]>(() => {
    const saved = localStorage.getItem('sp_part_requests');
    if (!saved) return INITIAL_REQUESTS;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length < INITIAL_REQUESTS.length) {
        return INITIAL_REQUESTS;
      }
      return parsed;
    } catch {
      return INITIAL_REQUESTS;
    }
  });

  const [repairOrders, setRepairOrders] = useState<RepairOrder[]>(() => {
    const saved = localStorage.getItem('sp_repair_orders');
    return saved ? JSON.parse(saved) : INITIAL_REPAIR_ORDERS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('sp_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [reviews, setReviews] = useState<DealerReview[]>(() => {
    const saved = localStorage.getItem('sp_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [demandIntelligence] = useState<DemandIntelligenceItem[]>(DEMAND_INTELLIGENCE);

  const [disputes, setDisputes] = useState<Dispute[]>(() => {
    const saved = localStorage.getItem('sp_disputes');
    return saved ? JSON.parse(saved) : [];
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('sp_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>(() => {
    const saved = localStorage.getItem('sp_stock_alerts');
    return saved ? JSON.parse(saved) : [];
  });

  // Car Auctions & Bidding State
  const [carAuctions, setCarAuctions] = useState<CarAuction[]>(() => {
    const saved = localStorage.getItem('sp_car_auctions');
    return saved ? JSON.parse(saved) : INITIAL_AUCTIONS;
  });
  const [selectedAuction, setSelectedAuction] = useState<CarAuction | null>(null);
  const [isSubmitCarModalOpen, setIsSubmitCarModalOpen] = useState<boolean>(false);

  // B2B Dealer Integrations & Inventory Synchronization State
  const [dealerIntegrations, setDealerIntegrations] = useState<DealerIntegration[]>(() => {
    const saved = localStorage.getItem('sp_dealer_integrations');
    return saved ? JSON.parse(saved) : INITIAL_DEALER_INTEGRATIONS;
  });

  const [syncJobs, setSyncJobs] = useState<IntegrationSyncJob[]>(() => {
    const saved = localStorage.getItem('sp_sync_jobs');
    return saved ? JSON.parse(saved) : INITIAL_SYNC_JOBS;
  });

  const [syncErrors, setSyncErrors] = useState<IntegrationSyncError[]>(() => {
    const saved = localStorage.getItem('sp_sync_errors');
    return saved ? JSON.parse(saved) : INITIAL_SYNC_ERRORS;
  });

  const [externalProducts, setExternalProducts] = useState<ExternalProduct[]>(() => {
    const saved = localStorage.getItem('sp_external_products');
    return saved ? JSON.parse(saved) : INITIAL_EXTERNAL_PRODUCTS;
  });

  const [dealerBranches, setDealerBranches] = useState<DealerBranch[]>(() => {
    const saved = localStorage.getItem('sp_dealer_branches');
    return saved ? JSON.parse(saved) : INITIAL_DEALER_BRANCHES;
  });

  // Parts Bidding & Reverse Auctions State
  const [prefilledPartRequest, setPrefilledPartRequest] = useState<PrefilledPartRequest | null>(null);
  const [selectedRequestForBid, setSelectedRequestForBid] = useState<PartRequest | null>(null);

  // User Profiles & Authentication
  const DEFAULT_PROFILES: Record<UserRole, UserProfile> = {
    customer: {
      id: 'usr-cust-1',
      name: 'Ahmed Al-Tikriti',
      email: 'ahmed@iqautomarket.iq',
      phone: '+964 770 123 4567',
      role: 'customer',
      city: 'Baghdad',
      address: 'Karrada, District 903, Street 14',
      verificationStatus: 'verified',
      registeredAt: '2025-11-12',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    },
    workshop: {
      id: 'usr-work-1',
      name: 'Mustafa Al-Kadhimi',
      email: 'service@babilauto.iq',
      phone: '+964 750 987 6543',
      role: 'workshop',
      companyName: 'Babil Diagnostic & Performance Garage',
      city: 'Erbil',
      address: '100m Road Industrial Zone, Hub #4B',
      verificationStatus: 'verified',
      registeredAt: '2025-08-20',
      avatarUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=120&q=80',
    },
    supplier: {
      id: 'usr-sup-1',
      name: 'Hassan Al-Mansour',
      email: 'sales@mansourparts.iq',
      phone: '+964 780 555 1234',
      role: 'supplier',
      companyName: 'Al-Mansour Genuine Auto Parts Ltd.',
      city: 'Baghdad',
      address: 'Al-Sinak Wholesale Commercial District',
      verificationStatus: 'verified',
      businessType: 'Authorized Distributor',
      registeredAt: '2025-05-10',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    },
    admin: {
      id: 'usr-adm-1',
      name: 'Zaid Al-Rawi',
      email: 'admin@iqautomarket.iq',
      phone: '+964 771 000 9999',
      role: 'admin',
      companyName: 'IQAutoMarket Operations HQ',
      city: 'Baghdad',
      address: 'Baghdad Tech Tower, Level 18',
      verificationStatus: 'verified',
      registeredAt: '2025-01-01',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    },
  };

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('sp_current_user');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILES.customer;
  });

  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');
  const [authTargetRole, setAuthTargetRole] = useState<UserRole>('customer');

  const openAuthModal = (targetRole?: UserRole, tab: 'signin' | 'signup' = 'signin') => {
    if (targetRole) setAuthTargetRole(targetRole);
    setAuthModalTab(tab);
    setActiveModal('auth');
  };

  const login = async (email: string, password: string, selectedRole: UserRole): Promise<{ success: boolean; message?: string }> => {
    // Simulate network validation latency
    await new Promise((res) => setTimeout(res, 600));

    // Demo lookup or fallback profile
    const existing = DEFAULT_PROFILES[selectedRole];
    const userProfile: UserProfile = {
      ...existing,
      email: email || existing.email,
      role: selectedRole,
    };

    setCurrentUser(userProfile);
    setRole(selectedRole);
    localStorage.setItem('sp_current_user', JSON.stringify(userProfile));
    setActiveModal(null);
    return { success: true };
  };

  const signup = async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    companyName?: string;
    city?: string;
    businessType?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    // Simulate server user provisioning latency
    await new Promise((res) => setTimeout(res, 700));

    const newUser: UserProfile = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      companyName: data.companyName,
      city: data.city || 'Baghdad',
      businessType: data.businessType,
      verificationStatus: data.role === 'admin' ? 'verified' : data.role === 'customer' ? 'verified' : 'pending',
      registeredAt: new Date().toISOString().slice(0, 10),
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`,
    };

    setCurrentUser(newUser);
    setRole(data.role);
    localStorage.setItem('sp_current_user', JSON.stringify(newUser));
    setActiveModal(null);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sp_current_user');
  };

  // UI state
  const [activeModal, setActiveModal] = useState<'photo_search' | 'quote_upload' | 'request_part' | 'vehicle_picker' | 'cart' | 'supplier_store' | 'rate_dealer' | 'auth' | null>(null);
  const [selectedSupplierIdForStore, setSelectedSupplierIdForStore] = useState<string | null>(null);
  const [selectedOrderForRating, setSelectedOrderForRating] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('sp_vehicles', JSON.stringify(userVehicles));
  }, [userVehicles]);

  useEffect(() => {
    localStorage.setItem('sp_active_vehicle', JSON.stringify(activeVehicle));
  }, [activeVehicle]);

  useEffect(() => {
    localStorage.setItem('sp_master_parts', JSON.stringify(masterParts));
  }, [masterParts]);

  useEffect(() => {
    localStorage.setItem('sp_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('sp_part_requests', JSON.stringify(partRequests));
  }, [partRequests]);

  useEffect(() => {
    localStorage.setItem('sp_repair_orders', JSON.stringify(repairOrders));
  }, [repairOrders]);

  useEffect(() => {
    localStorage.setItem('sp_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('sp_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('sp_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('sp_disputes', JSON.stringify(disputes));
  }, [disputes]);

  useEffect(() => {
    localStorage.setItem('sp_stock_alerts', JSON.stringify(stockAlerts));
  }, [stockAlerts]);

  useEffect(() => {
    localStorage.setItem('sp_car_auctions', JSON.stringify(carAuctions));
  }, [carAuctions]);

  useEffect(() => {
    localStorage.setItem('sp_dealer_integrations', JSON.stringify(dealerIntegrations));
  }, [dealerIntegrations]);

  useEffect(() => {
    localStorage.setItem('sp_sync_jobs', JSON.stringify(syncJobs));
  }, [syncJobs]);

  useEffect(() => {
    localStorage.setItem('sp_sync_errors', JSON.stringify(syncErrors));
  }, [syncErrors]);

  useEffect(() => {
    localStorage.setItem('sp_external_products', JSON.stringify(externalProducts));
  }, [externalProducts]);

  useEffect(() => {
    localStorage.setItem('sp_dealer_branches', JSON.stringify(dealerBranches));
  }, [dealerBranches]);

  const placeBid = (
    auctionId: string,
    amountUSD: number,
    bidderName: string = 'You (Verified Bidder)'
  ): { success: boolean; message: string } => {
    const target = carAuctions.find((a) => a.id === auctionId);
    if (!target) return { success: false, message: 'Auction not found' };

    if (amountUSD <= target.currentBidUSD) {
      return {
        success: false,
        message: `Bid must be strictly higher than current bid of $${target.currentBidUSD.toLocaleString()}`,
      };
    }

    const minRequired = target.currentBidUSD + (target.minIncrementUSD || 500);
    if (amountUSD < minRequired) {
      return {
        success: false,
        message: `Minimum bid increment is $${(target.minIncrementUSD || 500).toLocaleString()}. Next valid bid is $${minRequired.toLocaleString()}`,
      };
    }

    const newBid: AuctionBid = {
      id: `bid-${Date.now()}`,
      auctionId,
      bidderName,
      bidderCity: 'Verified Bidder Desk',
      amountUSD,
      amountIQD: Math.round(amountUSD * 1310),
      timestamp: 'Just now',
      isHighBid: true,
      isUserBid: true,
    };

    setCarAuctions((prev) =>
      prev.map((a) => {
        if (a.id === auctionId) {
          const oldBids = a.bids.map((b) => ({ ...b, isHighBid: false }));
          const isReserveMet = a.reservePriceUSD ? amountUSD >= a.reservePriceUSD : true;
          const updated: CarAuction = {
            ...a,
            currentBidUSD: amountUSD,
            bidsCount: a.bidsCount + 1,
            isReserveMet: isReserveMet || a.isReserveMet,
            bids: [newBid, ...oldBids],
          };
          if (selectedAuction && selectedAuction.id === auctionId) {
            setSelectedAuction(updated);
          }
          return updated;
        }
        return a;
      })
    );

    return {
      success: true,
      message: `Bid of $${amountUSD.toLocaleString()} placed successfully! You are now the winning bidder.`,
    };
  };

  const buyItNow = (auctionId: string): { success: boolean; message: string } => {
    const target = carAuctions.find((a) => a.id === auctionId);
    if (!target || !target.buyItNowPriceUSD) {
      return { success: false, message: 'Buy It Now is not available for this vehicle.' };
    }
    const amountUSD = target.buyItNowPriceUSD;
    const newBid: AuctionBid = {
      id: `bin-${Date.now()}`,
      auctionId,
      bidderName: 'You (Buy It Now Winner)',
      bidderCity: 'Direct Checkout',
      amountUSD,
      amountIQD: Math.round(amountUSD * 1310),
      timestamp: 'Just now',
      isHighBid: true,
      isUserBid: true,
    };

    setCarAuctions((prev) =>
      prev.map((a) => {
        if (a.id === auctionId) {
          const updated: CarAuction = {
            ...a,
            currentBidUSD: amountUSD,
            bidsCount: a.bidsCount + 1,
            isReserveMet: true,
            bids: [newBid, ...a.bids.map((b) => ({ ...b, isHighBid: false }))],
          };
          if (selectedAuction && selectedAuction.id === auctionId) {
            setSelectedAuction(updated);
          }
          return updated;
        }
        return a;
      })
    );

    return {
      success: true,
      message: `Congratulations! You purchased lot ${target.lotNumber} (${target.title}) for $${amountUSD.toLocaleString()}. Consignment team will reach out to finalize transfer.`,
    };
  };

  const toggleWatchlistCar = (auctionId: string) => {
    setCarAuctions((prev) =>
      prev.map((a) => {
        if (a.id === auctionId) {
          const updated = { ...a, isWatchlisted: !a.isWatchlisted };
          if (selectedAuction && selectedAuction.id === auctionId) {
            setSelectedAuction(updated);
          }
          return updated;
        }
        return a;
      })
    );
  };

  const submitCarAuction = (
    newAuction: Omit<CarAuction, 'id' | 'currentBidUSD' | 'bidsCount' | 'bids' | 'isReserveMet' | 'lotNumber'>
  ): CarAuction => {
    const id = `auction-${Date.now()}`;
    const lotNumber = `LOT-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullAuction: CarAuction = {
      ...newAuction,
      id,
      lotNumber,
      currentBidUSD: newAuction.startingBidUSD,
      bidsCount: 0,
      bids: [],
      isReserveMet: !newAuction.reservePriceUSD || newAuction.startingBidUSD >= newAuction.reservePriceUSD,
      viewsCount: 1,
    };
    setCarAuctions((prev) => [fullAuction, ...prev]);
    return fullAuction;
  };

  const addStockAlert = (alertData: Omit<StockAlert, 'id' | 'createdAt' | 'status'>): StockAlert => {
    const newAlert: StockAlert = {
      ...alertData,
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    setStockAlerts((prev) => [
      newAlert,
      ...prev.filter((a) => !(a.partId === alertData.partId && a.supplierId === alertData.supplierId && a.email.toLowerCase() === alertData.email.toLowerCase())),
    ]);
    return newAlert;
  };

  const removeStockAlert = (alertId: string) => {
    setStockAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const isPartAlerted = (partId: string, supplierId?: string) => {
    return stockAlerts.some((a) => a.partId === partId && (!supplierId || a.supplierId === supplierId));
  };

  const getPartAlert = (partId: string, supplierId?: string) => {
    return stockAlerts.find((a) => a.partId === partId && (!supplierId || a.supplierId === supplierId));
  };

  const addUserVehicle = (v: Vehicle) => {
    const updated = [v, ...userVehicles];
    setUserVehicles(updated);
    setActiveVehicle(v);
  };

  const addToCart = (masterPart: MasterPart, offer: SupplierOffer, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.offer.id === offer.id);
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += quantity;
        return copy;
      }
      return [...prev, { masterPart, offer, quantity }];
    });
  };

  const removeFromCart = (offerId: string) => {
    setCart((prev) => prev.filter((item) => item.offer.id !== offerId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const createOrder = (orderData: Partial<Order>): Order => {
    const newOrder: Order = {
      id: `ord-${Date.now().toString().slice(-4)}`,
      orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: orderData.customerId || 'cust-1',
      customerName: orderData.customerName || 'Ahmed Al-Tikriti',
      customerPhone: orderData.customerPhone || '+964 770 551 2299',
      vehicleInfo: orderData.vehicleInfo || (activeVehicle ? `${activeVehicle.make} ${activeVehicle.model} ${activeVehicle.year}` : 'Standard Vehicle'),
      items: orderData.items || [],
      totalUSD: orderData.totalUSD || 0,
      totalIQD: orderData.totalIQD || 0,
      deliveryMethod: orderData.deliveryMethod || 'supplier_delivery',
      deliveryAddress: orderData.deliveryAddress || 'Erbil Central District',
      paymentMethod: orderData.paymentMethod || 'cash_on_delivery',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      estimatedDeliveryDate: 'Today (within 2-3 hours)',
      supplierId: orderData.supplierId || (orderData.items?.[0]?.supplierId || 'sup-1'),
      supplierName: orderData.supplierName || (orderData.items?.[0]?.supplierName || 'ABC Genuine Parts'),
      isRated: false,
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const createPartRequest = (req: Omit<PartRequest, 'id' | 'requestNumber' | 'createdAt' | 'status' | 'offers'>): PartRequest => {
    const newRequest: PartRequest = {
      ...req,
      id: `req-${Date.now().toString().slice(-4)}`,
      requestNumber: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: 'open',
      offers: [],
    };
    setPartRequests((prev) => [newRequest, ...prev]);
    return newRequest;
  };

  const submitSupplierOffer = (requestId: string, offer: Omit<RequestOffer, 'id' | 'requestId' | 'createdAt' | 'status'>) => {
    const newOffer: RequestOffer = {
      ...offer,
      id: `roff-${Date.now().toString().slice(-4)}`,
      requestId,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    setPartRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          const updatedOffers = [...r.offers, newOffer];
          return {
            ...r,
            status: 'offers_received',
            offers: updatedOffers,
          };
        }
        return r;
      })
    );
  };

  const simulateDealerBid = (requestId: string) => {
    const targetReq = partRequests.find((r) => r.id === requestId);
    if (!targetReq) return;

    const storeNames = [
      { name: 'Al-Mansour Auto Parts Co.', city: 'Baghdad', rating: 4.8, count: 640 },
      { name: 'Erbil Super Spares Hub', city: 'Erbil', rating: 4.9, count: 1120 },
      { name: 'Tigris Genuine Imports', city: 'Basra', rating: 4.7, count: 530 },
      { name: 'Babylon Performance & OEM', city: 'Hillah', rating: 4.9, count: 780 },
    ];
    const store = storeNames[Math.floor(Math.random() * storeNames.length)];

    const currentMin =
      targetReq.offers.length > 0
        ? Math.min(...targetReq.offers.map((o) => o.priceUSD))
        : 220;
    const bidPriceUSD = Math.max(30, Math.round(currentMin * 0.9));
    const bidPriceIQD = Math.round(bidPriceUSD * 1320);

    const newOffer: RequestOffer = {
      id: `roff-sim-${Date.now().toString().slice(-4)}`,
      requestId,
      supplierId: `sup-sim-${Date.now()}`,
      supplierName: store.name,
      supplierRating: store.rating,
      verifiedInteractionsCount: store.count,
      partName: `${targetReq.partName} (Certified OE)`,
      partNumber: targetReq.partNumberHint || 'OE-SPEC-MATCH',
      brand: 'OE Certified Global Tier-1',
      quality: 'oem',
      priceUSD: bidPriceUSD,
      priceIQD: bidPriceIQD,
      availability: 'In Stock - Immediate Dispatch',
      deliveryTime: 'Same Day (Within 2 Hours)',
      warranty: '6-Month Comprehensive Warranty',
      offerExpiryHours: 24,
      badge: 'LOWEST PRICE',
      status: 'pending',
      notes: `Competitive dealer bid submitted via platform. Guaranteed fitment for ${targetReq.vehicle.make} ${targetReq.vehicle.model}.`,
      createdAt: new Date().toISOString(),
    };

    setPartRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'offers_received',
            offers: [newOffer, ...r.offers],
          };
        }
        return r;
      })
    );
  };

  const acceptRequestOffer = (requestId: string, offerId: string): Order | null => {
    const targetReq = partRequests.find((r) => r.id === requestId);
    if (!targetReq) return null;
    const targetOffer = targetReq.offers.find((o) => o.id === offerId);
    if (!targetOffer) return null;

    // Update request state
    setPartRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'accepted',
            offers: r.offers.map((o) => (o.id === offerId ? { ...o, status: 'accepted' } : { ...o, status: 'declined' })),
          };
        }
        return r;
      })
    );

    // Create Order from Accepted Offer
    const createdOrder = createOrder({
      customerId: targetReq.customerId,
      customerName: targetReq.customerName,
      customerPhone: targetReq.customerPhone,
      vehicleInfo: `${targetReq.vehicle.make} ${targetReq.vehicle.model} ${targetReq.vehicle.year}`,
      items: [
        {
          masterPartId: 'part-request',
          partName: targetOffer.partName,
          partNumber: targetOffer.partNumber,
          brand: targetOffer.brand,
          quality: targetOffer.quality,
          quantity: targetReq.quantity || 1,
          unitPriceUSD: targetOffer.priceUSD,
          unitPriceIQD: targetOffer.priceIQD,
          supplierId: targetOffer.supplierId,
          supplierName: targetOffer.supplierName,
        },
      ],
      totalUSD: targetOffer.priceUSD * (targetReq.quantity || 1),
      totalIQD: targetOffer.priceIQD * (targetReq.quantity || 1),
      supplierId: targetOffer.supplierId,
      supplierName: targetOffer.supplierName,
      deliveryMethod: 'supplier_delivery',
      paymentMethod: 'cash_on_delivery',
    });

    return createdOrder;
  };

  const addDealerReview = (reviewData: Omit<DealerReview, 'id' | 'date'>) => {
    const newRev: DealerReview = {
      ...reviewData,
      id: `rev-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
    };

    setReviews((prev) => [newRev, ...prev]);

    // Recalculate supplier stats
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === reviewData.supplierId) {
          const supplierReviews = [...reviews.filter((r) => r.supplierId === s.id), newRev];
          const avgOverall = Number((supplierReviews.reduce((sum, r) => sum + r.overallRating, 0) / supplierReviews.length).toFixed(1));
          const wouldDealCount = supplierReviews.filter((r) => r.wouldDealAgain).length;
          const repeatPct = Math.round((wouldDealCount / supplierReviews.length) * 100);

          return {
            ...s,
            rating: avgOverall,
            verifiedInteractionsCount: s.verifiedInteractionsCount + 1,
            repeatCustomerPercentage: repeatPct,
          };
        }
        return s;
      })
    );

    // Mark order as rated if applicable
    if (reviewData.orderId) {
      setOrders((prev) =>
        prev.map((o) => (o.id === reviewData.orderId ? { ...o, isRated: true } : o))
      );
    }
  };

  const createDispute = (dispData: Omit<Dispute, 'id' | 'disputeNumber' | 'createdAt' | 'status'>): Dispute => {
    const newDisp: Dispute = {
      ...dispData,
      id: `disp-${Date.now().toString().slice(-4)}`,
      disputeNumber: `D-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'under_review',
      createdAt: new Date().toISOString(),
    };
    setDisputes((prev) => [newDisp, ...prev]);
    return newDisp;
  };

  const addMasterPart = (partData: Omit<MasterPart, 'id'>) => {
    const newPart: MasterPart = {
      ...partData,
      id: `part-${Date.now().toString().slice(-4)}`,
    };
    setMasterParts((prev) => [newPart, ...prev]);
  };

  const updateSupplierVerification = (supplierId: string, level: Supplier['verificationLevel']) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === supplierId ? { ...s, verificationLevel: level } : s))
    );
  };

  const addSupplierOfferToPart = (masterPartId: string, offerData: Omit<SupplierOffer, 'id'>) => {
    const newOffer: SupplierOffer = {
      ...offerData,
      id: `off-${Date.now().toString().slice(-5)}`,
    };
    setMasterParts((prev) =>
      prev.map((p) => {
        if (p.id === masterPartId) {
          return {
            ...p,
            offers: [newOffer, ...p.offers],
          };
        }
        return p;
      })
    );
  };

  const bulkUploadProducts = (
    supplierId: string,
    mappedRows: { partNumber: string; partName: string; priceUSD: number; stock: number; brand: string; quality: string }[]
  ) => {
    let matchedCount = 0;
    let newCount = 0;
    const sup = suppliers.find((s) => s.id === supplierId);
    const supplierName = sup ? sup.companyName : 'Authorized Supplier';

    setMasterParts((prev) => {
      const updated = [...prev];
      mappedRows.forEach((row) => {
        const cleanNumber = row.partNumber.trim().toUpperCase();
        const existingPart = updated.find(
          (p) =>
            p.partNumber.toUpperCase() === cleanNumber ||
            p.alternativeNumbers?.some((alt) => alt.toUpperCase() === cleanNumber)
        );

        const newOffer: SupplierOffer = {
          id: `off-bulk-${Date.now()}-${Math.random().toString().slice(2, 6)}`,
          supplierId,
          supplierName,
          supplierRating: sup?.rating || 4.8,
          verifiedInteractionsCount: sup?.verifiedInteractionsCount || 500,
          repeatPurchaseRate: sup?.repeatCustomerPercentage || 95,
          quality: (row.quality as any) || 'genuine',
          brand: row.brand || 'Genuine OEM',
          priceUSD: row.priceUSD,
          priceIQD: Math.round(row.priceUSD * 1320),
          stockStatus: row.stock > 0 ? 'in_stock_today' : 'order_on_demand',
          stockQuantity: row.stock,
          warranty: '6-Month Warranty',
          deliveryTime: 'Same Day Delivery',
          deliveryOptions: ['pickup', 'supplier_delivery'],
          supplierCity: sup?.city || 'Baghdad',
          supplierLocationDetail: sup?.address || 'Main Warehouse',
        };

        if (existingPart) {
          matchedCount++;
          existingPart.offers = [newOffer, ...existingPart.offers.filter((o) => o.supplierId !== supplierId)];
        } else {
          newCount++;
          updated.push({
            id: `part-${Date.now()}-${Math.random().toString().slice(2, 5)}`,
            partNumber: row.partNumber,
            partName: row.partName,
            manufacturer: row.brand || 'OEM Supplier',
            brand: row.brand || 'OEM',
            category: 'Engine',
            description: `Imported automotive part: ${row.partName}.`,
            specifications: { 'Part Number': row.partNumber, 'Stock Level': `${row.stock} units` },
            imageUrl: 'https://images.unsplash.com/photo-1558441719-8b489c63f7d1?auto=format&fit=crop&w=600&q=80',
            compatibleVehicles: [
              {
                make: 'Toyota',
                model: 'Universal / Fitment pending verification',
                yearStart: 2015,
                yearEnd: 2024,
                engine: 'All Engines',
              },
            ],
            offers: [newOffer],
          });
        }
      });
      return updated;
    });

    return { matchedCount, newCount };
  };

  const createRepairOrder = (roData: Omit<RepairOrder, 'id' | 'orderNumber' | 'status' | 'date'>): RepairOrder => {
    const newRO: RepairOrder = {
      ...roData,
      id: `ro-${Date.now().toString().slice(-4)}`,
      orderNumber: `RO-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'procuring',
      date: new Date().toISOString().split('T')[0],
    };
    setRepairOrders((prev) => [newRO, ...prev]);
    return newRO;
  };

  // ==========================================
  // Dealer Integrations & Inventory Sync Actions
  // ==========================================

  const createOrUpdateIntegration = (
    data: Partial<DealerIntegration> & { dealerId: string; providerName: string }
  ): DealerIntegration => {
    const sup = suppliers.find((s) => s.id === data.dealerId);
    const dealerName = sup ? sup.companyName : 'Authorized Dealer';
    const existingIndex = dealerIntegrations.findIndex(
      (i) => i.id === data.id || (i.dealerId === data.dealerId && i.providerType === data.providerType)
    );

    const randomKey = `iqm_live_${Math.random().toString(36).substring(2, 12)}${Date.now().toString(36)}`;
    const masked = `iqm_live_${randomKey.substring(9, 13)}••••••••••••••••••••${randomKey.slice(-4)}`;
    const randomWhSecret = `whsec_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 6)}`;

    let savedIntegration: DealerIntegration;

    if (existingIndex >= 0) {
      const existing = dealerIntegrations[existingIndex];
      savedIntegration = {
        ...existing,
        ...data,
        dealerName: existing.dealerName || dealerName,
        updatedAt: new Date().toISOString(),
      };
      setDealerIntegrations((prev) => {
        const copy = [...prev];
        copy[existingIndex] = savedIntegration;
        return copy;
      });
    } else {
      savedIntegration = {
        id: data.id || `integ-${Date.now().toString().slice(-5)}`,
        dealerId: data.dealerId,
        dealerName,
        providerName: data.providerName,
        providerVersion: data.providerVersion || 'v1.0',
        providerType: data.providerType || 'erp',
        integrationMethod: data.integrationMethod || 'api',
        status: data.status || 'active',
        apiKey: data.apiKey || randomKey,
        maskedApiKey: data.maskedApiKey || masked,
        webhookSecret: data.webhookSecret || randomWhSecret,
        endpointUrl: data.endpointUrl || '',
        sftpHost: data.sftpHost || '',
        sftpUsername: data.sftpUsername || '',
        syncRules: data.syncRules || {
          syncFrequency: 'every_15min',
          autoPublishNewProducts: true,
          requireAdminApproval: false,
          priceSource: 'retail',
          currency: 'USD',
          stockSource: 'available',
          hideOutOfStock: false,
          autoUpdatePrices: true,
          syncOrdersBackToDealer: true,
          stockReservationMode: 'marketplace',
          includedBranchIds: dealerBranches.filter((b) => b.dealerId === data.dealerId).map((b) => b.id),
        },
        fieldMappings: data.fieldMappings || DEFAULT_FIELD_MAPPINGS,
        lastSyncAt: new Date().toISOString(),
        nextSyncAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        syncHealthScore: 98,
        totalProductsSynced: data.totalProductsSynced || 120,
        totalInventorySynced: data.totalInventorySynced || 450,
        totalPriceRecordsSynced: data.totalPriceRecordsSynced || 120,
        failedRecordsCount: 0,
        pendingUpdatesCount: 0,
        apiCallsLast24h: 1,
        webhookStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setDealerIntegrations((prev) => [savedIntegration, ...prev]);
    }

    return savedIntegration;
  };

  const toggleIntegrationStatus = (integrationId: string, status: DealerIntegration['status']) => {
    setDealerIntegrations((prev) =>
      prev.map((i) => (i.id === integrationId ? { ...i, status, updatedAt: new Date().toISOString() } : i))
    );
  };

  const triggerManualSync = async (
    integrationId: string,
    syncType: IntegrationSyncJob['syncType'] = 'incremental'
  ): Promise<IntegrationSyncJob> => {
    const integration = dealerIntegrations.find((i) => i.id === integrationId);
    const dealerId = integration?.dealerId || 'sup-1';
    const dealerName = integration?.dealerName || 'ABC Genuine Parts';

    // Simulate async network processing
    const startedAt = new Date().toISOString();
    await new Promise((resolve) => setTimeout(resolve, 800));

    const processed = Math.floor(80 + Math.random() * 200);
    const updated = Math.floor(processed * 0.9);
    const created = processed - updated;
    const failed = Math.random() > 0.8 ? 1 : 0;
    const completedAt = new Date().toISOString();

    const newJob: IntegrationSyncJob = {
      id: `job-${Date.now().toString().slice(-4)}`,
      integrationId,
      dealerId,
      dealerName,
      syncType,
      status: failed > 0 ? 'completed_with_warnings' : 'completed',
      startedAt,
      completedAt,
      durationMs: 820,
      recordsProcessed: processed,
      recordsCreated: created,
      recordsUpdated: updated,
      recordsFailed: failed,
      errorSummary: failed > 0 ? '1 record had invalid price formatting' : undefined,
    };

    setSyncJobs((prev) => [newJob, ...prev]);

    // Update integration metrics
    setDealerIntegrations((prev) =>
      prev.map((i) => {
        if (i.id === integrationId) {
          return {
            ...i,
            lastSyncAt: completedAt,
            nextSyncAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            totalProductsSynced: i.totalProductsSynced + created,
            totalInventorySynced: i.totalInventorySynced + processed,
            totalPriceRecordsSynced: i.totalPriceRecordsSynced + updated,
            apiCallsLast24h: i.apiCallsLast24h + 1,
            failedRecordsCount: i.failedRecordsCount + failed,
            syncHealthScore: failed > 0 ? Math.max(85, i.syncHealthScore - 2) : Math.min(100, i.syncHealthScore + 1),
          };
        }
        return i;
      })
    );

    return newJob;
  };

  const resolveSyncError = (errorId: string, action: 'resolve' | 'ignore' | 'retry') => {
    setSyncErrors((prev) =>
      prev.map((e) => {
        if (e.id === errorId) {
          return {
            ...e,
            status: action === 'ignore' ? 'ignored' : 'resolved',
            resolvedAt: new Date().toISOString(),
          };
        }
        return e;
      })
    );
  };

  const generateOrRotateApiKey = (integrationId: string) => {
    const raw = `iqm_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
    const masked = `iqm_live_${raw.substring(9, 13)}••••••••••••••••••••${raw.slice(-4)}`;

    setDealerIntegrations((prev) =>
      prev.map((i) => (i.id === integrationId ? { ...i, apiKey: raw, maskedApiKey: masked, updatedAt: new Date().toISOString() } : i))
    );

    return { apiKey: raw, maskedApiKey: masked };
  };

  const generateWebhookSecret = (integrationId: string) => {
    const secret = `whsec_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 8)}`;
    setDealerIntegrations((prev) =>
      prev.map((i) => (i.id === integrationId ? { ...i, webhookSecret: secret, updatedAt: new Date().toISOString() } : i))
    );
    return secret;
  };

  const saveFieldMappings = (integrationId: string, mappings: IntegrationFieldMapping[]) => {
    setDealerIntegrations((prev) =>
      prev.map((i) => (i.id === integrationId ? { ...i, fieldMappings: mappings, updatedAt: new Date().toISOString() } : i))
    );
  };

  const addOrUpdateDealerBranch = (branchData: Omit<DealerBranch, 'id'> & { id?: string }): DealerBranch => {
    const id = branchData.id || `branch-${Date.now().toString().slice(-4)}`;
    const fullBranch: DealerBranch = {
      ...branchData,
      id,
    };

    setDealerBranches((prev) => {
      const exists = prev.some((b) => b.id === id);
      if (exists) {
        return prev.map((b) => (b.id === id ? fullBranch : b));
      }
      return [...prev, fullBranch];
    });

    return fullBranch;
  };

  const deleteDealerBranch = (branchId: string) => {
    setDealerBranches((prev) => prev.filter((b) => b.id !== branchId));
  };

  const processSmartCsvImport = (
    dealerId: string,
    rows: Record<string, any>[],
    mappings: IntegrationFieldMapping[],
    options?: { branchId?: string; currency?: 'USD' | 'IQD'; autoPublish?: boolean }
  ) => {
    const sup = suppliers.find((s) => s.id === dealerId);
    const supplierName = sup ? sup.companyName : 'Authorized Dealer';
    const errors: string[] = [];
    let createdCount = 0;
    let updatedCount = 0;

    // Helper to resolve mapped field value
    const getMappedVal = (row: Record<string, any>, destField: string) => {
      const map = mappings.find((m) => m.destinationField === destField);
      if (!map) {
        // Fallback to direct key if present
        return row[destField] ?? row[destField.toLowerCase()] ?? '';
      }
      let val = row[map.sourceField] ?? row[map.sourceField.toLowerCase()] ?? map.defaultValue ?? '';
      if (typeof val === 'string') {
        if (map.transformationRule === 'uppercase') val = val.toUpperCase().trim();
        else if (map.transformationRule === 'trim') val = val.trim();
      }
      return val;
    };

    const targetBranch = dealerBranches.find((b) => b.id === options?.branchId && b.dealerId === dealerId) || dealerBranches[0];

    setMasterParts((prevParts) => {
      const updatedParts = [...prevParts];

      rows.forEach((row, idx) => {
        const partNumber = String(getMappedVal(row, 'partNumber') || '').trim().toUpperCase();
        const title = String(getMappedVal(row, 'title') || getMappedVal(row, 'partName') || '').trim();
        const brand = String(getMappedVal(row, 'brand') || 'OEM Genuine').trim();
        const rawPrice = Number(getMappedVal(row, 'priceUSD') || getMappedVal(row, 'price') || 0);
        const rawStock = Number(getMappedVal(row, 'totalQuantity') || getMappedVal(row, 'stock') || 0);
        const oemNumber = String(getMappedVal(row, 'oemNumber') || partNumber).trim().toUpperCase();

        if (!partNumber) {
          errors.push(`Row ${idx + 1}: Missing mandatory Part Number / ItemCode`);
          return;
        }

        if (isNaN(rawPrice) || rawPrice <= 0) {
          errors.push(`Row ${idx + 1} (${partNumber}): Invalid price value ($${rawPrice})`);
          return;
        }

        const priceUSD = rawPrice;
        const priceIQD = Math.round(priceUSD * 1320);
        const stockQty = Math.max(0, isNaN(rawStock) ? 0 : rawStock);

        const existingPart = updatedParts.find(
          (p) =>
            p.partNumber.toUpperCase() === partNumber ||
            p.oemNumber?.toUpperCase() === partNumber ||
            p.alternativeNumbers?.some((alt) => alt.toUpperCase() === partNumber)
        );

        const branchEntry = targetBranch
          ? {
              branchId: targetBranch.id,
              branchName: targetBranch.branchName,
              city: targetBranch.city,
              availableQty: stockQty,
              reservedQty: 0,
              onHandQty: stockQty,
              priceUSD,
              priceIQD,
              pickupAvailable: targetBranch.offersPickup,
              deliveryEstimatedHours: targetBranch.avgDeliveryHours,
            }
          : undefined;

        const newOffer: SupplierOffer = {
          id: `off-csv-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
          supplierId: dealerId,
          supplierName,
          supplierRating: sup?.rating || 4.8,
          verifiedInteractionsCount: sup?.verifiedInteractionsCount || 600,
          repeatPurchaseRate: sup?.repeatCustomerPercentage || 95,
          quality: 'genuine',
          brand: brand || 'Genuine OEM',
          priceUSD,
          priceIQD,
          stockStatus: stockQty > 0 ? 'in_stock_today' : 'order_on_demand',
          stockQuantity: stockQty,
          reservedQuantity: 0,
          warranty: '12-Month Official Warranty',
          deliveryTime: 'Same Day Delivery (2-4 hrs)',
          deliveryOptions: ['pickup', 'supplier_delivery', 'express_courier'],
          supplierCity: targetBranch?.city || sup?.city || 'Erbil',
          supplierLocationDetail: targetBranch?.address || sup?.address || 'Main Showroom',
          notes: 'Synchronized via IQAutoMarket Smart CSV/Excel Import Pipeline.',
          externalProductId: `CSV-SKU-${partNumber}`,
          externalSku: `SKU-${partNumber}`,
          syncSource: 'csv',
          lastSyncedAt: 'Just now',
          branches: branchEntry ? [branchEntry] : undefined,
        };

        if (existingPart) {
          updatedCount++;
          existingPart.offers = [newOffer, ...existingPart.offers.filter((o) => o.supplierId !== dealerId)];
        } else {
          createdCount++;
          updatedParts.push({
            id: `part-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
            partNumber,
            oemNumber,
            partName: title || `Auto Part ${partNumber}`,
            manufacturer: brand,
            brand,
            category: 'Engine',
            description: `IQAutoMarket Verified Part: ${title || partNumber}. Imported from ${supplierName}.`,
            specifications: { 'Part Number': partNumber, 'OEM Reference': oemNumber, 'Stock Level': `${stockQty} units` },
            imageUrl: 'https://images.unsplash.com/photo-1558441719-8b489c63f7d1?auto=format&fit=crop&w=600&q=80',
            compatibleVehicles: [
              {
                make: 'Universal',
                model: 'Compatible Vehicles Listed on Box',
                yearStart: 2016,
                yearEnd: 2025,
                engine: 'Standard Configuration',
              },
            ],
            offers: [newOffer],
          });
        }
      });

      return updatedParts;
    });

    // Update integration summary
    const integration = dealerIntegrations.find((i) => i.dealerId === dealerId);
    if (integration) {
      setDealerIntegrations((prev) =>
        prev.map((i) =>
          i.id === integration.id
            ? {
                ...i,
                lastSyncAt: new Date().toISOString(),
                totalProductsSynced: i.totalProductsSynced + createdCount,
                totalInventorySynced: i.totalInventorySynced + createdCount + updatedCount,
                totalPriceRecordsSynced: i.totalPriceRecordsSynced + createdCount + updatedCount,
                failedRecordsCount: i.failedRecordsCount + errors.length,
              }
            : i
        )
      );
    }

    return { createdCount, updatedCount, errorCount: errors.length, errors };
  };

  const simulatePartnerWebhook = (
    dealerId: string,
    eventType: IntegrationWebhook['eventType'],
    payload: any
  ): { success: boolean; message: string } => {
    const sup = suppliers.find((s) => s.id === dealerId);
    const dealerName = sup ? sup.companyName : 'Partner Dealer';

    if (eventType === 'stock.changed' && payload.partNumber) {
      const partNum = String(payload.partNumber).toUpperCase();
      const newQty = Number(payload.newQuantity ?? 15);
      setMasterParts((prev) =>
        prev.map((p) => {
          if (p.partNumber.toUpperCase() === partNum || p.alternativeNumbers?.some((a) => a.toUpperCase() === partNum)) {
            return {
              ...p,
              offers: p.offers.map((off) => {
                if (off.supplierId === dealerId) {
                  return {
                    ...off,
                    stockQuantity: newQty,
                    stockStatus: newQty > 0 ? 'in_stock_today' : 'order_on_demand',
                    lastSyncedAt: 'Real-time Webhook (Just now)',
                  };
                }
                return off;
              }),
            };
          }
          return p;
        })
      );
    }

    if (eventType === 'price.changed' && payload.partNumber) {
      const partNum = String(payload.partNumber).toUpperCase();
      const newPriceUSD = Number(payload.newPriceUSD ?? 120);
      setMasterParts((prev) =>
        prev.map((p) => {
          if (p.partNumber.toUpperCase() === partNum || p.alternativeNumbers?.some((a) => a.toUpperCase() === partNum)) {
            return {
              ...p,
              offers: p.offers.map((off) => {
                if (off.supplierId === dealerId) {
                  return {
                    ...off,
                    priceUSD: newPriceUSD,
                    priceIQD: Math.round(newPriceUSD * 1320),
                    lastSyncedAt: 'Real-time Webhook (Just now)',
                  };
                }
                return off;
              }),
            };
          }
          return p;
        })
      );
    }

    return {
      success: true,
      message: `Webhook event [${eventType}] successfully validated & ingested for ${dealerName}. Real-time marketplace inventory updated.`,
    };
  };

  return (
    <MarketplaceContext.Provider
      value={{
        role,
        setRole,
        language,
        setLanguage,
        currency,
        setCurrency,
        formatPrice,
        activeVehicle,
        setActiveVehicle,
        userVehicles,
        addUserVehicle,
        masterParts,
        suppliers,
        partRequests,
        repairOrders,
        orders,
        reviews,
        demandIntelligence,
        disputes,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        createOrder,
        updateOrderStatus,
        createPartRequest,
        submitSupplierOffer,
        acceptRequestOffer,
        addDealerReview,
        createDispute,
        addMasterPart,
        updateSupplierVerification,
        addSupplierOfferToPart,
        bulkUploadProducts,
        createRepairOrder,
        currentUser,
        authModalTab,
        authTargetRole,
        openAuthModal,
        login,
        signup,
        logout,
        activeModal,
        setActiveModal,
        selectedSupplierIdForStore,
        setSelectedSupplierIdForStore,
        selectedOrderForRating,
        setSelectedOrderForRating,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        stockAlerts,
        addStockAlert,
        removeStockAlert,
        isPartAlerted,
        getPartAlert,
        prefilledPartRequest,
        setPrefilledPartRequest,
        selectedRequestForBid,
        setSelectedRequestForBid,
        simulateDealerBid,
        carAuctions,
        placeBid,
        buyItNow,
        toggleWatchlistCar,
        submitCarAuction,
        selectedAuction,
        setSelectedAuction,
        isSubmitCarModalOpen,
        setIsSubmitCarModalOpen,
        // B2B Dealer Integrations & Inventory Synchronization
        dealerIntegrations,
        syncJobs,
        syncErrors,
        externalProducts,
        dealerBranches,
        createOrUpdateIntegration,
        toggleIntegrationStatus,
        triggerManualSync,
        resolveSyncError,
        generateOrRotateApiKey,
        generateWebhookSecret,
        saveFieldMappings,
        addOrUpdateDealerBranch,
        deleteDealerBranch,
        processSmartCsvImport,
        simulatePartnerWebhook,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
