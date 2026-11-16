"""Daily 2.2.1 · portadas nuevas hechas con Gemini Pro (con daily_camino y daily_biblioteca de referencia de estilo).
python3 herramientas/ilus_gemini.py entrada.png daily_clave [ancho]
Busca la grilla de píxeles del dibujo, toma la mediana de cada celda (píxel limpio), recorta a la proporción de las
portadas (320×184), deja ~44 colores sin tramado (como las de PixelLab) y guarda assets/ilus/daily_clave.png."""
import sys, numpy as np
from PIL import Image

def grilla(a):
    g = a.astype(int).sum(2)
    dx = (np.abs(np.diff(g, axis=1)) > 30).sum(0).astype(float)
    dy = (np.abs(np.diff(g, axis=0)) > 30).sum(1).astype(float)
    mejor = (0, None)
    for s10 in range(30, 130):            # tamaño de celda de 3,0 a 12,9 px (de a 0,1)
        s = s10 / 10
        for v in (dx,):
            pos = np.arange(len(v))
            fase = (pos + 1) % s
            # energía de bordes que cae cerca de un múltiplo de s, para la mejor fase
            for f10 in range(0, int(s * 10), 3):
                f = f10 / 10
                d = np.abs(((pos + 1 - f) % s) - 0)
                d = np.minimum(d, s - d)
                sc = v[d < 0.5].sum() / max(1, v.sum()) - (1 / s)
                if sc > mejor[0]:
                    mejor = (sc, (s, f))
    return mejor

def limpiar(src, W=None):
    im = Image.open(src).convert("RGB"); a = np.array(im)
    sc, sf = grilla(a)
    H0, W0 = a.shape[:2]
    if sf and sc > 0.25:
        s, f = sf
        nx = int((W0 - f) // s); ny = int((H0 - f) // s)
        out = np.zeros((ny, nx, 3), np.uint8)
        for j in range(ny):
            y0 = int(f + j * s); y1 = max(y0 + 1, int(f + (j + 1) * s))
            for i in range(nx):
                x0 = int(f + i * s); x1 = max(x0 + 1, int(f + (i + 1) * s))
                c = a[y0 + (y1 - y0) // 4: y1 - (y1 - y0) // 4 or y1, x0 + (x1 - x0) // 4: x1 - (x1 - x0) // 4 or x1].reshape(-1, 3)
                out[j, i] = np.median(c, 0)
        sm = Image.fromarray(out)
    else:
        sm = im.resize((W or 320, round((W or 320) * H0 / W0)), Image.BOX)
    # recorte a 320:184
    w, h = sm.size; r = 320 / 184
    if w / h > r: nw = round(h * r); sm = sm.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else: nh = round(w / r); sm = sm.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    if W and sm.size[0] != W: sm = sm.resize((W, round(W / r)), Image.NEAREST)
    q = sm.quantize(colors=44, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")
    return q, sc, sf

if __name__ == "__main__":
    q, sc, sf = limpiar(sys.argv[1], int(sys.argv[3]) if len(sys.argv) > 3 else None)
    q.save("assets/ilus/" + sys.argv[2] + ".png", optimize=True)
    print(sys.argv[2], q.size, "grilla", sf, round(sc, 2))
