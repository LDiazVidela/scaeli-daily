# Scaeli Daily · los libros de la biblioteca: clásicos católicos en castellano, libres de derechos.
# Fuente: los PDF de mercaba.es (archivo de libros; www.mercaba.es/libros/2.htm), que reproducen obras de dominio público:
# Santa Teresa de Jesús, San Juan de la Cruz y San Ignacio (escritas en castellano) y la Imitación de Cristo en la
# traducción clásica del P. Juan Eusebio Nieremberg (siglo XVII). Se saca el texto con pdftotext y se separa por capítulos;
# no se cambia ninguna palabra (solo se sacan los números de página, los puntos de relleno y los índices).
# Uso: python3 libros_mb.py <carpeta con los PDF>   → data/libros.js (la lista) y libros/<id>.json ({caps:[{t,p:[…]}]})
#   Cada párrafo es un texto; si empieza con «## » es un subtítulo y si empieza con «> » es el resumen del capítulo.
import re, sys, json, os, subprocess, unicodedata

DIR = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
MB = 'https://www.mercaba.es/'

CAP = r'^(CAP[IÍ]TULO\s+(\d+|[IVXL]+|PRIMERO|[UÚ]NICO)\b.*|PR[OÓ]LOGO|EP[IÍ]LOGO|INTRODUCCI[OÓ]N|ARGUMENTO|ANOTACI[OÓ]N|CANCI[OÓ]N\s+\d+ª?)$'
SEC_TERESA = r'^(MORADAS \w+|\w+ MORADAS|LIBRO \w+)$'
LIBROS = [
  dict(id='moradas', pdf='moradas_de_teresa_de_jesus', t='Las moradas del castillo interior', autor='Santa Teresa de Jesús', anio='1577',
       sub='El alma como un castillo de siete moradas, hasta la unión con Dios.', corte=r'^-{20,}', cap=CAP, sec=SEC_TERESA, resumen=True),
  dict(id='vida', pdf='vida_de_teresa_de_jesus', t='Libro de la vida', autor='Santa Teresa de Jesús', anio='1565',
       sub='Su propia historia: de la niñez en Ávila a las mercedes de la oración.', corte=r'^-{20,}', cap=CAP, sec=SEC_TERESA, resumen=True),
  dict(id='camino', pdf='camino_de_perfeccion_de_teresa_de_jesus', t='Camino de perfección', autor='Santa Teresa de Jesús', anio='1566',
       sub='Cómo rezar: amor, desprendimiento y humildad, y el Padrenuestro explicado.', corte=r'^-{20,}', cap=CAP, sec=SEC_TERESA, resumen=True),
  dict(id='exclamaciones', pdf='exclamaciones_del_alma_de_teresa_de_jesus', t='Exclamaciones del alma a Dios', autor='Santa Teresa de Jesús', anio='1569',
       sub='Diecisiete oraciones breves, para rezar con sus palabras.', corte=r'^-{20,}', cap=CAP, sec=None, resumen=False, nombre_cap='Exclamación'),
  dict(id='poesias', pdf='poesias_de_teresa_de_jesus', t='Poesías', autor='Santa Teresa de Jesús', anio='',
       sub='«Vivo sin vivir en mí», «Nada te turbe» y los villancicos del Carmelo.', corte=r'^\s*POES[IÍ]AS\s*$', corte_n=2, cap=r'^(\d+)\.\s+(.+)$', sec=None, resumen=False, poesia=True),
  dict(id='subida', pdf='subida_al_monte_carmelo_de_juan_de_la_cruz', t='Subida del Monte Carmelo', autor='San Juan de la Cruz', anio='1585',
       sub='La noche activa del sentido y del espíritu: desprenderse para unirse a Dios.', corte=r'^-{20,}', cap=CAP, sec=r'^LIBRO \w+$', resumen=True),
  dict(id='noche', pdf='noche_oscura_de_juan_de_la_cruz', t='Noche oscura', autor='San Juan de la Cruz', anio='1585',
       sub='«En una noche oscura»: la purificación pasiva del alma.', renombrar={'Declaración de las canciones del modo que tiene el alma en el': 'Declaración de las canciones'}, corte=r'^DECLARACI[OÓ]N DE LAS CANCIONES', cap=CAP, sec=r'^LIBRO \w+$', resumen=True),
  dict(id='cantico', pdf='cantico_espiritual_de_juan_de_la_cruz', t='Cántico espiritual', autor='San Juan de la Cruz', anio='1584',
       sub='Las canciones entre el alma y el Esposo, explicadas verso a verso.', corte=r'^PR[OÓ]LOGO$', cap=CAP, sec=None, resumen=False),
  dict(id='llama', pdf='llama_de_amor_de_juan_de_la_cruz', t='Llama de amor viva', autor='San Juan de la Cruz', anio='1586',
       sub='Cuatro canciones sobre la unión del alma con Dios.', corte=r'^Declaraci[oó]n de las canciones', cap=r'^(Pr[oó]logo|Canci[oó]n \d+ª|PR[OÓ]LOGO|CANCI[OÓ]N \d+ª)$', sec=None, resumen=False),
  dict(id='avisos', pdf='avisos_espirituales_de_juan_de_la_cruz', t='Dichos de luz y amor', autor='San Juan de la Cruz', anio='',
       sub='Avisos y cautelas breves, para leer uno por día.', renombrar={'Prólogo': '1. Dichos de luz y amor'}, corte=r'^AVISOS ESPIRITUALES$', cap=r'^(1\. Dichos de luz y amor|2\. Puntos de amor.*|3\. Avisos copiados.*|4\. Avisos conservados.*|5\. Avisos procedentes.*|6\. Otros avisos.*|PR[OÓ]LOGO|AVISOS A UN RELIGIOSO.*|CAUTELAS)$', sec=None, resumen=False),
  dict(id='ejercicios', pdf='ejercicios_espirituales_de_ignacio_de_loyola', t='Ejercicios espirituales', autor='San Ignacio de Loyola', anio='1548',
       sub='El texto autógrafo, con su castellano del siglo XVI.', corte=r'^ANOTACIONES$', cap=r'^([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ ,ª0-9]{3,40})$', sec=None, resumen=False, sub_re=r'^\[\d+\]\s+[A-ZÁÉÍÓÚÑ]'),
  dict(id='imitacion', pdf='imitacion_de_cristo_de_kempis', t='Imitación de Cristo', autor='Tomás de Kempis · trad. P. Juan Eusebio Nieremberg', anio='s. XV',
       sub='El libro de cabecera de los santos, en la traducción clásica del siglo XVII.', corte=r'^\s*Cap[ií]tulo PRIMERO', cap=r'^(Cap[ií]tulo\s+\S+\s*:.*|CAP[IÍ]TULO\s+\S+\s*:.*)$', sec=r'^LIBRO\s*:?\s*\w+\s*:?$', resumen=False),
]

def nfc(s): return unicodedata.normalize('NFC', s)
def letras(s): return re.sub(r'[^A-Za-zÁÉÍÓÚÑáéíóúñ]', '', s)
def es_mayus(s): l = letras(s); return len(l) > 2 and l.isupper()
def titulo(s):
    s = re.sub(r'\s+', ' ', s).strip(' .:'); s = re.sub(r'^LIBRO\s*:\s*', 'LIBRO ', s, flags=re.I)
    s = re.sub(r'^CAP[IÍ]TULO\s+PRIMERO', 'Capítulo 1', s, flags=re.I); s = re.sub(r'^CAP[IÍ]TULO\s+[UÚ]NICO', 'Capítulo único', s, flags=re.I)
    s = re.sub(r'^CAP[IÍ]TULO', 'Capítulo', s, flags=re.I); s = re.sub(r'^CANCI[OÓ]N\b', 'Canción', s, flags=re.I); s = re.sub(r'\s*:\s*', ': ', s).replace('Libro: ', 'Libro ').rstrip(': ')
    if es_mayus(s) and len(s) > 5: s = s[0] + s[1:].lower()
    m = re.match(r'^(Capítulo [^:]+: )(.+)$', s)
    if m and es_mayus(m.group(2)): s = m.group(1) + m.group(2)[0] + m.group(2)[1:].lower()
    for n in NOMBRES: s = re.sub(r'\b' + n.lower() + r'\b', n, s)
    return s
NOMBRES = ['Cristo', 'Jesucristo', 'Jesús', 'Dios', 'Señor', 'María', 'Espíritu Santo', 'Iglesia', 'Sagrada Comunión', 'Sacramento', 'Padre', 'Trinidad', 'Evangelio', 'Escritura', 'Santísimo', 'Virgen', 'Cielo', 'Pascua', 'Navidad', 'Esposo', 'Esposa', 'Amado', 'Carmelo']

def pagina(s): return bool(re.match(r'^\s*-?\s*\d{1,3}\s*-?\s*$', s))
def basura(s): return bool(re.search(r'\.{5,}\s*\d*\s*$', s)) or bool(re.match(r'^\s*(-{5,}|_{5,}|\|)', s))

def parsear(L, cfg):
    # 1) recorte: desde la línea «corte» (la n-ésima vez)
    corte = re.compile(cfg['corte']); n = cfg.get('corte_n', 1); ini = 0
    for i, l in enumerate(L):
        if corte.search(l.strip()):
            n -= 1
            if n == 0: ini = i; break
    L = L[ini:]
    cap = re.compile(cfg['cap']); sec = re.compile(cfg['sec']) if cfg.get('sec') else None; subre = re.compile(cfg['sub_re']) if cfg.get('sub_re') else None
    caps, seccion, actual, parr = [], '', None, []
    def cerrar():
        nonlocal parr
        if parr and actual is not None:
            t = '\n'.join(parr) if es_verso(parr) else ' '.join(parr)
            # un párrafo cortado por el salto de página sigue en minúscula: se une al anterior
            if actual['p'] and t[0].islower() and not actual['p'][-1].startswith(('## ', '> ')) and not actual['p'][-1].rstrip().endswith(('.', '!', '?', '»', ':', ')')): actual['p'][-1] += ' ' + t
            else: actual['p'].append(t)
        parr = []
    def es_verso(ls): return len(ls) >= 2 and sum(1 for x in ls if len(x) < 52) >= 0.7 * len(ls) and max(len(x) for x in ls) < 70
    i = 0
    while i < len(L):
        raw = L[i].replace('\f', ''); s = raw.strip(); i += 1
        if pagina(s) or basura(s): continue
        if not s: cerrar(); continue
        s = re.sub(r'^\.{3,}\s*', '', s)     # los puntos de relleno de la Imitación
        if sec and sec.match(s): cerrar(); seccion = titulo(s); continue
        m = cap.match(s)
        if m and (not cfg.get('poesia') or len(s) < 70):
            cerrar()
            t = titulo(s)
            # un título de varias líneas en mayúsculas
            while i < len(L) and L[i].strip() and es_mayus(L[i].strip()) and not cap.match(L[i].strip()) and not (sec and sec.match(L[i].strip())) and len(L[i].strip()) < 90:
                t += ' ' + titulo(L[i].strip()); i += 1
            if cfg.get('nombre_cap'): t = re.sub(r'^Capítulo', cfg['nombre_cap'], t)
            actual = {'t': t, 'p': []}
            if seccion: actual['s'] = seccion
            caps.append(actual); continue
        if actual is None: actual = {'t': titulo(s) if es_mayus(s) else cfg['t'], 'p': []}; caps.append(actual); continue
        if subre and subre.match(s) or (es_mayus(s) and len(s) < 90 and not cfg.get('poesia')):
            cerrar(); t = s
            while i < len(L) and L[i].strip() and es_mayus(L[i].strip()) and len(L[i].strip()) < 90: t += ' ' + L[i].strip(); i += 1
            actual['p'].append('## ' + titulo(t)); continue
        if re.match(r'^(\d+\.|\[\d+\])\s', s) and parr: cerrar()
        parr.append(s)
    cerrar()
    # el resumen del capítulo (Teresa y San Juan): el primer párrafo, antes del «1.»
    if cfg.get('resumen'):
        for c in caps:
            if len(c['p']) > 1 and not re.match(r'^\d+\.', c['p'][0]) and re.match(r'^1\.', c['p'][1]) and not c['p'][0].startswith('## '): c['p'][0] = '> ' + c['p'][0]
    for c in caps: c['t'] = cfg.get('renombrar', {}).get(c['t'], c['t'])
    return [c for c in caps if c['p']]

lista = []
os.makedirs(OUT + '/libros', exist_ok=True)
for cfg in LIBROS:
    pdf = os.path.join(DIR, cfg['pdf'] + '.pdf')
    txt = subprocess.run(['pdftotext', '-layout', pdf, '-'], capture_output=True, text=True).stdout
    L = [nfc(x) for x in txt.split('\n')]
    caps = parsear(L, cfg)
    palabras = sum(len(p.split()) for c in caps for p in c['p'])
    json.dump({'caps': caps}, open(f"{OUT}/libros/{cfg['id']}.json", 'w'), ensure_ascii=False, separators=(',', ':'))
    lista.append({'id': cfg['id'], 't': cfg['t'], 'a': cfg['autor'], 'y': cfg['anio'], 'sub': cfg['sub'], 'n': len(caps), 'w': palabras, 'url': MB + ('germania/' if 'brunforte' in cfg['pdf'] else 'renacimiento/') + cfg['pdf'] + '.pdf'})
    print(cfg['id'].ljust(14), len(caps), 'capítulos', palabras, 'palabras ·', ' | '.join(c['t'][:22] for c in caps[:4]))
with open(OUT + '/data/libros.js', 'w') as f:
    f.write('// La biblioteca de Daily: clásicos católicos de dominio público (herramientas/libros_mb.py). Lo generó el script: no editar a mano.\n')
    f.write('// id = libros/<id>.json; t título; a autor; y año; sub de qué trata; n capítulos; w palabras; url la fuente (mercaba.es).\n')
    f.write('export const LIBROS=' + json.dumps(lista, ensure_ascii=False, separators=(',', ':')).replace('},{', '},\n{') + ';\n')
