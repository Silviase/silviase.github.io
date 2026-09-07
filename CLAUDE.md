# Repository guidance

This is an Astro static research portfolio hosted on GitHub Pages at `https://silviase.com`.
Read `README.md` for development, content, and deployment details.

- Use `npm ci`, `npm run dev`, `npm run check`, `npm run build`, and `npm test`.
- `npm test` validates generated output, so build first.
- Run `npm run format:check` before submitting changes.
- Preserve existing `/papers/<filename>/`, `/blog/<title>/`, and `/assets/...` URLs.
- Keep content in `_papers/`, `_posts/`, and `_data/`; keep PDFs in `public/assets/papers/`.
- Update `_data/cv_publications.yml` when adding CV metadata.
- Preserve Coral design tokens from the sibling `slides/themes/coral.css`.
- `dist/`, `.astro/`, and `output/` are generated and ignored.
- Pushes to `master` trigger deployment; PRs run validation only.
