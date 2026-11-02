# Scaeli Daily · el calendario litúrgico de la Argentina (grado y color de cada celebración), para la «Guía del celebrante».
# Fuente: GCatholic.org (calendario de la Argentina). Uso: python3 ordo_gc.py <carpeta con ar2026.html, ar2027.html…>
# Deja data/ordo/AAAA.json = {"MM-DD":{"s":"I","c":[[grado, color, nombre], …]}}  (grado: S, F, M, m o "" para ferias y domingos)
import re, sys, json, html, os, glob
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'ordo')
os.makedirs(OUT, exist_ok=True)
GR = {'Solemnidad': 'S', 'Fiesta': 'F', 'Memoria obligatoria': 'M', 'Memoria facultativa': 'm', 'Conmemoración': 'c'}
for f in sorted(glob.glob(os.path.join(sys.argv[1], 'ar[0-9][0-9][0-9][0-9].html'))):
    y = re.search(r'(\d{4})', os.path.basename(f)).group(1)
    h = open(f, encoding='utf-8', errors='replace').read()
    dias, cur = {}, None
    for tr in re.finditer(r'<tr([^>]*)>(.*?)</tr>', h, re.S):
        attrs, cuerpo = tr.group(1), tr.group(2)
        m = re.search(r'id="(\d{4})"', attrs)
        if m: cur = m.group(1)[:2] + '-' + m.group(1)[2:]; dias.setdefault(cur, {'c': []})
        if not cur: continue
        sm = re.search(r'<td align="center" class="zdate"[^>]*>([IV]+)</td>', cuerpo)
        if sm: dias[cur]['s'] = sm.group(1)
        p = re.search(r'<p class="indent">(.*?)</p>', cuerpo, re.S)
        if not p: continue
        col = re.search(r'<span class="feast([a-z])"></span>', p.group(1))
        g = re.search(r'title="(Solemnidad|Fiesta|Memoria obligatoria|Memoria facultativa|Conmemoración)"', cuerpo)
        nom = html.unescape(re.sub(r'<[^>]+>', '', p.group(1))).replace('\xa0', ' ')
        nom = re.sub(r'\s+', ' ', nom).strip()
        if nom: dias[cur]['c'].append([GR.get(g.group(1), '') if g else '', col.group(1) if col else '', nom])
    # el salterio se marca en el primer día de cada semana: se completa hacia adelante
    s = None
    for k in sorted(dias):
        if 's' in dias[k]: s = dias[k]['s']
        elif s: dias[k]['s'] = s
    json.dump(dias, open(f'{OUT}/{y}.json', 'w'), ensure_ascii=False, separators=(',', ':'))
    print(y, len(dias), 'días')
