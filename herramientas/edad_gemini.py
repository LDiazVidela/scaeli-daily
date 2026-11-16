"""Daily 2.3.1 · edades del personaje (niño, adulto, mayor) dibujadas con Gemini a partir de los dibujos de PixelLab.
Gemini devuelve una imagen con dos figuras sobre fondo blanco en una grilla de píxeles de tamaño cualquiera (~3 px por píxel).
1. se mide la grilla (autocorrelación de los bordes) y se toma el color del centro de cada celda;
2. se separan las dos figuras, se recortan y se ponen en un cuadro de 128 (pies en la fila 125, centradas);
3. cada píxel va al color más cercano de la paleta de PixelLab de esos mismos dibujos (pix_gemini.a_paleta).
Uso: from edad_gemini import figuras; figuras('captura.png', [ref1, ref2]) -> [cuadro1, cuadro2]
"""
import numpy as np
from PIL import Image
from pix_gemini import a_cuadro, a_paleta
from scipy import ndimage

def periodo(a, eje):
    e = (np.abs(np.diff(a, axis=eje)).sum(2) > 40).astype(float).sum(1 - eje)
    e = e - e.mean(); ac = np.correlate(e, e, 'full')[len(e) - 1:]
    # el primer pico fuerte entre 2.5 y 12 px; se afina con los múltiplos
    cand = [p for p in range(3, 13) if ac[p] > ac[p - 1] and ac[p] >= ac[p + 1]]
    p0 = cand[0] if cand else 4
    picos = []
    for k in range(1, 12):
        c = int(round(p0 * k))
        if c + 3 >= len(ac): break
        w = range(max(1, c - 2), c + 3); j = max(w, key=lambda i: ac[i]); picos.append(j / k)
    return float(np.median(picos[2:] if len(picos) > 4 else picos))

def fase(a, eje, p):
    e = (np.abs(np.diff(a, axis=eje)).sum(2) > 40).astype(float).sum(1 - eje)
    best = max(np.arange(0, p, 0.1), key=lambda f: e[np.clip(np.round(np.arange(f, len(e), p)).astype(int), 0, len(e) - 1)].sum())
    return best

def celdas(path):
    a = np.array(Image.open(path).convert('RGB')).astype(int)
    a = a[:-8, :-12]   # bordes de la captura
    # si Gemini devolvió el cuadro blanco dentro de un fondo oscuro (copia de la captura de referencia), se recorta el cuadro blanco
    from scipy import ndimage
    bl = a.min(2) >= 235; lab, n = ndimage.label(bl)
    if n:
        k = np.argmax(ndimage.sum(bl, lab, range(1, n + 1))) + 1; ys, xs = np.where(lab == k)
        if (a.min(2) < 60).mean() > 0.2: a = a[ys.min() + 2:ys.max() - 1, xs.min() + 2:xs.max() - 1]
    px, py = periodo(a, 1), periodo(a, 0); fx, fy = fase(a, 1, px), fase(a, 0, py)
    xs = np.arange(fx + px / 2, a.shape[1] - 1, px); ys = np.arange(fy + py / 2, a.shape[0] - 1, py)
    out = np.zeros((len(ys), len(xs), 4), np.uint8)
    for j, y in enumerate(ys):
        for i, x in enumerate(xs):
            y0, x0 = int(y), int(x); blk = a[max(0, y0 - 0):y0 + 1, max(0, x0 - 0):x0 + 1].reshape(-1, 3)
            out[j, i, :3] = np.median(blk, 0); out[j, i, 3] = 255
    # fondo: blanco (o casi) conectado con el borde
    from collections import deque
    c3 = out[:, :, :3].astype(int); bl = (c3.min(2) >= 196) & (c3.max(2) - c3.min(2) < 28); vis = np.zeros_like(bl); q = deque()
    H, W = bl.shape
    for j in range(H): q.extend([(j, 0), (j, W - 1)])
    for i in range(W): q.extend([(0, i), (H - 1, i)])
    while q:
        j, i = q.popleft()
        if 0 <= j < H and 0 <= i < W and bl[j, i] and not vis[j, i]:
            vis[j, i] = 1; q.extend([(j + 1, i), (j - 1, i), (j, i + 1), (j, i - 1)])
    out[vis.astype(bool), 3] = 0
    # huecos de fondo encerrados (entre el brazo y el cuerpo): manchas casi blancas altas y finas
    hue = bl & ~vis.astype(bool); lab, n = ndimage.label(hue)
    for k in range(1, n + 1):
        ys, xs = np.where(lab == k)
        if ys.max() - ys.min() + 1 >= 5 and xs.max() - xs.min() + 1 <= 3:
            # solo si a los dos lados hay contorno oscuro (un cordón de buzo o un brillo tienen tela al lado)
            Lx = out[:, :, :3].astype(int).mean(2); W = out.shape[1]; osc = 0
            for y in range(ys.min(), ys.max() + 1):
                xr = xs[ys == y]
                if len(xr) and xr.min() > 0 and xr.max() < W - 1 and Lx[y, xr.min() - 1] < 90 and Lx[y, xr.max() + 1] < 90: osc += 1
            if osc >= 0.6 * (ys.max() - ys.min() + 1): out[lab == k, 3] = 0
    return Image.fromarray(out, 'RGBA'), (px, py)

def contorno(fr, ref):
    """el contorno oscuro de PixelLab: los píxeles del borde de la figura que quedaron claros (resto del fondo blanco) se sacan,
    y el borde que queda se pinta con el color de contorno del dibujo de referencia (el más oscuro de su paleta)"""
    from scipy import ndimage
    a = np.array(fr).astype(int); A = a[:, :, 3] > 0
    for _ in range(2):
        borde = A & ~ndimage.binary_erosion(A); claro = borde & (a[:, :, :3].min(2) >= 170) & ((a[:, :, :3].max(2) - a[:, :, :3].min(2)) < 40)
        a[claro, 3] = 0; A = a[:, :, 3] > 0
    r = np.array(ref).astype(int); rp = r[r[:, :, 3] > 0][:, :3]; osc = rp[np.argmin(rp.sum(1))]
    borde = A & ~ndimage.binary_erosion(A, structure=np.array([[0,1,0],[1,1,1],[0,1,0]]))
    L = a[:, :, :3].sum(2); m = borde & (L > 260)
    a[m, :3] = osc
    return Image.fromarray(a.astype(np.uint8), 'RGBA')

def figuras(path, refs):
    im, per = celdas(path); A = np.array(im)[:, :, 3] > 0
    cols = A.any(0); runs = []; x = 0
    while x < len(cols):
        if cols[x]:
            s = x
            while x < len(cols) and cols[x]: x += 1
            if x - s > 15: runs.append((s, x))
        x += 1
    res = []
    for (x0, x1), ref in zip(runs, refs):
        sp = im.crop((x0, 0, x1, im.size[1])); sp = sp.crop(sp.getbbox())
        if sp.size[1] > 126: sp = sp.resize((round(sp.size[0] * 126 / sp.size[1]), 126), Image.NEAREST)
        fr = a_paleta(a_cuadro(sp), [ref]); res.append(contorno(fr, ref))
    return res, per, runs
