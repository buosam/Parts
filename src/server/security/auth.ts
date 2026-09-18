/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket Security Core - Authentication & Session Engine
 */

import crypto from 'node:crypto';

export type UserRole = 'customer' | 'supplier' | 'workshop' | 'admin';
export type AccountStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'DISABLED' | 'DELETED';
export type AdminSubRole = 'super_admin' | 'ops_admin' | 'dealer_admin' | 'support_admin' | 'finance_admin' | 'content_admin';
export type DealerStaffRole = 'owner' | 'manager' | 'sales' | 'inventory' | 'finance';

export interface UserAccount {
  id: string;
  email: string;
  phone?: string;
  name: string;
  passwordHash: string;
  salt: string;
  role: UserRole;
  adminSubRole?: AdminSubRole;
  dealerId?: string;
  dealerStaffRole?: DealerStaffRole;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
  linkedIdentities: {
    provider: 'email' | 'google' | 'apple' | 'facebook' | 'whatsapp' | 'phone';
    providerId: string;
    verifiedAt: string;
  }[];
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  device: string;
  ipAddress: string;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  isRevoked: boolean;
}

// In-Memory Fallback and Active Store for Fast Verification
export const usersStore: Map<string, UserAccount> = new Map();
export const sessionsStore: Map<string, UserSession> = new Map();
export const otpChallengeStore: Map<string, { code: string; phone: string; expiresAt: number; attempts: number }> = new Map();

// Helper: Hash Password securely using PBKDF2
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt: generatedSalt };
}

// Helper: Verify Password
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computed = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computed, 'hex'));
}

// Helper: Create Secure Session
export function createSession(
  user: UserAccount,
  device: string = 'Web Browser',
  ipAddress: string = '127.0.0.1',
  durationDays: number = 7
): UserSession {
  const sessionId = `sess_${crypto.randomBytes(16).toString('hex')}`;
  const token = `iqm_${crypto.randomBytes(32).toString('hex')}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();

  const session: UserSession = {
    id: sessionId,
    userId: user.id,
    token,
    device,
    ipAddress,
    createdAt: now.toISOString(),
    lastActiveAt: now.toISOString(),
    expiresAt,
    isRevoked: false,
  };

  sessionsStore.set(token, session);
  return session;
}

// Helper: Validate Session & Account Status
export function validateSessionToken(token?: string): { valid: boolean; user?: UserAccount; session?: UserSession; reason?: string } {
  if (!token) return { valid: false, reason: 'MISSING_TOKEN' };

  const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
  const session = sessionsStore.get(cleanToken);

  if (!session) {
    return { valid: false, reason: 'INVALID_OR_EXPIRED_SESSION' };
  }

  if (session.isRevoked) {
    return { valid: false, reason: 'SESSION_REVOKED' };
  }

  if (new Date(session.expiresAt).getTime() < Date.now()) {
    return { valid: false, reason: 'SESSION_EXPIRED' };
  }

  const user = usersStore.get(session.userId);
  if (!user) {
    return { valid: false, reason: 'USER_NOT_FOUND' };
  }

  if (user.status === 'SUSPENDED' || user.status === 'DISABLED' || user.status === 'DELETED') {
    return { valid: false, reason: `ACCOUNT_${user.status}` };
  }

  // Update last active
  session.lastActiveAt = new Date().toISOString();
  return { valid: true, user, session };
}

// Helper: Revoke Session
export function revokeSession(sessionId: string): boolean {
  for (const session of sessionsStore.values()) {
    if (session.id === sessionId) {
      session.isRevoked = true;
      return true;
    }
  }
  return false;
}

// Helper: Revoke All Sessions for User
export function revokeAllSessions(userId: string, exceptSessionId?: string): number {
  let count = 0;
  for (const session of sessionsStore.values()) {
    if (session.userId === userId && session.id !== exceptSessionId && !session.isRevoked) {
      session.isRevoked = true;
      count++;
    }
  }
  return count;
}

// Pre-seed known test accounts for immediate verification and demo stability
export function seedDefaultAccounts(): void {
  if (usersStore.size > 0) return;

  // 1. Buyer Account
  const buyerPass = hashPassword('buyer1234');
  usersStore.set('usr_buyer_01', {
    id: 'usr_buyer_01',
    email: 'ahmed@iqautomarket.iq',
    phone: '+9647701234567',
    name: 'Ahmed Al-Tikriti',
    passwordHash: buyerPass.hash,
    salt: buyerPass.salt,
    role: 'customer',
    status: 'ACTIVE',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
    linkedIdentities: [
      { provider: 'email', providerId: 'ahmed@iqautomarket.iq', verifiedAt: '2026-01-10T10:00:00Z' },
      { provider: 'whatsapp', providerId: '+9647701234567', verifiedAt: '2026-01-12T14:30:00Z' },
    ],
  });

  // 2. Dealer A (Al-Mansour Genuine Parts - Owner)
  const dealerAPass = hashPassword('dealer1234');
  usersStore.set('usr_dealer_a', {
    id: 'usr_dealer_a',
    email: 'sales@mansourparts.iq',
    phone: '+9647809876543',
    name: 'Mustafa Al-Mansour',
    passwordHash: dealerAPass.hash,
    salt: dealerAPass.salt,
    role: 'supplier',
    dealerId: 'dlr_mansour_01',
    dealerStaffRole: 'owner',
    status: 'ACTIVE',
    createdAt: '2026-01-05T09:00:00Z',
    updatedAt: '2026-01-05T09:00:00Z',
    linkedIdentities: [
      { provider: 'email', providerId: 'sales@mansourparts.iq', verifiedAt: '2026-01-05T09:00:00Z' },
    ],
  });

  // 3. Dealer B (Erbil Auto Hub - Owner)
  const dealerBPass = hashPassword('dealer1234');
  usersStore.set('usr_dealer_b', {
    id: 'usr_dealer_b',
    email: 'contact@erbilparts.iq',
    phone: '+9647501122334',
    name: 'Karwan Barzani',
    passwordHash: dealerBPass.hash,
    salt: dealerBPass.salt,
    role: 'supplier',
    dealerId: 'dlr_erbil_02',
    dealerStaffRole: 'owner',
    status: 'ACTIVE',
    createdAt: '2026-01-08T11:00:00Z',
    updatedAt: '2026-01-08T11:00:00Z',
    linkedIdentities: [
      { provider: 'email', providerId: 'contact@erbilparts.iq', verifiedAt: '2026-01-08T11:00:00Z' },
    ],
  });

  // 4. Dealer A Staff: Inventory Staff (Limited permissions)
  const dealerAStaffPass = hashPassword('staff1234');
  usersStore.set('usr_dealer_a_inventory', {
    id: 'usr_dealer_a_inventory',
    email: 'warehouse@mansourparts.iq',
    phone: '+9647805556677',
    name: 'Ali Inventory Specialist',
    passwordHash: dealerAStaffPass.hash,
    salt: dealerAStaffPass.salt,
    role: 'supplier',
    dealerId: 'dlr_mansour_01',
    dealerStaffRole: 'inventory',
    status: 'ACTIVE',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
    linkedIdentities: [
      { provider: 'email', providerId: 'warehouse@mansourparts.iq', verifiedAt: '2026-02-01T10:00:00Z' },
    ],
  });

  // 5. Super Admin Account
  const adminPass = hashPassword('admin1234');
  usersStore.set('usr_super_admin', {
    id: 'usr_super_admin',
    email: 'admin@iqautomarket.iq',
    phone: '+9647719988776',
    name: 'IQAutoMarket SuperAdmin',
    passwordHash: adminPass.hash,
    salt: adminPass.salt,
    role: 'admin',
    adminSubRole: 'super_admin',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    linkedIdentities: [
      { provider: 'email', providerId: 'admin@iqautomarket.iq', verifiedAt: '2026-01-01T00:00:00Z' },
    ],
  });

  // 6. Suspended Dealer for Security Testing
  const suspendedPass = hashPassword('suspended1234');
  usersStore.set('usr_dealer_suspended', {
    id: 'usr_dealer_suspended',
    email: 'suspended@badparts.iq',
    phone: '+9647709999999',
    name: 'Suspended Dealer Account',
    passwordHash: suspendedPass.hash,
    salt: suspendedPass.salt,
    role: 'supplier',
    dealerId: 'dlr_suspended_99',
    dealerStaffRole: 'owner',
    status: 'SUSPENDED',
    createdAt: '2026-02-15T12:00:00Z',
    updatedAt: '2026-02-20T12:00:00Z',
    linkedIdentities: [
      { provider: 'email', providerId: 'suspended@badparts.iq', verifiedAt: '2026-02-15T12:00:00Z' },
    ],
  });

  console.log(`🔒 Initialized ${usersStore.size} default security accounts with verified credential hashes.`);
}

seedDefaultAccounts();
