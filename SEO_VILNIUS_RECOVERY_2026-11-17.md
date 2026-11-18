# Vilnius → Minsk SEO recovery: evidence, changes and measurement plan
**Date:** 17 November 2026
**Canonical domain:** https://bycomfortline.com
**Scope:** Vilnius → Minsk city and airport queries in Lithuanian, Russian and English.

## What is confirmed

- The relevant route pages already exist and have crawlable textual H1s, descriptions, links and booking CTAs:
  - RU: https://bycomfortline.com/ru/vilnius-minsk-transfer/
  - LT: https://bycomfortline.com/lt/vilnius-minskas-pervezimas/
  - EN: https://bycomfortline.com/en/vilnius-minsk-transfer/
  - RU airport: https://bycomfortline.com/ru/aeroport-vno-minsk/
  - EN airport: https://bycomfortline.com/en/airport-vno-minsk/
- Site code generates seven language variants and reciprocal hreflang links, plus canonical URLs in XML sitemaps.
- The 4 Nov Google Search Console issue report documented **77 "Crawled — currently not indexed" URLs**, mostly route pairs. **Those observations are from crawls 23–25 October and cannot establish current indexing after the 3 November release**. Nor is 77 the total excluded or an indexation percentage.
- The Nov 3 audit reported 1,541 canonical URLs (1,134 origin→destination combinations). This broad page inventory carries a quality/redundancy risk that needs URL-family measurement, not an automatic mass noindex.
- A Semrush screenshot shared by the owner tracked five unrelated/overbroad English terms in **Google Belarus, Belarusian**, not city-level Google Vilnius in the user's target languages. Visibility % from that campaign must not be used as a Vilnius ranking baseline.

## Public competitor sample (checked 17 November 2026)

**Onetransfer.by**: https://onetransfer.by/transfer-vilnyus-minsk

- Dedicated route heading and links to reverse/other routes.
- Public fares shown on the page: standard from €300, minivan from €400, minibus from €450. These are **competitor-published prices**, not verified ComfortLine pricing or proof of actual availability.
- Includes customer testimonials, clear list of services and an explicit booking action.

**Taxi-aeroport-minsk2.by:** broad Lithuania / international-transfer section and commercial signals. Exact regional rank was not measured; owner supplied this competitor as an example visible in Vilnius. A search result alone is not a controlled ranking test.

**ComfortLine:** already has separate route and airport pages and clear operator/legal information, but pricing is on request. Do not fabricate fares, reviews, locations, border guarantees or service availability to mimic competition.

## Changes included in this pull request

1. Rewrite RU, LT and EN Vilnius→Minsk H1/title/meta description/lead to match real city/airport transfer intent and the enquiry-based booking flow.
2. Add two destination-specific questions to each of those route pages: price calculation / quote terms, and Lithuania–Belarus entry or border checks. They contain no invented price or promises.
3. Improve quote explanations: clarify both addresses, arrival flight details and exactly which cost terms to confirm (airport or border waiting, tolls, currency, cancellation).
4. Correct two localized pickup headings (RU/LT) that used the wrong grammatical case with city names.
5. Add static generated-page assertions to the existing SEO build check for H1, self-canonical, airport context, booking link, price question and language alternate links.

This is a focused improvement, not a claim that it will immediately rank first. Existing 7-language route inventory, legacy comfortline.by site, booking API, provider details and prices remain untouched.

## P0: collect the missing baseline before/after deployment

In Google Search Console, export **Performance → Search results**:

- Date range: last 3 full months; preserve pre/post-release weekly splits.
- Search type: Web, country **Lithuania**, devices separately.
- Split by query and page. Separate RU, LT and EN route pages; do not aggregate unrelated airport / destination pair pages.
- Queries to track (actual impression data takes precedence over these hypotheses):
  - RU: `вильнюс минск трансфер`, `трансфер вильнюс минск`, `такси вильнюс минск`, `такси из вильнюса в минск`, `аэропорт вильнюса минск трансфер`.
  - LT: `Vilnius Minskas pervežimas`, `Vilnius Minskas taksi`, `Vilniaus oro uostas Minskas pervežimas`.
  - EN: `Vilnius Minsk transfer`, `Vilnius to Minsk taxi`, `Vilnius Airport to Minsk private transfer`.
- Save clicks, impressions, CTR, position, pages with impressions, and *actual enquiry submissions*; a submitted form is not an automatically confirmed booking.
- Set up an independent Semrush Position Tracking campaign for **Google Lithuania, Vilnius** with language-specific commercial terms, not just `vilnius` or `minsk`.

In **URL Inspection**, separately inspect each of the four priority URLs above. Record:
- Page indexed? and Google-selected canonical versus user canonical.
- Last crawl date; page fetch success and HTTP status; robots/indexing allowed.
- Mobile rendered HTML and whether primary route content is visible.
- Test live URL after deployment (live eligibility does not guarantee indexing).

## P1: review genuine commercial proof

- If actual pricing rules permit, publish a verified starting fare or a transparent price estimator with clear inclusions and limitations. **Do not copy competitor prices.**
- Clarify whether a single vehicle handles the full permitted itinerary; explain any actual cross-border transfer arrangements honestly.
- If the business possesses genuine trip photos, anonymized case examples and consented reviews for Vilnius↔Minsk, publish them with dates and route-specific context; do not manufacture any.
- Verify lawful operating ability and required permits for the proposed EU↔Belarus vehicle and route on the booking date.
- Keep official border references accessible: https://vsat.lrv.lt and https://keliauk.urm.lt, and avoid hardcoding specific checkpoints as 'open' or guaranteed.
- Check mobile booking flow, language selection and completed booking email for RU/LT/EN. Test one authorized end-to-end form submission.

## P2: quality and linking

- Map query groups to a **single best landing page** (city→Minsk vs VNO→Minsk vs reverse direction). Avoid more same-intent variants on the same domain.
- From the RU/LT/EN homepages and airport directories, maintain descriptive HTML links to the matching Vilnius route and VNO route.
- Review route-pair pages by Search Console impression/click and business demand. Only after sufficient evidence, selectively merge or remove near-duplicates that add no original value. Do not mass-prune 1,134 combinations on the strength of the 77-URL historical report.
- Keep comfortline.by as a distinct site until its canonical and scope strategy has been explicitly decided. Never cross-canonical two genuinely different pages solely because both mention Minsk/Vilnius.
- Earn legitimate business profiles/mentions in relevant Lithuania travel/transport listings. Do not use purchased backlinks or unverified fake Lithuanian addresses.

## Release / verification

1. Review this PR and generated diff.
2. Run `node build.mjs` (the build imports `check-seo.mjs`).
3. Confirm all generated RU/LT/EN Vilnius pages pass the route-intent assertions, and the sitewide sitemap and image checks remain green.
4. Merge only after review. Existing GitHub Actions run on main, commit generated dist assets and deploy through Cloudflare when configured. Confirm actual live HTML and GSC URL Inspection afterward.
5. Compare Lithuania queries, impressions, CTR, organic leads and actual bookings after the new pages are crawled. Be cautious with attribution; other SEO changes, border changes and competitors may affect positions.

## Official Google resources

- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/search/docs/specialty/international/localized-versions
- https://developers.google.com/search/docs/essentials/spam-policies
- https://support.google.com/webmasters/answer/9012289

**No ranking guarantee.**