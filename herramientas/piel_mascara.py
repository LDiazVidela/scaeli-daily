"""Daily 2.3 · máscara de la piel del personaje (para los tonos de piel).
Para cada dibujo de assets/personaje/{m,f}.png marca los píxeles de piel: colores de la paleta de la cara (la cara es el
componente de piel más grande) que forman manchas de al menos 4 píxeles. Así no se tocan reflejos del pelo ni sombras de la ropa.
Escribe assets/personaje/{hoja}_piel.png para m, f y las hojas de las edades (m_nino, f_mayor, …) (blanco = piel). La app tiñe solo esos píxeles (js/personaje.js, TONOS).
2.3.1: la máscara se agranda a las sombras de la piel y pj.json guarda el rango de luz de la piel de cada hoja («luz»).
Uso: python3 herramientas/piel_mascara.py   (cada vez que cambien las hojas del personaje)
"""
import os, numpy as np
from PIL import Image
from collections import Counter
from scipy import ndimage
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'personaje') + '/'
def piel(H):
    r, g, b, a = [H[..., k].astype(int) for k in range(4)]
    return (a > 0) & (r > 140) & (r > g) & (g > b) & (r - b > 60)
PALETAS = {}; REFS = {}
def mascara_hoja(sx):
    H = np.array(Image.open(R + sx + '.png').convert('RGBA')); n = H.shape[0] // 128
    c = Counter()
    for i in range(n):
        F = H[i*128:(i+1)*128]; m = piel(F); lab, k = ndimage.label(m)
        if k: big = np.argmax(ndimage.sum(m, lab, range(1, k+1))) + 1; c.update(map(tuple, F[lab == big][:, :3].tolist()))
    pal = {col for col, v in c.items() if v >= (20 if len(sx) == 1 else 6)}
    if len(sx) > 1: pal |= PALETAS.get(sx[0], set())   # 2.3.1: las edades llevan el cuerpo (brazos, manos) del joven
    PALETAS[sx] = pal
    REFS[sx] = list(c.most_common(1)[0][0])   # el tono principal de la cara: desde ahí se escala a los demás tonos
    M = np.zeros(H.shape[:2], bool)
    for i in range(n):
        F = H[i*128:(i+1)*128]
        m = piel(F) & np.array([[tuple(p) in pal for p in fila] for fila in F[:, :, :3].tolist()])
        lab, k = ndimage.label(m)
        if k:
            sz = ndimage.sum(m, lab, range(1, k+1)); keep = np.isin(lab, [j+1 for j, s in enumerate(sz) if s >= 4]); m &= keep
        # 2.3.1: se agranda a los vecinos con aspecto de piel (sombras de la cara, mejillas, cuello), sin tocar pelo ni ropa
        c = F[..., :3].astype(int); r, g, b = c[..., 0], c[..., 1], c[..., 2]; L = 0.299*r + 0.587*g + 0.114*b
        suelta = (F[..., 3] > 0) & (r >= g) & (g >= b - 6) & (r - b > 28) & (L > 78) & (r > 110)
        for _ in range(3): m = m | (ndimage.binary_dilation(m) & suelta)
        M[i*128:(i+1)*128] = m
    Image.fromarray((M * 255).astype(np.uint8), 'L').convert('1').save(R + sx + '_piel.png', optimize=True)
    return H, M, pal
if __name__ == '__main__':
    hojas = ['m', 'f'] + [f'{sx}_{e}' for e in ('nino', 'adulto', 'mayor') for sx in 'mf' if os.path.exists(R + f'{sx}_{e}.png')]
    import json
    pj = json.load(open(R + 'pj.json'))
    for sx in hojas:
        H, M, pal = mascara_hoja(sx)
        # 2.3.1: la app pinta cada tono con una rampa de 5 colores según la luz de cada píxel de piel, de la más clara (luz)
        # a la más oscura (sombra) de esa hoja: luz = percentil 98 de la luminancia de la piel, sombra = percentil 2
        c = H[..., :3][M].astype(float); L = 0.299*c[:, 0] + 0.587*c[:, 1] + 0.114*c[:, 2]
        pj[sx]['luz'] = [round(float(np.percentile(L, 2)), 1), round(float(np.percentile(L, 98)), 1)]
        pj[sx].pop('ref', None)
        print(sx, 'paleta', len(pal), 'px piel', int(M.sum()), 'luz', pj[sx]['luz'])
    json.dump(pj, open(R + 'pj.json', 'w'), ensure_ascii=False, separators=(',', ':'))
