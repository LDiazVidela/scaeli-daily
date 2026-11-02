# Arma los personajes de Daily a partir de los PNG de PixelLab:
#  - clasifica cada píxel en una región (piel, pelo, arriba, abajo, calzado, resto) para poder cambiarle el color en la app;
#  - combina cada prenda con cada peinado (la cabeza sale del peinado, el cuerpo de la prenda);
#  - marca las anclas (ojos, cuello, cintura, rodillas) para la altura y los detalles (anteojos, cruz, barba, gorra).
# Salida: assets/personaje/{m,f}.png (sprites), {m,f}_reg.png (regiones en el canal rojo) y pj.json (anclas).
# Uso: python3 pj_armar.py [vista.png]
import sys, json, colorsys
import numpy as np
from PIL import Image
from pj_cargar import cargar, VISTAS

OUT='/home/claude/scaeli/scaeli-daily/assets/personaje/'
NADA, RESTO, PIEL, PELO, ARRIBA, ABAJO, CALZ, BARBA = 0,1,2,3,4,5,6,7
COLORES=['gris','blanco','negro','azul','bordo']
def _prendas(pre,lista):
    out=[('base',pre)]
    for pr in lista:
        for c in COLORES: out.append((pr+':'+c, f'{pre}_{pr}' if c=='gris' else f'{pre}_{pr}_{c}'))
    return out
SEXOS={
 'm':{'base':'yo','prendas':_prendas('yo',['remera','buzo','camisa'])+[('sotana','yo_sotana'),('clergyman','yo_sacerdote')],
      'peinados':[('base','yo'),('corto','yo_pelo_corto'),('largo','yo_pelo_largo')],'largos':['largo'],
      'pantalon':{'remera:blanco':'yo_remera','remera:negro':'yo_remera','camisa:blanco':'yo_camisa','camisa:negro':'yo_camisa'}},
 'f':{'base':'yo_f','prendas':_prendas('yo_f',['remera','buzo','pollera'])+[('consagrada','yo_f_consagrada'),('caridad','yo_f_monja_caridad'),('dominica','yo_f_monja_dominica'),('carmelita','yo_f_monja_carmelita')],
      'velo':['consagrada','caridad','dominica','carmelita'],
      'peinados':[('base','yo_f'),('suelto','yo_f_pelo_suelto'),('corto','yo_f_pelo_corto')],'largos':['base','suelto','corto'],
      'pantalon':{'remera:blanco':'yo_f_remera','remera:negro':'yo_f_remera'}},
}
CEJA=BARBA
# accesorios (solo él): salen de comparar el seminarista con y sin barba/anteojos/cruz
ACC_DE=('yo_seminarista','yo_seminarista_barba')

def menton(L,yh):
    """Fila del mentón: la última fila de la cara (piel sobre los hombros) que todavía es ancha; abajo empieza el cuello."""
    piel=(L==PIEL); piel[yh:]=False
    filas=[y for y in range(yh) if piel[y].sum()>2]
    if not filas: return yh-4
    w=piel.sum(1); mx=max(w[y] for y in filas)
    # la banda ancha de la cara y, debajo, la fila más angosta antes de los hombros (el mentón, donde empieza el cuello)
    fb=[y for y in filas if w[y]>=mx*0.6][0]
    while fb+1<yh and w[fb+1]>=mx*0.6: fb+=1
    zona=list(range(fb+1,yh-1))
    if not zona: return fb
    return min(zona,key=lambda y:(w[y],y))

def hsv(c):
    r,g,b=[x/255 for x in c[:3]]; return colorsys.rgb_to_hsv(r,g,b)

def cabeza_y(a):
    """Fila del mentón: la primera fila (desde arriba, pasada la cabeza) donde la silueta se ensancha (hombros)."""
    al=a[:,:,3]>0; w=al.sum(1); ys=np.where(w>0)[0]; y0=ys[0]
    ancho_cab=w[y0+6:y0+20].max()
    for y in range(y0+14,y0+50):
        if w[y]>ancho_cab*1.35: return y
    return y0+28

def clasificar(img, vista='south'):
    a=np.array(img).astype(int); H,W=a.shape[:2]; L=np.zeros((H,W),np.uint8)
    al=a[:,:,3]>0
    ys=np.where(al.any(1))[0]; y0,y1=ys[0],ys[-1]; alto=y1-y0
    yh=cabeza_y(a)                      # hombros
    ypie=y1-int(alto*0.07)              # calzado
    # la piel: muestras de la cara (centro, un poco arriba del mentón) y de las manos
    for y in range(H):
        for x in range(W):
            if not al[y,x]: continue
            r,g,b=a[y,x,:3]; h,s,v=hsv((r,g,b)); hd=h*360
            if v<0.16: L[y,x]=RESTO; continue          # contorno muy oscuro
            es_piel = (5<=hd<=38) and 0.22<=s<=0.62 and v>=0.42 and r>g>b
            if y>=yh: es_piel = (5<=hd<=30) and 0.33<=s<=0.75 and v>=0.38 and r>g>b   # bajo los hombros la piel es más saturada que las sombras crema de la ropa clara
            es_marron = (5<=hd<=45) and s>=0.25 and v<0.62 and r>=g>=b
            es_azul = 200<=hd<=250 and s>=0.25 and v<0.75
            es_gris = s<0.16 or (hd>=180 and s<0.22)
            es_crema = (25<=hd<=60) and s<0.3 and v>0.62
            if y<yh:
                if es_piel and not (es_marron and v<0.5): L[y,x]=PIEL
                elif es_marron or (v<0.38 and (5<=hd<=45)): L[y,x]=PELO
                else: L[y,x]=RESTO
            elif y>=ypie:
                L[y,x]=CALZ if not es_piel else PIEL
            else:
                if es_piel: L[y,x]=PIEL
                elif es_azul: L[y,x]=ABAJO
                elif es_gris or es_crema: L[y,x]=ARRIBA
                elif es_marron: L[y,x]=PELO   # pelo largo / colita; el cinto se corrige abajo
                else: L[y,x]=RESTO
    # en la cabeza, la piel es la mancha grande (cara, orejas, cuello); las manchitas sueltas color piel son brillos del pelo
    from collections import deque
    pc=(L==PIEL); pc[yh:]=False; vis=np.zeros_like(pc); comps=[]
    for sy,sx in zip(*np.where(pc)):
        if vis[sy,sx]: continue
        q=deque([(sy,sx)]); vis[sy,sx]=True; c=[]
        while q:
            y,x=q.popleft(); c.append((y,x))
            for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
                ny,nx=y+dy,x+dx
                if 0<=ny<yh and 0<=nx<W and pc[ny,nx] and not vis[ny,nx]: vis[ny,nx]=True; q.append((ny,nx))
        comps.append(c)
    if comps:
        grande=max(len(c) for c in comps)
        for c in comps:
            if len(c)<max(10,grande*0.12):
                for y,x in c: L[y,x]=PELO
    if vista=='north':
        for y in range(max(0,yh-10)):
            L[y][L[y]==PIEL]=PELO
    # la cabeza: lo que no es piel, es pelo; salvo los rasgos de la cara (ojos, boca) de la mitad de abajo de la cara
    piel=(L==PIEL); piel[yh:]=False
    filas=[y for y in range(yh) if piel[y].sum()>2]
    if filas:
        anchos={y:piel[y].sum() for y in filas}; mx=max(anchos.values())
        fy0=filas[0]; ment=max([y for y in filas if anchos[y]>=mx*0.6] or [filas[-1]])
        yr=fy0+int((ment-fy0)*0.3)
    for y in range(yh):
        xs=np.where(piel[max(0,y-2):y+3].any(0))[0]
        for x in range(W):
            if not al[y,x] or L[y,x]==PIEL: continue
            adentro = vista!='north' and filas and len(xs)>2 and xs[0]-1<=x<=xs[-1]+1 and yr<=y
            r,g,b=a[y,x,:3]; h,s_,v=hsv((r,g,b)); hd=h*360
            ropa = (s_<0.16 and v>0.3) or ((25<=hd<=60) and s_<0.3 and v>0.62) or (200<=hd<=250 and s_>=0.25)
            borde=not al[max(0,y-1):y+2,max(0,x-1):x+2].all()
            if v<0.12 and not borde and not adentro and not (filas and y>ment): L[y,x]=PELO   # sombras casi negras dentro del pelo
            elif ropa: L[y,x]=ARRIBA if (filas and y>ment) else RESTO
            else: L[y,x]=RESTO if adentro else PELO
    if filas:
        for _ in range(3):
            piel=(L==PIEL)
            n=np.zeros_like(piel); n[1:]|=piel[:-1]; n[:-1]|=piel[1:]; n[:,1:]|=piel[:,:-1]; n[:,:-1]|=piel[:,1:]
            for y,x in zip(*np.where(n&(L==PELO))):
                if y<yr+2 or y>=yh: continue
                h_,s_,v_=hsv(a[y,x]); hd=h_*360
                if (0<=hd<=40) and s_>=0.3 and v_>=0.33 and a[y,x,0]>a[y,x,1]>=a[y,x,2]: L[y,x]=PIEL
    # bajo los hombros, es pelo solo lo que tiene un color del pelo de la cabeza
    pal=np.unique(a[:yh][L[:yh]==PELO][:,:3],axis=0) if (L[:yh]==PELO).any() else np.zeros((0,3),int)
    for y in range(yh,H):
        for x in range(W):
            if L[y,x]==PELO:
                h_,s_,v_=hsv(a[y,x]); marron=(5<=h_*360<=45) and s_>=0.38 and a[y,x,0]>=a[y,x,1]>=a[y,x,2]
                if (len(pal)==0 or np.abs(pal-a[y,x,:3]).sum(1).min()>14) and not marron:
                    L[y,x]=ARRIBA if hsv(a[y,x])[2]>=0.45 else RESTO
    return L,yh

def refinar(img,L,yh):
    """Corrige lo que el color solo no decide: lo marrón conectado a la cabeza es pelo; lo demás bajo los hombros
    (cinto, botones) queda como resto. Lo gris de la mitad de abajo es 'abajo' (pantalón o pollera)."""
    a=np.array(img).astype(int); H,W=L.shape
    # pelo: crecer desde la cabeza a través de píxeles marrones/oscuros
    pelo=np.zeros_like(L,bool); pelo[:yh][L[:yh]==PELO]=True
    cand=(L==PELO)|(L==RESTO)
    cambio=True
    while cambio:
        cambio=False
        n=np.zeros_like(pelo)
        n[1:]|=pelo[:-1]; n[:-1]|=pelo[1:]; n[:,1:]|=pelo[:,:-1]; n[:,:-1]|=pelo[:,1:]
        nuevo=n&cand&~pelo&(L==PELO)
        if nuevo.any(): pelo|=nuevo; cambio=True
    L[(L==PELO)&~pelo]=RESTO
    # (el cinto queda como 'resto': el pelo conectado a la cabeza es lo único marrón que se recolorea como pelo)
    # contorno del pelo: oscuro pegado al pelo
    n=np.zeros_like(pelo); n[1:]|=pelo[:-1]; n[:-1]|=pelo[1:]; n[:,1:]|=pelo[:,:-1]; n[:,:-1]|=pelo[:,1:]
    # gris en la mitad de abajo del cuerpo (pantalón de vestir, pollera): 'abajo'
    al=a[:,:,3]>0; ys=np.where(al.any(1))[0]; y0,y1=ys[0],ys[-1]
    # cintura: la fila con más píxeles 'resto' marrones (el cinto) entre hombros y la mitad, o la primera fila con 'abajo'
    w=al.sum(1)
    filas_abajo=[y for y in range(yh+10,H) if w[y] and (L[y]==ABAJO).sum()>=w[y]*0.5]
    yc = filas_abajo[0] if filas_abajo else int(y0+(y1-y0)*0.47)
    from collections import deque
    cand=np.zeros_like(L,bool); cand[yc+3:]=(L[yc+3:]==ARRIBA)|(L[yc+3:]==ABAJO)
    vis=np.zeros_like(cand); mejor=[]
    for sy,sx in zip(*np.where(cand)):
        if vis[sy,sx]: continue
        q=deque([(sy,sx)]); vis[sy,sx]=True; c=[]
        while q:
            y,x=q.popleft(); c.append((y,x))
            for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
                ny,nx=y+dy,x+dx
                if 0<=ny<H and 0<=nx<W and cand[ny,nx] and not vis[ny,nx]: vis[ny,nx]=True; q.append((ny,nx))
        mejor.append(c)
    if mejor:
        g=max(len(c) for c in mejor)
        for c in mejor:
            if len(c)>=g*0.3:
                for y,x in c:
                    if L[y,x]==ARRIBA: L[y,x]=ABAJO
    return L,yc

def anclas(img,L,yh,yc):
    a=np.array(img).astype(int); al=a[:,:,3]>0
    ys=np.where(al.any(1))[0]; y0,y1=ys[0],ys[-1]
    cara=(L==PIEL); cara[yh:]=False
    cy,cx=np.where(cara)
    if len(cx)==0: return {'top':int(y0),'hombro':int(yh),'cintura':int(yc),'pie':int(y1),'cara':None}
    fx0,fx1,fy0,fy1=int(cx.min()),int(cx.max()),int(cy.min()),int(cy.max())
    # ojos: en la cara, los píxeles oscuros (no piel) rodeados de piel, en la mitad de arriba de la cara
    ojos=[]
    for y in range(fy0,fy0+int((fy1-fy0)*0.7)):
        for x in range(fx0,fx1+1):
            if al[y,x] and L[y,x] in (RESTO,) :
                if cara[y,x-1:x+2].any() or cara[y-1:y+2,x].any():
                    v=hsv(a[y,x])[2]
                    if v<0.45: ojos.append((x,y))
    ey = int(np.median([p[1] for p in ojos])) if ojos else fy0+int((fy1-fy0)*0.45)
    ex = sorted(set(p[0] for p in ojos if abs(p[1]-ey)<=1))
    rodilla=int(yc+(y1-yc)*0.5)
    return {'top':int(y0),'hombro':int(yh),'cintura':int(yc),'rodilla':int(rodilla),'pie':int(y1),
            'cara':[fx0,fy0,fx1,fy1],'ojo_y':ey,'ojo_x':ex}

def preparar(k):
    out={}
    for v,img in cargar(k).items():
        L,yh=clasificar(img,v); L,yc=refinar(img,L,yh); out[v]=(np.array(img),L,yh,yc)
    return out

def combinar(P,Hd,largo=True,chin=None):
    """P: prenda (img,L,yh,yc) · Hd: peinado. La cabeza (sobre el corte) sale del peinado; el pelo del peinado que baja
    se pinta encima; el pelo propio de la prenda bajo el corte se borra (se rellena con la ropa vecina, dentro de la silueta)."""
    pi,pl,pyh,pyc=P; hi,hl,hyh,hyc=Hd
    a=pi.copy(); l=pl.copy(); H,W=l.shape
    corte=min(pyh,hyh)-1
    a[:corte]=hi[:corte]; l[:corte]=hl[:corte]
    # borrar el pelo de la prenda bajo el corte (y su contorno oscuro pegado)
    borrar=(pl==PELO)
    n=np.zeros_like(borrar); n[1:]|=borrar[:-1]; n[:-1]|=borrar[1:]; n[:,1:]|=borrar[:,:-1]; n[:,:-1]|=borrar[:,1:]
    oscuro=np.array([[hsv(pi[y,x])[2]<0.3 for x in range(W)] for y in range(H)])
    # lo oscuro de la prenda que el peinado no tiene en el mismo lugar (la colita, que PixelLab sombrea casi negra)
    corte0=corte
    calido=(pi[:,:,0].astype(int)>pi[:,:,2].astype(int)+6)     # la colita es marrón; la ropa negra o azul, no
    dif=(pl==RESTO)&oscuro&calido&((hl==ARRIBA)|(hl==PIEL)|(hl==NADA)|(hl==ABAJO)); dif[:corte0]=False; dif[pyc-2:]=False
    # solo lo que está pegado al pelo (la colita), no los pliegues de la ropa
    sem=(pl==PELO).copy()
    for _ in range(60):
        nn=np.zeros_like(sem); nn[1:]|=sem[:-1]; nn[:-1]|=sem[1:]; nn[:,1:]|=sem[:,:-1]; nn[:,:-1]|=sem[:,1:]
        nuevo=nn&dif&~sem
        if not nuevo.any(): break
        sem|=nuevo
    borrar|=sem&dif
    n=np.zeros_like(borrar); n[1:]|=borrar[:-1]; n[:-1]|=borrar[1:]; n[:,1:]|=borrar[:,:-1]; n[:,:-1]|=borrar[:,1:]
    caja=np.zeros_like(borrar); bp=borrar.copy(); bp[:corte]=False
    if bp.any():
        yy,xx=np.where(bp); caja[max(0,yy.min()-3):yy.max()+4, max(0,xx.min()-3):xx.max()+4]=True
    for _ in range(40):
        nuevo=n&(pl==RESTO)&oscuro&calido&caja&~borrar
        if not nuevo.any(): break
        borrar|=nuevo
        n=np.zeros_like(borrar); n[1:]|=borrar[:-1]; n[:-1]|=borrar[1:]; n[:,1:]|=borrar[:,:-1]; n[:,:-1]|=borrar[:,1:]
    for y in range(corte,H):
        for x in range(W):
            if borrar[y,x]:
                def vecino(dx):
                    xx=x+dx
                    while 0<=xx<W and abs(xx-x)<=14:
                        if pi[y,xx,3]==0: return None
                        if not borrar[y,xx] and pl[y,xx]!=NADA and hsv(pi[y,xx])[2]>=0.3: return xx
                        xx+=dx
                    return None
                izq,der=vecino(-1),vecino(1)
                if izq is None or der is None: a[y,x]=0; l[y,x]=NADA; continue   # la colita que salía de la silueta: se va
                best=izq if x-izq<=der-x else der
                a[y,x]=pi[y,best]; l[y,x]=pl[y,best]
    # lo rellenado donde estaba la colita, si queda fuera del cuerpo (el dibujo del peinado, sin colita, no tiene nada ahí): se va
    alh=hi[:,:,3]>0; dil=alh.copy()
    for _ in range(2):
        d2=dil.copy(); d2[1:]|=dil[:-1]; d2[:-1]|=dil[1:]; d2[:,1:]|=dil[:,:-1]; d2[:,:-1]|=dil[:,1:]; dil=d2
    fuera=borrar&~dil; fuera[:corte]=False
    a[fuera]=0; l[fuera]=NADA
    # la sombra que dejaba la colita sobre la ropa: los píxeles de ropa oscuros cerca de lo borrado toman el color común de la fila
    bb=borrar.copy(); bb[:corte]=False
    if bb.any():
        ys_,xs_=np.where(bb); X0,X1=xs_.min()-3,xs_.max()+3
        for y in range(ys_.min(),ys_.max()+4):
            if y>=H: break
            fila=[tuple(a[y,x,:3]) for x in range(W) if l[y,x] in (ARRIBA,ABAJO) and a[y,x,3]>0]
            if not fila: continue
            from collections import Counter
            comun=Counter(fila).most_common(1)[0][0]; vc=hsv(comun)[2]
            for x in range(max(0,X0),min(W,X1+1)):
                if l[y,x] in (ARRIBA,ABAJO,RESTO) and a[y,x,3]>0 and hsv(a[y,x])[2]<vc-0.12 and (l[y,x]!=RESTO or bb[max(0,y-2):y+3,max(0,x-2):x+3].any()):
                    a[y,x,:3]=comun; l[y,x]=ARRIBA if l[y,x]==RESTO else l[y,x]
    # el pelo del peinado que baja va encima
    m=(hl==PELO); m[:corte]=False
    a[m]=hi[m]; l[m]=PELO
    # dentro del pelo que baja, también sus contornos y mechones oscuros (si no, se ve la ropa entre las mechas)
    if largo:
        for y in range(corte,H):
            xs=np.where(m[y])[0]
            if len(xs)<2: continue
            for x in range(xs[0],xs[-1]+1):
                if hl[y,x]==RESTO and hi[y,x,3] and not m[y,x] and hsv(hi[y,x])[2]<0.45 and hi[y,x,0]>=hi[y,x,2]: a[y,x]=hi[y,x]; l[y,x]=PELO   # las sombras de las mechas toman el color del pelo
    # bajo el mentón, solo es pelo el pelo del peinado (la ropa oscura no se tiñe con el color de pelo)
    q=(l==PELO)&~m; q[:corte]=False; l[q]=RESTO
    # el contorno oscuro pegado al pelo que baja también
    return a,l

def mover(P,dx,dy):
    """Corre un dibujo (img,L,yh,yc) dx,dy píxeles."""
    img,L,yh,yc=P
    i2=np.zeros_like(img); l2=np.zeros_like(L); H,W=L.shape
    ys=slice(max(0,dy),H+min(0,dy)); ys0=slice(max(0,-dy),H+min(0,-dy))
    xs=slice(max(0,dx),W+min(0,dx)); xs0=slice(max(0,-dx),W+min(0,-dx))
    i2[ys,xs]=img[ys0,xs0]; l2[ys,xs]=L[ys0,xs0]
    return (i2,l2,yh+dy,yc+dy)

POR_CARA=('yo_sacerdote',)   # el clergyman tiene el cuello corto: se apoya por la cara para que el alzacuello no toque el mentón

def alinear(P,R,solo_cabeza=False):
    """Busca el corrimiento que mejor apoya P sobre R (la base): por la piel de la cara si es un peinado, por la silueta si es ropa."""
    _,L,_,_=P; _,LR,yhr,_=R
    if solo_cabeza:
        m=(L==PIEL); mr=(LR==PIEL); m[yhr+2:]=False; mr[yhr+2:]=False
    if solo_cabeza and m.sum()<40:   # de espalda no hay cara: se alinea por las piernas, que el peinado no cambia
        ycr=R[3]; m=L!=NADA; mr=LR!=NADA; m[:ycr]=False; mr[:ycr]=False
    elif not solo_cabeza:
        m=L!=NADA; mr=LR!=NADA; m[:yhr]=False; mr[:yhr]=False
    mejor=(10**9,0,0)
    for dy in range(-3,4):
        for dx in range(-3,4):
            mm=np.roll(np.roll(m,dy,0),dx,1); d=int((mm^mr).sum())
            if d<mejor[0]: mejor=(d,dx,dy)
    _,dx,dy=mejor
    return mover(P,dx,dy) if (dx or dy) else P

def pantalon(P,G):
    """Remeras/camisas blancas y negras: PixelLab tiñó también el pantalón. El pantalón (y el calzado) sale de la versión gris G."""
    pi,pl,pyh,pyc=P; gi,gl,gyh,gyc=G
    a=pi.copy(); l=pl.copy(); y0=min(pyc,gyc)-2
    for y in range(y0,a.shape[0]):
        for x in range(a.shape[1]):
            if gl[y,x] in (ABAJO,CALZ) or (pl[y,x] in (ABAJO,CALZ) and gi[y,x,3]==0):
                a[y,x]=gi[y,x]; l[y,x]=gl[y,x]
    return (a,l,pyh,pyc)

def vecinos4(m):
    n=np.zeros_like(m); n[1:]|=m[:-1]; n[:-1]|=m[1:]; n[:,1:]|=m[:,:-1]; n[:,:-1]|=m[:,1:]; return n

def combinar2(P,Hd,B):
    """Del dibujo del peinado se toma solo el pelo (con su contorno) y la cara; todo lo demás es de la prenda (sin su colita).
    Así nunca queda la blusa de siempre que trae el dibujo del peinado, ni la cabeza se corre."""
    pi,pl,pyh,pyc=P; hi,hl,hyh,hyc=Hd; H,W=pl.shape
    a=pi.copy(); l=pl.copy()
    v_h=np.array([[hsv(hi[y,x])[2] if hi[y,x,3] else 1 for x in range(W)] for y in range(H)])
    v_p=np.array([[hsv(pi[y,x])[2] if pi[y,x,3] else 1 for x in range(W)] for y in range(H)])
    hm=(hl==PELO)
    cm0=menton(B[1],B[2])
    for y,x in zip(*np.where(hm)):   # lo claro y poco saturado bajo el mentón no es pelo: es el cuello de la blusa del dibujo del peinado
        if y>cm0-2:
            h_,s_,v_=hsv(hi[y,x])
            if v_>0.6 and s_<0.45: hm[y,x]=False
    # el contorno oscuro de los hombros (que a veces se clasifica como pelo): bajo el mentón, fuera del ancho del cuello y sin pelo de verdad al lado
    fil=np.where(hi[cm0,:,3]>0)[0]
    if len(fil):
        x0,x1=fil[0],fil[-1]
        claro=hm&(v_h>=0.36)
        for y,x in zip(*np.where(hm)):
            if y>cm0 and (x<x0 or x>x1) and v_h[y,x]<0.36 and not claro[max(0,y-1):y+2,max(0,x-1):x+2].any(): hm[y,x]=False
    espalda=(B[1][:B[2]]==PIEL).sum()<40
    if espalda and not np.array_equal(hi,B[0]):
        # de espalda, con otro peinado: el pelo termina donde deja de ser ancho; lo de abajo es el contorno del cuello de la blusa del dibujo
        c_=hm.sum(1); filas=[y for y in range(H) if c_[y]>=6]
        if filas:
            y_=filas[0]
            while y_+1<H and c_[y_+1]>=6: y_+=1
            hm[y_+1:]=False
    hc=vecinos4(hm)&(hi[:,:,3]>0)&(v_h<0.36)&~hm                 # contorno del pelo del peinado
    if espalda and not np.array_equal(hi,B[0]) and filas: hc[y_+1:]=False
    gp=(pl==PELO)                                                # pelo de la prenda (el de la base)
    gc=gp.copy()
    for _ in range(2): gc|=vecinos4(gc)&(pi[:,:,3]>0)&(v_p<0.36)&(pl!=ARRIBA)&(pl!=ABAJO)   # y su contorno
    cm=menton(B[1],B[2])
    fuera=gc&~hm&~hc; fuera[cm+2:]=False
    if len(fil): fuera[cm0-1:,:x0]=False; fuera[cm0-1:,x1+1:]=False   # el contorno del hombro de la prenda no se borra
    for y,x in zip(*np.where(fuera)):
        if hi[y,x,3] and hl[y,x] in (PIEL,RESTO) and (y<=cm-1 or es_piel(hi[y,x]) or v_h[y,x]<0.36): a[y,x]=hi[y,x]; l[y,x]=hl[y,x]
        else: a[y,x]=0; l[y,x]=NADA
    m=hm|hc
    # el contorno oscuro de los hombros de la base no es pelo: donde la prenda tiene su propio contorno, queda el de la prenda
    hombro=m&(pi[:,:,3]>0)&(v_p<0.3)&(v_h<0.3)&((pl==ARRIBA)|(pl==RESTO)); hombro[:cm0-4]=False
    m&=~hombro
    a[m]=hi[m]; l[m]=hl[m]
    # lo que la prenda marcaba como pelo bajo el mentón y no es pelo del peinado es tela oscura del hombro: no se tiñe con el color del pelo
    q=(l==PELO)&~m; q[:cm0+1]=False; l[q]=RESTO
    # la cara y el cuello del peinado (que es la cara de la base) donde la prenda tiene piel
    # la cara: la del dibujo del peinado (la misma cara; donde la base la tapa con el flequillo, esta se ve bien)
    cara=((hl==PIEL)|(hl==RESTO))&(hi[:,:,3]>0)&(pl!=ARRIBA)&(pl!=ABAJO)&~hm; cara[cm+1:]=False
    if (B[1][:B[2]]==PIEL).sum()<40:   # de espalda no hay cara: lo claro y poco saturado es el cuello de la blusa del dibujo del peinado, no se copia
        for y,x in zip(*np.where(cara)):
            if tela_clara(hi[y,x]): cara[y,x]=False
    cara2=(hl==PIEL)&(pl==PIEL); cara2[:cm+1]=False; cara2[cm+3:]=False
    cara|=cara2
    a[cara]=hi[cara]; l[cara]=hl[cara]
    # el cuello que tapaba la colita (de espalda): sale del dibujo del peinado (piel y su contorno), si ahí quedó vacío
    tope=min(pyh,hyh)+2
    def pielh(c):
        h_,s_,v_=hsv(c); hd=h_*360
        return (0<=hd<=38) and 0.4<=s_<=0.8 and v_>=0.3 and c[0]>c[1]>=c[2]
    piel_h=np.array([[hi[y,x,3]>0 and hl[y,x]!=PELO and pielh(hi[y,x]) for x in range(W)] for y in range(H)]); piel_h[tope:]=False
    hueco=(a[:,:,3]==0)&piel_h
    for y,x in zip(*np.where(hueco)):   # solo huecos dentro del cuerpo (no el hombro más ancho de la base, por fuera de la prenda)
        if not (a[y,:x,3]>0).any() or not (a[y,x+1:,3]>0).any(): hueco[y,x]=False
    a[hueco]=hi[hueco]; l[hueco]=PIEL
    borde=vecinos4(hueco)&(a[:,:,3]==0)&(hi[:,:,3]>0)&(v_h<0.36); borde[tope:]=False
    a[borde]=hi[borde]; l[borde]=RESTO
    # y si de espalda el dibujo del peinado tenía ahí el cuello de la blusa: esa forma, con la tela de la prenda (y su contorno)
    hc_=np.where((hl[max(0,tope-14):tope]==PELO).any(0))[0]
    xa,xb=(hc_[0],hc_[-1]) if len(hc_) else (0,-1)
    for y in range(tope-1,-1,-1):
        for x in range(xa,xb+1):
            if a[y,x,3] or not hi[y,x,3] or hl[y,x]==PELO: continue
            if not (a[y+1:tope+6,x,3]>0).any(): continue
            if v_h[y,x]<0.36 and (hi[max(0,y-1):y+2,max(0,x-1):x+2,3]==0).any(): a[y,x]=hi[y,x]; l[y,x]=RESTO; continue   # contorno solo en el borde
            col=[a[k,xx,:3] for k in range(tope,min(H,tope+8)) for xx in range(max(0,x-3),min(W,x+4)) if a[k,xx,3] and l[k,xx]==ARRIBA]
            if col:
                col=sorted(col,key=lambda c:int(c[0])+int(c[1])+int(c[2])); c=col[len(col)//2]
                a[y,x,:3]=c; a[y,x,3]=255; l[y,x]=ARRIBA
    return a,l

def cara_fija(a,l,B,Hd,corte):
    """La cara siempre es la de la base: hasta el mentón, todo lo que no es pelo ni en la base ni en el peinado sale de la base
    (el cuello de la ropa no se toca)."""
    bi,bl=B[0],B[1]; hl=Hd[1]; cm=menton(bl,B[2]); espalda=(bl[:B[2]]==PIEL).sum()<40
    for y in range(corte):
        for x in range(a.shape[1]):
            if hl[y,x]==PELO or l[y,x]==PELO: continue
            if y<=cm and bl[y,x] in (PIEL,RESTO) and not (espalda and tela_clara(bi[y,x])): a[y,x]=bi[y,x]; l[y,x]=bl[y,x]   # la cara (también si la prenda la tapaba un poco)
            elif y>cm and bl[y,x]==PIEL and l[y,x]==PIEL and es_piel(bi[y,x]): a[y,x]=bi[y,x]          # el cuello: solo piel sobre piel

def cara_velo(a,l,B):
    """Con velo: los rasgos (ojos, boca, piel) de la base, solo donde la prenda también muestra cara."""
    bi,bl,byh=B[0],B[1],B[2]; cm=menton(bl,byh)
    if not ((bl==PIEL)[:cm].sum(1)>=4).any(): return          # de espaldas no hay cara
    for y in range(cm+1):
        xs=np.where(bl[y]==PIEL)[0]
        if len(xs)<2: continue
        for x in range(xs[0],xs[-1]+1):
            if bl[y,x] in (PIEL,RESTO) and l[y,x] in (PIEL,RESTO):
                c=a[y,x]; h_,s_,v_=hsv(c)
                if l[y,x]==RESTO and (s_<0.12 and v_>0.7): continue      # el borde blanco de la toca queda
                a[y,x]=bi[y,x]; l[y,x]=bl[y,x]

def quitar_colita(P,B,vista):
    """Las prendas de ella vienen con la colita de la base. Se saca antes de combinar: la colita (y sus mechones y contornos)
    sale de la base, alineada; donde estaba se rellena con la tela de la misma fila, o queda vacío si estaba fuera del cuerpo."""
    pi,pl,pyh,pyc=P; bi,bl,byh=B[0],B[1],B[2]; H,W=pl.shape
    y0=(byh-8) if vista=='north' else (menton(bl,byh)-6 if vista in ('east','west') else menton(bl,byh)+1)
    m=np.zeros((H,W),bool); m[y0:]=(bl[y0:]==PELO)|(pl[y0:]==PELO)
    m&=pi[:,:,3]>0
    # todo lo que tiene los colores del pelo de la cabeza y está pegado a la colita también es colita (las puntas, las sombras)
    top=(pl==PELO); top[y0:]=False
    if top.sum()>10:
        pal=np.unique(pi[top][:,:3].astype(int),axis=0)
        d=np.full((H,W),999)
        for y in range(max(0,y0-2),H):
            for x in range(W):
                if pi[y,x,3] and (hsv(pi[y,x])[0]*360<=45 or hsv(pi[y,x])[1]<0.2): d[y,x]=np.abs(pal-pi[y,x,:3].astype(int)).sum(1).min()   # solo castaños (no el bordó oscuro)
        cerca=m.copy()
        for _ in range(4 if vista!='south' else 1): cerca|=vecinos4(cerca)
        for _ in range(40):
            n=np.zeros_like(m)
            for dy in (-1,0,1):
                for dx in (-1,0,1): n|=np.roll(np.roll(m,dy,0),dx,1)
            nuevo=n&(d<=30)&cerca&~m; nuevo[:y0-2]=False
            if not nuevo.any(): break
            m|=nuevo
    al0=pi[:,:,3]>0; bord0=np.zeros_like(al0)
    for dy in (-1,0,1):
        for dx in (-1,0,1): bord0|=~np.roll(np.roll(al0,dy,0),dx,1)
    oscuro=np.array([[pi[y,x,3]>0 and ((hsv(pi[y,x])[2]<0.36 and pi[y,x,0]>=pi[y,x,2] and (hsv(pi[y,x])[0]*360<=45 or hsv(pi[y,x])[0]*360>=330)) or (hsv(pi[y,x])[2]<0.2 and bord0[y,x])) for x in range(W)] for y in range(H)])
    for _ in range(6 if vista!='south' else 0):   # contornos y mechones sueltos de la colita (de frente no: se comería el buzo)
        n=np.zeros_like(m); n[1:]|=m[:-1]; n[:-1]|=m[1:]; n[:,1:]|=m[:,:-1]; n[:,:-1]|=m[:,1:]
        nuevo=n&oscuro&~m; nuevo[:y0]=False
        if not nuevo.any(): break
        m|=nuevo
    # los mechones finitos que salen hacia afuera (sobre el fondo): castaños, pegados al fondo
    al=pi[:,:,3]>0; bord=np.zeros_like(al)
    for dy in (-1,0,1):
        for dx in (-1,0,1): bord|=~np.roll(np.roll(al,dy,0),dx,1)
    mech=np.array([[al[y,x] and hsv(pi[y,x])[2]<0.55 and pi[y,x,0]>=pi[y,x,2] and (hsv(pi[y,x])[0]*360<=40 or hsv(pi[y,x])[0]*360>=330) for x in range(W)] for y in range(H)])&bord
    for _ in range(12):
        n=np.zeros_like(m); 
        for dy in (-1,0,1):
            for dx in (-1,0,1): n|=np.roll(np.roll(m,dy,0),dx,1)
        nuevo=n&mech&~m; nuevo[:y0-4]=False
        if not nuevo.any(): break
        m|=nuevo
    a=pi.copy(); l=pl.copy()
    for y in range(H):
        for x in range(W):
            if not m[y,x]: continue
            def lado(dx):
                xx=x+dx
                while 0<=xx<W and abs(xx-x)<=16:
                    if not pi[y,xx,3]: return 'fuera'
                    if not m[y,xx]: return xx
                    xx+=dx
                return None
            iz,de=lado(-1),lado(1)
            if iz=='fuera' or de=='fuera': a[y,x]=0; l[y,x]=NADA; continue
            if iz is None or de is None:   # muy ancho: la tela de abajo
                k=next((k for k in range(y+1,H) if pi[k,x,3] and not m[k,x]),None)
                if k is None: a[y,x]=0; l[y,x]=NADA
                else: a[y,x]=pi[k,x]; l[y,x]=pl[k,x]
                continue
            k=iz if x-iz<=de-x else de
            # se usa la tela (no el contorno oscuro de la colita): si el vecino es oscuro, se sigue hacia afuera hasta 5 px
            kk=k; paso=(-1 if k<x else 1)
            for _ in range(5):
                if hsv(pi[y,kk])[2]>=0.3: break
                n2=kk+paso
                if not (0<=n2<W) or not pi[y,n2,3] or m[y,n2]: break
                kk=n2
            if hsv(pi[y,kk])[2]<0.3: kk=k
            a[y,x]=pi[y,kk]; l[y,x]=pl[y,kk]
    # la sombra que la colita dejaba sobre la ropa: en la zona de la colita, la tela más oscura que la de la fila toma el color común de la fila
    from collections import Counter
    zona=m.copy()
    for _ in range(3): zona|=vecinos4(zona)
    for y in range(y0,H):
        xs=[x for x in range(W) if zona[y,x]]
        if not xs: continue
        fuera_=[tuple(int(c) for c in a[y,x,:3]) for x in range(W) if a[y,x,3] and l[y,x] in (ARRIBA,RESTO) and not zona[y,x] and hsv(a[y,x])[2]>0.2 and not es_piel(a[y,x])]
        if len(fuera_)<3: continue
        comun=Counter(fuera_).most_common(1)[0][0]; vc=hsv(np.array(comun))[2]
        for x in xs:
            if not a[y,x,3] or (l[y,x] not in (ARRIBA,RESTO) and not m[y,x]): continue
            v=hsv(a[y,x])[2]
            if v<vc-0.06 and (v>vc*0.2 or m[y,x]) and not bord0[y,x]: a[y,x,:3]=comun; l[y,x]=ARRIBA
    # lo rellenado que quedó oscuro (arriba, donde la fila es casi todo colita): la tela de abajo, misma columna
    for y in range(H-1,y0-1,-1):
        for x in range(W):
            if not m[y,x] or not a[y,x,3] or bord0[y,x]: continue
            k=next((k for k in range(y+1,min(H,y+10)) if a[k,x,3] and not m[k,x] and hsv(a[k,x])[2]>=0.2 and l[k,x] not in (PIEL,PELO)),None)
            if k is not None and hsv(a[k,x])[2]>hsv(a[y,x])[2]+0.12: a[y,x]=a[k,x]; l[y,x]=l[k,x]
    # restos oscuros sueltos de la punta de la colita sobre la tela: toman el color de la tela de alrededor
    zona=m.copy()
    for _ in range(3):
        n=zona.copy(); n[1:]|=zona[:-1]; n[:-1]|=zona[1:]; n[:,1:]|=zona[:,:-1]; n[:,:-1]|=zona[:,1:]; zona=n
    for y in range(1,H-1):
        for x in range(1,W-1):
            if not zona[y,x] or not a[y,x,3]: continue
            v=hsv(a[y,x])[2]; vec=[(yy,xx) for yy in (y-1,y,y+1) for xx in (x-1,x,x+1) if (yy,xx)!=(y,x) and a[yy,xx,3] and hsv(a[yy,xx])[2]>v+0.25]
            if len(vec)>=5: yy,xx=vec[0]; a[y,x]=a[yy,xx]; l[y,x]=l[yy,xx]
    # de espalda: donde estaba la colita, la tela de la misma columna justo debajo (la espalda lisa, con sus sombras verticales)
    if vista=='north':
        for x in range(W):
            ys=[y for y in range(H) if m[y,x] and a[y,x,3]]
            if not ys: continue
            k=next((k for k in range(max(ys)+1,min(H,max(ys)+12)) if a[k,x,3] and not zona[k,x] and l[k,x] in (ARRIBA,RESTO) and hsv(a[k,x])[2]>=0.2),None)
            if k is None: continue
            for y in ys:
                if l[y,x] in (ARRIBA,RESTO) and not bord0[y,x]: a[y,x]=a[k,x]; l[y,x]=l[k,x]
    # de espalda: las rayitas claras de un píxel que deja el borde de la colita sobre la capucha toman la tela de al lado
    if vista=='north':
        for _ in range(2):
            for y in range(1,H-1):
                for x in range(1,W-1):
                    if not zona[y,x] or not a[y,x,3] or l[y,x]!=ARRIBA: continue
                    v=hsv(a[y,x])[2]
                    for (y1,x1),(y2,x2) in (((y,x-1),(y,x+1)),((y-1,x),(y+1,x))):
                        if a[y1,x1,3] and a[y2,x2,3] and l[y1,x1]==ARRIBA and (a[y1,x1,:3]==a[y2,x2,:3]).all() and hsv(a[y1,x1])[2]<v-0.04:
                            a[y,x]=a[y1,x1]; break
    return (a,l,pyh,pyc)

def cuello(a,l,P,B,Hd,corte,vista):
    """La franja del cuello (del mentón al corte; de espalda, todo lo que no es pelo ni piel sobre el corte) es de la prenda:
    así no queda el cuello de la blusa de siempre que trae el dibujo del peinado, y el cuello de camisa o alzacuello se ve entero."""
    pi,pl=P[0],P[1]; bl=B[1]; hl=Hd[1]; H,W=l.shape
    y0=0 if vista=='north' else menton(bl,B[2])+1
    for y in range(y0,corte):
        for x in range(W):
            if hl[y,x]==PELO or l[y,x]==PELO: continue
            if es_piel(a[y,x]) and not (vista!='north' and pl[y,x]==ARRIBA): continue   # el cuello (piel de verdad) queda
            if pl[y,x]==PELO: continue
            if pi[y,x,3]: a[y,x]=pi[y,x]; l[y,x]=pl[y,x] if pl[y,x]!=NADA else RESTO
            elif l[y,x] in (ARRIBA,RESTO) and y>=y0+ (2 if vista=='north' else 0):
                h_,s_,v_=hsv(a[y,x]); hd=h_*360
                if l[y,x]==ARRIBA or ((25<=hd<=60) and s_<0.3 and v_>0.6): a[y,x]=0; l[y,x]=NADA
    # astillas de un píxel de alto que quedan flotando (el alzacuello que seguía detrás de otra nuca)
    for _ in range(3):
        al=a[:,:,3]>0
        for y in range(max(1,y0),min(H-1,corte+4)):
            for x in range(W):
                if al[y,x] and not al[y-1,x] and not al[y+1,x]: a[y,x]=0; l[y,x]=NADA

def tela_clara(c):
    h,s_,v=hsv(c); return s_<0.35 and v>0.5

def es_piel(c):
    h,s_,v=hsv(c); hd=h*360; return (5<=hd<=30) and 0.33<=s_<=0.75 and v>=0.38 and c[0]>c[1]>c[2]

def piel_pareja(a,l,B):
    """La piel que no es de la cara (cuello, escote, manos) toma los tonos de la piel de la base, según qué tan clara era:
    cada prenda de PixelLab trae su propio tono y se notaba (la mancha naranja del cuello de la camisa)."""
    bi,bl=B[0],B[1]; cara=(bl==PIEL); cara[B[2]:]=False
    tonos=sorted({tuple(int(v) for v in bi[y,x,:3]) for y,x in zip(*np.where(cara))},key=lambda c:sum(c))
    if len(tonos)<3: return
    lum=np.array([sum(c) for c in tonos])
    cm=menton(bl,B[2]); fx=np.where(cara.any(0))[0]
    if not len(fx): return
    x0,x1=fx[0]-3,fx[-1]+3
    for y,x in zip(*np.where(l==PIEL)):
        if y<=cm or y>B[2]+12 or not (x0<=x<=x1) or not es_piel(a[y,x]): continue   # solo el cuello y el escote
        c=a[y,x,:3]; v=int(c[0])+int(c[1])+int(c[2]); k=int(np.abs(lum-v).argmin()); a[y,x,:3]=tonos[k]

def mascara_pelo(Hd,B):
    """El pelo largo de un peinado, bajo el mentón: lo que el dibujo del peinado tiene distinto de la base (que lleva la misma ropa).
    Así no depende del color (el pelo castaño de espalda se confundía con piel, los contornos de la ropa con pelo)."""
    hi,hl,hyh,hyc=Hd; bi,bl,byh=B[0],B[1],B[2]; H,W=hl.shape; cm=menton(bl,byh)
    al_h=hi[:,:,3]>0
    mejor=None
    for dy in range(-2,3):
        for dx in range(-2,3):
            b2=np.roll(np.roll(bi,dy,0),dx,1)
            d=(np.abs(hi[byh+10:].astype(int)-b2[byh+10:].astype(int)).sum(2)>40).sum()
            if mejor is None or d<mejor[0]: mejor=(d,dx,dy)
    _,dx,dy=mejor; b2=np.roll(np.roll(bi,dy,0),dx,1)
    D=al_h&((np.abs(hi.astype(int)-b2.astype(int)).sum(2)>40)|(b2[:,:,3]==0))
    D[:cm+1]=False
    # sacar lo suelto (bordes de un píxel por un corrimiento): se queda lo que está pegado al pelo de la cabeza
    from collections import deque
    pel=(hl==PELO); pel[cm+1:]=False; m=D.copy(); vis=np.zeros_like(m); q=deque()
    for y in range(max(0,cm-3),cm+2):
        for x in range(W):
            if pel[y,x] or (m[y,x] and hl[y,x]==PELO): vis[y,x]=True; q.append((y,x))
    while q:
        y,x=q.popleft()
        for ddy,ddx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny,nx=y+ddy,x+ddx
            if 0<=ny<H and 0<=nx<W and m[ny,nx] and not vis[ny,nx]: vis[ny,nx]=True; q.append((ny,nx))
    out=hl.copy(); baj=np.zeros_like(m); baj[cm+1:]=True
    out[baj&vis]=PELO; out[baj&~vis&(hl==PELO)]=RESTO
    return (hi,out,hyh,hyc)

def pelo_largo(P):
    """En un peinado largo, lo que baja de la cabeza: la mata castaña que el color confundía con piel (de espalda) y las sombras
    entre mechas se vuelven pelo, creciendo desde el pelo de la cabeza. La piel clara (brazos) y los contornos sueltos no."""
    a,l,yh,yc=P; l=l.copy(); H,W=l.shape
    from collections import deque
    # candidatos: castaño de la mata (cálido, saturado, no claro); y tiene que ser «mata»: varios vecinos candidatos (no una línea de contorno)
    cand=np.zeros((H,W),bool)
    for y in range(max(0,yh-4),H):
        for x in range(W):
            if a[y,x,3] and l[y,x] in (PIEL,RESTO):
                h_,s_,v_=hsv(a[y,x]); hd=h_*360
                if (hd<=40 or hd>=345) and s_>=0.35 and 0.12<=v_<0.5: cand[y,x]=True
    base_=cand|(l==PELO); grueso=np.zeros_like(cand)
    for y in range(1,H-1):
        for x in range(1,W-1):
            if cand[y,x] and base_[y-1:y+2,x-1:x+2].sum()>=6: grueso[y,x]=True
    q=deque((y,x) for y,x in zip(*np.where(l==PELO)))
    while q:
        y,x=q.popleft()
        for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny,nx=y+dy,x+dx
            if 0<=ny<H and 0<=nx<W and grueso[ny,nx] and l[ny,nx]!=PELO: l[ny,nx]=PELO; q.append((ny,nx))
    for _ in range(6):   # sombras entre mechas: oscuras y con pelo de los dos lados
        cambio=False
        pel=(l==PELO)
        for y in range(yh-4,H):
            for x in range(1,W-1):
                if l[y,x]!=RESTO or not a[y,x,3] or a[y,x,0]<a[y,x,2] or hsv(a[y,x])[2]>=0.5: continue
                n=int(pel[y-1,x])+int(pel[y+1,x] if y+1<H else 0)+int(pel[y,x-1])+int(pel[y,x+1])
                if n>=3 or (pel[y,x-1] and pel[y,x+1]) or (pel[y-1,x] and y+1<H and pel[y+1,x]): l[y,x]=PELO; cambio=True
        if not cambio: break
    return (a,l,yh,yc)

def pelo_por_paleta(a,l,B,largo):
    """Debajo del mentón, es pelo solo lo que tiene los colores del pelo de la cabeza: los pliegues de la camisa clara dejan de teñirse,
    y las sombras de las mechas largas que habían quedado afuera pasan a ser pelo."""
    cm=menton(B[1],B[2]); top=(l==PELO); top[max(0,cm-6):]=False
    if top.sum()<10: return
    pal=np.unique(a[top][:,:3].astype(int),axis=0)
    H,W=l.shape
    for y in range(cm+1,H):
        for x in range(W):
            if not a[y,x,3]: continue
            d=np.abs(pal-a[y,x,:3].astype(int)).sum(1).min()
            if l[y,x]==PELO and d>45: l[y,x]=RESTO
    if largo:   # (solo con la ropa de siempre, donde el dibujo es el del peinado) el pelo largo que baja: lo del color del pelo pegado al pelo, dentro de su ancho
        cols=np.where((l[max(0,cm-8):cm+1]==PELO).any(0))[0]
        if not len(cols): return
        xa,xb=cols[0]-1,cols[-1]+1
        for _ in range(40):
            cambio=False
            pel=(l==PELO)
            for y in range(cm+1,H):
                for x in range(W):
                    if l[y,x] not in (RESTO,PIEL) or not a[y,x,3] or not (xa<=x<=xb): continue
                    if not pel[max(0,y-1):y+2,max(0,x-1):x+2].any(): continue
                    if l[y,x]==RESTO and not (pel[y,max(0,x-3):x].any() and pel[y,x+1:x+4].any()): continue   # solo dentro de la mata de pelo, no en los bordes
                    d=np.abs(pal-a[y,x,:3].astype(int)).sum(1).min()
                    if d<=(12 if l[y,x]==PIEL else 24): l[y,x]=PELO; cambio=True
            if not cambio: break
    # los contornos oscuros finitos (brazos, cinto) que quedaron como pelo: el pelo es una mata, no una línea de un píxel
    pel=(l==PELO)
    for y in range(cm+1,H):
        for x in range(W):
            if pel[y,x] and hsv(a[y,x])[2]<0.32 and pel[max(0,y-2):y+3,max(0,x-2):x+3].sum()<9: l[y,x]=RESTO
    # y tiene que estar pegado al pelo de la cabeza: las manchitas sueltas en la ropa (pliegues marrones) no son pelo
    from collections import deque
    pel=(l==PELO); vis=np.zeros_like(pel); q=deque()
    for y,x in zip(*np.where(pel)):
        if y<=cm: vis[y,x]=True; q.append((y,x))
    while q:
        y,x=q.popleft()
        for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny,nx=y+dy,x+dx
            if 0<=ny<H and 0<=nx<W and pel[ny,nx] and not vis[ny,nx]: vis[ny,nx]=True; q.append((ny,nx))
    l[pel&~vis]=RESTO

def cejas(l,anc):
    """Las cejas: el pelo que queda dentro de la cara, justo arriba de los ojos. Se tiñen como el pelo pero más oscuras."""
    if not anc.get('cara') or not anc.get('ojo_x'): return
    fx0,fy0,fx1,fy1=anc['cara']; ey=anc['ojo_y']; piel=(l==PIEL)
    for y in range(max(0,ey-4),ey):
        xs=np.where(piel[max(0,y-2):y+4].any(0))[0]
        if len(xs)<3: continue
        for x in range(xs[0]+1,xs[-1]):
            if l[y,x]==PELO and (piel[y+1:y+4,x].any()): l[y,x]=CEJA

def etiquetas_de(P,G):
    """Las prendas de color toman las regiones de la versión gris (alineada): el bordó o el marrón no se confunden con pelo o piel."""
    pi,pl,pyh,pyc=P; gi,gl,gyh,gyc=G; l=pl.copy(); y0=menton(pl,pyh)+1
    both=(pi[:,:,3]>0)&(gi[:,:,3]>0); both[:y0]=False
    l[both]=gl[both]
    solo=(pi[:,:,3]>0)&(gi[:,:,3]==0); solo[:y0]=False
    l[solo&((pl==PELO)|(pl==PIEL))]=RESTO
    return (pi,l,pyh,pyc)

def _hls(a):
    f=a[:,:,:3].astype(float)/255; mx=f.max(2); mn=f.min(2); return (mx+mn)/2

def sombrear(P,G,lab):
    """Si PixelLab dejó la prenda de color casi plana, se le pasan las luces y sombras de la gris (mismo color, dibujo con volumen)."""
    pi,pl,pyh,pyc=P; gi,gl=G[0],G[1]
    m=(pl==lab)&(gl==lab)&(pi[:,:,3]>0)&(gi[:,:,3]>0)
    if m.sum()<30: return P
    lc=_hls(pi); lg=_hls(gi); sc,sg=lc[m].std(),lg[m].std()
    if sc>=sg*0.55: return P
    a=pi.copy(); import colorsys
    med=np.median(pi[m][:,:3],0)/255; h,ll,s=colorsys.rgb_to_hls(*med)
    mg=np.median(lg[m]); k=min(0.9,max(0.15,ll/max(0.05,mg)))   # la ropa oscura recibe sombras más suaves: sigue siendo negra
    for y,x in zip(*np.where(m)):
        L2=min(0.92,max(0.04,ll+(lg[y,x]-mg)*k)); r,g,b=colorsys.hls_to_rgb(h,L2,s)
        a[y,x,:3]=(round(r*255),round(g*255),round(b*255))
    return (a,pl,pyh,pyc)

def accesorios(prep,base):
    """Barba, anteojos y cruz, separados por dónde están: la diferencia entre el seminarista con y sin accesorios."""
    A0=preparar(ACC_DE[0]); A1=preparar(ACC_DE[1]); out={}
    for v in VISTAS:
        S=alinear(A0[v],base[v],solo_cabeza=True); dx=dy=0
        # el mismo corrimiento para la versión con accesorios: se apoya sobre el seminarista ya alineado
        X=alinear(A1[v],S)
        si,sl,syh,_=S; xi=X[0]; H,W=sl.shape
        d=(np.abs(si.astype(int)-xi.astype(int)).sum(2)>36)&(xi[:,:,3]>0)
        anc=anclas(Image.fromarray(si),sl,syh,S[3]); ey=anc.get('ojo_y') or syh-14; cm=menton(sl,syh)
        capas={}
        hs=lambda c: hsv(c)
        for nom in ('anteojos','barba','cruz'): capas[nom]=np.zeros((H,W,4),np.uint8)
        for y,x in zip(*np.where(d)):
            c=xi[y,x]; h_,s_,v_=hs(c); hd=h_*360
            if v=='north': continue
            if ey-3<=y<=ey+2 and (s_<0.25 or v_<0.3): capas['anteojos'][y,x]=c
            elif ey+2<y<=cm+5 and y<syh+3 and v_<0.6 and not (s_<0.18 and v_>0.35): capas['barba'][y,x]=c   # solo lo del color del pelo (no restos de los anteojos)
            elif y>=syh+2 and y<S[3] and (5<=hd<=45 or hd>=340) and s_>=0.3 and v_>=0.18: capas['cruz'][y,x]=c
        # la barba: solo lo que no es contorno suelto
        out[v]=capas
    return out

def _lum(c): return 0.299*int(c[0])+0.587*int(c[1])+0.114*int(c[2])

def capucha(P,Pm,R):
    """Pega la capucha del buzo de él (de espalda) sobre la de ella, centrada y apoyada en el cuello; solo dentro de la silueta de ella,
    en la zona donde estaba la colita, y con los colores de ella (el tono de igual brillo)."""
    a,l,yh,yc=P; a=a.copy(); l=l.copy(); am,lm=Pm[0],Pm[1]; H,W=l.shape
    def cx(img,y):
        xs=np.where(img[y,:,3]>0)[0]; return int(round((xs[0]+xs[-1])/2)) if len(xs) else None
    # el borde de arriba de la tela en el centro
    c_f=cx(a,yh+4); c_m=cx(am,Pm[2]+4)
    tela=lambda L_,A_,y,c: (((L_[y,c-6:c+7]==ARRIBA)|(L_[y,c-6:c+7]==RESTO))&(A_[y,c-6:c+7,3]>0)).sum()>=10 and y>=Pm[2]-6
    top_f=next(y for y in range(H) if tela(l,a,y,c_f))
    top_m=next(y for y in range(H) if tela(lm,am,y,c_m))
    dy=top_f-top_m; dx=c_f-c_m
    zona=R.copy()
    for _ in range(2): zona|=vecinos4(zona)
    ys,xs=np.where(R)
    if not len(ys): return P
    y1=ys.max()+2
    def pelo_c(c): h_,s_,v_=hsv(c); return h_*360<40 and s_>0.35
    from collections import Counter
    def tela_de(img,lab,yh_,yc_,excl):
        m=(img[:,:,3]>0)&(lab!=PIEL)&(lab!=PELO); m[:yh_]=False; m[yc_-2:]=False
        if excl is not None: m&=~excl
        return Counter(tuple(c) for c in img[m] if not pelo_c(c))
    tf=tela_de(a,l,yh,yc,zona); tm=tela_de(am,lm,Pm[2],Pm[3],None)
    if not tf or not tm: return P
    Mf=_lum(tf.most_common(1)[0][0]); Mm=_lum(tm.most_common(1)[0][0])
    pal=[c for c,n in tf.items() if n>=4 and _lum(c)>=0.45*Mf]
    if not pal: return P
    lp=np.array([_lum(c) for c in pal])
    osc=[(c,n) for c,n in tf.items() if _lum(c)<0.45*Mf]
    oscuro=np.array(max(osc,key=lambda t:t[1])[0] if osc else (20,12,20,255),np.uint8)
    lm_=sorted({_lum(c) for c in tm if _lum(c)>=0.45*Mm})
    lo_m,hi_m=np.percentile(lm_,5),np.percentile(lm_,95); lo_f,hi_f=np.percentile(lp,5),np.percentile(lp,95)
    for y in range(top_f,min(H,y1)):
        for x in range(W):
            if not zona[y,x] or not a[y,x,3] or l[y,x] not in (ARRIBA,RESTO,PELO): continue
            ym,xm=y-dy,x-dx
            if not (0<=ym<H and 0<=xm<W) or not am[ym,xm,3] or lm[ym,xm] not in (ARRIBA,RESTO): continue
            c=am[ym,xm]; L=_lum(c)
            if L<0.45*Mm: a[y,x]=oscuro; l[y,x]=RESTO; continue        # el contorno, con el contorno de ella
            t=(L-lo_m)/max(1,hi_m-lo_m); Lf=lo_f+t*(hi_f-lo_f)
            a[y,x]=pal[int(np.argmin(np.abs(lp-Lf)))]; l[y,x]=ARRIBA
    return (a,l,yh,yc)

def como_la_gris(P,G,R,B):
    """Prenda de color: en la zona de la colita copia la gris (ya limpia): cada tono gris, escalado por su brillo respecto del tono
    principal de la gris, pasa al tono de esta prenda más parecido (los colores del pelo no cuentan)."""
    a,l,yh,yc=P; a=a.copy(); l=l.copy(); g,gl=G[0],G[1]; H,W=l.shape
    from collections import Counter
    pelo={tuple(c) for c in B[0][B[1]==PELO]}
    zona=R.copy()
    for _ in range(3): zona|=vecinos4(zona)
    lejos=zona.copy()
    for _ in range(3): lejos|=vecinos4(lejos)
    def tonos(img,lab):   # la tela de arriba: entre los hombros y la cintura de la gris (la azul se confunde con el jean en las etiquetas)
        m=~lejos&(img[:,:,3]>0)&(lab!=PIEL)&(lab!=PELO); m[:yh]=False; m[G[3]-2:]=False
        return Counter(tuple(c) for c in img[m] if tuple(c) not in pelo)
    tg,ta=tonos(g,gl),tonos(a,l)
    if not tg or not ta: return P
    mg=np.array(tg.most_common(1)[0][0][:3],float); ma=np.array(ta.most_common(1)[0][0][:3],float)
    pal=[c for c,n in ta.items() if n>=3]; P3=np.array([c[:3] for c in pal],float)
    zz=zona.copy(); zz[:yh-6]=False
    for y,x in zip(*np.where(zz&(g[:,:,3]>0)&(a[:,:,3]>0))):
        if gl[y,x]==PIEL or l[y,x]==PIEL or y>=G[3]-2: continue
        r=_lum(g[y,x])/max(1,_lum(mg)); objetivo=np.clip(ma*r,0,255)
        k=int(np.argmin(((P3-objetivo)**2).sum(1)))
        a[y,x]=pal[k]; l[y,x]=ARRIBA if gl[y,x] in (PELO,NADA) else gl[y,x]
    return (a,l,yh,yc)

# 1.5: cada combinación es un dibujo entero de PixelLab (sin pegar partes ni recolorear la ropa).
PEINADO_PRE={'m':{'base':'yo','corto':'yo_corto','largo':'yo_largo'},'f':{'base':'yo_f','suelto':'yo_f_suelto','corto':'yo_f_carre'}}
SOLO_PEINADO={'m':{'clergyman':'corto'},'f':{}}      # el clergyman de PixelLab viene con pelo corto
def clave_directa(sx,pn,pk,hn):
    cfg=SEXOS[sx]
    if pk==cfg['base']: return dict(cfg['peinados'])[hn]
    if hn=='base' or pn in cfg.get('velo',[]): return pk
    tipo=pn.split(':')[0]; col=pn.split(':')[1] if ':' in pn else None
    k=PEINADO_PRE[sx][hn]+'_'+('clergyman' if pn=='clergyman' else tipo)+('' if col in (None,'gris') else '_'+col)
    return k

def pelo_estricto(a,l,yh=None,yc=None,largo=True,espalda_=False,seguro=None,molde_=None):
    """El pelo es solo lo que tiene los colores del pelo de la coronilla de ESTE dibujo y está unido a la cabeza:
    así el buzo negro o bordó junto al pelo no se tiñe al cambiar el color del pelo."""
    from collections import deque, Counter
    H,W=l.shape; al=a[:,:,3]>0
    ys=np.where(al.any(1))[0]
    if not len(ys): return
    top=ys[0]; corona=(l==PELO); corona[top+11:]=False
    zona=(l==PELO); zona[max(top+11,(yh or top+11)-4):]=False
    cc=Counter(tuple(int(v) for v in a[y,x,:3]) for y,x in zip(*np.where(corona)))
    def pielish(c): h_,s_,v_=hsv(np.array(c)); return (not espalda_) and h_*360<=35 and s_>=0.4 and v_>=0.6   # la piel (frente, mejillas) no es pelo
    cs_=Counter(tuple(int(v) for v in a[y,x,:3]) for y,x in zip(*np.where(seguro))) if seguro is not None else Counter()
    ch_=Counter(tuple(int(v) for v in a[y,x,:3]) for y,x in zip(*np.where((l==PELO)&molde_))) if molde_ is not None else Counter()
    def de_tela(c,n): return cs_[c]>max(n,ch_[c])
    pal=np.array([c for c,n in cc.items() if n>=2 and not pielish(c) and not de_tela(c,n)],float)
    if not len(pal): return
    # los tonos más oscuros del pelo (la colita, las puntas): solo si se parecen a los de la coronilla (la capucha bordó no)
    cz=Counter(tuple(int(v) for v in a[y,x,:3]) for y,x in zip(*np.where(zona&~corona)))
    extra=[c for c,n in cz.items() if n>=3 and ((pal-np.array(c,float))**2).sum(1).min()<=24**2]
    if extra: pal=np.concatenate([pal,np.array(extra,float)])
    # la tela de esta prenda (lejos del pelo): la cintura y el costado de las mangas
    coronaset={tuple(int(v) for v in c) for c in pal}
    yc_=yc or H-30; mt=np.zeros((H,W),bool); mt[max(0,yc_-6):yc_+4]=True
    for y in range((yh or top+30)+10,yc_):
        xs=np.where(al[y])[0]
        if len(xs)>8: mt[y,xs[:4]]=True; mt[y,xs[-4:]]=True
    cg=Counter(tuple(int(v) for v in a[y,x,:3]) for y,x in zip(*np.where(mt&al&(l!=PIEL))))
    corfuerte=np.array([c for c,n in cc.items() if n>=3],float) if any(n>=3 for n in cc.values()) else np.zeros((0,3))
    def en_corona(c): return len(corfuerte) and ((corfuerte-np.array(c,float))**2).sum(1).min()<=10**2
    gl_=[c for c,n in cg.items() if n>=3 and c not in coronaset and not en_corona(c)]   # el cinturón marrón no le gana al pelo+[c for c,n in cs_.items() if n>=4 and de_tela(c,cc.get(c,0))]
    gpal=np.array(gl_,float) if gl_ else np.zeros((0,3))
    fuertes=np.array([c for c,n in cc.items() if n>=5],float) if any(n>=5 for n in cc.values()) else pal
    def principal(c): return ((fuertes-np.array(c[:3],float))**2).sum(1).min()<=6**2
    def cerca(c):
        c=np.array(c[:3],float); dh=((pal-c)**2).sum(1).min()
        if dh>16**2: return False
        return not len(gpal) or dh<((gpal-c)**2).sum(1).min()
    ok=np.zeros((H,W),bool); oscuro=np.zeros((H,W),bool); cand=np.zeros((H,W),bool)
    for y,x in zip(*np.where((l==PELO)|(l==RESTO)|(l==PIEL)|(l==ARRIBA)|(l==ABAJO))):
        h_,s_,vv=hsv(a[y,x]); hd=h_*360
        if cerca(a[y,x]) and (s_>=0.35 or principal(a[y,x])) and not (hd<=35 and s_>=0.4 and vv>=0.6 and not espalda_ and l[y,x]!=PELO):   # el pelo es castaño saturado (también su contorno); la ropa negra es gris oscura, sin color
            cand[y,x]=True; oscuro[y,x]=vv<0.25
    # no se entra a un píxel pegado a la tela (el contorno de la ropa tiene el mismo marrón oscuro que el del pelo)
    v_=np.array([[hsv(a[y,x])[2] if al[y,x] else 0 for x in range(W)] for y in range(H)])
    tela=al&~cand&(v_>=0.25)&((l==ARRIBA)|(l==ABAJO)|(l==CALZ)|(l==RESTO))
    pegado=np.zeros_like(tela); pegado[1:]|=tela[:-1]; pegado[:-1]|=tela[1:]; pegado[:,1:]|=tela[:,:-1]; pegado[:,:-1]|=tela[:,1:]
    semilla=(l==PELO)&cand; semilla[(yh or top+30):]=False      # todo el pelo de la cabeza (la colita, aunque la separe la gomita)
    q=deque((y,x) for y,x in zip(*np.where(semilla|(corona&cand))))
    for y,x in q: ok[y,x]=True
    while q:
        y,x=q.popleft()
        for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny,nx=y+dy,x+dx
            if 0<=ny<H and 0<=nx<W and not ok[ny,nx] and cand[ny,nx] and not (pegado[ny,nx] and oscuro[ny,nx]) and l[ny,nx]!=PIEL: ok[ny,nx]=True; q.append((ny,nx))
    # el contorno oscuro del pelo: solo pegado a pelo ya aceptado (no se corre por el contorno de la ropa)
    borde=np.zeros_like(ok)
    for y,x in zip(*np.where(oscuro&cand&~ok)):
        if ok[max(0,y-1):y+2,max(0,x-1):x+2].any(): borde[y,x]=True
    ok|=borde
    # en la cabeza, las sombras oscuras pegadas al pelo (la nuca de espalda, entre mechones) también son pelo
    if yh:
        for _ in range(8):
            nuevo=((l==RESTO)|(l==ARRIBA)|(l==PELO))&al&(v_<0.22)&vecinos4(ok); nuevo[yh+(1 if espalda_ else -3):]=False; nuevo[:top]=False
            if not nuevo.any(): break
            ok|=nuevo
    # huecos dentro del pelo (sombras más oscuras que la paleta): se llenan si están rodeados de pelo y no son tela
    tg=np.zeros((H,W),bool)
    for y,x in zip(*np.where(al&~ok&(l!=PIEL)&(l!=CEJA))):
        c=a[y,x]; h_,s_,vv=hsv(c); hd=h_*360
        if not ((hd<=40 or hd>=300) and s_>=0.2): continue
        cf=np.array(c[:3],float)
        if len(gpal) and ((gpal-cf)**2).sum(1).min()<((pal-cf)**2).sum(1).min(): continue
        tg[y,x]=True
    for _ in range(10):
        nb=np.zeros((H,W),int); nb[1:]+=ok[:-1]; nb[:-1]+=ok[1:]; nb[:,1:]+=ok[:,:-1]; nb[:,:-1]+=ok[:,1:]
        nuevo=tg&~ok&(nb>=3)
        if not nuevo.any(): break
        ok|=nuevo
    if not largo and yh: ok[yh-(2 if espalda_ else 5):]=False      # pelo corto: bajo los hombros no hay pelo (la tela oscura del clergyman tiene sus mismos tonos)
    sacar=(l==PELO)&~ok; l[sacar]=RESTO
    poner=ok&(l!=PELO)&(l!=PIEL)&(l!=CEJA); l[poner]=PELO

def piel_cara(a,l,yh,espalda=False):
    """En la cara, los tonos de piel que quedaron sin marcar (rubor, sombras de la nariz) también son piel: si no, quedan manchas al cambiar el tono."""
    from collections import Counter
    cp=Counter(tuple(int(v) for v in a[y,x,:3]) for y,x in zip(*np.where(l==PIEL)))
    tonos={c for c,n in cp.items() if n>=5}
    pi0=(l==PIEL); cerca_=pi0.copy()
    for _ in range(2): cerca_|=vecinos4(cerca_)
    for y,x in zip(*np.where((l==RESTO)&(a[:,:,3]>0)&cerca_)):
        c=tuple(int(v) for v in a[y,x,:3])
        if c in tonos:
            h_,s_,v_=hsv(a[y,x])
            if h_*360<=40 and s_>=0.3: l[y,x]=PIEL
    # tonos de piel claros y saturados (la frente, las mejillas, los brazos) que quedaron sin marcar
    from collections import deque
    H,W=l.shape; cand=np.zeros((H,W),bool)
    for y,x in zip(*np.where(((l==RESTO)|(l==ARRIBA))&(a[:,:,3]>0))):
        c=a[y,x]; h_,s_,v_=hsv(c)
        if h_*360<=35 and 0.35<=s_<=0.8 and v_>=0.45 and int(c[0])>int(c[1])>int(c[2]): cand[y,x]=True
    vis=np.zeros_like(cand)
    for sy,sx in zip(*np.where(cand)):
        if vis[sy,sx]: continue
        q=deque([(sy,sx)]); vis[sy,sx]=True; comp=[]; toca=False
        while q:
            y,x=q.popleft(); comp.append((y,x))
            for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
                ny,nx=y+dy,x+dx
                if 0<=ny<H and 0<=nx<W:
                    if l[ny,nx]==PIEL: toca=True
                    if cand[ny,nx] and not vis[ny,nx]: vis[ny,nx]=True; q.append((ny,nx))
        if espalda and min(y for y,_ in comp)<yh: continue      # de espalda no hay cara: lo claro de la cabeza es el brillo del pelo
        if toca or (len(comp)>=15 and min(y for y,_ in comp)<yh):
            for y,x in comp: l[y,x]=PIEL
    for _ in range(3):
        cambio=False; pi=(l==PIEL)
        for y in range(1,min(yh+2,127)):
            for x in range(1,127):
                if l[y,x]!=RESTO or not a[y,x,3]: continue
                h_,s_,v_=hsv(a[y,x]); hd=h_*360
                if not ((hd<=40 or hd>=340) and v_>=0.3 and s_>=0.2): continue
                if int(pi[y-1,x])+int(pi[y+1,x])+int(pi[y,x-1])+int(pi[y,x+1])>=2: l[y,x]=PIEL; cambio=True
        if not cambio: break

def desplazo_cara(l,B,oy=None):
    """Cuánto está corrida la parte de abajo de la cara (donde va la barba) respecto de la base."""
    yh=B[2]; y0=(oy if oy else yh-12)-2; y1=yh-1
    m=(l==PIEL).copy(); mr=(B[1]==PIEL).copy()
    for mm in (m,mr): mm[:y0-3]=False; mm[y1+3:]=False
    if mr.sum()<25 or m.sum()<25: return [0,0]
    mejor=(10**9,0,0)
    for dy in range(-3,4):
        for dx in range(-3,4):
            d=int((np.roll(np.roll(mr,dy,0),dx,1)^m)[y0:y1].sum())
            if d<mejor[0] or (d==mejor[0] and abs(dx)+abs(dy)<abs(mejor[1])+abs(mejor[2])): mejor=(d,dx,dy)
    return [mejor[1],mejor[2]]

def armar(sx):
    cfg=SEXOS[sx]; velo=cfg.get('velo',[]); fijo=SOLO_PEINADO[sx]
    combos=[]
    for pn,pk in cfg['prendas']:
        hs=cfg['peinados'][:1] if pn in velo else ([(fijo[pn],dict(cfg['peinados'])[fijo[pn]])] if pn in fijo else cfg['peinados'])
        for hn,_ in hs: combos.append((pn,pk,hn,clave_directa(sx,pn,pk,hn)))
    claves=sorted({c[3] for c in combos}|{cfg['base']})
    prep={k:preparar(k) for k in claves}
    base=prep[cfg['base']]
    # todo apoyado sobre la base por la silueta de las piernas (así no salta al cambiar de ropa o de peinado)
    for k in claves:
        if k!=cfg['base']: prep[k]={v:alinear(prep[k][v],base[v],solo_cabeza=True) for v in VISTAS}
    n=len(combos); molde={}
    ojo_base={v:anclas(Image.fromarray(base[v][0]),base[v][1],base[v][2],base[v][3]).get('ojo_y') for v in VISTAS}
    hoja=np.zeros((128*n,128*4,4),np.uint8); reg=np.zeros((128*n,128*4),np.uint8); meta={}
    for i,(pn,pk,hn,k) in enumerate(combos):
        meta[f'{pn}|{hn}']={'fila':i,'v':{}}
        largo=hn in cfg.get('largos',[]) and pn not in velo
        for j,v in enumerate(VISTAS):
            P=prep[k][v]
            if largo: P=pelo_largo(P)
            a,l=P[0].copy(),P[1].copy()
            if pn in velo: l[l==PELO]=RESTO          # con velo no hay pelo para recolorear
            piel_pareja(a,l,base[v])
            corte=P[2]-1
            if not largo and pn not in velo:
                q=(l==PELO); q[:corte]=False; l[q]=RESTO   # pelo corto: bajo los hombros no hay pelo
                pelo_por_paleta(a,l,base[v],False)
            # prenda de color: el pelo no puede salirse mucho de donde está en la versión gris del mismo peinado
            # (PixelLab usa los mismos tonos para el pelo y el buzo bordó o negro; la gris no tiene esa confusión);
            # y lo que en la gris es tela segura enseña cuáles son los tonos de la tela
            tipo=pn.split(':')[0]; mm=None; seguro=None
            if ':' in pn and pn.endswith(('bordo','negro','azul')) and (tipo,hn,v) in molde:   # solo la ropa oscura se confunde con el pelo
                mm=molde[(tipo,hn,v)].copy()
                for _ in range(2 if pn.endswith(('bordo','negro')) else 4): mm|=vecinos4(mm)
                seguro=(a[:,:,3]>0)&~mm&(l!=PIEL); seguro[:P[2]-2]=False
            if pn not in velo: pelo_estricto(a,l,P[2],P[3],largo,v=='north')
            piel_cara(a,l,P[2],v=='north')
            if ':' in pn and pn.endswith(':gris'): molde[(tipo,hn,v)]=(l==PELO)
            elif mm is not None: fuera=(l==PELO)&~mm; fuera[:P[2]-8]=False; l[fuera]=RESTO   # en la cabeza no hay ropa: solo se limpia de los hombros para abajo
            anc=anclas(Image.fromarray(a),l,base[v][2],P[3])
            cejas(l,anc)
            anc['acc']=desplazo_cara(l,base[v],ojo_base.get(v))   # la barba de m_acc está dibujada sobre la cara de la base: se corre a la cara de este dibujo
            hoja[i*128:(i+1)*128,j*128:(j+1)*128]=a; reg[i*128:(i+1)*128,j*128:(j+1)*128]=l
            meta[f'{pn}|{hn}']['v'][v]=anc
    if sx=='m':
        acc=accesorios(prep,base); ah=np.zeros((128*3,128*4,4),np.uint8)
        for j,v in enumerate(VISTAS):
            for kk,nom in enumerate(('barba','anteojos','cruz')): ah[kk*128:(kk+1)*128,j*128:(j+1)*128]=acc[v][nom]
        Image.fromarray(ah).save(OUT+'m_acc.png',optimize=True)
    Image.fromarray(hoja).save(OUT+sx+'.png',optimize=True)
    r=np.zeros((*reg.shape,4),np.uint8); r[:,:,0]=reg*30; r[:,:,3]=255
    Image.fromarray(r).save(OUT+sx+'_reg.png',optimize=True)
    return meta,hoja,reg

if __name__=='__main__':
    todo={}
    vistas=[]
    for sx in ('m','f'):
        meta,hoja,reg=armar(sx); todo[sx]={'prendas':[p for p,_ in SEXOS[sx]['prendas']],'peinados':[h for h,_ in SEXOS[sx]['peinados']],'fijo':SOLO_PEINADO[sx],'combos':meta}
        print(sx,len(meta),'combinaciones')
        vistas.append((hoja,reg))
    json.dump(todo,open(OUT+'pj.json','w'),separators=(',',':'))
    if len(sys.argv)>1:
        PAL=np.array([[0,0,0,0],[60,60,60,255],[240,170,120,255],[150,60,200,255],[60,200,90,255],[60,110,230,255],[230,200,40,255],[230,60,60,255]],np.uint8)
        imgs=[]
        for hoja,reg in vistas:
            col=PAL[reg]; both=np.concatenate([hoja,col],1); imgs.append(Image.fromarray(both))
        W=sum(im.width for im in imgs)+20; Hh=max(im.height for im in imgs)
        o=Image.new('RGBA',(W,Hh),(24,26,32,255)); x=0
        for im in imgs: o.alpha_composite(im,(x,0)); x+=im.width+20
        o=o.resize((o.width*2,o.height*2),Image.NEAREST); o.save(sys.argv[1])
    print('listo')
