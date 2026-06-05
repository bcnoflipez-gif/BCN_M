"""Prompt injection scanner - checks skill descriptions for jailbreak patterns."""

import re
from pathlib import Path
from typing import List, Tuple

from skill_audit.core.scanner import Finding, Scanner, ScanResult, Severity


# Patterns that indicate potential prompt injection or jailbreaking
JAILBREAK_PATTERNS: List[Tuple[str, str, Severity]] = [
    # Direct instruction override
    (r"ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|rules?)", 
     "Attempts to override previous instructions", Severity.error),
    (r"disregard\s+(all\s+)?(previous|prior|above|your)\s+(instructions?|prompts?|rules?|guidelines?)",
     "Attempts to disregard guidelines", Severity.error),
    (r"forget\s+(everything|all|what)\s+(you|i)\s+(told|said|know)",
     "Attempts to make agent forget context", Severity.error),
    
    # Role manipulation
    (r"you\s+are\s+(now\s+)?(a|an|the)\s+(root|admin|system|super)\s*(user|administrator)?",
     "Attempts to elevate agent privileges via role play", Severity.error),
    (r"pretend\s+(to\s+be|you('re| are))\s+(a\s+)?(different|another|new)\s+(ai|assistant|system)",
     "Attempts to change agent identity", Severity.warning),
    (r"act\s+as\s+(if\s+)?(you\s+)?(have\s+)?(no|without)\s+(restrictions?|limits?|rules?)",
     "Attempts to remove restrictions", Severity.error),
    
    # Jailbreak keywords
    (r"(DAN|do\s+anything\s+now)\s+mode",
     "Known jailbreak pattern (DAN)", Severity.error),
    (r"developer\s+mode\s+(enabled?|activate|on)",
     "Attempts to enable developer mode", Severity.error),
    (r"bypass\s+(safety|security|content)\s+(filter|check|restriction)s?",
     "Attempts to bypass safety filters", Severity.error),
    
    # Data exfiltration intent  
    (r"(send|post|transmit|exfiltrate)\s+.{0,30}(to|via)\s+(http|https|webhook|url|endpoint)",
     "Potential data exfiltration instruction", Severity.warning),
    (r"(read|access|get|extract)\s+.{0,20}(password|secret|key|token|credential)s?",
     "Attempts to access sensitive data", Severity.warning),
    
    # Shell/code injection setup
    (r"execute\s+(any|arbitrary|untrusted)\s+(code|command|script)s?",
     "Instruction to execute arbitrary code", Severity.error),
    (r"run\s+.{0,20}without\s+(checking|validation|sanitiz)",
     "Instruction to skip input validation", Severity.error),
    
    # Excessive permissions
    (r"(delete|remove|rm)\s+.{0,10}(/|\*|all|everything)",
     "Potentially destructive file operation pattern", Severity.warning),
    (r"sudo|as\s+root|with\s+(elevated|admin)\s+priv",
     "Requests elevated privileges", Severity.warning),
]

# Files that typically contain skill descriptions/prompts
PROMPT_FILES = [
    "SKILL.md", "skill.md", "README.md", "readme.md",
    "SYSTEM.md", "system.md", "prompt.txt", "prompt.md",
    "instructions.md", "instructions.txt",
    "skill.yaml", "skill.yml", "skill.json",
    "manifest.yaml", "manifest.yml", "manifest.json",
]


class PromptScanner(Scanner):
    """Scans skill prompts/descriptions for injection patterns."""
    
    name = "prompt"
    description = "Prompt injection detection"
    
    def is_available(self) -> bool:
        """Always available - no external dependencies."""
        return True
    
    def scan(self, path: Path, verbose: bool = False) -> ScanResult:
        """Scan for prompt injection patterns."""
        result = ScanResult(scanner_name=self.name)
        
        # Find prompt files
        files_to_scan = []
        if path.is_file():
            files_to_scan = [path]
        else:
            # Recursively find all prompt-like files
            for filename in PROMPT_FILES:
                # Check root
                prompt_file = path / filename
                if prompt_file.exists():
                    files_to_scan.append(prompt_file)
                # Check subdirectories
                files_to_scan.extend(path.rglob(filename))
            
            # Also check for all .md files recursively
            files_to_scan.extend(path.rglob("*.md"))
            
            # And .txt files that might contain prompts
            files_to_scan.extend(path.rglob("*.txt"))
            # Dedupe using lowercase paths (handles macOS case-insensitivity)
            seen = set()
            unique_files = []
            for f in files_to_scan:
                key = str(f.resolve()).lower()
                if key not in seen:
                    seen.add(key)
                    unique_files.append(f)
            files_to_scan = unique_files
        
        result.files_scanned = len(files_to_scan)
        
        for file in files_to_scan:
            findings = self._scan_file(file)
            for f in findings:
                f.scanner = self.name
            result.findings.extend(findings)
        
        return result
    
    def _scan_file(self, file: Path) -> List[Finding]:
        """Scan a single file for patterns."""
        findings = []
        
        try:
            content = file.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            return findings
        
        lines = content.split("\n")
        
        for pattern, message, severity in JAILBREAK_PATTERNS:
            regex = re.compile(pattern, re.IGNORECASE)
            
            for line_num, line in enumerate(lines, 1):
                if regex.search(line):
                    findings.append(Finding(
                        rule_id=f"prompt/{pattern[:20].replace(' ', '-')}",
                        message=message,
                        severity=severity,
                        file=file,
                        line=line_num,
                        snippet=line.strip()[:100],
                    ))
        
        return findings
