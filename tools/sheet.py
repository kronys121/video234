import sys
from PIL import Image
files = sys.argv[2:]; out = sys.argv[1]
w, h = 360, 640
S = Image.new('RGB', (w * len(files), h))
for i, f in enumerate(files): S.paste(Image.open(f).resize((w, h), Image.LANCZOS), (i * w, 0))
S.save(out, quality=88)
