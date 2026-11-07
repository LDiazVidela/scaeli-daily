import json, base64, math
D='/tmp/claude-0/-home-claude/eec8cc41-4079-58d6-a8ab-b95cf6a6c795/scratchpad/'
J=json.load(open(D+'santos/santos.json'))
FONTS=open(D+'fuentes/fuentes.css').read()
def img(k): return 'data:image/png;base64,'+base64.b64encode(open(D+'santos_c/'+k+'.png','rb').read()).decode()
DIM=json.load(open(D+'santos_c/dims.json'))

# rareza: nombre, pips, metal (brillo, luz, medio, sombra, filo), gema (luz, medio, sombra), cielo (centro, medio, borde), nubes, panel, texto
R={
 'gloria':dict(nm='Gloria',p=4,met=['#FFFFFF','#F7EBCB','#D9B56A','#9C7330','#4A3410'],gem=['#FFFFFF','#CFE6FF','#6E9BD8'],sky=['#FFF3D2','#7FA6E0','#1C2A5E'],nub='#F4E6C8',pn='#0E1328',tx='#F6EFDD',acc='#F2D27A'),
 'martir':dict(nm='Mártir',p=3,met=['#FFF2E6','#F2C6A0','#C9874A','#7A4A1E','#2E1606'],gem=['#FFD6D0','#E0283C','#5A0612'],sky=['#FFD2A8','#C8463E','#3A0A14'],nub='#E9A08A',pn='#16070B',tx='#F4E4DC',acc='#F2B07A'),
 'oro':dict(nm='Oro',p=2,met=['#FFFBEA','#FBE3A0','#DDA544','#8E5A16','#3A2206'],gem=['#FFF6D0','#F2B544','#8A4E0A'],sky=['#FFF0C8','#E6A24A','#4A2408'],nub='#F0C887',pn='#130E07',tx='#F4EBD8',acc='#F2C562'),
 'plata':dict(nm='Plata',p=1,met=['#FFFFFF','#E8EDF4','#B4BECC','#6A7586','#232A35'],gem=['#E6F4FF','#4C8BE0','#122E66'],sky=['#EEF5FF','#8AA6CC','#1C2A40'],nub='#C9D6E8',pn='#0C1118',tx='#E9EEF5',acc='#C9D6E8'),
}
SIM={'gloria':'<circle cx="0" cy="0" r="5.6" fill="none" stroke="#fff" stroke-width="1.8"/><circle r="1.8" fill="#fff"/>',
 'martir':'<path d="M0 7V-2" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><path d="M0-2C-1.6-5.4-5-6.6-7.4-5.8-4.8-5.2-2.4-3.8 0-2zM0-2C1.6-5.4 5-6.6 7.4-5.8 4.8-5.2 2.4-3.8 0-2zM0 1.6C-1.6-.6-4.4-1.2-6.2-.6-4.2-.2-2 .6 0 1.6zM0 1.6C1.6-.6 4.4-1.2 6.2-.6 4.2-.2 2 .6 0 1.6z" fill="#fff"/>',
 'oro':'<path d="M0-7V7M-4.6-2.6H4.6" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>',
 'plata':'<path d="M0-6.6l1.9 4.6 5 .4-3.8 3.3 1.2 4.9L0 3.9l-4.3 2.7 1.2-4.9-3.8-3.3 5-.4z" fill="#fff"/>'}

cards=[('miguel','gloria','Arcángel','¿Quién como Dios?',1),('virgenmaria','gloria','Madre de Dios','Hágase en mí según tu palabra',2),
 ('francisco','oro','Fundador','Paz y bien',17),('teresita','oro','Doctora de la Iglesia','Mi vocación es el amor',24),
 ('kolbe','martir','Mártir de Auschwitz','Solo el amor crea',41),('brochero','oro','El cura gaucho','Dios es así: nos busca hasta encontrarnos',33),
 ('carlo','oro','Patrono de internet','La Eucaristía es mi autopista al cielo',38),('ceferino','plata','Beato argentino','Quiero ser útil a mi gente',66)]

def rr(x,y,w,h,r):  # rectángulo redondeado como trazo
    return f'M{x+r} {y}H{x+w-r}A{r} {r} 0 0 1 {x+w} {y+r}V{y+h-r}A{r} {r} 0 0 1 {x+w-r} {y+h}H{x+r}A{r} {r} 0 0 1 {x} {y+h-r}V{y+r}A{r} {r} 0 0 1 {x+r} {y}Z'
W,H=252,386
ARCO='M6 0 H206 A6 6 0 0 1 212 6 V216 A6 6 0 0 1 206 222 H6 A6 6 0 0 1 0 216 V6 A6 6 0 0 1 6 0 Z'   # ventana 212×196
def rosa(cols):
    o=[]
    for i in range(16):
        a=math.radians(i*22.5)
        o.append(f'<path d="M0 0L{90*math.cos(a-.17):.1f} {90*math.sin(a-.17):.1f}A90 90 0 0 1 {90*math.cos(a+.17):.1f} {90*math.sin(a+.17):.1f}Z" fill="{cols[i%3]}"/>')
    o.append(''.join(f'<circle cx="{58*math.cos(math.radians(i*45+11)):.1f}" cy="{58*math.sin(math.radians(i*45+11)):.1f}" r="15" fill="{cols[(i+1)%3]}"/>' for i in range(8)))
    o.append(f'<circle r="26" fill="{cols[0]}"/><g fill="none" stroke="#000" stroke-opacity=".55" stroke-width="2.6"><circle r="90"/><circle r="26"/>'+''.join(f'<circle cx="{58*math.cos(math.radians(i*45+11)):.1f}" cy="{58*math.sin(math.radians(i*45+11)):.1f}" r="15"/>' for i in range(8))+''.join(f'<path d="M0 0L{90*math.cos(math.radians(i*22.5)-.17):.1f} {90*math.sin(math.radians(i*22.5)-.17):.1f}"/>' for i in range(16))+'</g>')
    return ''.join(o)

def esquina(id):
    # voluta de esquina (arriba a la izquierda), se refleja con transform
    return f'''<g class="esq" transform="translate(3 3) scale(.62)"><path d="M8 52 C8 24 22 10 52 8 C40 14 30 20 26 30 C22 26 16 26 14 32 C12 38 18 42 22 38 C20 44 14 48 8 52Z" fill="url(#me{id})" stroke="url(#fi{id})" stroke-width="1"/>
<path d="M18 18 C24 12 32 10 40 10" fill="none" stroke="url(#fi{id})" stroke-width=".8" opacity=".8"/><circle cx="17" cy="17" r="3.4" fill="url(#ge{id})" stroke="url(#fi{id})" stroke-width=".8"/></g>'''

def card(k,t,tag,fr,num):
    r=R[t]; n=J[k]['n']; f=J[k]['f']; m=r['met']; g=r['gem']; s=r['sky']; i=f'{t}{num}'
    largo=' largo' if len(n)>21 else ''
    pips=''.join(f'<polygon points="{x},{-3.6} {x+3},{0} {x},{3.6} {x-3},{0}" fill="url(#ge{i})" stroke="url(#fi{i})" stroke-width=".6"/>' for x in [(-(r['p']-1)*4.5)+j*9 for j in range(r['p'])])
    defs=f'''<defs>
<linearGradient id="me{i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{m[1]}"/><stop offset=".18" stop-color="{m[0]}"/><stop offset=".32" stop-color="{m[2]}"/><stop offset=".5" stop-color="{m[3]}"/><stop offset=".64" stop-color="{m[1]}"/><stop offset=".8" stop-color="{m[2]}"/><stop offset="1" stop-color="{m[3]}"/></linearGradient>
<linearGradient id="mv{i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{m[0]}"/><stop offset=".45" stop-color="{m[2]}"/><stop offset=".55" stop-color="{m[3]}"/><stop offset="1" stop-color="{m[1]}"/></linearGradient>
<linearGradient id="fi{i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{m[4]}"/><stop offset="1" stop-color="{m[4]}"/></linearGradient>
<radialGradient id="ge{i}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="{g[0]}"/><stop offset=".45" stop-color="{g[1]}"/><stop offset="1" stop-color="{g[2]}"/></radialGradient>
<pattern id="tr{i}" width="9" height="9" patternUnits="userSpaceOnUse"><path d="M4.5 1.2a2 2 0 0 1 0 3.3 2 2 0 0 1 0 3.3M1.2 4.5a2 2 0 0 1 3.3 0 2 2 0 0 1 3.3 0" fill="none" stroke="{m[4]}" stroke-opacity=".45" stroke-width=".7"/><circle cx="4.5" cy="4.5" r=".7" fill="{m[4]}" fill-opacity=".5"/></pattern>
</defs>'''
    marco=f'''<svg class="marco" viewBox="0 0 {W} {H}">{defs}
<path d="{rr(0,0,W,H,16)} {rr(13,13,W-26,H-26,8)}" fill-rule="evenodd" fill="url(#me{i})"/>
<path d="{rr(4,4,W-8,H-8,13)} {rr(11,11,W-22,H-22,9)}" fill-rule="evenodd" fill="url(#tr{i})"/>
<path d="{rr(.5,.5,W-1,H-1,15.5)}" fill="none" stroke="{m[4]}" stroke-width="1"/>
<path d="{rr(1.5,1.5,W-3,H-3,14.5)}" fill="none" stroke="{m[0]}" stroke-opacity=".8" stroke-width="1"/>
<path d="{rr(4,4,W-8,H-8,13)}" fill="none" stroke="{m[4]}" stroke-opacity=".55" stroke-width=".8"/>
<path d="{rr(11,11,W-22,H-22,9)}" fill="none" stroke="{m[0]}" stroke-opacity=".9" stroke-width="1"/>
<path d="{rr(13,13,W-26,H-26,8)}" fill="none" stroke="{m[4]}" stroke-width="1.6"/>
{esquina(i)}<g transform="translate({W} 0) scale(-1 1)">{esquina(i)}</g><g transform="translate(0 {H}) scale(1 -1)">{esquina(i)}</g><g transform="translate({W} {H}) scale(-1 -1)">{esquina(i)}</g>
<!-- cresta -->
<g transform="translate({W/2} 12)">
 <path d="M-46 0 C-34 0 -26 -2 -20 -8 L20 -8 C26 -2 34 0 46 0 C34 3 26 6 20 12 L-20 12 C-26 6 -34 3 -46 0Z" fill="url(#mv{i})" stroke="{m[4]}" stroke-width="1"/>
 <path d="M0 -20 L17 0 L0 22 L-17 0Z" fill="url(#mv{i})" stroke="{m[4]}" stroke-width="1.2"/>
 <path d="M0 -14 L11.5 0 L0 15.5 L-11.5 0Z" fill="url(#ge{i})" stroke="{m[4]}" stroke-width=".8"/>
 <path d="M0 -14 L11.5 0 L0 -2Z" fill="#fff" fill-opacity=".35"/><path d="M0 15.5 L-11.5 0 L0 2Z" fill="#000" fill-opacity=".25"/>
 <g transform="scale(.82)">{SIM[t]}</g>
</g>
<!-- pie -->
<g transform="translate({W/2} {H-12})">
 <path d="M-70 0 H-22 M22 0 H70" stroke="url(#mv{i})" stroke-width="7" stroke-linecap="round"/><path d="M-70 0 H-22 M22 0 H70" stroke="{m[4]}" stroke-width=".8" stroke-opacity=".7"/>
 <g transform="translate(-46 0)">{pips if t!='x' else ''}</g>
 <g opacity=".9"><path d="M-30 4 C-26 -6 -20 -12 -12 -14 M30 4 C26 -6 20 -12 12 -14" fill="none" stroke="url(#mv{i})" stroke-width="2.2"/>
  {''.join(f'<ellipse cx="{sx*(28-j*5):.1f}" cy="{(-1-j*3.2):.1f}" rx="3.4" ry="1.6" transform="rotate({sx*(-50+j*12)} {sx*(28-j*5):.1f} {(-1-j*3.2):.1f})" fill="url(#mv{i})" stroke="{m[4]}" stroke-width=".4"/>' for sx in (-1,1) for j in range(4))}</g>
 <circle r="17" fill="url(#mv{i})" stroke="{m[4]}" stroke-width="1"/><circle r="13" fill="{r['pn']}" stroke="{m[0]}" stroke-opacity=".7" stroke-width=".8"/>
 <text y="4.4" text-anchor="middle" class="num" fill="{m[1]}">{num}</text>
 <text x="48" y="2.6" text-anchor="middle" class="set" fill="{m[4]}">SCAELI</text>
</g>
</svg>'''
    nubes=''.join(f'<i style="left:{x}px;bottom:{b}px;width:{w}px;height:{h}px"></i>' for x,b,w,h in [(-30,30,120,46),(130,26,130,50),(40,14,140,40),(-20,0,110,34),(150,0,100,34)])
    ventana=f'''<div class="arte"><svg width="0" height="0" style="position:absolute"><clipPath id="ar{i}"><path d="{ARCO}"/></clipPath></svg>
 <div class="ventana" style="clip-path:url(#ar{i})">
  <div class="cielo"></div>
  <svg class="rosa" viewBox="-100 -100 200 200">{rosa([s[0],r['acc'],s[1]])}</svg>
  <div class="haz"></div><div class="rayos"></div>
  <svg class="catedral" viewBox="0 0 212 40" preserveAspectRatio="none"><path d="M0 40V30h14v-8h6v8h10V18l5-8 5 8v12h12V24h8v6h20V12l4-10 4 10v18h22V20l6-8 6 8v10h16v-6h8v6h12V18l5-8 5 8v12h10v-8h6v8h14v10z"/></svg>
  <div class="nubes">{nubes}</div>
  <div class="aura"></div>
  <div class="polvo">{''.join('<i></i>' for _ in range(12))}</div>
  <div class="piso"></div>
  <img class="refl" src="{img(k)}" alt="" style="width:{DIM[k][0]*4}px;height:{DIM[k][1]*4}px;bottom:{-DIM[k][1]*4+22}px"><img class="pj" src="{img(k)}" alt="" style="width:{DIM[k][0]*4}px;height:{DIM[k][1]*4}px">
  <div class="vig"></div>
 </div>
 <svg class="arco" viewBox="-6 -6 224 234"><path d="{ARCO}" fill="none" stroke="url(#mv{i})" stroke-width="5"/><path d="{ARCO}" fill="none" stroke="{m[4]}" stroke-width="1"/>
  <path d="M4 4 H208 V218 H4 Z" fill="none" stroke="{m[0]}" stroke-opacity=".35" stroke-width=".8"/></svg>
</div>'''
    return f'''<div class="carta r-{t}" style="--m0:{m[0]};--m1:{m[1]};--m2:{m[2]};--m3:{m[3]};--m4:{m[4]};--s0:{s[0]};--s1:{s[1]};--s2:{s[2]};--nub:{r['nub']};--pn:{r['pn']};--tx:{r['tx']};--acc:{r['acc']}">
 <div class="panel"><div class="damasco"></div>{ventana}
  <div class="placa{largo}"><span class="o">✠</span><b>{n}</b><span class="o">✠</span></div>
  <div class="fiesta"><span class="l"></span>{f}<span class="l"></span></div>
  <div class="tag">{tag}</div>
  <div class="frase"><span class="q">«</span>{fr}<span class="q c">»</span></div>
 </div>
 {marco}
 <div class="brillo"></div>{'<div class="holo"></div><div class="chispas"><i></i><i></i><i></i><i></i><i></i></div>' if t=='gloria' else ''}
</div>'''

CSS=FONTS+r'''
*{box-sizing:border-box}
body{margin:0;background:radial-gradient(ellipse at 50% -10%,#262a38,#08090c 62%);font-family:Helvetica,Arial;color:#F3F1EC;padding:44px 40px 50px;width:1220px}
h1{font-family:Cinzel,serif;font-weight:800;font-size:32px;letter-spacing:.08em;margin:0 0 6px;background:linear-gradient(180deg,#FFF6D8,#E9B54E 60%,#9A6418);-webkit-background-clip:text;background-clip:text;color:transparent}
p.s{font-family:"Cormorant Garamond";font-style:italic;font-size:19px;color:#B9B3A6;margin:0 0 48px}
.g{display:grid;grid-template-columns:repeat(4,252px);gap:52px 34px}
.carta{position:relative;width:252px;height:386px;filter:drop-shadow(0 22px 24px rgba(0,0,0,.65)) drop-shadow(0 2px 2px rgba(0,0,0,.6))}
.r-gloria{filter:drop-shadow(0 22px 24px rgba(0,0,0,.65)) drop-shadow(0 0 22px rgba(255,236,180,.45))}
.marco{position:absolute;left:0;top:0;width:252px;height:386px;overflow:visible;pointer-events:none}
.marco .num{font-family:Cinzel;font-weight:800;font-size:12.5px}
.marco .set{font-family:Cinzel;font-weight:800;font-size:6.4px;letter-spacing:.32em}
.panel{position:absolute;left:13px;top:13px;width:226px;height:360px;border-radius:8px;overflow:hidden;background:radial-gradient(ellipse at 50% 85%,color-mix(in srgb,var(--s2) 55%,var(--pn)),var(--pn) 70%)}
.damasco{position:absolute;inset:0;opacity:.07;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='28' height='34' viewBox='0 0 28 34'><path d='M14 3c3 4 3 7 0 10-3-3-3-6 0-10zM14 13c4-2 7-1 8 2-3 1-6 0-8-2zM14 13c-4-2-7-1-8 2 3 1 6 0 8-2zM14 13v8M11 21h6' fill='none' stroke='white' stroke-width='1'/></svg>")}
.arte{position:absolute;left:7px;top:14px;width:212px;height:222px}
.ventana{position:absolute;inset:0;overflow:hidden}
.cielo{position:absolute;inset:0;background:radial-gradient(ellipse 80% 70% at 50% 34%,var(--s0) 0%,var(--s1) 38%,var(--s2) 100%)}
.rosa{position:absolute;left:50%;top:92px;width:200px;height:200px;transform:translate(-50%,-50%);opacity:.38;mix-blend-mode:soft-light}
.haz{position:absolute;left:50%;top:-20px;width:120px;height:240px;transform:translateX(-50%);background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,0) 80%);clip-path:polygon(36% 0,64% 0,100% 100%,0 100%);mix-blend-mode:overlay}
.rayos{position:absolute;left:50%;top:92px;width:520px;height:520px;transform:translate(-50%,-50%);background:repeating-conic-gradient(rgba(255,255,255,.2) 0 3deg,transparent 3deg 11deg);-webkit-mask:radial-gradient(circle,#000 5%,transparent 50%);mask:radial-gradient(circle,#000 5%,transparent 50%);mix-blend-mode:screen}
.catedral{position:absolute;left:0;right:0;bottom:22px;width:100%;height:30px;fill:color-mix(in srgb,var(--s2) 75%,#000);opacity:.55}
.nubes i{position:absolute;border-radius:50%;background:radial-gradient(ellipse at 50% 40%,color-mix(in srgb,var(--nub) 85%,#fff),color-mix(in srgb,var(--nub) 50%,transparent) 55%,transparent 72%);filter:blur(2px);opacity:.75}
.aura{position:absolute;left:50%;top:88px;width:136px;height:136px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.95) 0,color-mix(in srgb,var(--s0) 85%,transparent) 26%,transparent 66%)}
.aura::before{content:"";position:absolute;inset:26px;border-radius:50%;border:1.5px solid color-mix(in srgb,var(--m0) 90%,transparent);box-shadow:0 0 8px var(--m1),inset 0 0 8px var(--m1)}
.aura::after{content:"";position:absolute;inset:16px;border-radius:50%;border:1px dashed color-mix(in srgb,var(--m1) 60%,transparent)}
.polvo i{position:absolute;width:2px;height:2px;border-radius:50%;background:#fff;box-shadow:0 0 5px 1px rgba(255,255,255,.8)}
.polvo i:nth-child(1){left:22px;top:58px}.polvo i:nth-child(2){left:40px;top:118px}.polvo i:nth-child(3){right:28px;top:48px;width:3px;height:3px}.polvo i:nth-child(4){right:40px;top:126px}.polvo i:nth-child(5){left:66px;top:28px}.polvo i:nth-child(6){right:64px;top:22px}.polvo i:nth-child(7){left:26px;top:150px}.polvo i:nth-child(8){right:22px;top:92px;width:3px;height:3px}.polvo i:nth-child(9){left:96px;top:12px}.polvo i:nth-child(10){left:52px;top:80px;opacity:.6}.polvo i:nth-child(11){right:52px;top:70px;opacity:.6}.polvo i:nth-child(12){right:90px;top:150px;opacity:.5}
.piso{position:absolute;left:-10px;right:-10px;bottom:0;height:24px;background:linear-gradient(180deg,color-mix(in srgb,var(--m2) 30%,#2a241c),#0c0a08);box-shadow:inset 0 1px 0 color-mix(in srgb,var(--m0) 70%,transparent)}
.piso::before{content:"";position:absolute;left:50%;top:-2px;width:150px;height:14px;transform:translateX(-50%);border-radius:50%;background:radial-gradient(ellipse,rgba(255,255,255,.4),transparent 70%)}
.pj{position:absolute;left:50%;bottom:20px;transform:translateX(-50%);image-rendering:pixelated;filter:drop-shadow(0 0 1px rgba(255,255,255,.7)) drop-shadow(0 0 6px color-mix(in srgb,var(--s0) 70%,transparent))}
.refl{position:absolute;left:50%;transform:translateX(-50%) scaleY(-1);image-rendering:pixelated;opacity:.22;-webkit-mask:linear-gradient(0deg,#000 75%,transparent 92%);mask:linear-gradient(0deg,#000 75%,transparent 92%);filter:blur(.4px)}
.vig{position:absolute;inset:0;box-shadow:inset 0 0 28px rgba(0,0,0,.55);pointer-events:none}
.arco{position:absolute;left:-6px;top:-6px;width:224px;height:234px;overflow:visible;filter:drop-shadow(0 2px 2px rgba(0,0,0,.6))}
.placa{position:absolute;left:4px;right:4px;top:226px;height:38px;display:flex;align-items:center;justify-content:center;gap:8px;border-radius:4px;
  background:linear-gradient(180deg,color-mix(in srgb,var(--pn) 70%,#000),var(--pn));box-shadow:0 0 0 1px var(--m4),0 0 0 2.5px var(--m1),0 0 0 3.5px var(--m4),0 6px 10px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.12)}
.placa b{font-family:Cinzel,serif;font-weight:800;font-size:13.5px;letter-spacing:.04em;line-height:1.05;text-align:center;
  background:linear-gradient(180deg,var(--m0) 0%,var(--m1) 35%,var(--m2) 60%,var(--m1) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 1px 0 rgba(0,0,0,.8))}
.placa.largo b{font-size:11px}
.placa .o{font-size:10px;color:var(--m2);opacity:.85}
.fiesta{position:absolute;left:0;right:0;top:272px;display:flex;align-items:center;justify-content:center;gap:9px;font-family:Cinzel;font-weight:600;font-size:9px;letter-spacing:.2em;color:var(--m1);text-transform:uppercase}
.fiesta .l{width:26px;height:1px;background:linear-gradient(90deg,transparent,var(--m1))}.fiesta .l:last-child{transform:scaleX(-1)}
.tag{position:absolute;left:0;right:0;top:285px;text-align:center;font-family:"Cormorant Garamond";font-weight:600;font-size:12px;letter-spacing:.06em;color:var(--acc);opacity:.95}
.frase{position:absolute;left:16px;right:16px;top:300px;text-align:center;font-family:"Cormorant Garamond",Georgia,serif;font-style:italic;font-weight:500;font-size:16px;line-height:1.1;color:var(--tx)}
.frase .q{font-family:Cinzel;font-style:normal;color:var(--m1);font-size:15px;margin:0 2px;opacity:.9}
.brillo{position:absolute;inset:0;border-radius:16px;pointer-events:none;background:linear-gradient(118deg,transparent 34%,rgba(255,255,255,.13) 42%,rgba(255,255,255,0) 50%);mix-blend-mode:screen}
.holo{position:absolute;inset:0;border-radius:16px;pointer-events:none;mix-blend-mode:color-dodge;opacity:.38;
  background:linear-gradient(125deg,transparent 14%,rgba(255,100,190,.55) 26%,rgba(255,226,120,.6) 34%,rgba(110,236,255,.6) 42%,rgba(160,120,255,.55) 50%,transparent 60%),repeating-linear-gradient(55deg,rgba(255,255,255,.06) 0 2px,transparent 2px 5px)}
.chispas i{position:absolute;width:16px;height:16px;background:#fff;clip-path:polygon(50% 0,57% 43%,100% 50%,57% 57%,50% 100%,43% 57%,0 50%,43% 43%);filter:drop-shadow(0 0 5px #fff)}
.chispas i:nth-child(1){left:-6px;top:70px}.chispas i:nth-child(2){right:-7px;top:160px;width:11px;height:11px}.chispas i:nth-child(3){right:36px;top:-7px;width:10px;height:10px}.chispas i:nth-child(4){left:30px;bottom:-5px;width:9px;height:9px}.chispas i:nth-child(5){left:120px;top:110px;width:8px;height:8px;opacity:.8}
'''
html='<!doctype html><html><head><meta charset="utf-8"><style>'+CSS+'</style></head><body><h1>Álbum de santos</h1><p class="s">Cartas de colección con los santos del juego Scaeli · Gloria, Mártir, Oro y Plata</p><div class="g">'+''.join(card(*c) for c in cards)+'</div></body></html>'
open(D+'cartas5.html','w').write(html); print('ok')
