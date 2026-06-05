"""Secret scanner - wraps trufflehog or gitleaks."""

import json
import subprocess
from pathlib import Path

from skill_audit.core.scanner import Finding, Scanner, ScanResult, Severity
from skill_audit.core.tools import is_tool_available


class SecretsScanner(Scanner):
    """Scans for hardcoded secrets using trufflehog or gitleaks."""
    
    name = "secrets"
    description = "Secret/credential detection"
    
    def __init__(self):
        self._backend = None
        if is_tool_available("trufflehog"):
            self._backend = "trufflehog"
        elif is_tool_available("gitleaks"):
            self._backend = "gitleaks"
    
    @property
    def display_name(self) -> str:
        """Name to show in output, including backend tool."""
        if self._backend:
            return f"secrets ({self._backend})"
        return "secrets"
    
    def is_available(self) -> bool:
        """Check if trufflehog or gitleaks is available."""
        return self._backend is not None
    
    def scan(self, path: Path, verbose: bool = False) -> ScanResult:
        """Scan for secrets."""
        result = ScanResult(scanner_name=self.display_name)
        
        # Count files in path
        if path.is_file():
            result.files_scanned = 1
        else:
            result.files_scanned = sum(1 for _ in path.rglob("*") if _.is_file())
        
        # Prefer trufflehog, fall back to gitleaks
        if self._backend == "trufflehog":
            result.findings = self._scan_trufflehog(path, verbose)
        elif self._backend == "gitleaks":
            result.findings = self._scan_gitleaks(path, verbose)
        else:
            result.skipped = True
            result.skip_reason = "Neither trufflehog nor gitleaks available"
        
        for f in result.findings:
            f.scanner = self.name
        
        return result
    
    def _scan_trufflehog(self, path: Path, verbose: bool) -> list[Finding]:
        """Run trufflehog scan."""
        findings = []
        
        try:
            cmd = [
                "trufflehog", "filesystem",
                "--json",
                "--no-update",
                str(path),
            ]
            
            proc = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120,
            )
            
            # trufflehog outputs one JSON object per line
            for line in proc.stdout.strip().split("\n"):
                if not line:
                    continue
                try:
                    data = json.loads(line)
                    
                    findings.append(Finding(
                        rule_id=f"secrets/{data.get('DetectorName', 'unknown')}",
                        message=f"Found {data.get('DetectorName', 'secret')}: {data.get('Raw', '')[:30]}...",
                        severity=Severity.error,
                        file=Path(data.get("SourceMetadata", {}).get("Data", {}).get("Filesystem", {}).get("file", "")),
                        line=data.get("SourceMetadata", {}).get("Data", {}).get("Filesystem", {}).get("line"),
                    ))
                except json.JSONDecodeError:
                    continue
                    
        except subprocess.TimeoutExpired:
            findings.append(Finding(
                rule_id="secrets/timeout",
                message="Trufflehog scan timed out",
                severity=Severity.warning,
            ))
        except Exception as e:
            findings.append(Finding(
                rule_id="secrets/error",
                message=f"Trufflehog error: {e}",
                severity=Severity.warning,
            ))
        
        return findings
    
    def _scan_gitleaks(self, path: Path, verbose: bool) -> list[Finding]:
        """Run gitleaks scan."""
        findings = []
        
        try:
            cmd = [
                "gitleaks", "detect",
                "--source", str(path),
                "--report-format", "json",
                "--report-path", "/dev/stdout",
                "--no-git",
            ]
            
            proc = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120,
            )
            
            if proc.stdout.strip():
                try:
                    results = json.loads(proc.stdout)
                    for item in results:
                        findings.append(Finding(
                            rule_id=f"secrets/{item.get('RuleID', 'unknown')}",
                            message=f"Found {item.get('Description', 'secret')}",
                            severity=Severity.error,
                            file=Path(item.get("File", "")),
                            line=item.get("StartLine"),
                        ))
                except json.JSONDecodeError:
                    pass
                    
        except subprocess.TimeoutExpired:
            findings.append(Finding(
                rule_id="secrets/timeout",
                message="Gitleaks scan timed out",
                severity=Severity.warning,
            ))
        except Exception as e:
            findings.append(Finding(
                rule_id="secrets/error", 
                message=f"Gitleaks error: {e}",
                severity=Severity.warning,
            ))
        
        return findings
