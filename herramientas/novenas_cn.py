# Scaeli Daily · las novenas, tal cual las publica Catholic.net (es.catholic.net/op/categoria/1097/novenas.html).
# Condiciones de Catholic.net: texto sin alterar, citar autor y fuente, enlace a Catholic.net y aviso a participa@catholic.net.
# Acá solo se SEPARA el texto por días (se busca el encabezado «Día primero», «1er. Día», «Día I»…) y se sacan los restos de la
# página (el aviso de publicidad y el pie de foto). No se cambia ninguna palabra.
# Uso: 1) bajar la lista y los artículos (ver LEEME) a una carpeta: urls.tsv + a_<id>.html
#      2) python3 novenas_cn.py <carpeta>   → data/novenas.js (la lista) y novenas/<id>.json (el texto de cada una)
import re, sys, json, html, os, datetime

DIR = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

def bloque(h, ident):
    m = re.search(r"<(\w+)[^>]*(?:id|class)=['\"]" + ident + r"['\"][^>]*>", h)
    if not m: return ''
    tag = m.group(1); i = m.end(); depth = 1
    for t in re.finditer(r"<(/?)" + tag + r"\b[^>]*>", h[i:]):
        depth += -1 if t.group(1) else 1
        if depth == 0: return h[i:i + t.start()]
    return h[i:]

def limpio(x):
    x = re.sub(r"<script.*?</script>|<style.*?</style>|<ins.*?</ins>", "", x, flags=re.S | re.I)
    x = re.sub(r"<br\s*/?>", "\n", x, flags=re.I)
    x = re.sub(r"</(p|div|h\d|li|tr)>", "\n", x, flags=re.I)
    x = re.sub(r"<[^>]+>", "", x)
    x = html.unescape(x).replace('\xa0', ' ').replace('\x94', '”').replace('\x93', '“')
    x = re.sub(r"[ \t]+", " ", x)
    x = "\n".join(l.strip() for l in x.split("\n"))
    return re.sub(r"\n{3,}", "\n\n", x).strip()

ORD = 'primer|primero|segundo|tercer|tercero|cuarto|quinto|sexto|s[eé]ptimo|octavo|noveno|d[eé]cimo|[uú]ltimo'
NUM = {'primer': 1, 'primero': 1, 'segundo': 2, 'tercer': 3, 'tercero': 3, 'cuarto': 4, 'quinto': 5, 'sexto': 6, 'septimo': 7, 'séptimo': 7,
       'octavo': 8, 'noveno': 9, 'decimo': 10, 'décimo': 10, 'ultimo': 9, 'último': 9}
ROM = {'i': 1, 'ii': 2, 'iii': 3, 'iv': 4, 'v': 5, 'vi': 6, 'vii': 7, 'viii': 8, 'ix': 9, 'x': 10}
R = re.compile(r"(?:^|[\s(.º*:-])(?:d[ií]a\s*(?:(?P<n2>\d{1,2})\s*[º°o]?(?![\d])|(?P<o2>" + ORD + r")(?![a-zñ])|(?P<r2>viii|vii|vi|iv|ix|iii|ii|i|v|x)(?![a-zñ]))"
               r"|(?P<n1>\d{1,2})\s*(?:er|do|ro|to|vo|no|mo|[º°ªao])?\.?\s*d[ií]a(?![a-zñ])|(?P<o1>" + ORD + r")\s+d[ií]a(?![a-zñ]))", re.I)
BASURA = re.compile(r"^(Reportar anuncios inapropiados\s*\|?|\|)$|^Imagen:", re.I)
MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
MRE = 'enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|sept\\.?|octubre|noviembre|diciembre'
def mes(s): s = s.lower().rstrip('.'); return 9 if s.startswith('set') or s.startswith('sep') else MESES.index(s) + 1

# Afuera: sin el texto en la página (PDF, índice o solo títulos) o repetidas
FUERA = {'79596', '65448', '67763', '15486', '57401', '65103'}
# Las que cambian de fecha cada año: último día respecto de Pascua (o del primer domingo de Adviento)
MOVIL = {'15504': ('pascua', 6), '65662': ('pascua', 67), '69686': ('pascua', 62), '69477': ('pascua', 48), '67380': ('adviento', -8)}
# Nombre en la app (si no, sale del título)
NOMBRE = {'88447': 'San José, para pedir trabajo', '64244': 'Virgen de San Juan de los Lagos', '63603': 'Señor de los Milagros',
          '15499': 'Por los fieles difuntos', '63933': 'Navidad (para hacer con niños)', '69686': 'Jesús Sacramentado (Corpus Christi)',
          '69477': 'Espíritu Santo (decenario)', '69770': 'Jesús Buen Pastor (novena bíblica)', '57536': 'María Auxiliadora y Novena de la Confianza',
          '56274': 'Novena de la Gracia (San Francisco Javier)', '15506': 'La Inmaculada Concepción', '63564': 'San Judas Tadeo (breve)',
          '69067': 'Santa Bernardita (breve)', '15504': 'La Divina Misericordia', '58704': 'La Asunción de la Virgen', '63086': 'La Natividad de la Virgen María',
          '71827': 'La Virgen que desata los nudos', '67380': 'Cristo Rey', '65662': 'Sagrado Corazón de Jesús', '63371': 'El Ángel de la Guarda',
          '62722': 'El Divino Niño Jesús', '62725': 'Santiago Apóstol', '63274': 'San Pío de Pietrelcina', '58950': 'La Virgen Niña',
          '15505': 'Nuestra Señora de Guadalupe', '15503': 'Nuestra Señora del Carmen', '60042': 'La Medalla Milagrosa', '69394': 'Nuestra Señora de Fátima',
          '69793': 'San Josemaría Escrivá', '65867': 'Santos Luis y Celia Martin', '66278': 'San Maximiliano Kolbe', '64649': 'Santo Cura Brochero',
          '60798': 'Señor de Esquipulas', '63178': 'Santísimo Nombre de María'}
# Para no perder las novenas que la gente ya está rezando: el id de antes
ANTES = {'15502': 'jose', '57894': 'antonio', '65662': 'corazon', '69781': 'juanbautista', '15503': 'carmen', '62751': 'ignacio', '66110': 'cayetano',
         '58704': 'asuncion', '63038': 'rosa', '63359': 'teresita', '66861': 'francisco', '66946': 'avila', '60042': 'milagrosa', '15506': 'inmaculada',
         '15505': 'guadalupe', '63933': 'navidad', '64649': 'brochero', '69394': 'fatima', '63274': 'pio', '63636': 'porres', '63564': 'judas',
         '65060': 'expedito', '65839': 'benito', '64221': 'bosco', '63066': 'calcuta', '65000': 'ines', '68154': 'tomasaquino', '55728': 'lourdes',
         '64679': 'patricio', '69067': 'bernardita', '65098': 'catalina', '57536': 'auxiliadora', '65652': 'luisgonzaga', '69793': 'josemaria',
         '62725': 'santiago', '66278': 'kolbe', '63022': 'monica', '63083': 'agustin', '63039': 'ramon', '63559': 'merced', '66873': 'vicente',
         '63371': 'angeles', '66860': 'faustina', '63560': 'rosario', '67553': 'javier', '67528': 'nicolas', '67554': 'juancruz'}

def slug(t):
    import unicodedata
    t = unicodedata.normalize('NFD', t.lower()); t = ''.join(c for c in t if unicodedata.category(c) != 'Mn')
    t = re.sub(r"\b(novena|a|al|la|el|de|del|los|las|san|santa|santo|nuestra|senora|y)\b", " ", t)
    return re.sub(r"[^a-z0-9]+", "", t)[:24] or 'novena'

def nombre(i, t):
    if i in NOMBRE: return NOMBRE[i]
    t = re.sub(r"^Novena\s+(breve\s+|b[ií]blica\s+)?(a\s+la\s+|al\s+|a\s+los\s+|a\s+|de\s+la\s+)", "", t, flags=re.I).strip()
    t = re.sub(r"^san\b", "San", t); return t[0].upper() + t[1:]

out, metas = [], []
os.makedirs(OUT + '/novenas', exist_ok=True)
for line in open(DIR + '/urls.tsv', encoding='utf-8'):
    i, url, _ = line.rstrip('\n').split('\t')
    if i in FUERA: continue
    h = open(f'{DIR}/a_{i}.html', encoding='utf-8', errors='replace').read()
    tx = limpio(bloque(h, 'art_texto')); au = limpio(bloque(h, 'art_autor')); de = limpio(bloque(h, 'art_descripcion')); ti = limpio(bloque(h, 'art_titulo'))
    L = [l for l in tx.split('\n') if not BASURA.search(l.strip())]
    L = re.sub(r"\n{3,}", "\n\n", '\n'.join(L)).strip().split('\n')
    heads, sig = [], 1
    for k, l in enumerate(L):
        if len(l) > 70 or re.search(r"todos los d[ií]as|cada d[ií]a", l, re.I): continue
        m = R.search(l)
        if not m: continue
        n = m.group('n1') or m.group('n2'); o = (m.group('o1') or m.group('o2') or '').lower(); r = (m.group('r2') or '').lower()
        n = int(n) if n else (NUM.get(o) or ROM.get(r))
        if n == sig: heads.append(k); sig += 1
    if heads:
        intro = '\n'.join(L[:heads[0]]).strip()
        dias = ['\n'.join(L[heads[j]:(heads[j + 1] if j + 1 < len(heads) else len(L))]).strip() for j in range(len(heads))]
    else:
        intro, dias = '\n'.join(L).strip(), []
    nd = 10 if len(heads) == 10 else 9
    # «Por: X | Fuente: Y»
    m = re.match(r"Por:\s*(.*?)\s*\|\s*Fuente:\s*(.*)", au)
    por, fuente = (m.group(1), m.group(2)) if m else ('', au)
    nid = ANTES.get(i) or slug(nombre(i, ti))
    meta = {'id': nid, 'cn': i, 'n': nombre(i, ti), 't': ti, 'd': nd, 'por': '' if por.lower() in ('n/a', '') else por, 'fuente': fuente, 'url': url}
    if i in MOVIL: meta['movil'] = list(MOVIL[i])
    else:
        mm = re.search(r"(\d{1,2})\s*(?:de\s+(" + MRE + r"))?\.?\s+(?:al?|-)\s+(\d{1,2})\s+(?:de\s+)?(" + MRE + ")", de, re.I)
        if mm: meta['u'] = '%02d-%02d' % (mes(mm.group(4)), int(mm.group(3)))
        elif i == '63933': meta['u'] = '12-24'
    assert 'u' in meta or 'movil' in meta, (i, ti, de)
    metas.append(meta)
    json.dump({'intro': intro, 'dias': dias}, open(f'{OUT}/novenas/{nid}.json', 'w'), ensure_ascii=False, separators=(',', ':'))

ids = [m['id'] for m in metas]; assert len(ids) == len(set(ids)), [x for x in ids if ids.count(x) > 1]
with open(OUT + '/data/novenas.js', 'w') as f:
    f.write('// Las novenas de Daily: los textos de Catholic.net, sin alterar (herramientas/novenas_cn.py). Lo generó el script: no editar a mano.\n')
    f.write('// u = último día (MM-DD); movil = [desde, días] el último día se cuenta desde Pascua o desde el 1.er domingo de Adviento; d = días (9 o 10).\n')
    f.write('export const NOVENAS=' + json.dumps(metas, ensure_ascii=False, separators=(',', ':')).replace('},{', '},\n{') + ';\n')
print(len(metas), 'novenas ·', sum(1 for m in metas if m['id'] in ANTES.values()), 'con el id de antes')
