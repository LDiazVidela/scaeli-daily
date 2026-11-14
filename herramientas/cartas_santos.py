# Genera data/cartas.js y assets/santos/*.png para el Álbum de santos (Daily 1.11).
# Fuente: herramientas/santos_juego.json (nombre, fiesta, rareza del juego y bio, sacados del juego Scaeli)
#         y herramientas/santos_png/*.png (dibujos de PixelLab del juego, recortados al contorno; no se retocan).
# Uso: python3 herramientas/cartas_santos.py
import json, os, shutil
B = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(B)
J = json.load(open(B + '/santos_juego.json')); DIM = json.load(open(B + '/santos_png/dims.json'))
FUERA = {'cruzado', 'cristo', 'papafrancisco', 'benedicto', 'leon14'}
GLORIA = ['virgenmaria', 'miguel', 'gabriel', 'rafael', 'jp2']
# etiqueta corta y frase de la carta (citas conocidas del santo o un versículo que lo resume)
TF = {
 'virgenmaria': ('Madre de Dios', 'Hágase en mí según tu palabra'),
 'miguel': ('Arcángel', '¿Quién como Dios?'),
 'gabriel': ('Arcángel', 'Alégrate, llena de gracia'),
 'rafael': ('Arcángel', 'Bendigan a Dios y denle gracias'),
 'jp2': ('Papa, amigo de los jóvenes', 'No tengan miedo: abran las puertas a Cristo'),
 'reymago': ('Adorador del Niño', 'Vimos su estrella y venimos a adorarlo'),
 'juanbautista': ('El Precursor', 'Él tiene que crecer y yo disminuir'),
 'pedro': ('Príncipe de los apóstoles', 'Señor, tú sabes que te quiero'),
 'pablo': ('Apóstol de los gentiles', 'Para mí la vida es Cristo'),
 'juan': ('El discípulo amado', 'Dios es amor'),
 'abraham': ('Padre en la fe', 'Dios proveerá'),
 'moises': ('Profeta y guía del pueblo', 'Aquí estoy'),
 'francisco': ('El pobre de Asís', 'Paz y bien'),
 'carlo': ('Patrono de internet', 'La Eucaristía es mi autopista al cielo'),
 'teresita': ('Doctora de la Iglesia', 'Mi vocación es el amor'),
 'brochero': ('El cura gaucho', 'Ya tengo los aperos listos para el viaje'),
 'bosco': ('Padre de la juventud', 'Basta que sean jóvenes para que los ame'),
 'jose': ('Custodio de Jesús', 'Vayan a José'),
 'teresa': ('Madre de los pobres', 'Hagan cosas pequeñas con gran amor'),
 'antula': ('Mama Antula', 'Andar hasta donde Dios no sea conocido'),
 'cayetano': ('Patrono del pan y del trabajo', 'Busquen primero el Reino de Dios'),
 'ignacio': ('Fundador de los jesuitas', 'En todo amar y servir'),
 'javier': ('Patrono de las misiones', '¿De qué sirve ganar el mundo entero?'),
 'avila': ('Doctora de la Iglesia', 'Solo Dios basta'),
 'clara': ('Madre de las clarisas', 'Mira, considera, contempla'),
 'rosa': ('Patrona de América', 'Fuera de la cruz no hay escala al cielo'),
 'porres': ('Fray Escoba', 'Yo te curo, Dios te sana'),
 'tomas': ('Doctor Angélico', 'Nada sino a ti, Señor'),
 'antonio': ('Doctor evangélico', 'Cesen las palabras, hablen las obras'),
 'benito': ('Padre de los monjes', 'Reza y trabaja'),
 'pio': ('El Padre Pío', 'Reza, espera y no te preocupes'),
 'faustina': ('Apóstol de la Misericordia', 'Jesús, en ti confío'),
 'juana': ('La doncella de Orleans', 'Que Dios me guarde en su gracia'),
 'agustin': ('Doctor de la gracia', 'Nos hiciste, Señor, para ti'),
 'jeronimo': ('Traductor de la Biblia', 'Ignorar las Escrituras es ignorar a Cristo'),
 'ambrosio': ('Obispo de Milán', 'Donde está Pedro, allí está la Iglesia'),
 'crisostomo': ('Boca de oro', 'Gloria a Dios por todo'),
 'atanasio': ('Defensor de la fe', 'El Verbo se hizo hombre'),
 'andres': ('El primer llamado', 'Hemos encontrado al Mesías'),
 'santiago': ('Patrono de España', 'Podemos'),
 'frassati': ('Joven de las bienaventuranzas', '¡Hacia lo alto!'),
 'josegregorio': ('Médico de los pobres', 'Estuve enfermo y me visitaron'),
 'rendiles': ('Fundadora venezolana', 'Todo lo puedo en aquel que me fortalece'),
 'bartololongo': ('Apóstol del Rosario', 'Si buscas salvarte, propaga el Rosario'),
 'isabel': ('Madre del Bautista', 'Bendita tú entre las mujeres'),
 'marta': ('Amiga de Jesús', 'Yo creo que tú eres el Mesías'),
 'mariabetania': ('La que escucha', 'María eligió la mejor parte'),
 'lazaro': ('El amigo de Jesús', '¡Lázaro, sal afuera!'),
 'samaritana': ('Testigo junto al pozo', 'Señor, dame de esa agua'),
 'magdalena': ('Apóstol de los apóstoles', 'He visto al Señor'),
 'natanael': ('Apóstol', 'Tú eres el Hijo de Dios'),
 'kolbe': ('Mártir de Auschwitz', 'Solo el amor crea'),
 'lorenzo': ('Diácono y mártir', 'Estos son los tesoros de la Iglesia'),
 'esteban': ('El primer mártir', 'Señor, no les tengas en cuenta este pecado'),
 'sebastian': ('Soldado de Cristo', 'Sé fiel hasta la muerte'),
 'ines': ('Virgen y mártir', 'Pertenezco a Cristo'),
 'cecilia': ('Patrona de los músicos', 'Cantaba a Dios en su corazón'),
 'tarcisio': ('Mártir de la Eucaristía', 'Yo soy el pan vivo bajado del cielo'),
 'joselito': ('Mártir cristero', '¡Viva Cristo Rey!'),
 'tomasmoro': ('Patrono de los políticos', 'Siervo del rey, pero primero de Dios'),
 'romero': ('La voz de los sin voz', 'Sentir con la Iglesia'),
 'angelelli': ('Obispo de La Rioja', 'Un oído en el pueblo y otro en el Evangelio'),
 'torot': ('Catequista mártir', 'Vayan y hagan discípulos'),
 'lucia': ('Luz de Siracusa', 'Soy sierva del Dios eterno'),
 'pastor': ('Testigo del pesebre', 'Vayamos a Belén'),
 'chiaracorbella': ('Esposa y madre', 'Nacimos y no moriremos nunca más'),
 'negromanuel': ('Servidor de la Virgen de Luján', 'Soy de la Virgen nomás'),
 'gaudi': ('El arquitecto de Dios', 'Mi cliente no tiene apuro'),
 'lejeune': ('Médico de la vida', 'Cuidar al más débil'),
 'talbot': ('Obrero de Dublín', 'Te basta mi gracia'),
 'shaw': ('Empresario cristiano', 'Lo hicieron conmigo'),
 'benitaarias': ('Fundadora porteña', 'Los amó hasta el fin'),
 'camilarolon': ('Fundadora en Mercedes', 'Sirvan al Señor con alegría'),
 'lauravicuna': ('Beata de la Patagonia', 'Te ofrezco mi vida por mi mamá'),
 'chiarabadano': ('Beata de la luz', 'Si lo querés vos, Jesús, lo quiero yo'),
 'pironio': ('Cardenal de la esperanza', 'Alégrense en la esperanza'),
 'esquiu': ('Fraile de Catamarca', 'Felices los pobres de corazón'),
 'carlosaustria': ('El emperador de la paz', 'Que se haga tu voluntad'),
 'ceferino': ('Beato argentino', 'Quiero ser útil a mi gente'),
}
def rar(k, v):
    if k in GLORIA: return 'gloria'
    if v['r'] == 'martir': return 'martir'
    if v['r'] in ('especial', 'epica'): return 'plata'
    return 'oro'
def fiesta(k, v):
    if v['f']: return v['f']
    n = v['n']
    for p in ('Sierva de Dios', 'Siervo de Dios', 'Venerable', 'Beato', 'Beata'):
        if n.startswith(p): return p
    return 'Nuevo Testamento'
L = [k for k in J if k not in FUERA]
orden = {'gloria': 0, 'oro': 1, 'martir': 2, 'plata': 3}
L.sort(key=lambda k: (orden[rar(k, J[k])], GLORIA.index(k) if k in GLORIA else 0))
assert len(L) == 79 and all(k in TF for k in L), [k for k in L if k not in TF]
os.makedirs(R + '/assets/santos', exist_ok=True)
out = []
for i, k in enumerate(L):
    v = J[k]; shutil.copy(B + '/santos_png/' + k + '.png', R + '/assets/santos/' + k + '.png')
    out.append({'id': k, 'i': i + 1, 'n': v['n'], 'f': fiesta(k, v), 'r': rar(k, v), 'tag': TF[k][0], 'fr': TF[k][1], 'bio': v['bio'], 'w': DIM[k][0], 'h': DIM[k][1]})
open(R + '/data/cartas.js', 'w').write('// GENERADO por herramientas/cartas_santos.py: no editar a mano\nexport const CARTAS=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
from collections import Counter; print(len(out), Counter(c['r'] for c in out))
