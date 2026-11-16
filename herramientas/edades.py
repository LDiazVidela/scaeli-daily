"""Daily 2.3 · edades del personaje: niño/niña, adulto/adulta y mayor (además del joven de PixelLab).
Gemini Pro redibujó los dibujos del joven en cada edad, dos figuras por imagen (herramientas/gemini/edades/{edad}_{sx}{1,2}.png):
  {edad}_{sx}1: ropa de base y buzo gris · {edad}_m2: deportiva y remera gris · {edad}_f2: pollera gris y remera gris.
Cada figura pasa a la grilla de 128 con la paleta de PixelLab del mismo dibujo del joven (edad_gemini.figuras).
Los demás colores de buzo, remera y pollera salen de cambiar los colores de la ropa con la misma correspondencia que hay entre
el gris y ese color en los dibujos del joven (solo de la barbilla para abajo, para no teñir canas ni pelo).
Escribe assets/personaje/{sx}_{edad}.png y agrega a pj.json las claves «{sx}_{edad}». Después: herramientas/piel_mascara.py.
Uso: python3 herramientas/edades.py
"""
import os, sys, json, numpy as np
from PIL import Image
from collections import Counter, defaultdict
from scipy import ndimage
AQUI = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, AQUI)
from edad_gemini import figuras
R = os.path.join(AQUI, '..', 'assets', 'personaje') + '/'
G = os.path.join(AQUI, 'gemini', 'edades') + '/'
pj = json.load(open(R + 'pj.json'))
COLORES = ['gris', 'blanco', 'negro', 'azul', 'bordo']
FIG = {'m': [['base|base', 'buzo:gris|base'], ['deportiva|base', 'remera:gris|base']],
       'f': [['base|base', 'buzo:gris|base'], ['pollera:gris|base', 'remera:gris|base']]}
EDADES = ['nino', 'adulto', 'mayor']

def hoja(sx): return Image.open(R + sx + '.png').convert('RGBA')
def frame(H, sx, k): f = pj[sx]['combos'][k]['fila']; return H.crop((0, f * 128, 128, f * 128 + 128))

def piel(a):
    r, g, b = [a[..., i].astype(int) for i in range(3)]
    return (a[..., 3] > 0) & (r > 140) & (r > g) & (g > b) & (r - b > 60)

def barbilla(a):
    """fila más baja de la cara (el componente de piel más alto y grande)"""
    m = piel(a); m[70:] = 0; lab, n = ndimage.label(m)
    if not n: return 40
    k = np.argmax(ndimage.sum(m, lab, range(1, n + 1))) + 1; ys = np.where(lab == k)[0]; return int(ys.max())

def principal(a, m):
    """color más común de la máscara (sin contornos ni brillos extremos)"""
    px = a[m][:, :3]; L = px.mean(1); px = px[(L > 40) & (L < 245)]
    c = Counter(map(tuple, px.tolist())); return np.array(c.most_common(1)[0][0], float) if c else None

def objetivos(H, sx, prenda, color):
    """el color de la prenda en gris y en el color pedido, arriba (torso) y, en la pollera, abajo (falda), en los dibujos del joven"""
    a = np.array(frame(H, sx, prenda + ':gris|base')).astype(int); b = np.array(frame(H, sx, prenda + ':' + color + '|base')).astype(int)
    d = (a[..., 3] > 0) & (b[..., 3] > 0) & (np.abs(a[..., :3] - b[..., :3]).sum(2) > 20)
    arriba = d.copy(); arriba[78:] = 0; abajo = d.copy(); abajo[:80] = 0
    out = {'arriba': (principal(a, arriba), principal(b, arriba))}
    if prenda == 'pollera': out['abajo'] = (principal(a, abajo), principal(b, abajo))
    return out

def gris(a):
    c = a[..., :3].astype(int); L = c.mean(2)
    return (a[..., 3] > 0) & ((c.max(2) - c.min(2)) < 34) & (L > 62) & (L < 250)

def region(a, semilla_y, desde):
    """la prenda gris que contiene la columna del centro a partir de semilla_y (relleno por vecinos, sin cruzar contornos)"""
    g = gris(a); g[:max(0, desde - 8)] = 0; lab, n = ndimage.label(g)   # desde un poco más arriba: el cuello de la prenda
    for y in range(semilla_y, 126):
        for x in (63, 62, 64, 61, 65, 60, 66):
            if lab[y, x]: return lab == lab[y, x], y
    return np.zeros_like(g), None

def recolor(fr, objs):
    a = np.array(fr).astype(float); y0 = barbilla(np.array(fr)) + 1
    m1, y1 = region(np.array(fr), y0 + 6, y0)
    zonas = [(m1, objs['arriba'])]
    if 'abajo' in objs:
        # pollera: blusa y falda. La falda empieza donde la columna del centro toma el gris de la falda; cada mancha gris
        # (debajo de la barbilla, cerca del centro) va a la blusa si empieza antes de esa fila y a la falda si empieza después
        A = np.array(fr).astype(int); refF = objs['abajo'][0]; top = None
        for y in range(y0 + 10, 124):
            if A[y, 63, 3] and np.abs(A[y, 63, :3] - refF).sum() < 45 and all(np.abs(A[y + k, 63, :3] - refF).sum() < 60 for k in range(1, 4)):
                top = y; break
        if top:
            g = gris(A); g[:max(0, y0 - 8)] = 0; lab, n = ndimage.label(g); blusa = np.zeros_like(g); falda = np.zeros_like(g)
            for k in range(1, n + 1):
                ys, xs = np.where(lab == k)
                if xs.max() < 36 or xs.min() > 92 or ys.max() < y0 + 3: continue
                (blusa if ys.min() < top - 1 else falda)[lab == k] = True
            zonas = [(blusa, objs['arriba']), (falda, objs['abajo'])]
    for m, (ref, T) in zonas:
        if ref is None or T is None or not m.any(): continue
        a[m, :3] = np.clip(a[m, :3] * (T / np.maximum(ref, 1)), 0, 255)
    return Image.fromarray(a.astype(np.uint8), 'RGBA')

def armar(sx, edad):
    H = hoja(sx); cuadros = {}
    for i, pares in enumerate(FIG[sx], 1):
        refs = [frame(H, sx, k) for k in pares]
        frs, per, runs = figuras(G + f'{edad}_{sx}{i}.png', refs)
        if len(frs) != 2: raise SystemExit(f'{edad}_{sx}{i}: se esperaban 2 figuras, salieron {len(frs)} {runs}')
        for k, f in zip(pares, frs): cuadros[k] = f
    for prenda in ['buzo', 'remera'] + (['pollera'] if sx == 'f' else []):
        base = cuadros[prenda + ':gris|base']
        for c in COLORES[1:]: cuadros[f'{prenda}:{c}|base'] = recolor(base, objetivos(H, sx, prenda, c))
    claves = list(cuadros)
    S = Image.new('RGBA', (128, 128 * len(claves)), (0, 0, 0, 0))
    for i, k in enumerate(claves): S.paste(cuadros[k], (0, i * 128))
    S.save(R + f'{sx}_{edad}.png', optimize=True)
    pj[f'{sx}_{edad}'] = {'combos': {k: {'fila': i, 'dibujo': f'gemini_{edad}_{sx}'} for i, k in enumerate(claves)}}
    return S

if __name__ == '__main__':
    for edad in EDADES:
        for sx in 'mf':
            S = armar(sx, edad); print(sx, edad, S.size)
    json.dump(pj, open(R + 'pj.json', 'w'), ensure_ascii=False, separators=(',', ':'))
