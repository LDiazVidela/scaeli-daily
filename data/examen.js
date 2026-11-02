// Los siete pecados capitales para el examen de conciencia (Catecismo 1866): cada uno con la virtud que se le opone.
// Mismo formato que CONFESION (data/juego.js): n = nombre, s = la virtud que lo sana, d = qué es (del material de Lorenzo), q = preguntas.
// Tono: sobrio y cuidado, sin malas palabras ni lunfardo (es un examen para rezar).
export const CAPITALES = [
  { n: "Soberbia", s: "La sana la humildad", d: "Es creernos superiores, querer tener siempre la razón o no reconocer nuestros errores.", q: ["¿Me burlé de otros o los miré con desprecio?", "¿Quise imponer siempre mi opinión?", "¿Me costó reconocer un error o pedir perdón?", "¿No acepté una corrección aunque sabía que podía ayudarme?", "¿Busqué que me admiren, en persona o en las redes?"] },
  { n: "Avaricia", s: "La sana la generosidad", d: "Es el apego desordenado a las cosas, al dinero o al deseo de tener cada vez más.", q: ["¿Me aferré a mis cosas y me costó compartir?", "¿Me importó demasiado tener lo último o lo mejor?", "¿Valoré a las personas por lo que tienen?", "¿Fui mezquino con mi tiempo con los que me necesitaban?", "¿Me quedé con algo que no era mío?"] },
  { n: "Envidia", s: "La sana la caridad", d: "Es entristecernos o enojarnos por el bien de otra persona.", q: ["¿Me comparé todo el tiempo con otros, en persona o en las redes?", "¿Me molestó el éxito de otro o me alegré de su mal?", "¿Hablé mal de alguien porque quería tener lo que tiene?", "¿Pude alegrarme de verdad cuando a otro le fue bien?"] },
  { n: "Ira", s: "La sana la mansedumbre", d: "Es dejarnos dominar por el enojo hasta lastimar a otros con palabras, acciones o deseos de venganza.", q: ["¿Insulté, grité o reaccioné de manera violenta?", "¿Contesté mal a mis padres, hermanos o amigos?", "¿Guardé rencor?", "¿Busqué devolver el daño que me hicieron?", "¿Me descargué con alguien que no tenía la culpa?"] },
  { n: "Lujuria", s: "La sana la castidad", d: "Es mirar o tratar a otra persona como un objeto para el propio deseo, olvidando su dignidad. Invita a cuidar cómo vivimos los afectos, el cuerpo propio y el de los demás.", q: ["¿Usé a otra persona para mi propio interés?", "¿Busqué o compartí contenido que no respeta la dignidad de las personas?", "¿No cuidé mis límites o los límites de otros?", "¿Respeté mi cuerpo y el cuerpo de los demás, con la mirada y con las palabras?"] },
  { n: "Gula", s: "La sana la templanza", d: "Es buscar de manera desordenada el placer o el consumo, sin saber poner límites.", q: ["¿Comí, tomé o consumí cosas sin medida?", "¿Tomé alcohol en exceso o me puse en riesgo?", "¿Busqué satisfacer todo deseo inmediatamente?", "¿Usé el celular, los juegos o las series sin poder parar?", "¿Me costó detenerme aunque sabía que algo no me hacía bien?"] },
  { n: "Pereza", s: "La sana la diligencia", d: "No es simplemente estar cansado: es evitar una y otra vez lo que sabemos que tenemos que hacer, o volvernos indiferentes ante las responsabilidades, la fe o las necesidades de los demás.", q: ["¿Dejé de cumplir pudiendo hacerlo?", "¿Dejé que otros hicieran siempre las cosas por mí?", "¿No ayudé aunque podía hacerlo?", "¿Dejé de rezar o de ir a Misa por desgano?", "¿Postergué el estudio, el trabajo o las tareas de la casa?"] }
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

/* Examen por áreas de la vida (del material «La Reconciliación» de Lorenzo): mirar la vida con sinceridad, no buscar errores por buscar. */
export const VIDA = [
  { n: "Mi relación con Dios", s: "Lo que quisiera mejorar con Él", q: ["¿Me acuerdo de Dios solamente cuando necesito algo?", "¿Tengo algún momento para rezar?", "¿Participo de la Misa con respeto y atención?", "¿Me da vergüenza reconocer que creo en Dios?", "¿Uso el nombre de Dios de manera irrespetuosa?", "¿Intento conocer mejor a Jesús y vivir como Él nos enseña?"] },
  { n: "Mi relación con mi familia", s: "Los que viven conmigo", q: ["¿Cómo trato a mis padres, hermanos, abuelos o a las personas con las que vivo?", "¿Contesto mal o falto el respeto?", "¿Soy agradecido?", "¿Ayudo en casa cuando puedo?", "¿Miento para evitar problemas?", "¿Sé pedir perdón cuando me equivoco?"] },
  { n: "Mis amigos y compañeros", s: "Los que están cerca", q: ["¿Soy un buen amigo?", "¿Dejo a alguien de lado o participo de burlas?", "¿Hablo mal de alguien cuando no está?", "¿Compartí rumores, mensajes o fotos que podían lastimar a otra persona?", "¿Me sumé a una burla solamente porque los demás lo hacían?", "¿Soy capaz de perdonar y también de pedir perdón?"] },
  { n: "Mis responsabilidades", s: "El estudio, el trabajo, lo que me toca", q: ["¿Cumplo con mis tareas y responsabilidades?", "¿Copié o hice trampa?", "¿Mentí para evitar una consecuencia?", "¿Respeto a mis profesores, jefes y compañeros?", "¿Cuido los espacios y las cosas que son de todos?", "¿Aprovecho mis capacidades o muchas veces elijo no esforzarme?"] },
  { n: "Mis palabras y mis redes", s: "Lo que digo, miro y comparto", q: ["¿Uso mis palabras para ayudar o para lastimar?", "¿Insulto, humillo o me burlo?", "¿Comparto cosas de otros sin permiso?", "¿Publico o envío cosas que no me gustaría que compartieran sobre mí?", "¿Me escondo detrás de una pantalla para decir cosas que no diría cara a cara?", "¿Soy responsable con lo que miro, comparto y comento?"] },
  { n: "Mi relación conmigo mismo", s: "Lo que Dios puso en mí", q: ["¿Reconozco las cosas buenas que Dios puso en mí?", "¿Me comparo constantemente con los demás?", "¿Me trato con respeto?", "¿Sé reconocer mis límites?", "¿Intento cuidar mi cuerpo, mis pensamientos y mis decisiones?", "¿Hay alguna actitud o hábito que sé que no me hace bien?"] }
];

/* para el final de la hoja (del mismo material) */
export const CONF_CIERRE = {
  nota: "No hace falta decir cada pregunta en la confesión. Elegí lo que de verdad reconocés que hiciste mal, lo que te alejó de Dios o de los demás, y presentalo con sinceridad.",
  recorda: "En la confesión no te encontrás con un Dios que espera tus errores para castigarte: te encontrás con un Padre que conoce tu vida, te ama y te ofrece empezar de nuevo.",
  oracion: "Jesús, sé que me equivoqué. Me arrepiento de lo que hice mal. Gracias porque no dejás de amarme. Ayudame a cambiar, a reparar lo que pueda y a volver a empezar.",
  cita: "«Dios nunca se cansa de perdonar; somos nosotros los que nos cansamos de acudir a su misericordia.» — Papa Francisco"
};
