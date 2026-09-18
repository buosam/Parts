/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket Admin API Routes - Platform Oversight, Verification Queue, User Moderation & Audit Trail
 */

import express from 'express';
import { requireAuth, requireRole, AuthenticatedRequest } from '../security/rbac';
import { logAuditEvent, queryAuditLogs } from '../security/audit';
import { usersStore } from '../security/auth';
import { dealerOrganizationsStore } from './dealerRoutes';
import { buyerOrdersStore, buyerRequestsStore } from './buyerRoutes';

const router = express.Router();

// Commercial Model Configuration Store (Section 27)
let commercialConfig = {
  defaultCommissionRatePercent: 4.5,
  subscriptionPlans: [
    { id: 'plan_starter', name: 'Starter Dealer', priceUSD: 0, maxProducts: 250, apiAccess: false },
    { id: 'plan_pro', name: 'Pro Dealer', priceUSD: 79, maxProducts: 5000, apiAccess: true, multiBranch: true },
    { id: 'plan_enterprise', name: 'Enterprise DMS/ERP', priceUSD: 249, maxProducts: 50000, apiAccess: true, multiBranch: true, automatedSync: true },
  ],
  featuredPlacementCostPerDayUSD: 15,
};

// All admin endpoints require strictly 'admin' role!
router.use(requireAuth, requireRole('admin'));

// 1. Operational Overview
router.get('/overview', (req: AuthenticatedRequest, res) => {
  const totalUsers = usersStore.size;
  const totalDealers = dealerOrganizationsStore.size;
  const pendingDealers = Array.from(dealerOrganizationsStore.values()).filter((d) => d.verificationStatus !== 'APPROVED').length;
  const totalOrders = buyerOrdersStore.size;
  const totalGMV = Array.from(buyerOrdersStore.values()).reduce((sum, o) => sum + o.totalUSD, 0);

  res.json({
    success: true,
    metrics: {
      totalUsers,
      totalDealers,
      pendingDealers,
      totalOrders,
      totalGMV_USD: totalGMV,
      totalGMV_IQD: Math.round(totalGMV * 1320),
      openRequests: buyerRequestsStore.size,
    },
  });
});

// 2. Dealer Management & Verification Queue (Section 20: Applicant -> Verification -> Approved -> Active Dealer)
router.get('/dealers', (req: AuthenticatedRequest, res) => {
  const dealers = Array.from(dealerOrganizationsStore.values());
  res.json({ success: true, count: dealers.length, dealers });
});

router.post('/dealers/:id/verify', (req: AuthenticatedRequest, res) => {
  const dealer = dealerOrganizationsStore.get(req.params.id);
  if (!dealer) return res.status(404).json({ error: 'DEALER_NOT_FOUND' });

  dealer.verificationStatus = 'APPROVED';

  logAuditEvent({
    actorId: req.user!.id,
    actorRole: req.user!.role,
    action: 'DEALER_APPROVAL',
    resourceType: 'dealer',
    resourceId: req.params.id,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
    metadata: { dealerName: dealer.name, approvedBy: req.user!.email },
  });

  res.json({
    success: true,
    message: `Dealer [${dealer.name}] has been verified and approved for marketplace trading.`,
    dealer,
  });
});

router.post('/dealers/:id/suspend', (req: AuthenticatedRequest, res) => {
  const { reason = 'Terms of service violation' } = req.body;
  const dealer = dealerOrganizationsStore.get(req.params.id);
  if (!dealer) return res.status(404).json({ error: 'DEALER_NOT_FOUND' });

  dealer.verificationStatus = 'SUSPENDED';

  // Also suspend all user accounts tied to this dealership
  for (const user of usersStore.values()) {
    if (user.dealerId === req.params.id) {
      user.status = 'SUSPENDED';
    }
  }

  logAuditEvent({
    actorId: req.user!.id,
    actorRole: req.user!.role,
    action: 'DEALER_SUSPEND',
    resourceType: 'dealer',
    resourceId: req.params.id,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
    metadata: { dealerName: dealer.name, reason, suspendedBy: req.user!.email },
  });

  res.json({
    success: true,
    message: `Dealer [${dealer.name}] and all associated staff accounts have been SUSPENDED. Selling privileges revoked immediately.`,
    dealer,
  });
});

// 3. User Moderation & Status Management
router.get('/users', (req: AuthenticatedRequest, res) => {
  const safeUsers = Array.from(usersStore.values()).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    adminSubRole: u.adminSubRole,
    dealerId: u.dealerId,
    dealerStaffRole: u.dealerStaffRole,
    status: u.status,
    createdAt: u.createdAt,
  }));

  res.json({ success: true, count: safeUsers.length, users: safeUsers });
});

router.post('/users/:id/status', (req: AuthenticatedRequest, res) => {
  const { status, reason } = req.body;
  const user = usersStore.get(req.params.id);

  if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });

  // Prevent suspending oneself
  if (user.id === req.user!.id) {
    return res.status(400).json({ error: 'CANNOT_MODIFY_SELF', message: 'You cannot alter your own admin status.' });
  }

  const oldStatus = user.status;
  user.status = status;
  user.updatedAt = new Date().toISOString();

  logAuditEvent({
    actorId: req.user!.id,
    actorRole: req.user!.role,
    action: 'ROLE_CHANGE',
    resourceType: 'user_status',
    resourceId: user.id,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
    metadata: { oldStatus, newStatus: status, reason },
  });

  res.json({
    success: true,
    message: `User [${user.email}] status changed to [${status}].`,
    user: { id: user.id, email: user.email, status: user.status },
  });
});

// 4. Immutable Audit Log Trail
router.get('/audit-logs', (req: AuthenticatedRequest, res) => {
  const { action, actorId, resourceType, status, limit } = req.query;

  const logs = queryAuditLogs({
    action: action as string,
    actorId: actorId as string,
    resourceType: resourceType as string,
    status: status as string,
    limit: limit ? parseInt(limit as string, 10) : 100,
  });

  res.json({ success: true, count: logs.length, logs });
});

// 5. Commercial Model Plans & Commission Settings
router.get('/commercial/plans', (req: AuthenticatedRequest, res) => {
  res.json({ success: true, commercialConfig });
});

router.patch('/commercial/plans', (req: AuthenticatedRequest, res) => {
  const { defaultCommissionRatePercent, subscriptionPlans } = req.body;
  if (defaultCommissionRatePercent !== undefined) {
    commercialConfig.defaultCommissionRatePercent = Number(defaultCommissionRatePercent);
  }
  if (subscriptionPlans && Array.isArray(subscriptionPlans)) {
    commercialConfig.subscriptionPlans = subscriptionPlans;
  }

  logAuditEvent({
    actorId: req.user!.id,
    actorRole: req.user!.role,
    action: 'ADMIN_ACCESS',
    resourceType: 'commercial_plans',
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
    metadata: { updatedConfig: commercialConfig },
  });

  res.json({ success: true, message: 'Commercial configuration updated.', commercialConfig });
});

export default router;
