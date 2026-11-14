# Scaeli Daily · arma la Biblia de la app (biblia/*.json) desde el módulo SWORD «SpaPlatense»
# (Biblia Platense, Mons. Juan Straubinger, La Plata 1948; CrossWire la distribuye como dominio público).
# Uso: bajar https://www.crosswire.org/ftpmirror/pub/sword/packages/rawzip/SpaPlatense.zip, descomprimir en una carpeta
#      y correr: python3 biblia.py <carpeta> <vulg.json>   (vulg.json: versificación Vulgata, libro → versos por capítulo)
# Se guarda solo el texto bíblico y los títulos de sección; las notas del traductor no se incluyen.
import struct, zlib, json, re, sys, os
CARP, VULG = sys.argv[1], sys.argv[2]
SALIDA = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'biblia')
LIBROS = [  # id OSIS, nombre, abreviatura, grupo — orden de las Biblias católicas en castellano
 ('Gen','Génesis','Gn','Pentateuco'),('Exod','Éxodo','Ex','Pentateuco'),('Lev','Levítico','Lv','Pentateuco'),('Num','Números','Nm','Pentateuco'),('Deut','Deuteronomio','Dt','Pentateuco'),
 ('Josh','Josué','Jos','Históricos'),('Judg','Jueces','Jue','Históricos'),('Ruth','Rut','Rt','Históricos'),('1Sam','1 Samuel','1 Sam','Históricos'),('2Sam','2 Samuel','2 Sam','Históricos'),
 ('1Kgs','1 Reyes','1 Re','Históricos'),('2Kgs','2 Reyes','2 Re','Históricos'),('1Chr','1 Crónicas','1 Cr','Históricos'),('2Chr','2 Crónicas','2 Cr','Históricos'),('Ezra','Esdras','Esd','Históricos'),
 ('Neh','Nehemías','Neh','Históricos'),('Tob','Tobías','Tob','Históricos'),('Jdt','Judit','Jdt','Históricos'),('Esth','Ester','Est','Históricos'),('1Macc','1 Macabeos','1 Mac','Históricos'),('2Macc','2 Macabeos','2 Mac','Históricos'),
 ('Job','Job','Job','Sapienciales'),('Ps','Salmos','Sal','Sapienciales'),('Prov','Proverbios','Prov','Sapienciales'),('Eccl','Eclesiastés','Ecl','Sapienciales'),('Song','Cantar de los Cantares','Cant','Sapienciales'),
 ('Wis','Sabiduría','Sab','Sapienciales'),('Sir','Eclesiástico','Eclo','Sapienciales'),
 ('Isa','Isaías','Is','Proféticos'),('Jer','Jeremías','Jer','Proféticos'),('Lam','Lamentaciones','Lam','Proféticos'),('Bar','Baruc','Bar','Proféticos'),('Ezek','Ezequiel','Ez','Proféticos'),('Dan','Daniel','Dn','Proféticos'),
 ('Hos','Oseas','Os','Proféticos'),('Joel','Joel','Jl','Proféticos'),('Amos','Amós','Am','Proféticos'),('Obad','Abdías','Abd','Proféticos'),('Jonah','Jonás','Jon','Proféticos'),('Mic','Miqueas','Miq','Proféticos'),
 ('Nah','Nahún','Nah','Proféticos'),('Hab','Habacuc','Hab','Proféticos'),('Zeph','Sofonías','Sof','Proféticos'),('Hag','Ageo','Ag','Proféticos'),('Zech','Zacarías','Zac','Proféticos'),('Mal','Malaquías','Mal','Proféticos'),
 ('Matt','Mateo','Mt','Evangelios'),('Mark','Marcos','Mc','Evangelios'),('Luke','Lucas','Lc','Evangelios'),('John','Juan','Jn','Evangelios'),
 ('Acts','Hechos de los Apóstoles','Hch','Hechos'),
 ('Rom','Romanos','Rom','Cartas'),('1Cor','1 Corintios','1 Cor','Cartas'),('2Cor','2 Corintios','2 Cor','Cartas'),('Gal','Gálatas','Gál','Cartas'),('Eph','Efesios','Ef','Cartas'),('Phil','Filipenses','Flp','Cartas'),
 ('Col','Colosenses','Col','Cartas'),('1Thess','1 Tesalonicenses','1 Tes','Cartas'),('2Thess','2 Tesalonicenses','2 Tes','Cartas'),('1Tim','1 Timoteo','1 Tim','Cartas'),('2Tim','2 Timoteo','2 Tim','Cartas'),
 ('Titus','Tito','Tit','Cartas'),('Phlm','Filemón','Flm','Cartas'),('Heb','Hebreos','Heb','Cartas'),('Jas','Santiago','Sant','Cartas'),('1Pet','1 Pedro','1 Pe','Cartas'),('2Pet','2 Pedro','2 Pe','Cartas'),
 ('1John','1 Juan','1 Jn','Cartas'),('2John','2 Juan','2 Jn','Cartas'),('3John','3 Juan','3 Jn','Cartas'),('Jude','Judas','Jds','Cartas'),('Rev','Apocalipsis','Ap','Apocalipsis')]
V = json.load(open(VULG)); D = os.path.join(CARP, 'modules/texts/ztext/spaplatense/')
def testamento(t):
    bzs = open(D+t+'.bzs','rb').read(); bzv = open(D+t+'.bzv','rb').read(); bzz = open(D+t+'.bzz','rb').read()
    bl = [struct.unpack('<III', bzs[i:i+12]) for i in range(0, len(bzs), 12)]; cache = {}
    def verso(i):
        b, o, s = struct.unpack('<IIH', bzv[i*10:i*10+10])
        if not s: return ''
        if b not in cache: oo, ss, _ = bl[b]; cache[b] = zlib.decompress(bzz[oo:oo+ss])
        return cache[b][o:o+s].decode('utf-8', 'replace')
    return verso
crudo = {}
for t in ('ot', 'nt'):
    verso = testamento(t); i = 2
    for _, osis, caps in V[t]:
        i += 1; crudo[osis] = []
        for nv in caps:
            i += 1; crudo[osis].append([verso(i+k) for k in range(nv)]); i += nv
def limpiar(x):
    tit = [re.sub(r'<[^>]+>', '', m).strip() for m in re.findall(r'<title type="x-s">(.*?)</title>', x, re.S)]
    x = re.sub(r'<note\b.*?</note>', '', x, flags=re.S)
    x = re.sub(r'<title\b.*?</title>', '', x, flags=re.S)
    x = re.sub(r'<l\b[^>]*eID[^>]*/>', '\n', x)
    x = re.sub(r'<[^>]+>', '', x)
    x = re.sub(r'[ \t ]+', ' ', x); x = re.sub(r' *\n *', '\n', x); x = re.sub(r'\n{2,}', '\n', x).strip()
    return x, [t for t in tit if t]
os.makedirs(SALIDA, exist_ok=True); indice = []; vacios = 0
for osis, nom, ab, grupo in LIBROS:
    caps = []; titulos = {}
    for c, ch in enumerate(crudo[osis], 1):
        vs = []
        for v, txt in enumerate(ch, 1):
            t, tt = limpiar(txt)
            if tt: titulos[f'{c}:{v}'] = tt[-1]
            vs.append(t)
        while vs and not vs[-1]: vs.pop()          # versos que esta edición no tiene al final del capítulo
        vacios += sum(1 for x in vs if not x)
        caps.append(vs)
    while caps and not caps[-1]: caps.pop()
    json.dump({'id': osis, 'n': nom, 'a': ab, 'c': caps, 't': titulos}, open(os.path.join(SALIDA, osis + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    indice.append({'id': osis, 'n': nom, 'a': ab, 'g': grupo, 'k': len(caps)})
json.dump(indice, open(os.path.join(SALIDA, 'indice.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('libros', len(indice), 'versos vacíos', vacios)
