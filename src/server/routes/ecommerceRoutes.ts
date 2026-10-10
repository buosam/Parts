/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket Ecommerce API - Coupons, Discounts & City Shipping Rates
 */

import { Router, Request, Response } from 'express';
import { getDbPool } from '../db';
import { logAuditEvent } from '../security/audit';
import {
  Coupon,
  CityShippingRate,
  DEFAULT_COUPONS,
  DEFAULT_CITY_SHIPPING_RATES,
} from '../../data/ecommerceConfig';

const router = Router();

// In-memory runtime state for fast resolution and non-Postgres environments
let memoryCoupons: Coupon[] = [...DEFAULT_COUPONS];
let memoryShippingRates: CityShippingRate[] = [...DEFAULT_CITY_SHIPPING_RATES];

/**
 * GET /api/ecommerce/coupons
 * Retrieve all coupons (Admin view or public active list)
 */
router.get('/coupons', async (req: Request, res: Response) => {
  const pool = getDbPool();
  if (!pool) {
    return res.json({ success: true, coupons: memoryCoupons });
  }

  try {
    const result = await pool.query(`SELECT * FROM coupons ORDER BY created_at DESC`);
    if (result.rows.length === 0) {
      return res.json({ success: true, coupons: memoryCoupons });
    }
    const coupons = result.rows.map((r) => ({
      id: r.id,
      code: r.code,
      description: r.description,
      descriptionAr: r.description_ar,
      discountType: r.discount_type,
      discountValue: Number(r.discount_value),
      minOrderUSD: Number(r.min_order_usd),
      maxDiscountUSD: Number(r.max_discount_usd),
      usageLimit: Number(r.usage_limit),
      usedCount: Number(r.used_count),
      expiresAt: r.expires_at,
      applicableCities: r.applicable_cities || [],
      isActive: r.is_active,
    }));
    return res.json({ success: true, coupons });
  } catch (err) {
    return res.json({ success: true, coupons: memoryCoupons });
  }
});

/**
 * POST /api/ecommerce/coupons
 * Create new coupon (Admin)
 */
router.post('/coupons', async (req: Request, res: Response) => {
  const {
    code,
    description,
    descriptionAr,
    discountType,
    discountValue,
    minOrderUSD,
    maxDiscountUSD,
    usageLimit,
    expiresAt,
    applicableCities,
    isActive,
  } = req.body;

  if (!code || !discountValue) {
    return res.status(400).json({ error: 'Code and discountValue are required' });
  }

  const newCoupon: Coupon = {
    id: `cpn_${Date.now()}`,
    code: code.toUpperCase().trim(),
    description: description || `Discount of ${discountValue}${discountType === 'percentage' ? '%' : ' USD'}`,
    descriptionAr: descriptionAr || `خصم ${discountValue}${discountType === 'percentage' ? '%' : ' دولار'}`,
    discountType: discountType || 'percentage',
    discountValue: Number(discountValue),
    minOrderUSD: Number(minOrderUSD || 0),
    maxDiscountUSD: Number(maxDiscountUSD || 100),
    usageLimit: Number(usageLimit || 500),
    usedCount: 0,
    expiresAt: expiresAt || '2027-12-31',
    applicableCities: applicableCities || [],
    isActive: isActive !== false,
  };

  memoryCoupons.unshift(newCoupon);

  const pool = getDbPool();
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO coupons (id, code, description, description_ar, discount_type, discount_value, min_order_usd, max_discount_usd, usage_limit, used_count, expires_at, applicable_cities, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO NOTHING`,
        [
          newCoupon.id,
          newCoupon.code,
          newCoupon.description,
          newCoupon.descriptionAr,
          newCoupon.discountType,
          newCoupon.discountValue,
          newCoupon.minOrderUSD,
          newCoupon.maxDiscountUSD,
          newCoupon.usageLimit,
          newCoupon.usedCount,
          newCoupon.expiresAt,
          JSON.stringify(newCoupon.applicableCities),
          newCoupon.isActive,
        ]
      );
    } catch (e) {
      console.warn('Coupon DB insert fallback:', e);
    }
  }

  logAuditEvent({
    action: 'COUPON_CREATED',
    resourceType: 'coupon',
    resourceId: newCoupon.code,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
    metadata: { code: newCoupon.code, discountValue: newCoupon.discountValue, discountType: newCoupon.discountType },
  });

  return res.status(201).json({ success: true, coupon: newCoupon });
});

/**
 * PUT /api/ecommerce/coupons/:id
 * Update existing coupon
 */
router.put('/coupons/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const idx = memoryCoupons.findIndex((c) => c.id === id);
  if (idx !== -1) {
    memoryCoupons[idx] = { ...memoryCoupons[idx], ...updates };
  }

  const pool = getDbPool();
  if (pool) {
    try {
      await pool.query(
        `UPDATE coupons SET
          description = COALESCE($2, description),
          description_ar = COALESCE($3, description_ar),
          discount_value = COALESCE($4, discount_value),
          min_order_usd = COALESCE($5, min_order_usd),
          is_active = COALESCE($6, is_active),
          usage_limit = COALESCE($7, usage_limit)
        WHERE id = $1`,
        [
          id,
          updates.description,
          updates.descriptionAr,
          updates.discountValue,
          updates.minOrderUSD,
          updates.isActive,
          updates.usageLimit,
        ]
      );
    } catch (e) {
      console.warn('Coupon DB update fallback:', e);
    }
  }

  return res.json({ success: true, coupon: memoryCoupons[idx] || updates });
});

/**
 * DELETE /api/ecommerce/coupons/:id
 * Delete coupon
 */
router.delete('/coupons/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  memoryCoupons = memoryCoupons.filter((c) => c.id !== id);

  const pool = getDbPool();
  if (pool) {
    try {
      await pool.query(`DELETE FROM coupons WHERE id = $1`, [id]);
    } catch (e) {
      console.warn('Coupon DB delete fallback:', e);
    }
  }

  return res.json({ success: true, message: 'Coupon deleted' });
});

/**
 * POST /api/ecommerce/coupons/validate
 * Validate coupon code at checkout
 */
router.post('/coupons/validate', (req: Request, res: Response) => {
  const { code, subtotalUSD, city } = req.body;
  if (!code) {
    return res.status(400).json({ valid: false, message: 'Coupon code required' });
  }

  const coupon = memoryCoupons.find(
    (c) => c.code.toUpperCase() === code.toUpperCase().trim() && c.isActive
  );

  if (!coupon) {
    return res.status(404).json({
      valid: false,
      message: 'Invalid or expired coupon code',
      messageAr: 'رمز الكوبون غير صحيح أو منتهي الصلاحية',
    });
  }

  const subtotal = Number(subtotalUSD || 0);

  if (coupon.minOrderUSD && subtotal < coupon.minOrderUSD) {
    return res.status(400).json({
      valid: false,
      message: `Minimum order amount of $${coupon.minOrderUSD} required for this coupon`,
      messageAr: `الحد الأدنى للطلب لاستخدام هذا الكوبون هو $${coupon.minOrderUSD}`,
    });
  }

  if (coupon.applicableCities && coupon.applicableCities.length > 0 && city) {
    const isApplicable = coupon.applicableCities.some((c) =>
      c.toLowerCase().includes(city.toLowerCase())
    );
    if (!isApplicable) {
      return res.status(400).json({
        valid: false,
        message: `Coupon is valid only for orders in: ${coupon.applicableCities.join(', ')}`,
        messageAr: `هذا الكوبون صالح فقط لمحافظات: ${coupon.applicableCities.join(', ')}`,
      });
    }
  }

  let discountUSD = 0;
  if (coupon.discountType === 'percentage') {
    discountUSD = (subtotal * coupon.discountValue) / 100;
  } else {
    discountUSD = coupon.discountValue;
  }

  if (coupon.maxDiscountUSD && discountUSD > coupon.maxDiscountUSD) {
    discountUSD = coupon.maxDiscountUSD;
  }

  discountUSD = Math.min(discountUSD, subtotal);

  return res.json({
    valid: true,
    coupon,
    discountUSD: Math.round(discountUSD * 100) / 100,
    message: `Coupon ${coupon.code} applied successfully!`,
    messageAr: `تم تفعيل الكوبون ${coupon.code} بنجاح!`,
  });
});

/**
 * GET /api/ecommerce/shipping-rates
 * Get city shipping matrix
 */
router.get('/shipping-rates', async (req: Request, res: Response) => {
  const pool = getDbPool();
  if (!pool) {
    return res.json({ success: true, rates: memoryShippingRates });
  }

  try {
    const result = await pool.query(`SELECT * FROM shipping_city_rates ORDER BY city ASC`);
    if (result.rows.length === 0) {
      return res.json({ success: true, rates: memoryShippingRates });
    }
    const rates = result.rows.map((r) => ({
      id: r.id,
      city: r.city,
      cityAr: r.city_ar,
      standardShippingUSD: Number(r.standard_shipping_usd),
      standardDeliveryDays: r.standard_delivery_days,
      expressShippingUSD: Number(r.express_shipping_usd),
      expressDeliveryHours: r.express_delivery_hours,
      freeShippingThresholdUSD: Number(r.free_shipping_threshold_usd),
      isActive: r.is_active,
    }));
    return res.json({ success: true, rates });
  } catch (err) {
    return res.json({ success: true, rates: memoryShippingRates });
  }
});

/**
 * PUT /api/ecommerce/shipping-rates/:id
 * Update city shipping configuration (Admin)
 */
router.put('/shipping-rates/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const idx = memoryShippingRates.findIndex((r) => r.id === id);
  if (idx !== -1) {
    memoryShippingRates[idx] = { ...memoryShippingRates[idx], ...updates };
  }

  const pool = getDbPool();
  if (pool) {
    try {
      await pool.query(
        `UPDATE shipping_city_rates SET
          standard_shipping_usd = COALESCE($2, standard_shipping_usd),
          standard_delivery_days = COALESCE($3, standard_delivery_days),
          express_shipping_usd = COALESCE($4, express_shipping_usd),
          express_delivery_hours = COALESCE($5, express_delivery_hours),
          free_shipping_threshold_usd = COALESCE($6, free_shipping_threshold_usd),
          is_active = COALESCE($7, is_active)
        WHERE id = $1`,
        [
          id,
          updates.standardShippingUSD,
          updates.standardDeliveryDays,
          updates.expressShippingUSD,
          updates.expressDeliveryHours,
          updates.freeShippingThresholdUSD,
          updates.isActive,
        ]
      );
    } catch (e) {
      console.warn('Shipping rate DB update fallback:', e);
    }
  }

  return res.json({ success: true, rate: memoryShippingRates[idx] || updates });
});

export default router;
