// La Misa, paso a paso, para el que celebra y para los fieles: ritos, gestos y posturas (Ordenación General del Misal Romano).
// No incluye los textos del Misal (oraciones, prefacios, plegarias): esos tienen derechos de la Conferencia Episcopal.
// Cada paso: [nombre, qué hace el sacerdote, postura de los fieles, nota]
export const MISA_ORDINARIO = [
  ["Ritos iniciales", null, null, null],
  ["Procesión de entrada", "Entra con los ministros mientras se canta. Al llegar, hace inclinación profunda (o genuflexión si el sagrario está en el presbiterio) y besa el altar; puede incensarlo. Va a la sede.", "De pie", "Si no hay canto, se lee la antífona de entrada."],
  ["Señal de la cruz y saludo", "Desde la sede hace la señal de la cruz y saluda al pueblo con una de las fórmulas del Misal. Puede introducir brevemente la Misa del día.", "De pie", null],
  ["Acto penitencial", "Invita al arrepentimiento, deja un breve silencio y sigue una de las formas del Misal; termina con la absolución, que no es sacramental.", "De pie", "Los domingos, sobre todo en Pascua, puede reemplazarse por la bendición y aspersión del agua. No se hace el Miércoles de Ceniza ni cuando la Misa empieza con otro rito (Ramos, Presentación, procesiones)."],
  ["Señor, ten piedad", "Se canta o se dice, si no se incluyó en el acto penitencial.", "De pie", null],
  ["Gloria", "Lo entona el sacerdote o el cantor; lo canta o lo dice toda la asamblea.", "De pie", "Solo los domingos fuera de Adviento y Cuaresma, en las solemnidades, en las fiestas y en las octavas de Navidad y de Pascua (ver «Qué se dice hoy»)."],
  ["Oración colecta", "Con las manos juntas invita a orar, deja un momento de silencio y, con las manos extendidas, dice la colecta del día; el pueblo responde «Amén».", "De pie", null],
  ["Liturgia de la Palabra", null, null, null],
  ["Primera lectura y salmo", "Sentado en la sede, escucha. Las lecturas las proclama un lector desde el ambón; el salmo, idealmente cantado, lo dice el salmista.", "Sentados", null],
  ["Segunda lectura", "Los domingos y solemnidades.", "Sentados", null],
  ["Aclamación antes del Evangelio", "Se canta el Aleluya con su versículo. Mientras, pone incienso si se usa. Si proclama él el Evangelio, se inclina ante el altar y reza en secreto; si lo proclama el diácono, le da la bendición.", "De pie", "En Cuaresma no se dice Aleluya: se canta otra aclamación. Secuencia obligatoria en Pascua y Pentecostés; facultativa en Corpus y en la Virgen de los Dolores."],
  ["Evangelio", "Desde el ambón saluda, anuncia el pasaje y signa el libro y su frente, boca y pecho; puede incensar el libro. Al terminar lo besa y dice en secreto la oración prevista.", "De pie, con la triple señal de la cruz al anuncio", null],
  ["Homilía", "Desde la sede o el ambón. Obligatoria los domingos y fiestas de precepto; muy recomendada en las ferias de Adviento, Cuaresma y Pascua y en las celebraciones con mucha gente. Después, un breve silencio.", "Sentados", null],
  ["Profesión de fe", "Se canta o se dice el Credo (Niceno-Constantinopolitano o, sobre todo en Cuaresma y Pascua, el de los Apóstoles).", "De pie; inclinación profunda en «y por obra del Espíritu Santo…» (genuflexión en Navidad y en la Anunciación)", "Domingos y solemnidades."],
  ["Oración de los fieles", "Desde la sede introduce y concluye; las intenciones las dice el diácono, un cantor o un lector desde el ambón.", "De pie", "Por la Iglesia, por los gobernantes y la salvación del mundo, por los que sufren y por la comunidad local."],
  ["Liturgia eucarística", null, null, null],
  ["Preparación de los dones", "Se prepara el altar (corporal, purificador, cáliz, Misal). Recibe el pan y el vino, los eleva un poco sobre el altar diciendo las oraciones en voz baja (o en voz alta si no hay canto), echa unas gotas de agua en el vino y se inclina. Puede incensar las ofrendas, la cruz y el altar. Se lava las manos al costado del altar.", "Sentados", "Es un buen momento para la colecta y la procesión de ofrendas."],
  ["Oren, hermanos", "Invita a orar; el pueblo responde de pie. Dice la oración sobre las ofrendas del día.", "De pie desde la respuesta", null],
  ["Plegaria eucarística · Prefacio y Santo", "Diálogo inicial, prefacio (el que corresponde al día) y el Santo, que se canta con el pueblo.", "De pie", null],
  ["Plegaria eucarística · Epíclesis y consagración", "Con las manos extendidas sobre las ofrendas invoca al Espíritu Santo. Dice el relato de la institución con claridad; muestra la Hostia y el cáliz al pueblo y hace genuflexión después de cada uno.", "De rodillas durante la consagración (OGMR 43; donde es costumbre, desde el Santo hasta el final de la plegaria); quien no puede, hace una inclinación profunda en la genuflexión del sacerdote", "Un ministro puede tocar la campanilla un poco antes y en cada ostensión."],
  ["Aclamación y resto de la plegaria", "Anuncia el «misterio de la fe»; el pueblo aclama. Sigue la plegaria: memorial, ofrenda, intercesiones por la Iglesia, el Papa, el obispo, los difuntos, y la comunión de los santos.", "De pie", null],
  ["Doxología final", "Eleva juntos la patena con la Hostia y el cáliz mientras dice o canta la doxología; el pueblo responde con el gran Amén.", "De pie", "La doxología la dice solo el sacerdote (y los concelebrantes)."],
  ["Rito de comunión · Padrenuestro y paz", "Introduce el Padrenuestro, que reza con el pueblo con las manos extendidas; sigue el embolismo y la aclamación. Reza la oración por la paz y desea la paz; el diácono o el sacerdote pueden invitar a darse la paz.", "De pie", "El saludo de la paz es sobrio, con los que están cerca."],
  ["Fracción del pan y Cordero de Dios", "Parte la Hostia y deja caer un trocito en el cáliz mientras se canta el Cordero de Dios. Se prepara en silencio con la oración en secreto.", "De pie, y de rodillas después del Cordero de Dios, donde es costumbre", null],
  ["Comunión", "Muestra la Hostia sobre la patena o el cáliz y dice la invitación; responde con el pueblo. Comulga y distribuye la comunión con los ministros. Después purifica los vasos sagrados en el altar o en la credencia.", "De pie o de rodillas para comulgar, según la costumbre; en la mano o en la boca", "Durante la comunión se canta. Después, un tiempo de silencio sagrado."],
  ["Oración después de la comunión", "De pie en la sede o en el altar, invita a orar y dice la oración del día.", "De pie", null],
  ["Ritos de conclusión", null, null, null],
  ["Avisos, bendición y despedida", "Breves avisos. Saluda y bendice al pueblo (puede usar una bendición solemne o una oración sobre el pueblo). El diácono o el sacerdote despide a la asamblea.", "De pie; inclinación para la bendición solemne", "En la octava de Pascua y en Pentecostés, la despedida lleva doble aleluya."],
  ["Veneración del altar y salida", "Besa el altar, hace la reverencia con los ministros y se retira.", "De pie", null]
];

// Prefacios por categoría de santo (cuando la celebración no tiene uno propio)
export const PREF_SANTOS = [
  [/virgen mar[ií]a|nuestra se[ñn]ora|santa mar[ií]a|bienaventurada virgen|inmaculado coraz[oó]n/i, "de la Santísima Virgen María I o II"],
  [/ap[oó]stol|evangelista/i, "de los Apóstoles I o II"],
  [/arc[aá]ngel|[aá]ngeles/i, "de los Ángeles"],
  [/m[aá]rtir/i, "de los Santos Mártires I o II"],
  [/papa|obispo|presb[ií]tero|di[aá]cono/i, "de los Santos Pastores"],
  [/virgen|religios|abad|monje|ermita/i, "de las Vírgenes y los Religiosos"],
  [/./, "de los Santos I o II"]
];

// Celebraciones con prefacio propio (por palabras del nombre)
export const PREF_PROPIO = [
  [/Natividad del Se[ñn]or|Navidad/i, "de Navidad I, II o III"],
  [/Epifan[ií]a/i, "de la Epifanía del Señor"],
  [/Bautismo del Se[ñn]or/i, "propio: El Bautismo del Señor"],
  [/Presentaci[oó]n del Se[ñn]or/i, "propio: El misterio de la Presentación del Señor"],
  [/Anunciaci[oó]n/i, "propio: El misterio de la Encarnación"],
  [/Transfiguraci[oó]n/i, "propio: El misterio de la Transfiguración"],
  [/Exaltaci[oó]n de la Santa Cruz/i, "propio: La victoria de la Cruz gloriosa (o de la Pasión del Señor I)"],
  [/Sant[ií]sima Trinidad/i, "propio: El misterio de la Santísima Trinidad"],
  [/Cuerpo y la Sangre|Corpus/i, "de la Santísima Eucaristía I o II"],
  [/Sagrado Coraz[oó]n/i, "propio: La inmensa caridad de Cristo"],
  [/Rey del Universo|Cristo Rey/i, "propio: Cristo, Rey del universo"],
  [/Ascensi[oó]n/i, "de la Ascensión del Señor I o II"],
  [/Pentecost[eé]s/i, "propio: El misterio de Pentecostés"],
  [/Todos los Santos/i, "propio: La gloria de la Jerusalén celestial, nuestra madre"],
  [/Fieles Difuntos|Conmemoraci[oó]n de todos los fieles/i, "de Difuntos I a V"],
  [/San Jos[eé]/i, "propio: La misión de San José"],
  [/Natividad de San Juan Bautista|Martirio de San Juan Bautista/i, "propio: La misión del Precursor"],
  [/Pedro y (San )?Pablo/i, "propio: La doble misión de Pedro y Pablo en la Iglesia"],
  [/Asunci[oó]n/i, "propio: La gloria de María elevada al cielo"],
  [/Inmaculada Concepci[oó]n/i, "propio: El misterio de María y de la Iglesia"],
  [/Dedicaci[oó]n/i, "de la Dedicación de una iglesia II"],
  [/Santa Mar[ií]a, Madre de Dios/i, "de la Santísima Virgen María I"],
  [/Domingo de Ramos|Pasi[oó]n del Se[ñn]or/i, "propio: La Pasión del Señor"],
  [/Jueves Santo|Cena del Se[ñn]or/i, "de la Santísima Eucaristía I"]
];
