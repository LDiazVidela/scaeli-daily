#!/usr/bin/env python3
# 2.6 · Barbas (él) y caras (él y ella) del joven, como capas sobre la cara de siempre.
# PixelLab (Edit image · Pixen, 1 generación cada una, 18/11/2026) editó el dibujo «deportiva|base» (herramientas/pixellab_extra/
# atleta_south.png y atleta_f_south.png): los originales están en herramientas/pixellab_caras/. Acá se saca de cada uno solo lo
# que cambió en la cara (la diferencia con el dibujo base) y se arma assets/personaje/extras.png: una fila de celdas de 40×40
# por capa — [color][máscara de piel] — más la celda de referencia (la cara base) de cada sexo. En pj.json queda «extras»
# (qué celda es cada capa) y, en cada dibujo del joven, «cara»: cuánto está corrida su cara respecto de la base.
# 2.7: la barba «corta» se rehízo (la primera era casi igual al candado: quedó como m_barba_fina_descartada.png).
# Uso: python3 herramientas/caras_barbas.py     (después de pj_armar / caras.py / consagrados_edades.py)
import json, os
import numpy as np
from PIL import Image
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); P=os.path.join(R,'assets','personaje'); O=os.path.join(R,'herramientas','pixellab_caras')
X0,Y0,N=44,8,40          # la caja de la cara dentro del cuadro de 128
T=45                      # cuánto tiene que cambiar un punto (suma de R, G y B) para contar
BASE={'m':'atleta_south.png','f':'atleta_f_south.png'}
# capa: (archivo, filas y columnas del cuadro donde se mira, mínimo de puntos pegados para no ser ruido)
CAPAS={'m':{'barba':[('corta','m_barba_corta',(19,47,46,82),4),('candado','m_barba_candado',(23,47,46,82),4),('bigote','m_barba_bigote',(23,29,52,76),4),('completa','m_barba_completa',(21,47,46,82),4)],
            'cara':[('anteojos','m_cara_anteojos',(15,25,48,80),1),('pecas','m_cara_pecas',(17,28,52,76),1),('cejas','m_cara_cejas',(16,22,53,75),1)]},
       'f':{'cara':[('anteojos','f_cara_anteojos',(15,25,48,80),1),('pecas','f_cara_pecas',(17,28,52,76),1),('rubor','f_cara_rubor',(17,27,52,76),1)]}}
def img(p): return np.array(Image.open(p).convert('RGBA')).astype(int)
def pegados(m,minimo):
    """saca los grupos de menos de «minimo» puntos (8 vecinos)"""
    if minimo<2: return m
    H,W=m.shape; visto=np.zeros_like(m); out=np.zeros_like(m)
    for y in range(H):
        for x in range(W):
            if not m[y,x] or visto[y,x]: continue
            pila=[(y,x)]; visto[y,x]=True; g=[]
            while pila:
                a,b=pila.pop(); g.append((a,b))
                for da in (-1,0,1):
                    for db in (-1,0,1):
                        c,d=a+da,b+db
                        if 0<=c<H and 0<=d<W and m[c,d] and not visto[c,d]: visto[c,d]=True; pila.append((c,d))
            if len(g)>=minimo:
                for a,b in g: out[a,b]=True
    return out
def main():
    M=json.load(open(os.path.join(P,'pj.json'))); celdas=[]; ex={'caja':[X0,Y0,N]}
    for sx in 'mf':
        hoja=img(os.path.join(P,sx+'.png')); piel=img(os.path.join(P,sx+'_piel.png')); C=M[sx]['combos']; f0=C['deportiva|base']['fila']
        base=img(os.path.join(R,'herramientas','pixellab_extra',BASE[sx])); ref=hoja[f0*128:(f0+1)*128]; assert (ref==base).all(), 'la base ya no es el dibujo deportiva|base'
        mp=piel[f0*128:(f0+1)*128,:,0]>=128; tonos=np.unique(base[mp][:,:3],axis=0)      # los colores de piel de la base
        L0=M[sx]['luz'][0]      # la sombra más oscura de la piel: más oscuro que eso es barba, ceja o marco, no piel
        def es_piel(c): return np.abs(tonos-c[:3]).sum(1).min()<=T and .299*c[0]+.587*c[1]+.114*c[2]>=L0-4
        E={'ref':len(celdas)}; celdas.append((base[Y0:Y0+N,X0:X0+N],None))
        for tipo,L in CAPAS[sx].items():
            E[tipo]={}
            for nom,arch,(ya,yb,xa,xb),minimo in L:
                v=img(os.path.join(O,arch+'.png')); d=np.abs(v[...,:3]-base[...,:3]).sum(2); d[(v[...,3]<128)!=(base[...,3]<128)]=999
                m=np.zeros((128,128),bool); m[ya:yb+1,xa:xb+1]=d[ya:yb+1,xa:xb+1]>T; m&=v[...,3]>=128; m=pegados(m,minimo)
                col=np.zeros((N,N,4),int); msk=np.zeros((N,N,4),int)
                for y in range(Y0,Y0+N):
                    for x in range(X0,X0+N):
                        if m[y,x]: col[y-Y0,x-X0]=(*v[y,x,:3],255); msk[y-Y0,x-X0]=(255,255,255,255) if es_piel(v[y,x]) else (0,0,0,255)
                assert not m[:Y0].any() and not m[Y0+N:].any() and not m[:,:X0].any() and not m[:,X0+N:].any()
                E[tipo][nom]=len(celdas); celdas.append((col,msk)); print(sx,tipo,nom,int(m.sum()),'puntos,',int((msk[...,0]>0).sum()),'de piel')
        ex[sx]=E
        # dónde está la cara en cada dibujo: el corrimiento con más puntos iguales a la base (ojos, nariz y boca)
        ya,yb,xa,xb=17,30,55,73; pat=ref[ya:yb,xa:xb,:3]
        for k,c in C.items():
            fr=hoja[c['fila']*128:(c['fila']+1)*128,:,:3]; mejor=(-1,0,0)
            for dy in range(-8,9):
                for dx in range(-6,7):
                    n=int((fr[ya+dy:yb+dy,xa+dx:xb+dx]==pat).all(2).sum())
                    if n>mejor[0]: mejor=(n,dx,dy)
            assert mejor[0]>=pat.shape[0]*pat.shape[1]*0.5, (sx,k,mejor)
            if mejor[1] or mejor[2]: c['cara']=[mejor[1],mejor[2]]
            else: c.pop('cara',None)
    sh=np.zeros((len(celdas)*N,2*N,4),np.uint8)
    for i,(col,msk) in enumerate(celdas):
        sh[i*N:(i+1)*N,:N]=col
        if msk is not None: sh[i*N:(i+1)*N,N:]=msk
    Image.fromarray(sh).save(os.path.join(P,'extras.png'),optimize=True)
    M['extras']=ex; json.dump(M,open(os.path.join(P,'pj.json'),'w'),ensure_ascii=False,separators=(',',':'))
    print('extras.png',sh.shape, ex)
if __name__=='__main__': main()
