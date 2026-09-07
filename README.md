# Koki Maeda / silviase.com

Personal research portfolio built with Astro 7, TypeScript, and CSS. The visual system follows `slides/themes/coral.css`: white surfaces, the Coral gray ramp, blue accents, fine rules, generous spacing, and Inter / Noto Sans JP / JetBrains Mono typography. Fonts are served locally.

## Development

Use Node.js 24.15 or newer (Node 24 is used in CI).

```bash
npm ci
npm run dev
```

Open `http://localhost:4321`. To verify the production output:

```bash
npm run check
npm run format:check
npm run build
npm test
npm run preview
```

`npm test` checks the generated site, including every existing paper and post route, local links/assets, canonical URLs, domain file, sitemap, and RSS. Run it after building.

## Content and structure

- `_papers/*.md`: publication metadata and Markdown bodies. Astro validates these through `src/content.config.ts`.
- `_posts/*.md`: dated Markdown notes. The date prefix is removed from the public URL.
- `_data/*.yml`: profile, research themes, background, UI labels, and CV publication metadata.
- `src/pages/`: statically generated pages and endpoints.
- `src/components/`, `src/layouts/`: shared Astro components.
- `src/styles/global.css`: Coral tokens, responsive layout, dark theme, and print styles.
- `src/scripts/projection-lab.js`: existing interactive PCA demo, with Three.js bundled from npm.
- `public/assets/`: PDFs, portrait, images, and logos. Their public `/assets/...` URLs are unchanged.

Publication IDs preserve the original filenames, including underscores: `_papers/2026_jawildtext.md` becomes `/papers/2026_jawildtext/`. `_posts/2025-12-18-blog-post-template.md` remains `/blog/blog-post-template/`. Content remains editable as Markdown and YAML; Liquid template syntax is no longer supported. UI labels retain the EN/JP switch; research content keeps its original language.

## GitHub Pages and silviase.com

The site generates ordinary HTML/CSS/JS into `dist/`. It requires no application server, edge runtime, or hosting service beyond GitHub Pages.

- `astro.config.mjs`: `site: 'https://silviase.com'`, static output, trailing slashes. No repository subpath is needed for this custom domain.
- `public/CNAME`: `silviase.com`, copied into the build. The root `CNAME` is retained and checked for consistency.
- `public/.nojekyll`: prevents Jekyll processing of the generated site.
- `.github/workflows/deploy.yml`: validates PRs; builds and deploys `master` with the GitHub Pages artifact/deployment actions.
- Repository **Settings → Pages → Source** must be **GitHub Actions**; the custom domain remains **silviase.com**. Keep the existing DNS records and HTTPS configuration.

The migration replaces the Jekyll/Ruby build and templates, preserves the existing public routes and content, and retains `/feed.xml`. Sitemap entrypoint: `/sitemap-index.xml`; the original `/sitemap.xml` also works. Publication search, filters, clipboard actions, theme/language controls, and the PCA demo use small page-specific scripts; other content is prerendered.

Deployment follows the [Astro GitHub Pages guide](https://docs.astro.build/en/guides/deploy/github/).
