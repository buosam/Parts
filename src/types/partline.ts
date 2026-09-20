/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Partline - Inventory & Production Console Domain Types
 */

export type PartCondition = 'oem' | 'oem_surplus' | 'aftermarket' | 'refurb';
export type PartStatus = 'draft' | 'active' | 'discontinued' | 'blocked';

export type FitmentPosition = 'front' | 'rear' | 'left' | 'right' | 'front_left' | 'front_right' | 'rear_left' | 'rear_right' | 'none';
export type FitmentSource = 'manual' | 'catalog' | 'vision';

export interface FitmentRecord {
  id: string;
  partId: string;
  vehicleMake: string;
  vehicleModel: string;
  generation: string;
  yearRange: string;
  engineCode: string;
  displacementL?: number;
  position: FitmentPosition;
  qty: number;
  confidence: number; // 0.00 to 1.00 (< 0.85 flags row for human review)
  verifiedAt: string;
  source: FitmentSource;
}

export type StockReason = 'receipt' | 'sale' | 'return' | 'transfer' | 'adjustment' | 'scrap';

export interface StockMovement {
  id: string;
  partId: string;
  warehouseId: string;
  warehouseName: string;
  delta: number;
  reason: StockReason;
  refType?: string;
  refId?: string;
  actorName: string;
  createdAt: string;
}

export interface WarehouseStock {
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  city: string;
  qtyOnHand: number;
  qtyReserved: number;
  qtyIncoming: number;
  reorderPoint: number;
  bin: string;
  updatedAt: string;
}

export interface PartlinePart {
  id: string;
  orgId: string;
  sku: string;
  name: string;
  slug: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  oemNumber?: string;
  condition: PartCondition;
  status: PartStatus;
  unit: string; // 'pc', 'set', 'kit', 'pair'
  costCents: number;
  priceCents: number;
  currency: 'USD' | 'IQD';
  weightG?: number;
  dimsMm?: [number, number, number]; // length, width, height
  attrs: Record<string, string | number | boolean>;
  imageUrl?: string;
  fitments: FitmentRecord[];
  stockLevels: WarehouseStock[];
  totalQtyOnHand: number;
  totalQtyReserved: number;
  totalQtyIncoming: number;
  isLowStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export type WorkOrderStatus = 'draft' | 'released' | 'in_progress' | 'qc' | 'completed' | 'cancelled';
export type WorkOrderPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface WorkOrderStep {
  seq: number;
  name: string;
  station: string;
  status: 'pending' | 'active' | 'passed' | 'failed';
  durationMinutes: number;
  operatorName?: string;
}

export interface WorkOrder {
  id: string;
  code: string; // WO-2026-0481
  partId: string;
  partName: string;
  partSku: string;
  qtyPlanned: number;
  qtyProduced: number;
  qtyScrapped: number;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  dueAt: string;
  assigneeName: string;
  steps: WorkOrderStep[];
  station: string;
  createdAt: string;
}

export type PurchaseOrderStatus = 'draft' | 'sent' | 'confirmed' | 'partial' | 'received' | 'cancelled';

export interface PurchaseOrderLine {
  id: string;
  partId: string;
  partSku: string;
  partName: string;
  qty: number;
  receivedQty: number;
  unitCostCents: number;
}

export interface PurchaseOrder {
  id: string;
  code: string; // PO-2026-0192
  supplierId: string;
  supplierName: string;
  status: PurchaseOrderStatus;
  totalCents: number;
  currency: string;
  expectedAt: string;
  createdAt: string;
  lines: PurchaseOrderLine[];
}

export interface PartlineOrganization {
  id: string;
  name: string;
  slug: string;
  plan: 'enterprise' | 'growth' | 'starter';
  primaryCity: string;
}

export interface ActivityEvent {
  id: string;
  type: 'stock_receipt' | 'part_created' | 'wo_status' | 'fitment_verified' | 'audit_alert';
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  badgeColor: string;
}

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  undoMutation?: () => void;
}
