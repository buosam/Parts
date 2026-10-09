/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pool, PoolConfig } from 'pg';

let pool: Pool | null = null;
let isConnected = false;

export function getDbPool(): Pool | null {
  if (pool) return pool;

  const connectionString =
    process.env.DATABASE_URL ||
    process.env.DATABASE_PRIVATE_URL ||
    process.env.DATABASE_PUBLIC_URL ||
    (process.env.PGHOST && process.env.PGUSER
      ? `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD || ''}@${process.env.PGHOST}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'railway'}`
      : undefined);

  if (!connectionString) {
    return null;
  }

  try {
    const isInternalRailway = connectionString.includes('railway.internal') || (process.env.PGHOST && process.env.PGHOST.includes('railway.internal'));
    const isExplicitSsl = connectionString.includes('sslmode=require');

    const config: PoolConfig = {
      connectionString,
      ssl:
        isInternalRailway
          ? false
          : isExplicitSsl || process.env.NODE_ENV === 'production'
            ? { rejectUnauthorized: false }
            : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

    pool = new Pool(config);

    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
      isConnected = false;
    });

    return pool;
  } catch (error) {
    console.warn('Failed to initialize PostgreSQL pool:', error);
    return null;
  }
}

export async function initDatabase(): Promise<boolean> {
  const p = getDbPool();
  if (!p) {
    console.log('ℹ️ Running in memory / mock storage mode (No DATABASE_URL configured).');
    return false;
  }

  try {
    const client = await p.connect();
    isConnected = true;
    console.log('✅ PostgreSQL connected successfully to Railway database!');

    // Initialize core relational tables if they don't already exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        name VARCHAR(255) NOT NULL,
        password_hash TEXT NOT NULL,
        salt VARCHAR(64) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'customer',
        admin_sub_role VARCHAR(50),
        dealer_id VARCHAR(64),
        dealer_staff_role VARCHAR(50),
        status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
        company_name VARCHAR(255),
        city VARCHAR(100),
        address VARCHAR(255),
        business_type VARCHAR(100),
        avatar_url TEXT,
        linked_identities JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(128) UNIQUE NOT NULL,
        device VARCHAR(255),
        ip_address VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        is_revoked BOOLEAN DEFAULT false
      );

      CREATE TABLE IF NOT EXISTS otp_challenges (
        phone VARCHAR(50) PRIMARY KEY,
        code VARCHAR(10) NOT NULL,
        expires_at BIGINT NOT NULL,
        attempts INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS password_resets (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
        code VARCHAR(10) NOT NULL,
        expires_at BIGINT NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(64) PRIMARY KEY,
        actor_id VARCHAR(64),
        actor_role VARCHAR(50),
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(100) NOT NULL,
        resource_id VARCHAR(100),
        ip_address VARCHAR(50),
        status VARCHAR(50) NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS dealer_branches (
        id VARCHAR(64) PRIMARY KEY,
        supplier_id VARCHAR(64) NOT NULL,
        name VARCHAR(255) NOT NULL,
        name_ar VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        address VARCHAR(255),
        phone VARCHAR(50),
        is_central BOOLEAN DEFAULT false,
        accepts_pickup BOOLEAN DEFAULT true,
        delivery_sla_hours INTEGER DEFAULT 24,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS dealer_integrations (
        id VARCHAR(64) PRIMARY KEY,
        supplier_id VARCHAR(64) NOT NULL,
        provider_type VARCHAR(50) NOT NULL,
        system_type VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'healthy',
        api_base_url TEXT,
        api_key VARCHAR(255),
        webhook_secret VARCHAR(255),
        sync_frequency VARCHAR(50) DEFAULT 'hourly',
        rules JSONB DEFAULT '{}'::jsonb,
        field_mappings JSONB DEFAULT '[]'::jsonb,
        stats JSONB DEFAULT '{"totalSynced": 0, "syncedProducts": 0, "errorCount": 0, "webhookEvents": 0}'::jsonb,
        last_sync_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS sync_jobs (
        id VARCHAR(64) PRIMARY KEY,
        integration_id VARCHAR(64) REFERENCES dealer_integrations(id) ON DELETE CASCADE,
        trigger_source VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        started_at TIMESTAMP WITH TIME ZONE NOT NULL,
        completed_at TIMESTAMP WITH TIME ZONE,
        items_processed INTEGER DEFAULT 0,
        items_created INTEGER DEFAULT 0,
        items_updated INTEGER DEFAULT 0,
        items_failed INTEGER DEFAULT 0,
        error_message TEXT
      );

      CREATE TABLE IF NOT EXISTS sync_errors (
        id VARCHAR(64) PRIMARY KEY,
        integration_id VARCHAR(64) REFERENCES dealer_integrations(id) ON DELETE CASCADE,
        job_id VARCHAR(64),
        external_sku VARCHAR(100),
        error_category VARCHAR(100) NOT NULL,
        error_message TEXT NOT NULL,
        raw_data JSONB,
        severity VARCHAR(50) DEFAULT 'warning',
        status VARCHAR(50) DEFAULT 'open',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS external_products (
        id VARCHAR(64) PRIMARY KEY,
        supplier_id VARCHAR(64) NOT NULL,
        external_sku VARCHAR(100) NOT NULL,
        part_number VARCHAR(100) NOT NULL,
        oem_number VARCHAR(100),
        brand VARCHAR(100),
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        fitment_models TEXT[],
        purchase_cost NUMERIC(12, 2) DEFAULT 0,
        sell_price NUMERIC(12, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'IQD',
        stock_on_hand INTEGER DEFAULT 0,
        stock_available INTEGER DEFAULT 0,
        min_stock_threshold INTEGER DEFAULT 1,
        branch_allocations JSONB DEFAULT '[]'::jsonb,
        is_active BOOLEAN DEFAULT true,
        last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS partner_orders (
        id VARCHAR(64) PRIMARY KEY,
        supplier_id VARCHAR(64) NOT NULL,
        buyer_id VARCHAR(64),
        external_order_id VARCHAR(100),
        total_amount NUMERIC(12, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'IQD',
        status VARCHAR(50) DEFAULT 'pending',
        items JSONB DEFAULT '[]'::jsonb,
        delivery_address TEXT,
        branch_id VARCHAR(64),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS user_subscriptions (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
        plan_id VARCHAR(64) NOT NULL,
        role VARCHAR(50) NOT NULL,
        tier_name VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
        billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly',
        price_usd NUMERIC(10, 2) NOT NULL DEFAULT 0,
        price_iqd NUMERIC(12, 2) NOT NULL DEFAULT 0,
        payment_method VARCHAR(50) DEFAULT 'ZainCash',
        perks JSONB DEFAULT '{}'::jsonb,
        starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        auto_renew BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS coupons (
        id VARCHAR(64) PRIMARY KEY,
        code VARCHAR(64) UNIQUE NOT NULL,
        description TEXT,
        description_ar TEXT,
        discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage',
        discount_value NUMERIC(10, 2) NOT NULL,
        min_order_usd NUMERIC(10, 2) DEFAULT 0,
        max_discount_usd NUMERIC(10, 2) DEFAULT 100,
        usage_limit INTEGER DEFAULT 500,
        used_count INTEGER DEFAULT 0,
        expires_at VARCHAR(50),
        applicable_cities JSONB DEFAULT '[]'::jsonb,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS shipping_city_rates (
        id VARCHAR(64) PRIMARY KEY,
        city VARCHAR(100) UNIQUE NOT NULL,
        city_ar VARCHAR(100),
        standard_shipping_usd NUMERIC(10, 2) NOT NULL DEFAULT 5.0,
        standard_delivery_days VARCHAR(50) DEFAULT '1-2 Days',
        express_shipping_usd NUMERIC(10, 2) NOT NULL DEFAULT 12.0,
        express_delivery_hours VARCHAR(50) DEFAULT '2-4 Hours',
        free_shipping_threshold_usd NUMERIC(10, 2) DEFAULT 120.0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    client.release();
    return true;
  } catch (err: any) {
    console.warn('PostgreSQL database initialization warning:', err?.message || err);
    isConnected = false;
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}
