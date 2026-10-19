# Yandex SEO, Russian-language search and international transfer page rollout
**byComfortLine · 19 October 2026 · repository: rakuci/bycomfortline**

## Scope and limits

The goal is to be discovered for genuinely relevant queries about **private cross-border rides to Minsk, Belarus** from Warsaw, Vilnius, Riga, other nearby European cities and airports, and long-distance departures from Berlin and Paris when feasible.

Nobody can guarantee first place for all queries. Generic searches such as **«такси Варшава»**, **«такси Париж»**, and **«лимузин Берлин»** normally refer to local urban services, **not** the international Minsk service. Do not fabricate Warsaw, German or French offices, instant fixed fares, guaranteed border crossings, driver availability, service coverage, reviews or ratings.

## What was implemented

- 7 human-translated site languages: **ru, pl, lt, lv, en, de, fr**, selected explicitly without IP-only redirection.
- 19 airport-origin pages × 7 languages, covering WAW, WMI, KRK, GDN, KTW, WRO, POZ, RZE, LUZ, LCJ, SZZ, BZG, VNO, KUN, PLQ, RIX, BER, CDG, ORY.
- 25 distinct city-origin pages × 7 languages. Core Warsaw, Vilnius and Riga routes stay at their existing original URLs, avoiding unnecessary 301 migrations.
- 2 country-grouped directories × 7 languages, one for airports and one for cities; every new page is reachable via internal HTML links, not only a sitemap.
- All **351 indexable canonical URLs** have unique title tags, descriptions and localized on-page H1s. The original **7 thank-you URLs are noindex**.
- Self-referencing canonical tags, 7-language reciprocal HTML `hreflang`, one x-default option, localized menus.
- Russian wording differentiates «такси / индивидуальный трансфер / аэропорт / по запросу» naturally on the appropriate page; no keyword-stuffed text.
- Each origin includes its real IATA airport code or city identity, station/terminal specifics, individual quote, booking explanation, border caution, official airline/airport links when appropriate, related origins, and visible contact/identity.
- JSON-LD `Service`, `TaxiService` provider and `BreadcrumbList` where applicable. No fake price schema or star-rating fields.
- `https://bycomfortline.com/sitemap.xml` includes xhtml:link language alternates for Google.
- `https://bycomfortline.com/sitemap-yandex.xml` is a second, clean XML sitemap with only canonical `loc` and actual-change `lastmod` for Yandex Webmaster submission. This avoids relying on unsupported sitemap language-version markup.
- Existing `robots.txt` advertises the canonical Google sitemap and allows all public pages; `/thank-you/` pages are separately excluded from search by robots meta.
- German and French booking requests are now accepted by the Cloudflare Worker and continue using the Russian notification email template.

## Yandex Webmaster: required owner actions

1. Log in to **https://webmaster.yandex.com/** and add `https://bycomfortline.com/` (HTTPS, non-www). Verify ownership by the **exact DNS TXT record Yandex provides**, entered in Cloudflare DNS. Do not invent a verification token and do not delete Google/Resend verification records.
2. Verify that both `https://bycomfortline.com/robots.txt` and `https://bycomfortline.com/sitemap-yandex.xml` return HTTP 200 without Cloudflare challenge or bot block. For the new site, Cloudflare DNS, Worker custom domain, and canonical redirects need manual testing.
3. Under **Indexing → Sitemap files**, submit `https://bycomfortline.com/sitemap-yandex.xml` and check status with **Sitemap validator**. The crawler usually processes sitemaps within roughly two weeks, not instantly.
4. Under **Indexing → Reindex pages**, prioritize: Russian main page, Russian Warsaw page, Russian Vilnius page, Russian Riga page, and popular Russian airport pages (WAW, WMI, VNO, RIX, KUN), then relevant Berlin/Paris routes. Limits apply, so don't spam every URL repeatedly.
5. Under **Searchable pages**, check total pages included, exclusion reasons, `DUPLICATE`, blocked/forbidden, missing canonical, and server errors. Use **Crawl statistics** to check the bot fetches real HTML and the sitemap.
6. Under **Search query statistics**, create topic groups for taxi/transfer variations, airport codes, cities, vehicle class; track clicks, impressions, CTR and average position **by Russia/Belarus and device** if relevant. Yandex Wordstat can help estimate demand, but its numbers are not proof of actual ranking or traffic.
7. Under **Display in search → Site region**, set a truthful geographical identity based on the actual **Minsk, Belarus** operator. Do not assign fake branches in Warsaw/Paris/Berlin to manipulate localized search results. Regional affiliation is only one ranking factor.
8. Check **Yandex Business** for an existing legitimate ComfortLine organization listing. Claim or create it **only with real entity and location information**, real phone number `+375 29 155 27 76`, and the canonical website. If registered, ensure the web property and Yandex Business use the same HTTPS and www style. Never create fake address pins or fabricated local-office reviews.
9. Review snippet/site-name/favicon previews in **Appearance in search** and Yandex Browser/Yandex results. Fix discrepancies in title, description and site/organization identity if displayed.
10. Check **Yandex Metrica** if configured. Measure *successful booking enquiry reference* conversions, phone taps, WhatsApp clicks and route-page engagement only under compliant privacy and consent practices. Do not inject an unowned counter ID into code.

### Yandex query-to-page map — natural examples

| Search intent | Landing page |
|---|---|
| такси Варшава Минск, Варшава Минск частный трансфер | `/ru/warsaw-minsk-transfer/` |
| такси Вильнюс Минск, индивидуальный трансфер | `/ru/vilnius-minsk-transfer/` |
| трансфер Рига Минск, такси Рига Минск | `/ru/riga-minsk-transfer/` |
| такси аэропорт Шопена Минск, трансфер WAW Минск | `/ru/aeroport-waw-minsk/` |
| трансфер Модлин Минск, WMI Минск | `/ru/aeroport-wmi-minsk/` |
| такси аэропорт Вильнюса Минск, VNO Минск | `/ru/aeroport-vno-minsk/` |
| Каунас Минск такси, трансфер из аэропорта KUN | `/ru/kaunas-minsk-taksi/` and `/ru/aeroport-kun-minsk/` |
| Белосток Минск частное такси | `/ru/bialystok-minsk-taksi/` |
| Берлин Минск трансфер, BER Минск | `/ru/berlin-minsk-taksi/` and `/ru/aeroport-ber-minsk/` |
| Париж Минск трансфер, CDG/ORY Минск | `/ru/paris-minsk-taksi/`, `/ru/aeroport-cdg-minsk/`, `/ru/aeroport-ory-minsk/` |

These are **editorial target phrases, not volume or ranking measurements**. Pages target genuine customer intent, not every query containing a city or «такси».

### SEO quality guardrails

- Keep airport and city pages distinct: the airport code, actual terminal/station context, neighborhood and official source must be correct. If any page lacks enough useful unique content or corresponds to unsupported service, consider removing it from the sitemap and marking it noindex until improved.
- Avoid repetitive keyword lists, mass reciprocal backlinks, algorithmic geo-subdomains, automated doorway pages and unsolicited link-exchange networks.
- Treat long-distance trips **Berlin/Paris → Minsk** as feasibility enquiries rather than fixed routes or guaranteed cars. Confirm border policies and operating permissions for the actual date.
- Keep pricing «по запросу» and car model only on confirmed availability. No promise of priority border passage or fixed arrival time.
- Review whether the verified physical/legal address on the site is correct. Do not use fictitious regional addresses for Yandex Maps.
- For every substantial content update, set an accurate lastmod date; do not refresh lastmod daily unless content actually changes.
- Verify mobile readability and form behavior on real iOS/Android; check that Cloudflare security bot protections do not block Yandexbot.

### Monitoring and evidence still missing

No authenticated access to the user's Yandex Webmaster or Yandex Metrica account was available, and the live domain could not be fetched from the audit environment. GitHub source-level build tests do **not** verify live deployment or indexing.

After registration, save baseline top queries, indexed-page counts and click/impression data. Check at 2, 4, 8, and 12 weeks. If many new pages are excluded for duplication or low demand, prioritize fewer stronger pages with genuinely unique local information rather than adding more template variations.

## Official Yandex sources

- [Yandex index quality](https://yandex.com/support/webmaster/en/yandex-indexing/site-indexing)
- [Localized pages, HTML hreflang](https://yandex.com/support/webmaster/en/yandex-indexing/locale-pages)
- [Sitemap validator and submission](https://yandex.com/support/webmaster/en/indexing-options/tool-sitemap)
- [Sitemap files and processing](https://yandex.com/support/webmaster/en/indexing-options/sitemap)
- [Handling duplicate pages](https://www.yandex.com/support/webmaster/en/yandex-indexing/about-doubles)
- [Site regional affiliation](https://yandex.com/support/webmaster/en/site-geography/site-region)
- [Reindex priority pages](https://yandex.com/support/webmaster/en/robot-workings/site-reindex)
- [Yandex query analytics](https://yandex.com/support/webmaster/en/service/queries-analytic)
- [Yandex Business verified organizations](https://www.yandex.com/support/business-priority/en/add-company/add-org.html)
- [Improving rankings](https://yandex.com/support/webmaster/en/yandex-indexing/rank.html)
