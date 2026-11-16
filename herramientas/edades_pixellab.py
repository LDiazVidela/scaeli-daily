"""Daily 2.3.1 · edades del personaje hechas en PixelLab (reemplazan las de Gemini de la 2.3, que no gustaron).
Fuentes en herramientas/pixellab_edades/ (PixelLab, Pixen, 1 generación cada una; ver LEEME-DAILY.md, 2.3.1):
  · Adultos y mayores: «Edit image» sobre el dibujo del joven (ropa de base): PixelLab cambió solo la cabeza (filas 0–40),
    el cuerpo queda igual. Acá se pone esa cabeza sobre TODAS las ropas laicas del joven (camisa clara, remera, buzo, camisa,
    deportiva, pollera, en los cinco colores): misma ropa y mismos colores que el joven, sin gastar más créditos.
      adulto_m_base_1 (40 años, barba) · mayor_m_base_1 (70, canas y barba blanca)
      adulta_f_base_2 (40, colita) · mayor_f_base_2 (70, anteojos, peinado «base») · mayor_f_base_3 (70, rodete, peinado «rodete»)
  · Niños: dibujo nuevo con «Create image» (96 × 96, otro cuerpo) y su ropa con «Edit image»: base, buzo, remera, deportiva
    (y pollera ella), en gris; los otros cuatro colores salen de teñir la prenda gris (edades.recolor, mismo método de la 2.3).
    nino_m_base_3 + nino_m_{buzo2,remera,deportiva} · nina_f_base_2 + nina_f_{buzo,remera,pollera,deportiva}
Escribe assets/personaje/{sx}_{edad}.png y sus claves en pj.json. Después: herramientas/piel_mascara.py.
Uso: python3 herramientas/edades_pixellab.py
"""
import os, sys, json, numpy as np
from PIL import Image
AQUI = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, AQUI)
import edades as E          # recolor/objetivos (2.3)
R = E.R; P = os.path.join(AQUI, 'pixellab_edades') + '/'
pj = E.pj
COLORES = E.COLORES
LAICAS = {'m': ['base', 'remera', 'buzo', 'camisa', 'deportiva'], 'f': ['base', 'remera', 'buzo', 'pollera', 'deportiva']}
CABEZAS = {('m', 'adulto'): {'base': 'adulto_m_base_1'}, ('m', 'mayor'): {'base': 'mayor_m_base_1'},
           ('f', 'adulto'): {'base': 'adulta_f_base_2'}, ('f', 'mayor'): {'base': 'mayor_f_base_2', 'rodete': 'mayor_f_base_3'}}
NINOS = {'m': {'base|base': 'nino_m_base_3', 'buzo:gris|base': 'nino_m_buzo2', 'remera:gris|base': 'nino_m_remera', 'deportiva|base': 'nino_m_deportiva'},
         'f': {'base|base': 'nina_f_base_2', 'buzo:gris|base': 'nina_f_buzo', 'remera:gris|base': 'nina_f_remera',
               'pollera:gris|base': 'nina_f_pollera', 'deportiva|base': 'nina_f_deportiva'}}

def img(p): return np.array(Image.open(p).convert('RGBA')).astype(int)
def frame(sx, k): return np.array(E.frame(E.hoja(sx), sx, k)).astype(int)

def cuello(sx):
    """fila donde termina la cabeza: la más baja que cambió PixelLab en las cabezas de esa hoja (barba, mentón) + 1"""
    b = frame(sx, 'base|base'); ys = []
    for d in CABEZAS[(sx, 'adulto')].values(), CABEZAS[(sx, 'mayor')].values():
        for k in d:
            a = img(P + k + '.png'); dif = np.abs(a - b).sum(2) > 30; dif[50:] = False
            ys.append(np.where(dif.sum(1) >= 3)[0].max())   # filas con al menos 3 píxeles cambiados (no puntas sueltas)
    return max(ys) + 1

def es_camisa(c):
    """la camisa clara del dibujo de base (crema, también en sombra): clara, cálida y poco saturada (no es piel ni canas)"""
    r, g, b = c[..., 0], c[..., 1], c[..., 2]
    return (r > 140) & (r - b > 18) & (r - b < 70) & (r - g < 35)

def poner_cabeza(cab, ropa, base, N):
    """la cabeza de la edad sobre el dibujo del joven con esa ropa. Hasta N-10 manda la cabeza entera (pelo, cara,
    transparencia). Desde ahí: lo que la edad cambió y no es camisa (barba, puntas de pelo, canas) va de la cabeza; si la edad
    sacó pelo que el joven tenía sobre el hombro (colita) y debajo aparece la camisa clara, se toma la ropa del otro hombro
    (espejo); entre N-10 y N, la cara y el cuello del joven van de la cabeza y su camisa, de la ropa; abajo de N, la ropa."""
    out = ropa.copy(); top = N - 10
    out[:top] = cab[:top]
    A = np.abs(cab - base).sum(2) > 30
    camA = es_camisa(cab[..., :3]) | (cab[..., 3] == 0)
    igual = np.abs(ropa - base).sum(2) <= 30
    espejo = ropa[:, ::-1]
    rr, gg, bb = ropa[..., 0], ropa[..., 1], ropa[..., 2]
    pelo = (ropa[..., 3] > 0) & ((rr + gg + bb) / 3 < 120) & (rr >= gg) & (gg >= bb) & (rr - bb > 15)   # castaño del joven
    for y in range(top, 128):
        for x in range(128):
            if A[y, x] and not camA[y, x]: out[y, x] = cab[y, x]
            elif A[y, x] and camA[y, x]:
                if igual[y, x] or pelo[y, x]: out[y, x] = espejo[y, x] if not (np.abs(espejo[y, x] - base[y, x]).sum() <= 30) else cab[y, x]
            elif pelo[y, x] and camA[y, x] and cab[y, x, 3] > 0: out[y, x] = espejo[y, x]   # colita del joven que la edad no tiene
            elif y < N and not es_camisa(base[y, x, :3]) and base[y, x, 3] > 0: out[y, x] = cab[y, x]
    return out

def a128(a, pie=126):
    """un dibujo de 96 en el lienzo de 128, centrado y con los pies en la misma fila que el joven"""
    im = Image.fromarray(a.astype(np.uint8), 'RGBA'); bb = im.getbbox(); fig = im.crop(bb)
    c = Image.new('RGBA', (128, 128)); c.paste(fig, ((128 - fig.width) // 2, pie + 1 - fig.height)); return c

def armar_adultos(sx, edad):
    H = E.hoja(sx); base = frame(sx, 'base|base'); N = cuello(sx); cuadros = {}
    for pe, k in CABEZAS[(sx, edad)].items():
        cab = img(P + k + '.png')
        for clave in pj[sx]['combos']:
            prenda, peinado = clave.split('|')
            if peinado != 'base' or prenda.split(':')[0] not in LAICAS[sx]: continue
            out = poner_cabeza(cab, frame(sx, clave), base, N)
            cuadros[prenda + '|' + pe] = Image.fromarray(out.astype(np.uint8), 'RGBA')
    return cuadros

def armar_ninos(sx):
    H = E.hoja(sx); cuadros = {}
    for clave, k in NINOS[sx].items(): cuadros[clave] = a128(img(P + k + '.png'))
    for prenda in ['buzo', 'remera'] + (['pollera'] if sx == 'f' else []):
        gris = cuadros[prenda + ':gris|base']
        for c in COLORES[1:]: cuadros[f'{prenda}:{c}|base'] = E.recolor(gris, E.objetivos(H, sx, prenda, c))
    return cuadros

def guardar(sx, edad, cuadros):
    claves = list(cuadros); S = Image.new('RGBA', (128, 128 * len(claves)), (0, 0, 0, 0))
    for i, k in enumerate(claves): S.paste(cuadros[k], (0, i * 128))
    S.save(R + f'{sx}_{edad}.png', optimize=True)
    pj[f'{sx}_{edad}'] = {'combos': {k: {'fila': i, 'dibujo': f'pixellab_{edad}_{sx}'} for i, k in enumerate(claves)}}
    print(sx, edad, len(claves), 'dibujos')

if __name__ == '__main__':
    for sx in 'mf':
        guardar(sx, 'nino', armar_ninos(sx))
        for edad in ['adulto', 'mayor']: guardar(sx, edad, armar_adultos(sx, edad))
    json.dump(pj, open(R + 'pj.json', 'w'), ensure_ascii=False, separators=(',', ':'))
