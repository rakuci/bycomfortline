// Audit generated, indexable landing URLs against real, locally committed destination photographs.
// This complements check-seo.mjs and writes a traceable per-URL manifest for editorial QA.
import {readFile,writeFile,stat} from "node:fs/promises";
import {join} from "node:path";
import assert from "node:assert/strict";
const root=join(process.cwd(),"dist");
const domain="https://bycomfortline.com";
const [sitemap,cityJson,heritageJson]=await Promise.all([
  readFile(join(root,"sitemap.xml"),"utf8"),
  readFile("city-landmark-photos.json","utf8"),
  readFile("heritage-landmark-photos.json","utf8")
]);
const city=JSON.parse(cityJson).images,heritage=JSON.parse(heritageJson).images;
const origins=[
  ...city.map(p=>({kind:"city",id:p.id,src:p.sourcePage,photographer:p.credit,license:p.license})),
  ...heritage.map(p=>({kind:"heritage",id:p.id,src:p.sourcePage,photographer:p.credit,license:p.license}))
];
const lookup=new Map(origins.map(p=>[p.id,p]));
const urls=[...sitemap.matchAll(/<loc>(https:\/\/bycomfortline\.com\/[^<]*)<\/loc>/g)].map(m=>m[1]);
assert.equal(urls.length,1499,"Expected 1,499 canonical indexable URLs");
const entries=[];
for(const url of urls){
  const pathname=new URL(url).pathname;
  const file=join(root,pathname,"index.html");
  const html=await readFile(file,"utf8");
  const figures=[...html.matchAll(/<figure\b[^>]*\bdata-destination-id="([^"]+)"[^>]*>([\s\S]*?)<\/figure>/g)];
  if(!figures.length)throw Error("Missing destination image: "+url);
  const match=figures[0],cityId=match[1],block=match[2];
  const img=block.match(/<img\b[^>]*>/)?.[0]||"";
  const imagePath=img.match(/\bsrc="([^"]+)"/)?.[1]||"";
  const alt=img.match(/\balt="([^"]+)"/)?.[1]||"";
  if(!imagePath.startsWith("/assets/"))throw Error("Not self-hosted photo: "+url);
  const size=(await stat(join(root,imagePath))).size;
  if(size<1000)throw Error("Corrupt image for "+url);
  const assetId=imagePath.includes("/heritage/")?imagePath.split("/").at(-1).replace(/-(640|1200)\.webp$/,""):cityId;
  const photo=lookup.get(assetId);
  if(!photo)throw Error("Missing photographed landmark credit for "+url+" "+assetId);
  entries.push({
    url,
    language:pathname.split("/")[1]||"en",
    destination:cityId,
    kind:photo.kind,
    photograph:assetId,
    image:imagePath,
    alt,
    source:photo.src,
    photographer:photo.photographer,
    license:photo.license,
    bytes:size
  });
}
assert.equal(entries.length,new Set(entries.map(e=>e.url)).size,"Duplicate landing photo URLs");
const languages={};
const destinations={};
const photos={};
for(const e of entries){
  languages[e.language]=(languages[e.language]||0)+1;
  destinations[e.destination]=(destinations[e.destination]||0)+1;
  photos[e.photograph]=(photos[e.photograph]||0)+1;
}
const summary={
  generatedAt:new Date().toISOString(),
  totalLandingUrls:entries.length,
  coveredLandingUrls:entries.length,
  missingDestinationPhotos:0,
  distinctPhotographs:Object.keys(photos).length,
  languages,
  destinations,
  photos
};
await writeFile(join(root,"landing-image-coverage.json"),JSON.stringify({summary,pages:entries},null,2)+"\n");
await writeFile("LANDING_IMAGE_COVERAGE.md",[
  "# Landing page photography coverage",
  "",
  "Generated from the built HTML, local image assets and canonical sitemap.",
  "Do not interpret this source-level audit as verification of live Cloudflare responses or search indexing.",
  "",
  "| Measure | Count |",
  "|---|---:|",
  `| Canonical URLs checked | ${summary.totalLandingUrls} |`,
  `| With real self-hosted destination image | ${summary.coveredLandingUrls} |`,
  `| Missing matching destination photo | ${summary.missingDestinationPhotos} |`,
  `| Distinct photographed landmarks used | ${summary.distinctPhotographs} |`,
  "",
  "## Coverage by destination",
  "",
  "| Destination | Canonical URLs |",
  "|---|---:|",
  ...Object.entries(destinations).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`| ${k} | ${v} |`),
  "",
  "## Coverage by language",
  "",
  "| Language | Canonical URLs |",
  "|---|---:|",
  ...Object.entries(languages).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`| ${k} | ${v} |`),
  "",
  "For each URL, find the exact image path, creative credit and source in `dist/landing-image-coverage.json`.",
  ""
].join("\n"));
console.log("Images verified on "+entries.length+" canonical landing pages; "+Object.keys(photos).length+" distinct photos; no missing destination images.");
