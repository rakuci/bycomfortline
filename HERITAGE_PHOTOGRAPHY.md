# Destination heritage photography: verified sources and usage

Updated 20 October 2026. Source file: `heritage-route-photos.mjs`.

## Editorial standard

For international chauffeur/airport transfer pages, show an **authentic landmark in the Belarus destination** first, preferably with a documented connection to the departure region. Never display a departure-city landmark labelled as a Belarus arrival site. Image captions must not imply historical ties or transport availability that cannot be supported. Editorial copy is separate from the booking/quote process.

| Origin context | Belarus landmark | Photo credit | Licence and source | Rationale |
| --- | --- | --- | --- | --- |
| Airports and routes in **Poland → Minsk** | Church of Saints Simon and Helena (Red Church), Minsk | Julia Boda | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) · [Wikimedia file](https://commons.wikimedia.org/wiki/File:Church_of_Saints_Simon_and_Alena_(Red_Church).jpg) | Designed by Polish architects Tomasz Pajzderski and Władysław Marconi and funded by Edward Woyniłłowicz, a Polish–Belarusian landowner. |
| **Lithuania → Minsk** | Cathedral of the Holy Name of Mary, Minsk | Hanna Zelenko | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) · [Wikimedia file](https://commons.wikimedia.org/wiki/File:Belarus-Minsk-Archcathedral_of_Name_of_Virgin_Mary-1.jpg) | Completed in 1710 in the Polish–Lithuanian Commonwealth; a relevant link for Vilnius and Kaunas departures. |
| **Germany → Minsk** | City Hall on Freedom Square, Minsk | Hanna Zelenko | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) · [Wikimedia file](https://commons.wikimedia.org/wiki/File:Belarus-Minsk-City_Hall-1.jpg) | Minsk obtained Magdeburg municipal rights in 1499, reflecting a Central European legal/civic tradition. |
| **Latvia, France → Minsk** | Minsk City Hall | Hanna Zelenko | As above | Recognizable destination landmark. The source does not support a specifically Riga- or Paris-built monument, so no fictional direct connection is claimed. |
| **Poland and Lithuania → Grodno** | St. Francis Xavier Cathedral, Grodno | Alexxx1979 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) · [Wikimedia file](https://commons.wikimedia.org/wiki/File:Grodno_Saint_Francis_Xavier_Cathedral_IMG_1355_2175.jpg) | The Jesuit cathedral was constructed in the era of the Polish–Lithuanian Commonwealth. |

These four photographs are **real Creative Commons files from Wikimedia Commons**. They are currently delivered via the Wikimedia image service; the browser displays local, existing, destination-appropriate WebP photos if an upstream photograph cannot be loaded. Every image has translated alt/title, a factual photo caption, a credited source, a licence link, and an `ImageObject` with provenance. We do **not** claim the new Wikimedia photos have been committed locally as WebPs or validated in the live Cloudflare build.

### Coverage

- 19 airport-to-Minsk pages × 7 languages = **133** specific airport pages.
- Warsaw–Minsk, Vilnius–Minsk, Riga–Minsk core routes × 7 languages = **21** pages.
- Polish or Lithuanian Grodno point-to-point pages use the authentic Grodno Jesuit cathedral.
- All other origin–destination pair pages now use their **Belarus destination photograph**, rather than incorrectly preferring the departure city photo.
- The generated sitemaps continue to list all 1,499 canonical indexable URLs. Google receives image-sitemap details for **verified local** images, while Yandex receives a simple canonical sitemap.

### Historical references

- [Church of Saints Simon and Helena, Minsk](https://en.wikipedia.org/wiki/Church_of_Saints_Simon_and_Helena)
- [Cathedral of the Holy Name of Mary, Minsk](https://en.wikipedia.org/wiki/Cathedral_of_the_Holy_Name_of_Saint_Virgin_Mary)
- [Historic Magdeburg law research](https://magdeburg-law.com/)
- [Cathedral of St. Francis Xavier, Grodno](https://en.wikipedia.org/wiki/St._Francis_Xavier_Cathedral%2C_Grodno)

### Validation and deployment

Run `node build.mjs` followed by `node check-seo.mjs`. The build itself imports the SEO checks after writing `dist`. Both `sitemap.xml` and `sitemap-yandex.xml` are declared in `robots.txt`.

The exact live deployment, CDN response codes, loading of third-party Commons thumbnails, and indexing in Google/Yandex **must be checked after Cloudflare publishes the corresponding commit**. Avoid claiming a successfully published picture from a source-level audit alone.
