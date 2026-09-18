/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket Auth API Routes - Multi-Method, Account Linking, Session Device Management
 */

import express from 'express';
import crypto from 'node:crypto';
import {
  usersStore,
  sessionsStore,
  otpChallengeStore,
  hashPassword,
  verifyPassword,
  createSession,
  revokeSession,
  revokeAllSessions,
  UserAccount,
} from '../security/auth';
import { requireAuth, AuthenticatedRequest } from '../security/rbac';
import { logAuditEvent } from '../security/audit';

const router = express.Router();

// 1. User Registration (Buyer or Dealer Applicant)
router.post('/register', (req, res) => {
  const { email, password, name, phone, role = 'customer', companyName } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'Email, password, and name are required.' });
  }

  // SECURITY RULE: Never allow public registration to create an Admin account!
  if (role === 'admin' || req.body.adminSubRole) {
    logAuditEvent({
      action: 'PRIVILEGE_ESCALATION_BLOCKED',
      resourceType: 'user_registration',
      ipAddress: req.ip || '127.0.0.1',
      status: 'DENIED',
      metadata: { attemptedRole: 'admin', email },
    });

    return res.status(403).json({
      error: 'ROLE_ESCALATION_DENIED',
      message: 'Administrator accounts cannot be created via public registration.',
    });
  }

  // Check duplicate email
  for (const u of usersStore.values()) {
    if (u.email.toLowerCase() === email.toLowerCase()) {
      return res.status(409).json({ error: 'EMAIL_EXISTS', message: 'An account with this email already exists.' });
    }
  }

  const userId = `usr_${crypto.randomBytes(8).toString('hex')}`;
  const { hash, salt } = hashPassword(password);
  const isDealer = role === 'supplier';
  const dealerId = isDealer ? `dlr_${crypto.randomBytes(8).toString('hex')}` : undefined;

  const newUser: UserAccount = {
    id: userId,
    email: email.toLowerCase(),
    phone,
    name,
    passwordHash: hash,
    salt,
    role: isDealer ? 'supplier' : 'customer',
    dealerId,
    dealerStaffRole: isDealer ? 'owner' : undefined,
    status: isDealer ? 'PENDING_VERIFICATION' : 'ACTIVE', // Dealers require verification before active selling
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    linkedIdentities: [
      { provider: 'email', providerId: email.toLowerCase(), verifiedAt: new Date().toISOString() },
      ...(phone ? [{ provider: 'phone' as const, providerId: phone, verifiedAt: new Date().toISOString() }] : []),
    ],
  };

  usersStore.set(userId, newUser);

  const session = createSession(
    newUser,
    req.headers['user-agent'] || 'Web Browser',
    req.ip || '127.0.0.1'
  );

  logAuditEvent({
    actorId: userId,
    actorRole: newUser.role,
    action: isDealer ? 'DEALER_REGISTRATION' : 'USER_LOGIN',
    resourceType: 'user',
    resourceId: userId,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
    metadata: { companyName, isDealer },
  });

  res.status(201).json({
    success: true,
    token: session.token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      status: newUser.status,
      dealerId: newUser.dealerId,
      dealerStaffRole: newUser.dealerStaffRole,
      linkedIdentities: newUser.linkedIdentities,
    },
    session: {
      id: session.id,
      expiresAt: session.expiresAt,
      device: session.device,
    },
  });
});

// 2. User Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'Email and password required.' });
  }

  let user: UserAccount | undefined;
  for (const u of usersStore.values()) {
    if (u.email.toLowerCase() === email.toLowerCase()) {
      user = u;
      break;
    }
  }

  if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
    logAuditEvent({
      action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      resourceType: 'auth_login',
      ipAddress: req.ip || '127.0.0.1',
      status: 'DENIED',
      metadata: { attemptedEmail: email },
    });

    return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
  }

  if (user.status === 'SUSPENDED' || user.status === 'DISABLED') {
    logAuditEvent({
      actorId: user.id,
      actorRole: user.role,
      action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      resourceType: 'suspended_account_login',
      ipAddress: req.ip || '127.0.0.1',
      status: 'DENIED',
      metadata: { status: user.status },
    });

    return res.status(403).json({
      error: 'ACCOUNT_SUSPENDED',
      message: `Your account is ${user.status}. Contact IQAutoMarket support.`,
    });
  }

  const session = createSession(
    user,
    req.headers['user-agent'] || 'Web Browser',
    req.ip || '127.0.0.1'
  );

  logAuditEvent({
    actorId: user.id,
    actorRole: user.role,
    action: 'USER_LOGIN',
    resourceType: 'user',
    resourceId: user.id,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({
    success: true,
    token: session.token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      adminSubRole: user.adminSubRole,
      status: user.status,
      dealerId: user.dealerId,
      dealerStaffRole: user.dealerStaffRole,
      linkedIdentities: user.linkedIdentities,
    },
    session: {
      id: session.id,
      expiresAt: session.expiresAt,
      device: session.device,
    },
  });
});

// 3. WhatsApp OTP Generation & Dispatch
router.post('/whatsapp/otp-request', (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'PHONE_REQUIRED', message: 'Valid phone number required.' });
  }

  const cleanPhone = phone.replace(/[\s-]/g, '');
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  otpChallengeStore.set(cleanPhone, {
    code: otpCode,
    phone: cleanPhone,
    expiresAt,
    attempts: 0,
  });

  // Note: In production this dispatches through WhatsApp Cloud API webhook
  console.log(`📲 [WhatsApp OTP Gateway] Dispatched OTP [${otpCode}] to ${cleanPhone}`);

  res.json({
    success: true,
    message: `OTP sent via WhatsApp to ${cleanPhone}. (Sandbox code: ${otpCode})`,
    expiresInSeconds: 300,
  });
});

// 4. WhatsApp OTP Verification & Account Linking
router.post('/whatsapp/otp-verify', (req, res) => {
  const { phone, code, userId } = req.body;
  const cleanPhone = (phone || '').replace(/[\s-]/g, '');
  const challenge = otpChallengeStore.get(cleanPhone);

  if (!challenge) {
    return res.status(400).json({ error: 'OTP_NOT_FOUND', message: 'No active OTP request for this phone number.' });
  }

  if (Date.now() > challenge.expiresAt) {
    otpChallengeStore.delete(cleanPhone);
    return res.status(400).json({ error: 'OTP_EXPIRED', message: 'OTP has expired. Please request a new code.' });
  }

  challenge.attempts++;
  if (challenge.attempts > 3) {
    otpChallengeStore.delete(cleanPhone);
    return res.status(429).json({ error: 'TOO_MANY_ATTEMPTS', message: 'Maximum OTP verification attempts exceeded.' });
  }

  if (challenge.code !== code) {
    return res.status(400).json({ error: 'INVALID_OTP', message: 'Incorrect OTP code.' });
  }

  // OTP is verified
  otpChallengeStore.delete(cleanPhone);

  // If linking to an existing authenticated user
  if (userId && usersStore.has(userId)) {
    const user = usersStore.get(userId)!;
    const exists = user.linkedIdentities.some((id) => id.provider === 'whatsapp' && id.providerId === cleanPhone);
    if (!exists) {
      user.linkedIdentities.push({
        provider: 'whatsapp',
        providerId: cleanPhone,
        verifiedAt: new Date().toISOString(),
      });
      user.phone = cleanPhone;
    }

    logAuditEvent({
      actorId: user.id,
      actorRole: user.role,
      action: 'USER_LOGIN',
      resourceType: 'identity_link',
      resourceId: cleanPhone,
      ipAddress: req.ip || '127.0.0.1',
      status: 'SUCCESS',
      metadata: { provider: 'whatsapp' },
    });

    return res.json({
      success: true,
      message: 'WhatsApp phone verified and linked to account.',
      user,
    });
  }

  res.json({
    success: true,
    verifiedPhone: cleanPhone,
    message: 'WhatsApp phone verified successfully.',
  });
});

// 5. Account Linking (Google / Apple / Facebook)
router.post('/oauth/link', requireAuth, (req: AuthenticatedRequest, res) => {
  const { provider, providerId, email } = req.body;
  if (!provider || !providerId) {
    return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'Provider and providerId required.' });
  }

  const user = req.user!;
  const existing = user.linkedIdentities.find((id) => id.provider === provider && id.providerId === providerId);

  if (!existing) {
    user.linkedIdentities.push({
      provider,
      providerId,
      verifiedAt: new Date().toISOString(),
    });
  }

  logAuditEvent({
    actorId: user.id,
    actorRole: user.role,
    action: 'USER_LOGIN',
    resourceType: 'oauth_identity_link',
    resourceId: providerId,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
    metadata: { provider, email },
  });

  res.json({
    success: true,
    message: `Account successfully linked with ${provider}.`,
    linkedIdentities: user.linkedIdentities,
  });
});

// 6. Current User Profile (/api/auth/me)
router.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      adminSubRole: user.adminSubRole,
      status: user.status,
      dealerId: user.dealerId,
      dealerStaffRole: user.dealerStaffRole,
      linkedIdentities: user.linkedIdentities,
      createdAt: user.createdAt,
    },
    session: {
      id: req.session!.id,
      device: req.session!.device,
      lastActiveAt: req.session!.lastActiveAt,
    },
  });
});

// 7. Session Device Management (/api/auth/sessions)
router.get('/sessions', requireAuth, (req: AuthenticatedRequest, res) => {
  const activeSessions = Array.from(sessionsStore.values())
    .filter((s) => s.userId === req.user!.id && !s.isRevoked && new Date(s.expiresAt).getTime() > Date.now())
    .map((s) => ({
      id: s.id,
      device: s.device,
      ipAddress: s.ipAddress,
      createdAt: s.createdAt,
      lastActiveAt: s.lastActiveAt,
      isCurrent: s.id === req.session!.id,
    }));

  res.json({ success: true, sessions: activeSessions });
});

// 8. Revoke Specific Session
router.post('/sessions/revoke', requireAuth, (req: AuthenticatedRequest, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: 'SESSION_ID_REQUIRED' });
  }

  // Ensure target session belongs to authenticated user
  const target = Array.from(sessionsStore.values()).find((s) => s.id === sessionId && s.userId === req.user!.id);
  if (!target) {
    return res.status(404).json({ error: 'SESSION_NOT_FOUND', message: 'Session does not belong to you or does not exist.' });
  }

  target.isRevoked = true;

  logAuditEvent({
    actorId: req.user!.id,
    actorRole: req.user!.role,
    action: 'SESSION_REVOCATION',
    resourceType: 'session',
    resourceId: sessionId,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({ success: true, message: `Session ${sessionId} has been revoked.` });
});

// 9. Revoke All Other Sessions
router.post('/sessions/revoke-all', requireAuth, (req: AuthenticatedRequest, res) => {
  const count = revokeAllSessions(req.user!.id, req.session!.id);

  logAuditEvent({
    actorId: req.user!.id,
    actorRole: req.user!.role,
    action: 'SESSION_REVOCATION',
    resourceType: 'session_all',
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
    metadata: { revokedCount: count },
  });

  res.json({ success: true, revokedCount: count, message: `${count} other active device sessions have been revoked.` });
});

// 10. Logout Current Session
router.post('/logout', requireAuth, (req: AuthenticatedRequest, res) => {
  req.session!.isRevoked = true;

  logAuditEvent({
    actorId: req.user!.id,
    actorRole: req.user!.role,
    action: 'USER_LOGOUT',
    resourceType: 'session',
    resourceId: req.session!.id,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({ success: true, message: 'Logged out successfully.' });
});

export default router;
