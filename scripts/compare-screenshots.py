"""Pixel evidence for matching-size captures; metrics are not aesthetic approval.
Usage: python scripts/compare-screenshots.py BEFORE AFTER OUTPUT_PREFIX
Pillow is required; do not install it implicitly during game CI.
"""
import json
import sys
from pathlib import Path
from PIL import Image, ImageChops, ImageStat

before, after, prefix = sys.argv[1:]
a, b = Image.open(before).convert('RGB'), Image.open(after).convert('RGB')
if a.size != b.size:
    raise ValueError('Viewport sizes differ; capture matching viewports first')
diff = ImageChops.difference(a, b)
pixels = diff.tobytes()
changed = sum(max(pixels[i:i+3]) > 6 for i in range(0, len(pixels), 3))
metrics = {'size': list(a.size), 'changedPixelsAbove6': changed,
           'changedPercent': round(changed * 100 / (a.width * a.height), 4),
           'meanAbsoluteChannelError': ImageStat.Stat(diff).mean,
           'interpretation': 'Observed pixel difference; not creative approval or FPS'}
Path(prefix).parent.mkdir(parents=True, exist_ok=True)
diff.save(prefix + '-diff.png')
pair = Image.new('RGB', (a.width * 2, a.height))
pair.paste(a, (0, 0))
pair.paste(b, (a.width, 0))
pair.save(prefix + '-pair.png')
Path(prefix + '.json').write_text(json.dumps(metrics, indent=2), encoding='utf-8')
print(json.dumps(metrics))
