import { readFile, writeFile } from 'node:fs/promises';

const sourcePath = process.argv[2];
const outputPath = process.argv[3] ?? 'public/assets/maps/natural-earth-france-rivers.svg';
if (!sourcePath)
  throw new Error(
    'Usage: node scripts/generate-france-rivers.mjs <Natural Earth rivers GeoJSON> [output.svg]'
  );

const data = JSON.parse(await readFile(sourcePath, 'utf8'));
const fmt = (value) => Number(value.toFixed(3));
const escape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;');
const wanted = /^(Rhône|Loire|Seine|Garonne)$/i;
const paths = [];
for (const feature of data.features ?? []) {
  const name = feature.properties?.name ?? feature.properties?.NAME ?? '';
  if (!wanted.test(name)) continue;
  const geometry = feature.geometry;
  const lines =
    geometry?.type === 'LineString'
      ? [geometry.coordinates]
      : geometry?.type === 'MultiLineString'
        ? geometry.coordinates
        : [];
  for (const line of lines) {
    const d = line.map(([lon, lat], i) => `${i ? 'L' : 'M'}${fmt(lon)},${fmt(-lat)}`).join(' ');
    if (d)
      paths.push(
        `    <path class="river-line" data-name="${escape(name)}" vector-effect="non-scaling-stroke" stroke-width="1.2" d="${d}"/>`
      );
  }
}
if (!paths.length)
  throw new Error('No named French river features were found in the supplied Natural Earth data.');
const svg = [
  '<svg xmlns="http://www.w3.org/2000/svg">',
  '  <!-- Natural Earth Rivers + Lake Centerlines, 1:50m, GeoJSON mirror 3.3.0. Public domain. -->',
  '  <!-- https://www.naturalearthdata.com/downloads/50m-physical-vectors/50m-rivers-lake-centerlines/ -->',
  '  <g id="rivers" fill="none" stroke="#4897b5" stroke-width="0.22" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round">',
  ...paths,
  '  </g>',
  '</svg>',
  '',
].join('\n');
await writeFile(outputPath, svg, 'utf8');
console.log(`Wrote ${paths.length} named river segments to ${outputPath}`);
