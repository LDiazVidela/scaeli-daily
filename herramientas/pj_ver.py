# Hoja de control: algunas combinaciones en frente/perfil/espalda. Uso: python3 pj_ver.py salida.png
import sys, json
from PIL import Image
D='/home/claude/scaeli/scaeli-daily/assets/personaje/'
M=json.load(open(D+'pj.json'))
casos={'m':['base|base','base|corto','base|largo','remera:gris|base','remera:blanco|base','remera:negro|corto','buzo:bordo|largo','camisa:azul|base','camisa:negro|corto'],
       'f':['base|base','base|suelto','base|corto','remera:blanco|base','remera:negro|suelto','buzo:azul|corto','pollera:bordo|base','pollera:gris|suelto','buzo:blanco|base']}
filas=[]
for sx in ('m','f'):
    h=Image.open(D+sx+'.png')
    for c in casos[sx]:
        f=M[sx]['combos'][c]['fila']; filas.append((sx+' '+c,h.crop((0,f*128,128*3,(f+1)*128))))
W=len(filas[0][1].getbbox() and filas[0][1].size and [0])
o=Image.new('RGBA',(9*3*96,2*128),(24,26,32,255))
for i,(n,im) in enumerate(filas):
    sx=0 if i<9 else 1; k=i%9
    for j in range(3): o.alpha_composite(im.crop((j*128+16,0,j*128+112,128)),((k*3+j)*96,sx*128))
o=o.resize((o.width*2,o.height*2),Image.NEAREST); o.save(sys.argv[1])
