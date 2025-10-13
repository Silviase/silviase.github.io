# Repository Guidelines

## Project Structure & Module Organization

`index.md` (layout `home`) builds the landing page from data files in `_data/`. Additional pages sit in `pages/` with explicit permalinks (`/cv/`, `/papers/`, `/blog/`) and reuse layouts in `_layouts/`. `pages/cv.md` uses the `cv` layout plus `assets/css/cv.css` for a résumé-styled presentation and pulls publication metadata from `_data/cv_publications.yml`. Papers live in `_papers/` (one Markdown file per entry) and compile to `/papers/<slug>/`, with PDFs stored under `assets/papers/`. Blog posts are dated Markdown files in `_posts/`. Shared markup resides in `_includes/`, navigation items in `_data/navigation.yml`, and global assets in `assets/` (`css/main.css`, `js/site.js`, images). `_site/` is generated output only—delete it freely, never edit.

## Build, Test, and Development Commands

Run `npm install` once. Use `npm run format` for write-mode fixes or `npm run format:check` / `npm run lint:md:check` before pushing. `pre-commit run --all-files` mirrors the hook stack. For a local preview install the GitHub Pages toolchain (`bundle install --path vendor/bundle`) and serve with `bundle exec jekyll serve --livereload --incremental`.

## Coding Style & Naming Conventions

Prettier enforces two-space indentation, LF endings, single quotes in JavaScript, and a 100-character prose width (120 for HTML). Markdown headings follow ATX syntax per `.markdownlint.json`. Keep front matter predictable: pages need `title` / `permalink`, posts need `title` / `date` (optional `excerpt`), papers require `title`, `authors`, `venue` or `journal`, `date`, `type`, with optional `pdf`, `code_link`, and `bibtex`. Store local PDFs in `assets/papers/` and pull shared Liquid snippets into `_includes/` to stay DRY.

## Testing & Quality Checks

Run `bundle exec jekyll build` to catch Liquid or permalink issues, then spot-check `_site/` rendering. Follow with `npm run format:check` and `pre-commit run --all-files` for formatting, linting, and spell checking. New binaries must remain under the 5 MB `check-added-large-files` guardrail.

## Commit & Pull Request Guidelines

Use short, imperative commit subjects (optionally prefixed with `feat:`, `fix:`, etc.) and keep related changes in the same commit. PRs should state intent, link issues, and include screenshots or clips for visual updates. Call out regenerated artefacts and summarize manual verification steps performed locally.

## Content Workflow Tips

Add papers by creating a Markdown file in `_papers/`, setting `type` (`international` or `domestic`) and `pdf` (relative path or external URL); the index and metadata pages update automatically. Keep `_data/cv_publications.yml` in sync when adding or reclassifying publications so the résumé view stays accurate. For the text CV page, edit `pages/cv.md`, which renders content from `_data/` and `site.papers` using Liquid. For blog updates, add a dated Markdown file to `_posts/` and rely on the opening paragraph or an explicit `excerpt` for listings. Remove obsolete entries instead of commenting them out to keep collections tidy.
