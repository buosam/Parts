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
    (process.env.PGHOST && process.env.PGUSER
      ? `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD || ''}@${process.env.PGHOST}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'railway'}`
      : undefined);

  if (!connectionString) {
    return null;
  }

  try {
    const config: PoolConfig = {
      connectionString,
      ssl:
        process.env.NODE_ENV === 'production' || connectionString.includes('sslmode=require')
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
