// Run after node build.mjs: validates Google/Yandex sitemaps, localized editorial
// pages, live image references and canonical URLs without relying on third-party APIs.
import assert from "node:assert/strict";
import {readFile,stat} from "node:fs/promises";
import {join} from "node:path";
const base="https://bycomfortline.com";
const langs=["en","ru","pl","lt","lv","de","fr"];
const editorial={
  "60-euro-cash-eur-pln-belarus-border-lithuania-latvia":[
    "/assets/stories/euro-60-border-exchange-office-driver.webp",
    "/assets/stories/euro-60-border-cash-rules-infographic.webp"],
  "ikea-shopping-belarus-customs-limits-frequency":[],
  "lithuania-belarus-car-export-sanctions-165mm":[
    "/assets/stories/lithuania-belarus-165mm-border.webp"],
  "dual-passports-belarus-poland-border":[
    "/assets/stories/dual-passport-no-departure.webp"]
};
const [google,yandex,robots]=await Promise.all([
  readFile("dist/sitemap.xml","utf8"),
  readFile("dist/sitemap-yandex.xml","utf8"),
  readFile("dist/robots.txt","utf8")
]);
assert(google.includes('xmlns:xhtml=')&&google.includes('xmlns:image='),"Google sitemap namespaces missing");
assert(!yandex.includes('xhtml:link')&&!yandex.includes('image:image'),"Yandex sitemap should be plain canonical URLs");
assert(robots.includes(`Sitemap: ${base}/sitemap.xml`)&&robots.includes(`Sitemap: ${base}/sitemap-yandex.xml`),"robots.txt sitemap addresses missing");
const rows=[...google.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(m=>m[1]);
const loc=row=>row.match(/<loc>([^<]+)<\/loc>/)?.[1];
const canonicals=rows.map(loc);
const byUrl=new Map(rows.map(row=>[loc(row),row]));
assert.equal(rows.length,1499+5*langs.length,"Unexpected number of canonical URLs");
assert.equal(byUrl.size,rows.length,"Duplicate canonical URL");
assert(!canonicals.some(u=>u.includes("/thank-you/")),"Non-indexable thank-you URLs in sitemap");
const yandexLocs=[...yandex.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.deepEqual(yandexLocs,canonicals,"Google and Yandex canonical sets differ");
let articleImages=0;
for(const lang of langs){
  for(const [slug,images] of Object.entries(editorial)){
    const url=`${base}/${lang}/travel-guide/${slug}/`;
    const row=byUrl.get(url);
    assert(row,lang+": article URL missing from sitemap: "+slug);
    const date=row.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
    assert(/^20\d\d-\d\d-\d\d$/.test(date||""),lang+": invalid article lastmod");
    const alternates=[...row.matchAll(/<xhtml:link rel="alternate" hreflang="([^"]+)" href="([^"]+)"\s*\/>/g)];
    assert.equal(alternates.length,8,lang+": missing hreflang links");
    for(const other of langs){
      const alt=`${base}/${other}/travel-guide/${slug}/`;
      assert(alternates.some(m=>m[1]===other&&m[2]===alt),lang+": invalid alternate "+other);
    }
    assert(alternates.some(m=>m[1]==="x-default"&&m[2]===`${base}/en/travel-guide/${slug}/`),lang+": missing x-default");
    const rowImages=[...row.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map(m=>m[1]);
    assert.deepEqual(rowImages,images.map(path=>base+path),lang+": editorial image sitemap mismatch "+slug);
    const html=await readFile(join("dist",lang,"travel-guide",slug,"index.html"),"utf8");
    assert(html.includes(`<link rel="canonical" href="${url}"`),lang+": article HTML canonical mismatch");
    articleImages+=rowImages.length;
  }
  const guide=`${base}/${lang}/travel-guide/`;
  assert(byUrl.has(guide),lang+": Travel Guide index missing");
}
const seenImageUrls=new Set();
for(const row of rows){
  const imageUrls=[...row.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map(m=>m[1]);
  assert.equal(imageUrls.length,new Set(imageUrls).size,"Duplicate image within "+loc(row));
  for(const image of imageUrls){
    assert(image.startsWith(base+"/assets/"),"Unexpected external image: "+image);
    seenImageUrls.add(image);
  }
}
for(const image of seenImageUrls){
  const local=join("dist",new URL(image).pathname.slice(1));
  assert((await stat(local)).size>1000,"Sitemap image missing/empty: "+image);
}
assert.equal(articleImages,7*4,"Expected cash (two), passport and vehicle illustration for each language");
console.log(`SITEMAP OK: ${rows.length} canonical URLs, ${articleImages} editorial image references, ${seenImageUrls.size} unique existing assets, all 7 hreflang sets, Google/Yandex parity.`);
