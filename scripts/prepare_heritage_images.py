#!/usr/bin/env python3
"""Create local responsive WebPs for verified Belarus destination heritage photos.

The catalogue only contains reviewed Commons file pages, creators and licences.
Unlike the general city thumbnails, these retain the source aspect ratio so
portrait cathedral photographs are never cropped into misleading wide banners.
"""
from __future__ import annotations

import hashlib
import json
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageOps, UnidentifiedImageError

from prepare_city_landmark_images import metadata, urlopen_bytes

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "heritage-landmark-photos.json"
OUTPUT = ROOT / "dist/assets/heritage"
SIZES = (640, 1200)


def main() -> None:
    entries = json.loads(MANIFEST.read_text("utf-8"))["images"]
    ids = [item["id"] for item in entries]
    if len(entries) != 4 or len(ids) != len(set(ids)):
        raise ValueError("Expected four unique vetted heritage destinations")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    credit_file = OUTPUT / "credits.json"
    previous = {item["id"]: item for item in json.loads(credit_file.read_text("utf-8"))} if credit_file.is_file() else {}
    output = []
    for item in entries:
        ident = item["id"]
        matches = [
            previous.get(ident, {}).get(field) == item[field]
            for field in ("sourcePage", "credit", "license", "licenseUrl")
        ]
        files = [OUTPUT / f"{ident}-{width}.webp" for width in SIZES]
        if all(matches) and all(path.is_file() for path in files):
            output.append(previous[ident])
            print(f"Already verified: {ident}", flush=True)
            continue

        url, info = metadata(item)  # Verifies source filename and Commons licence.
        print(f"Downloading {ident} ({info['width']} x {info['height']})", flush=True)
        try:
            with Image.open(BytesIO(urlopen_bytes(url))) as original:
                original.load()
                image = ImageOps.exif_transpose(original).convert("RGB")
        except (UnidentifiedImageError, OSError) as exc:
            raise RuntimeError(f"Invalid source raster image: {ident}") from exc
        if image.width < 640 or image.height < 400:
            raise ValueError(f"Source photograph is too small: {ident} {image.size}")

        variants = []
        for width, path in zip(SIZES, files):
            height = round(image.height * width / image.width)
            copy = image.resize((width, height), Image.Resampling.LANCZOS)
            for quality in (81, 76, 70, 64):
                copy.save(path, format="WEBP", quality=quality, method=6)
                if 1000 < path.stat().st_size <= 450000:
                    break
            else:
                raise ValueError(f"Heritage WebP larger than budget: {path}")
            binary = path.read_bytes()
            variants.append({
                "path": path.name,
                "width": width,
                "height": height,
                "bytes": len(binary),
                "sha256": hashlib.sha256(binary).hexdigest()
            })
            print(f"  {path.name}: {width} x {height}, {len(binary)} bytes", flush=True)
        output.append({
            "id": ident, "sourcePage": item["sourcePage"], "credit": item["credit"],
            "license": item["license"], "licenseUrl": item["licenseUrl"],
            "adjustment": "Resized and converted to WebP without cropping",
            "variants": variants
        })

    # Only write credits after all four images have validated successfully.
    credit_file.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", "utf-8")
    print(f"Validated {len(output)} historical destination images / {len(output) * 2} WebPs", flush=True)


if __name__ == "__main__":
    main()
