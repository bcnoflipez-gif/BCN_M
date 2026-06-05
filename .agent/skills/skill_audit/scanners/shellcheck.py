"""ShellCheck scanner - wraps shellcheck for bash script analysis."""

import json
import subprocess
from pathlib import Path

from skill_audit.core.scanner import Finding, Scanner, ScanResult, Severity
from skill_audit.core.tools import is_tool_available


# Map shellcheck severity to our severity
SEVERITY_MAP = {
    "error": Severity.error,
    "warning": Severity.warning,
    "info": Severity.info,
    "style": Severity.info,
}


class ShellCheckScanner(Scanner):
    """Scans shell scripts using shellcheck."""
    
    name = "shellcheck"
    description = "Shell script static analysis"
    
    def is_available(self) -> bool:
        """Check if shellcheck is available."""
        return is_tool_available("shellcheck")
    
    def scan(self, path: Path, verbose: bool = False) -> ScanResult:
        """Scan shell scripts."""
        result = ScanResult(scanner_name=self.name)
        
        # Find shell scripts
        shell_files = self.get_relevant_files(path, [".sh", ".bash"])
        result.files_scanned = len(shell_files)
        
        if not shell_files:
            return result
        
        for shell_file in shell_files:
            findings = self._scan_file(shell_file, verbose)
            result.findings.extend(findings)
        
        return result
    
    def _scan_file(self, file: Path, verbose: bool) -> list[Finding]:
        """Run shellcheck on a single file."""
        findings = []
        
        try:
            cmd = [
                "shellcheck",
                "--format=json",
                "--severity=warning",  # Include warnings and above
                str(file),
            ]
            
            proc = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30,
            )
            
            # shellcheck returns non-zero if it finds issues, but still outputs JSON
            if proc.stdout.strip():
                try:
                    results = json.loads(proc.stdout)
                    for item in results:
                        severity = SEVERITY_MAP.get(item.get("level", "warning"), Severity.warning)
                        
                        findings.append(Finding(
                            rule_id=f"shellcheck/SC{item.get('code', '0000')}",
                            message=item.get("message", "Unknown issue"),
                            severity=severity,
                            file=file,
                            line=item.get("line"),
                            column=item.get("column"),
                            scanner=self.name,
                        ))
                except json.JSONDecodeError:
                    pass
                    
        except subprocess.TimeoutExpired:
            findings.append(Finding(
                rule_id="shellcheck/timeout",
                message=f"Shellcheck timed out on {file}",
                severity=Severity.warning,
                file=file,
                scanner=self.name,
            ))
        except Exception as e:
            findings.append(Finding(
                rule_id="shellcheck/error",
                message=f"Shellcheck error: {e}",
                severity=Severity.warning,
                file=file,
                scanner=self.name,
            ))
        
        return findings
