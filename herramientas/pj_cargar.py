# Carga las 4 vistas (south, east, north, west) de cada variante de PixelLab desde scala-paquete/pixellab/<clave>.zip.
import glob, os, zipfile
from PIL import Image
ZIPS='/home/claude/scaeli/scala-paquete/pixellab/'
S=os.environ.get('PJ','/tmp/claude-0/-home-claude/eec8cc41-4079-58d6-a8ab-b95cf6a6c795/scratchpad/pj')
VISTAS=['south','east','north','west']
def cargar(k):
    d=f'{S}/{k}'
    if not glob.glob(f'{d}/**/rotations/south.png',recursive=True):
        os.makedirs(d,exist_ok=True); zipfile.ZipFile(ZIPS+k+'.zip').extractall(d)
    out={}
    for v in VISTAS:
        g=glob.glob(f'{d}/**/rotations/{v}.png',recursive=True)
        out[v]=Image.open(g[0]).convert('RGBA')
    return out
