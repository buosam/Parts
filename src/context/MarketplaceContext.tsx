/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
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
  // Modals & Navigation triggers
  activeModal: 'photo_search' | 'quote_upload' | 'request_part' | 'vehicle_picker' | 'cart' | 'supplier_store' | 'rate_dealer' | null;
  setActiveModal: (modal: 'photo_search' | 'quote_upload' | 'request_part' | 'vehicle_picker' | 'cart' | 'supplier_store' | 'rate_dealer' | null) => void;
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
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('customer');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

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

  // Parts Bidding & Reverse Auctions State
  const [prefilledPartRequest, setPrefilledPartRequest] = useState<PrefilledPartRequest | null>(null);
  const [selectedRequestForBid, setSelectedRequestForBid] = useState<PartRequest | null>(null);

  // UI state
  const [activeModal, setActiveModal] = useState<'photo_search' | 'quote_upload' | 'request_part' | 'vehicle_picker' | 'cart' | 'supplier_store' | 'rate_dealer' | null>(null);
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

  return (
    <MarketplaceContext.Provider
      value={{
        role,
        setRole,
        language,
        setLanguage,
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
