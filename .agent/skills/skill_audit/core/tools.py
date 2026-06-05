"""Tool availability checking."""

import shutil
import subprocess
from typing import Dict, Optional


def get_tool_version(cmd: str, version_flag: str = "--version") -> Optional[str]:
    """Try to get version string from a tool."""
    try:
        result = subprocess.run(
            [cmd, version_flag],
            capture_output=True,
            text=True,
            timeout=5,
        )
        if result.returncode == 0:
            # Return first line of output, truncated
            return result.stdout.strip().split("\n")[0][:50]
    except Exception:
        pass
    return None


def check_available_tools() -> Dict[str, dict]:
    """Check which security tools are available on the system."""
    tools = {
        "shellcheck": {
            "available": shutil.which("shellcheck") is not None,
            "version": get_tool_version("shellcheck"),
            "install_hint": "brew install shellcheck / apt install shellcheck",
            "description": "Shell script static analysis",
        },
        "semgrep": {
            "available": shutil.which("semgrep") is not None,
            "version": get_tool_version("semgrep"),
            "install_hint": "pip install semgrep / brew install semgrep",
            "description": "Multi-language static analysis",
        },
        "trufflehog": {
            "available": shutil.which("trufflehog") is not None,
            "version": get_tool_version("trufflehog"),
            "install_hint": "brew install trufflehog / go install github.com/trufflesecurity/trufflehog/v3@latest",
            "description": "Secret scanning",
        },
        "gitleaks": {
            "available": shutil.which("gitleaks") is not None,
            "version": get_tool_version("gitleaks", "version"),
            "install_hint": "brew install gitleaks",
            "description": "Secret scanning (alternative)",
        },
    }
    return tools


def is_tool_available(name: str) -> bool:
    """Check if a specific tool is available."""
    return shutil.which(name) is not None
