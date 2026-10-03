import { readFile, mkdir, stat } from 'node:fs/promises';
import sharp from 'sharp';

const catalog = JSON.parse(await readFile('_data/beverage-labels.json', 'utf8'));
const recipe = await stat(new URL(import.meta.url));
await mkdir('public/assets/labels/optimized', { recursive: true });
let total = 0;
for (const { id, image } of catalog) {
  if (!image) continue;
  const source = `public${image.src}`;
  const original = await stat(source);
  for (const [variant, size, quality] of [
    ['thumb', 480, 76],
    ['detail', 1200, 84],
  ]) {
    const target = `public/assets/labels/optimized/${id}-${variant}.webp`;
    const previous = await stat(target).catch(() => null);
    if (!previous || previous.mtimeMs < Math.max(original.mtimeMs, recipe.mtimeMs)) {
      await sharp(source)
        .rotate()
        .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
        .webp({ quality })
        .toFile(target);
    }
    if (variant === 'thumb') total += (await stat(target)).size;
  }
}
console.log(`Gallery thumbnails: ${(total / 1024).toFixed(0)} KiB total`);
