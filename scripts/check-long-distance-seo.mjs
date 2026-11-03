import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {longDistanceSeo,longDistanceRegionOriginIds} from "../long-distance-seo.mjs";
import {geoCities} from "../geo-cities.mjs";
import {geoAirports} from "../geo-airports.mjs";
import worker from "../src/worker.mjs";

const base="https://bycomfortline.com";
const langs=["en","ru","pl","lt","lv","de","fr"];
const slugs=Object.fromEntries(langs.map(lang=>[lang,longDistanceSeo[lang]?.slug]));
assert.equal(new Set(Object.values(slugs)).size,7,"All language slugs must be distinct");
assert.equal(longDistanceRegionOriginIds.length,5,"Missing geographic country group");

const [sitemap,yandex,css]=await Promise.all([
  readFile("dist/sitemap.xml","utf8"),
  readFile("dist/sitemap-yandex.xml","utf8"),
  readFile("dist/assets/style.css","utf8")
]);
assert(css.includes(".long-distance-hero")&&css.includes(".long-distance-teaser")&&
       css.includes("@media(max-width:650px)"),"Missing responsive long-distance CSS");
const sitemapLocs=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
const yandexLocs=[...yandex.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.equal(sitemapLocs.length,1541,"Expected 1,541 indexable canonical URLs");
assert.deepEqual(sitemapLocs,yandexLocs,"Google and Yandex canonicals differ");

const sampleRoutes={
  ru:["bialystok","waw","berlin"],
  en:["krakow","rix","paris"],
  pl:["suwalki","wmi"],
  lt:["kaunas","vno"],
  lv:["daugavpils","rix"],
  de:["berlin","ber"],
  fr:["paris","cdg"]
};
for(const lang of langs){
  const c=longDistanceSeo[lang];
  assert(c&&c.benefits.length===4&&c.steps.length===3&&c.faq.length===4,lang+": missing original helpful service content");
  assert(c.title.length>=20&&c.title.length<=95,lang+": long-distance title unhelpful");
  assert(c.meta.length>=90&&c.meta.length<=240,lang+": meta description unhelpful");
  assert(c.lead.length>=130,lang+": insufficient useful original content");
  const file=`dist/${lang}/${c.slug}/index.html`;
  const page=await readFile(file,"utf8");
  const url=`${base}/${lang}/${c.slug}/`;
  assert(page.includes(`<html lang="${lang}"`)&&page.includes(`<link rel="canonical" href="${url}"`),lang+": page language/canonical mismatch");
  assert(page.includes(`<h1>${c.h1}</h1>`),lang+": H1 not visible");
  assert(page.includes(c.meta.replaceAll("&","&amp;")),lang+": localized description missing");
  assert(page.includes('class="long-distance-country-grid"'),lang+": country directory missing");
  assert(page.includes('class="long-distance-benefits"'),lang+": original practical guidance missing");
  assert(page.includes('name="fromPreset"')&&page.includes('name="to"'),lang+": custom route booking missing");
  assert(page.includes('data-destination-id="minsk"'),lang+": required Minsk landmark source missing");
  assert(page.includes('"@type":"Service"')&&page.includes('"@type":"BreadcrumbList"'),lang+": structured data missing");
  assert.equal((page.match(/class="long-distance-origin-link"/g)||[]).length,
      longDistanceRegionOriginIds.reduce((sum,country)=>sum+country.originIds.length,0),lang+": missing real origin links");
  assert(sitemapLocs.includes(url),lang+": missing main sitemap");
  const row=sitemap.match(new RegExp('<url><loc>'+url.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+'<\\/loc>[\\s\\S]*?<\\/url>'))?.[0];
  assert(row,lang+": missing hreflang sitemap entry");
  for(const other of langs){
    const target=`${base}/${other}/${slugs[other]}/`;
    assert(page.includes(`hreflang="${other}" href="${target}"`),lang+": HTML hreflang missing "+other);
    assert(row.includes(`hreflang="${other}" href="${target}"`),lang+": sitemap hreflang missing "+other);
  }
  assert(page.includes(`hreflang="x-default" href="${base}/en/${slugs.en}/"`),lang+": x-default missing");
  const home=await readFile(`dist/${lang}/index.html`,"utf8");
  assert(home.includes(`href="/${lang}/${c.slug}/"`),lang+": no homepage internal link");
  const guide=await readFile(`dist/${lang}/travel-guide/index.html`,"utf8");
  assert(guide.includes(`href="/${lang}/${c.slug}/"`),lang+": no shared navigation");
  for(const id of sampleRoutes[lang]){
    const geo=[...geoAirports,...geoCities].find(x=>x.id===id);
    assert(geo,lang+": missing sample location "+id);
    const geoSlug=geo.type==="airport"
      ?({en:"airport",ru:"aeroport",pl:"lotnisko",lt:"oro-uostas",lv:"lidosta",de:"flughafen",fr:"aeroport"})[lang]+"-"+id+"-minsk"
      :id+"-minsk-"+({en:"private-transfer",ru:"taksi",pl:"transfer",lt:"pervezimas",lv:"transfers",de:"privattransfer",fr:"transfert-prive"})[lang];
    const route=await readFile(`dist/${lang}/${geoSlug}/index.html`,"utf8");
    assert(route.includes(`href="/${lang}/${c.slug}/"`),lang+"/"+id+": missing contextual long-distance link");
    assert(route.includes(c.customLink),lang+"/"+id+": missing useful localized link text");
  }
  // A representative cross-border route to Grodno must also expose the custom option.
  const pair=await readFile(`dist/${lang}/${{en:"transfers",ru:"transfery",pl:"transfery",lt:"pervezimai",lv:"transferi",de:"privattransfers",fr:"transferts"}[lang]}/waw-grodno/index.html`,"utf8");
  assert(pair.includes(`href="/${lang}/${c.slug}/"`),lang+": missing cross-border pair internal link");
}
// Confirm the host consolidation cannot accidentally break the booking endpoint.
const env={ASSETS:{fetch:async()=>new Response("static",{status:200})}};
for(const [host,expected] of [["bycomfortline.by",true],["www.bycomfortline.by",true],["www.bycomfortline.com",true],["bycomfortline.com",false]]){
  const req=new Request(`https://${host}/ru/travel-guide/?source=sample`);
  const response=await worker.fetch(req,env);
  assert.equal(response.status,expected?301:200,"Canonical alias redirect broken on "+host);
  if(expected)assert.equal(response.headers.get("Location"),"https://bycomfortline.com/ru/travel-guide/?source=sample");
}
const api=await worker.fetch(new Request("https://bycomfortline.by/api/booking",{method:"POST",headers:{"Origin":"https://bycomfortline.by","Content-Type":"application/json"},body:"{}"}),env);
assert.notEqual(api.status,301,"Booking POST must not be redirected");
console.log("LONG-DISTANCE SEO OK: 7 multilingual original service pages, 5 region groups, 22 origin links per page, representative city/airport/pair links, canonical aliases and booking API isolation.");
