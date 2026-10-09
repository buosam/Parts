/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket Clean Production Initial State (Zero Mock Data)
 */

import {
  MasterPart,
  Supplier,
  Vehicle,
  PartRequest,
  RepairOrder,
  DemandIntelligenceItem,
  DealerReview,
  Order,
  DealerBranch,
  DealerIntegration,
  IntegrationSyncJob,
  IntegrationSyncError,
  ExternalProduct,
  IntegrationFieldMapping,
} from '../types';

export const INITIAL_VEHICLES: Vehicle[] = [];
export const MASTER_PARTS: MasterPart[] = [];
export const SUPPLIERS: Supplier[] = [];
export const INITIAL_REQUESTS: PartRequest[] = [];
export const INITIAL_REPAIR_ORDERS: RepairOrder[] = [];
export const DEMAND_INTELLIGENCE: DemandIntelligenceItem[] = [];
export const INITIAL_REVIEWS: DealerReview[] = [];
export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_DEALER_INTEGRATIONS: DealerIntegration[] = [];
export const INITIAL_SYNC_JOBS: IntegrationSyncJob[] = [];
export const INITIAL_SYNC_ERRORS: IntegrationSyncError[] = [];
export const INITIAL_EXTERNAL_PRODUCTS: ExternalProduct[] = [];
export const INITIAL_DEALER_BRANCHES: DealerBranch[] = [];

export const DEFAULT_FIELD_MAPPINGS: IntegrationFieldMapping[] = [
  { sourceField: 'ItemNumber', targetField: 'partNumber', isRequired: true, transformationType: 'uppercase' },
  { sourceField: 'Description', targetField: 'name', isRequired: true, transformationType: 'trim' },
  { sourceField: 'Manufacturer', targetField: 'brand', isRequired: true, transformationType: 'trim' },
  { sourceField: 'UnitPrice', targetField: 'sellPrice', isRequired: true, transformationType: 'parse_number' },
  { sourceField: 'AvailableQty', targetField: 'stockAvailable', isRequired: true, transformationType: 'parse_number' },
  { sourceField: 'OEMReference', targetField: 'oemNumber', isRequired: false, transformationType: 'uppercase' },
  { sourceField: 'CategoryName', targetField: 'category', isRequired: false, transformationType: 'trim' },
];
