# Penetration Testing & Defensive Security Assessment Guide

Comprehensive workflow documentation for conducting internal application penetration tests, architectural assessments, and OWASP verification.

---

## 1. Assessment Phases & Methodology

Modern application assessments follow four structured phases:

```text
1. Scoping & Reconnaissance
   ├── Attack surface inventory (Public vs Authenticated endpoints)
   ├── Role matrix mapping (Customer, Dealer, Admin, Anonymous)
   └── Trust boundary definition
          │
          ▼
2. Threat Modeling & Vulnerability Analysis
   ├── Static Code Review (SAST via security_auditor.py)
   ├── Dependency / Supply Chain CVE audit
   └── Business logic flaw identification
          │
          ▼
3. Verification & Authorization Testing
   ├── Horizontal Privilege Escalation (User A accessing User B data)
   ├── Vertical Privilege Escalation (Buyer escalating to Admin)
   └── Anti-IDOR parameter tampering checks
          │
          ▼
4. Remediation & Verification
   ├── Severity scoring (CVSS v3.1 / DREAD)
   ├── Automated security acceptance test development
   └── Regression verification
```

---

## 2. OWASP Top 10 Verification Checklist

### A01: Broken Access Control
- [ ] Verify that unauthorized actors receive `HTTP 401 Unauthorized`.
- [ ] Verify that authorized actors with insufficient privileges receive `HTTP 403 Forbidden`.
- [ ] Verify that users cannot alter their own `role` attribute during signup or profile update.
- [ ] Ensure tenant identifiers are derived from verified session tokens, never from client body/headers.

### A02: Cryptographic Failures
- [ ] Ensure all transport uses TLS 1.3 / 1.2 with strong cipher suites.
- [ ] Verify password hashing uses modern memory-hard algorithms (Argon2id, PBKDF2 with 100k+ iterations).
- [ ] Confirm no sensitive PII or credentials are logged in plaintext server logs or URLs.

### A03: Injection (SQLi, Command Injection, SSRF)
- [ ] Verify that all SQL queries use parameterized arguments ($1, $2, ?).
- [ ] Ensure no dynamic string concatenation exists in database queries.
- [ ] Prohibit raw system shell calls (`child_process.exec`, `os.system`) with untrusted input.

### A04: Insecure Design
- [ ] Perform STRIDE threat modeling before implementing new critical workflows (e.g. reverse auctions, payments).
- [ ] Establish rate limits for password guessing and high-velocity transactional requests.

### A05: Security Misconfiguration
- [ ] Verify HTTP response headers include `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`.
- [ ] Confirm default administrative accounts are disabled or password-reset.
- [ ] Suppress verbose stack traces and internal database errors in production responses.

### A06: Vulnerable and Outdated Components
- [ ] Run automated dependency audits (`npm audit`, `pip-audit`).
- [ ] Maintain a software bill of materials (SBOM) and keep critical dependencies pinned.

### A07: Identification and Authentication Failures
- [ ] Implement multi-factor or out-of-band verification (SMS/WhatsApp OTP).
- [ ] Invalidate session tokens immediately upon logout or password reset.
- [ ] Implement concurrent session controls and device tracking.

---

## 3. Automated Security Acceptance Testing

Integrate automated security unit tests into the CI/CD pipeline. Every permission boundary must be verified with negative test cases (expecting HTTP 401/403):

```typescript
// Example: Automated Acceptance Matrix in Jest/Vitest/Playwright
describe('Authorization Boundary Acceptance', () => {
  it('Rejects buyer accessing admin users endpoint', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${buyerToken}`);
    expect(res.status).toBe(403);
  });

  it('Blocks cross-dealer inventory mutation (Anti-IDOR)', async () => {
    const res = await request(app)
      .patch('/api/dealer/inventory/dlr_other_part_99')
      .set('Authorization', `Bearer ${dealerAToken}`)
      .send({ price: 1000 });
    expect(res.status).toBe(403);
  });
});
```

---

## 4. Reporting & Remediation SLA

| Finding Severity | CVSS v3.1 Range | Remediation Window | Example Vulnerabilities |
| :--- | :--- | :--- | :--- |
| **Critical** | 9.0 – 10.0 | **< 24 Hours** | Remote Code Execution, Privilege Escalation to Admin, Full Database SQLi |
| **High** | 7.0 – 8.9 | **< 7 Days** | Cross-Tenant IDOR, Authentication Bypass, Private Document Exposure |
| **Medium** | 4.0 – 6.9 | **< 30 Days** | Missing Rate Limiting, CSRF, Insecure Cookie Flags |
| **Low** | 0.1 – 3.9 | **< 90 Days** | Missing Security Headers, Verbose Error Messages |
