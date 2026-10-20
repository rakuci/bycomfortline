#!/usr/bin/env python3
"""Download ten verified Wikimedia Commons photos and build WebP derivatives.

Runs on GitHub Actions. It does not download arbitrary search results:
file names, authors and licences are curated in city-landmark-photos.json.
"""
from __future__ import annotations

import hashlib
import html
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageOps, UnidentifiedImageError

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "dist/assets/cities"
MANIFEST = ROOT / "city-landmark-photos.json"
API = "https://commons.wikimedia.org/w/api.php"
UA = "byComfortLine-city-image-builder/1.0 (+https://bycomfortline.com/; info@comfortline.by)"
HEADERS = {"User-Agent": UA, "Accept": "application/json,image/*;q=0.9,*/*;q=0.4"}
MAX_BYTES = 16_000_000
Image.MAX_IMAGE_PIXELS = 65_000_000

def urlopen_bytes(url: str, limit=MAX_BYTES, tries=4) -> bytes:
    last = None
    for attempt in range(tries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=55) as response:
                mime = response.headers.get("Content-Type", "")
                if "text/html" in mime:
                    raise ValueError(f"Unexpected HTML instead of image/API response: {url}")
                data = response.read(limit + 1)
                if len(data) > limit:
                    raise ValueError(f"File larger than {limit} bytes: {url}")
                return data
        except (urllib.error.URLError, OSError, ValueError) as exc:
            last = exc
            if attempt + 1 < tries:
                time.sleep(2 * (attempt + 1))
    raise RuntimeError(f"Could not download {url}: {last}")

def metadata(source: dict) -> tuple[str, dict]:
    params = {
        "action": "query",
        "format": "json",
        "formatversion": "2",
        "titles": "File:" + source["file"],
        "prop": "imageinfo",
        "iiprop": "url|size|mime|extmetadata",
        "iiurlwidth": "1800",
        "redirects": "1",
    }
    url = API + "?" + urllib.parse.urlencode(params)
    payload = json.loads(urlopen_bytes(url, limit=2_000_000))
    pages = payload.get("query", {}).get("pages", [])
    if len(pages) != 1 or "missing" in pages[0]:
        raise ValueError(f"Commons image not found: {source['file']}")
    infos = pages[0].get("imageinfo", [])
    if not infos:
        raise ValueError(f"Commons file does not expose imageinfo: {source['file']}")
    info = infos[0]
    mime = info.get("mime", "")
    if mime not in ("image/jpeg", "image/png", "image/webp"):
        raise ValueError(f"Unsupported source image type: {mime}")
    ext = info.get("extmetadata", {})
    licence = html.unescape(ext.get("LicenseShortName", {}).get("value", ""))
    licence_url = html.unescape(ext.get("LicenseUrl", {}).get("value", ""))
    expected = source["license"].lower().replace(" ","")
    actual = licence.lower().replace(" ","")
    expected_url = source["licenseUrl"].rstrip("/")
    if (expected not in actual and not licence_url.rstrip("/").startswith(expected_url)):
        raise ValueError(f"Licence mismatch: expected {source['license']}, Commons says {licence} / {licence_url}")
    return info.get("thumburl") or info["url"], info

def convert(source: dict, data: bytes) -> list[dict]:
    try:
        with Image.open(BytesIO(data)) as im:
            im.load()
            rgb = ImageOps.exif_transpose(im).convert("RGB")
    except (UnidentifiedImageError, OSError) as exc:
        raise ValueError(f"Source is not a valid raster image: {source['id']}") from exc
    if rgb.width < 640 or rgb.height < 400:
        raise ValueError(f"Low-resolution photo: {source['id']} {rgb.size}")
    result = []
    focus = tuple(source.get("center", [.5, .5]))
    for width in (640,1200):
        height = width * 5 // 8
        optimized = ImageOps.fit(rgb, (width,height),
            method=Image.Resampling.LANCZOS, centering=focus)
        filename = f"{source['base']}-{width}.webp"
        target = OUTPUT / filename
        optimized.save(target, format="WEBP", quality=79 if width==640 else 81,
            method=6, exact=False)
        data2 = target.read_bytes()
        if len(data2) > 450_000:
            raise ValueError(f"Over-size WebP: {filename} ({len(data2)} bytes)")
        result.append({"file": filename, "bytes": len(data2),
                       "sha256": hashlib.sha256(data2).hexdigest()})
    return result

def main() -> None:
    spec = json.loads(MANIFEST.read_text("utf-8"))
    entries = spec["images"]
    if len(entries)!=10 or len(set(p["id"] for p in entries))!=10:
        raise ValueError("This job requires exactly ten unique cities")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    report = []
    for i, photo in enumerate(entries, 1):
        print(f"[{i}/10] {photo['city']} — {photo['landmark']} ({photo['credit']})",flush=True)
        url, info = metadata(photo)
        print(f"  source: {info['width']}x{info['height']}, Commons licence verified",flush=True)
        data = urlopen_bytes(url)
        variants = convert(photo, data)
        for item in variants:
            print(f"  {item['file']}: {item['bytes']} bytes",flush=True)
        report.append({"id":photo["id"],"city":photo["city"],"source":photo["sourcePage"],
                       "credit":photo["credit"],"license":photo["license"],
                       "licenseUrl":photo["licenseUrl"],"variants":variants})
    (OUTPUT / "credits.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n","utf-8")
    print(f"Verified and optimized {len(report)} city photographs / {len(report)*2} WebP files",flush=True)

if __name__=="__main__":
    main()
