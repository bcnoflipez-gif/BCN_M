"""Semgrep scanner - wraps semgrep for code analysis."""

import json
import subprocess
from pathlib import Path

from skill_audit.core.scanner import Finding, Scanner, ScanResult, Severity
from skill_audit.core.tools import is_tool_available


# Map semgrep severity to our severity
SEVERITY_MAP = {
    "ERROR": Severity.error,
    "WARNING": Severity.warning,
    "INFO": Severity.info,
}


class SemgrepScanner(Scanner):
    """Scans code using semgrep with security rules."""
    
    name = "semgrep"
    description = "Multi-language code security analysis"
    
    def is_available(self) -> bool:
        """Check if semgrep is available."""
        return is_tool_available("semgrep")
    
    def scan(self, path: Path, verbose: bool = False) -> ScanResult:
        """Scan code with semgrep."""
        result = ScanResult(scanner_name=self.name)
        
        # Check for relevant code files
        code_files = (
            self.get_relevant_files(path, [".py"]) +
            self.get_relevant_files(path, [".js", ".ts"]) +
            self.get_relevant_files(path, [".rb"]) +
            self.get_relevant_files(path, [".go"])
        )
        result.files_scanned = len(code_files)
        
        if not code_files:
            return result
        
        result.findings = self._run_semgrep(path, verbose)
        
        for f in result.findings:
            f.scanner = self.name
        
        return result
    
    def _run_semgrep(self, path: Path, verbose: bool) -> list[Finding]:
        """Run semgrep with security rules."""
        findings = []
        
        try:
            # Use semgrep's built-in security rules
            cmd = [
                "semgrep", "scan",
                "--config=auto",  # Auto-detect language and use appropriate rules
                "--json",
                "--quiet",
                str(path),
            ]
            
            proc = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120,
            )
            
            if proc.stdout.strip():
                try:
                    data = json.loads(proc.stdout)
                    results = data.get("results", [])
                    
                    for item in results:
                        severity_str = item.get("extra", {}).get("severity", "WARNING")
                        severity = SEVERITY_MAP.get(severity_str, Severity.warning)
                        
                        # Extract file path
                        file_path = item.get("path", "")
                        
                        findings.append(Finding(
                            rule_id=f"semgrep/{item.get('check_id', 'unknown')}",
                            message=item.get("extra", {}).get("message", "Security issue detected"),
                            severity=severity,
                            file=Path(file_path) if file_path else None,
                            line=item.get("start", {}).get("line"),
                            column=item.get("start", {}).get("col"),
                            snippet=item.get("extra", {}).get("lines", "")[:100],
                        ))
                except json.JSONDecodeError:
                    pass
                    
        except subprocess.TimeoutExpired:
            findings.append(Finding(
                rule_id="semgrep/timeout",
                message="Semgrep scan timed out",
                severity=Severity.warning,
            ))
        except Exception as e:
            findings.append(Finding(
                rule_id="semgrep/error",
                message=f"Semgrep error: {e}",
                severity=Severity.warning,
            ))
        
        return findings
