# Scaeli Daily · el personaje, tal cual lo dibujó PixelLab.
# Copia el frente de cada dibujo (128×128) a una hoja por sexo (desde la 1.6.1, el avatar se ve solo de frente). Solo entran las combinaciones que PixelLab dibujó enteras.
# Sin ningún retoque: cada cuadro es el PNG de PixelLab tal cual.
# Lorenzo (31/10): «sacar todas las caras deformadas y ofrecer pocas opciones». Quedan afuera los dibujos en los que PixelLab
# le cambió la cara al personaje (EXCLUIR); cuando PixelLab los rehaga con la cara del original, se sacan de esa lista.
# Uso: python3 pj_crudo.py   (lee los zips de scala-paquete/pixellab/ con pj_cargar.py)
import json
import numpy as np
from PIL import Image
from pj_cargar import cargar

OUT = '/home/claude/scaeli/scaeli-daily/assets/personaje/'
COLORES = ['gris', 'blanco', 'negro', 'azul', 'bordo']

def ropa(pre, peinado_pre, tipos):
    """(prenda, clave) de cada ropa con color para un peinado."""
    out = []
    for t in tipos:
        for c in COLORES:
            out.append((f'{t}:{c}', f'{peinado_pre}_{t}' + ('' if c == 'gris' else f'_{c}')))
    return out

# Cada combinación «prenda|peinado» → el dibujo de PixelLab que es exactamente eso.
COMBOS = {'m': [], 'f': []}
# Él: despeinado (los dibujos originales), corto y largo
COMBOS['m'] += [('base|base', 'yo'), ('base|corto', 'yo_pelo_corto'), ('base|largo', 'yo_pelo_largo')]
for pn, k in ropa('yo', 'yo', ['remera', 'buzo', 'camisa']): COMBOS['m'].append((pn + '|base', k))
for pn, k in ropa('yo', 'yo_corto', ['remera', 'buzo', 'camisa']): COMBOS['m'].append((pn + '|corto', k))
for pn, k in ropa('yo', 'yo_largo', ['remera', 'buzo', 'camisa']): COMBOS['m'].append((pn + '|largo', k))
COMBOS['m'] += [('sotana|base', 'yo_sotana'), ('sotana|corto', 'yo_corto_sotana'), ('sotana|largo', 'yo_largo_sotana'),
                ('clergyman|corto', 'yo_corto_clergyman')]
# 1.12: el atleta de Scaeli Fit (PixelLab, frente tal cual) como ropa «Deportiva»; está en herramientas/pixellab_extra/
COMBOS['m'] += [('deportiva|base', 'atleta')]
# Ella: colita (los dibujos originales), suelto y carré
COMBOS['f'] += [('base|base', 'yo_f'), ('base|suelto', 'yo_f_pelo_suelto'), ('base|corto', 'yo_f_pelo_corto')]
for pn, k in ropa('yo_f', 'yo_f', ['remera', 'buzo', 'pollera']): COMBOS['f'].append((pn + '|base', k))
for pn, k in ropa('yo_f', 'yo_f_suelto', ['remera', 'buzo', 'pollera']): COMBOS['f'].append((pn + '|suelto', k))
for pn, k in ropa('yo_f', 'yo_f_carre', ['remera', 'buzo', 'pollera']): COMBOS['f'].append((pn + '|corto', k))
COMBOS['f'] += [('consagrada|base', 'yo_f_consagrada'), ('caridad|base', 'yo_f_monja_caridad'),
                ('dominica|base', 'yo_f_monja_dominica'), ('carmelita|base', 'yo_f_monja_carmelita')]
# 2.0.1: la versión mujer de la ropa «Deportiva» (PixelLab, «Edit image» sobre yo_f: misma cara y peinado) va al final de la hoja.
# El atleta de él es el de Fit sin el logo de la remera (PixelLab, «Edit image»; el original queda en atleta_south_original_fit.png).
COMBOS['f'] += [('deportiva|base', 'atleta_f')]

# Desde la 1.8 (Lorenzo, 1/11: «agreguemos todos los estilos que se vean bien en formato frontal»): entra todo lo que de frente se ve
# bien, aunque la cara tenga otro sombreado. Queda afuera solo la camisa azul de él (PixelLab le dibujó un «1» en el pelo).
# 1.8.1 (Lorenzo): él sin pelo largo.
EXCLUIR = {'m': lambda c, k: k == 'yo_camisa_azul' or c.endswith('|largo'), 'f': lambda c, k: False}
for sx in COMBOS: COMBOS[sx] = [x for x in COMBOS[sx] if not EXCLUIR[sx](*x)]
todo = {}
for sx in ('m', 'f'):
    L = COMBOS[sx]
    hoja = np.zeros((128 * len(L), 128, 4), np.uint8)
    meta = {}
    for i, (combo, k) in enumerate(L):
        if k in ('atleta', 'atleta_f'): a = np.array(Image.open(__file__.rsplit('/', 1)[0] + '/pixellab_extra/' + k + '_south.png').convert('RGBA'))
        else: a = np.array(cargar(k)['south'].convert('RGBA'))   # es un avatar: solo el frente
        assert a.shape == (128, 128, 4), (k, a.shape)
        hoja[i * 128:(i + 1) * 128, 0:128] = a
        meta[combo] = {'fila': i, 'dibujo': k}
    Image.fromarray(hoja).save(OUT + sx + '.png', optimize=True)
    todo[sx] = {'combos': meta}
    print(sx, len(L), 'dibujos')
json.dump(todo, open(OUT + 'pj.json', 'w'), separators=(',', ':'), ensure_ascii=False)
print('listo')
