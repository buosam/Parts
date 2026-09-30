# Security Architecture Patterns & Modern Best Practices

Comprehensive engineering patterns for senior security architects, application security engineers, and tech leads.

---

## 1. Zero-Trust API Boundary Architecture

Modern security models assume the network perimeter is compromised. Every incoming request must establish identity, authorization, and tenant isolation at the application layer.

### The Five-Layer Boundary Check
Every protected API endpoint must verify the full verification chain:

$$\text{Authenticated Session} \implies \text{Account Status Check} \implies \text{Role Validation} \implies \text{Staff Permission Check} \implies \text{Object Ownership Scope}$$

```text
Incoming HTTP Request
       │
       ▼
[ Layer 1: Session Verification ]  ──► Expired/Revoked? ──► HTTP 401 Unauthorized
       │
       ▼
[ Layer 2: Account Health Check ]  ──► Suspended/Pending? ──► HTTP 401 / 403
       │
       ▼
[ Layer 3: Role-Based Guard (RBAC) ] ─► Insufficient Role? ──► HTTP 403 Forbidden
       │
       ▼
[ Layer 4: Multi-Tenant Scoping ]  ──► Cross-Tenant IDOR? ──► HTTP 403 Forbidden
       │
       ▼
[ Layer 5: Object Ownership Check ] ──► Not Record Owner? ─► HTTP 403 Forbidden
       │
       ▼
[ Business Execution & Audit Log ]
```

---

## 2. Anti-IDOR & Multi-Tenant Scoping Patterns

Insecure Direct Object Reference (IDOR) occurs when an application exposes a reference to an internal object (e.g. database ID) without verifying that the requesting user owns that object.

### Anti-Pattern (Vulnerable to IDOR)
```typescript
// ❌ VULNERABLE: Direct access via URL parameter without ownership check
app.get('/api/orders/:orderId', async (req, res) => {
  const order = await db.query('SELECT * FROM orders WHERE id = $1', [req.params.orderId]);
  res.json(order);
});
```

### Secure Pattern (Tenant Scoped & Object-Enforced)
```typescript
// ✅ SECURE: Strict server-side session extraction and ownership check
app.get('/api/orders/:orderId', requireAuth, async (req, res) => {
  const sessionUser = req.session.user;

  const order = await db.query(
    'SELECT * FROM orders WHERE id = $1 AND (user_id = $2 OR $3 = true)',
    [req.params.orderId, sessionUser.id, sessionUser.role === 'admin']
  );

  if (!order) {
    // Return 404 rather than 403 to prevent record existence enumeration
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json(order);
});
```

---

## 3. Defense-in-Depth Data Vaulting (Sanawia Privacy Pattern)

When handling sensitive identity documents (e.g. government vehicle registration cards, national IDs, medical records), apply field segregation:

1. **Document Vault Isolation**: The raw document scan is stored in a private object bucket inaccessible to third parties.
2. **Metadata Extraction & Sanitization**: An isolated worker extracts only functional technical attributes (Make, Model, Year, Engine Code) and masks PII (owner name, residential address).
3. **Signed Ephemeral URLs**: Third-party commercial actors (dealers, mechanics) are strictly denied direct document access (`403 Forbidden`). Authorized compliance auditors receive short-lived (60s) HMAC-signed temporary URLs.

---

## 4. Immutable Audit Trail Logging

Security auditing requires non-repudiation. Audit records must be write-only (append-only) and record actor metadata.

### Required Audit Fields
* `actor_id`: User ID or API service account.
* `role`: Authenticated role at the time of execution.
* `action`: Standardized enum (`LOGIN`, `LOGOUT`, `ROLE_CHANGE`, `INVENTORY_MUTATION`, `PRICE_UPDATE`, `DOCUMENT_ACCESS`, `UNAUTHORIZED_ACCESS_ATTEMPT`).
* `resource`: Target resource identifier (`order:ord_123`, `user:usr_456`).
* `ip_address`: Client IP address from trusted reverse-proxy headers (`X-Forwarded-For`).
* `user_agent`: Sanitized browser or API client identifier.
* `status`: `SUCCESS` or `DENIED`.
* `timestamp`: ISO-8601 UTC timestamp.

---

## 5. Defense-in-Depth Defense Checklist
- [x] Passwords hashed with PBKDF2 (SHA-512, 100k+ rounds) or Argon2id.
- [x] All database mutations use parameterized queries or trusted ORMs.
- [x] Client role parameter modification rejected at input schema validation.
- [x] Rate limiting enforced on all authentication, password reset, and RFQ submission endpoints.
- [x] Active session tracking with 1-click device revocation.
- [x] HTTP headers enforce HSTS, CSP, X-Frame-Options: DENY.
