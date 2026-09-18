/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket Security Core - Immutable Audit Logging Engine
 */

export type AuditAction =
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'PASSWORD_CHANGE'
  | 'ROLE_CHANGE'
  | 'PRIVILEGE_ESCALATION_BLOCKED'
  | 'DEALER_REGISTRATION'
  | 'DEALER_APPROVAL'
  | 'DEALER_SUSPEND'
  | 'ADMIN_ACCESS'
  | 'DOCUMENT_ACCESS'
  | 'DOCUMENT_UPLOAD'
  | 'INVENTORY_MUTATION'
  | 'PRICE_UPDATE'
  | 'OFFER_CREATE'
  | 'ORDER_CREATE'
  | 'ORDER_STATUS_UPDATE'
  | 'ORDER_REFUND'
  | 'SESSION_REVOCATION'
  | 'INTEGRATION_CREDENTIAL_CHANGE'
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
    console.warn(`🚨 [SECURITY AUDIT ALERT] Unauthorized access denied: Action=${entry.action}, Actor=${entry.actorId} (${entry.actorRole}), Resource=${entry.resourceType}:${entry.resourceId || 'N/A'}`);
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
