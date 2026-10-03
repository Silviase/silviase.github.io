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

### Dependency security

The 2026-10-03 update upgrades Astro to 7.3.5, devalue to 5.9.4,
brace-expansion to 5.0.12, and fast-uri to 3.1.8. The scoped `js-yaml` override
keeps markdownlint-cli on a patched 5.4.2-compatible version until its own
dependency range includes the fix.

[GHSA-ch52-4w7c-c8xp](https://github.com/advisories/GHSA-ch52-4w7c-c8xp)
remains open: http-cache-semantics 4.2.0 has no published fix as of 2026-10-03.
Astro uses it for remote image caching at build time. This repository generates
static output for GitHub Pages, uses local images, and has no application server
or shared authenticated response cache. The reported cross-user request path is
therefore not exposed by this deployment. This is an exposure assessment, not a
patched dependency; reassess before enabling SSR or shared response caching and
upgrade when a patched release becomes available. `npm audit` reports both this
package and its dependent Astro for the same advisory.

Use npm 11.19.0 when regenerating the lockfile, matching the version used to
verify the clean install. Older npm versions can omit optional dependency entries
required by newer npm during `npm ci`.

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

## Drink gallery

`_data/beverage-labels.json` supplies `/labels/` and the individual `/labels/<id>/` pages.
Cards show a label or bottle image and a short name; the detail page contains the
producer, origin, vintage, notes, and source links. Search and filters are restored
when returning from a detail page. A detail's map link selects its origin in the explorer.

Public images live in `public/assets/labels/`. Each optional `image` record includes
`src`, `alt`, `sourceUrl` (the credited product page), and `originalUrl` (the collected
asset). Images are references for the named drink; vintage and batch may differ from
the drinking record. UCHU's supplied PDF artwork is rendered as PNG. Preserve source
credits when replacing images, and use a matching product image rather than a
producer's generic logo. Entries awaiting an identified image keep their detail page
and display a small photo placeholder. Existing text and origin metadata remain the
record of what was identified from the original collection.

`npm run dev` and `npm run build` prepare local WebP variants automatically: 480px
thumbnails for the gallery and up to 1200px images for detail pages. Generated files
in `public/assets/labels/optimized/` are ignored by Git; generation uses the checked-in
source images and needs no network access. After adding or replacing an image during
development, run `npm run images:prepare`. The gallery sets native lazy loading before
assigning each image URL, so offscreen images do not start eager downloads.
