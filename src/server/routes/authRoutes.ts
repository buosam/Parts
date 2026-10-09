/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket Auth API Routes - Multi-Method, WhatsApp OTP, Sessions, Password Recovery
 */

import express from 'express';
import crypto from 'node:crypto';
import {
  usersStore,
  sessionsStore,
  otpChallengeStore,
  passwordResetsStore,
  hashPassword,
  verifyPassword,
  createSession,
  revokeSession,
  revokeAllSessions,
  UserAccount,
  UserRole,
} from '../security/auth';
import { requireAuth, AuthenticatedRequest } from '../security/rbac';
import { logAuditEvent } from '../security/audit';

const router = express.Router();

// Helper to format clean user profile for client responses
function sanitizeUserResponse(user: UserAccount) {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    role: user.role,
    adminSubRole: user.adminSubRole,
    dealerId: user.dealerId,
    dealerStaffRole: user.dealerStaffRole,
    companyName: user.companyName,
    city: user.city,
    address: user.address,
    businessType: user.businessType,
    avatarUrl: user.avatarUrl,
    status: user.status,
    linkedIdentities: user.linkedIdentities,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// 1. User Registration (Buyer, Dealer, or Workshop)
router.post('/register', (req, res) => {
  const { email, password, name, phone, role = 'customer', companyName, city, address, businessType } = req.body;

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

  if (password.length < 6) {
    return res.status(400).json({ error: 'WEAK_PASSWORD', message: 'Password must be at least 6 characters long.' });
  }

  // Check duplicate email
  for (const u of usersStore.values()) {
    if (u.email.toLowerCase() === email.toLowerCase()) {
      return res.status(409).json({ error: 'EMAIL_EXISTS', message: 'An account with this email already exists.' });
    }
  }

  const validRole: UserRole = role === 'supplier' ? 'supplier' : role === 'workshop' ? 'workshop' : 'customer';
  const userId = `usr_${crypto.randomBytes(8).toString('hex')}`;
  const { hash, salt } = hashPassword(password);
  const isDealer = validRole === 'supplier';
  const dealerId = isDealer ? `dlr_${crypto.randomBytes(8).toString('hex')}` : undefined;

  const newUser: UserAccount = {
    id: userId,
    email: email.toLowerCase(),
    phone,
    name,
    passwordHash: hash,
    salt,
    role: validRole,
    dealerId,
    dealerStaffRole: isDealer ? 'owner' : undefined,
    companyName: companyName || (isDealer ? name : undefined),
    city: city || 'Baghdad',
    address,
    businessType,
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    status: isDealer ? 'PENDING_VERIFICATION' : 'ACTIVE',
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
    metadata: { companyName, role: validRole },
  });

  res.status(201).json({
    success: true,
    token: session.token,
    user: sanitizeUserResponse(newUser),
    session: {
      id: session.id,
      expiresAt: session.expiresAt,
      device: session.device,
    },
  });
});

// 2. User Login (Email or Phone + Password)
router.post('/login', (req, res) => {
  const { email, phone, password, role } = req.body;

  const identifier = (email || phone || '').trim().toLowerCase();

  if (!identifier || !password) {
    return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'Email/phone and password required.' });
  }

  let user: UserAccount | undefined;
  for (const u of usersStore.values()) {
    if (
      u.email.toLowerCase() === identifier ||
      (u.phone && u.phone.replace(/[\s-]/g, '') === identifier.replace(/[\s-]/g, ''))
    ) {
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
      metadata: { attemptedIdentifier: identifier },
    });

    return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email/phone or password.' });
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
      message: `Your account is currently ${user.status}. Please contact IQAutoMarket support.`,
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
    user: sanitizeUserResponse(user),
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

  console.log(`📲 [WhatsApp OTP Gateway] Dispatched OTP [${otpCode}] to ${cleanPhone}`);

  res.json({
    success: true,
    message: `OTP sent via WhatsApp to ${cleanPhone}. (Sandbox code: ${otpCode})`,
    sandboxCode: otpCode,
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
  if (challenge.attempts > 4) {
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
      user: sanitizeUserResponse(user),
    });
  }

  res.json({
    success: true,
    verifiedPhone: cleanPhone,
    message: 'WhatsApp phone verified successfully.',
  });
});

// 5. WhatsApp OTP Direct Login / Sign-in Flow
router.post('/whatsapp/otp-login', (req, res) => {
  const { phone, code, role = 'customer' } = req.body;
  const cleanPhone = (phone || '').replace(/[\s-]/g, '');
  const challenge = otpChallengeStore.get(cleanPhone);

  if (!challenge) {
    return res.status(400).json({ error: 'OTP_NOT_FOUND', message: 'No active OTP request. Please request a code first.' });
  }

  if (Date.now() > challenge.expiresAt) {
    otpChallengeStore.delete(cleanPhone);
    return res.status(400).json({ error: 'OTP_EXPIRED', message: 'OTP has expired. Please request a new code.' });
  }

  challenge.attempts++;
  if (challenge.attempts > 4) {
    otpChallengeStore.delete(cleanPhone);
    return res.status(429).json({ error: 'TOO_MANY_ATTEMPTS', message: 'Maximum OTP verification attempts exceeded.' });
  }

  if (challenge.code !== code) {
    return res.status(400).json({ error: 'INVALID_OTP', message: 'Incorrect OTP code.' });
  }

  // OTP is verified
  otpChallengeStore.delete(cleanPhone);

  // Look up user by phone or linked identities
  let user: UserAccount | undefined;
  for (const u of usersStore.values()) {
    if (
      (u.phone && u.phone.replace(/[\s-]/g, '') === cleanPhone) ||
      u.linkedIdentities.some((id) => id.provider === 'whatsapp' && id.providerId.replace(/[\s-]/g, '') === cleanPhone)
    ) {
      user = u;
      break;
    }
  }

  // If user doesn't exist yet, auto-provision a buyer account!
  if (!user) {
    const userId = `usr_${crypto.randomBytes(8).toString('hex')}`;
    const randomPassword = crypto.randomBytes(12).toString('hex');
    const { hash, salt } = hashPassword(randomPassword);

    user = {
      id: userId,
      email: `user_${cleanPhone.slice(-6)}@iqautomarket.iq`,
      phone: cleanPhone,
      name: `User ${cleanPhone.slice(-4)}`,
      passwordHash: hash,
      salt,
      role: role === 'supplier' || role === 'workshop' ? role : 'customer',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      linkedIdentities: [
        { provider: 'whatsapp', providerId: cleanPhone, verifiedAt: new Date().toISOString() },
        { provider: 'phone', providerId: cleanPhone, verifiedAt: new Date().toISOString() },
      ],
    };

    usersStore.set(userId, user);
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
    resourceType: 'whatsapp_otp_login',
    resourceId: cleanPhone,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({
    success: true,
    token: session.token,
    user: sanitizeUserResponse(user),
    session: {
      id: session.id,
      expiresAt: session.expiresAt,
      device: session.device,
    },
  });
});

// 6. Forgot Password (Request Password Reset Token / OTP)
router.post('/forgot-password', (req, res) => {
  const { email, phone } = req.body;
  const identifier = (email || phone || '').trim().toLowerCase();

  if (!identifier) {
    return res.status(400).json({ error: 'IDENTIFIER_REQUIRED', message: 'Email or phone number is required.' });
  }

  let user: UserAccount | undefined;
  for (const u of usersStore.values()) {
    if (
      u.email.toLowerCase() === identifier ||
      (u.phone && u.phone.replace(/[\s-]/g, '') === identifier.replace(/[\s-]/g, ''))
    ) {
      user = u;
      break;
    }
  }

  if (!user) {
    // For privacy, return generic success even if user not found
    return res.json({
      success: true,
      message: 'If an account exists with this detail, a password reset code has been sent.',
    });
  }

  const resetId = `rst_${crypto.randomBytes(8).toString('hex')}`;
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

  passwordResetsStore.set(resetId, {
    id: resetId,
    userId: user.id,
    code,
    expiresAt,
    used: false,
  });

  console.log(`🔑 [Password Reset] Issued reset code [${code}] for user ${user.email} (${user.id})`);

  res.json({
    success: true,
    resetId,
    sandboxCode: code,
    message: `Password reset code generated. (Sandbox code: ${code})`,
    expiresInSeconds: 900,
  });
});

// 7. Reset Password (Verify code and update password)
router.post('/reset-password', (req, res) => {
  const { resetId, code, newPassword, email, phone } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'INVALID_PASSWORD', message: 'New password must be at least 6 characters.' });
  }

  let challenge = resetId ? passwordResetsStore.get(resetId) : undefined;

  // Fallback: search by code and matching user if resetId not provided
  if (!challenge && code) {
    for (const c of passwordResetsStore.values()) {
      if (c.code === code && !c.used && c.expiresAt > Date.now()) {
        const u = usersStore.get(c.userId);
        if (
          u &&
          (!email || u.email.toLowerCase() === email.toLowerCase()) &&
          (!phone || (u.phone && u.phone.replace(/[\s-]/g, '') === phone.replace(/[\s-]/g, '')))
        ) {
          challenge = c;
          break;
        }
      }
    }
  }

  if (!challenge || challenge.used || Date.now() > challenge.expiresAt || challenge.code !== code) {
    return res.status(400).json({ error: 'INVALID_OR_EXPIRED_RESET_CODE', message: 'Invalid or expired password reset code.' });
  }

  challenge.used = true;
  const user = usersStore.get(challenge.userId);
  if (!user) {
    return res.status(404).json({ error: 'USER_NOT_FOUND' });
  }

  const { hash, salt } = hashPassword(newPassword);
  user.passwordHash = hash;
  user.salt = salt;
  user.updatedAt = new Date().toISOString();

  // Revoke all existing sessions for security
  revokeAllSessions(user.id);

  // Issue new fresh session
  const newSession = createSession(
    user,
    req.headers['user-agent'] || 'Web Browser',
    req.ip || '127.0.0.1'
  );

  logAuditEvent({
    actorId: user.id,
    actorRole: user.role,
    action: 'PASSWORD_CHANGE',
    resourceType: 'user_password_reset',
    resourceId: user.id,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({
    success: true,
    message: 'Password reset successfully. You are now logged in with your new password.',
    token: newSession.token,
    user: sanitizeUserResponse(user),
  });
});

// 8. Account Linking (Google / Apple / Facebook)
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

// 9. Current User Profile (/api/auth/me)
router.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  res.json({
    success: true,
    user: sanitizeUserResponse(user),
    session: {
      id: req.session!.id,
      device: req.session!.device,
      lastActiveAt: req.session!.lastActiveAt,
    },
  });
});

// 10. Update Profile (/api/auth/profile)
router.patch('/profile', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { name, phone, city, address, companyName, businessType, avatarUrl } = req.body;

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (city) user.city = city;
  if (address !== undefined) user.address = address;
  if (companyName !== undefined) user.companyName = companyName;
  if (businessType !== undefined) user.businessType = businessType;
  if (avatarUrl) user.avatarUrl = avatarUrl;
  user.updatedAt = new Date().toISOString();

  logAuditEvent({
    actorId: user.id,
    actorRole: user.role,
    action: 'USER_LOGIN',
    resourceType: 'user_profile_update',
    resourceId: user.id,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({
    success: true,
    message: 'Profile updated successfully.',
    user: sanitizeUserResponse(user),
  });
});

// 11. Change Password (/api/auth/change-password)
router.post('/change-password', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'Current password and new password required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'WEAK_PASSWORD', message: 'New password must be at least 6 characters.' });
  }

  if (!verifyPassword(currentPassword, user.passwordHash, user.salt)) {
    return res.status(401).json({ error: 'INVALID_CURRENT_PASSWORD', message: 'Current password does not match.' });
  }

  const { hash, salt } = hashPassword(newPassword);
  user.passwordHash = hash;
  user.salt = salt;
  user.updatedAt = new Date().toISOString();

  logAuditEvent({
    actorId: user.id,
    actorRole: user.role,
    action: 'PASSWORD_CHANGE',
    resourceType: 'user_password_change',
    resourceId: user.id,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
  });

  res.json({
    success: true,
    message: 'Password changed successfully.',
  });
});

// 12. Session Device Management (/api/auth/sessions)
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

// 13. Revoke Specific Session
router.post('/sessions/revoke', requireAuth, (req: AuthenticatedRequest, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: 'SESSION_ID_REQUIRED' });
  }

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

// 14. Revoke All Other Sessions
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

// 15. Logout Current Session
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
