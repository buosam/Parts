---
name: senior-security
description: >-
  Complete toolkit for senior security engineering with modern tools and best practices.
  Use when conducting threat modeling (STRIDE), performing automated static code security audits,
  running defensive penetration test readiness assessments, reviewing zero-trust architecture,
  or implementing modern cryptographic standards.
license: Apache-2.0
metadata:
  version: v1.0.0
  author: Senior Security Architecture Lead
---

# Senior Security Skill

Complete toolkit for senior security engineering with modern tools and best practices.

## Quick Start

### Main Capabilities

This skill provides three core capabilities through automated scripts:

```bash
# Script 1: Threat Modeler (STRIDE / DREAD Architecture Analysis)
python scripts/threat_modeler.py <project-path> [options]

# Script 2: Security Auditor (Comprehensive SAST Code Review)
python scripts/security_auditor.py <target-path> [--verbose]

# Script 3: Pentest Automator (Defensive Audit & Pentest Readiness)
python scripts/pentest_automator.py <target-path> [--analyze]
```

---

## Core Capabilities

### 1. Threat Modeler

Automated tool for threat modeling, trust boundary identification, and risk scoring.

*   **Automated Scaffolding**: Detects application entry points, authentication boundaries, and data stores.
*   **Best Practices Built-in**: Follows Microsoft STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) and DREAD risk ranking.
*   **Configurable Templates**: Generates structured Markdown threat matrices or machine-readable JSON.
*   **Quality Checks**: Flags unauthenticated public surfaces and unvalidated external integrations.

**Usage**:
```bash
python scripts/threat_modeler.py . --output threat-model.md
python scripts/threat_modeler.py ./src --format json
```

### 2. Security Auditor

Comprehensive static analysis, code vulnerability detection, and optimization tool.

*   **Deep Analysis**: Inspects TypeScript, JavaScript, Python, SQL, Docker, and environment configurations.
*   **Vulnerability Detection**: Catches hardcoded secrets, SQL injection, insecure cryptography, missing authorization (IDOR), and permissive CORS.
*   **Performance Metrics**: Quantifies security health, vulnerability severity breakdown (Critical, High, Medium, Low), and scan velocity.
*   **Automated Recommendations**: Generates immediate code remediation snippets for detected vulnerabilities.

**Usage**:
```bash
python scripts/security_auditor.py . --verbose
python scripts/security_auditor.py ./src --output security-audit.md
```

### 3. Pentest Automator

Defensive penetration testing readiness and security assessment automator.

*   **Expert-Level Automation**: Audits endpoint authentication guards, HTTP security headers, cookie flags, and exposed sensitive routes.
*   **Custom Configurations**: Configurable rules for single-page applications, Express/Node.js servers, Next.js, and REST APIs.
*   **Integration Ready**: Compatible with CI/CD pipelines (GitHub Actions, GitLab CI, pre-commit hooks).
*   **Production-Grade Output**: Produces actionable executive summary and technical verification matrix aligned with OWASP Top 10.

**Usage**:
```bash
python scripts/pentest_automator.py . --analyze
python scripts/pentest_automator.py . --report pentest-readiness.md
```

---

## Reference Documentation

### Security Architecture Patterns
Comprehensive guide available in [references/security_architecture_patterns.md](./references/security_architecture_patterns.md):
*   Zero-Trust API boundaries and object-level scoping (Anti-IDOR).
*   Role-Based & Attribute-Based Access Control (RBAC/ABAC).
*   Defense-in-depth data privacy vaulting and field encryption.
*   Immutable audit trail logging and active device tracking.
*   Anti-patterns and mitigation patterns.

### Penetration Testing Guide
Complete workflow documentation in [references/penetration_testing_guide.md](./references/penetration_testing_guide.md):
*   Step-by-step penetration testing and security assessment workflows.
*   OWASP Top 10 and API Security Top 10 verification checklists.
*   Authorization boundary validation and session tampering analysis.
*   Tool integrations, automated baselining, and reporting.

### Cryptography Implementation
Technical reference guide in [references/cryptography_implementation.md](./references/cryptography_implementation.md):
*   Password hashing standards: PBKDF2 (SHA-512, 100k+ rounds), Argon2id, scrypt.
*   Symmetric encryption: AES-256-GCM and ChaCha20-Poly1305 with authenticated tags.
*   Timing attack prevention using constant-time comparison (`timingSafeEqual`).
*   Key lifecycle management, envelope encryption, and secrets hygiene.

---

## Tech Stack

*   **Languages**: TypeScript, JavaScript, Python, Go, SQL
*   **Frontend**: React, Next.js, Vite, Tailwind CSS
*   **Backend**: Node.js, Express, REST APIs, GraphQL
*   **Database**: PostgreSQL, SQLite, Prisma, Redis
*   **DevOps & Security**: Docker, Kubernetes, GitHub Actions, Linux Security Headers
*   **Standards**: OWASP Top 10, ASVS, STRIDE, NIST SP 800-63B

---

## Development Workflow

### 1. Setup and Configuration
```bash
# Verify environment and dependencies
python --version
node --version
```

### 2. Run Quality & Security Checks
```bash
# Run the static security auditor
python scripts/security_auditor.py .

# Run the threat modeler for new features
python scripts/threat_modeler.py .

# Run pentest readiness verification
python scripts/pentest_automator.py . --analyze
```

### 3. Implement Best Practices
Follow the patterns documented in:
*   `references/security_architecture_patterns.md`
*   `references/penetration_testing_guide.md`
*   `references/cryptography_implementation.md`

---

## Best Practices Summary

### Code Quality
*   Follow established security patterns.
*   Write comprehensive security acceptance tests (e.g., automated 401/403 matrix).
*   Document threat boundaries and data flow decisions.
*   Review code regularly with automated security linters.

### Security
*   Validate and sanitize all inputs at system boundaries.
*   Use parameterized queries exclusively (never concatenate SQL strings).
*   Enforce server-side authentication, role checks, and object-level ownership checks on all endpoints.
*   Store secrets in environment variables or KMS vaults, never in code repositories.

### Maintainability
*   Write clear, self-documenting code.
*   Enforce consistent cryptographic helper modules.
*   Maintain an immutable audit trail for security-critical actions.
