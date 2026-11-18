"""Daily 2.6 · consagrados adultos y mayores, varón y mujer, armados por código con los dibujos que ya hay (sin gastar PixelLab).
  · Varones (sotana y clergyman): la cabeza de la edad sobre el dibujo del joven, igual que la ropa laica (edades_pixellab.poner_cabeza).
  · Mujeres (consagrada, caridad, dominica, carmelita): tienen velo, así que no se cambia la cabeza entera: se pega solo la cara de la
    edad en el hueco que deja el velo (la piel del dibujo, cerrada y rellena), alineada con la cara del joven. La mayor queda con
    anteojos (peinado «base») o sin anteojos («rodete»: bajo el velo solo cambia eso).
Suma las filas a assets/personaje/{m,f}_{adulto,mayor}.png y a pj.json. Después: herramientas/piel_mascara.py.
Uso: python3 herramientas/consagrados_edades.py   (se puede correr más de una vez: reemplaza sus filas)"""
import os, sys, json, numpy as np
from PIL import Image
from scipy import ndimage
AQUI = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, AQUI)
import edades_pixellab as EP, caras as C
R = EP.R; P = EP.P
u8 = lambda a: a.astype(np.uint8)
VARON = ['sotana', 'clergyman']; MUJER = ['consagrada', 'caridad', 'dominica', 'carmelita']

def desplaz(T, B, M0):
    """cuánto está corrida la cara en el dibujo T respecto del dibujo de base B (las caras son la misma, pegada por caras.py)"""
    best = None
    for dy in range(-4, 5):
        for dx in range(-4, 5):
            Ms = np.roll(np.roll(M0, dy, 0), dx, 1); Bs = np.roll(np.roll(B, dy, 0), dx, 1); ok = Ms & (T[:, :, 3] > 0) & C.piel(T)
            if ok.sum() < 50: continue
            e = np.abs(T[:, :, :3].astype(int) - Bs[:, :, :3].astype(int)).sum(2)[ok].mean() + 300 * (1 - ok.sum() / Ms.sum())
            if best is None or e < best[0]: best = (e, dx, dy)
    return best[1], best[2]

def cara_en_velo(T, D, B, M0, y0, y1):
    dx, dy = desplaz(T, B, M0); Ds = np.roll(np.roll(D, dy, 0), dx, 1)
    hueco = C.piel(T); hueco[:y0 + dy - 3] = 0; hueco[y1 + dy + 2:] = 0     # la cara que deja ver el velo (sin el cuello)
    hueco = ndimage.binary_fill_holes(ndimage.binary_closing(hueco, iterations=2))
    lab, n = ndimage.label(hueco); 
    if n > 1: hueco = lab == (1 + np.argmax(ndimage.sum(hueco, lab, range(1, n + 1))))
    use = hueco & (Ds[:, :, 3] > 0)
    arriba = np.zeros_like(use); arriba[:y0 + dy + 7] = True          # en la frente no entra el flequillo de la edad: ahí va el velo
    use &= ~(arriba & ~C.piel(Ds))
    out = T.copy(); out[use] = Ds[use]; return out

def filas():
    nuevas = {}
    base = EP.frame('m', 'base|base'); N = EP.cuello('m')
    for edad, cab in (('adulto', 'adulto_m_base_1'), ('mayor', 'mayor_m_base_1')):
        nuevas[('m', edad)] = {p + '|base': Image.fromarray(u8(EP.poner_cabeza(EP.img(P + cab + '.png'), EP.frame('m', p + '|base'), base, N)), 'RGBA') for p in VARON}
    B = u8(EP.frame('f', 'base|base')); y0, y1, _ = C.CFG['f']; M0 = C.mascara(B, y0, y1)
    for edad, cabs in (('adulto', {'base': 'adulta_f_base_2'}), ('mayor', {'base': 'mayor_f_base_2', 'rodete': 'mayor_f_base_3'})):
        d = {}
        for pe, cab in cabs.items():
            D = u8(EP.img(P + cab + '.png'))
            for p in MUJER: d[p + '|' + pe] = Image.fromarray(cara_en_velo(u8(EP.frame('f', p + '|base')), D, B, M0, y0, y1), 'RGBA')
        nuevas[('f', edad)] = d
    return nuevas

if __name__ == '__main__':
    pj = json.load(open(R + 'pj.json'))
    for (sx, edad), cuadros in filas().items():
        k = f'{sx}_{edad}'; H = Image.open(R + k + '.png').convert('RGBA'); combos = pj[k]['combos']
        viejas = [c for c in combos if c.split('|')[0] not in VARON + MUJER]      # las laicas, en su orden
        S = Image.new('RGBA', (128, 128 * (len(viejas) + len(cuadros))), (0, 0, 0, 0)); nuevo = {}
        for i, c in enumerate(viejas): S.paste(H.crop((0, combos[c]['fila'] * 128, 128, combos[c]['fila'] * 128 + 128)), (0, i * 128)); nuevo[c] = {**combos[c], 'fila': i}
        for j, (c, im) in enumerate(cuadros.items()): S.paste(im, (0, (len(viejas) + j) * 128)); nuevo[c] = {'fila': len(viejas) + j, 'dibujo': f'codigo_{edad}_{sx}'}
        S.save(R + k + '.png', optimize=True); pj[k]['combos'] = nuevo; print(k, len(viejas), '+', len(cuadros))
    json.dump(pj, open(R + 'pj.json', 'w'), ensure_ascii=False, separators=(',', ':'))
