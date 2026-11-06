from PIL import Image, ImageDraw
import math
N=64; im=Image.new('RGB',(N,N)); d=ImageDraw.Draw(im); px=im.load()
# paleta
S=[(12,16,44),(18,22,60),(30,26,70),(46,30,72),(38,24,52)]
ST=[(246,236,214),(222,206,176),(184,166,136),(132,116,96),(86,74,64),(44,36,40)]
G=[(255,246,200),(255,222,130),(242,181,68),(200,130,40),(140,84,24)]
B=[(170,100,52),(136,76,36),(104,54,24),(72,36,16),(44,22,10)]
C=[(255,236,196),(246,206,140),(220,166,104),(176,122,84),(120,82,72),(70,48,56)]
R=[(214,62,58),(160,32,34),(100,16,20)]
PG=[(252,244,222),(226,212,176)]
# cielo con dither entre bandas
for y in range(N):
    t=y/N*4.2; i=int(t); f=t-i
    for x in range(N):
        a=S[min(i,4)]; b=S[min(i+1,4)]
        px[x,y]= b if (f>0.5 and (x+y)%2==0) or f>0.75 else a
for (x,y) in [(8,7),(55,6),(60,18),(5,22),(15,3),(48,4),(58,30)]: px[x,y]=(240,214,140)
cx,cy=32,27
# luz dentro del arco (bandas concéntricas)
for y in range(8,52):
    for x in range(14,51):
        dx,dy=x-cx,(y-cy)*1.0
        inside = (y>=cy and 15<=x<=49) or (dx*dx+dy*dy<=17.5**2 and y<cy)
        if not inside: continue
        r=math.hypot(dx,(y-30)*0.9)
        col = G[0] if r<6 else G[1] if r<10 else G[2] if r<14 else G[3] if r<18 else G[4]
        # rayos
        ang=math.degrees(math.atan2(-(y-34),dx))
        if r>=10 and int((ang+90)/14)%2==0: col = G[min(4,[G[0],G[1],G[2],G[3],G[4]].index(col)-1 if col!=G[0] else 0)]
        px[x,y]=col
# halo fuera del arco
for y in range(0,56):
    for x in range(N):
        r=math.hypot(x-cx,y-29)
        if 23<r<27 and px[x,y] in S: px[x,y]=(58,36,70) if r<25 else px[x,y]
# arco: anillo entre r=17.5 y 23
for y in range(0,cy+1):
    for x in range(N):
        r=math.hypot(x-cx,y-cy)
        if 17.5<r<=23:
            sh= 0 if (x-cx)<-6 and r<21 else 1 if r<20.5 else 2 if (x-cx)<0 else 3
            px[x,y]=ST[sh]
        if 22.5<r<=23.8 or 17<r<=17.9: px[x,y]=ST[5]
# juntas de las dovelas
for a in (25,55,125,155):
    for k in range(18,23):
        x=round(cx+k*math.cos(math.radians(a))); y=round(cy-k*math.sin(math.radians(a))); px[x,y]=ST[4]
# clave
d.rectangle((29,3,35,9),fill=ST[0],outline=ST[5]); d.line((30,9,34,9),fill=ST[2])
# columnas
for x0 in (8,50):
    d.rectangle((x0-1,cy,x0+7,cy+2),fill=ST[1],outline=ST[5])
    d.rectangle((x0,cy+3,x0+6,57),fill=ST[2],outline=ST[5])
    d.line((x0+1,cy+3,x0+1,57),fill=ST[1]); d.line((x0+5,cy+3,x0+5,57),fill=ST[3])
    d.rectangle((x0+2,cy+6,x0+4,cy+18),fill=(46,32,40))
    px[x0+3,cy+10]=G[2]; px[x0+3,cy+11]=G[1]; px[x0+3,cy+12]=G[1]; px[x0+3,cy+13]=G[2]
# nubes
import random; random.seed(3)
for (x,y,r,c) in [(4,56,9,3),(16,54,8,2),(27,55,8,1),(38,54,8,1),(49,55,8,2),(60,56,9,3),(10,60,9,2),(32,60,12,1),(54,60,9,2)]:
    d.ellipse((x-r,y-r*0.65,x+r,y+r*0.65),fill=C[c])
for (x,y,r) in [(16,52,5),(28,52,5),(38,51,5),(48,52,5)]:
    d.ellipse((x-r,y-r*0.55,x+r,y+r*0.55),fill=C[0])
for y in range(58,N):
    for x in range(N):
        if px[x,y] in C: 
            k=C.index(px[x,y]); px[x,y]=C[min(5,k+ (1 if y>=60 else 0) + (1 if y>=62 else 0))]
# libro de 3/4: lomo con nervios dorados a la izquierda, cantos de páginas a la derecha y abajo
bx0,by0,bx1,by1=22,19,41,44
d.rectangle((bx0+3,by1,bx1+2,by1+2),fill=PG[1]); d.line((bx0+4,by1+1,bx1+1,by1+1),fill=PG[0])
d.rectangle((bx1,by0+2,bx1+2,by1+1),fill=PG[1]); d.line((bx1+1,by0+3,bx1+1,by1),fill=PG[0])
d.rectangle((bx0,by0,bx1,by1),fill=B[1])
d.line((bx0+4,by0+1,bx1-1,by0+1),fill=B[0]); d.line((bx1-1,by0+1,bx1-1,by1-1),fill=B[2]); d.line((bx0+4,by1-1,bx1-1,by1-1),fill=B[2])
d.rectangle((bx0,by0,bx0+3,by1+2),fill=B[3]); d.line((bx0+1,by0+1,bx0+1,by1+1),fill=B[2])
for yy in (by0+3,by0+9,by1-9,by1-3): d.line((bx0,yy,bx0+3,yy),fill=G[3]); d.line((bx0+1,yy,bx0+2,yy),fill=G[2])
# esquineros dorados
for (x,y,sx,sy) in [(bx0+5,by0+2,1,1),(bx1-2,by0+2,-1,1),(bx0+5,by1-2,1,-1),(bx1-2,by1-2,-1,-1)]:
    px[x,y]=G[2]; px[x+sx,y]=G[2]; px[x,y+sy]=G[2]; px[x+2*sx,y]=G[3]; px[x,y+2*sy]=G[3]
# cruz centrada en la tapa
mx=(bx0+4+bx1)//2; my=by0+11
d.rectangle((mx-1,my-6,mx+1,my+10),fill=G[2]); d.rectangle((mx-5,my-2,mx+5,my),fill=G[2])
d.line((mx-1,my-6,mx-1,my+10),fill=G[1]); d.line((mx-5,my-2,mx+5,my-2),fill=G[1])
d.line((mx+1,my-5,mx+1,my+10),fill=G[3]); d.line((mx-4,my,mx+5,my),fill=G[3]); px[mx-1,my-6]=G[0]; px[mx-5,my-2]=G[0]
# cinta
d.rectangle((bx1-7,by1+2,bx1-5,by1+8),fill=R[0]); d.line((bx1-5,by1+2,bx1-5,by1+8),fill=R[1]); px[bx1-6,by1+8]=R[2]
# contorno
mask=Image.new('1',(N,N)); md=ImageDraw.Draw(mask)
md.rectangle((bx0,by0,bx1+2,by1+2),fill=1); md.rectangle((bx1-7,by1+2,bx1-5,by1+8),fill=1)
m=mask.load()
for y in range(N):
    for x in range(N):
        if not m[x,y] and any(0<=x+a<N and 0<=y+b<N and m[x+a,y+b] for a,b in ((1,0),(-1,0),(0,1),(0,-1))): px[x,y]=(30,14,8)
px[bx1+2,by0+1]=(30,14,8)
# destellos
for (x,y,c) in [(15,15,(255,246,210)),(49,13,(255,246,210)),(46,30,(255,250,230))]:
    px[x,y]=c; px[x-1,y]=px[x+1,y]=px[x,y-1]=px[x,y+1]=G[1]
im.resize((1024,1024),Image.NEAREST).save('pix.png')
