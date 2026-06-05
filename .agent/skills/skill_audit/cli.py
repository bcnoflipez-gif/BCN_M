"""CLI entry point for skill-audit."""

from pathlib import Path
from typing import Optional

import typer
from rich.console import Console

from skill_audit.core.aggregator import run_audit
from skill_audit.core.output import OutputFormat, print_results

app = typer.Typer(
    name="skill-audit",
    help="Security auditing CLI for AI agent skills",
)
console = Console()


@app.callback(invoke_without_command=True)
def main(
    ctx: typer.Context,
    path: Optional[Path] = typer.Argument(
        None,
        help="Path to skill directory or file to audit",
    ),
    format: OutputFormat = typer.Option(
        OutputFormat.pretty,
        "--format", "-f",
        help="Output format",
    ),
    output: Optional[Path] = typer.Option(
        None,
        "--output", "-o",
        help="Output file (default: stdout)",
    ),
    strict: bool = typer.Option(
        False,
        "--strict",
        help="Fail on warnings (not just errors)",
    ),
    verbose: bool = typer.Option(
        False,
        "--verbose", "-v",
        help="Verbose output",
    ),
):
    """
    Audit an AI agent skill for security issues.
    
    Usage: skill-audit <path>
    """
    # If a subcommand was invoked, don't run default
    if ctx.invoked_subcommand is not None:
        return
    
    # If no path provided, show help
    if path is None:
        console.print(ctx.get_help())
        raise typer.Exit(0)
    
    # Validate path exists
    if not path.exists():
        console.print(f"[red]Error: Path does not exist: {path}[/red]")
        raise typer.Exit(2)
    
    # Run the audit
    _run_audit(path, format, output, strict, verbose)


def _run_audit(
    path: Path,
    format: OutputFormat,
    output: Optional[Path],
    strict: bool,
    verbose: bool,
):
    """Internal audit implementation."""
    if verbose:
        console.print(f"[dim]Auditing: {path}[/dim]")
    
    # Check if this looks like a collection of skills rather than a single skill
    if path.is_dir():
        skill_files = list(path.glob("*/SKILL.md")) + list(path.glob("*/skill.md"))
        # Dedupe case-insensitive
        seen = set()
        unique_skills = []
        for sf in skill_files:
            key = str(sf).lower()
            if key not in seen:
                seen.add(key)
                unique_skills.append(sf.parent.name)
        
        if len(unique_skills) > 1:
            console.print(f"[yellow]⚠ Warning: Found {len(unique_skills)} skills in subdirectories:[/yellow]")
            for name in sorted(unique_skills)[:10]:
                console.print(f"  [dim]• {name}/[/dim]")
            if len(unique_skills) > 10:
                console.print(f"  [dim]• ... and {len(unique_skills) - 10} more[/dim]")
            console.print()
            console.print("[yellow]Consider auditing each skill separately:[/yellow]")
            console.print(f"  [dim]skill-audit {path}/<skill-name>/[/dim]")
            console.print()
    
    # Run all scanners
    results = run_audit(path, verbose=verbose)
    
    # Output results
    print_results(results, format=format, output=output)
    
    # Determine exit code
    has_errors = any(r.severity == "error" for r in results.findings)
    has_warnings = any(r.severity == "warning" for r in results.findings)
    
    if has_errors:
        raise typer.Exit(1)
    elif strict and has_warnings:
        raise typer.Exit(1)
    else:
        raise typer.Exit(0)


@app.command()
def check_tools():
    """Check which security tools are available."""
    from skill_audit.core.tools import check_available_tools
    
    tools = check_available_tools()
    
    console.print("\n[bold]Available Security Tools[/bold]\n")
    
    for tool, info in tools.items():
        status = "[green]✓[/green]" if info["available"] else "[red]✗[/red]"
        version = f"[dim]({info['version']})[/dim]" if info.get("version") else ""
        console.print(f"  {status} {tool} {version}")
        if not info["available"]:
            console.print(f"      [dim]Install: {info['install_hint']}[/dim]")
    
    console.print()


@app.command()
def version():
    """Show version information."""
    from skill_audit import __version__
    console.print(f"skill-audit {__version__}")


if __name__ == "__main__":
    app()
