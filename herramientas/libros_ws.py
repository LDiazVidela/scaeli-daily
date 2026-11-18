"""Daily 2.4 · libros de la biblioteca tomados de es.wikisource.org (ediciones de dominio público, transcritas y corregidas por voluntarios).
Por ahora: «Su vida» de Santa Teresa de Jesús (Espasa-Calpe, Madrid, 1927; ortografía de la época), sin las notas del editor.
Uso: python3 herramientas/libros_ws.py <carpeta con las páginas bajadas>   (cada página, el JSON de action=parse&prop=text de la API,
     guardado como «<título con __ en lugar de />.json»; la API limita los pedidos: bajar con pausas de varios segundos)
Escribe libros/vida.json e imprime la ficha para data/libros.js."""
import sys, os, re, json, html
AQUI = os.path.dirname(os.path.abspath(__file__)); DEST = os.path.join(AQUI, '..', 'libros')
ROM = {'I': 1, 'V': 5, 'X': 10, 'L': 50}
def romano(s):
    t = 0
    for i, c in enumerate(s): v = ROM[c]; t += -v if i + 1 < len(s) and ROM[s[i + 1]] > v else v
    return t
def texto(x):
    x = re.sub(r'<sup[^>]*class="[^"]*reference[^"]*"[^>]*>.*?</sup>', '', x, flags=re.S)
    x = re.sub(r'<br\s*/?>', '\n', x); x = html.unescape(re.sub(r'<[^>]+>', '', x))
    x = x.replace('ň', 'ñ').replace('\xa0', ' ')
    return re.sub(r'[ \t]*\n[ \t]*', '\n', re.sub(r'[ \t]+', ' ', x)).strip()
TAG = re.compile(r'''<(/?)([a-zA-Z][a-zA-Z0-9]*)((?:[^<>"']|"[^"]*"|'[^']*')*)>''')
def simple(m):
    """cada etiqueta, solo con su nombre y su class/id (la página «render» trae atributos data-mw con JSON adentro)"""
    c = re.search(r'''\sclass="([^"]*)"''', m.group(3)); i = re.search(r'''\sid="([^"]*)"''', m.group(3))
    return '<' + m.group(1) + m.group(2) + (' class="' + c.group(1) + '"' if c else '') + (' id="' + i.group(1) + '"' if i and i.group(1) in ('conv-idiomas', 'ws-pie') else '') + '>'
def capitulo(h):
    h = re.sub(r'<style.*?</style>|<!--.*?-->', '', h, flags=re.S)
    h = TAG.sub(simple, h)
    i = h.find('id="conv-idiomas"'); h = h[h.find('</div></div>', i) + 12:] if i >= 0 else h
    for corte in ('<div class="mw-references-wrap', '<ol class="references"', '<div class="ws-noexport"', '<div id="ws-pie'):
        k = h.find(corte)
        if k > 0: h = h[:k]
    res = re.search(r'<div class="ws-sangria-colgante[^>]*>(.*?)</div>', h, flags=re.S)
    P = [texto(p).replace('\n', ' ') for p in re.findall(r'<p(?:\s[^>]*)?>(.*?)</p>', h, flags=re.S)]
    P = [p for p in P if len(p) > 1]
    return (texto(res.group(1)).replace('\n', ' ') if res else ''), P

def su_vida(carp):
    pre = 'Su vida (Santa Teresa de Jesús)__'; caps = []
    arch = {f[len(pre):-5]: f for f in os.listdir(carp) if f.startswith(pre)}
    orden = [k for k in arch if k.startswith('Dedicatoria')] + sorted([k for k in arch if k.startswith('Capítulo ')], key=lambda k: romano(k.split()[1]))
    nums = [romano(k.split()[1]) for k in orden if k.startswith('Capítulo ')]
    assert nums == list(range(1, 41)), ('faltan capítulos', sorted(set(range(1, 41)) - set(nums)))
    for k in orden:
        res, P = capitulo(json.load(open(os.path.join(carp, arch[k]), encoding='utf8'))['text']['*'])
        assert len(P) >= (1 if k.startswith('Dedicatoria') else 3), (k, len(P))
        caps.append({'t': 'Prólogo' if k.startswith('Dedicatoria') else k, 'p': (['> ' + res] if res else []) + P})
    json.dump({'caps': caps}, open(os.path.join(DEST, 'vida.json'), 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
    w = sum(len(p.split()) for c in caps for p in c['p'])
    print(json.dumps({'id': 'vida', 't': 'Libro de la vida', 'a': 'Santa Teresa de Jesús', 'y': '1565', 'sub': 'Su vida contada por ella misma, y su tratado de los cuatro grados de oración.', 'n': len(caps), 'w': w}, ensure_ascii=False))

if __name__ == '__main__': su_vida(sys.argv[1])
