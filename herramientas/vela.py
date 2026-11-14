# El isotipo de Daily: una vela encendida en pixel art (32×32), sin suavizado. Escribe assets/vela.png y los íconos.
from PIL import Image, ImageDraw
import math
W=H=32
K=(26,10,16,255)          # contorno
C=[(255,246,226),(244,230,200),(222,200,162),(186,160,120)]   # cera: luz → sombra
G=[(255,214,110),(245,184,58),(196,132,34),(132,82,22)]       # bronce del candelero
F=[(255,255,240),(255,236,140),(255,196,70),(240,124,40),(190,70,30)]  # llama: centro → borde
im=Image.new('RGBA',(W,H),(0,0,0,0)); p=im.load()
def px(x,y,c):
    if 0<=x<W and 0<=y<H: p[x,y]=c if len(c)==4 else c+(255,)
# halo (anillos suaves, sin tramado)
cx,cy=16,8
for y in range(H):
    for x in range(W):
        d=math.hypot(x-cx,(y-cy)*1.1)
        if d<9.5: px(x,y,(245,184,58,34 if d>7.2 else 62 if d>4.8 else 96))
# llama (gota)
llama={4:(16,16),5:(15,17),6:(15,17),7:(14,18),8:(14,18),9:(14,18),10:(15,17),11:(15,17)}
for y,(a,b) in llama.items():
    for x in range(a,b+1): px(x,y,F[3])
for y in range(5,11):
    a,b=llama[y]
    for x in range(a+1 if b-a>1 else a,b if b-a>1 else b+1): px(x,y,F[2])
for (x,y) in [(16,6),(16,7),(15,8),(16,8),(17,8),(16,9),(15,9),(16,10)]: px(x,y,F[1])
for (x,y) in [(16,8),(16,9)]: px(x,y,F[0])
px(16,3,F[4]); px(16,4,F[3]); px(14,10,F[4]); px(18,10,F[4])
px(16,12,K); px(16,11,(60,40,30))   # mecha
# vela
x0,x1,y0,y1=12,20,13,26
for y in range(y0,y1+1):
    for x in range(x0,x1+1):
        t=(x-x0)/(x1-x0)
        px(x,y,C[0] if t<0.25 else C[1] if t<0.55 else C[2] if t<0.85 else C[3])
for x in range(x0,x1+1): px(x,y0,C[0])
# chorreaditos
for (x,y) in [(13,14),(13,15),(13,16),(18,14),(18,15),(19,14)]: px(x,y,C[0])
# contorno de la vela
for y in range(y0,y1+1): px(x0-1,y,K); px(x1+1,y,K)
for x in range(x0,x1+1): px(x,y0-1,K)
px(x0,y0-1,K); px(15,y0-1,C[1]); px(16,y0-1,C[1]); px(17,y0-1,C[1])
px(16,y0-1,(60,40,30))
# candelero
for x in range(9,24): px(x,27,G[1])
for x in range(10,23): px(x,28,G[2])
for x in range(8,25): px(x,29,G[2])
for x in range(9,24): px(x,30,G[3])
for x in range(10,13): px(x,27,G[0])
for x in range(9,12): px(x,29,G[1])
for x in range(8,25): px(x,31,K)
px(8,27,K); px(24,27,K); px(7,29,K); px(25,29,K); px(8,30,K); px(24,30,K); px(9,28,K); px(23,28,K)
for x in range(9,24): px(x,26,K) if x<x0-1 or x>x1+1 else None
im.save('/home/claude/scaeli/scaeli-daily/assets/vela.png')
# íconos: fondo bordó con la vela al centro, escalada sin suavizado
BG=(64,14,30,255)
def icono(n,marg):
    k=max(1,(n-2*marg)//32); c=Image.new('RGBA',(n,n),BG); v=im.resize((32*k,32*k),Image.NEAREST); c.alpha_composite(v,((n-32*k)//2,(n-32*k)//2)); return c
D='/home/claude/scaeli/scaeli-daily/icons/'
icono(1024,96).save(D+'icon-1024.png'); icono(512,48).save(D+'icon-512.png'); icono(192,16).save(D+'icon-192.png'); icono(180,14).convert('RGB').save(D+'apple-touch-icon.png'); icono(512,112).save(D+'maskable-512.png')
im.resize((256,256),Image.NEAREST).save('/tmp/claude-0/-home-claude/eec8cc41-4079-58d6-a8ab-b95cf6a6c795/scratchpad/vela_x8.png')
print('ok')
