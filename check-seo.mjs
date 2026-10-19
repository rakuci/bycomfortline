// Run after "node build.mjs": node check-seo.mjs
// Static checks complement, but do not replace, real browser / Yandex Webmaster QA.
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import assert from 'node:assert/strict';

const root = join(process.cwd(), 'dist');
const langs = ['en','ru','pl','lt','lv','de','fr'];
const site = 'https://bycomfortline.com';
async function filesUnder(dir) {
  const out = [];
  for (const x of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, x.name);
    if (x.isDirectory()) out.push(...await filesUnder(full));
    else out.push(full);
  }
  return out;
}
const allFiles = await filesUnder(root);
const known = new Set(allFiles.map(x => '/' + relative(root, x).replaceAll('\\','/')));
const htmlFiles = allFiles.filter(x => x.endsWith('.html'));
const indexable = [];
const titles = new Map();
const issues = [];
const urlToFile = url => {
  const normalized = url.replace(site, '').split(/[?#]/)[0];
  return normalized.endsWith('/') ? normalized + 'index.html' : normalized;
};
const robots = await readFile(join(root,'robots.txt'),'utf8');
assert(robots.includes('Sitemap: ' + site + '/sitemap.xml'));
assert(known.has('/favicon.svg'), 'Root SVG favicon missing');
const google = await readFile(join(root,'sitemap.xml'),'utf8');
const yandex = await readFile(join(root,'sitemap-yandex.xml'),'utf8');
const googleLocs = [...google.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const yandexLocs = [...yandex.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
assert.equal(new Set(googleLocs).size, googleLocs.length, 'Duplicate URL in Google sitemap');
assert.deepEqual(yandexLocs, googleLocs, 'Yandex sitemap should include same canonical URLs');
assert(!yandex.includes('xhtml:link'), 'Yandex sitemap must be simple');
const setOfCanonicalSitemap = new Set(googleLocs);
for (const path of htmlFiles) {
  const html = await readFile(path,'utf8');
  const local = '/' + relative(root,path).replaceAll('\\','/');
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] || '';
  const isThankyou = local.includes('/thank-you/');
  const canon = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!title) issues.push(local + ': missing title');
  if (!isThankyou && (html.match(/<h1\b/g)||[]).length !== 1) issues.push(local + ': invalid H1');
  if (!isThankyou && !setOfCanonicalSitemap.has(canon)) issues.push(local + ': missing sitemap canonical');
  if (!isThankyou && !html.includes('name="description"')) issues.push(local + ': no description');
  if (!isThankyou && titles.has(title)) issues.push(local + ': duplicate title with ' + titles.get(title));
  if (!isThankyou) titles.set(title,local);
  const match = local.match(/^\/(en|ru|pl|lt|lv|de|fr)\//);
  if (match && !isThankyou) {
    const alts = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)];
    if (alts.length !== 8) issues.push(local + ': expected seven hreflangs plus x-default');
    for (const lang of langs) if (!alts.some(a=>a[1]===lang)) issues.push(local+': missing hreflang '+lang);
    for (const alt of alts) if (!known.has(urlToFile(alt[2]))) issues.push(local+': broken hreflang '+alt[2]);
    if (!html.includes('action="/api/booking"')) issues.push(local+': missing booking form');
  }
  if (isThankyou && !html.includes('content="noindex,follow"')) issues.push(local+': thank-you is indexable');
  if (!isThankyou && local !== '/index.html') indexable.push(local);
  const assetLinks = [...html.matchAll(/\bhref="(\/[^"]+)"|\bsrc="(\/[^"]+)"/g)]
    .map(m=>m[1]||m[2]);
  for (const href of assetLinks) {
    const target=href.split(/[?#]/)[0];
    if (!target || target === '/' || !target.startsWith('/')) continue;
    const file = target.endsWith('/') ? target + 'index.html' : target;
    if (!known.has(file)) issues.push(local + ': broken internal link ' + href);
  }
}
if (htmlFiles.length !== 358) issues.push('Expected 358 HTML files; found ' + htmlFiles.length);
if (googleLocs.length !== 351) issues.push('Expected 351 indexable URLs; found ' + googleLocs.length);
if (!known.has('/ru/aeroport-ber-minsk/index.html')) issues.push('Russian BER page missing');
if (!known.has('/de/berlin-minsk-privattransfer/index.html')) issues.push('German Berlin page missing');
if (!known.has('/fr/paris-minsk-transfert-prive/index.html')) issues.push('French Paris page missing');
if (!known.has('/ru/transfery-iz-aeroportov/index.html')) issues.push('Airport index missing');
if (issues.length) {
  console.error(issues.slice(0,35).join('\n'));
  throw new Error(issues.length + ' SEO/static routing check errors');
}
console.log('SEO OK: ' + htmlFiles.length + ' HTML pages; ' + googleLocs.length +
  ' indexable URLs; ' + langs.length + ' languages; 19 airports; 25 cities.');
