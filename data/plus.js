// Contenido de Scaeli+ (Daily): las virtudes de los hábitos y los caminos guiados.

/* Las siete virtudes: las tres teologales y las cuatro cardinales (Catecismo 1803-1829). */
export const VIRTUDES = [
  ["fe", "Fe", "Creer en Dios y en todo lo que Él reveló, y vivir de esa confianza.", ["Rezar al levantarme", "Leer el Evangelio del día", "Ir a Misa el domingo"]],
  ["esperanza", "Esperanza", "Esperar de Dios la vida eterna y la ayuda para llegar, aun cuando cuesta.", ["Rezar un Avemaría cuando me angustio", "Agradecer tres cosas a la noche", "Ofrecer lo que me cuesta"]],
  ["caridad", "Caridad", "Amar a Dios sobre todas las cosas y al prójimo como a uno mismo.", ["Ayudar en casa sin que me lo pidan", "Escuchar sin interrumpir", "Escribirle a alguien que está solo"]],
  ["prudencia", "Prudencia", "Ver qué es lo bueno en cada situación y elegir el camino para hacerlo.", ["Pensar antes de contestar", "Planear el día a la mañana", "Pedir consejo antes de decidir"]],
  ["justicia", "Justicia", "Dar a Dios y a cada persona lo que le corresponde.", ["Cumplir lo que prometo", "Decir la verdad aunque me cueste", "No hablar mal de nadie"]],
  ["fortaleza", "Fortaleza", "Firmeza en las dificultades y constancia para buscar el bien.", ["Levantarme a la primera alarma", "Hacer primero lo que más me cuesta", "Terminar lo que empiezo"]],
  ["templanza", "Templanza", "Moderar los gustos y el uso de las cosas, con equilibrio.", ["Dejar el celular una hora antes de dormir", "No comer entre comidas", "Rezar antes de comer"]]
];

/* Para sugerir la virtud de un hábito nuevo según sus palabras (el usuario la puede cambiar). Gana la primera que coincide. */
export const PISTAS_VIRTUD = [
  ["fe", ["rez", "orar", "oración", "misa", "evangelio", "biblia", "rosario", "confes", "adora", "dios", "jesús", "virgen"]],
  ["templanza", ["comer", "comida", "celular", "pantalla", "redes", "dulce", "azúcar", "alcohol", "series", "juego", "dormir", "gast"]],
  ["fortaleza", ["levant", "temprano", "alarma", "ejercicio", "entren", "correr", "gimnasio", "estudi", "constan", "terminar", "frío", "ducha"]],
  ["caridad", ["ayud", "escuch", "visit", "llam", "abuel", "familia", "amig", "servir", "compart", "perdon", "sonre", "quej"]],
  ["justicia", ["verdad", "mentir", "promet", "cumpl", "deuda", "puntual", "hablar mal", "critic", "devolver", "honest"]],
  ["prudencia", ["pensar", "plan", "organiz", "orden", "agenda", "consejo", "decid", "silencio", "calma"]],
  ["esperanza", ["agradec", "gracias", "ofrec", "confi", "ánimo", "paciencia", "esper"]]
];

/* Los caminos guiados. Adviento 2026 (ciclo B: el año litúrgico 2027): del 29 de noviembre al 24 de diciembre.
   Cada día: el Evangelio de la Misa de ese día y un gesto concreto. */
export const CAMINOS = {
  adviento: {
    n: "Adviento", sub: "Cuatro semanas para preparar la Navidad", ini: "2026-11-29", fin: "2026-12-24",
    intro: "El Adviento es el tiempo de la espera: la Iglesia se prepara para celebrar la primera venida de Jesús en Belén y renueva la esperanza en su vuelta al final de los tiempos. Cada día tenés el Evangelio de la Misa y un gesto concreto para vivirlo.",
    semanas: [["Velar", "Estar despiertos: el Señor viene."], ["Preparar el camino", "Juan el Bautista llama a la conversión."], ["Alegrarse", "El Señor está cerca: Gaudete."], ["Decir que sí", "Con María y José, recibir al que viene."]],
    dias: [
      ["2026-11-29", "Domingo I de Adviento", "Mc 13,33-37", "Armá la corona de Adviento y encendé la primera vela con tu familia."],
      ["2026-11-30", "San Andrés, apóstol", "Mt 4,18-22", "Invitá a alguien a rezar o a ir a Misa con vos esta semana."],
      ["2026-12-01", "Martes", "Lc 10,21-24", "Antes de dormir, agradecé tres cosas concretas del día."],
      ["2026-12-02", "Miércoles", "Mt 15,29-37", "Compartí algo tuyo con alguien que lo necesite."],
      ["2026-12-03", "Jueves", "Mt 7,21.24-27", "Elegí una cosa que venís postergando y hacela hoy."],
      ["2026-12-04", "Viernes", "Mt 9,27-31", "Pedile a Jesús, con tus palabras, que te abra los ojos en algo que no ves."],
      ["2026-12-05", "Sábado", "Mt 9,35–10,1.6-8", "Rezá por una persona que está sufriendo y mandale un mensaje."],
      ["2026-12-06", "Domingo II de Adviento", "Mc 1,1-8", "Encendé la segunda vela. Buscá un día para confesarte antes de Navidad."],
      ["2026-12-07", "Lunes", "Lc 5,17-26", "Acercá a alguien a Jesús: rezá por él por su nombre."],
      ["2026-12-08", "Inmaculada Concepción de María", "Lc 1,26-38", "Rezá el Ángelus al mediodía, despacio."],
      ["2026-12-09", "Miércoles", "Mt 11,28-30", "Dejale a Jesús, en un rato de silencio, lo que más te pesa."],
      ["2026-12-10", "Jueves", "Mt 11,11-15", "Pedí perdón a alguien con quien estás distanciado."],
      ["2026-12-11", "Viernes", "Mt 11,16-19", "Un día sin quejarte: cuando aparezca la queja, cambiala por una gracia."],
      ["2026-12-12", "Nuestra Señora de Guadalupe", "Lc 1,39-47", "Visitá o llamá a alguien mayor de tu familia."],
      ["2026-12-13", "Domingo III de Adviento (Gaudete)", "Jn 1,6-8.19-28", "Encendé la tercera vela. Hacé algo que le dé alegría a otro, sin que se entere que fuiste vos."],
      ["2026-12-14", "San Juan de la Cruz", "Mt 21,23-27", "Diez minutos de silencio frente a una imagen de Jesús o en una iglesia."],
      ["2026-12-15", "Martes", "Mt 21,28-32", "Hacé hoy eso que dijiste que ibas a hacer y no hiciste."],
      ["2026-12-16", "Miércoles", "Lc 7,18-23", "Ayudá a alguien que está enfermo o solo."],
      ["2026-12-17", "Jueves", "Mt 1,1-17", "Rezá por tus abuelos y por los que te transmitieron la fe."],
      ["2026-12-18", "Viernes", "Mt 1,18-24", "Como José, hacé en silencio algo que te pidieron, sin protestar."],
      ["2026-12-19", "Sábado", "Lc 1,5-25", "Prepará el pesebre de tu casa, o una parte, con tiempo."],
      ["2026-12-20", "Domingo IV de Adviento", "Lc 1,26-38", "Encendé la cuarta vela. Si todavía no te confesaste, hacelo esta semana."],
      ["2026-12-21", "Lunes", "Lc 1,39-45", "Saludá con cariño a alguien a quien no solés saludar."],
      ["2026-12-22", "Martes", "Lc 1,46-56", "Rezá el Magníficat (Lc 1,46-55) dando gracias por este año."],
      ["2026-12-23", "Miércoles", "Lc 1,57-66", "Ayudá en casa con los preparativos de mañana."],
      ["2026-12-24", "Nochebuena", "Lc 1,67-79", "Antes de la cena, rezá en familia frente al pesebre y poné al Niño Jesús en su lugar."]
    ]
  }
};
