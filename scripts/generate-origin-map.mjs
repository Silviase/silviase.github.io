import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const sourcePath = process.argv[2];
const outputPath = process.argv[3] ?? 'public/assets/maps/natural-earth-admin-0-50m.svg';

if (!sourcePath) {
  console.error('Usage: node scripts/generate-origin-map.mjs <Natural Earth GeoJSON> [output.svg]');
  process.exitCode = 1;
} else {
  const data = JSON.parse(await readFile(sourcePath, 'utf8'));
  if (!Array.isArray(data.features)) throw new TypeError('Expected a GeoJSON FeatureCollection.');

  const xmlEscape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;');
  const fmt = (value) => Number(value.toFixed(3));
  const ringPath = (ring) => {
    const points = ring.map(([longitude, latitude]) => `${fmt(longitude)},${fmt(-latitude)}`);
    return points.length ? `M${points[0]} ${points.slice(1).join(' ')}Z` : '';
  };
  const featurePath = (feature) => {
    const { type, coordinates } = feature.geometry ?? {};
    const polygons =
      type === 'Polygon' ? [coordinates] : type === 'MultiPolygon' ? coordinates : [];
    return polygons
      .flatMap((polygon) => polygon.map(ringPath))
      .filter(Boolean)
      .join('');
  };
  const paths = data.features
    .filter((feature) => ['Polygon', 'MultiPolygon'].includes(feature.geometry?.type))
    .map((feature) => {
      const properties = feature.properties ?? {};
      const code = properties.ISO_A2_EH ?? properties.ISO_A2 ?? properties.ADM0_A3 ?? 'unknown';
      const name = properties.NAME_EN ?? properties.ADMIN ?? code;
      return `  <path id="country-${xmlEscape(code)}" data-code="${xmlEscape(code)}" aria-label="${xmlEscape(name)}" vector-effect="non-scaling-stroke" stroke-width="0.7" d="${featurePath(feature)}"/>`;
    });

  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg">',
    '  <!-- Natural Earth 5.1.1, Admin 0 Countries, 1:50m. Public domain. -->',
    '  <!-- https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-0-countries-2/ -->',
    '  <g id="countries" fill="#e4e9e7" stroke="#ffffff" stroke-width="0.18" vector-effect="non-scaling-stroke" fill-rule="evenodd" stroke-linejoin="round">',
    ...paths,
    '  </g>',
    '</svg>',
    '',
  ].join('\n');
  const absoluteOutput = resolve(outputPath);
  await writeFile(absoluteOutput, svg, 'utf8');
  console.log(`Wrote ${paths.length} country paths to ${absoluteOutput}`);
}
