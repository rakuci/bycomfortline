# ComfortLine — Search Console crawl/index triage (4 November 2026)

**Source:** user-exported `bycomfortline.com-Coverage-Drilldown-2026-11-04.xlsx`, `Metadata`: **Crawled – currently not indexed**; attached Google Search Console screenshot.  
**Property:** `https://bycomfortline.com/`  
**Important:** This file shows one exclusion category, NOT the total number of indexed URLs. Do not extrapolate a percentage indexed from it.

## Verified numerical breakdown

| Group | Count | Share of reported exclusions |
|---|---:|---:|
| Origin → Belarus destination route combinations (`/<lang>/transfers/<origin>-<destination>/` and localized equivalents) | 65 | 84.4% |
| Belarus city / Minsk Airport destination hubs | 6 | 7.8% |
| Direct city / airport → Minsk location pages | 6 | 7.8% |
| **Total** | **77** | **100%** |

| Language | Count |
|---|---:|
| Russian (ru) | 26 |
| Latvian (lv) | 14 |
| German (de) | 11 |
| Polish (pl) | 10 |
| French (fr) | 7 |
| English (en) | 6 |
| Lithuanian (lt) | 3 |

- First detected in screenshot: **20 October 2026**.
- Last crawl dates shown in exported Excel: **23–25 October 2026** (Excel date serials 46318–46320).
- All reported crawl events predate the **3 November** multilingual SEO/site deployment and should NOT be treated as an assessment of its changes.
- Of the site's 1,541 indexable canonical URLs after 3 November, 1,134 are origin→destination combinations (18 origins × 9 Belarus destinations × 7 languages); this group also represents a large majority of published pages, so its appearance in many excluded examples is not by itself evidence of a systemic penalty.

## Representative page-source checks

The latest generated HTML in `dist/` was inspected for:
- `/ru/transfery/vno-baranovichi/`
- `/ru/transfery/ory-vitebsk/`
- `/en/transfers/rix-brest/`
- `/en/transfers/bialystok-brest/`
- `/ru/goroda-belarusi/brest/`
- `/ru/aeroport-lcj-minsk/`

The generated pages contain self-referencing `<link rel="canonical">`, `index,follow` robots metadata, one topical H1, substantial static HTML, localized pickup and arrival material, and internal links. None of those static-source observations proves an actual Googlebot HTTP 200 response. External live checks must verify Cloudflare routing, status and body.

Quality concern: Most route-pair pages are generated from the same structure and shared translated sections. They do contain specific origin and destination facts, but many combinations have limited unique first-hand service/route evidence. Google may decide that only a subset provides enough incremental value or demand. This is a hypothesis, not a diagnosis confirmed by Search Console.

## Immediate action plan

### P1 — Search Console URL Inspection of important routes, before new mass changes

Inspect:
1. `https://bycomfortline.com/ru/goroda-belarusi/brest/`
2. `https://bycomfortline.com/ru/goroda-belarusi/msq/`
3. `https://bycomfortline.com/ru/aeroport-lcj-minsk/`
4. `https://bycomfortline.com/en/transfers/bialystok-brest/`
5. `https://bycomfortline.com/ru/transfery/vno-baranovichi/`
6. `https://bycomfortline.com/de/privattransfers/cdg-grodno/`

For each, record **Google-selected canonical**, user-declared canonical, **Page fetch**, HTTP response, crawl allowed, indexing allowed, last crawl, and rendered/crawled HTML. Run **Test live URL** to see whether the current version differs from the October crawl. A live eligibility pass cannot predict indexing selection.

### P2 — Practical service and copy review

- Keep genuine, searchable country-city/airport-to-Minsk and Belarus destination content that answers the traveller's query; verify that real cars/drivers/licensing can serve those routes.
- Prioritize real, verifiable details: arrival meeting points, routes actually supported, actual vehicle capacity, complete quote terms, border requirements with official source links, and real photos/reviews.
- Fix translation templates that produce awkward nominative forms in Russian, especially `из {place}` and `адрес в {dest}`; grammar and meaning matter for real users.
- Do not bulk change titles, repeat the same generic article 1,134 times, invent route lengths or prices, or claim that newly written text automatically triggers indexing.
- Review route combinations far from Belarus (e.g., Paris airports → small Belarus cities) for genuine feasibility and evidence of search demand. Consider pruning/consolidation ONLY after measuring impressions, leads, and actual business scope.

### P3 — Reassess after the current deployment is crawled

- Compare indexing at the URL-family level after Google has revisited the site. Index coverage is a lagging observation.
- Track eligible pages, **indexed** and excluded groups, organic *non-brand* clicks by language, Google-chosen canonicals, and qualified booking conversions. The attached export alone cannot supply these baselines.
- Request indexing only for a modest set of materially improved, important pages. Avoid repeated mass resubmissions or clicking **Validate Fix** without an actual confirmed fix; Google does not promise index inclusion.

### P4 — Cloudflare and domain aliases

The Cloudflare Worker source has 301 logic for `bycomfortline.by` and WWW aliases, but the Wrangler static-assets configuration currently routes the Worker first for only `/api/*`. For HTML that Cloudflare serves as static assets, Worker-level redirects may not execute. Before modifying production routing, test both alias HTTP responses, check custom-domain settings and Cloudflare Redirect Rules. Do not inadvertently redirect booking POSTs or create redirect loops.

`scripts/check-gsc-77-live.mjs` performs read-only external 200/canonical/indexability spot checks and logs alias status; **it cannot imitate actual Googlebot or change Google indexing**.

## Official guidance

- Google Page Indexing report: https://support.google.com/webmasters/answer/7440203
- Google URL Inspection: https://support.google.com/webmasters/answer/9012289
- Google helpful content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google doorway and scaled-content spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Google crawling and indexing FAQ: https://developers.google.com/search/help/crawling-index-faq
- Yandex low-value/low-demand content: https://www.yandex.com/support/webmaster/en/site-indexing/low-demand
- Yandex duplicates: https://www.yandex.com/support/webmaster/en/yandex-indexing/about-doubles

**Editorial policy:** publish only factual, useful services; do not confuse search indexing with guaranteed search ranking.
