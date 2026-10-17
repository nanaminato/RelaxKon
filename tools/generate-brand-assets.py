"""Derive desktop and website brand sizes from the shared transparent master.

Run with Python 3 + Pillow, then run Tools/Mobile/sync-desktop-icons.py in RelaxKonOS
and tools/generate-og-image.mjs in this website.
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / 'RelaxKon/public'
DESKTOP = ROOT / 'RelaxKonOS/Client/RelaxKonOS.Client/Assets'
MASTER = ROOT / 'RelaxKonOS/design/brand/sleeping-calico-master.png'
source = Image.open(MASTER).convert('RGBA')
source = source.crop(source.getchannel('A').getbbox())


def icon(size, fraction=0.90, background=None):
    canvas = Image.new('RGBA', (size, size), background or (0, 0, 0, 0))
    cat = ImageOps.contain(source, (round(size * fraction), round(size * fraction)), Image.Resampling.LANCZOS)
    canvas.alpha_composite(cat, ((size - cat.width) // 2, (size - cat.height) // 2))
    return canvas


icon(1024).save(DESKTOP / 'RelaxKonOS-client-icon.png', optimize=True)
icon(256).save(DESKTOP / 'RelaxKonOS-client-icon.ico', sizes=[(s, s) for s in (16, 24, 32, 48, 64, 128, 256)])
icon(512).save(PUBLIC / 'brand-mark.png', optimize=True)
for size in (16, 32, 48):
    icon(size, 0.96).save(PUBLIC / f'favicon-{size}x{size}.png', optimize=True)
icon(256, 0.96).save(PUBLIC / 'favicon.ico', sizes=[(s, s) for s in (16, 32, 48, 64, 128, 256)])
for size in (192, 512):
    icon(size, 0.82, '#FFF6E9').convert('RGB').save(PUBLIC / f'icon-{size}.png', optimize=True)
icon(180, 0.82, '#FFF6E9').convert('RGB').save(PUBLIC / 'apple-touch-icon.png', optimize=True)
# The entire subject stays within the central safe circle (radius 40% of canvas).
icon(512, 0.60, '#FFF6E9').convert('RGB').save(PUBLIC / 'icon-maskable-512.png', optimize=True)
print('Desktop and website icons generated from', MASTER)
