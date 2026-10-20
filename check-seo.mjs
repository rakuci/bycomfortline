// Run after "node build.mjs": node check-seo.mjs
// Static checks complement, but do not replace, real browser / Yandex Webmaster QA.
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import assert from 'node:assert/strict';
import { geoAirports } from './geo-airports.mjs';
import { heritageRoutePhotos, heritagePhotoByCountry } from './heritage-route-photos.mjs';

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

const cityPhotos = JSON.parse(await readFile(join(process.cwd(),'city-landmark-photos.json'),'utf8')).images;
const imageIds=new Set(cityPhotos.map(photo=>photo.id));
if(imageIds.size!==cityPhotos.length)throw new Error("Duplicate landmark image IDs");
const necessaryPlaces=[
  'baranovichi','berlin','bialystok','brest','bydgoszcz',
  'daugavpils','druskininkai','gdansk','gomel','grodno',
  'jelgava','jurmala','katowice','kaunas','klaipeda',
  'krakow','lida','liepaja','lodz','lublin','minsk','mogilev',
  'olsztyn','panevezys','paris','pinsk','poznan','rezekne',
  'riga','rzeszow','suwalki','wroclaw','szczecin','siauliai',
  'vitebsk','msq','warsaw','vilnius'
];
for(const id of necessaryPlaces){
  if(!imageIds.has(id))throw new Error("Missing city landmark image catalogue record: "+id);
}
for(const photo of cityPhotos){
  for(const l of ['en','ru','pl','lt','lv','de','fr']){
    if(!photo.labels?.[l]||!photo.licenseUrl||!photo.sourcePage)
      throw new Error("Missing translation/licence for city image: "+photo.id+"/"+l);
  }
}

const photoIds = new Set(heritageRoutePhotos.map(p=>p.id));
assert.equal(photoIds.size, heritageRoutePhotos.length, 'Duplicate heritage photo ID');
for(const country of ['PL','LT','LV','DE','FR']){
  assert(photoIds.has(heritagePhotoByCountry[country]), 'Missing country heritage photo '+country);
}
for(const p of heritageRoutePhotos){
  assert(p.url.startsWith('https://upload.wikimedia.org/wikipedia/commons/thumb/'),
    'Heritage photo must use a verified Wikimedia HTTPS source: '+p.id);
  assert(p.sourcePage.startsWith('https://commons.wikimedia.org/wiki/File:'),
    'Missing Wikimedia attribution file page: '+p.id);
  assert(p.licenseUrl.startsWith('https://creativecommons.org/licenses/'),
    'Missing Creative Commons licence: '+p.id);
  for(const lang of langs){
    assert(p.names[lang]&&p.context[lang], 'Missing photo translation '+p.id+'/'+lang);
  }
}

const cityPhotoManifest = JSON.parse(await readFile(join(process.cwd(),'city-landmark-photos.json'),'utf8')).images;
const imageFiles = cityPhotoManifest.flatMap(photo=>
  photo.variants.map(width=>'/assets/cities/'+photo.base+'-'+width+'.webp'));
const imageFoundCount = imageFiles.filter(file=>known.has(file)).length;
if(imageFoundCount!==0 && imageFoundCount!==imageFiles.length){
  throw new Error('Partial landmark assets: found '+imageFoundCount+' of '+imageFiles.length+' expected responsive WebPs');
}
const indexable = [];
const titles = new Map();
const descriptions = new Map();
const issues = [];
const urlToFile = url => {
  const normalized = url.replace(site, '').split(/[?#]/)[0];
  return normalized.endsWith('/') ? normalized + 'index.html' : normalized;
};
const robots = await readFile(join(root,'robots.txt'),'utf8');
assert(robots.includes('Sitemap: ' + site + '/sitemap.xml'));
assert(robots.includes('Sitemap: ' + site + '/sitemap-yandex.xml'));
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
  if (!isThankyou) {
    const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
    if (!description) issues.push(local + ': missing description content');
    else if (descriptions.has(description)) issues.push(local + ': duplicate description with ' + descriptions.get(description));
    else descriptions.set(description, local);
    const expectedCanonical = site + local.slice(0,-'index.html'.length);
    if (canon !== expectedCanonical) issues.push(local + ': canonical mismatch ' + canon);
  }
  if (!isThankyou && titles.has(title)) issues.push(local + ': duplicate title with ' + titles.get(title));
  if (!isThankyou) titles.set(title,local);
  const match = local.match(/^\/(en|ru|pl|lt|lv|de|fr)\//);
  if (match && !isThankyou) {
    const alts = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)];
    if (alts.length !== 8) issues.push(local + ': expected seven hreflangs plus x-default');
    for (const lang of langs) if (!alts.some(a=>a[1]===lang)) issues.push(local+': missing hreflang '+lang);
    for (const alt of alts) if (!known.has(urlToFile(alt[2]))) issues.push(local+': broken hreflang '+alt[2]);
    if (!html.includes('action="/api/booking"')) issues.push(local+': missing booking form');
    if (/^\/(en|ru|pl|lt|lv|de|fr)\/(transfers|transfery|pervezimai|transferi|privattransfers|transferts)\/[^/]+\/index\.html$/.test(local)) {
      if (!html.includes('class="dest-route-context"')) issues.push(local+': missing local journey context');
      const to = html.match(/name="to" value="([^"]+)"/)?.[1] || '';
      const from = html.match(/name="fromPreset" value="([^"]+)"/)?.[1] || '';
      if (!to || !from || to === from) issues.push(local+': booking not prefilled for actual route');
    }
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
// Every airport-to-Minsk URL must show a real Minsk destination photograph,
// with accurate Commons attribution, not an airport or departure-city photo.
for(const airport of geoAirports) {
  for(const lang of langs) {
    const suffix='-'+airport.id+'-minsk/index.html';
    const matches=htmlFiles.filter(p=>p.replaceAll('\\','/').includes('/'+lang+'/') &&
      p.replaceAll('\\','/').endsWith(suffix));
    if(matches.length!==1) { issues.push(lang+': missing/duplicated airport heritage page '+airport.id);continue; }
    const html=await readFile(matches[0],'utf8');
    if(!html.includes('class="geo-city-landmark has-photo geo-heritage-photo"')||
       !html.includes('data-heritage-photo')||
       !html.includes('data-fallback-src="/assets/cities/')||
       !html.includes('ImageObject')||
       !html.includes('creativecommons.org/licenses/')) {
      issues.push(lang+'/'+airport.id+': missing authentic credited Belarus destination image');
    }
  }
}
if (htmlFiles.length !== 1506) issues.push('Expected 1506 HTML files; found ' + htmlFiles.length);
if (googleLocs.length !== 1499) issues.push('Expected 1499 indexable URLs; found ' + googleLocs.length);
if (!known.has('/ru/aeroport-ber-minsk/index.html')) issues.push('Russian BER page missing');
if (!known.has('/de/berlin-minsk-privattransfer/index.html')) issues.push('German Berlin page missing');
if (!known.has('/fr/paris-minsk-transfert-prive/index.html')) issues.push('French Paris page missing');
if (!known.has('/ru/transfery-iz-aeroportov/index.html')) issues.push('Airport index missing');

if (imageFoundCount===imageFiles.length) {
  for(const photo of cityPhotoManifest) {
    const img='/assets/cities/'+photo.base+'-1200.webp';
    const relevant=htmlFiles.filter(f=>f.includes('/'+photo.id+'-')||f.includes('/'+photo.id+'/')).slice(0,5);
    const hasRenderedImage=await Promise.all(relevant.map(async file=>
      (await readFile(file,'utf8')).includes(img)));
    if(relevant.length && !hasRenderedImage.some(Boolean)) issues.push('WebP never used on route pages: '+photo.id);
  }
  const google=await readFile(join(root,'sitemap.xml'),'utf8');
  if(!google.includes('xmlns:image='))issues.push('Image sitemap namespace missing');
  if(!google.includes('<image:image>'))issues.push('Images missing from Google sitemap');
}
for (const key of ['grodno','brest','lida','vitebsk','gomel','mogilev','baranovichi','pinsk','msq','minsk']) {
  if (!known.has('/ru/goroda-belarusi/' + key + '/index.html')) issues.push('Russian destination missing: ' + key);
}
for (const lang of langs) {
  if (!known.has('/' + lang + '/' + ({en:'belarus-destinations',ru:'goroda-belarusi',pl:'miasta-bialorusi',lt:'baltarusijos-miestai',lv:'baltkrievijas-galamerki',de:'ziele-in-belarus',fr:'destinations-bielorussie'})[lang] + '/index.html')) issues.push('Destination directory missing for ' + lang);
}
for (const route of ['/en/transfers/warsaw-brest/','/ru/transfery/waw-grodno/','/pl/transfery/vno-lida/','/de/privattransfers/berlin-gomel/','/fr/transferts/paris-msq/']) {
  if (!known.has(route + 'index.html')) issues.push('Example route missing: ' + route);
}
if (issues.length) {
  console.error(issues.slice(0,35).join('\n'));
  throw new Error(issues.length + ' SEO/static routing check errors');
}
console.log('SEO OK: ' + htmlFiles.length + ' HTML pages; ' + googleLocs.length +
  ' indexable URLs; ' + langs.length + ' languages; 19 airports; 25 EU cities; 10 Belarus destinations.');
