#!/usr/bin/env bash
# Validate paper metadata in _papers/ for completeness.
# Exit 0 if all papers pass, exit 1 if any issues found.
set -euo pipefail

PAPERS_DIR="${1:-_papers}"
errors=0

for file in "$PAPERS_DIR"/*.md; do
  slug=$(basename "$file" .md)
  front=$(sed -n '/^---$/,/^---$/p' "$file")

  # Required fields
  for field in title authors venue date type; do
    if ! echo "$front" | grep -q "^${field}:"; then
      echo "ERROR [$slug]: missing required field '$field'"
      errors=$((errors + 1))
    fi
  done

  # Check for placeholder BibTeX
  if echo "$front" | grep -qE "bibtex:\s*'@\w+\{\}'"; then
    echo "ERROR [$slug]: placeholder BibTeX (@type{})"
    errors=$((errors + 1))
  fi

  # Check type value
  type_val=$(echo "$front" | grep '^type:' | sed 's/type:\s*//' | tr -d '[:space:]')
  if [ -n "$type_val" ] && [ "$type_val" != "international" ] && [ "$type_val" != "domestic" ]; then
    echo "ERROR [$slug]: invalid type '$type_val' (expected international or domestic)"
    errors=$((errors + 1))
  fi
done

if [ "$errors" -gt 0 ]; then
  echo ""
  echo "Found $errors issue(s) in paper metadata."
  exit 1
else
  echo "All papers pass validation."
  exit 0
fi
