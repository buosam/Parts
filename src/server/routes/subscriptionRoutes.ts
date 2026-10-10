/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket Subscriptions & Membership API Routes
 * Multi-Tier Subscriptions for Customers (Prime), Dealers (Pro/Enterprise), and Workshops (Fleet Pass)
 */

import express from 'express';
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../security/rbac';
import { getDbPool } from '../db';
import { logAuditEvent } from '../security/audit';
import {
  SubscriptionPerks,
  SubscriptionPlan,
  ActiveUserSubscription,
  SUBSCRIPTION_PLANS,
} from '../../data/subscriptionPlans';

export type { SubscriptionPerks, SubscriptionPlan, ActiveUserSubscription };
export { SUBSCRIPTION_PLANS };

const router = express.Router();

// Fallback in-memory active subscriptions store (persisted in PG if connected)
export const userSubscriptionsStore: Map<string, ActiveUserSubscription> = new Map([
  [
    'usr_buyer_default',
    {
      id: 'sub_buyer_01',
      userId: 'usr_buyer_default',
      planId: 'cust_prime',
      role: 'customer',
      tierName: 'IQAutoMarket Prime',
      status: 'ACTIVE',
      billingCycle: 'monthly',
      priceUSD: 9,
      priceIQD: 12000,
      paymentMethod: 'ZainCash',
      perks: {
        discountPercent: 3,
        freeShipping: true,
        extendedWarrantyMonths: 12,
        priorityWhatsAppHotline: true,
      },
      startsAt: '2026-01-01T00:00:00Z',
      expiresAt: '2027-01-01T00:00:00Z',
      autoRenew: true,
    },
  ],
  [
    'usr_dealer_default',
    {
      id: 'sub_dealer_01',
      userId: 'usr_dealer_default',
      planId: 'dlr_pro',
      role: 'supplier',
      tierName: 'Pro Dealer DMS',
      status: 'ACTIVE',
      billingCycle: 'monthly',
      priceUSD: 49,
      priceIQD: 65000,
      paymentMethod: 'FIB (First Iraqi Bank)',
      perks: {
        commissionRatePercent: 2.5,
        maxInventoryItems: 10000,
        unlimitedSync: true,
        priorityPlacement: true,
        multiBranchManagement: true,
      },
      startsAt: '2026-01-01T00:00:00Z',
      expiresAt: '2027-01-01T00:00:00Z',
      autoRenew: true,
    },
  ],
  [
    'usr_workshop_default',
    {
      id: 'sub_workshop_01',
      userId: 'usr_workshop_default',
      planId: 'wrk_pro_pass',
      role: 'workshop',
      tierName: 'Workshop Pro Pass',
      status: 'ACTIVE',
      billingCycle: 'monthly',
      priceUSD: 29,
      priceIQD: 39000,
      paymentMethod: 'AsiaHawala',
      perks: {
        discountPercent: 5,
        freeShipping: true,
        net30Invoicing: true,
        priorityWhatsAppHotline: true,
      },
      startsAt: '2026-01-01T00:00:00Z',
      expiresAt: '2027-01-01T00:00:00Z',
      autoRenew: true,
    },
  ],
]);

// 1. Get All Plans or filtered by Role
router.get('/plans', (req, res) => {
  const { role } = req.query;
  let plans = SUBSCRIPTION_PLANS;
  if (role && typeof role === 'string') {
    plans = plans.filter((p) => p.roleTarget === role);
  }
  return res.json({
    success: true,
    plans,
  });
});

// 2. Get Current User Active Subscription (Guest or Authenticated)
router.get('/current', optionalAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id;
  const pool = getDbPool();

  if (pool) {
    try {
      const dbSub = await pool.query(
        `SELECT * FROM user_subscriptions WHERE user_id = $1 AND status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );
      if (dbSub.rows.length > 0) {
        const row = dbSub.rows[0];
        return res.json({
          success: true,
          subscription: {
            id: row.id,
            userId: row.user_id,
            planId: row.plan_id,
            role: row.role,
            tierName: row.tier_name,
            status: row.status,
            billingCycle: row.billing_cycle,
            priceUSD: Number(row.price_usd),
            priceIQD: Number(row.price_iqd),
            paymentMethod: row.payment_method,
            perks: row.perks || {},
            startsAt: row.starts_at,
            expiresAt: row.expires_at,
            autoRenew: row.auto_renew,
          },
        });
      }
    } catch (e) {
      console.warn('DB load subscription error:', e);
    }
  }

  if (userId) {
    const existing = userSubscriptionsStore.get(userId);
    if (existing) {
      return res.json({ success: true, subscription: existing });
    }
  }

  // Fallback default free tier for guest or new user
  const userRole = req.user?.role || 'customer';
  const defaultFreePlanId = userRole === 'supplier' ? 'dlr_starter' : userRole === 'workshop' ? 'wrk_basic' : 'cust_free';
  const defaultPlan = SUBSCRIPTION_PLANS.find((p) => p.id === defaultFreePlanId) || SUBSCRIPTION_PLANS[0];

  const defaultSub: ActiveUserSubscription = {
    id: `sub_free_${userId ? userId.slice(-6) : 'guest'}`,
    userId: userId || 'guest',
    planId: defaultPlan.id,
    role: userRole as any,
    tierName: defaultPlan.name,
    status: 'ACTIVE',
    billingCycle: 'monthly',
    priceUSD: 0,
    priceIQD: 0,
    paymentMethod: 'Free Included',
    perks: defaultPlan.perks,
    startsAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
    autoRenew: true,
  };

  return res.json({ success: true, subscription: defaultSub, isGuest: !userId });
});

// 3. Subscribe or Upgrade Plan
router.post('/subscribe', requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id || 'usr_buyer_default';
  const { planId, billingCycle = 'monthly', paymentMethod = 'ZainCash' } = req.body;

  if (!planId) {
    return res.status(400).json({ error: 'PLAN_ID_REQUIRED', message: 'Please specify a valid subscription plan ID.' });
  }

  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
  if (!plan) {
    return res.status(404).json({ error: 'PLAN_NOT_FOUND', message: 'Subscription plan does not exist.' });
  }

  const isYearly = billingCycle === 'yearly';
  const priceUSD = isYearly ? plan.priceYearlyUSD : plan.priceMonthlyUSD;
  const priceIQD = isYearly ? plan.priceYearlyIQD : plan.priceMonthlyIQD;

  const startsAt = new Date();
  const expiresAt = new Date(startsAt);
  if (isYearly) {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  } else {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  }

  const subId = `sub_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

  const activeSub: ActiveUserSubscription = {
    id: subId,
    userId,
    planId: plan.id,
    role: plan.roleTarget,
    tierName: plan.name,
    status: 'ACTIVE',
    billingCycle: isYearly ? 'yearly' : 'monthly',
    priceUSD,
    priceIQD,
    paymentMethod,
    perks: plan.perks,
    startsAt: startsAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    autoRenew: true,
  };

  const pool = getDbPool();
  if (pool) {
    try {
      // Upsert or insert new active subscription record
      await pool.query(
        `INSERT INTO user_subscriptions 
         (id, user_id, plan_id, role, tier_name, status, billing_cycle, price_usd, price_iqd, payment_method, perks, starts_at, expires_at, auto_renew)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (id) DO UPDATE SET 
           plan_id = EXCLUDED.plan_id,
           tier_name = EXCLUDED.tier_name,
           status = 'ACTIVE',
           billing_cycle = EXCLUDED.billing_cycle,
           price_usd = EXCLUDED.price_usd,
           price_iqd = EXCLUDED.price_iqd,
           payment_method = EXCLUDED.payment_method,
           perks = EXCLUDED.perks,
           starts_at = EXCLUDED.starts_at,
           expires_at = EXCLUDED.expires_at,
           auto_renew = EXCLUDED.auto_renew,
           updated_at = NOW()`,
        [
          subId,
          userId,
          plan.id,
          plan.roleTarget,
          plan.name,
          'ACTIVE',
          activeSub.billingCycle,
          priceUSD,
          priceIQD,
          paymentMethod,
          JSON.stringify(plan.perks),
          startsAt.toISOString(),
          expiresAt.toISOString(),
          true,
        ]
      );
    } catch (e) {
      console.warn('DB save subscription error:', e);
    }
  }

  userSubscriptionsStore.set(userId, activeSub);

  logAuditEvent({
    actorId: userId,
    actorRole: req.user?.role,
    action: 'SUBSCRIPTION_UPGRADED',
    resourceType: 'user_subscriptions',
    resourceId: subId,
    status: 'SUCCESS',
    metadata: {
      planId: plan.id,
      tierName: plan.name,
      priceUSD,
      paymentMethod,
      billingCycle,
    },
  });

  return res.json({
    success: true,
    message: `Successfully subscribed to ${plan.name}! Your membership benefits and perks are now active.`,
    subscription: activeSub,
  });
});

// 4. Cancel Subscription
router.post('/cancel', requireAuth, async (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id || 'usr_buyer_default';
  const existing = userSubscriptionsStore.get(userId);

  if (existing) {
    existing.autoRenew = false;
    existing.status = 'CANCELLED';
    userSubscriptionsStore.set(userId, existing);
  }

  const pool = getDbPool();
  if (pool) {
    try {
      await pool.query(
        `UPDATE user_subscriptions SET auto_renew = false, status = 'CANCELLED', updated_at = NOW() WHERE user_id = $1`,
        [userId]
      );
    } catch (e) {
      console.warn('DB cancel subscription error:', e);
    }
  }

  logAuditEvent({
    actorId: userId,
    actorRole: req.user?.role,
    action: 'SUBSCRIPTION_CANCELLED',
    resourceType: 'user_subscriptions',
    status: 'SUCCESS',
  });

  return res.json({
    success: true,
    message: 'Subscription renewal cancelled. You will continue to have access to your plan perks until the end of the current billing cycle.',
  });
});

// 5. Calculate Cart Benefits & Discounts for any Order
router.post('/calculate-perks', requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id || 'usr_buyer_default';
  const { subtotalUSD = 0, shippingCostUSD = 6 } = req.body;

  const currentSub = userSubscriptionsStore.get(userId);
  const perks = currentSub?.perks || {};

  const discountPercent = perks.discountPercent || 0;
  const discountAmountUSD = (subtotalUSD * discountPercent) / 100;
  const finalShippingUSD = perks.freeShipping ? 0 : shippingCostUSD;
  const totalUSD = subtotalUSD - discountAmountUSD + finalShippingUSD;

  return res.json({
    success: true,
    tierName: currentSub?.tierName || 'Basic',
    originalSubtotalUSD: subtotalUSD,
    discountPercent,
    discountAmountUSD,
    originalShippingUSD: shippingCostUSD,
    finalShippingUSD,
    shippingSavedUSD: shippingCostUSD - finalShippingUSD,
    totalUSD,
    extendedWarrantyMonths: perks.extendedWarrantyMonths || 1,
    perksApplied: {
      freeShipping: perks.freeShipping || false,
      tradeDiscount: discountPercent > 0,
      extendedWarranty: (perks.extendedWarrantyMonths || 1) > 1,
    },
  });
});

export default router;
