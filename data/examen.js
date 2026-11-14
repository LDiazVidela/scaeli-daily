// Los siete pecados capitales para el examen de conciencia (Catecismo 1866): cada uno con la virtud que se le opone.
// Mismo formato que CONFESION (data/juego.js): n = nombre, s = la virtud que lo sana, d = qué es, q = preguntas. Texto propio de Scaeli (2.1).
// Tono: sobrio y cuidado, sin malas palabras ni lunfardo (es un examen para rezar).
export const CAPITALES = [
  { n: "Soberbia", s: "La sana la humildad", d: "Ponerme por encima de los demás: necesitar tener razón, que me admiren, y no aceptar que me equivoco.", q: ["¿Traté a alguien con desprecio o me reí de él?", "¿Necesité ganar todas las discusiones?", "¿Me negué a admitir un error o a pedir perdón?", "¿Rechacé un consejo o una corrección que me hacía bien?", "¿Hice cosas, en persona o en las redes, solo para que me miren?"] },
  { n: "Avaricia", s: "La sana la generosidad", d: "Atarme a las cosas y a la plata, como si tener más me hiciera valer más.", q: ["¿Me costó compartir lo que tengo?", "¿Viví pendiente de tener lo más nuevo o lo más caro?", "¿Medí a alguien por lo que tiene?", "¿Le negué mi tiempo a alguien que me necesitaba?", "¿Me quedé con algo ajeno o no lo devolví?"] },
  { n: "Envidia", s: "La sana la caridad", d: "Que me duela el bien del otro, como si lo que le toca a él me lo sacara a mí.", q: ["¿Viví mirando la vida de los demás y comparándome?", "¿Me dolió que a otro le fuera bien, o me alegré cuando le fue mal?", "¿Critiqué a alguien por bronca de que tenga lo que yo quiero?", "¿Felicité de corazón a alguien por algo bueno que le pasó?"] },
  { n: "Ira", s: "La sana la mansedumbre", d: "Dejar que el enojo me maneje y termine lastimando, con lo que digo, con lo que hago o con ganas de vengarme.", q: ["¿Grité, insulté o perdí el control?", "¿Les respondí mal a los de mi casa o a mis amigos?", "¿Sigo guardando bronca contra alguien?", "¿Quise hacerle pagar a alguien lo que me hizo?", "¿Me la agarré con quien no tenía nada que ver?"] },
  { n: "Lujuria", s: "La sana la castidad", d: "Ver al otro como algo para usar y no como una persona con dignidad. La castidad es aprender a querer bien: con el cuerpo, la mirada y los afectos.", q: ["¿Usé a alguien para lo que yo quería?", "¿Miré o pasé contenido que trata a las personas como objetos?", "¿Crucé límites, míos o de otros?", "¿Cuidé mi cuerpo y el de los demás con la mirada y con lo que digo?"] },
  { n: "Gula", s: "La sana la templanza", d: "No saber poner freno: querer más y ya, en la comida, en la bebida o en lo que consumo.", q: ["¿Comí, tomé o consumí de más?", "¿Tomé alcohol de más o me puse en peligro?", "¿Quise todo en el momento, sin saber esperar?", "¿Pasé horas con el celular, los juegos o las series sin poder cortar?", "¿Seguí con algo aunque sabía que me hacía mal?"] },
  { n: "Pereza", s: "La sana la diligencia", d: "No es el cansancio: es esquivar lo que me toca, o que me dé lo mismo Dios, mis tareas y los que me necesitan.", q: ["¿Dejé sin hacer algo que me tocaba y podía hacer?", "¿Dejé que otros hicieran lo que era mío?", "¿Pasé de largo cuando alguien necesitaba una mano?", "¿Dejé la oración o la Misa por desgano?", "¿Fui dejando para después el estudio, el trabajo o lo de casa?"] }
];

export const CAPITALES_N = [
  { n: "Soberbia", s: "Ser humilde", d: "Creerme mejor que los demás.", q: ["¿Me creí mejor que mis compañeros?", "¿Me costó pedir perdón?"] },
  { n: "Avaricia", s: "Ser generoso", d: "No querer compartir.", q: ["¿Me costó prestar o compartir mis cosas?", "¿Quise tener siempre más cosas?"] },
  { n: "Envidia", s: "Alegrarme por los demás", d: "Ponerme triste porque a otro le va bien.", q: ["¿Me puse triste porque a otro le iba bien?", "¿Quise lo que tenía otro?"] },
  { n: "Ira", s: "Ser paciente", d: "Enojarme tanto que lastimo a otros.", q: ["¿Me enojé y grité o le pegué a alguien?", "¿Les contesté mal a mis papás?"] },
  { n: "Lujuria", s: "Cuidar el cuerpo", d: "No respetar mi cuerpo o el de los demás.", q: ["¿Dejé de respetar mi cuerpo o el de los demás?", "¿Miré o dije cosas que no estaban bien?"] },
  { n: "Gula", s: "Comer con medida", d: "Querer todo ya, sin medida.", q: ["¿Comí de más o solo golosinas?", "¿Me quejé de la comida?"] },
  { n: "Pereza", s: "Hacer lo que me toca", d: "No hacer lo que me toca.", q: ["¿Dejé de hacer la tarea o de ayudar en casa?", "¿Dejé de rezar porque no tenía ganas?"] }
];

/* Examen por áreas de la vida (texto propio de Scaeli): mirar la vida con sinceridad, sin buscar errores por buscar. */
export const VIDA = [
  { n: "Mi relación con Dios", s: "Lo que quisiera mejorar con Él", q: ["¿Me acuerdo de Dios solo cuando necesito algo?", "¿Le hice un lugar a la oración en mi día?", "¿Estuve en Misa con atención y respeto?", "¿Escondí mi fe por vergüenza?", "¿Usé el nombre de Dios a la ligera?", "¿Busqué conocer más a Jesús y parecerme a Él?"] },
  { n: "Mi familia", s: "Los que viven conmigo", q: ["¿Cómo traté a los de mi casa?", "¿Falté el respeto o contesté mal?", "¿Di las gracias por lo que hacen por mí?", "¿Di una mano en casa cuando podía?", "¿Mentí para zafar de un problema?", "¿Pedí perdón cuando me equivoqué?"] },
  { n: "Mis amigos y compañeros", s: "Los que están cerca", q: ["¿Fui un buen amigo?", "¿Dejé a alguien afuera o me reí de él?", "¿Hablé mal de alguien a sus espaldas?", "¿Pasé rumores, mensajes o fotos que podían herir a alguien?", "¿Me sumé a una burla para no quedar afuera?", "¿Perdoné y pedí perdón?"] },
  { n: "Lo que me toca", s: "El estudio, el trabajo, mis tareas", q: ["¿Hice lo que me tocaba?", "¿Me copié o hice trampa?", "¿Mentí para no hacerme cargo?", "¿Traté con respeto a profesores, jefes y compañeros?", "¿Cuidé las cosas y los lugares que son de todos?", "¿Puse en juego lo que sé hacer o elegí no esforzarme?"] },
  { n: "Lo que digo y comparto", s: "Palabras, pantallas y redes", q: ["¿Mis palabras ayudaron o lastimaron?", "¿Insulté, humillé o me burlé de alguien?", "¿Compartí algo de otro sin preguntarle?", "¿Mandé o publiqué algo que no me gustaría que hicieran conmigo?", "¿Dije detrás de una pantalla lo que no diría en la cara?", "¿Cuidé lo que miro, comento y comparto?"] },
  { n: "Conmigo mismo", s: "Lo que Dios puso en mí", q: ["¿Veo lo bueno que Dios puso en mí?", "¿Vivo comparándome con los demás?", "¿Me trato bien?", "¿Acepto mis límites?", "¿Cuido mi cuerpo, mis pensamientos y lo que decido?", "¿Hay algún hábito que sé que me hace mal?"] }
];

/* para el final de la hoja (texto propio de Scaeli) */
export const CONF_CIERRE = {
  nota: "No hace falta confesar cada pregunta. Quedate con lo que de verdad reconocés como pecado, lo que te apartó de Dios o de los demás, y decilo con sencillez.",
  recorda: "En la confesión no te espera un juez que lleva la cuenta de tus errores: te espera un Padre que te conoce, te quiere y te deja empezar de nuevo.",
  oracion: "Señor Jesús, me equivoqué y me duele. Gracias por quererme igual. Dame fuerza para cambiar, para arreglar lo que pueda y para volver a empezar con vos.",
  cita: "«Dios no se cansa nunca de perdonar; somos nosotros los que nos cansamos de acudir a su misericordia.» — Papa Francisco, Evangelii gaudium 3"
};
