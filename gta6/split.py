# Отделение одного персонажа от другого на арте: маска фона (альфа или rembg) + водораздел по контурам рисунка
# с метками-«семенами» для каждого персонажа.  python3 split.py
import os, sys
import numpy as np
from PIL import Image, ImageFilter
from skimage.segmentation import watershed
from skimage.filters import sobel
from skimage.morphology import disk, binary_dilation
HERE = os.path.dirname(os.path.abspath(__file__))

def run(rgba, seeds, keep, out, bgseeds=()):
    a = np.array(rgba).astype(np.float32) / 255.0
    alpha = a[..., 3]; mask = alpha > 0.05
    gray = (a[..., 0] * .3 + a[..., 1] * .59 + a[..., 2] * .11)
    grad = sobel(gray)
    markers = np.zeros(gray.shape, np.int32)
    for lab, pts in seeds.items():
        for (x, y, r) in pts:
            yy, xx = np.ogrid[:gray.shape[0], :gray.shape[1]]
            markers[((xx - x) ** 2 + (yy - y) ** 2 <= r * r) & mask] = lab
    for (x, y, r) in bgseeds:
        yy, xx = np.ogrid[:gray.shape[0], :gray.shape[1]]
        markers[((xx - x) ** 2 + (yy - y) ** 2 <= r * r)] = 9
    lab = watershed(grad, markers, mask=mask)
    sel = (lab == keep)
    # мягкий край только там, где режем по соседу; внешний контур берём из исходной альфы
    selm = Image.fromarray((sel * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
    na = (np.array(selm).astype(np.float32) / 255.0) * alpha
    rgba2 = np.array(rgba).copy(); rgba2[..., 3] = (na * 255).astype(np.uint8)
    im = Image.fromarray(rgba2); bb = im.getbbox(); im = im.crop(bb); im.save(out); print(out, im.size, 'offset', bb[:2])
    return lab

if __name__ == '__main__':
    which = sys.argv[1]
    if which == 'jason':
        im = Image.open(f'{HERE}/img/jason_lucia.png').convert('RGBA'); im = im.crop(im.getbbox())
        J = [(850, 140, 30), (800, 260, 25), (790, 600, 40), (860, 760, 30), (1000, 400, 30), (1120, 520, 25), (1080, 220, 20),
             (850, 1100, 50), (640, 1150, 25), (1000, 1150, 40), (690, 500, 18), (720, 380, 18), (760, 900, 25), (600, 1280, 15)]
        L = [(400, 330, 30), (330, 300, 25), (420, 600, 40), (520, 760, 35), (430, 900, 40), (300, 1150, 30), (480, 1200, 25),
             (60, 900, 15), (140, 800, 20), (560, 560, 25), (380, 470, 20), (250, 1300, 15)]
        lab = run(im, {1: J, 2: L}, 1, f'{HERE}/cut/jason.png')
    elif which == 'lucia':
        src = Image.open(f'{HERE}/img/robbery_logo.jpg').convert('RGB')
        S = 1.28  # координаты меток даны в масштабе превью 2000x1125
        box = (int(780 * S), int(100 * S), int(1760 * S), 1440)
        crop = src.crop(box)
        os.environ['U2NET_HOME'] = '/root/.rembg/models/birefnet-general'
        from rembg import remove, new_session
        cut = remove(crop, session=new_session('birefnet-general'))
        cut.save('/tmp/claude-0/-home-user-video234/b7cd2455-73e1-534d-ab20-0a526604a9d1/scratchpad/robbery_people.png')
        f = lambda pts: [(int(x * S - box[0]), int(y * S - box[1]), r) for (x, y, r) in pts]
        L = f([(1050, 230, 20), (1120, 250, 18), (1150, 170, 12), (1100, 430, 30), (870, 470, 15), (1030, 560, 15), (1080, 720, 30),
               (1000, 950, 25), (1160, 1000, 20), (1240, 760, 12), (1060, 330, 15), (1190, 360, 12), (1230, 470, 12), (1110, 1090, 12), (1170, 280, 7), (1160, 210, 7), (1140, 120, 8), (990, 290, 4), (1000, 250, 5)])
        J = f([(1420, 130, 18), (1430, 250, 20), (1450, 450, 30), (1650, 330, 20), (1450, 850, 30), (1450, 1050, 20), (1310, 150, 12),
               (1320, 600, 12), (1560, 230, 15), (1250, 240, 10), (1380, 980, 15)])
        BG = f([(1700, 950, 30), (1900, 980, 30), (1600, 1000, 15), (900, 800, 20), (1330, 900, 10), (1270, 1000, 10)])
        lab = run(cut, {1: J, 2: L}, 2, f'{HERE}/cut/lucia.png', bgseeds=BG)
    # контроль: раскраска областей
    pal = np.array([[0, 0, 0], [60, 130, 255], [255, 60, 120]] + [[0, 0, 0]] * 6 + [[30, 30, 30]], np.uint8)
    Image.fromarray(pal[lab]).resize((lab.shape[1] // 2, lab.shape[0] // 2)).save(f'/tmp/claude-0/-home-user-video234/b7cd2455-73e1-534d-ab20-0a526604a9d1/scratchpad/split_{which}.png')

def clean_lucia():
    # убрать остаток руки Джейсона справа от хвоста (светлые пиксели), тёмные пряди волос оставить
    from PIL import ImageDraw
    im = Image.open(f'{HERE}/cut/lucia.png').convert('RGBA'); a = np.array(im).astype(np.float32)
    poly = Image.new('L', im.size, 0)
    ImageDraw.Draw(poly).polygon([(500, 238), (492, 205), (506, 165), (520, 140), (565, 98), (605, 45), (670, 30), (670, 270), (560, 270)], fill=255)
    p = np.array(poly) > 0
    lum = (a[..., 0] * .3 + a[..., 1] * .59 + a[..., 2] * .11) / 255
    kill = p
    box = np.zeros_like(p); box[172:232, 478:502] = True
    kill |= box & (lum > 0.5)
    a[..., 3][kill] = 0
    out = Image.fromarray(a.astype(np.uint8)); out.save(f'{HERE}/cut/lucia.png'); print('cleaned', int(kill.sum()))

if __name__ == '__main__' and sys.argv[1] == 'lucia':
    clean_lucia()
