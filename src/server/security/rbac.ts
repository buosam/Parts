/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket Security Core - Strict RBAC & Object-Level Authorization Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { UserRole, UserAccount, UserSession, validateSessionToken } from './auth';
import { logAuditEvent } from './audit';

// Extend Express Request interface to hold authenticated context
export interface AuthenticatedRequest extends Request {
  user?: UserAccount;
  session?: UserSession;
  dealerId?: string;
}

// 1. Mandatory Authentication Middleware
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization || (req.headers['x-session-token'] as string);

  if (!authHeader) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Authentication token required.',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const { valid, user, session, reason } = validateSessionToken(authHeader);

  if (!valid || !user || !session) {
    logAuditEvent({
      action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      resourceType: 'auth',
      resourceId: req.originalUrl,
      ipAddress: req.ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1',
      userAgent: req.headers['user-agent'],
      status: 'DENIED',
      metadata: { reason, path: req.originalUrl },
    });

    res.status(401).json({
      error: 'INVALID_TOKEN',
      message: reason === 'SESSION_REVOKED' ? 'Session has been revoked.' :
               reason?.startsWith('ACCOUNT_') ? `Account is ${reason.replace('ACCOUNT_', '')}.` :
               'Session expired or invalid.',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Attach verified context
  req.user = user;
  req.session = session;
  if (user.dealerId) {
    req.dealerId = user.dealerId;
  }

  next();
}

// 2. Strict Role Boundary Guard
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      logAuditEvent({
        actorId: req.user.id,
        actorRole: req.user.role,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        resourceType: 'role_boundary',
        resourceId: req.originalUrl,
        ipAddress: req.ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1',
        userAgent: req.headers['user-agent'],
        status: 'DENIED',
        metadata: {
          userRole: req.user.role,
          requiredRoles: allowedRoles,
          path: req.originalUrl,
        },
      });

      res.status(403).json({
        error: 'FORBIDDEN',
        message: `Forbidden: Role [${req.user.role}] is not authorized to access this resource.`,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
}

// 3. Organization Isolation Guard (Dealer A vs Dealer B Isolation)
export function enforceDealerScope(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return;
  }

  if (req.user.role !== 'supplier' || !req.user.dealerId) {
    res.status(403).json({ error: 'FORBIDDEN', message: 'Active dealer organization membership required.' });
    return;
  }

  // If a dealer attempts to pass a target dealerId in URL params, query, or body that does NOT match their authenticated dealerId:
  const requestedDealerId =
    req.params.dealerId ||
    (req.query.dealerId as string) ||
    (req.query.orgId as string) ||
    req.body?.dealerId ||
    req.body?.supplierId;

  if (requestedDealerId && requestedDealerId !== req.user.dealerId) {
    logAuditEvent({
      actorId: req.user.id,
      actorRole: req.user.role,
      action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      resourceType: 'cross_organization_breach',
      resourceId: requestedDealerId,
      ipAddress: req.ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1',
      userAgent: req.headers['user-agent'],
      status: 'DENIED',
      metadata: {
        attemptedTargetDealer: requestedDealerId,
        actualDealerId: req.user.dealerId,
        endpoint: req.originalUrl,
      },
    });

    res.status(403).json({
      error: 'CROSS_ORGANIZATION_ACCESS_DENIED',
      message: 'Access denied: You cannot access or modify resources belonging to another dealer.',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Always bind query strictly to authenticated dealer
  req.dealerId = req.user.dealerId;
  next();
}

// 4. Dealer Staff Granular Permission Guard
export function requireDealerPermission(permission: 'inventory:write' | 'finance:read' | 'team:manage' | 'integrations:manage') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== 'supplier') {
      res.status(403).json({ error: 'FORBIDDEN', message: 'Dealer permission check failed.' });
      return;
    }

    const staffRole = req.user.dealerStaffRole || 'owner';

    // Permission Matrix
    const allowed = (() => {
      if (staffRole === 'owner') return true; // Owner has all permissions
      if (permission === 'inventory:write') return staffRole === 'manager' || staffRole === 'inventory';
      if (permission === 'finance:read') return staffRole === 'finance' || staffRole === 'manager';
      if (permission === 'team:manage') return staffRole === 'manager';
      if (permission === 'integrations:manage') return staffRole === 'manager';
      return false;
    })();

    if (!allowed) {
      logAuditEvent({
        actorId: req.user.id,
        actorRole: req.user.role,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        resourceType: 'dealer_staff_permission',
        resourceId: permission,
        ipAddress: req.ip || '127.0.0.1',
        status: 'DENIED',
        metadata: { staffRole, permission },
      });

      res.status(403).json({
        error: 'STAFF_PERMISSION_DENIED',
        message: `Your staff role [${staffRole}] does not have permission [${permission}].`,
      });
      return;
    }

    next();
  };
}

// 5. Anti-IDOR Object-Level Authorization Helper
export function checkObjectOwnership(
  user: UserAccount,
  resourceOwnerId: string,
  resourceDealerId?: string
): boolean {
  // SuperAdmin has platform oversight
  if (user.role === 'admin') return true;

  // Direct owner (Buyer owning vehicle, request, order, document)
  if (user.id === resourceOwnerId) return true;

  // Associated dealer (e.g. order placed with this dealer)
  if (resourceDealerId && user.dealerId === resourceDealerId) return true;

  return false;
}
