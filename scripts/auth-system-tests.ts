/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket Complete Authentication & User System Integration Test Suite
 */

import http from 'node:http';
import express from 'express';
import authRoutes from '../src/server/routes/authRoutes';
import { usersStore, sessionsStore, otpChallengeStore, seedDefaultAccounts } from '../src/server/security/auth';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

const TEST_PORT = 3198;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;
let server: http.Server;

async function request(path: string, options: { method?: string; body?: any; token?: string } = {}) {
  const { method = 'GET', body, token } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runAuthTests() {
  console.log('\n=============================================================');
  console.log('🔐 IQAutoMarket Authentication & User System Test Matrix');
  console.log('=============================================================\n');

  seedDefaultAccounts();

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, title: string) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${title}`);
    }
  }

  // 1. User Registration (Buyer)
  const buyerReg = await request('/api/auth/register', {
    method: 'POST',
    body: {
      name: 'Karrar Al-Baghdadi',
      email: 'karrar@testmail.iq',
      phone: '+9647701112233',
      password: 'mypassword123',
      role: 'customer',
      city: 'Baghdad',
    },
  });
  assert(buyerReg.status === 201 && buyerReg.data.success && buyerReg.data.user.role === 'customer', 'Register new Buyer account');
  const buyerToken = buyerReg.data.token;

  // 2. User Registration (Supplier/Dealer)
  const dealerReg = await request('/api/auth/register', {
    method: 'POST',
    body: {
      name: 'Saad Auto Imports',
      email: 'saad@testparts.iq',
      phone: '+9647802223344',
      password: 'dealerpassword123',
      role: 'supplier',
      companyName: 'Saad Genuine Parts LLC',
      city: 'Basra',
      businessType: 'Authorized Distributor',
    },
  });
  assert(dealerReg.status === 201 && dealerReg.data.user.role === 'supplier' && dealerReg.data.user.dealerId !== undefined, 'Register new Dealer/Supplier account');

  // 3. User Registration (Workshop/Garage)
  const workshopReg = await request('/api/auth/register', {
    method: 'POST',
    body: {
      name: 'Al-Noor Garage',
      email: 'alnoor@testgarage.iq',
      phone: '+9647503334455',
      password: 'workshoppassword123',
      role: 'workshop',
      companyName: 'Al-Noor Master Repair Center',
      city: 'Erbil',
      businessType: 'Specialized Garage',
    },
  });
  assert(workshopReg.status === 201 && workshopReg.data.user.role === 'workshop', 'Register new Workshop account');

  // 4. Block Duplicate Email
  const dupEmail = await request('/api/auth/register', {
    method: 'POST',
    body: {
      name: 'Clone Account',
      email: 'karrar@testmail.iq',
      password: 'password123',
      role: 'customer',
    },
  });
  assert(dupEmail.status === 409, 'Reject duplicate email registration with HTTP 409');

  // 5. User Login with Email & Password
  const loginRes = await request('/api/auth/login', {
    method: 'POST',
    body: {
      email: 'karrar@testmail.iq',
      password: 'mypassword123',
    },
  });
  assert(loginRes.status === 200 && loginRes.data.success && loginRes.data.user.name === 'Karrar Al-Baghdadi', 'Sign in with email and password');

  // 6. User Login with Phone Number & Password
  const loginPhone = await request('/api/auth/login', {
    method: 'POST',
    body: {
      phone: '+9647701112233',
      password: 'mypassword123',
    },
  });
  assert(loginPhone.status === 200 && loginPhone.data.success, 'Sign in with phone number and password');

  // 7. Reject Invalid Password
  const badPass = await request('/api/auth/login', {
    method: 'POST',
    body: {
      email: 'karrar@testmail.iq',
      password: 'wrong_password_attempt',
    },
  });
  assert(badPass.status === 401, 'Reject invalid password with HTTP 401');

  // 8. WhatsApp OTP Dispatch
  const otpReq = await request('/api/auth/whatsapp/otp-request', {
    method: 'POST',
    body: { phone: '+9647709876543' },
  });
  assert(otpReq.status === 200 && otpReq.data.sandboxCode !== undefined, 'Request WhatsApp OTP login code');
  const sandboxOtp = otpReq.data.sandboxCode;

  // 9. WhatsApp OTP Direct Login
  const otpLogin = await request('/api/auth/whatsapp/otp-login', {
    method: 'POST',
    body: {
      phone: '+9647709876543',
      code: sandboxOtp,
    },
  });
  assert(otpLogin.status === 200 && otpLogin.data.success && otpLogin.data.token !== undefined, 'WhatsApp OTP direct login & auto-provisioning');

  // 10. Forgot Password & Reset Password Flow
  const forgotReq = await request('/api/auth/forgot-password', {
    method: 'POST',
    body: { email: 'karrar@testmail.iq' },
  });
  assert(forgotReq.status === 200 && forgotReq.data.sandboxCode !== undefined, 'Request password reset code');
  const resetCode = forgotReq.data.sandboxCode;

  const resetReq = await request('/api/auth/reset-password', {
    method: 'POST',
    body: {
      email: 'karrar@testmail.iq',
      code: resetCode,
      newPassword: 'brandNewPassword999',
    },
  });
  assert(resetReq.status === 200 && resetReq.data.success, 'Reset password with verification code');

  // Verify login with new password
  const newPassLogin = await request('/api/auth/login', {
    method: 'POST',
    body: {
      email: 'karrar@testmail.iq',
      password: 'brandNewPassword999',
    },
  });
  assert(newPassLogin.status === 200 && newPassLogin.data.success, 'Sign in with newly updated password');
  const freshToken = newPassLogin.data.token;

  // 11. Current User Profile (/api/auth/me)
  const meReq = await request('/api/auth/me', { token: freshToken });
  assert(meReq.status === 200 && meReq.data.user.email === 'karrar@testmail.iq', 'Fetch current user via /api/auth/me');

  // 12. Update User Profile (/api/auth/profile)
  const updateReq = await request('/api/auth/profile', {
    method: 'PATCH',
    token: freshToken,
    body: {
      name: 'Karrar Al-Baghdadi (Updated)',
      city: 'Najaf',
    },
  });
  assert(updateReq.status === 200 && updateReq.data.user.name === 'Karrar Al-Baghdadi (Updated)', 'Update user profile');

  // 13. Change Password (/api/auth/change-password)
  const changeReq = await request('/api/auth/change-password', {
    method: 'POST',
    token: freshToken,
    body: {
      currentPassword: 'brandNewPassword999',
      newPassword: 'finalPassword777',
    },
  });
  assert(changeReq.status === 200 && changeReq.data.success, 'Change password with current password verification');

  // 14. Session Device Management
  const sessionsReq = await request('/api/auth/sessions', { token: freshToken });
  assert(sessionsReq.status === 200 && sessionsReq.data.sessions.length > 0, 'List user active device sessions');

  // 15. User Logout
  const logoutReq = await request('/api/auth/logout', { method: 'POST', token: freshToken });
  assert(logoutReq.status === 200 && logoutReq.data.success, 'Logout user session');

  // 16. Verify Revoked Session Cannot Access /me
  const afterLogout = await request('/api/auth/me', { token: freshToken });
  assert(afterLogout.status === 401, 'Revoked session cannot access protected endpoints (401 Unauthorized)');

  console.log('\n-------------------------------------------------------------');
  console.log(`Auth System Test Summary: ${passed} Passed, ${total - passed} Failed out of ${total} tests.`);
  console.log('-------------------------------------------------------------\n');

  server.close();
  if (passed === total) {
    console.log('🎉 ALL AUTHENTICATION SYSTEM TESTS PASSED SUCCESSFULLY!\n');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

server = app.listen(TEST_PORT, () => {
  runAuthTests().catch((err) => {
    console.error('Test execution error:', err);
    server.close();
    process.exit(1);
  });
});
