#!/usr/bin/env python3
# 2.8 · Biblia de Torres Amat (Félix Torres Amat, 1823-1825, traducida de la Vulgata; dominio público) para la app.
# Fuente digital: github.com/danloi2/itercatholicum → src/shared/data/bibles/1823_torres_amat_es (un JSON por libro, «licentia: Dominio Público»).
# Arma biblia-ta/ con el mismo formato que biblia/ (la Platense) y biblia-ta/mapa.json: en los capítulos donde las dos Biblias
# cortan distinto los versículos, a qué versículos de Torres Amat corresponde cada versículo de la Platense (alineado por el contenido).
# Las citas de las lecturas se resuelven con la numeración de la Platense (herramientas/platense.mjs) y de ahí se pasa a Torres Amat.
# 2.8.1: a esa copia le faltan Ester 11-16 y Daniel 13-14 (partes que solo traen las Biblias católicas). Se completan con el mismo texto
# de su fuente, credobiblestudy.com («Sagrada Biblia · Félix Amat», /es/read/sagrada-biblia-felix-amat-ot/esther|daniel/chapter-N),
# guardado en herramientas/textos/torres_amat_extra.json.
# Uso: python3 herramientas/torres_amat.py <carpeta 1823_torres_amat_es>
import json, os, re, sys, unicodedata
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); SRC=sys.argv[1]; OUT=os.path.join(R,'biblia-ta'); PL=os.path.join(R,'biblia')
IDS="Gen Exod Lev Num Deut Josh Judg Ruth 1Sam 2Sam 1Kgs 2Kgs 1Chr 2Chr Ezra Neh Tob Jdt Esth 1Macc 2Macc Job Ps Prov Eccl Song Wis Sir Isa Jer Lam Bar Ezek Dan Hos Joel Amos Obad Jonah Mic Nah Hab Zeph Hag Zech Mal Matt Mark Luke John Acts Rom 1Cor 2Cor Gal Eph Phil Col 1Thess 2Thess 1Tim 2Tim Titus Phlm Heb Jas 1Pet 2Pet 1John 2John 3John Jude Rev".split()
def limpio(t):
    t=t.replace('*','').replace(' ',' '); t=re.sub(r'\s+',' ',t); t=re.sub(r' ([,.;:!?»”)])',r'\1',t); t=re.sub(r'([¡¿«“(]) ',r'\1',t)
    t=re.sub(r'\bá\b','a',t); t=re.sub(r'\bó\b','o',t); t=re.sub(r'\bé\b','e',t)   # ortografía vieja en los capítulos agregados
    return t.strip()
def pal(t):
    t=unicodedata.normalize('NFD',t.lower()); t=''.join(c for c in t if unicodedata.category(c)!='Mn')
    return set(w[:5] for w in re.findall(r'[a-zñ]+',t) if len(w)>3)
def sim(a,b): return len(a&b)/((len(a)*len(b))**.5+1e-9) if a and b else 0
def alinear(P,T):
    """P y T: listas de (cap, vers, palabras). Devuelve por cada índice de P la lista de índices de T (monótono; 1:1, 1:2, 2:1, y saltos)."""
    n,m=len(P),len(T); NEG=-1e9; D=[[NEG]*(m+1) for _ in range(n+1)]; B=[[None]*(m+1) for _ in range(n+1)]; D[0][0]=0
    for i in range(n+1):
        for j in range(max(0,i-6),min(m,i+6)+1):
            if D[i][j]==NEG: continue
            d=D[i][j]
            def paso(di,dj,g):
                if i+di<=n and j+dj<=m and d+g>D[i+di][j+dj]: D[i+di][j+dj]=d+g; B[i+di][j+dj]=(di,dj)
            if i<n and j<m: paso(1,1,sim(P[i][2],T[j][2]))
            if i<n and j+1<m: paso(1,2,sim(P[i][2],T[j][2]|T[j+1][2])-.02)
            if i+1<n and j<m: paso(2,1,sim(P[i][2]|P[i+1][2],T[j][2])-.02)
            if i<n: paso(1,0,-.3)
            if j<m: paso(0,1,-.3)
    out=[[] for _ in range(n)]; i,j=n,m
    assert D[n][m]>NEG
    while i or j:
        di,dj=B[i][j]
        for a in range(i-di,i): out[a]=list(range(j-dj,j))
        i-=di; j-=dj
    return out
def main():
    fs=sorted(f for f in os.listdir(SRC) if f.endswith('.json')); assert len(fs)==73
    idx=json.load(open(os.path.join(PL,'indice.json'))); pi={x['id']:x for x in idx}; nidx=[]; mapa={}; tot=0
    libros={}; EXTRA=json.load(open(os.path.join(R,'herramientas','textos','torres_amat_extra.json')))
    for f,i in zip(fs,IDS):
        t=json.load(open(os.path.join(SRC,f))); assert t['licentia']=='Dominio Público'
        caps=[]
        for c in t['capitula']:
            ks=[int(k) for k in c['versus'].keys()]; assert ks==list(range(ks[0],ks[0]+len(ks))),(i,c['numerus'])   # Sal 115 y 147 siguen la cuenta (10-19, 12-20): acá van desde 1, como en la Platense
            caps.append([limpio(v) for v in c['versus'].values()])
        for c in sorted(EXTRA.get(i,{}),key=int):
            assert int(c)==len(caps)+1,(i,c); caps.append([limpio(v) for v in EXTRA[i][c]])
        p=json.load(open(os.path.join(PL,i+'.json'))); libros[i]=caps
        json.dump({'id':i,'n':p['n'],'a':p['a'],'c':caps,'t':'Torres Amat'},open(os.path.join(OUT,i+'.json'),'w'),ensure_ascii=False,separators=(',',':'))
        e=dict(pi[i]); e['k']=len(caps); nidx.append(e); tot+=sum(len(c) for c in caps)
        # los tramos de capítulos seguidos donde las dos cortan distinto
        pc=p['c']; N=min(len(pc),len(caps)); dif=[k for k in range(N) if len(pc[k])!=len(caps[k])]; k=0; M={}
        while k<len(dif):
            a=b=dif[k]
            while k+1<len(dif) and dif[k+1]==b+1: k+=1; b=dif[k]
            k+=1
            P=[(c+1,v+1,pal(x)) for c in range(a,b+1) for v,x in enumerate(pc[c])]; T=[(c+1,v+1,pal(x)) for c in range(a,b+1) for v,x in enumerate(caps[c])]
            al=alinear(P,T)
            for (c,v,_),js in zip(P,al):
                dest=[[T[j][0],T[j][1]] for j in js]
                if dest!=[[c,v]]: M[f'{c},{v}']=dest
        if M: mapa[i]=M
    json.dump(nidx,open(os.path.join(OUT,'indice.json'),'w'),ensure_ascii=False,separators=(',',':'))
    json.dump(mapa,open(os.path.join(OUT,'mapa.json'),'w'),ensure_ascii=False,separators=(',',':'))
    print('libros',len(nidx),'versículos',tot,'· libros con mapa',len(mapa),'· entradas',sum(len(m) for m in mapa.values()))
    print('faltan capítulos:',[(x['id'],x['k'],pi[x['id']]['k']) for x in nidx if x['k']!=pi[x['id']]['k']])
if __name__=='__main__': main()
