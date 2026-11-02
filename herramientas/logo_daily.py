# Íconos y logo de Daily a partir de herramientas/logo_daily_original.png (el arco con la escalera y la vela).
# Ícono: la escena del arco sobre el azul del fondo (sin texto); logo de entrada: la placa completa con «Scaeli Daily».
from PIL import Image, ImageFilter, ImageDraw
import numpy as np
D='/home/claude/scaeli/scaeli-daily/'
im=Image.open(D+'herramientas/logo_daily_original.png').convert('RGB')
FONDO=(13,33,70)
def icono(n, margen=0.10):
    esc=im.crop((322,182,934,770)); w,h=esc.size
    a=np.array(esc); borde=np.concatenate([a[:6].reshape(-1,3),a[-6:].reshape(-1,3),a[:,:6].reshape(-1,3),a[:,-6:].reshape(-1,3)]); fondo=tuple(int(x) for x in np.median(borde,0))
    m=Image.new('L',(w,h),0); ImageDraw.Draw(m).rectangle((40,40,w-40,h-40),fill=255); m=m.filter(ImageFilter.GaussianBlur(26))
    c=Image.new('RGB',(n,n),fondo); s=n*(1-2*margen)/w; e=esc.resize((round(w*s),round(h*s)),Image.LANCZOS); mm=m.resize(e.size,Image.LANCZOS)
    c.paste(e,((n-e.width)//2,(n-e.height)//2),mm); return c
icono(1024).save(D+'icons/icon-1024.png'); icono(512).save(D+'icons/icon-512.png'); icono(192).save(D+'icons/icon-192.png')
icono(180).save(D+'icons/apple-touch-icon.png'); icono(512,0.2).save(D+'icons/maskable-512.png')
placa=im.crop((213,163,1043,1093)).resize((415,465),Image.LANCZOS); placa.save(D+'assets/logo-daily.png',optimize=True)
print('listo')
