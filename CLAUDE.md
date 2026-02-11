# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Jekyll-based personal portfolio and CV website hosted on GitHub Pages. The site features academic publications, a blog, and personal information.

## Common Development Commands

### Local Development

```bash
bundle install --path vendor/bundle   # First-time setup
bundle exec jekyll serve --livereload --incremental  # Local preview at http://localhost:4000
bundle exec jekyll build              # Build to _site/ (catches Liquid/permalink issues)
```

### Formatting & Linting

```bash
npm install                    # First-time setup
npm run format                 # Auto-fix formatting (Prettier + markdownlint)
npm run format:check           # Check formatting without changes
npm run lint:md:check          # Check markdown without changes
pre-commit run --all-files     # Run all pre-commit hooks
```

### Deployment

Push to `master` branch triggers automatic GitHub Actions deployment.

## Architecture & Structure

### Layout Hierarchy

```
default.html (base shell)
├── home.html    → Landing page (pulls from _data/*)
├── paper.html   → Individual paper detail
├── papers.html  → Publication index (grouped by venue type)
├── cv.html      → Résumé page (uses _data/cv_publications.yml)
├── blog.html    → Blog listing
└── post.html    → Individual blog post
```

### Collections & Data

- **Papers** (`_papers/`): One Markdown file per paper, generates pages at `/papers/<slug>/`
- **Posts** (`_posts/`): Dated Markdown files (YYYY-MM-DD-title.md)
- **Data files** (`_data/`): profile, navigation, education, awards, skills, cv_publications

### Key Files

- `_config.yml`: Jekyll configuration (collections, defaults, plugins)
- `assets/css/main.css`: Global styling for every layout
- `assets/js/site.js`: BibTeX copy-to-clipboard functionality
- `_includes/`: Shared Liquid snippets (header, footer, paper-card, etc.)

## Content Conventions

### Paper Frontmatter

Required: `title`, `authors`, `venue` or `journal`, `date`, `type` (international/domestic)
Optional: `pdf`, `code_link`, `bibtex`, `description`

Store PDFs in `assets/papers/`. When adding papers, keep `_data/cv_publications.yml` in sync for the CV page.

### Post Frontmatter

Required: `title`, `date`
Optional: `excerpt`, `author`

## Notes

- `_site/` is generated output—never edit, safe to delete
- Pre-commit hooks enforce 5 MB file size limit
