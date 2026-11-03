// Article-specific verification after running "node build.mjs".
import {readFile} from "node:fs/promises";
import assert from "node:assert/strict";
import {borderPassportArticle,borderPassportSources} from "../border-passports-article.mjs";
import {cashStoryImageLabels} from "../travel-guide-cash-image-labels.mjs";
const langs=["en","ru","pl","lt","lv","de","fr"];
const base="https://bycomfortline.com";
const slug="dual-passports-belarus-poland-border";
const passportArt="/assets/stories/dual-passport-no-departure.webp";
async function requireOptimizedWebp(path,expectedWidth,expectedHeight,maxBytes=300000){
  const buf=await readFile("dist"+path);
  assert(buf.length>10000 && buf.length<maxBytes,path+": unexpected asset size");
  assert.equal(buf.toString("ascii",0,4),"RIFF",path+": missing RIFF header");
  assert.equal(buf.toString("ascii",8,12),"WEBP",path+": missing WEBP header");
  assert.equal(buf.toString("ascii",12,16),"VP8 ",path+": unexpected image encoding");
  const w=buf.readUInt16LE(26)&0x3fff, h=buf.readUInt16LE(28)&0x3fff;
  assert.equal(w,expectedWidth,path+": width mismatch");
  assert.equal(h,expectedHeight,path+": height mismatch");
}
await requireOptimizedWebp(passportArt,1280,960);
const sitemap=await readFile("dist/sitemap.xml","utf8");
const yandex=await readFile("dist/sitemap-yandex.xml","utf8");
const css=await readFile("dist/assets/style.css","utf8");
assert(css.includes(".guide-article-root")&&css.includes(".travel-guide-featured"),"Missing responsive article CSS");
const mobileCardCss=css.slice(css.indexOf("/* All Travel Guide feature cards must stack"));
assert(mobileCardCss.includes("@media (max-width:850px)") &&
       mobileCardCss.includes(".travel-guide-featured{") &&
       mobileCardCss.includes("flex-direction:column;") &&
       mobileCardCss.includes(".travel-guide-featured-copy{") &&
       mobileCardCss.includes("width:100%;") &&
       mobileCardCss.includes(".travel-guide-featured-thumbnail--passport") &&
       mobileCardCss.includes("order:-1;"),
       "All Travel Guide cards must stack text and full illustrations on mobile");

assert.equal(Object.keys(borderPassportArticle).length,7,"Article needs all seven languages");
assert.equal(borderPassportSources.length,10,"Original legal sources must be retained");
for(const lang of langs){
  const c=borderPassportArticle[lang];
  assert(c&&c.sections.length>=7&&c.checks.length>=6,lang+": incomplete adapted article");
  const dir=`dist/${lang}/travel-guide`;
  const [guide,html]=await Promise.all([readFile(`${dir}/index.html`,"utf8"),readFile(`${dir}/${slug}/index.html`,"utf8")]);
  const url=`${base}/${lang}/travel-guide/${slug}/`;
  assert(guide.includes(`href="/${lang}/travel-guide/${slug}/"`),lang+": story not linked from guide");
  assert(html.includes(`<link rel="canonical" href="${url}"`),lang+": missing canonical");
  assert(html.includes(`<html lang="${lang}"`),lang+": incorrect document language");
  assert(html.includes(c.disclaimerTitle),lang+": missing up-front disclaimer");
  assert(html.includes(`src="${passportArt}" width="1280" height="960"`),lang+": missing passport art in article");
  assert(guide.includes(`src="${passportArt}" width="1280" height="960"`),lang+": missing passport art on guide card");
  assert(html.includes(`property="og:image" content="${base}${passportArt}"`),lang+": missing passport social preview");
  assert(html.indexOf("guide-article-warning")<html.indexOf("guide-article-cartoon--passport"),lang+": legal disclaimer must precede art");
  assert(html.indexOf("guide-article-warning")<html.indexOf("guide-article-section"),lang+": legal disclaimer is not first");
  assert(html.includes("https://schema.org/BlogPosting") && html.includes('"@type":"BlogPosting"'),lang+": missing article schema");
  assert(html.includes(`<h1 itemprop="headline">`),lang+": missing article heading");
  assert(html.includes('href="#guide-source-1"')&&html.includes('id="guide-source-10"'),lang+": sources not cross-linked");
  assert(sitemap.includes(`<loc>${url}</loc>`),lang+": not in Google sitemap");
  assert(yandex.includes(`<loc>${url}</loc>`),lang+": not in Yandex sitemap");
  for(const source of borderPassportSources)assert(html.includes(source.url),lang+": missing official source "+source.url);
  for(const other of langs)assert(html.includes(`hreflang="${other}" href="${base}/${other}/travel-guide/${slug}/"`),lang+": broken language alternate "+other);
  assert(html.includes(`hreflang="x-default" href="${base}/en/travel-guide/${slug}/"`),lang+": missing x-default");
  const articleCount=(html.match(/class="guide-article-section"/g)||[]).length;
  assert.equal(articleCount,c.sections.length,lang+": missing legal sections");
}
console.log("Verified 7 localized border articles, source attribution, canonicals, alternate languages and guide cards.");


import {carSanctionsArticle,carSanctionsSources} from "../car-sanctions-article.mjs";
const carSlug="lithuania-belarus-car-export-sanctions-165mm";
const carArt="/assets/stories/lithuania-belarus-165mm-border.webp";
assert.equal(Object.keys(carSanctionsArticle).length,7,"Vehicle sanctions story must be available in every locale");
assert(carSanctionsSources.length>=8,"Vehicle sanctions story needs official sources");
assert(css.includes(".guide-article-cartoon")&&css.includes(".travel-guide-featured-car"),"Missing satirical story layout styles");
await requireOptimizedWebp(carArt,1440,810);
for(const lang of langs){
  const c=carSanctionsArticle[lang],slug=carSlug;
  assert(c&&c.sections.length>=8&&c.checks.length===6,lang+": car sanctions article incomplete");
  assert(c.sections.every(row=>row.length>=3),lang+": car article not sufficiently detailed");
  const [guide,html]=await Promise.all([
    readFile(`dist/${lang}/travel-guide/index.html`,"utf8"),
    readFile(`dist/${lang}/travel-guide/${slug}/index.html`,"utf8")
  ]);
  const url=`${base}/${lang}/travel-guide/${slug}/`;
  assert(guide.includes(`href="/${lang}/travel-guide/${slug}/"`),lang+": car article not featured");
  assert(html.includes(`<link rel="canonical" href="${url}"`),lang+": car article canonical missing");
  assert(html.includes(`<html lang="${lang}"`),lang+": incorrect car article language");
  assert(html.includes(c.disclaimerTitle),lang+": missing information-only warning");
  assert(html.indexOf("guide-article-warning")<html.indexOf("guide-article-cartoon"),lang+": disclaimer must precede image");
  assert(html.indexOf("guide-article-warning")<html.indexOf("guide-article-section"),lang+": disclaimer must precede claims");
  assert(html.includes(`src="${carArt}" width="1440" height="810"`),lang+": missing current car illustration");
  assert(guide.includes(`src="${carArt}" width="1440" height="810"`),lang+": missing current car card");
  assert(html.includes(`property="og:image" content="${base}${carArt}"`),lang+": missing car social preview");
  assert(html.includes('"@type":"BlogPosting"'),lang+": BlogPosting JSON-LD missing");
  assert(html.includes('id="guide-source-10"')&&html.includes('href="#guide-source-1"'),lang+": citation anchors missing");
  assert(html.includes('class="guide-article-section"'),lang+": article content missing");
  assert(sitemap.includes(`<loc>${url}</loc>`)&&yandex.includes(`<loc>${url}</loc>`),lang+": sitemap entries missing");
  for(const source of carSanctionsSources)assert(html.includes(source.url),lang+": missing source "+source.url);
  for(const other of langs)assert(html.includes(`hreflang="${other}" href="${base}/${other}/travel-guide/${slug}/"`),lang+": missing alternate "+other);
  assert(html.includes(`hreflang="x-default" href="${base}/en/travel-guide/${slug}/"`),lang+": missing x-default alternate");
  assert.equal((html.match(/class="guide-article-section"/g)||[]).length,c.sections.length,lang+": missing sections");
}
console.log("Verified both optimized story WebPs and their seven localized article/card placements, disclaimers, official sources and SEO.");


import {ikeaKidsArticle,ikeaKidsProducts,ikeaKidsSources} from "../ikea-kids-customs-article.mjs";
const ikeaSlug="ikea-shopping-belarus-customs-limits-frequency";
assert.equal(Object.keys(ikeaKidsArticle).length,7,"IKEA story requires seven adapted translations");
assert.equal(ikeaKidsProducts.length,16,"All 16 provided IKEA products must appear");
assert(ikeaKidsSources.length>=10,"IKEA story needs substantive official customs references");
assert(css.includes(".guide-ikea-inventory")&&css.includes(".guide-ikea-facts"),"Missing IKEA responsive styling");
for(const lang of langs){
 const c=ikeaKidsArticle[lang], url=`${base}/${lang}/travel-guide/${ikeaSlug}/`;
 assert(c.sections.length===8&&c.checklist.length===6,lang+": IKEA narrative incomplete");
 const [guide,html]=await Promise.all([
  readFile(`dist/${lang}/travel-guide/index.html`,"utf8"),
  readFile(`dist/${lang}/travel-guide/${ikeaSlug}/index.html`,"utf8")]);
 assert(guide.includes(`href="/${lang}/travel-guide/${ikeaSlug}/"`),lang+": IKEA guide card missing");
 assert(html.includes(`<link rel="canonical" href="${url}"`),lang+": incorrect IKEA canonical");
 assert(html.includes(`<html lang="${lang}"`),lang+": wrong IKEA document language");
 assert(html.includes(c.disclaimerTitle),lang+": disclaimer missing");
 assert(html.indexOf("guide-article-warning")<html.indexOf('class="guide-article-section"'),lang+": disclaimer not first");
 assert(html.includes('id="ikea-shopping-list"'),lang+": product inventory absent");
 assert.equal((html.match(/class="guide-ikea-product"/g)||[]).length,16,lang+": not all 16 IKEA products shown");
 for(const [sku] of ikeaKidsProducts)assert(html.includes(sku),lang+": missing SKU "+sku);
 assert(html.includes("500 €")&&html.includes("25 kg"),lang+": basic import limit missing");
 assert(html.includes('"@type":"BlogPosting"'),lang+": BlogPosting schema missing");
 assert(sitemap.includes(`<loc>${url}</loc>`)&&yandex.includes(`<loc>${url}</loc>`),lang+": IKEA sitemap entry missing");
 assert(html.includes('href="#guide-source-1"')&&html.includes('id="guide-source-13"'),lang+": official source anchors missing");
 for(const source of ikeaKidsSources)assert(html.includes(source.url),lang+": source missing "+source.url);
 for(const other of langs)assert(html.includes(`hreflang="${other}" href="${base}/${other}/travel-guide/${ikeaSlug}/"`),lang+": alternate language missing "+other);
 assert(html.includes(`hreflang="x-default" href="${base}/en/travel-guide/${ikeaSlug}/"`),lang+": x-default missing");
 assert.equal((html.match(/class="guide-article-section"/g)||[]).length,c.sections.length,lang+": missing narrative sections");
}
console.log("Verified seven localised IKEA customs articles: 16 SKUs, source links, legal disclaimer, guide links, sitemaps and SEO.");


import {cashSixtyArticle,cashSixtySources} from "../cash-eur60-border-article.mjs";
const cashSlug="60-euro-cash-eur-pln-belarus-border-lithuania-latvia";
const cashArt="/assets/stories/euro-60-border-exchange-office-driver.webp";
const cashInfographic="/assets/stories/euro-60-border-cash-rules-infographic.webp";
assert.equal(Object.keys(cashSixtyArticle).length,7,"Cash-border story requires seven languages");
assert(cashSixtySources.length>=10,"Cash-border story requires official law and customs sources");
assert(css.includes(".guide-cash-facts")&&css.includes(".travel-guide-featured-cash"),"Cash-story responsive styling missing");
await requireOptimizedWebp(cashArt,1672,941,380000);
await requireOptimizedWebp(cashInfographic,1672,941,450000);
assert.equal(Object.keys(cashStoryImageLabels).length,7,"Cash captions require all languages");
for(const lang of langs){
 const c=cashSixtyArticle[lang],url=`${base}/${lang}/travel-guide/${cashSlug}/`;
 assert(c&&c.sections.length>=8&&c.checklist.length>=5&&c.facts.length===3,lang+": Cash story is incomplete");
 const [guide,html]=await Promise.all([readFile(`dist/${lang}/travel-guide/index.html`,"utf8"),readFile(`dist/${lang}/travel-guide/${cashSlug}/index.html`,"utf8")]);
 assert(c.title.includes("60")&&c.shortTitle.includes("60"),lang+": 60-euro headline must be central");
 assert(guide.includes(`href="/${lang}/travel-guide/${cashSlug}/"`),lang+": featured story link missing");
 assert(html.includes(`<link rel="canonical" href="${url}"`),lang+": canonical missing");
 assert(html.includes(`<html lang="${lang}"`),lang+": language mismatch");
 assert(html.includes(c.disclaimerTitle),lang+": missing disclaimer");
 assert(html.indexOf("guide-article-warning")<html.indexOf("guide-article-cartoon--cash"),lang+": disclaimer must precede illustration");
 assert(html.indexOf("guide-article-warning")<html.indexOf('class="guide-article-section"'),lang+": disclaimer must precede legal claims");
 assert(html.includes(`src="${cashArt}" width="1672" height="941"`),lang+": missing driver illustration");
 assert(html.includes(`src="${cashInfographic}" width="1672" height="941"`),lang+": missing cash-rules infographic");
 assert(html.includes(`href="${cashInfographic}" target="_blank"`),lang+": infographic should open full size");
 assert(html.includes('guide-article-cartoon--cash-guide'),lang+": missing secondary image container");
 assert(html.includes(cashStoryImageLabels[lang].caption),lang+": missing localized infographic caption");
 assert(guide.includes(`src="${cashArt}" width="1672" height="941"`),lang+": missing new story thumbnail");
 assert(html.includes('"@type":"BlogPosting"'),lang+": missing BlogPosting structured data");
 assert(html.includes(`property="og:image" content="${base}${cashArt}"`),lang+": missing social share image");
 assert(sitemap.includes(`<loc>${url}</loc>`)&&yandex.includes(`<loc>${url}</loc>`),lang+": missing sitemap URL");
 assert(html.includes('href="#guide-source-1"')&&html.includes('id="guide-source-11"'),lang+": broken citations or sources");
 for(const source of cashSixtySources)assert(html.includes(source.url),lang+": missing official source "+source.url);
 for(const other of langs)assert(html.includes(`hreflang="${other}" href="${base}/${other}/travel-guide/${cashSlug}/"`),lang+": alternate missing "+other);
 assert(html.includes(`hreflang="x-default" href="${base}/en/travel-guide/${cashSlug}/"`),lang+": x-default missing");
 assert.equal((html.match(/class="guide-article-section"/g)||[]).length,c.sections.length,lang+": missing article sections");
}
console.log("Verified seven €60 cash stories, two optimized infographics, translated captions, citations and hreflang SEO.");
