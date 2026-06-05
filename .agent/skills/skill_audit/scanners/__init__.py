"""Security scanners for skill-audit."""

from typing import List, Type

from skill_audit.core.scanner import Scanner
from skill_audit.scanners.prompt import PromptScanner
from skill_audit.scanners.secrets import SecretsScanner
from skill_audit.scanners.shellcheck import ShellCheckScanner
from skill_audit.scanners.semgrep import SemgrepScanner


def get_all_scanners() -> List[Type[Scanner]]:
    """Return all available scanner classes."""
    return [
        PromptScanner,
        SecretsScanner,
        ShellCheckScanner,
        SemgrepScanner,
    ]


__all__ = [
    "get_all_scanners",
    "PromptScanner",
    "SecretsScanner", 
    "ShellCheckScanner",
    "SemgrepScanner",
]
