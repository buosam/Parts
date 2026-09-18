/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket Document Security - Vehicle Registration (Sanawia) Storage & Privacy Controller
 */

import express from 'express';
import crypto from 'node:crypto';
import { requireAuth, AuthenticatedRequest } from '../security/rbac';
import { logAuditEvent } from '../security/audit';

const router = express.Router();

export interface VehicleDocumentRecord {
  id: string;
  userId: string;
  vehicleId?: string;
  originalFileName: string;
  mimeType: string;
  storageKeyEncrypted: string;
  extractedVehicleData: {
    make: string;
    model: string;
    year: number;
    engine?: string;
    trim?: string;
    vinMasked?: string;
  };
  uploadedAt: string;
  retentionExpiresAt: string;
}

// In-Memory Secure Document Vault
export const documentVault: Map<string, VehicleDocumentRecord> = new Map([
  [
    'doc_sanawia_991',
    {
      id: 'doc_sanawia_991',
      userId: 'usr_buyer_01',
      vehicleId: 'veh_prado_01',
      originalFileName: 'iraq_registration_prado.jpg',
      mimeType: 'image/jpeg',
      storageKeyEncrypted: 'enc_s3_vault_prado_reg_991.bin',
      extractedVehicleData: {
        make: 'Toyota',
        model: 'Land Cruiser Prado',
        year: 2021,
        engine: '4.0L V6 1GR-FE',
        vinMasked: 'JTEBU••••••••1902',
      },
      uploadedAt: '2026-01-15T12:00:00Z',
      retentionExpiresAt: '2027-01-15T12:00:00Z',
    },
  ],
]);

// 1. Private Document Retrieval with Strict Authorization & Audit Log
// COMPLIANCE WITH SECTION 7:
// "Dealers must NEVER automatically receive registration documents.
// Dealers should receive only the minimum vehicle information required to quote a part.
// Do not expose the original registration document to dealers."
router.get('/:docId', requireAuth, (req: AuthenticatedRequest, res) => {
  const { docId } = req.params;
  const user = req.user!;
  const doc = documentVault.get(docId);

  if (!doc) {
    return res.status(404).json({ error: 'DOCUMENT_NOT_FOUND', message: 'Requested document does not exist.' });
  }

  // SECURITY CHECK: Dealers are NEVER allowed to access the raw document!
  if (user.role === 'supplier') {
    logAuditEvent({
      actorId: user.id,
      actorRole: user.role,
      action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      resourceType: 'vehicle_document_privacy_violation',
      resourceId: docId,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'],
      status: 'DENIED',
      metadata: {
        reason: 'Dealers are strictly prohibited from viewing private vehicle registration documents.',
        dealerId: user.dealerId,
      },
    });

    return res.status(403).json({
      error: 'FORBIDDEN_DOCUMENT_ACCESS',
      message: 'Access denied: Original vehicle registration documents are protected under privacy policy and are not disclosed to dealers.',
    });
  }

  // IDOR CHECK: Only the owning buyer or an authorized compliance admin can access
  const isOwner = user.id === doc.userId;
  const isAdmin = user.role === 'admin';

  if (!isOwner && !isAdmin) {
    logAuditEvent({
      actorId: user.id,
      actorRole: user.role,
      action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      resourceType: 'vehicle_document_idor',
      resourceId: docId,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'],
      status: 'DENIED',
      metadata: { ownerId: doc.userId, attemptedBy: user.id },
    });

    return res.status(403).json({
      error: 'IDOR_ACCESS_DENIED',
      message: 'Access denied: You do not have permission to view this private vehicle document.',
    });
  }

  // Log compliant document access
  logAuditEvent({
    actorId: user.id,
    actorRole: user.role,
    action: 'DOCUMENT_ACCESS',
    resourceType: 'vehicle_document',
    resourceId: docId,
    ipAddress: req.ip || '127.0.0.1',
    status: 'SUCCESS',
    metadata: { isOwner, isAdmin },
  });

  // Generate short-lived signed URL simulation (valid for 60 seconds)
  const signedToken = crypto.randomBytes(24).toString('hex');
  res.json({
    success: true,
    documentId: doc.id,
    fileName: doc.originalFileName,
    mimeType: doc.mimeType,
    uploadedAt: doc.uploadedAt,
    extractedVehicle: doc.extractedVehicleData,
    signedTemporaryUrl: `https://vault.iqautomarket.iq/private-docs/${doc.id}?token=${signedToken}&expires=${Date.now() + 60000}`,
    expiresInSeconds: 60,
  });
});

export default router;
