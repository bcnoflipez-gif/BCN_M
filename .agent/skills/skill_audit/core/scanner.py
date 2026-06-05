"""Base scanner interface."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import List, Optional


class Severity(str, Enum):
    """Finding severity levels."""
    error = "error"
    warning = "warning"
    info = "info"


@dataclass
class Finding:
    """A single security finding."""
    rule_id: str
    message: str
    severity: Severity
    file: Optional[Path] = None
    line: Optional[int] = None
    column: Optional[int] = None
    scanner: str = ""
    snippet: Optional[str] = None
    
    def to_sarif(self) -> dict:
        """Convert to SARIF result format."""
        result = {
            "ruleId": self.rule_id,
            "message": {"text": self.message},
            "level": self.severity.value if self.severity != Severity.info else "note",
        }
        
        if self.file:
            location = {
                "physicalLocation": {
                    "artifactLocation": {"uri": str(self.file)},
                }
            }
            if self.line:
                location["physicalLocation"]["region"] = {
                    "startLine": self.line,
                }
                if self.column:
                    location["physicalLocation"]["region"]["startColumn"] = self.column
            result["locations"] = [location]
        
        return result


@dataclass
class ScanResult:
    """Result from a single scanner."""
    scanner_name: str
    findings: List[Finding] = field(default_factory=list)
    files_scanned: int = 0
    skipped: bool = False
    skip_reason: Optional[str] = None
    error: Optional[str] = None


class Scanner(ABC):
    """Base class for all scanners."""
    
    name: str = "base"
    description: str = "Base scanner"
    
    @abstractmethod
    def is_available(self) -> bool:
        """Check if this scanner can run (dependencies available)."""
        pass
    
    @abstractmethod
    def scan(self, path: Path, verbose: bool = False) -> ScanResult:
        """
        Scan the given path for security issues.
        
        Args:
            path: Path to skill directory or file
            verbose: Whether to output verbose information
            
        Returns:
            ScanResult with any findings
        """
        pass
    
    def get_relevant_files(self, path: Path, extensions: List[str]) -> List[Path]:
        """Get files matching the given extensions."""
        if path.is_file():
            if path.suffix in extensions:
                return [path]
            return []
        
        files = []
        for ext in extensions:
            files.extend(path.rglob(f"*{ext}"))
        return files
