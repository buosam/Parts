/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket Security Core - Authentication & Session Engine
 */

import crypto from 'node:crypto';
import { query, queryOne } from '../db';

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
  companyName?: string;
  city?: string;
  address?: string;
  businessType?: string;
  avatarUrl?: string;
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

export interface PasswordResetChallenge {
  id: string;
  userId: string;
  code: string;
  expiresAt: number;
  used: boolean;
}

// In-Memory Fallback and Active Store for Fast Verification
export const usersStore: Map<string, UserAccount> = new Map();
export const sessionsStore: Map<string, UserSession> = new Map();
export const otpChallengeStore: Map<string, { code: string; phone: string; expiresAt: number; attempts: number }> = new Map();
export const passwordResetsStore: Map<string, PasswordResetChallenge> = new Map();

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

// Database Persistence Helpers
export async function saveUserToDb(user: UserAccount): Promise<void> {
  usersStore.set(user.id, user);
  await query(
    `INSERT INTO users (
      id, email, phone, name, password_hash, salt, role, admin_sub_role,
      dealer_id, dealer_staff_role, status, company_name, city, address,
      business_type, avatar_url, linked_identities, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      name = EXCLUDED.name,
      password_hash = EXCLUDED.password_hash,
      salt = EXCLUDED.salt,
      role = EXCLUDED.role,
      admin_sub_role = EXCLUDED.admin_sub_role,
      dealer_id = EXCLUDED.dealer_id,
      dealer_staff_role = EXCLUDED.dealer_staff_role,
      status = EXCLUDED.status,
      company_name = EXCLUDED.company_name,
      city = EXCLUDED.city,
      address = EXCLUDED.address,
      business_type = EXCLUDED.business_type,
      avatar_url = EXCLUDED.avatar_url,
      linked_identities = EXCLUDED.linked_identities,
      updated_at = EXCLUDED.updated_at;`,
    [
      user.id,
      user.email,
      user.phone || null,
      user.name,
      user.passwordHash,
      user.salt,
      user.role,
      user.adminSubRole || null,
      user.dealerId || null,
      user.dealerStaffRole || null,
      user.status,
      user.companyName || null,
      user.city || null,
      user.address || null,
      user.businessType || null,
      user.avatarUrl || null,
      JSON.stringify(user.linkedIdentities || []),
      user.createdAt,
      user.updatedAt,
    ]
  );
}

export async function saveSessionToDb(session: UserSession): Promise<void> {
  sessionsStore.set(session.token, session);
  await query(
    `INSERT INTO sessions (
      id, user_id, token, device, ip_address, created_at, last_active_at, expires_at, is_revoked
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (id) DO UPDATE SET
      last_active_at = EXCLUDED.last_active_at,
      is_revoked = EXCLUDED.is_revoked;`,
    [
      session.id,
      session.userId,
      session.token,
      session.device,
      session.ipAddress,
      session.createdAt,
      session.lastActiveAt,
      session.expiresAt,
      session.isRevoked,
    ]
  );
}

export async function revokeSessionInDb(sessionId: string): Promise<boolean> {
  await query(`UPDATE sessions SET is_revoked = true WHERE id = $1`, [sessionId]);
  return true;
}

export async function revokeAllSessionsInDb(userId: string, exceptSessionId?: string): Promise<number> {
  if (exceptSessionId) {
    await query(`UPDATE sessions SET is_revoked = true WHERE user_id = $1 AND id != $2`, [userId, exceptSessionId]);
  } else {
    await query(`UPDATE sessions SET is_revoked = true WHERE user_id = $1`, [userId]);
  }
  return 1;
}

export async function saveOtpChallengeToDb(phone: string, code: string, expiresAt: number): Promise<void> {
  otpChallengeStore.set(phone, { code, phone, expiresAt, attempts: 0 });
  await query(
    `INSERT INTO otp_challenges (phone, code, expires_at, attempts)
     VALUES ($1, $2, $3, 0)
     ON CONFLICT (phone) DO UPDATE SET code = EXCLUDED.code, expires_at = EXCLUDED.expires_at, attempts = 0`,
    [phone, code, expiresAt]
  );
}

export async function savePasswordResetToDb(id: string, userId: string, code: string, expiresAt: number): Promise<void> {
  passwordResetsStore.set(id, { id, userId, code, expiresAt, used: false });
  await query(
    `INSERT INTO password_resets (id, user_id, code, expires_at, used)
     VALUES ($1, $2, $3, $4, false)
     ON CONFLICT (id) DO UPDATE SET code = EXCLUDED.code, expires_at = EXCLUDED.expires_at, used = false`,
    [id, userId, code, expiresAt]
  );
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
  saveSessionToDb(session).catch((err) => console.warn('Could not persist session to PostgreSQL:', err?.message));
  return session;
}

export function validateSessionToken(token?: string): { valid: boolean; user?: UserAccount; session?: UserSession; reason?: string } {
  if (!token) return { valid: false, reason: 'MISSING_TOKEN' };

  const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
  if (!cleanToken || cleanToken === 'null' || cleanToken === 'undefined') {
    return { valid: false, reason: 'MISSING_TOKEN' };
  }

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

// Asynchronous DB-backed session validator (resolves session even after server restart or across nodes)
export async function validateSessionTokenAsync(token?: string): Promise<{ valid: boolean; user?: UserAccount; session?: UserSession; reason?: string }> {
  const memResult = validateSessionToken(token);
  if (memResult.valid) return memResult;

  if (!token) return { valid: false, reason: 'MISSING_TOKEN' };
  const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
  if (!cleanToken || cleanToken === 'null' || cleanToken === 'undefined') {
    return { valid: false, reason: 'MISSING_TOKEN' };
  }

  try {
    const sessionRow = await queryOne<any>(
      `SELECT * FROM sessions WHERE token = $1`,
      [cleanToken]
    );

    if (!sessionRow) {
      return { valid: false, reason: 'INVALID_OR_EXPIRED_SESSION' };
    }

    if (sessionRow.is_revoked) {
      return { valid: false, reason: 'SESSION_REVOKED' };
    }

    if (new Date(sessionRow.expires_at).getTime() < Date.now()) {
      return { valid: false, reason: 'SESSION_EXPIRED' };
    }

    let user = usersStore.get(sessionRow.user_id);
    if (!user) {
      const userRow = await queryOne<any>(
        `SELECT * FROM users WHERE id = $1`,
        [sessionRow.user_id]
      );
      if (userRow) {
        user = {
          id: userRow.id,
          email: userRow.email,
          phone: userRow.phone,
          name: userRow.name,
          passwordHash: userRow.password_hash,
          salt: userRow.salt,
          role: userRow.role,
          adminSubRole: userRow.admin_sub_role,
          dealerId: userRow.dealer_id,
          dealerStaffRole: userRow.dealer_staff_role,
          companyName: userRow.company_name,
          city: userRow.city,
          address: userRow.address,
          businessType: userRow.business_type,
          avatarUrl: userRow.avatar_url,
          status: userRow.status,
          createdAt: new Date(userRow.created_at).toISOString(),
          updatedAt: new Date(userRow.updated_at).toISOString(),
          linkedIdentities:
            typeof userRow.linked_identities === 'string'
              ? JSON.parse(userRow.linked_identities)
              : userRow.linked_identities || [],
        };
        usersStore.set(user.id, user);
      }
    }

    if (!user) {
      return { valid: false, reason: 'USER_NOT_FOUND' };
    }

    if (user.status === 'SUSPENDED' || user.status === 'DISABLED' || user.status === 'DELETED') {
      return { valid: false, reason: `ACCOUNT_${user.status}` };
    }

    const session: UserSession = {
      id: sessionRow.id,
      userId: sessionRow.user_id,
      token: sessionRow.token,
      device: sessionRow.device || 'Web Browser',
      ipAddress: sessionRow.ip_address || '127.0.0.1',
      createdAt: new Date(sessionRow.created_at).toISOString(),
      lastActiveAt: new Date().toISOString(),
      expiresAt: new Date(sessionRow.expires_at).toISOString(),
      isRevoked: sessionRow.is_revoked || false,
    };

    sessionsStore.set(cleanToken, session);
    query(`UPDATE sessions SET last_active_at = NOW() WHERE id = $1`, [session.id]).catch(() => {});
    return { valid: true, user, session };
  } catch {
    return memResult;
  }
}

// Helper: Revoke Session
export function revokeSession(sessionId: string): boolean {
  let found = false;
  for (const session of sessionsStore.values()) {
    if (session.id === sessionId) {
      session.isRevoked = true;
      found = true;
    }
  }
  revokeSessionInDb(sessionId).catch((err) => console.warn('Could not revoke session in DB:', err?.message));
  return found;
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
  revokeAllSessionsInDb(userId, exceptSessionId).catch((err) => console.warn('Could not revoke all sessions in DB:', err?.message));
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
    city: 'Baghdad',
    address: 'Karrada, District 903, Street 14',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
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
    companyName: 'Al-Mansour Genuine Auto Parts LLC',
    city: 'Baghdad',
    address: 'Sheikh Omar Industrial Zone, Hub 4',
    businessType: 'Authorized Distributor & Importer',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80',
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
    companyName: 'Erbil Auto Hub',
    city: 'Erbil',
    address: '100m Ring Road, Industrial Sector 2',
    businessType: 'OEM Wholesaler',
    status: 'ACTIVE',
    createdAt: '2026-01-08T11:00:00Z',
    updatedAt: '2026-01-08T11:00:00Z',
    linkedIdentities: [
      { provider: 'email', providerId: 'contact@erbilparts.iq', verifiedAt: '2026-01-08T11:00:00Z' },
    ],
  });

  // 4. Workshop / Garage Account (Babil Performance Garage)
  const workshopPass = hashPassword('workshop1234');
  usersStore.set('usr_workshop_01', {
    id: 'usr_workshop_01',
    email: 'service@babilauto.iq',
    phone: '+9647705554433',
    name: 'Hassan Al-Babili',
    passwordHash: workshopPass.hash,
    salt: workshopPass.salt,
    role: 'workshop',
    companyName: 'Babil Performance Auto Garage',
    city: 'Baghdad',
    address: 'Al-Zafraniya Industrial Estate, Complex 7',
    businessType: 'Fleet Maintenance & Engine Overhaul',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    status: 'ACTIVE',
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-15T08:00:00Z',
    linkedIdentities: [
      { provider: 'email', providerId: 'service@babilauto.iq', verifiedAt: '2026-01-15T08:00:00Z' },
      { provider: 'whatsapp', providerId: '+9647705554433', verifiedAt: '2026-01-15T08:00:00Z' },
    ],
  });

  // 5. Super Admin Account
  const adminPass = hashPassword('admin1234');
  usersStore.set('usr_super_admin', {
    id: 'usr_super_admin',
    email: 'admin@iqautomarket.iq',
    phone: '+9647719988776',
    name: 'Zaid Al-Rawi',
    passwordHash: adminPass.hash,
    salt: adminPass.salt,
    role: 'admin',
    adminSubRole: 'super_admin',
    companyName: 'IQAutoMarket Operations HQ',
    city: 'Baghdad',
    address: 'Baghdad Tech Tower, Level 18',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
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

export async function syncDefaultAccountsToDb(): Promise<void> {
  for (const user of usersStore.values()) {
    await saveUserToDb(user).catch(() => {});
  }
}

seedDefaultAccounts();

