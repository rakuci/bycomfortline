// Article-specific verification after running "node build.mjs".
import {readFile} from "node:fs/promises";
import assert from "node:assert/strict";
import {borderPassportArticle,borderPassportSources} from "../border-passports-article.mjs";
const langs=["en","ru","pl","lt","lv","de","fr"];
const base="https://bycomfortline.com";
const slug="dual-passports-belarus-poland-border";
const sitemap=await readFile("dist/sitemap.xml","utf8");
const yandex=await readFile("dist/sitemap-yandex.xml","utf8");
const css=await readFile("dist/assets/style.css","utf8");
assert(css.includes(".guide-article-root")&&css.includes(".travel-guide-featured"),"Missing responsive article CSS");
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
  assert(html.indexOf("guide-article-warning")<html.indexOf("guide-article-section"),lang+": legal disclaimer is not first");
  assert(html.includes("https://schema.org/BlogPosting")&&html.includes('"\"@type\":\"BlogPosting\""'),lang+": missing article schema");
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
