# Daily 2.1.2 · arma assets/cartas/ desde los dibujos hechos con Gemini (herramientas/gemini/): marco por rareza (recoloreado con CR de app.js), dorso, sobre y portada del álbum.
# Uso: python3 herramientas/cartas_gemini.py
import numpy as np, json, colorsys, os
from PIL import Image
from scipy import ndimage
import sys
RAIZ=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
OUT=os.path.join(RAIZ,'assets','cartas')+'/'; GEM=os.path.join(RAIZ,'herramientas','gemini')+'/'; os.makedirs(OUT,exist_ok=True)
CR={"gloria":{"met":["#FFFFFF","#F7EBCB","#D9B56A","#9C7330","#4A3410"],"gem":["#FFFFFF","#CFE6FF","#6E9BD8"]},
 "martir":{"met":["#FFF2E6","#F2C6A0","#C9874A","#7A4A1E","#2E1606"],"gem":["#FFD6D0","#E0283C","#5A0612"]},
 "oro":{"met":["#FFFBEA","#FBE3A0","#DDA544","#8E5A16","#3A2206"],"gem":["#FFF6D0","#F2B544","#8A4E0A"]},
 "plata":{"met":["#FFFFFF","#E8EDF4","#B4BECC","#6A7586","#232A35"],"gem":["#E6F4FF","#4C8BE0","#122E66"]}}
hx=lambda h:np.array([int(h[i:i+2],16) for i in (1,3,5)],float)
def fondo_blanco(a,thr=235):
    w=(a[:,:,:3].min(2)>thr); lab,n=ndimage.label(w); borde=set(lab[0])|set(lab[-1])|set(lab[:,0])|set(lab[:,-1]); borde.discard(0)
    return np.isin(lab,list(borde))
# 1) marco
a=np.array(Image.open(GEM+'marco.png').convert('RGB')).astype(int)
bg=fondo_blanco(a); ys,xs=np.where(~bg); a=a[ys.min():ys.max()+1, xs.min():xs.max()+1]; bg=bg[ys.min():ys.max()+1, xs.min():xs.max()+1]
r,g,b=a[:,:,0],a[:,:,1],a[:,:,2]
verde=(g>r+50)&(g>b+50)
H,W=verde.shape; print('marco',W,H)
vy,vx=np.where(verde); gb=(vx.min(),vy.min(),vx.max()+1,vy.max()+1)
# medallón: zona oscura poco saturada abajo al centro
L=(r*.3+g*.59+b*.11)
osc=(L<90)&~verde; lab,n=ndimage.label(osc); 
cands=[(abs(c[1]-W/2)+abs(c[0]-H*0.93),i) for i,c in enumerate(ndimage.center_of_mass(osc,lab,range(1,n+1)),1) if (lab==i).sum()>300]
mi=min(cands)[1]; my,mx=ndimage.center_of_mass(lab==mi); mr=np.sqrt((lab==mi).sum()/np.pi)
alpha=np.where(bg|verde,0,255)
# alisar borde verde: píxeles casi verdes de transición
hsv=np.array([colorsys.rgb_to_hsv(*(p/255)) for p in a.reshape(-1,3)]).reshape(H,W,3)
gema=((hsv[:,:,0]<0.03)|(hsv[:,:,0]>0.12))&(hsv[:,:,1]>0.35)&~verde&(L>40)
gema[int(H*0.12):]=False   # la gema solo está arriba
Ln=np.clip((L-np.percentile(L[alpha>0],2))/(np.percentile(L[alpha>0],98)-np.percentile(L[alpha>0],2)),0,1)
geo={}
S=252/W, 386/H
geo['panel']=[round(gb[0]*S[0],1),round(gb[1]*S[1],1),round((gb[2]-gb[0])*S[0],1),round((gb[3]-gb[1])*S[1],1)]
geo['num']=[round(mx*S[0],1),round(my*S[1],1),round(mr*S[0],1)]
print(geo)
for t,c in CR.items():
    M=[hx(x) for x in c['met'][::-1]]; st=[0,.3,.55,.78,1]
    G=[hx(x) for x in c['gem'][::-1]]
    out=np.zeros((H,W,4),np.uint8); col=np.zeros((H,W,3))
    for ch in range(3):
        col[:,:,ch]=np.interp(Ln,st,[m[ch] for m in M])
        gc=np.interp(Ln,[0,.5,1],[x[ch] for x in G]); col[:,:,ch]=np.where(gema,gc,col[:,:,ch])
    out[:,:,:3]=col.astype(np.uint8); out[:,:,3]=alpha
    Image.fromarray(out,'RGBA').resize((504,772),Image.LANCZOS).save(OUT+f'marco-{t}.png',optimize=True)
print('medidas para css/app.css (.carta .panel y .cnum):',geo)
# 2) dorso
d=np.array(Image.open(GEM+'dorso.png').convert('RGB')).astype(int); bg=fondo_blanco(d,200); ys,xs=np.where(~bg)
Image.fromarray(d[ys.min():ys.max()+1, xs.min():xs.max()+1].astype(np.uint8)).resize((504,772),Image.LANCZOS).save(OUT+'dorso.webp',quality=88)
# 3) sobre
s=np.array(Image.open(GEM+'sobre.png').convert('RGB')).astype(int); bg=fondo_blanco(s); ys,xs=np.where(~bg)
o=np.zeros(s.shape[:2]+(4,),np.uint8); o[:,:,:3]=s; o[:,:,3]=np.where(bg,0,255); o=o[ys.min():ys.max()+1, xs.min():xs.max()+1]
im=Image.fromarray(o,'RGBA'); print('sobre',im.size); im.resize((452,int(452*im.height/im.width)),Image.LANCZOS).save(OUT+'sobre.png',optimize=True)
# 4) portada del álbum
Image.open(GEM+'album.png').convert('RGB').resize((1032,576),Image.LANCZOS).save(OUT+'album.webp',quality=86)
