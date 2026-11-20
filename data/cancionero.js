// Cancionero de Scaeli Daily (2.4). Solo cantos de dominio público: tradicionales, gregorianos o de autores
// muertos hace más de 70 años. Los cantos modernos (Gabaráin, Kiko, Kairoi, etc.) tienen derechos y NO van acá:
// cada uno puede cargar los suyos en «Mis cantos» (quedan en su dispositivo).
// Los acordes son una armonización sencilla hecha para Scaeli (cifrado americano; la app los muestra en Do Re Mi y los transporta).
// Formato: [Acorde] delante de la sílaba donde cae · una línea en blanco separa estrofas · «> » al empezar la línea = estribillo.
// mo (2.9): el momento de la Misa en que se canta (CANTOS_MOM); el primero es el principal. Solo cantos litúrgicos:
// los villancicos de fiesta (Los peces en el río, Campana sobre campana, A la nanita nana, Ay del chiquirritín) se sacaron en la 2.9.
// cat: adviento · navidad · cuaresma · pascua · eucaristia · maria · espiritu · alabanza        lat: 1 = en latín
export const CANTOS_CAT = [["adviento", "Adviento"], ["navidad", "Navidad"], ["cuaresma", "Cuaresma"], ["pascua", "Pascua"], ["eucaristia", "Eucaristía"], ["maria", "María"], ["espiritu", "Espíritu Santo"], ["alabanza", "Alabanza"]];
export const CANTOS_MOM = [["entrada", "Entrada"], ["piedad", "Señor, ten piedad"], ["gloria", "Gloria"], ["evangelio", "Antes del Evangelio"], ["credo", "Credo"], ["ofrendas", "Ofrendas"], ["santo", "Santo"], ["padrenuestro", "Padrenuestro"], ["cordero", "Cordero de Dios"], ["comunion", "Comunión"], ["salida", "Salida"], ["adoracion", "Adoración eucarística"]];
export const CANTOS = [
  { id: "noche-de-paz", t: "Noche de paz", a: "F. Gruber (1818) · letra tradicional en español", cat: ["navidad"], mo: ["comunion", "salida"], ton: "G", l:
`[G]Noche de paz, noche de amor,
[D7]todo duerme [G]en derredor.
[C]Entre los astros que es[G]parcen su luz,
[C]bella anunciando al ni[G]ñito Jesús,
[D7]brilla la estrella de [G]paz,
[G]brilla la es[D7]trella de [G]paz.

[G]Noche de paz, noche de amor,
[D7]oye humilde el [G]fiel pastor
[C]coros celestes que a[G]nuncian salud,
[C]gracias y glorias en [G]gran plenitud,
[D7]por nuestro buen Reden[G]tor,
[G]por nuestro [D7]buen Reden[G]tor.

[G]Noche de paz, noche de amor,
[D7]ved qué bello [G]resplandor
[C]luce en el rostro del [G]niño Jesús,
[C]en el pesebre, del [G]mundo la luz,
[D7]astro de eterno ful[G]gor,
[G]astro de e[D7]terno ful[G]gor.` },
  { id: "venid-fieles", t: "Venid, fieles todos", a: "Adeste fideles · J. F. Wade (s. XVIII) · versión tradicional", cat: ["navidad"], mo: ["entrada"], ton: "G", l:
`Ve[G]nid, fieles [D]todos, a Be[G]lén mar[D]chemos,
de [Em]gozo triun[A7]fantes, hen[D]chidos [A7]de a[D]mor.
Y al [G]Rey de los [D7]cie[G]los hu[C]mildes ve[D]remos.

> Ve[G]nid, adoremos; ve[G]nid, ado[D]remos;
> ve[C]nid, ado[G]re[Am]mos a [G]nuestro [D7]Se[G]ñor.

El [G]que es Hijo e[D]terno del e[G]terno [D]Padre,
y [Em]Dios verda[A7]dero que al [D]mundo [A7]cre[D]ó,
al [G]seno hu[D7]mil[G]de vi[C]no de una [D]madre.

En [G]pobre pe[D]sebre yace [G]recli[D]nado,
al [Em]hombre o[A7]frece e[D]terna [A7]salva[D]ción
el [G]santo Me[D7]sí[G]as, el [C]Verbo humi[D]llado.` },
  { id: "adeste-fideles", t: "Adeste fideles", a: "J. F. Wade (s. XVIII)", cat: ["navidad"], mo: ["entrada", "comunion"], ton: "G", lat: 1, l:
`A[G]deste fi[D]deles, [G]laeti trium[D]phantes,
ve[Em]nite, ve[A7]nite in [D]Beth[A7]le[D]hem.
[G]Natum vi[D7]de[G]te [C]Regem ange[D]lorum.

> Ve[G]nite adoremus, ve[G]nite ado[D]remus,
> ve[C]nite ado[G]re[Am]mus [G]Do[D7]mi[G]num.

En [G]grege re[D]licto, [G]humiles ad [D]cunas
vo[Em]cati pas[A7]tores ap[D]pro[A7]pe[D]rant.
[G]Et nos o[D7]van[G]ti [C]gradu festi[D]nemus.

Ae[G]terni Pa[D]rentis [G]splendorem ae[D]ternum
ve[Em]latum sub [A7]carne vi[D]de[A7]bi[D]mus,
[G]Deum in[D7]fan[G]tem, [C]pannis invo[D]lutum.` },
  { id: "veni-emmanuel", t: "Veni, veni, Emmanuel", a: "Himno latino de Adviento (antífonas «O»)", cat: ["adviento"], mo: ["entrada"], ton: "Em", lat: 1, l:
`[Em]Veni, veni, Em[Am]ma[D]nu[Em]el,
cap[Em]tivum [Am]solve [Bm]Isra[Em]el,
qui [Am]gemit in ex[Em]si[D]lio,
pri[Em]vatus [Am]De[Bm]i Fi[Em]lio.

> [D]Gaude! [Bm]Gaude! Em[Em]manuel
> nas[Am]cetur [Bm]pro te, [Em]Israel.

[Em]Veni, o Sa[Am]pi[D]en[Em]tia,
quae [Em]hic dis[Am]ponis [Bm]omni[Em]a,
ve[Am]ni, viam pru[Em]den[D]tiae
ut [Em]doce[Am]as et [Bm]glori[Em]ae.

[Em]Veni, veni, [Am]o [D]Ori[Em]ens,
so[Em]lare [Am]nos ad[Bm]veni[Em]ens,
noc[Am]tis depelle [Em]ne[D]bulas,
di[Em]rasque [Am]mortis [Bm]tene[Em]bras.

[Em]Veni, Clavis [Am]Da[D]vi[Em]dica,
reg[Em]na re[Am]clude [Bm]caeli[Em]ca,
fac [Am]iter tutum [Em]su[D]perum,
et [Em]claude [Am]vias [Bm]infe[Em]rum.` },
  { id: "perdona-a-tu-pueblo", t: "Perdona a tu pueblo", a: "Tradicional", cat: ["cuaresma"], mo: ["entrada"], ton: "Dm", l:
`> Per[Dm]dona a tu [Gm]pueblo, Se[Dm]ñor,
> per[A7]dona a tu pueblo,
> per[Dm]dónale, Señor.

No es[Dm]tés eterna[Gm]mente eno[Dm]jado,
no es[A7]tés eternamente enojado,
per[Dm]dónale, Señor.

Por [Dm]tus pro[Gm]fundas llagas [Dm]crueles,
por [A7]tus salivas y por tus hieles,
per[Dm]dónale, Señor.

Por [Dm]las he[Gm]ridas de pies y [Dm]manos,
por [A7]los azotes tan inhumanos,
per[Dm]dónale, Señor.

Por [Dm]los tres [Gm]clavos que te cla[Dm]varon,
y [A7]las espinas que te punzaron,
per[Dm]dónale, Señor.` },
  { id: "attende-domine", t: "Attende, Domine", a: "Canto gregoriano de Cuaresma", cat: ["cuaresma"], mo: ["entrada", "ofrendas"], lat: 1, l:
`> Attende, Domine, et miserere,
> quia peccavimus tibi.

Ad te, Rex summe, omnium Redemptor,
oculos nostros sublevamus flentes:
exaudi, Christe, supplicantum preces.

Dextera Patris, lapis angularis,
via salutis, ianua caelestis,
ablue nostri maculas delicti.

Rogamus, Deus, tuam maiestatem:
auribus sacris gemitus exaudi:
crimina nostra placidus indulge.` },
  { id: "parce-domine", t: "Parce, Domine", a: "Canto gregoriano de Cuaresma", cat: ["cuaresma"], mo: ["entrada", "comunion"], lat: 1, l:
`Parce, Domine,
parce populo tuo:
ne in aeternum irascaris nobis.` },
  { id: "stabat-mater", t: "Stabat Mater", a: "Secuencia (s. XIII)", cat: ["cuaresma", "maria"], mo: ["evangelio"], lat: 1, l:
`Stabat Mater dolorosa
iuxta crucem lacrimosa,
dum pendebat Filius.

Cuius animam gementem,
contristatam et dolentem
pertransivit gladius.

O quam tristis et afflicta
fuit illa benedicta
Mater Unigeniti!

Eia, Mater, fons amoris,
me sentire vim doloris
fac, ut tecum lugeam.

Fac ut ardeat cor meum
in amando Christum Deum,
ut sibi complaceam.

Quando corpus morietur,
fac ut animae donetur
paradisi gloria. Amen.` },
  { id: "regina-caeli", t: "Regina caeli", a: "Antífona mariana del Tiempo Pascual", cat: ["pascua", "maria"], mo: ["salida"], lat: 1, l:
`Regina caeli, laetare, alleluia;
quia quem meruisti portare, alleluia;
resurrexit, sicut dixit, alleluia;
ora pro nobis Deum, alleluia.` },
  { id: "o-filii-et-filiae", t: "O filii et filiae", a: "Himno pascual (J. Tisserand, s. XV)", cat: ["pascua"], mo: ["entrada", "comunion"], ton: "Dm", lat: 1, l:
`> Alle[Dm]luia, alle[C]luia, alle[Dm]lu[A]ia.

O [Dm]filii et [C]fili[Dm]ae,
Rex [F]caelestis, Rex [C]glori[Dm]ae,
[Dm]morte sur[Gm]rexit [A]hodi[Dm]e. Alle[A]lu[Dm]ia.

Et [Dm]mane prima [C]sabba[Dm]ti,
ad [F]ostium mo[C]numen[Dm]ti
ac[Dm]cesse[Gm]runt di[A]scipu[Dm]li. Alle[A]lu[Dm]ia.

Et [Dm]Maria Mag[C]dale[Dm]ne,
et [F]Iacobi, et [C]Salo[Dm]me,
ve[Dm]nerunt [Gm]corpus [A]unge[Dm]re. Alle[A]lu[Dm]ia.

In [Dm]hoc festo sanc[C]tissi[Dm]mo
sit [F]laus et iubi[C]lati[Dm]o:
bene[Dm]dica[Gm]mus [A]Domi[Dm]no. Alle[A]lu[Dm]ia.` },
  { id: "veni-creator", t: "Veni, Creator Spiritus", a: "Himno (atribuido a Rábano Mauro, s. IX)", cat: ["espiritu"], mo: ["entrada"], lat: 1, l:
`Veni, Creator Spiritus,
mentes tuorum visita,
imple superna gratia,
quae tu creasti pectora.

Qui diceris Paraclitus,
altissimi donum Dei,
fons vivus, ignis, caritas,
et spiritalis unctio.

Tu septiformis munere,
digitus paternae dexterae,
tu rite promissum Patris,
sermone ditans guttura.

Accende lumen sensibus,
infunde amorem cordibus,
infirma nostri corporis
virtute firmans perpeti.

Hostem repellas longius,
pacemque dones protinus;
ductore sic te praevio
vitemus omne noxium.

Per te sciamus da Patrem,
noscamus atque Filium,
teque utriusque Spiritum
credamus omni tempore.

Deo Patri sit gloria,
et Filio, qui a mortuis
surrexit, ac Paraclito,
in saeculorum saecula. Amen.` },
  { id: "cantemos-al-amor", t: "Cantemos al Amor de los amores", a: "Letra: R. del Valle · Música: I. Busca de Sagastizábal (1911)", cat: ["eucaristia"], mo: ["comunion", "adoracion"], ton: "C", l:
`Can[C]temos al A[G7]mor de los a[C]mores,
can[F]temos [G7]al Se[C]ñor.
¡[C]Dios está a[G7]quí! Ve[Am]nid, adora[Dm]dores;
ado[C]remos a [G7]Cristo Reden[C]tor.

> ¡[C]Gloria a Cristo Je[F]sús! [G7]Cielos y tierra,
> bende[C]cid al Señor.
> ¡Ho[C]nor y gloria a [F]ti, Rey de la [C]gloria;
> a[F]mor por siempre a [C]ti, [G7]Dios del a[C]mor!

U[C]namos nuestra [G7]voz a los can[C]tares
del [F]coro [G7]celes[C]tial.
¡[C]Dios está a[G7]quí! Al [Am]Dios de los al[Dm]tares
ala[C]bemos con [G7]gozo angeli[C]cal.` },
  { id: "alabado-sea", t: "Alabado sea el Santísimo", a: "Tradicional", cat: ["eucaristia"], mo: ["adoracion"], ton: "C", l:
`Ala[C]bado [G7]sea el San[C]tísimo
Sacra[F]mento [G7]del al[C]tar,
y la [C]Virgen [G7]conce[C]bida
sin pe[F]cado o[G7]rigi[C]nal.` },
  { id: "oh-buen-jesus", t: "Oh buen Jesús", a: "Tradicional (para la comunión)", cat: ["eucaristia"], mo: ["comunion"], ton: "D", l:
`Oh [D]buen Jesús, yo [A7]creo firme[D]mente
que [G]por mi [D]bien es[E7]tás en el al[A]tar;
que [D]das tu cuerpo y [A7]sangre junta[D]mente
al [G]alma [D]fiel en [A7]celestial man[D]jar.

In[D]digno soy, con[A7]fieso avergon[D]zado,
de [G]reci[D]bir la [E7]santa comu[A]nión;
Je[D]sús, que ves mi [A7]nada y mi pe[D]cado,
pre[G]para [D]tú mi [A7]pobre cora[D]zón.

Pe[D]qué, Señor; in[A7]grato te he ofen[D]dido;
in[G]fiel te [D]fui, con[E7]fieso mi mal[A]dad.
Me [D]pesa ya; per[A7]dón, Señor, te [D]pido;
e[G]res mi [D]Dios, a[A7]pelo a tu bon[D]dad.

Es[D]pero en ti, pia[A7]doso Jesús [D]mío;
oi[G]go tu [D]voz que [E7]dice: «Ven a [A]mí».
Por[D]que eres fiel, por [A7]eso en ti con[D]fío;
to[G]do, Se[D]ñor, lo es[A7]pero yo de [D]ti.

Oh [D]buen Pastor, a[A7]mable y fino a[D]mante,
mi [G]cora[D]zón se a[E7]brasa en santo ar[A]dor;
si [D]te olvidé, hoy [A7]juro que cons[D]tante
he [G]de vi[D]vir tan [A7]solo de tu a[D]mor.

Dul[D]ce maná y ce[A7]lestial co[D]mida,
go[G]zo y sa[D]lud del [E7]que te come [A]bien;
ven [D]sin tardar, mi [A7]Dios, mi luz, mi [D]vida;
des[G]ciende a [D]mí, hasta mi [A7]pecho [D]ven.` },
  { id: "tantum-ergo", t: "Tantum ergo", a: "Santo Tomás de Aquino (s. XIII)", cat: ["eucaristia"], mo: ["adoracion"], lat: 1, l:
`Tantum ergo Sacramentum
veneremur cernui:
et antiquum documentum
novo cedat ritui:
praestet fides supplementum
sensuum defectui.

Genitori, Genitoque
laus et iubilatio,
salus, honor, virtus quoque
sit et benedictio:
procedenti ab utroque
compar sit laudatio. Amen.` },
  { id: "adoro-te-devote", t: "Adoro te devote", a: "Santo Tomás de Aquino (s. XIII)", cat: ["eucaristia"], mo: ["comunion", "adoracion"], lat: 1, l:
`Adoro te devote, latens Deitas,
quae sub his figuris vere latitas:
tibi se cor meum totum subiicit,
quia te contemplans totum deficit.

Visus, tactus, gustus in te fallitur,
sed auditu solo tuto creditur:
credo quidquid dixit Dei Filius;
nil hoc verbo veritatis verius.

In cruce latebat sola Deitas,
at hic latet simul et humanitas:
ambo tamen credens atque confitens,
peto quod petivit latro paenitens.

Iesu, quem velatum nunc aspicio,
oro fiat illud quod tam sitio:
ut te revelata cernens facie,
visu sim beatus tuae gloriae. Amen.` },
  { id: "ave-verum", t: "Ave verum Corpus", a: "Himno eucarístico (s. XIV)", cat: ["eucaristia"], mo: ["comunion", "adoracion"], lat: 1, l:
`Ave verum Corpus, natum
de Maria Virgine,
vere passum, immolatum
in cruce pro homine:
cuius latus perforatum
fluxit aqua et sanguine:
esto nobis praegustatum
mortis in examine.

O Iesu dulcis, o Iesu pie,
o Iesu, fili Mariae.` },
  { id: "o-salutaris", t: "O salutaris Hostia", a: "Santo Tomás de Aquino (s. XIII)", cat: ["eucaristia"], mo: ["adoracion"], lat: 1, l:
`O salutaris Hostia,
quae caeli pandis ostium:
bella premunt hostilia,
da robur, fer auxilium.

Uni trinoque Domino
sit sempiterna gloria,
qui vitam sine termino
nobis donet in patria. Amen.` },
  { id: "ubi-caritas", t: "Ubi caritas", a: "Antífona del Jueves Santo", cat: ["eucaristia", "cuaresma"], mo: ["ofrendas", "comunion"], lat: 1, l:
`> Ubi caritas et amor, Deus ibi est.

Congregavit nos in unum Christi amor.
Exsultemus et in ipso iucundemur.
Timeamus et amemus Deum vivum.
Et ex corde diligamus nos sincero.

Simul ergo cum in unum congregamur:
ne nos mente dividamur, caveamus.
Cessent iurgia maligna, cessent lites.
Et in medio nostri sit Christus Deus.` },
  { id: "oh-maria-madre-mia", t: "Oh María, Madre mía", a: "Tradicional", cat: ["maria"], mo: ["salida"], ton: "G", l:
`> Oh Ma[G]ría, [D7]Madre mía,
> oh con[G]suelo [D7]del mor[G]tal,
> ampa[C]radme y [G]guiadme
> a la [D7]patria celes[G]tial.

Con el [G]ángel [D7]de María
las gran[G]dezas [D7]cele[G]brad;
transpor[C]tados de ale[G]gría
sus fi[D7]nezas publi[G]cad.

Quien a [G]ti fer[D7]viente clama
halla a[G]livio en [D7]el pe[G]sar;
pues tu [C]nombre luz de[G]rrama,
gozo y [D7]bálsamo sin [G]par.

Pues te [G]llamo [D7]con fe viva,
muestra, oh [G]Madre, [D7]tu bon[G]dad;
a mí [C]vuelve compa[G]siva
tu mi[D7]rada de pie[G]dad.` },
  { id: "venid-y-vamos-todos", t: "Venid y vamos todos", a: "Tradicional (mes de María)", cat: ["maria"], mo: ["salida", "entrada"], ton: "D", l:
`> Ve[D]nid y vamos [A7]todos
> con flores a por[D]fía,
> con [G]flores a Ma[D]ría,
> que [A7]Madre nuestra [D]es.

De [D]nuevo aquí nos [A7]tienes,
purísima don[D]cella,
más [G]que la luna [D]bella,
pos[A7]trados a tus [D]pies.

Ve[D]nimos a ofre[A7]certe
las flores de este [D]suelo,
con [G]cuánto amor y an[D]helo,
Se[A7]ñora, tú lo [D]ves.

Por [D]ellas te ro[A7]gamos,
si cándidas te [D]placen,
las [G]que en la gloria [D]nacen
en [A7]cambio tú nos [D]des.` },
  { id: "trece-de-mayo", t: "El trece de mayo", a: "Tradicional (Ave de Fátima)", cat: ["maria"], mo: ["salida"], ton: "G", l:
`El [G]trece de [D7]mayo la [G]Virgen Ma[D7]ría
ba[G]jó de los [C]cielos a [D7]Cova de I[G]ría.

> [G]Ave, [C]ave, [D7]ave Ma[G]ría.
> [G]Ave, [C]ave, [D7]ave Ma[G]ría.

A [G]tres pastor[D7]citos la [G]Madre de [D7]Dios
des[G]cubre el mis[C]terio de [D7]su cora[G]zón.

Ha[G]ced peni[D7]tencia, ha[G]ced ora[D7]ción;
por [G]los peca[C]dores implo[D7]rad per[G]dón.

El [G]santo Ro[D7]sario cons[G]tantes re[D7]zad,
y [G]la paz del [C]mundo el Se[D7]ñor da[G]rá.` },
  { id: "o-sanctissima", t: "O sanctissima", a: "Tradicional siciliano (s. XVIII)", cat: ["maria"], mo: ["salida"], ton: "G", lat: 1, l:
`[G]O sanc[C]tissi[G]ma, [G]o pi[C]issi[G]ma,
[G]dulcis [D]Virgo Ma[A7]ri[D]a!
[D7]Mater a[G]mata, [D7]inteme[G]rata,
[C]o[G]ra, [Am]o[G]ra [D7]pro no[G]bis.

[G]Tu so[C]lati[G]um [G]et re[C]fugi[G]um,
[G]Virgo [D]Mater Ma[A7]ri[D]a.
[D7]Quidquid op[G]tamus, [D7]per te spe[G]ramus;
[C]o[G]ra, [Am]o[G]ra [D7]pro no[G]bis.` },
  { id: "salve-regina", t: "Salve, Regina", a: "Antífona mariana (s. XI)", cat: ["maria"], mo: ["salida"], lat: 1, l:
`Salve, Regina, Mater misericordiae,
vita, dulcedo, et spes nostra, salve.
Ad te clamamus, exsules filii Hevae.
Ad te suspiramus, gementes et flentes
in hac lacrimarum valle.
Eia ergo, advocata nostra,
illos tuos misericordes oculos ad nos converte.
Et Iesum, benedictum fructum ventris tui,
nobis post hoc exsilium ostende.
O clemens, o pia, o dulcis Virgo Maria.` },
  { id: "salve-madre", t: "Salve, Madre", a: "Letra: R. del Valle · Música: E. Torres (1929)", cat: ["maria"], mo: ["salida"], l:
`Salve, Madre, en la tierra de mis amores
te saludan los cantos que alza el amor.
Reina de nuestras almas, flor de las flores,
muestra aquí de tu gloria los resplandores,
que en el cielo tan solo te aman mejor.

Virgen santa, Virgen pura,
vida, esperanza y dulzura
del alma que en ti confía;
Madre de Dios, Madre mía,
mientras mi vida alentare,
todo mi amor para ti;
mas si mi amor te olvidare,
Madre mía, Madre mía,
aunque mi amor te olvidare,
tú no te olvides de mí.` },
  { id: "tu-reinaras", t: "Tú reinarás", a: "Tradicional (a Cristo Rey)", cat: ["alabanza"], mo: ["salida", "entrada"], ton: "C", l:
`Tú [C]reinarás, este es el [G7]grito
que ardiente exhala nuestra [C]fe.
Tú reinarás, oh Rey ben[F]dito,
pues [C]tú di[G7]jiste: «Reina[C]ré».

> [C]Reine Jesús por [G7]siempre,
> reine su cora[C]zón,
> en nuestra [F]patria, en nuestro [C]suelo,
> que es de Ma[G7]ría la na[C]ción.

Tú [C]reinarás, dulce espe[G7]ranza
que el alma llena de pla[C]cer;
habrá por fin paz y bo[F]nanza,
fe[C]lici[G7]dad habrá do[C]quier.

Tú [C]reinarás en este [G7]suelo,
te prometemos nuestro a[C]mor.
Oh buen Jesús, danos con[F]suelo
en [C]este [G7]valle de do[C]lor.` },
  { id: "corazon-santo", t: "Corazón santo", a: "Tradicional (al Sagrado Corazón)", cat: ["alabanza", "eucaristia"], mo: ["comunion", "salida"], ton: "D", l:
`> Cora[D]zón santo, [A7]tú reinarás;
> tú nuestro encanto siempre se[D]rás.

Je[D]sús amable, Je[A7]sús piadoso,
dueño amoroso, Dios de pie[D]dad,
vengo a tus plantas, si [G]tú me dejas,
hu[D]mildes quejas [A7]a presen[D]tar.` },
  { id: "vamos-pastores-vamos", t: "Vamos, pastores, vamos", a: "Villancico tradicional", cat: ["navidad"], mo: ["ofrendas", "salida"], ton: "D", l:
`> [D]Vamos, pastores, vamos,
> [A7]vamos a Be[D]lén,
> a [D]ver en ese [G]Niño
> la [A7]gloria del E[D]dén.

Ese [D]precioso Niño,
yo me [A7]muero por [D]Él;
sus o[D]jitos me en[G]cantan,
su bo[A7]quita tam[D]bién.

El [D]padre lo acaricia,
la [A7]madre mira en [D]Él,
y los [D]dos exta[G]siados
con[A7]templan aquel [D]ser.` },
  { id: "puer-natus", t: "Puer natus in Bethlehem", a: "Himno de Navidad (s. XIV)", cat: ["navidad"], mo: ["entrada", "comunion"], lat: 1, l:
`Puer natus in Bethlehem, alleluia:
unde gaudet Ierusalem, alleluia, alleluia.

> In cordis iubilo
> Christum natum adoremus,
> cum novo cantico.

Assumpsit carnem Filius, alleluia,
Dei Patris altissimus, alleluia, alleluia.

Per Gabrielem nuntium, alleluia,
Virgo concepit Filium, alleluia, alleluia.` },
  { id: "rorate-caeli", t: "Rorate caeli", a: "Canto gregoriano de Adviento", cat: ["adviento"], mo: ["entrada"], lat: 1, l:
`> Rorate caeli desuper,
> et nubes pluant iustum.

Ne irascaris, Domine,
ne ultra memineris iniquitatis:
ecce civitas Sancti facta est deserta,
Sion deserta facta est,
Ierusalem desolata est,
domus sanctificationis tuae et gloriae tuae,
ubi laudaverunt te patres nostri.` },
  { id: "alma-redemptoris", t: "Alma Redemptoris Mater", a: "Antífona mariana de Adviento y Navidad", cat: ["adviento", "navidad", "maria"], mo: ["salida"], lat: 1, l:
`Alma Redemptoris Mater,
quae pervia caeli porta manes,
et stella maris, succurre cadenti,
surgere qui curat, populo:
tu quae genuisti, natura mirante,
tuum sanctum Genitorem,
Virgo prius ac posterius,
Gabrielis ab ore sumens illud Ave,
peccatorum miserere.` },
  { id: "ave-regina-caelorum", t: "Ave, Regina caelorum", a: "Antífona mariana de Cuaresma", cat: ["cuaresma", "maria"], mo: ["salida"], lat: 1, l:
`Ave, Regina caelorum,
ave, Domina angelorum:
salve, radix, salve, porta,
ex qua mundo lux est orta.

Gaude, Virgo gloriosa,
super omnes speciosa;
vale, o valde decora,
et pro nobis Christum exora.` },
  { id: "victimae-paschali", t: "Victimae paschali laudes", a: "Secuencia de Pascua (s. XI)", cat: ["pascua"], mo: ["evangelio"], lat: 1, l:
`Victimae paschali laudes
immolent Christiani.

Agnus redemit oves:
Christus innocens Patri
reconciliavit peccatores.

Mors et vita duello
conflixere mirando:
dux vitae mortuus, regnat vivus.

Dic nobis, Maria,
quid vidisti in via?

Sepulcrum Christi viventis,
et gloriam vidi resurgentis:
angelicos testes,
sudarium et vestes.

Surrexit Christus spes mea:
praecedet suos in Galilaeam.

Scimus Christum surrexisse
a mortuis vere:
tu nobis, victor Rex, miserere.
Amen. Alleluia.` },
  { id: "veni-sancte-spiritus", t: "Veni, Sancte Spiritus", a: "Secuencia de Pentecostés (s. XIII)", cat: ["espiritu", "pascua"], mo: ["evangelio"], lat: 1, l:
`Veni, Sancte Spiritus,
et emitte caelitus
lucis tuae radium.

Veni, pater pauperum,
veni, dator munerum,
veni, lumen cordium.

Consolator optime,
dulcis hospes animae,
dulce refrigerium.

In labore requies,
in aestu temperies,
in fletu solacium.

O lux beatissima,
reple cordis intima
tuorum fidelium.

Sine tuo numine,
nihil est in homine,
nihil est innoxium.

Lava quod est sordidum,
riga quod est aridum,
sana quod est saucium.

Flecte quod est rigidum,
fove quod est frigidum,
rege quod est devium.

Da tuis fidelibus,
in te confidentibus,
sacrum septenarium.

Da virtutis meritum,
da salutis exitum,
da perenne gaudium.
Amen. Alleluia.` },
  { id: "pange-lingua", t: "Pange, lingua", a: "Santo Tomás de Aquino (s. XIII)", cat: ["eucaristia"], mo: ["adoracion", "comunion"], lat: 1, l:
`Pange, lingua, gloriosi
Corporis mysterium,
Sanguinisque pretiosi,
quem in mundi pretium
fructus ventris generosi
Rex effudit gentium.

Nobis datus, nobis natus
ex intacta Virgine,
et in mundo conversatus,
sparso verbi semine,
sui moras incolatus
miro clausit ordine.` },
  { id: "bendito-bendito", t: "Bendito, bendito", a: "Tradicional", cat: ["eucaristia"], mo: ["comunion", "adoracion"], ton: "G", l:
`> Ben[G]dito, ben[D7]dito, ben[G]dito sea [D7]Dios,
> los [G]ángeles [C]cantan y a[D7]laban a [G]Dios.

Yo [G]creo, Jesús [D7]mío, que es[G]tás en el al[D7]tar,
o[G]culto en la [C]hostia te [D7]vengo a ado[G]rar.

A[G]doro en la [D7]hostia el [G]cuerpo de Je[D7]sús,
su [G]sangre pre[C]ciosa que [D7]dio por mí en la [G]cruz.

Je[G]sús, Rey del [D7]cielo, que es[G]tás en el al[D7]tar,
tu [G]cuerpo, tu [C]sangre nos [D7]das sin ce[G]sar.` },
  { id: "iesu-dulcis-memoria", t: "Iesu, dulcis memoria", a: "Himno (s. XII)", cat: ["eucaristia", "alabanza"], mo: ["comunion"], lat: 1, l:
`Iesu, dulcis memoria,
dans vera cordis gaudia:
sed super mel et omnia
eius dulcis praesentia.

Nil canitur suavius,
nil auditur iucundius,
nil cogitatur dulcius,
quam Iesus Dei Filius.

Iesu, spes paenitentibus,
quam pius es petentibus!
quam bonus te quaerentibus!
sed quid invenientibus?

Sis, Iesu, nostrum gaudium,
qui es futurus praemium:
sit nostra in te gloria
per cuncta semper saecula. Amen.` },
  { id: "christus-vincit", t: "Christus vincit", a: "Aclamaciones carolingias (s. VIII)", cat: ["alabanza"], mo: ["entrada", "salida"], ton: "D", lat: 1, l:
`[D]Christus [G]vin[D]cit,
Christus [A]reg[D]nat,
Christus, [G]Christus [A]impe[D]rat.` },
  { id: "laudate-dominum", t: "Laudate Dominum", a: "Salmo 117 (116)", cat: ["alabanza"], mo: ["comunion", "salida"], lat: 1, l:
`Laudate Dominum, omnes gentes;
laudate eum, omnes populi.
Quoniam confirmata est super nos
misericordia eius,
et veritas Domini manet in aeternum.

Gloria Patri, et Filio,
et Spiritui Sancto.
Sicut erat in principio, et nunc, et semper,
et in saecula saeculorum. Amen.` },
  { id: "santo-dios", t: "Santo Dios, Santo fuerte", a: "Trisagio · tradicional", cat: ["alabanza", "cuaresma"], mo: ["adoracion"], l:
`Santo Dios,
Santo fuerte,
Santo inmortal,
líbranos, Señor, de todo mal.` },
  { id: "magnificat", t: "Magnificat", a: "Cántico de María (Lc 1, 46-55)", cat: ["maria"], mo: ["comunion", "salida"], lat: 1, l:
`Magnificat anima mea Dominum,
et exsultavit spiritus meus in Deo salutari meo.

Quia respexit humilitatem ancillae suae:
ecce enim ex hoc beatam me dicent omnes generationes.

Quia fecit mihi magna qui potens est:
et sanctum nomen eius.

Et misericordia eius a progenie in progenies
timentibus eum.

Fecit potentiam in brachio suo:
dispersit superbos mente cordis sui.

Deposuit potentes de sede,
et exaltavit humiles.

Esurientes implevit bonis:
et divites dimisit inanes.

Suscepit Israel puerum suum,
recordatus misericordiae suae.

Sicut locutus est ad patres nostros,
Abraham et semini eius in saecula.

Gloria Patri, et Filio, et Spiritui Sancto.
Sicut erat in principio, et nunc, et semper,
et in saecula saeculorum. Amen.` },
  { id: "ave-maria-gregoriano", t: "Ave Maria", a: "Canto gregoriano", cat: ["maria"], mo: ["ofrendas", "salida"], lat: 1, l:
`Ave Maria, gratia plena,
Dominus tecum,
benedicta tu in mulieribus,
et benedictus fructus ventris tui, Iesus.

Sancta Maria, Mater Dei,
ora pro nobis peccatoribus,
nunc et in hora mortis nostrae. Amen.` },
  { id: "sub-tuum-praesidium", t: "Sub tuum praesidium", a: "La oración mariana más antigua (s. III)", cat: ["maria"], mo: ["salida"], lat: 1, l:
`Sub tuum praesidium confugimus,
Sancta Dei Genetrix.
Nostras deprecationes ne despicias
in necessitatibus,
sed a periculis cunctis libera nos semper,
Virgo gloriosa et benedicta.` },
  { id: "bendita-sea-tu-pureza", t: "Bendita sea tu pureza", a: "Tradicional", cat: ["maria"], mo: ["salida"], l:
`Bendita sea tu pureza
y eternamente lo sea,
pues todo un Dios se recrea
en tan graciosa belleza.

A ti, celestial princesa,
Virgen sagrada María,
yo te ofrezco en este día
alma, vida y corazón.

Mírame con compasión,
no me dejes, Madre mía.` },
  { id: "adios-reina-del-cielo", t: "Adiós, Reina del cielo", a: "Tradicional", cat: ["maria"], mo: ["salida"], ton: "D", l:
`> A[D]diós, Reina del [A7]cielo,
> Madre del Salva[D]dor;
> adiós, oh Madre [G]mía,
> a[D]diós, a[A7]diós, a[D]diós.

De [D]tu divino [A7]rostro
la belleza al de[D]jar,
permíteme que [G]vuelva
tus [D]plantas [A7]a be[D]sar.

A [D]dejarte, oh Ma[A7]ría,
no acierta el cora[D]zón;
te lo entrego, Se[G]ñora,
dame [D]tu ben[A7]di[D]ción.` },
  { id: "kyrie", t: "Kyrie, eleison", a: "Ordinario de la Misa · canto gregoriano", cat: [], mo: ["piedad"], lat: 1, l:
`Kyrie, eleison.
Kyrie, eleison.

Christe, eleison.
Christe, eleison.

Kyrie, eleison.
Kyrie, eleison.` },
  { id: "gloria-in-excelsis", t: "Gloria in excelsis Deo", a: "Ordinario de la Misa · canto gregoriano", cat: [], mo: ["gloria"], lat: 1, l:
`Gloria in excelsis Deo
et in terra pax hominibus bonae voluntatis.

Laudamus te, benedicimus te,
adoramus te, glorificamus te,
gratias agimus tibi propter magnam gloriam tuam,
Domine Deus, Rex caelestis,
Deus Pater omnipotens.

Domine Fili unigenite, Iesu Christe,
Domine Deus, Agnus Dei, Filius Patris,
qui tollis peccata mundi, miserere nobis;
qui tollis peccata mundi, suscipe deprecationem nostram.
Qui sedes ad dexteram Patris, miserere nobis.

Quoniam tu solus Sanctus, tu solus Dominus,
tu solus Altissimus, Iesu Christe,
cum Sancto Spiritu: in gloria Dei Patris. Amen.` },
  { id: "credo", t: "Credo in unum Deum", a: "Ordinario de la Misa · Símbolo niceno-constantinopolitano", cat: [], mo: ["credo"], lat: 1, l:
`Credo in unum Deum,
Patrem omnipotentem, factorem caeli et terrae,
visibilium omnium et invisibilium.

Et in unum Dominum Iesum Christum,
Filium Dei unigenitum,
et ex Patre natum ante omnia saecula.
Deum de Deo, lumen de lumine, Deum verum de Deo vero,
genitum, non factum, consubstantialem Patri:
per quem omnia facta sunt.
Qui propter nos homines et propter nostram salutem
descendit de caelis.

Et incarnatus est de Spiritu Sancto
ex Maria Virgine, et homo factus est.

Crucifixus etiam pro nobis sub Pontio Pilato;
passus et sepultus est,
et resurrexit tertia die, secundum Scripturas,
et ascendit in caelum, sedet ad dexteram Patris.
Et iterum venturus est cum gloria,
iudicare vivos et mortuos,
cuius regni non erit finis.

Et in Spiritum Sanctum, Dominum et vivificantem:
qui ex Patre Filioque procedit.
Qui cum Patre et Filio simul adoratur et conglorificatur:
qui locutus est per prophetas.

Et unam, sanctam, catholicam et apostolicam Ecclesiam.
Confiteor unum baptisma in remissionem peccatorum.
Et exspecto resurrectionem mortuorum,
et vitam venturi saeculi. Amen.` },
  { id: "sanctus", t: "Sanctus", a: "Ordinario de la Misa · canto gregoriano", cat: [], mo: ["santo"], lat: 1, l:
`Sanctus, Sanctus, Sanctus
Dominus Deus Sabaoth.
Pleni sunt caeli et terra gloria tua.
Hosanna in excelsis.

Benedictus qui venit in nomine Domini.
Hosanna in excelsis.` },
  { id: "pater-noster", t: "Pater noster", a: "Ordinario de la Misa · canto gregoriano", cat: [], mo: ["padrenuestro"], lat: 1, l:
`Pater noster, qui es in caelis,
sanctificetur nomen tuum;
adveniat regnum tuum;
fiat voluntas tua, sicut in caelo et in terra.

Panem nostrum cotidianum da nobis hodie;
et dimitte nobis debita nostra,
sicut et nos dimittimus debitoribus nostris;
et ne nos inducas in tentationem;
sed libera nos a malo.` },
  { id: "agnus-dei", t: "Agnus Dei", a: "Ordinario de la Misa · canto gregoriano", cat: [], mo: ["cordero"], lat: 1, l:
`Agnus Dei, qui tollis peccata mundi,
miserere nobis.

Agnus Dei, qui tollis peccata mundi,
miserere nobis.

Agnus Dei, qui tollis peccata mundi,
dona nobis pacem.` }
];
