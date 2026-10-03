import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const read = (path) => readFileSync(path, 'utf8');
function routeFromBuildFile(file) {
  return (
    '/' +
    file
      .replaceAll('\\', '/')
      .replace(/^dist\//, '')
      .replace(/index\.html$/, '')
  );
}
for (const [file, route] of [
  ['dist/404.html', '/404.html'],
  ['dist\\404.html', '/404.html'],
  ['dist\\labels\\index.html', '/labels/'],
  ['dist/papers/example/index.html', '/papers/example/'],
])
  assert.equal(
    routeFromBuildFile(file),
    route,
    'Build routes must be portable across path separators'
  );
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}
const papers = readdirSync('_papers').filter((name) => name.endsWith('.md'));
const posts = readdirSync('_posts').filter((name) => name.endsWith('.md'));
const required = [
  'index.html',
  'papers/index.html',
  'cv/index.html',
  'blog/index.html',
  'sandbox/index.html',
  'sandbox/projection-lab/index.html',
  'labels/index.html',
  '404.html',
  ...papers.map((name) => `papers/${name.replace(/\.md$/, '')}/index.html`),
  ...posts.map(
    (name) => `blog/${name.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '')}/index.html`
  ),
];
for (const path of required)
  assert.ok(existsSync(`dist/${path}`), `Missing existing route: ${path}`);
assert.equal(read('dist/CNAME').trim(), 'silviase.com');
assert.equal(read('dist/CNAME'), read('CNAME'), 'Root and deployed domain must match');
assert.ok(existsSync('dist/.nojekyll'));
assert.match(read('dist/sitemap-index.xml'), /https:\/\/silviase\.com\/sitemap-0\.xml/);
assert.match(read('dist/feed.xml'), /https:\/\/silviase\.com\/blog\//);
assert.equal((read('dist/papers/index.html').match(/data-paper /g) || []).length, papers.length);
const catalog = JSON.parse(read('_data/beverage-labels.json'));
const serializedCatalog = read('dist/labels/index.html').match(/data-labels="([^"]*)"/)?.[1];
assert.ok(serializedCatalog, 'Label route must include its catalog');
const decodedCatalog = serializedCatalog
  .replaceAll('&quot;', '"')
  .replaceAll('&#39;', "'")
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>')
  .replaceAll('&amp;', '&');
assert.deepEqual(
  JSON.parse(decodedCatalog),
  catalog,
  'Every manifest record must reach the built label route'
);
assert.equal(
  new Set(catalog.map((label) => label.id)).size,
  catalog.length,
  'Label IDs must be unique'
);
for (const label of catalog) {
  const detail = read(`dist/labels/${label.id}/index.html`);
  assert.ok(detail.includes('href="/labels/"'), `Missing gallery link: ${label.id}`);
  if (label.image) {
    assert.ok(existsSync(`dist${label.image.src}`), `Missing label image: ${label.id}`);
    const detailImage = `/assets/labels/optimized/${label.id}-detail.webp`;
    assert.ok(existsSync(`dist${detailImage}`), `Missing optimized detail: ${label.id}`);
    assert.ok(
      existsSync(`dist/assets/labels/optimized/${label.id}-thumb.webp`),
      `Missing thumbnail: ${label.id}`
    );
    assert.ok(detail.includes(detailImage), `Missing detail image: ${label.id}`);
    assert.ok(
      detail.includes(label.image.sourceUrl.replaceAll('&', '&amp;')),
      `Missing image credit: ${label.id}`
    );
  }
}
const errors = [];
const htmlFiles = walk('dist').filter((path) => path.endsWith('.html'));
for (const file of htmlFiles) {
  const html = read(file);
  const route = routeFromBuildFile(file);
  const url = new URL(route, 'https://silviase.com');
  assert.ok(html.includes(`rel="canonical" href="${url.href}"`), `Wrong canonical: ${file}`);
  assert.ok(!/<script[^>]+src="https?:/i.test(html), `External script in ${file}`);
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const value = match[1].replaceAll('&amp;', '&');
    if (!value || value.startsWith('#') || /^(?:mailto:|data:|tel:)/.test(value)) continue;
    const target = new URL(value, url);
    if (target.origin !== url.origin) continue;
    const path = `dist${decodeURIComponent(target.pathname)}`;
    if (!existsSync(path) && !existsSync(join(path, 'index.html')))
      errors.push(`${file} → ${target.pathname}`);
    if (value.includes('relative_url') || value.includes('{%'))
      errors.push(`Unconverted Liquid: ${file}`);
  }
}
assert.deepEqual(errors, [], `Broken internal links:\n${errors.join('\n')}`);
console.log(
  `Verified ${htmlFiles.length} HTML pages, ${papers.length} papers, ${posts.length} posts, internal links/assets, canonical URLs, CNAME, sitemap, and RSS.`
);
