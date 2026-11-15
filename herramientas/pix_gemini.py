import numpy as np, sys
from PIL import Image
def a_sprite(path, ref=None):
    a=np.array(Image.open(path).convert('RGB')).astype(int)
    H,W,_=a.shape
    # fase de la grilla: bordes horizontales y verticales
    dx=(np.abs(np.diff(a,axis=1)).sum(2)>40).sum(0); dy=(np.abs(np.diff(a,axis=0)).sum(2)>40).sum(1)
    best=lambda v:max(range(8),key=lambda p:v[p::8].sum())
    px,py=(best(dx)+1)%8,(best(dy)+1)%8
    n_x=(W-px)//8; n_y=(H-py)//8
    out=np.zeros((n_y,n_x,4),np.uint8)
    for j in range(n_y):
        for i in range(n_x):
            cell=a[py+j*8+2:py+j*8+6, px+i*8+2:px+i*8+6].reshape(-1,3)
            c=np.median(cell,0).astype(int)
            out[j,i,:3]=c; out[j,i,3]=255
    # fondo: solo el blanco conectado con el borde (la ropa blanca queda)
    from collections import deque
    blanco=(out[:,:,:3].astype(int).sum(2)>=735); vis=np.zeros_like(blanco); q=deque()
    for j in range(n_y):
        for i in (0,n_x-1): q.append((j,i))
    for i in range(n_x):
        for j in (0,n_y-1): q.append((j,i))
    while q:
        j,i=q.popleft()
        if 0<=j<n_y and 0<=i<n_x and blanco[j,i] and not vis[j,i]:
            vis[j,i]=1; q.extend([(j+1,i),(j-1,i),(j,i+1),(j,i-1)])
    out[vis.astype(bool),3]=0
    im=Image.fromarray(out,'RGBA'); bb=im.getbbox(); sp=im.crop(bb)
    return sp
if __name__=='__main__':
    sp=a_sprite(sys.argv[1]); print(sp.size)
def a_cuadro(sp, base=125, cx=63):
    fr=Image.new('RGBA',(128,128),(0,0,0,0))
    w,h=sp.size; fr.alpha_composite(sp,(cx-w//2, base-h)); return fr
def comparar(frames, out, esc=4, fondo=(40,24,30)):
    W=len(frames)*128*esc; im=Image.new('RGBA',(W,128*esc),fondo+(255,))
    for i,f in enumerate(frames): im.alpha_composite(f.resize((128*esc,128*esc),Image.NEAREST),(i*128*esc,0))
    im.convert('RGB').save(out)
def a_paleta(fr, refs, extra=0):
    # cada píxel al color más cercano de la paleta de PixelLab (el dibujo viejo + el deportivo): pixel art limpio
    pal=sorted({p[:3] for r in refs for p in r.getdata() if p[3]>200})
    P=np.array(pal,int); a=np.array(fr).astype(int); m=a[:,:,3]>0
    px=a[m][:,:3]; d=((px[:,None,:]-P[None,:,:])**2).sum(2); a[m,:3]=P[d.argmin(1)]
    return Image.fromarray(a.astype(np.uint8),'RGBA')
def a_kmeans(fr,k=32):
    rgb=fr.convert('RGB').quantize(colors=k,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).convert('RGB')
    out=rgb.convert('RGBA'); out.putalpha(fr.getchannel('A')); return out
