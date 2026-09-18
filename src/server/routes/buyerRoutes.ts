/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket Buyer API Routes - Garage, Privacy-Conscious Sanawia OCR, Requests & Orders
 */

import express from 'express';
import crypto from 'node:crypto';
import { requireAuth, requireRole, AuthenticatedRequest } from '../security/rbac';
import { logAuditEvent } from '../security/audit';
import { documentVault, VehicleDocumentRecord } from './documentRoutes';

const router = express.Router();

export interface BuyerVehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  engine?: string;
  trim?: string;
  vin?: string;
  nickname?: string;
  createdAt: string;
}

export interface BuyerPartRequest {
  id: string;
  userId: string;
  requestNumber: string;
  partName: string;
  category: string;
  urgency: string;
  city: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
    engine?: string;
  };
  preferredCondition: string;
  notes?: string;
  photoUrl?: string;
  status: 'OPEN' | 'OFFERS_RECEIVED' | 'ACCEPTED' | 'CLOSED';
  createdAt: string;
  offers: any[];
}

export interface BuyerOrder {
  id: string;
  userId: string;
  dealerId: string;
  dealerName: string;
  totalUSD: number;
  totalIQD: number;
  status: 'PLACED' | 'CONFIRMED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
  items: {
    partNumber: string;
    partName: string;
    quantity: number;
    priceUSD: number;
  }[];
  deliveryAddress: string;
  createdAt: string;
}

// In-Memory Buyer Stores
export const buyerGarageStore: Map<string, BuyerVehicle> = new Map([
  [
    'veh_prado_01',
    {
      id: 'veh_prado_01',
      userId: 'usr_buyer_01',
      make: 'Toyota',
      model: 'Land Cruiser Prado',
      year: 2021,
      engine: '4.0L V6 (1GR-FE)',
      nickname: 'Family Prado',
      createdAt: '2026-01-15T10:00:00Z',
    },
  ],
]);

export const buyerRequestsStore: Map<string, BuyerPartRequest> = new Map([
  [
    'req_001',
    {
      id: 'req_001',
      userId: 'usr_buyer_01',
      requestNumber: 'REQ-99201',
      partName: 'Front Brake Booster Vacuum Diaphragm',
      category: 'Brake',
      urgency: 'HIGH',
      city: 'Baghdad',
      vehicle: { make: 'Toyota', model: 'Land Cruiser Prado', year: 2021, engine: '4.0L' },
      preferredCondition: 'genuine',
      status: 'OFFERS_RECEIVED',
      createdAt: '2026-02-10T14:00:00Z',
      offers: [
        {
          id: 'off_01',
          dealerId: 'dlr_mansour_01',
          dealerName: 'Al-Mansour Genuine Parts',
          priceUSD: 145,
          priceIQD: 191400,
          condition: 'genuine',
          warranty: '12-Month Official Warranty',
          deliveryTime: 'Same-day in Baghdad (2-4 hrs)',
          deliveryCostUSD: 5,
          availableStock: 12,
          rating: 4.9,
          verified: true,
          expiresInHours: 48,
        },
        {
          id: 'off_02',
          dealerId: 'dlr_erbil_02',
          dealerName: 'Erbil Auto Hub',
          priceUSD: 138,
          priceIQD: 182160,
          condition: 'oem',
          warranty: '6-Month Warranty',
          deliveryTime: 'Overnight Express (24 hrs)',
          deliveryCostUSD: 8,
          availableStock: 4,
          rating: 4.8,
          verified: true,
          expiresInHours: 24,
        },
      ],
    },
  ],
]);

export const buyerOrdersStore: Map<string, BuyerOrder> = new Map([
  [
    'ord_1001',
    {
      id: 'ord_1001',
      userId: 'usr_buyer_01',
      dealerId: 'dlr_mansour_01',
      dealerName: 'Al-Mansour Genuine Parts',
      totalUSD: 145,
      totalIQD: 191400,
      status: 'CONFIRMED',
      items: [{ partNumber: '04465-60290', partName: 'Front Brake Pad Set', quantity: 1, priceUSD: 145 }],
      deliveryAddress: 'Al-Mansour District, Baghdad, Iraq',
      createdAt: '2026-02-12T16:00:00Z',
    },
  ],
]);

// 1. Garage Endpoints
router.get('/garage', requireAuth, requireRole('customer', 'admin'), (req: AuthenticatedRequest, res) => {
  const userVehicles = Array.from(buyerGarageStore.values()).filter(
    (v) => req.user!.role === 'admin' || v.userId === req.user!.id
  );
  res.json({ success: true, count: userVehicles.length, vehicles: userVehicles });
});

router.post('/garage', requireAuth, requireRole('customer', 'admin'), (req: AuthenticatedRequest, res) => {
  const { make, model, year, engine, trim, vin, nickname } = req.body;
  if (!make || !model || !year) {
    return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'Make, model and year are required.' });
  }

  const id = `veh_${crypto.randomBytes(6).toString('hex')}`;
  const newVeh: BuyerVehicle = {
    id,
    userId: req.user!.id,
    make,
    model,
    year: Number(year),
    engine,
    trim,
    vin,
    nickname: nickname || `${make} ${model}`,
    createdAt: new Date().toISOString(),
  };

  buyerGarageStore.set(id, newVeh);
  res.status(201).json({ success: true, vehicle: newVeh });
});

router.delete('/garage/:id', requireAuth, requireRole('customer', 'admin'), (req: AuthenticatedRequest, res) => {
  const veh = buyerGarageStore.get(req.params.id);
  if (!veh) return res.status(404).json({ error: 'NOT_FOUND' });

  // IDOR check
  if (veh.userId !== req.user!.id && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'You do not own this vehicle.' });
  }

  buyerGarageStore.delete(req.params.id);
  res.json({ success: true, message: 'Vehicle deleted from garage.' });
});

// 2. Vehicle Registration AI Document Upload (Progressive Disclosure & Strict Privacy)
router.post('/vehicle-document/upload', requireAuth, requireRole('customer', 'admin'), (req: AuthenticatedRequest, res) => {
  const { fileName = 'registration_document.jpg', mimeType = 'image/jpeg', vehicleHint } = req.body;

  const docId = `doc_${crypto.randomBytes(8).toString('hex')}`;

  // Smart AI vehicle extraction simulation grounded in Iraqi market registration documents
  const vHint = (vehicleHint || '').toLowerCase();
  let extracted;
  if (vHint.includes('land cruiser') || vHint.includes('lc300') || !vehicleHint) {
    extracted = {
      make: 'Toyota',
      model: 'Land Cruiser (LC300)',
      year: 2023,
      engine: '3.5L Twin Turbo V6 (V35A-FTS)',
      trim: 'VXR',
      vinMasked: 'JTJHY••••••••8902',
    };
  } else if (vHint.includes('patrol')) {
    extracted = {
      make: 'Nissan',
      model: 'Patrol (Y62)',
      year: 2022,
      engine: '5.6L V8 (VK56VD)',
      trim: 'Platinum',
      vinMasked: 'JN8AY••••••••4411',
    };
  } else {
    extracted = {
      make: 'Hyundai',
      model: 'Tucson',
      year: 2022,
      engine: '2.0L Smartstream G',
      trim: 'GLS Comfort',
      vinMasked: 'KM8J3••••••••1234',
    };
  }

  const docRecord: VehicleDocumentRecord = {
    id: docId,
    userId: req.user!.id,
    originalFileName: fileName,
    mimeType,
    storageKeyEncrypted: `enc_vault_${docId}.bin`,
    extractedVehicleData: extracted,
    uploadedAt: new Date().toISOString(),
    retentionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  };

  documentVault.set(docId, docRecord);

  logAuditEvent({
    actorId: req.user!.id,
    actorRole: req.user!.role,
    action: 'DOCUMENT_UPLOAD',
    resourceType: 'vehicle_document',
    resourceId: docId,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
    metadata: { fileName, extractedVehicle: extracted },
  });

  res.json({
    success: true,
    documentId: docId,
    privacyNotice: 'Your registration document is encrypted at rest and will NEVER be disclosed to dealers. Only the extracted vehicle specification is used for part fitment.',
    extractedVehicle: extracted,
    requiresUserConfirmation: true,
  });
});

// 3. Part Requests (Reverse Marketplace)
router.get('/requests', requireAuth, (req: AuthenticatedRequest, res) => {
  const requests = Array.from(buyerRequestsStore.values()).filter(
    (r) => req.user!.role === 'admin' || r.userId === req.user!.id
  );
  res.json({ success: true, count: requests.length, requests });
});

router.post('/requests', requireAuth, requireRole('customer', 'admin'), (req: AuthenticatedRequest, res) => {
  const { partName, category, vehicle, urgency = 'NORMAL', city = 'Baghdad', preferredCondition = 'any', notes, photoUrl } = req.body;

  if (!partName || !vehicle) {
    return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'Part name and vehicle are required.' });
  }

  const id = `req_${crypto.randomBytes(6).toString('hex')}`;
  const requestNumber = `REQ-${Math.floor(10000 + Math.random() * 90000)}`;

  const newRequest: BuyerPartRequest = {
    id,
    userId: req.user!.id,
    requestNumber,
    partName,
    category: category || 'Engine',
    urgency,
    city,
    vehicle,
    preferredCondition,
    notes,
    photoUrl,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    offers: [],
  };

  buyerRequestsStore.set(id, newRequest);

  logAuditEvent({
    actorId: req.user!.id,
    actorRole: req.user!.role,
    action: 'ORDER_CREATE',
    resourceType: 'part_request',
    resourceId: id,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
    metadata: { requestNumber, partName },
  });

  res.status(201).json({ success: true, request: newRequest });
});

// 4. Buyer Orders (IDOR Protected)
router.get('/orders', requireAuth, (req: AuthenticatedRequest, res) => {
  const userOrders = Array.from(buyerOrdersStore.values()).filter(
    (o) => req.user!.role === 'admin' || o.userId === req.user!.id
  );
  res.json({ success: true, count: userOrders.length, orders: userOrders });
});

router.get('/orders/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const order = buyerOrdersStore.get(req.params.id);
  if (!order) return res.status(404).json({ error: 'NOT_FOUND', message: 'Order not found.' });

  // STRICT IDOR CHECK:
  // Buyer A can only access Order A. If Buyer B attempts to fetch Order A, return 403 Forbidden.
  const isOwner = order.userId === req.user!.id;
  const isAuthorizedDealer = req.user!.dealerId === order.dealerId;
  const isAdmin = req.user!.role === 'admin';

  if (!isOwner && !isAuthorizedDealer && !isAdmin) {
    logAuditEvent({
      actorId: req.user!.id,
      actorRole: req.user!.role,
      action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      resourceType: 'order_idor',
      resourceId: req.params.id,
      ipAddress: req.ip || '127.0.0.1',
      status: 'DENIED',
      metadata: { orderOwner: order.userId, attemptedBy: req.user!.id },
    });

    return res.status(403).json({
      error: 'IDOR_ACCESS_DENIED',
      message: 'Access denied: You are not authorized to view this order.',
    });
  }

  res.json({ success: true, order });
});

router.post('/orders', requireAuth, requireRole('customer', 'admin'), (req: AuthenticatedRequest, res) => {
  const { dealerId, dealerName, items, deliveryAddress, totalUSD } = req.body;
  if (!dealerId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'Dealer and items are required.' });
  }

  const id = `ord_${crypto.randomBytes(6).toString('hex')}`;
  const calculatedTotalUSD = totalUSD || items.reduce((sum: number, it: any) => sum + (it.priceUSD * it.quantity), 0);

  const newOrder: BuyerOrder = {
    id,
    userId: req.user!.id,
    dealerId,
    dealerName: dealerName || 'Verified Automotive Dealer',
    totalUSD: calculatedTotalUSD,
    totalIQD: Math.round(calculatedTotalUSD * 1320),
    status: 'PLACED',
    items,
    deliveryAddress: deliveryAddress || 'Baghdad, Iraq',
    createdAt: new Date().toISOString(),
  };

  buyerOrdersStore.set(id, newOrder);

  logAuditEvent({
    actorId: req.user!.id,
    actorRole: req.user!.role,
    action: 'ORDER_CREATE',
    resourceType: 'order',
    resourceId: id,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
    metadata: { totalUSD: calculatedTotalUSD, dealerId },
  });

  res.status(201).json({ success: true, order: newOrder });
});

export default router;
