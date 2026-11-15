# Daily 2.1.2 · la misma cara en todos los dibujos del personaje: pega píxel a píxel la cara del deportivo (fila 'deportiva|base' de m.png)
# y de la deportiva (f.png) sobre cada dibujo de PixelLab, alineada por los ojos, sin tocar pelo, velo ni ropa, e iguala el tono de piel.
# Las hojas sin caras pegadas están en el commit 522a719 (Daily 2.1.1). Uso: python3 herramientas/caras.py
import json, numpy as np
from PIL import Image
from scipy import ndimage
import os
R=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','assets','personaje')+'/'
pj=json.load(open(R+'pj.json'))
def hoja(sx): return np.array(Image.open(R+sx+'.png').convert('RGBA'))
def fila(H,sx,k): f=pj[sx]['combos'][k]['fila']; return H[f*128:f*128+128].copy()
def piel(a):
    r,g,b=[a[:,:,i].astype(int) for i in range(3)]
    return (a[:,:,3]>0)&(r>140)&(r>g)&(g>b)&(r-b>60)
def mascara(D, y0, y1):
    m=piel(D); m[:y0]=0; m[y1:]=0
    m=ndimage.binary_closing(m,iterations=2); m=ndimage.binary_fill_holes(m)
    return m
def pegar(T, D, M):
    # alinear por ojos: probar desplazamientos
    best=None
    for dy in range(-4,5):
        for dx in range(-4,5):
            Ms=np.roll(np.roll(M,dy,0),dx,1); Ds=np.roll(np.roll(D,dy,0),dx,1)
            ok=Ms&(T[:,:,3]>0)
            if ok.sum()<50: continue
            e=np.abs(T[:,:,:3].astype(int)-Ds[:,:,:3].astype(int)).sum(2)[ok].mean() + 300*(1-(ok.sum()/Ms.sum()))
            if best is None or e<best[0]: best=(e,dx,dy)
    _,dx,dy=best
    Ms=np.roll(np.roll(M,dy,0),dx,1); Ds=np.roll(np.roll(D,dy,0),dx,1)
    # no pisar pelo del destino: colores oscuros-marrones que no son piel ni rasgos del deportivo
    out=T.copy(); use=Ms&(T[:,:,3]>0)
    out[use]=Ds[use]
    return out,(dx,dy)
def pegar2(T, D, M, caja):
    best=None
    for dy in range(-4,5):
        for dx in range(-4,5):
            Ms=np.roll(np.roll(M,dy,0),dx,1); Ds=np.roll(np.roll(D,dy,0),dx,1)
            ok=Ms&(T[:,:,3]>0)
            if ok.sum()<50: continue
            e=np.abs(T[:,:,:3].astype(int)-Ds[:,:,:3].astype(int)).sum(2)[ok].mean() + 300*(1-(ok.sum()/Ms.sum()))
            if best is None or e<best[0]: best=(e,dx,dy)
    _,dx,dy=best
    Ms=np.roll(np.roll(M,dy,0),dx,1); Ds=np.roll(np.roll(D,dy,0),dx,1)
    y0,y1,x0,x1=caja; B=np.zeros_like(M); B[y0+dy:y1+dy,x0+dx:x1+dx]=1
    use=Ms&(T[:,:,3]>0)&(piel(T)|B)
    out=T.copy(); out[use]=Ds[use]; return out,(dx,dy)
def tono(out, D, pegado):
    from collections import Counter
    dm=piel(D); c=Counter(map(tuple,D[dm][:,:3].tolist())); P=np.array([k for k,v in c.items() if v>=20],int)
    L=lambda a:(a[...,0]*.3+a[...,1]*.59+a[...,2]*.11)
    m=piel(out)&~pegado&(out[:,:,0]>=185)
    if not m.any(): return out
    px=out[m][:,:3].astype(int); d=np.abs(L(px)[:,None]-L(P)[None,:]); out=out.copy()
    v=out[m]; v[:,:3]=P[d.argmin(1)]; out[m]=v; return out
def procesar(sx, T, D, M, caja):
    o,(dx,dy)=pegar2(T,D,M,caja)
    peg=(o!=T).any(2)
    return tono(o,D,peg)
CFG={'m':(16,31,(17,29,56,70)),'f':(14,31,(15,29,56,71))}
if __name__=='__main__':
    for sx in 'mf':
        H=hoja(sx); D=fila(H,sx,'deportiva|base'); y0,y1,caja=CFG[sx]; M=mascara(D,y0,y1)
        for k,v in pj[sx]['combos'].items():
            if k=='deportiva|base': continue
            H[v['fila']*128:v['fila']*128+128]=procesar(sx,fila(H,sx,k),D,M,caja)
        Image.fromarray(H,'RGBA').save(R+sx+'.png',optimize=True); print(sx,'listo')
