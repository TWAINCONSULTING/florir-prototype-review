#!/usr/bin/env python3
"""Fjern flat chroma key og normaliser et ingrediensbilde til transparent PNG."""

from __future__ import annotations

import argparse
import math
from pathlib import Path

from PIL import Image


def hex_color(value: str) -> tuple[int, int, int]:
    value = value.strip().lstrip("#")
    if len(value) != 6:
        raise argparse.ArgumentTypeError("Fargen må være seks hex-tegn, f.eks. 00FF00")
    try:
        return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))
    except ValueError as exc:
        raise argparse.ArgumentTypeError("Ugyldig hex-farge") from exc


def remove_key(
    image: Image.Image,
    key: tuple[int, int, int],
    threshold: float,
    softness: float,
) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = []
    upper = threshold + max(1.0, softness)

    source_pixels = (
        rgba.get_flattened_data()
        if hasattr(rgba, "get_flattened_data")
        else rgba.getdata()
    )
    for red, green, blue, alpha in source_pixels:
        distance = math.sqrt(
            (red - key[0]) ** 2 + (green - key[1]) ** 2 + (blue - key[2]) ** 2
        )
        if distance <= threshold:
            keep = 0.0
        elif distance >= upper:
            keep = 1.0
        else:
            keep = (distance - threshold) / (upper - threshold)

        out_alpha = round(alpha * keep)

        # Demper bare grønnspill i overgangspiksler som allerede er vurdert
        # som delvis chroma key. Naturlig grønn mat med full alfa bevares.
        if keep < 1.0 and green > max(red, blue):
            neutral_green = max(red, blue)
            green = round(neutral_green + (green - neutral_green) * keep)

        pixels.append((red, green, blue, out_alpha))

    rgba.putdata(pixels)
    return rgba


def normalize(image: Image.Image, size: int, padding: int) -> Image.Image:
    alpha = image.getchannel("A")
    box = alpha.point(lambda value: 255 if value > 8 else 0).getbbox()
    if not box:
        raise ValueError("Ingen synlig figur gjenstår etter chroma-key-fjerning")

    subject = image.crop(box)
    available = max(1, size - 2 * padding)
    subject.thumbnail((available, available), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    x = (size - subject.width) // 2
    y = (size - subject.height) // 2
    canvas.alpha_composite(subject, (x, y))
    return canvas


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--key", type=hex_color, default=hex_color("00FF00"))
    parser.add_argument("--threshold", type=float, default=55.0)
    parser.add_argument("--softness", type=float, default=70.0)
    parser.add_argument("--size", type=int, default=256)
    parser.add_argument("--padding", type=int, default=16)
    args = parser.parse_args()

    source = Image.open(args.input)
    cutout = remove_key(source, args.key, args.threshold, args.softness)
    output = normalize(cutout, args.size, args.padding)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    output.save(args.output, "PNG", optimize=True)


if __name__ == "__main__":
    main()
