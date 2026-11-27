#!/usr/bin/env python3
"""Genera siluetes negres des d'imatges de personatge (alfa preservat). No modifica originals."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "imagenes" / "jocs-ombres"

PAIRS = [
    ("nacar", "imagenes/personatges/personatge-nacar.webp", "NACAR"),
    ("moix", "imagenes/personatges/personatge-moix.webp", "MOIX"),
    ("monstret", "imagenes/personatges/personatge-monstret.webp", "MONSTRET"),
    ("buho", "imagenes/personatges/personatge-buho.webp", "BUHO"),
    ("cervol", "imagenes/personatges/personatge-cervol.webp", "CERVOL"),
    ("guineu", "imagenes/personatges/personatge-guineu.webp", "GUINEU"),
    ("bosc", "imagenes/personatges/personatge-bosc.webp", "LAIA"),
]

def silueta(src: Path, dst: Path) -> None:
    im = Image.open(src).convert("RGBA")
    a = im.split()[3]
    black = Image.new("RGBA", im.size, (0, 0, 0, 255))
    black.putalpha(a)
    dst.parent.mkdir(parents=True, exist_ok=True)
    black.save(dst, "WEBP", quality=92, method=6)

def main() -> None:
    for _id, rel, tag in PAIRS:
        src = ROOT / rel
        dst = OUT / f"jocs-ombres-silueta-{tag}.webp"
        if not src.is_file():
            raise SystemExit(f"Falta: {src}")
        silueta(src, dst)
        print("OK", dst.name)

if __name__ == "__main__":
    main()