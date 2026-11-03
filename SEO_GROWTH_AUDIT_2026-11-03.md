# ComfortLine: Google + Yandex SEO audit and 90-day competitive roadmap
**Audit date:** 2026-11-03  
**Canonical site:** https://bycomfortline.com  
**Repository:** rakuci/bycomfortline  
**Scope:** Seven languages (EN, RU, PL, LT, LV, DE, FR); Belarus-bound international transfers, city/airport-to-Minsk routes, Belarus destinations, bespoke 300+ km road transfers.

## Executive assessment

The existing site has an unusually broad static multilingual route inventory. Its technical foundation is good: static HTML, descriptive route URLs, localized canonical tags, complete 7-language reciprocal hreflang sets and x-default, Google + Yandex XML sitemaps, real destination photos with credits, locally hosted WebP assets, real operator identity and clear booking forms.

The principal risks are (1) several hundred similar city-to-destination pages competing for near-identical queries, (2) low authority/search demand on secondary locations, (3) insufficient actual search query and conversion data, and (4) inconsistent customer contact information reported by the older comfortline.by domain and the new site. New doorway pages or invented fares/reviews are NOT an acceptable shortcut.

No Search Console, Yandex Webmaster, GA4, PageSpeed Insights field data, backlink/position database or authenticated competitor analytics were available to this repository-level audit. Rankings and traffic uplift cannot be estimated responsibly without those datasets.

## Implemented in this branch

1. **Original, commercially useful 300+ km service landing pages:** Seven localized pages, each with specific route feasibility factors, booking details, travel preparation, FAQ, contact details, real Belarus photo and 5 country sections with 22 origin links. No automatic availability claims, fake fixed prices or fake EU offices.
2. **Meaningful contextual internal links:** Hub linked from global/local menus, homepage, city and airport landing pages, 3 main origin routes, Belarus destination directory, Belarus departure-to-destination pairs and footer. Use ordinary crawlable `<a href>` links, not click-only elements.
3. **More natural transfer/taxi search intent:** Improve selected localized HTML titles/H1/meta snippets and match search queries such as “{City} to Minsk private taxi,” “междугороднее такси”, “трансфер {city} — {destination}”, “private airport transfer” and equivalents where relevant. Avoid inserting keywords unrelated to the actual offered service.
4. **Better bespoke conversion form:** The custom-service page asks for any actual drop-off location, rather than incorrectly labeling it “Address in Minsk.”
5. **Canonical domain consolidation:** If the website Worker receives `bycomfortline.by` or `www.bycomfortline.com`/`www.bycomfortline.by` GET/HEAD paths, return a permanent HTTPS redirect to `bycomfortline.com`. Booking / API POSTs are not redirected. **This does not change the separately operated `comfortline.by` website.**
6. **Controlled SEO XML generation:** Include new localized canonical URLs, reciprocal hreflangs and local WebP references in Google sitemap; preserve a separate simple Yandex sitemap. Update meaningful page `lastmod`.
7. **Regression gates:** Validate generated HTML/canonicals, all locale copies, structured service data, 5 country sections, 22 service entry points, existing landing-photo coverage, sitemap parity, canonical alias redirects and booking protection before deployment.

### Publication inventory after successful deployment

- Total canonical URLs: **1,541**, including **1,499** existing transport/destination landing URLs, **35** editorial/travel-guide URLs, and **7** custom long-distance service URLs.
- Seven extra noindex thank-you pages remain excluded from the sitemap.
- All seven service-page URLs are intentionally in their audience's language.
- Source references: `build.mjs`, `long-distance-seo.mjs`, `geo-locales.mjs`, `destination-locales.mjs`, `check-seo.mjs`, `scripts/check-sitemaps.mjs`, `scripts/check-long-distance-seo.mjs`, `scripts/landing_image_report.mjs`.

## Immediate commercial SEO priorities (require business/account decisions)

**P0 — Measurement and ranking baseline, weeks 1–2**
- Grant reporting access to Google Search Console and Yandex Webmaster for the canonical domain. Export performance by page + query + country + device for trailing 3 months, including clicks, impressions, CTR and position.
- Configure GA4/Yandex Metrica event counts for route enquiry form open, completed submission, email provider accepted, WhatsApp click, telephone tap and qualified booking. Do not treat opening the booking popup as a completed lead.
- Validate the top 20 commercial URLs with Google URL Inspection and Yandex Webmaster “Pages in search,” paying attention to excluded/duplicate pages, chosen canonical and international alternates. These are not programmatically confirmed by GitHub builds.
- Audit old `comfortline.by` contact information: public snippets appear to show a different telephone number. Confirm correct registered operator NAP, preferred brand domain, phone, postal address and the ownership relationship before making redirects or changing that separate site. Keep legal contact details and operator identity unambiguous.
- Confirm that any EU-to-EU and cross-border passenger service described is permitted with the actual carrier/vehicle licensing. Do not advertise services that cannot legally be provided.

**P1 — Commercial relevance, weeks 2–4**
- Prioritize Warsaw ⇄ Minsk, Warsaw Chopin/Modlin (WAW/WMI) ⇄ Belarus, Vilnius/VNO ⇄ Minsk, Riga/RIX ⇄ Minsk and Polish/Lithuanian border-city transfers based on *measured* search impressions and valid operating routes.
- Make every priority page answer: where driver meets passengers, arrivals and luggage, passenger/child seat capacity, what the quote includes, real cancellation/waiting conditions, whether trips require transfer at the border, which documents to verify and official border references. Do not invent crossing times, “always available” claims, or fares.
- Capture **verified** example prices/ranges or real customer quote case studies only with business approval. “Price on request” is honest, but genuine transparent pricing can improve decision quality and CTR when feasible.
- Add verified passenger reviews/testimonials with explicit permission and dates; no synthetic star ratings and no self-serving Google review markup.
- Publish a legitimate service-coverage summary, transport license/insurance facts and vehicle examples (not a fictitious office in every European city).

**P2 — Authority, weeks 4–8**
- Earn editorial links from legal industry directories, travel resources, regional chambers, hotel partners, airport transfer aggregators and relevant traveler articles. Do not purchase link farms, spam forum posts or exchange mass cross-links.
- Optimize Google Business Profile and Yandex Business ONLY for genuine, verified locations and service areas; never fabricate branches in other countries.
- Regularly update factual border/travel articles; link to official sources and include clear “reviewed on” dates. Treat the information as informational, not legal advice.

**P3 — Continuous conversion and content testing, weeks 8–12**
- Group query clusters by actual language/search intent: transactional city-to-Minsk, airport-to-Minsk, return journey, 300+ km bespoke route, Belarus destination routes, family/minivan/baggage requirements, border help.
- Improve title and snippet wording on pages with impressions but below-average CTR; evaluate after search engine re-crawling rather than editing daily.
- Identify low-performing duplicate pages by impression/crawl data; consolidate, redirect, canonicalize or noindex genuinely unhelpful pages **only after review**. Avoid removing routes with proven conversions.
- Measure mobile Core Web Vitals using real-user data/CrUX and PageSpeed Insights, including LCP image and blocking CSS/fonts; audit mobile booking path with human tests.
- Monitor booking email delivery and Resend bounces; monitor transactional conversion separately from organic ranking.

## Weekly SEO KPI dashboard

| Dimension | Metric / segmentation |
|---|---|
| Search demand | Impressions by high-intent query, country, language, device |
| Organic growth | Non-brand clicks, branded clicks, CTR, average position by URL family |
| Index health | Indexable vs indexed URLs, exclusions, canonical mismatches, orphan/duplicate URLs |
| Quality | Unique route-specific content, factual accuracy, confirmed availability/price assertions |
| Business result | Qualified enquiries, accepted emails, confirmed bookings, organic booking value |
| Technical | LCP/INP/CLS on mobile, Worker response status, sitemap parity, 4xx/5xx |
| Reputation | Legitimate backlinks and brand mentions, genuine reviews, business-profile accuracy |

## Policy / guidance sources

- Google Search Essentials: https://developers.google.com/search/docs/essentials
- Google spam policies (doorway abuse and scaled content): https://developers.google.com/search/docs/essentials/spam-policies
- Google crawlable links: https://developers.google.com/search/docs/crawling-indexing/links-crawlable
- Google multilingual pages/hreflang: https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
- Google site URL structures: https://developers.google.com/search/docs/crawling-indexing/url-structure
- Yandex duplicate titles/descriptions: https://yandex.com/support/webmaster/en/indexing-options/title-description-doubles
- Yandex regionality (real company address): https://yandex.com/support/webmaster/en/site-geography/site-region
- Yandex indexing/query analytics: https://yandex.com/support/webmaster/en/yandex-indexing/site-indexing
- Yandex quality and ranking: https://yandex.com/support/webmaster/en/yandex-indexing/rank
- Yandex IndexNow: https://www.yandex.com/support/webmaster/en/indexing-options/index-now.html

**No ranking guarantee.** This is a technical and content rollout designed to make the service more useful and discoverable; search positions depend on competition, real demand, indexation, link reputation, business legitimacy and conversion experience. 
