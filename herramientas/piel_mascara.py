"""Daily 2.3 · máscara de la piel del personaje (para los tonos de piel).
Para cada dibujo de assets/personaje/{m,f}.png marca los píxeles de piel: colores de la paleta de la cara (la cara es el
componente de piel más grande) que forman manchas de al menos 4 píxeles. Así no se tocan reflejos del pelo ni sombras de la ropa.
Escribe assets/personaje/{hoja}_piel.png para m, f y las hojas de las edades (m_nino, f_mayor, …) (blanco = piel). La app tiñe solo esos píxeles (js/personaje.js, TONOS).
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
        M[i*128:(i+1)*128] = m
    Image.fromarray((M * 255).astype(np.uint8), 'L').convert('1').save(R + sx + '_piel.png', optimize=True)
    return H, M, pal
if __name__ == '__main__':
    hojas = ['m', 'f'] + [f'{sx}_{e}' for e in ('nino', 'adulto', 'mayor') for sx in 'mf' if os.path.exists(R + f'{sx}_{e}.png')]
    import json
    pj = json.load(open(R + 'pj.json'))
    for sx in hojas:
        H, M, pal = mascara_hoja(sx); print(sx, 'paleta', len(pal), 'px piel', int(M.sum()), 'tono', REFS[sx])
        if len(sx) > 1 and sx.endswith('nino'): pj[sx]['ref'] = REFS[sx]   # 2.3.1: los niños tienen su propio tono de cara
    json.dump(pj, open(R + 'pj.json', 'w'), ensure_ascii=False, separators=(',', ':'))
