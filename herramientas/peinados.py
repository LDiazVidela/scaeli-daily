"""Daily 2.1.3 · peinados nuevos (los del creador de personajes del juego) y el clergyman con la cabeza de los demás.

Cómo se arma cada dibujo nuevo (todo con dibujos que ya existen; no se dibuja nada por código):
  1. Gemini Pro cambió SOLO el pelo del deportivo / la deportiva (herramientas/gemini/pelo_<sx>_<peinado>.png).
     Se pasa a la grilla de 128 y a la paleta de PixelLab del deportivo, y se le pega la cara exacta (caras.py).
  2. Esa CABEZA (de la frente al cuello) se pone sobre el cuerpo de cada prenda: el de pelo corto (varón) o
     carré (mujer), alineada por los ojos de ese dibujo. Lo que el pelo nuevo baja por debajo del cuello
     (lacio, ondas, trenza) se copia encima de la ropa.
  3. Clergyman: el de pelo «Medio» lleva la cabeza del deportivo y el «Corto» la de la sotana corta
     (antes tenía una cabeza más alta y angosta que cambiaba la cara).
Escribe assets/personaje/{m,f}.png y pj.json (las filas nuevas van al final; las que ya existen se reescriben).
Uso: python3 herramientas/peinados.py   (después de herramientas/caras.py)
"""
import os, sys, json, numpy as np
from PIL import Image
AQUI = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, AQUI)
from caras import hoja, fila, mascara, procesar, pegar2, CFG, R
from pix_gemini import a_sprite, a_cuadro, a_paleta
from scipy import ndimage

NUEVOS = {'m': ['ondulado', 'rulos', 'lacio', 'rapado'], 'f': ['ondas', 'trenza', 'flequillo']}
CUERPO = {'m': 'corto', 'f': 'corto'}          # de qué peinado se toma el cuerpo de cada prenda
SIN_PELO = ('sotana', 'clergyman')              # (varón) igual llevan los peinados nuevos
VELO = ('consagrada', 'caridad', 'dominica', 'carmelita')

def corte(D):
    """fila donde termina el cuello del deportivo: la primera, bajo los ojos, donde se ensancha (hombros)."""
    a = D[:, :, 3] > 0; anchos = [a[y].sum() for y in range(128)]
    for y in range(24, 40):
        if anchos[y] - anchos[y - 1] >= 3: return y
    return 30

def desplazar(A, dx, dy):
    return np.roll(np.roll(A, dy, 0), dx, 1)

def cabeza_gemini(sx, nombre, D, M, caja):
    sp = a_cuadro(a_sprite(os.path.join(AQUI, 'gemini', f'pelo_{sx}_{nombre}.png')))
    a = np.array(a_paleta(sp, [Image.fromarray(D)]))
    # huecos blancos que quedaron entre el pelo y la cara: fondo
    w = (a[:, :, 3] > 0) & (a[:, :, :3].min(2) > 222); lab, n = ndimage.label(w)
    for i in range(1, n + 1):
        m = lab == i
        if (D[:, :, 3][m] == 0).mean() > .5: a[:, :, 3][m] = 0
    o, (dx, dy) = pegar2(a, D, M, caja)          # dónde quedó respecto del deportivo
    a = desplazar(procesar(sx, a, D, M, caja), -dx, -dy)
    return a

def poner_cabeza(B, Hd, D, M, caja, cut, extra):
    """B: cuerpo; Hd: cabeza en el lugar del deportivo; extra: máscara (en lugar del deportivo) de pelo bajo el corte."""
    _, (dx, dy) = pegar2(B, D, M, caja)
    out = B.copy(); c = cut + dy
    out[:c] = 0
    H = desplazar(Hd, dx, dy); X = desplazar(extra, dx, dy)
    sup = np.zeros(B.shape[:2], bool); sup[:c] = True
    usa = (sup & (H[:, :, 3] > 0)) | X
    out[usa] = H[usa]
    return out

def pelo_abajo(Hd, D, cut):
    """lo que el pelo nuevo agrega bajo el corte (largo, ondas, trenza): lo que cambió respecto del deportivo,
    pegado al pelo de arriba, más su contorno oscuro (que sobre la remera negra del deportivo no se distingue)."""
    dif = np.abs(Hd[:, :, :3].astype(int) - D[:, :, :3].astype(int)).sum(2) > 60
    dif &= (Hd[:, :, 3] > 0); dif[:cut] = False
    oscuro = (Hd[:, :, 3] > 0) & (Hd[:, :, :3].astype(int).sum(2) < 170)
    cand = dif | (oscuro & ndimage.binary_dilation(dif)); cand[:cut] = False   # el contorno une los tramos (trenza)
    lab, n = ndimage.label(cand); keep = np.zeros_like(cand)
    for i in range(1, n + 1):
        z = lab == i
        if z.sum() >= 3 and np.argwhere(z)[:, 0].min() <= cut + 2: keep |= z
    borde = ndimage.binary_dilation(keep) & oscuro & ~keep; borde[:cut] = False
    return keep | borde

def main():
    pj = json.load(open(R + 'pj.json'))
    for sx in 'mf':
        H = hoja(sx); D = fila(H, sx, 'deportiva|base'); y0, y1, caja = CFG[sx]; M = mascara(D, y0, y1); cut = corte(D)
        C = pj[sx]['combos']; filas = H.shape[0] // 128; nuevas = {}
        def guardar(k, img):
            nonlocal filas
            if k in C: nuevas[C[k]['fila']] = img
            else: C[k] = {'fila': filas, 'dibujo': 'gemini'}; nuevas[filas] = img; filas += 1
        sin = np.zeros((128, 128), bool)
        if sx == 'm':
            # clergyman: «Medio» con la cabeza del deportivo y «Corto» con la de la sotana corta
            cl = fila(H, sx, 'clergyman|corto')
            so = fila(H, sx, 'sotana|corto'); _, (sx_, sy_) = pegar2(so, D, M, caja); cab_corto = desplazar(so, -sx_, -sy_)
            guardar('clergyman|base', poner_cabeza(cl, D, D, M, caja, cut, sin))
            guardar('clergyman|corto', poner_cabeza(cl, cab_corto, D, M, caja, cut, sin))
        cuerpos = sorted({k.split('|')[0] for k in C if k.split('|')[0].split(':')[0] not in VELO})
        for nombre in NUEVOS[sx]:
            if not os.path.exists(os.path.join(AQUI, 'gemini', f'pelo_{sx}_{nombre}.png')): print('falta', sx, nombre); continue
            Hd = cabeza_gemini(sx, nombre, D, M, caja); ex = pelo_abajo(Hd, D, cut)
            for pr in cuerpos:
                base = pr + '|' + CUERPO[sx] if pr + '|' + CUERPO[sx] in C else pr + '|base'
                if pr == 'clergyman': B = nuevas[C['clergyman|corto']['fila']]
                else: B = fila(H, sx, base)
                guardar(pr + '|' + nombre, poner_cabeza(B, Hd, D, M, caja, cut, ex))
        out = np.zeros((filas * 128, 128, 4), np.uint8); out[:H.shape[0]] = H
        for f, img in nuevas.items(): out[f * 128:f * 128 + 128] = img
        Image.fromarray(out, 'RGBA').save(R + sx + '.png', optimize=True)
        print(sx, 'filas', filas, 'combos', len(C))
    json.dump(pj, open(R + 'pj.json', 'w'), ensure_ascii=False, separators=(',', ':'))

if __name__ == '__main__': main()
