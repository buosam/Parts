/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket Security Core - Immutable Audit Logging Engine
 */

export type AuditAction =
  | 'USER_REGISTER'
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_PROFILE_UPDATE'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET_COMPLETE'
  | 'OTP_REQUEST'
  | 'OTP_VERIFIED'
  | 'OTP_FAILED'
  | 'ROLE_CHANGE'
  | 'PRIVILEGE_ESCALATION_BLOCKED'
  | 'DEALER_REGISTRATION'
  | 'DEALER_APPROVAL'
  | 'DEALER_SUSPEND'
  | 'DEALER_INVENTORY_SYNC'
  | 'ADMIN_ACCESS'
  | 'ADMIN_CONFIG_UPDATE'
  | 'DOCUMENT_ACCESS'
  | 'DOCUMENT_UPLOAD'
  | 'DOCUMENT_OCR_PROCESSED'
  | 'INVENTORY_MUTATION'
  | 'PRICE_UPDATE'
  | 'OFFER_CREATE'
  | 'PART_REQUEST_CREATED'
  | 'PART_REQUEST_BID_ACCEPTED'
  | 'ORDER_CREATE'
  | 'ORDER_PAYMENT_PROCESSED'
  | 'ORDER_STATUS_UPDATE'
  | 'ORDER_REFUND'
  | 'CART_CHECKOUT_ATTEMPT'
  | 'SESSION_REVOCATION'
  | 'INTEGRATION_CREDENTIAL_CHANGE'
  | 'SUBSCRIPTION_UPGRADED'
  | 'SUBSCRIPTION_CANCELLED'
  | 'COUPON_CREATED'
  | 'COUPON_APPLIED'
  | 'SHIPPING_RATE_UPDATE'
  | 'SECURITY_THREAT_DETECTED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'UNAUTHORIZED_ACCESS_ATTEMPT';

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorRole: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  ipAddress: string;
  userAgent?: string;
  status: 'SUCCESS' | 'DENIED' | 'FAILED';
  metadata?: Record<string, any>;
  timestamp: string;
}

// In-Memory Immutable Append-Only Audit Log Store (mirrors DB table)
const auditLogsStore: AuditLogEntry[] = [];

export function logAuditEvent(params: {
  actorId?: string;
  actorRole?: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  status?: 'SUCCESS' | 'DENIED' | 'FAILED';
  metadata?: Record<string, any>;
}): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    actorId: params.actorId || 'ANONYMOUS',
    actorRole: params.actorRole || 'PUBLIC',
    action: params.action,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    ipAddress: params.ipAddress || '127.0.0.1',
    userAgent: params.userAgent || 'system',
    status: params.status || 'SUCCESS',
    metadata: params.metadata || {},
    timestamp: new Date().toISOString(),
  };

  auditLogsStore.push(entry);

  if (entry.status === 'DENIED') {
    console.warn(
      `🚨 [SECURITY AUDIT ALERT] Unauthorized access denied: Action=${entry.action}, Actor=${entry.actorId} (${entry.actorRole}), Resource=${entry.resourceType}:${entry.resourceId || 'N/A'}`
    );
  } else if (
    entry.action === 'USER_LOGIN' ||
    entry.action === 'USER_REGISTER' ||
    entry.action === 'ORDER_CREATE' ||
    entry.action === 'SUBSCRIPTION_UPGRADED' ||
    entry.action === 'COUPON_CREATED'
  ) {
    console.log(
      `🛡️ [AUDIT] [${entry.action}] Actor=${entry.actorId} (${entry.actorRole}) -> Resource=${entry.resourceType}:${entry.resourceId || 'N/A'}`
    );
  }

  return entry;
}

export function queryAuditLogs(filter?: {
  action?: string;
  actorId?: string;
  resourceType?: string;
  status?: string;
  limit?: number;
}): AuditLogEntry[] {
  let results = [...auditLogsStore].reverse();

  if (filter?.action) {
    results = results.filter((log) => log.action === filter.action);
  }
  if (filter?.actorId) {
    results = results.filter((log) => log.actorId === filter.actorId);
  }
  if (filter?.resourceType) {
    results = results.filter((log) => log.resourceType === filter.resourceType);
  }
  if (filter?.status) {
    results = results.filter((log) => log.status === filter.status);
  }

  return results.slice(0, filter?.limit || 100);
}
