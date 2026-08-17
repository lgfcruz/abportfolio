#!/usr/bin/env python3
"""Gera imagens placeholder com as dimensoes exactas declaradas no conteudo JSON.
Correr APENAS enquanto o conteudo for ficticio:  python3 scripts/gen-placeholders.py
Quando as imagens reais chegarem, apagar public/media e este script."""
import json, os, glob
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG_EXT = ('.jpg', '.jpeg', '.png', '.webp')
found = {}

def walk(node, label):
    if isinstance(node, list):
        for n in node: walk(n, label)
        return
    if not isinstance(node, dict): return
    src = node.get('src')
    if isinstance(src, str) and src.startswith('/media/') and src.lower().endswith(IMG_EXT):
        found[src] = (node.get('width') or 1600, node.get('height') or 900, label)
    og = node.get('og')
    if isinstance(og, str) and og.startswith('/media/') and og.lower().endswith(IMG_EXT):
        found[og] = (1200, 630, label)
    for v in node.values(): walk(v, label)

files = [('content/site.json', 'Arthur Brabo'), ('content/showreel.json', 'Showreel 2026')]
files += [(p, os.path.basename(p)[:-5]) for p in sorted(glob.glob('content/projects/*.json'))]
for f, label in files:
    walk(json.load(open(os.path.join(ROOT, f), encoding='utf-8')), label)

PAL = [('#0A0A0B', '#20202A'), ('#131316', '#2A2430'), ('#0E1013', '#232B2E')]

def font(size):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
              '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def hexrgb(h): return tuple(int(h[i:i+2], 16) for i in (1, 3, 5))

for i, (src, (w, h, label)) in enumerate(sorted(found.items())):
    out = os.path.join(ROOT, 'public', src.lstrip('/'))
    os.makedirs(os.path.dirname(out), exist_ok=True)
    a, b = PAL[i % len(PAL)]
    ca, cb = hexrgb(a), hexrgb(b)
    im = Image.new('RGB', (w, h))
    d = ImageDraw.Draw(im)
    for y in range(h):  # gradiente diagonal simples
        t = y / max(1, h - 1)
        d.line([(0, y), (w, y)], fill=tuple(round(cb[k] + (ca[k] - cb[k]) * t) for k in range(3)))
    # grelha discreta
    step = max(40, w // 24)
    pass
    name = os.path.basename(src).rsplit('.', 1)[0]
    f1, f2, f3 = font(max(18, w // 24)), font(max(13, w // 44)), font(max(11, w // 60))
    def center(text, fnt, dy, fill):
        bb = d.textbbox((0, 0), text, font=fnt)
        d.text(((w - (bb[2] - bb[0])) / 2, h / 2 + dy), text, font=fnt, fill=fill)
    center(label, f1, -h * 0.10, '#FF6A3D')
    center(name, f2, -h * 0.01, '#A6ACB8')
    center(f'PLACEHOLDER · {w}×{h}', f3, h * 0.07, '#8A91A0')
    d.rectangle([0, 0, w - 1, h - 1], outline='#2E2E36', width=max(1, w // 400))
    if out.lower().endswith('.png'):
        im.save(out, 'PNG', optimize=True)
    else:
        im.save(out, 'JPEG', quality=55, optimize=True, progressive=True)

os.makedirs(os.path.join(ROOT, 'public/media/showreel'), exist_ok=True)
open(os.path.join(ROOT, 'public/media/showreel/showreel-2026.vtt'), 'w').write(
    'WEBVTT\n\n00:00:00.000 --> 00:01:05.000\n[Música: por definir — faixa royalty-free]\n')
print(f'{len(found)} placeholders gerados')
