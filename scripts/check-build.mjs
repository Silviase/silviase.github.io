import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const read = (path) => readFileSync(path, 'utf8');
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
const errors = [];
const htmlFiles = walk('dist').filter((path) => path.endsWith('.html'));
for (const file of htmlFiles) {
  const html = read(file);
  const route = '/' + file.replace(/^dist\//, '').replace(/index\.html$/, '');
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
