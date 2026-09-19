# IQAutoMarket — Full Production Architecture, RBAC & Security System Walkthrough

## Summary of Accomplishments

**IQAutoMarket** has been upgraded to a production-grade, multi-role automotive spare-parts marketplace for Iraq with strict zero-trust security boundaries, real authentication, server-enforced RBAC, and object-level authorization (anti-IDOR).

The implementation strictly honors the foundational principle:
> **“Make the experience simple for the user, not simple by weakening the architecture.”**

---

## 1. Security Architecture & Zero-Trust RBAC

### Server-Enforced RBAC & Anti-IDOR Boundary
All protected endpoints verify:
$$\text{Authenticated} + \text{Role Check} + \text{Permission Check} + \text{Organization Scoping} + \text{Resource Ownership}$$

- **`src/server/security/auth.ts`**:
  - Secure password hashing with PBKDF2/scrypt (100,000 rounds, SHA-512).
  - Session generation, signed tokens (`iqm_...`), and active device tracking (device name, IP address, login time, last active).
  - Instant session revocation (`/api/auth/sessions/revoke`, `/api/auth/sessions/revoke-all`).
  - Real-time account status checks (`ACTIVE`, `PENDING_VERIFICATION`, `SUSPENDED`). Suspended accounts and revoked tokens fail immediately on the server with `401/403`.
  - Account linking (Email, WhatsApp OTP, Phone, Google OAuth) linked to a single unified `user_id`.
  - Role escalation defense: rejects any user attempt to register or elevate to `admin`.

- **`src/server/security/rbac.ts`**:
  - `requireAuth`: Session token verification and account status enforcement.
  - `requireRole(...allowedRoles)`: Returns `403 Forbidden` if role is not authorized.
  - `enforceDealerScope`: Extracts `dealer_id` strictly from the authenticated session (`WHERE dealer_id = session.dealer_id`). Blocks Dealer A from querying or mutating Dealer B's resources with `403 Forbidden`.
  - `requireDealerPermission(staffPermission)`: Granular staff-level checks (`owner`, `manager`, `sales`, `inventory`, `finance`). Financial data and integration secrets are restricted from inventory staff.
  - `checkObjectOwnership`: Prevents IDOR on orders, garage vehicles, part requests, and private documents.

- **`src/server/security/audit.ts`**:
  - Immutable audit trail capturing: Actor ID, Role, Action (`USER_LOGIN`, `DEALER_APPROVAL`, `DEALER_SUSPEND`, `INVENTORY_MUTATION`, `PRICE_UPDATE`, `DOCUMENT_ACCESS`, `ROLE_CHANGE`, `PRIVILEGE_ESCALATION_BLOCKED`), IP address, User-Agent, Status (`SUCCESS`/`DENIED`), and non-sensitive metadata.

---

## 2. API Endpoints & Modular Controllers

| Router | Base Path | Key Capabilities |
| :--- | :--- | :--- |
| **`authRoutes`** | `/api/auth` | `/register`, `/login`, `/whatsapp/otp-request`, `/whatsapp/otp-verify`, `/oauth/link`, `/me`, `/sessions`, `/sessions/revoke`, `/sessions/revoke-all`, `/logout`. |
| **`buyerRoutes`** | `/api/buyer` | `/garage`, `/vehicle-document/upload` (Sanawia OCR with privacy vault), `/requests` (reverse marketplace), `/orders` (IDOR-protected order history). |
| **`dealerRoutes`** | `/api/dealer` | `/inventory` (org-scoped), `/products`, `/inventory/:id` (price/stock updates), `/requests` (inbound RFQs), `/requests/:id/offers` (bidding), `/orders`, `/team` (staff RBAC), `/integrations`. |
| **`adminRoutes`** | `/api/admin` | `/overview` (GMV, fulfillment), `/dealers` (verification queue), `/dealers/:id/verify`, `/dealers/:id/suspend`, `/users` (status toggle), `/audit-logs` (immutable trail), `/commercial/plans`. |
| **`documentRoutes`** | `/api/vehicle-documents` | `/:docId` (Strict vehicle registration document privacy — dealers are permanently blocked with `403 Forbidden`; signed 60s temporary URL for authorized buyers/admin compliance). |

---

## 3. UI/UX & Portal Separation

- **`AppNavbar.tsx`**: Replaced legacy client-side role toggles with role-conscious, clean navigation. Direct access to "My Garage", "My Requests", "Orders", Cart, and Profile. Profile menu exposes "Active Sessions & Security" and authenticated portal switchers.
- **`ActiveSessionsModal.tsx`**: Displays active devices, IP addresses, and login times, with 1-click "Revoke Device" and "Sign Out All Other Devices".
- **`SanawiaDocOcrModal.tsx`**:
  - Document Privacy Guarantee notice: *"Your registration document is encrypted at rest and will NEVER be disclosed to dealers. Only the extracted vehicle specification is used for part fitment."*
  - AI extraction of Make, Model, Year, Engine, Trim, and masked VIN.
  - Progressive disclosure: Displays **[Confirm & Use Vehicle]** and **[Edit]** buttons before committing to the garage.
- **`ReverseMarketplaceComparison.tsx`**: Clean, side-by-side transparent matrix comparing Price ($ USD & IQD), Condition, Warranty, Delivery estimate, Dealer rating, and Stock availability, with single dominant CTA: **[Choose Offer]**.
- **`SupplierPortal.tsx`**: Added staff role switcher (`owner`, `manager`, `sales`, `inventory`, `finance`) with automatic masking of financial reports and API credentials for inventory staff.
- **`AdminDashboard.tsx`**: Added Admin Role Hierarchy badge, 1-click Dealer Verification Queue, User Moderation table, and live Immutable Audit Log explorer.
- **`App.tsx`**: Integrated boundary guards: Unauthorized users attempting to access `/admin` or `/dealer` receive a clear `403 Forbidden` screen with redirect.

---

## 4. Automated Security Acceptance Test Results

All **22 test cases** from Master Prompt Section 66 & 67 passed with 100% success:

```bash
> npm run test:security

🔒 Initialized 6 default security accounts with verified credential hashes.

=============================================================
🛡️  IQAutoMarket Full Authorization & RBAC Acceptance Matrix
=============================================================

  ✅ [PASS] Buyer calling GET /api/admin/users -> HTTP 403 (Expected 403)
  ✅ [PASS] Buyer calling GET /api/admin/dealers -> HTTP 403 (Expected 403)
  ✅ [PASS] Buyer calling GET /api/admin/audit-logs -> HTTP 403 (Expected 403)
  ✅ [PASS] Buyer calling GET /api/dealer/inventory -> HTTP 403 (Expected 403)
  ✅ [PASS] Buyer calling POST /api/dealer/products -> HTTP 403 (Expected 403)
  ✅ [PASS] Buyer calling POST /api/admin/dealers/dlr_mansour_01/verify -> HTTP 403 (Expected 403)
  ✅ [PASS] Buyer calling PATCH /api/users/usr_dealer_a (IDOR Profile Attack) -> HTTP 403 (Expected 403)
  ✅ [PASS] Buyer calling GET /api/vehicle-documents/doc_sanawia_991 for another user -> HTTP 403 (Expected 403)
  ✅ [PASS] Dealer A calling GET /api/dealers/dlr_erbil_02/inventory (Cross-Dealer Inventory) -> HTTP 403 (Expected 403)
  ✅ [PASS] Dealer A calling GET /api/dealers/dlr_erbil_02/orders (Cross-Dealer Orders) -> HTTP 403 (Expected 403)
  ✅ [PASS] Dealer A calling GET /api/dealers/dlr_erbil_02/customers (Cross-Dealer Customer Lists) -> HTTP 403 (Expected 403)
  ✅ [PASS] Dealer A calling GET /api/admin/users -> HTTP 403 (Expected 403)
  ✅ [PASS] Dealer A calling GET /api/admin/audit-logs -> HTTP 403 (Expected 403)
  ✅ [PASS] Dealer A attempting to view private Sanawia document (Document Privacy Rule) -> HTTP 403 (Expected 403)
  ✅ [PASS] Public Signup attempting to escalate role to admin -> HTTP 403 (Expected 403)
  ✅ [PASS] Buyer attempting self-elevation via PATCH /api/users/usr_buyer_01 -> HTTP 403 (Expected 403)
  ✅ [PASS] Suspended Account attempting authenticated access -> HTTP 401 (Expected 401)
  ✅ [PASS] Revoked Session attempting access -> HTTP 401 (Expected 401)
  ✅ [PASS] Admin authorized access: GET /api/admin/overview -> HTTP 200 (Expected 200)
  ✅ [PASS] Admin authorized access: GET /api/admin/audit-logs -> HTTP 200 (Expected 200)
  ✅ [PASS] Dealer A authorized access to own inventory: GET /api/dealer/inventory -> HTTP 200 (Expected 200)
  ✅ [PASS] Buyer authorized access to own garage: GET /api/buyer/garage -> HTTP 200 (Expected 200)

-------------------------------------------------------------
Acceptance Test Summary: 22 Passed, 0 Failed out of 22 tests.
-------------------------------------------------------------
🏆 ALL RBAC & SECURITY ACCEPTANCE TESTS COMPLETED SUCCESSFULLY!
```

---

## 5. Build & Deployment Verification

- **TypeScript Lint**: `npm run lint` exited code `0` (0 type errors).
- **Production Build**: `npm run build` exited code `0`:
  - Vite client compiled in 1.49s (1,702 modules transformed).
  - Node backend bundled into `dist/server.cjs` via esbuild in 7ms.
  - Ready for immediate deployment on Railway via existing `Dockerfile` and `railway.json`.
