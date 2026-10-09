/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Partline Clean Production Initial State (Zero Mock Data)
 */

import {
  PartlinePart,
  PartlineOrganization,
  WorkOrder,
  StockMovement,
  ActivityEvent,
  PurchaseOrder,
} from '../../types/partline';

export const INITIAL_ORGANIZATIONS: PartlineOrganization[] = [];
export const INITIAL_PARTS: PartlinePart[] = [];
export const INITIAL_WORK_ORDERS: WorkOrder[] = [];
export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [];
export const INITIAL_ACTIVITY: ActivityEvent[] = [];
export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [];
