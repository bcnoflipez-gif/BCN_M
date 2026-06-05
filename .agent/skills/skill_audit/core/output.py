"""Output formatters for audit results."""

import json
from enum import Enum
from pathlib import Path
from typing import Optional

from rich.console import Console
from rich.table import Table

from skill_audit.core.aggregator import AuditResult


class OutputFormat(str, Enum):
    """Output format options."""
    pretty = "pretty"
    json = "json"
    sarif = "sarif"


def print_results(
    results: AuditResult,
    format: OutputFormat = OutputFormat.pretty,
    output: Optional[Path] = None,
) -> None:
    """Print audit results in the specified format."""
    
    if format == OutputFormat.pretty:
        text = format_pretty(results)
    elif format == OutputFormat.json:
        text = format_json(results)
    elif format == OutputFormat.sarif:
        text = format_sarif(results)
    else:
        raise ValueError(f"Unknown format: {format}")
    
    if output:
        output.write_text(text)
    else:
        if format == OutputFormat.pretty:
            # Pretty format uses rich console directly
            pass
        else:
            print(text)


def format_pretty(results: AuditResult) -> str:
    """Format results for human reading."""
    console = Console()
    
    # Header
    console.print()
    console.print(f"[bold]Audit Results: {results.path}[/bold]")
    console.print()
    
    # Scanner status
    for sr in results.scanner_results:
        if sr.skipped:
            console.print(f"  [dim]⊘ {sr.scanner_name}: skipped ({sr.skip_reason})[/dim]")
        elif sr.error:
            console.print(f"  [red]✗ {sr.scanner_name}: error ({sr.error})[/red]")
        else:
            finding_count = len(sr.findings)
            files_info = f" [{sr.files_scanned} file(s)]" if sr.files_scanned else ""
            if finding_count == 0:
                console.print(f"  [green]✓ {sr.scanner_name}: passed[/green][dim]{files_info}[/dim]")
            else:
                console.print(f"  [yellow]! {sr.scanner_name}: {finding_count} finding(s)[/yellow][dim]{files_info}[/dim]")
    
    console.print()
    
    # Findings table
    if results.findings:
        table = Table(title="Findings")
        table.add_column("Severity", style="bold")
        table.add_column("Scanner")
        table.add_column("Rule")
        table.add_column("Message")
        table.add_column("Location")
        
        for f in sorted(results.findings, key=lambda x: (x.severity != "error", x.severity != "warning")):
            severity_style = {
                "error": "[red]ERROR[/red]",
                "warning": "[yellow]WARN[/yellow]",
                "info": "[blue]INFO[/blue]",
            }.get(f.severity, f.severity)
            
            location = ""
            if f.file:
                location = str(f.file)
                if f.line:
                    location += f":{f.line}"
            
            table.add_row(
                severity_style,
                f.scanner,
                f.rule_id,
                f.message,
                location,
            )
        
        console.print(table)
        console.print()
    
    # Summary
    if results.passed:
        console.print("[green bold]✓ PASSED[/green bold] - No errors found")
    else:
        console.print(f"[red bold]✗ FAILED[/red bold] - {results.error_count} error(s), {results.warning_count} warning(s)")
    
    console.print()
    return ""


def format_json(results: AuditResult) -> str:
    """Format results as JSON."""
    data = {
        "path": str(results.path),
        "passed": results.passed,
        "summary": {
            "errors": results.error_count,
            "warnings": results.warning_count,
            "info": results.info_count,
        },
        "findings": [
            {
                "rule_id": f.rule_id,
                "message": f.message,
                "severity": f.severity,
                "scanner": f.scanner,
                "file": str(f.file) if f.file else None,
                "line": f.line,
            }
            for f in results.findings
        ],
        "scanners": [
            {
                "name": sr.scanner_name,
                "skipped": sr.skipped,
                "skip_reason": sr.skip_reason,
                "error": sr.error,
                "finding_count": len(sr.findings),
            }
            for sr in results.scanner_results
        ],
    }
    return json.dumps(data, indent=2)


def format_sarif(results: AuditResult) -> str:
    """Format results as SARIF 2.1.0."""
    sarif = {
        "$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
        "version": "2.1.0",
        "runs": [
            {
                "tool": {
                    "driver": {
                        "name": "skill-audit",
                        "version": "0.1.0",
                        "informationUri": "https://github.com/markpors/skill-audit",
                        "rules": [],
                    }
                },
                "results": [f.to_sarif() for f in results.findings],
            }
        ],
    }
    return json.dumps(sarif, indent=2)
