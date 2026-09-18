/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket Dealer API Routes - Organization Scoping, Multi-Branch Stock, Staff RBAC & Quoting
 */

import express from 'express';
import crypto from 'node:crypto';
import { requireAuth, requireRole, enforceDealerScope, requireDealerPermission, AuthenticatedRequest } from '../security/rbac';
import { logAuditEvent } from '../security/audit';
import { buyerRequestsStore, buyerOrdersStore } from './buyerRoutes';
import { usersStore, hashPassword } from '../security/auth';

const router = express.Router();

export interface DealerProduct {
  id: string;
  dealerId: string;
  partNumber: string;
  oemNumber: string;
  title: string;
  brand: string;
  category: string;
  priceUSD: number;
  priceIQD: number;
  availableStock: number;
  condition: 'genuine' | 'oem' | 'aftermarket' | 'used';
  branches: { branchId: string; branchName: string; quantity: number }[];
  updatedAt: string;
}

// In-Memory Organization Scoped Store
export const dealerProductsStore: Map<string, DealerProduct> = new Map([
  [
    'prd_mansour_01',
    {
      id: 'prd_mansour_01',
      dealerId: 'dlr_mansour_01',
      partNumber: '04465-60290',
      oemNumber: '04465-60290',
      title: 'Front Brake Pad Set (Ceramic)',
      brand: 'Toyota Genuine',
      category: 'Brake',
      priceUSD: 145,
      priceIQD: 191400,
      availableStock: 28,
      condition: 'genuine',
      branches: [
        { branchId: 'BGD-01', branchName: 'Baghdad Main Showroom', quantity: 16 },
        { branchId: 'ERB-01', branchName: 'Erbil Distribution Hub', quantity: 12 },
      ],
      updatedAt: '2026-02-10T10:00:00Z',
    },
  ],
  [
    'prd_erbil_01',
    {
      id: 'prd_erbil_01',
      dealerId: 'dlr_erbil_02',
      partNumber: '47210-1LB0A',
      oemNumber: '47210-1LB0A',
      title: 'Nissan Patrol Power Brake Booster',
      brand: 'Nissan OEM',
      category: 'Brake',
      priceUSD: 310,
      priceIQD: 409200,
      availableStock: 6,
      condition: 'oem',
      branches: [
        { branchId: 'ERB-02', branchName: 'Erbil 100M Road Depot', quantity: 6 },
      ],
      updatedAt: '2026-02-12T11:00:00Z',
    },
  ],
]);

export interface DealerOrganization {
  id: string;
  name: string;
  tradeLicenseNumber: string;
  verificationStatus: 'APPLICANT' | 'PENDING_VERIFICATION' | 'APPROVED' | 'SUSPENDED';
  city: string;
  rating: number;
  apiKeyMasked: string;
  commissionRatePercent: number;
}

export const dealerOrganizationsStore: Map<string, DealerOrganization> = new Map([
  [
    'dlr_mansour_01',
    {
      id: 'dlr_mansour_01',
      name: 'Al-Mansour Genuine Parts LLC',
      tradeLicenseNumber: 'IQ-BGD-2018-9921',
      verificationStatus: 'APPROVED',
      city: 'Baghdad',
      rating: 4.9,
      apiKeyMasked: '••••••••9A2F',
      commissionRatePercent: 4.5,
    },
  ],
  [
    'dlr_erbil_02',
    {
      id: 'dlr_erbil_02',
      name: 'Erbil Auto Hub',
      tradeLicenseNumber: 'KR-ERB-2020-4102',
      verificationStatus: 'APPROVED',
      city: 'Erbil',
      rating: 4.8,
      apiKeyMasked: '••••••••7B1C',
      commissionRatePercent: 4.5,
    },
  ],
]);

// 1. Dealer Inventory Endpoint (Strictly Scoped: WHERE dealer_id = authenticated_user.dealer_id)
router.get('/inventory', requireAuth, requireRole('supplier', 'admin'), enforceDealerScope, (req: AuthenticatedRequest, res) => {
  const dealerId = req.dealerId!;
  const inventory = Array.from(dealerProductsStore.values()).filter((p) => p.dealerId === dealerId);

  res.json({
    success: true,
    dealerId,
    totalItems: inventory.length,
    data: inventory,
  });
});

// 2. Add / Register Product in Dealer Inventory
router.post('/products', requireAuth, requireRole('supplier', 'admin'), enforceDealerScope, requireDealerPermission('inventory:write'), (req: AuthenticatedRequest, res) => {
  const { partNumber, title, brand, category, priceUSD, availableStock = 0, condition = 'genuine', branches = [] } = req.body;

  if (!partNumber || !title || priceUSD === undefined) {
    return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'partNumber, title, and priceUSD are mandatory.' });
  }

  // Check dealer verification status (Unverified applicants cannot publish live parts)
  const org = dealerOrganizationsStore.get(req.dealerId!);
  if (org && org.verificationStatus !== 'APPROVED') {
    return res.status(403).json({
      error: 'DEALER_NOT_APPROVED',
      message: 'Your dealership is currently pending verification. You cannot publish parts until approved by an administrator.',
    });
  }

  const id = `prd_${crypto.randomBytes(6).toString('hex')}`;
  const newProduct: DealerProduct = {
    id,
    dealerId: req.dealerId!,
    partNumber: String(partNumber).toUpperCase(),
    oemNumber: req.body.oemNumber || partNumber,
    title,
    brand: brand || 'Genuine OEM',
    category: category || 'Engine',
    priceUSD: Number(priceUSD),
    priceIQD: Math.round(Number(priceUSD) * 1320),
    availableStock: Number(availableStock),
    condition,
    branches,
    updatedAt: new Date().toISOString(),
  };

  dealerProductsStore.set(id, newProduct);

  logAuditEvent({
    actorId: req.user!.id,
    actorRole: req.user!.role,
    action: 'INVENTORY_MUTATION',
    resourceType: 'product',
    resourceId: id,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
    metadata: { dealerId: req.dealerId, partNumber, priceUSD },
  });

  res.status(201).json({ success: true, message: 'Product successfully added to dealer inventory.', data: newProduct });
});

// 3. Update Inventory Price or Stock with Strict Ownership Verification
router.patch('/inventory/:id', requireAuth, requireRole('supplier', 'admin'), enforceDealerScope, requireDealerPermission('inventory:write'), (req: AuthenticatedRequest, res) => {
  const prod = dealerProductsStore.get(req.params.id);
  if (!prod) return res.status(404).json({ error: 'NOT_FOUND', message: 'Product not found.' });

  // STRICT IDOR / ORG CHECK
  if (prod.dealerId !== req.dealerId && req.user!.role !== 'admin') {
    logAuditEvent({
      actorId: req.user!.id,
      actorRole: req.user!.role,
      action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      resourceType: 'inventory_idor',
      resourceId: req.params.id,
      ipAddress: req.ip || '127.0.0.1',
      status: 'DENIED',
      metadata: { targetProductDealer: prod.dealerId, actualDealer: req.dealerId },
    });

    return res.status(403).json({ error: 'FORBIDDEN', message: 'You do not own this inventory item.' });
  }

  if (req.body.priceUSD !== undefined) {
    prod.priceUSD = Number(req.body.priceUSD);
    prod.priceIQD = Math.round(Number(req.body.priceUSD) * 1320);
  }
  if (req.body.availableStock !== undefined) {
    prod.availableStock = Number(req.body.availableStock);
  }
  prod.updatedAt = new Date().toISOString();

  logAuditEvent({
    actorId: req.user!.id,
    actorRole: req.user!.role,
    action: 'PRICE_UPDATE',
    resourceType: 'product',
    resourceId: prod.id,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
    metadata: { newPriceUSD: prod.priceUSD, stock: prod.availableStock },
  });

  res.json({ success: true, message: 'Inventory updated.', data: prod });
});

// 4. Inbound Part Requests & Transparent Offer Submission
router.get('/requests', requireAuth, requireRole('supplier', 'admin'), enforceDealerScope, (req: AuthenticatedRequest, res) => {
  // Return open part requests available for quoting
  const openRequests = Array.from(buyerRequestsStore.values()).map((r) => ({
    id: r.id,
    requestNumber: r.requestNumber,
    partName: r.partName,
    category: r.category,
    urgency: r.urgency,
    city: r.city,
    vehicle: r.vehicle, // Only minimum necessary vehicle spec (no private documents)
    preferredCondition: r.preferredCondition,
    notes: r.notes,
    createdAt: r.createdAt,
    hasMyOffer: r.offers.some((o: any) => o.dealerId === req.dealerId),
  }));

  res.json({ success: true, requests: openRequests });
});

router.post('/requests/:requestId/offers', requireAuth, requireRole('supplier', 'admin'), enforceDealerScope, (req: AuthenticatedRequest, res) => {
  const reqItem = buyerRequestsStore.get(req.params.requestId);
  if (!reqItem) return res.status(404).json({ error: 'REQUEST_NOT_FOUND' });

  const { priceUSD, condition = 'genuine', warranty, deliveryTime, deliveryCostUSD = 0, notes } = req.body;

  if (!priceUSD) {
    return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'priceUSD is required.' });
  }

  const org = dealerOrganizationsStore.get(req.dealerId!) || { name: 'Verified Dealer', rating: 4.8 };
  const offerId = `off_${crypto.randomBytes(6).toString('hex')}`;

  const newOffer = {
    id: offerId,
    dealerId: req.dealerId!,
    dealerName: org.name,
    priceUSD: Number(priceUSD),
    priceIQD: Math.round(Number(priceUSD) * 1320),
    condition,
    warranty: warranty || '12-Month Official Warranty',
    deliveryTime: deliveryTime || 'Same-day (2-4 hrs)',
    deliveryCostUSD: Number(deliveryCostUSD),
    availableStock: 5,
    rating: (org as any).rating || 4.8,
    verified: true,
    notes,
    submittedAt: new Date().toISOString(),
    expiresInHours: 48,
  };

  reqItem.offers.push(newOffer);
  reqItem.status = 'OFFERS_RECEIVED';

  logAuditEvent({
    actorId: req.user!.id,
    actorRole: req.user!.role,
    action: 'OFFER_CREATE',
    resourceType: 'part_request_offer',
    resourceId: offerId,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
    metadata: { requestId: req.params.requestId, priceUSD },
  });

  res.status(201).json({ success: true, message: 'Offer submitted to buyer.', offer: newOffer });
});

// 5. Dealer Orders (Orders placed with THIS dealer only)
router.get('/orders', requireAuth, requireRole('supplier', 'admin'), enforceDealerScope, (req: AuthenticatedRequest, res) => {
  const dealerId = req.dealerId!;
  const dealerOrders = Array.from(buyerOrdersStore.values()).filter((o) => o.dealerId === dealerId);

  res.json({ success: true, count: dealerOrders.length, orders: dealerOrders });
});

// 6. Dealer Staff & Team Management
router.get('/team', requireAuth, requireRole('supplier', 'admin'), enforceDealerScope, (req: AuthenticatedRequest, res) => {
  const dealerId = req.dealerId!;
  const staff = Array.from(usersStore.values())
    .filter((u) => u.dealerId === dealerId)
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      staffRole: u.dealerStaffRole || 'sales',
      status: u.status,
      createdAt: u.createdAt,
    }));

  res.json({ success: true, count: staff.length, team: staff });
});

router.post('/team', requireAuth, requireRole('supplier', 'admin'), enforceDealerScope, requireDealerPermission('team:manage'), (req: AuthenticatedRequest, res) => {
  const { name, email, phone, password = 'staffDefault123!', staffRole = 'sales' } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'Name and email are required.' });
  }

  const userId = `usr_${crypto.randomBytes(8).toString('hex')}`;
  const { hash, salt } = hashPassword(password);

  const newStaff = {
    id: userId,
    email: email.toLowerCase(),
    phone,
    name,
    passwordHash: hash,
    salt,
    role: 'supplier' as const,
    dealerId: req.dealerId!,
    dealerStaffRole: staffRole,
    status: 'ACTIVE' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    linkedIdentities: [
      { provider: 'email' as const, providerId: email.toLowerCase(), verifiedAt: new Date().toISOString() },
    ],
  };

  usersStore.set(userId, newStaff as any);

  logAuditEvent({
    actorId: req.user!.id,
    actorRole: req.user!.role,
    action: 'USER_LOGIN',
    resourceType: 'dealer_staff_invite',
    resourceId: userId,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
    metadata: { dealerId: req.dealerId, staffRole },
  });

  res.status(201).json({
    success: true,
    message: `Staff member [${name}] created with role [${staffRole}].`,
    staff: { id: userId, name, email, staffRole },
  });
});

// 7. Masked Integrations Credentials
router.get('/integrations', requireAuth, requireRole('supplier', 'admin'), enforceDealerScope, (req: AuthenticatedRequest, res) => {
  const org = dealerOrganizationsStore.get(req.dealerId!);
  res.json({
    success: true,
    dealerId: req.dealerId,
    apiEndpoint: 'https://api.iqautomarket.iq/api/v1/partner',
    apiKeyMasked: org?.apiKeyMasked || '••••••••9A2F',
    activeConnectors: [
      { type: 'REST_API', status: 'ACTIVE', lastSync: '3 minutes ago' },
      { type: 'EXCEL_CSV', status: 'READY', lastSync: 'Yesterday' },
    ],
  });
});

export default router;
