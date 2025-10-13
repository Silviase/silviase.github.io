# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Jekyll-based personal portfolio and CV website hosted on GitHub Pages. The site features academic publications, a blog, and personal information.

## Common Development Commands

### Local Development

- `jekyll serve` - Run the site locally with live reload (default: <http://localhost:4000>)
- `jekyll build` - Build the site to `_site/` directory

### Deployment

- Push to `master` branch triggers automatic GitHub Actions deployment
- No manual deployment steps required

## Known Issues

### Papers Collection Configuration

The site uses a `papers` collection (renamed from 'publications' for clarity). The configuration in `_config.yml` includes:

```yaml
collections:
  papers:
    output: true
    permalink: /papers/:name/
```

## Architecture & Structure

### Collections

- **Papers** (`_papers/`): Academic papers in Markdown format with frontmatter metadata. Each file generates an individual page.

### Key Files

- `_config.yml`: Jekyll configuration (collections, defaults, plugins)
- `assets/css/main.css`: Global styling for every layout
- `assets/js/site.js`: Lightweight enhancements (BibTeX copy helpers)
- `_data/`: Structured content for navigation, profile, education, awards, and skills

### Layout Templates

- `_layouts/default.html`: Base shell shared by all pages
- `_layouts/home.html`: Landing page composition powered by `_data/*`
- `_layouts/paper.html`: Detail view for individual papers (with metadata tags)
- `_layouts/papers.html`: Publication index grouped by venue type
- `_layouts/blog.html` & `_layouts/post.html`: Blog listing and individual post layout

### GitHub Actions

The site uses GitHub Actions workflow (`.github/workflows/jekyll-gh-pages.yml`) for automated building and deployment to GitHub Pages on push to master branch.
