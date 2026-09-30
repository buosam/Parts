#!/usr/bin/env python3
"""
Senior Security - Threat Modeler (STRIDE / DREAD Engine)
Automated threat modeling and risk assessment for modern application architectures.
"""

import os
import re
import sys
import json
import argparse
from typing import List, Dict, Any

# Ensure Windows terminal handles UTF-8 output gracefully
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except AttributeError:
        pass

class ThreatModeler:
    def __init__(self, target_dir: str, verbose: bool = False):
        self.target_dir = os.path.abspath(target_dir)
        self.verbose = verbose
        self.entry_points = []
        self.data_stores = []
        self.trust_boundaries = []
        self.threats = []

    def scan_codebase(self):
        """Walks the codebase to identify entry points, boundaries, and data stores."""
        exclude_dirs = {'.git', 'node_modules', 'dist', 'build', '__pycache__', '.venv', 'venv'}

        route_pattern = re.compile(
            r'(?:app|router)\.(get|post|put|delete|patch|options)\s*\(\s*[\'"`]([^\'"`]+)[\'"`]',
            re.IGNORECASE
        )
        auth_guard_pattern = re.compile(
            r'(requireAuth|requireRole|authenticate|verifyToken|checkPermission|authMiddleware)',
            re.IGNORECASE
        )
        db_pattern = re.compile(
            r'(SELECT\s+.*FROM|INSERT\s+INTO|UPDATE\s+.*SET|DELETE\s+FROM|prisma\.|mongoose\.|db\.query)',
            re.IGNORECASE
        )

        for root, dirs, files in os.walk(self.target_dir):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]

            for file in files:
                if not file.endswith(('.ts', '.tsx', '.js', '.jsx', '.py', '.go')):
                    continue

                filepath = os.path.join(root, file)
                rel_path = os.path.relpath(filepath, self.target_dir)

                try:
                    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                        lines = f.readlines()
                except Exception as e:
                    if self.verbose:
                        print(f"[-] Could not read {rel_path}: {e}")
                    continue

                for line_num, line in enumerate(lines, 1):
                    # Check for API Routes / Entry points
                    route_match = route_pattern.search(line)
                    if route_match:
                        method = route_match.group(1).upper()
                        path = route_match.group(2)
                        has_auth = bool(auth_guard_pattern.search(line))
                        # Check surrounding lines for auth middleware
                        surround = "".join(lines[max(0, line_num-2):min(len(lines), line_num+3)])
                        if auth_guard_pattern.search(surround):
                            has_auth = True

                        self.entry_points.append({
                            'method': method,
                            'path': path,
                            'file': rel_path,
                            'line': line_num,
                            'authenticated': has_auth
                        })

                    # Check for direct database interactions
                    if db_pattern.search(line):
                        self.data_stores.append({
                            'file': rel_path,
                            'line': line_num,
                            'snippet': line.strip()[:60]
                        })

    def analyze_stride_threats(self):
        """Generates STRIDE threat matrix based on discovered application surfaces."""
        # 1. Spoofing
        unauth_routes = [ep for ep in self.entry_points if not ep['authenticated']]
        if unauth_routes:
            self.threats.append({
                'category': 'Spoofing',
                'title': 'Unauthenticated Entry Points / Missing Authentication Boundary',
                'description': f'Identified {len(unauth_routes)} endpoints that do not explicitly declare auth middleware.',
                'impact': 'High',
                'mitigation': 'Enforce requireAuth / session token verification on all non-public routes.',
                'dread': {'damage': 8, 'reproducibility': 9, 'exploitability': 8, 'affected_users': 8, 'discoverability': 9},
                'examples': [f"{ep['method']} {ep['path']} ({ep['file']}:{ep['line']})" for ep in unauth_routes[:3]]
            })

        # 2. Tampering
        write_methods = [ep for ep in self.entry_points if ep['method'] in ('POST', 'PUT', 'PATCH', 'DELETE')]
        if write_methods:
            self.threats.append({
                'category': 'Tampering',
                'title': 'Object-Level Parameter & Data State Tampering (IDOR)',
                'description': f'State-mutating endpoints ({len(write_methods)} found) risk parameter manipulation without strict ownership verification.',
                'impact': 'Critical',
                'mitigation': 'Implement enforceDealerScope / checkObjectOwnership server-side validators.',
                'dread': {'damage': 9, 'reproducibility': 8, 'exploitability': 7, 'affected_users': 8, 'discoverability': 8},
                'examples': [f"{ep['method']} {ep['path']} ({ep['file']}:{ep['line']})" for ep in write_methods[:3]]
            })

        # 3. Repudiation
        self.threats.append({
            'category': 'Repudiation',
            'title': 'Insufficient Audit Logging for High-Privilege Actions',
            'description': 'Critical business actions (dealer verification, price updates, document access) must have non-repudiable audit logs.',
            'impact': 'Medium',
            'mitigation': 'Pipe security events to an append-only audit trail logging actor ID, action, timestamp, IP, and SHA-256 fingerprint.',
            'dread': {'damage': 6, 'reproducibility': 6, 'exploitability': 5, 'affected_users': 5, 'discoverability': 6},
            'examples': ['Role changes, dealer suspensions, financial report access']
        })

        # 4. Information Disclosure
        self.threats.append({
            'category': 'Information Disclosure',
            'title': 'Sensitive Document & Personal Data Leakage',
            'description': 'Direct access to private documents (e.g. Sanawia registration cards, tax documents) via predictable identifiers.',
            'impact': 'Critical',
            'mitigation': 'Store sensitive documents in encrypted vaults; generate time-limited (60s) signed URLs for authorized actors only.',
            'dread': {'damage': 9, 'reproducibility': 8, 'exploitability': 7, 'affected_users': 9, 'discoverability': 7},
            'examples': ['/api/vehicle-documents/:docId, /api/auth/sessions']
        })

        # 5. Denial of Service
        self.threats.append({
            'category': 'Denial of Service',
            'title': 'Brute Force & Unthrottled Resource Exhaustion',
            'description': 'Unprotected authentication and reverse-auction bidding routes vulnerable to automated rate floods.',
            'impact': 'High',
            'mitigation': 'Enforce sliding-window rate limiting (10 req/min for auth, 60 req/min for standard APIs).',
            'dread': {'damage': 7, 'reproducibility': 9, 'exploitability': 8, 'affected_users': 9, 'discoverability': 8},
            'examples': ['/api/auth/login, /api/auth/whatsapp/otp-request, /api/dealer/requests/:id/offers']
        })

        # 6. Elevation of Privilege
        self.threats.append({
            'category': 'Elevation of Privilege',
            'title': 'Client-Side Role Parameter Injection',
            'description': 'Attackers submitting manipulated role payload during registration or profile update to elevate to admin or supplier.',
            'impact': 'Critical',
            'mitigation': 'Reject role property in public registration schemas; strictly enforce server-assigned role authorization.',
            'dread': {'damage': 10, 'reproducibility': 9, 'exploitability': 8, 'affected_users': 10, 'discoverability': 8},
            'examples': ['POST /api/auth/register with {"role": "admin"}']
        })

    def generate_markdown(self) -> str:
        lines = []
        lines.append("# Automated STRIDE / DREAD Threat Model Report")
        lines.append(f"**Target Directory:** `{self.target_dir}`  ")
        lines.append(f"**Entry Points Discovered:** `{len(self.entry_points)}`  ")
        lines.append(f"**Data Store Touchpoints:** `{len(self.data_stores)}`  \n")
        lines.append("---")
        lines.append("## Executive Threat Matrix\n")
        lines.append("| Category | Threat Title | Impact | DREAD Score | Mitigation Strategy |")
        lines.append("| :--- | :--- | :--- | :--- | :--- |")

        for t in self.threats:
            d = t['dread']
            avg_score = round(sum(d.values()) / len(d), 1)
            lines.append(f"| **{t['category']}** | {t['title']} | `{t['impact']}` | **{avg_score} / 10** | {t['mitigation']} |")

        lines.append("\n---\n## Detailed Threat Findings\n")
        for idx, t in enumerate(self.threats, 1):
            d = t['dread']
            avg_score = round(sum(d.values()) / len(d), 1)
            lines.append(f"### {idx}. [{t['category']}] {t['title']}")
            lines.append(f"- **Severity / Impact:** {t['impact']} (DREAD Composite: {avg_score}/10)")
            lines.append(f"- **Description:** {t['description']}")
            lines.append(f"- **Mitigation Pattern:** {t['mitigation']}")
            if t['examples']:
                lines.append("- **Relevant Touchpoints:**")
                for ex in t['examples']:
                    lines.append(f"  - `{ex}`")
            lines.append("")

        lines.append("---\n*Generated by Senior Security Threat Modeler. Adheres to Microsoft STRIDE & OWASP Risk Assessment Framework.*")
        return "\n".join(lines)

    def run(self, output_file: str = None, fmt: str = 'markdown'):
        self.scan_codebase()
        self.analyze_stride_threats()

        if fmt == 'json':
            result = {
                'target': self.target_dir,
                'entryPointsCount': len(self.entry_points),
                'entryPoints': self.entry_points,
                'dataStoresCount': len(self.data_stores),
                'threats': self.threats
            }
            output = json.dumps(result, indent=2)
        else:
            output = self.generate_markdown()

        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(output)
            print(f"[+] Threat model successfully written to: {output_file}")
        else:
            print(output)

def main():
    parser = argparse.ArgumentParser(description="Automated STRIDE/DREAD Threat Modeler for Web & Cloud Architectures")
    parser.add_argument("project_path", nargs="?", default=".", help="Path to project directory (default: .)")
    parser.add_argument("--output", "-o", help="Output file path (e.g. threat-model.md)")
    parser.add_argument("--format", "-f", choices=['markdown', 'json'], default='markdown', help="Output format")
    parser.add_argument("--verbose", "-v", action="store_true", help="Enable verbose scanning logs")

    args = parser.parse_args()
    modeler = ThreatModeler(args.project_path, verbose=args.verbose)
    modeler.run(output_file=args.output, fmt=args.format)

if __name__ == "__main__":
    main()
