#!/usr/bin/env python3
"""
Senior Security - Security Auditor (SAST Code Vulnerability Scanner)
Static Application Security Testing (SAST) engine for TypeScript, JavaScript, Python, SQL & Configs.
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

class SecurityAuditor:
    def __init__(self, target_path: str, verbose: bool = False):
        self.target_path = os.path.abspath(target_path)
        self.verbose = verbose
        self.findings: List[Dict[str, Any]] = []
        self.files_scanned = 0

        # Define vulnerability detection rules
        self.rules = [
            {
                'id': 'SEC-001',
                'name': 'Hardcoded Secret / API Token',
                'severity': 'CRITICAL',
                'pattern': re.compile(
                    r'(?:(?:api[_-]?key|secret|password|jwt[_-]?secret|private[_-]?key|token)\s*[:=]\s*[\'"`][A-Za-z0-9+/=_\-\.]{12,}[\'"`]|AIzaSy[A-Za-z0-9_\-]{33}|AKIA[0-9A-Z]{16}|-----BEGIN (?:RSA )?PRIVATE KEY-----)',
                    re.IGNORECASE
                ),
                'remediation': 'Extract credentials to environment variables or an enterprise secrets vault (GCP Secret Manager / AWS Secrets Manager).'
            },
            {
                'id': 'SEC-002',
                'name': 'SQL Injection (Dynamic String Concatenation)',
                'severity': 'CRITICAL',
                'pattern': re.compile(
                    r'(?:(?:db|pool|client)\.query|execute|sql)\s*\(\s*[\'"`].*(?:\+|\$\{)|[\'"`]\s*(?:SELECT\s+.*?\s+FROM|UPDATE\s+\w+\s+SET|INSERT\s+INTO\s+\w+|DELETE\s+FROM\s+\w+).*?(?:\+|\$\{)',
                    re.IGNORECASE
                ),
                'remediation': 'Use parameterized queries ($1, $2 or ?) or ORM query builders. Never concatenate raw user input into SQL strings.'
            },
            {
                'id': 'SEC-003',
                'name': 'Weak Cryptographic Algorithm',
                'severity': 'HIGH',
                'pattern': re.compile(
                    r'(?:createHash\([\'"`](?:md5|sha1)[\'"`]\)|hashlib\.(?:md5|sha1)\(|crypto\.createCipher\(|DES\.)',
                    re.IGNORECASE
                ),
                'remediation': 'Use SHA-256/SHA-512 for integrity hashes, AES-256-GCM for encryption, and PBKDF2 (100k+ rounds) or Argon2id for password hashing.'
            },
            {
                'id': 'SEC-004',
                'name': 'Insecure Random Number Generator for Security Token',
                'severity': 'MEDIUM',
                'pattern': re.compile(
                    r'(?:Math\.random\(\)|random\.random\(\)|random\.randint\()(?=.*(?:token|session|id|nonce|salt|key))',
                    re.IGNORECASE
                ),
                'remediation': 'Use cryptographically secure pseudorandom number generators (crypto.randomBytes() in Node.js, secrets in Python).'
            },
            {
                'id': 'SEC-005',
                'name': 'Direct Insecure Code Execution (eval / exec)',
                'severity': 'CRITICAL',
                'pattern': re.compile(
                    r'(?:\beval\s*\(|new\s+Function\s*\(|child_process\.exec\s*\([^,\]\)]+\+)',
                    re.IGNORECASE
                ),
                'remediation': 'Avoid dynamic code execution. For child processes, use execFile/spawn with parameterized argument arrays.'
            },
            {
                'id': 'SEC-006',
                'name': 'Cross-Site Scripting (XSS) Raw Injection',
                'severity': 'HIGH',
                'pattern': re.compile(
                    r'(?:dangerouslySetInnerHTML\s*=\s*\{\s*__html:|innerHTML\s*=\s*|document\.write\s*\()',
                    re.IGNORECASE
                ),
                'remediation': 'Rely on React auto-escaping, or sanitize content with DOMPurify before injecting markup into the DOM.'
            },
            {
                'id': 'SEC-007',
                'name': 'Insecure Permissive CORS Configuration',
                'severity': 'HIGH',
                'pattern': re.compile(
                    r'(?:Access-Control-Allow-Origin[\'"`]?\s*[:=]\s*[\'"`]\*[\'"`]|cors\s*\(\s*\{\s*origin\s*:\s*[\'"`]\*[\'"`]\s*,\s*credentials\s*:\s*true)',
                    re.IGNORECASE
                ),
                'remediation': 'Explicitly define an allowed origin whitelist. Never pair wildcard origin (*) with credentials: true.'
            }
        ]

    def scan(self):
        exclude_dirs = {'.git', 'node_modules', 'dist', 'build', '.venv', 'venv', '__pycache__', 'coverage'}
        valid_extensions = ('.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.sql', '.env', '.json')

        for root, dirs, files in os.walk(self.target_path):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]

            for file in files:
                if file.startswith('.env.example') or file.endswith('.test.ts') or file.endswith('.spec.ts'):
                    continue
                if not file.endswith(valid_extensions):
                    continue

                filepath = os.path.join(root, file)
                rel_path = os.path.relpath(filepath, self.target_path)
                self.files_scanned += 1

                try:
                    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                        lines = f.readlines()
                except Exception as e:
                    if self.verbose:
                        print(f"[-] Could not read {rel_path}: {e}")
                    continue

                for line_idx, line in enumerate(lines, 1):
                    # Skip common test/mock data strings that are benign
                    if 'example' in line.lower() or 'placeholder' in line.lower() or 'mock' in line.lower():
                        continue

                    for rule in self.rules:
                        match = rule['pattern'].search(line)
                        if match:
                            self.findings.append({
                                'rule_id': rule['id'],
                                'name': rule['name'],
                                'severity': rule['severity'],
                                'file': rel_path,
                                'line': line_idx,
                                'snippet': line.strip()[:100],
                                'remediation': rule['remediation']
                            })

    def print_terminal_report(self):
        print("\n========================================================")
        print("🛡️  Senior Security Auditor — Static Code Vulnerability Report")
        print("========================================================")
        print(f"Target Directory: {self.target_path}")
        print(f"Files Scanned:    {self.files_scanned}")
        print(f"Total Findings:   {len(self.findings)}")

        severity_counts = {'CRITICAL': 0, 'HIGH': 0, 'MEDIUM': 0, 'LOW': 0}
        for f in self.findings:
            severity_counts[f['severity']] = severity_counts.get(f['severity'], 0) + 1

        print("--------------------------------------------------------")
        print(f"Critical: {severity_counts['CRITICAL']} | High: {severity_counts['HIGH']} | Medium: {severity_counts['MEDIUM']} | Low: {severity_counts['LOW']}")
        print("--------------------------------------------------------\n")

        if not self.findings:
            print("✅ No security vulnerabilities detected matching signature database.")
            print("All inspected code follows secure coding best practices.\n")
            return

        for idx, finding in enumerate(self.findings, 1):
            severity = finding['severity']
            badge = f"[{severity}]"
            print(f"{idx}. {badge} {finding['name']} ({finding['rule_id']})")
            print(f"   Location:    {finding['file']}:{finding['line']}")
            print(f"   Code:        {finding['snippet']}")
            print(f"   Remediation: {finding['remediation']}")
            print("")

    def generate_markdown(self) -> str:
        lines = []
        lines.append("# Senior Security Auditor — Static Analysis Report\n")
        lines.append(f"**Target:** `{self.target_path}`  ")
        lines.append(f"**Files Scanned:** `{self.files_scanned}`  ")
        lines.append(f"**Total Findings:** `{len(self.findings)}`  \n")

        lines.append("| ID | Severity | Vulnerability | Location | Remediation |")
        lines.append("| :--- | :--- | :--- | :--- | :--- |")

        for f in self.findings:
            lines.append(f"| `{f['rule_id']}` | **{f['severity']}** | {f['name']} | `{f['file']}:{f['line']}` | {f['remediation']} |")

        return "\n".join(lines)

    def run(self, output_file: str = None, fmt: str = 'console'):
        self.scan()

        if fmt == 'json':
            output = json.dumps({
                'target': self.target_path,
                'files_scanned': self.files_scanned,
                'total_findings': len(self.findings),
                'findings': self.findings
            }, indent=2)
            if output_file:
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write(output)
            else:
                print(output)
        elif fmt == 'markdown' or output_file:
            md = self.generate_markdown()
            if output_file:
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write(md)
                print(f"[+] Security audit report written to: {output_file}")
            else:
                print(md)
        else:
            self.print_terminal_report()

def main():
    parser = argparse.ArgumentParser(description="Automated Static Application Security Testing (SAST) Engine")
    parser.add_argument("target_path", nargs="?", default=".", help="Path to codebase directory (default: .)")
    parser.add_argument("--output", "-o", help="Output file path (e.g. security-audit.md)")
    parser.add_argument("--format", "-f", choices=['console', 'markdown', 'json'], default='console', help="Output format")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose logging")

    args = parser.parse_args()
    auditor = SecurityAuditor(args.target_path, verbose=args.verbose)
    auditor.run(output_file=args.output, fmt=args.format)

if __name__ == "__main__":
    main()
