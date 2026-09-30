# Modern Cryptography Implementation Guide

Technical reference for implementing enterprise-grade cryptographic algorithms, key lifecycle workflows, and constant-time operations.

---

## 1. Password Hashing Standards

Never use simple message digests (MD5, SHA-1, SHA-256) for password storage. Use slow, memory-hard key derivation functions.

### Recommended Algorithms
1. **Argon2id** (Winner of the Password Hashing Competition — Preferred).
2. **scrypt** (Memory-hard fallback).
3. **PBKDF2-HMAC-SHA512** (FIPS-140 compliance standard with $\ge 100,000$ rounds).

### Node.js Production Implementation (PBKDF2)
```typescript
import crypto from 'node:crypto';

const SALT_BYTES = 32;
const ITERATIONS = 100_000;
const KEY_LEN = 64; // 512 bits
const DIGEST = 'sha512';

export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_BYTES).toString('hex');
    crypto.pbkdf2(password, salt, ITERATIONS, KEY_LEN, DIGEST, (err, derivedKey) => {
      if (err) return reject(err);
      // Format: iterations$salt$derivedKey
      resolve(`${ITERATIONS}$${salt}$${derivedKey.toString('hex')}`);
    });
  });
}

export function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [iterationsStr, salt, expectedKey] = storedHash.split('$');
    const iterations = parseInt(iterationsStr, 10);

    crypto.pbkdf2(password, salt, iterations, KEY_LEN, DIGEST, (err, derivedKey) => {
      if (err) return reject(err);
      const expectedBuf = Buffer.from(expectedKey, 'hex');
      // Constant-time comparison to prevent timing attacks
      const isMatch = crypto.timingSafeEqual(derivedKey, expectedBuf);
      resolve(isMatch);
    });
  });
}
```

---

## 2. Symmetric Encryption at Rest (AES-256-GCM)

Use authenticated encryption (AEAD) to guarantee both confidentiality and integrity.

### AES-256-GCM Specification
* **Algorithm**: `aes-256-gcm`
* **Key Length**: 256 bits (32 bytes)
* **Initialization Vector (IV)**: 96 bits (12 bytes) cryptographically random per operation. **Never reuse an IV with the same key.**
* **Authentication Tag**: 128 bits (16 bytes)

```typescript
import crypto from 'node:crypto';

export interface EncryptedPayload {
  ciphertext: string; // Hex
  iv: string;         // Hex
  authTag: string;    // Hex
}

export function encryptAesGcm(plaintext: string, keyBuffer: Buffer): EncryptedPayload {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);

  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    ciphertext,
    iv: iv.toString('hex'),
    authTag
  };
}

export function decryptAesGcm(payload: EncryptedPayload, keyBuffer: Buffer): string {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    keyBuffer,
    Buffer.from(payload.iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(payload.authTag, 'hex'));

  let plaintext = decipher.update(payload.ciphertext, 'hex', 'utf8');
  plaintext += decipher.final('utf8');
  return plaintext;
}
```

---

## 3. Timing Attack Prevention

When comparing secret tokens (API keys, session hashes, HMAC signatures, OTPs), standard string equality (`===`) leaks timing information based on how many leading characters match.

### Mitigation: Constant-Time Comparison
```typescript
import crypto from 'node:crypto';

export function secureCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) {
    // Constant-time length check
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}
```

---

## 4. Cryptographic Key Management & Rotation
1. **Master Key Storage**: Store root encryption keys in Hardware Security Modules (HSM) or managed Cloud KMS (Google Cloud KMS, AWS KMS).
2. **Envelope Encryption**: Data is encrypted using unique data encryption keys (DEK); the DEK is encrypted using the root Key Encryption Key (KEK).
3. **Key Rotation Lifecycle**:
   - Rotate DEKs annually or after $2^{32}$ encryption operations.
   - Maintain historical key versions to decrypt existing ciphertext during migration.
