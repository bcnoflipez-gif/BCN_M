"""Aggregates results from all scanners."""

from dataclasses import dataclass, field
from pathlib import Path
from typing import List

from skill_audit.core.scanner import Finding, ScanResult


@dataclass
class AuditResult:
    """Aggregated results from all scanners."""
    path: Path
    findings: List[Finding] = field(default_factory=list)
    scanner_results: List[ScanResult] = field(default_factory=list)
    
    @property
    def error_count(self) -> int:
        return sum(1 for f in self.findings if f.severity == "error")
    
    @property
    def warning_count(self) -> int:
        return sum(1 for f in self.findings if f.severity == "warning")
    
    @property
    def info_count(self) -> int:
        return sum(1 for f in self.findings if f.severity == "info")
    
    @property
    def passed(self) -> bool:
        return self.error_count == 0


def run_audit(path: Path, verbose: bool = False) -> AuditResult:
    """
    Run all available scanners on the given path.
    
    Args:
        path: Path to skill directory or file
        verbose: Whether to output verbose information
        
    Returns:
        Aggregated AuditResult
    """
    from skill_audit.scanners import get_all_scanners
    
    result = AuditResult(path=path)
    
    for scanner_class in get_all_scanners():
        scanner = scanner_class()
        
        if not scanner.is_available():
            scan_result = ScanResult(
                scanner_name=scanner.name,
                skipped=True,
                skip_reason=f"{scanner.name} not available",
            )
        else:
            try:
                scan_result = scanner.scan(path, verbose=verbose)
            except Exception as e:
                scan_result = ScanResult(
                    scanner_name=scanner.name,
                    error=str(e),
                )
        
        result.scanner_results.append(scan_result)
        result.findings.extend(scan_result.findings)
    
    return result
