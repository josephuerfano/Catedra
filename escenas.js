// Datos del juego. Para agregar una escena, copia una de las de abajo.
// foco = personaje que aparece a la derecha al inicio de la escena (Tamb siempre va a la izquierda).
// Opción: {t:texto, s:stat, d:dificultad, r:resultado bien, q:resultado torpe, req:marca necesaria}
// Sin "s" la opción está siempre disponible. v = cambios de vínculo, m = marcas que se guardan.
const PERSONAJES = {
  tamb:{n:'Tamb',c:'#6f8f5b'}, grakk:{n:'Grakk',c:'#4f6b55',t:'grande'}, snik:{n:'Snik',c:'#8aa82e',t:'chico'},
  mora:{n:'Mora',c:'#6d8387'}, vrak:{n:'Vrak',c:'#7d7d6c'}, zuzu:{n:'Zuzu',c:'#3fae8a',t:'chico'}, dorn:{n:'Dorn',c:'#c8641e'}
};

const ESCENAS = [
{
  id:1, titulo:'La silla vacía', fondo:'', foco:'dorn', pj:['tamb','grakk','snik','mora','vrak','zuzu','dorn'],
  situacion:[
    {p:'narr',t:'Han pasado pocas semanas desde que tu padre ya no está. Alrededor de la fogata, la banda cena.'},
    {p:'narr',t:'Grakk reparte platos con un delantal manchado. Snik hace chistes con la boca llena. Mora revisa un mapa, apartada. Vrak mira el fuego. Zuzu ajusta un artefacto sin levantar la vista.'},
    {p:'dorn',t:'Hermanos, el invierno viene y las Tierras Secas ya no alcanzan para todos. Altaluz tiene un valle entero y una muralla que nunca ha visto a nadie como nosotros. Atacamos antes de la primera nevada.'},
    {p:'narr',t:'Todos te miran. Sientes el peso de la hombrera que te queda grande.'}
  ],
  decisiones:[
    {p:'narr',t:'Todos esperan que hables. ¿Qué haces?',op:[
      {t:'Quedarte callado.',r:{x:'Callas. Dorn sigue hablando y la banda se acomoda a su idea.',v:{dorn:1}}},
      {t:'Pedir tiempo: “Lo voy a pensar. Les respondo mañana.”',s:'lid',d:3,r:{x:'Mora asiente despacio: no decides a la carrera.',v:{mora:1}}},
      {t:'Pedir la palabra a cada uno antes de decidir.',s:'esc',d:5,r:{x:'Vrak y Grakk se sorprenden: hacía tiempo que nadie los consultaba. Dorn frunce el ceño.',v:{vrak:1,grakk:1,dorn:-1}}},
      {t:'Declarar tu decisión con firmeza.',s:'ase',d:5,r:{x:'Hablas claro. Dorn te mide con la mirada y asiente.',v:{dorn:1}}}
    ]},
    {p:'dorn',t:'¿Estás con nosotros, jefe? ¿O todavía esperas que tu padre vuelva?',op:[
      {t:'Responder “Sí, estoy con ustedes” sin más.',r:{x:'Dorn sonríe. No decidiste nada.',v:{dorn:1}}},
      {t:'Responder con calma: “Estoy con la banda. Por eso quiero hacerlo bien.”',s:'con',d:4,r:{x:'La tensión baja. Mora te mira distinto.',v:{mora:1}},q:{x:'Suena a excusa. Dorn sonríe.',v:{dorn:1}}},
      {t:'Responder corto y firme: “Eso no está en discusión.”',s:'ase',d:4,r:{x:'Silencio. La banda te mira distinto.',v:{dorn:-1}},q:{x:'La voz se te quiebra y Snik se ríe nervioso.',v:{}}}
    ]},
    {p:'zuzu',t:'Bonito silencio, jefe. Muy diplomático.',op:[
      {t:'Ignorarla.',r:{x:'Se va con una sonrisa torcida.',v:{}}},
      {t:'Preguntarle: “¿Qué habrías querido que dijera?”',s:'esc',d:4,r:{x:'“Que alguien dijera algo, aunque fuera equivocado.” Zuzu se queda pensando.',v:{zuzu:1}},q:{x:'Se encoge de hombros y se va.',v:{}}},
      {t:'Contestar con humor: “Estoy practicando.”',s:'ase',d:3,r:{x:'Zuzu casi sonríe. Snik se ríe fuerte.',v:{zuzu:1,snik:1}},q:{x:'El chiste sale flojo. Zuzu levanta una ceja.',v:{}}}
    ]}
  ],
  cierre:'Callarte, pedir tiempo y preguntar son respuestas distintas, y cada una dice algo de ti. Pedir tiempo para decidir no es debilidad, siempre que digas cuándo vas a responder.'
},
{
  id:2, titulo:'El plan', fondo:'', foco:'dorn', pj:['tamb','dorn','mora','snik','vrak','zuzu','grakk'],
  situacion:[
    {p:'narr',t:'Al día siguiente, el mapa de Altaluz está abierto sobre la mesa de la tienda de mando.'},
    {p:'dorn',t:'Ataque frontal en la frontera, con Grakk al frente y mi ariete. Lo preparé con cuidado.'},
    {p:'mora',t:'Primero tres semanas de reconocimiento.'},
    {p:'snik',t:'Yo salgo esta noche con los exploradores.'},
    {p:'vrak',t:'Tu padre nunca atacó sin buscar primero una tregua. Eso…'},
    {p:'dorn',t:'Ya lo sabemos, Vrak.'},
    {p:'narr',t:'Snik y Mora empiezan a discutir. Al fondo, Zuzu aprieta la mandíbula al oír “mi ariete”.'}
  ],
  decisiones:[
    {p:'snik',t:'¡Esperar es lo que mata! (Mora: “Y correr también.”)',op:[
      {t:'Dejar que se desahoguen.',r:{x:'Gritan hasta cansarse. La tensión queda pendiente.',v:{},m:{smTension:true}}},
      {t:'Pedir que cada uno diga qué quiere evitar antes de seguir.',s:'con',d:4,r:{x:'Los dos dicen lo mismo: “Que no muera nadie.”',v:{snik:1,mora:1}},q:{x:'Te hacen caso a medias.',v:{},m:{smTension:true}}},
      {t:'Cortar: “Basta. Los escucho a los dos, uno por uno.”',s:'ase',d:4,r:{x:'Hay silencio. Hablan por turnos.',v:{mora:1,snik:1}},q:{x:'Dorn aprovecha y toma la palabra.',v:{dorn:1}}}
    ]},
    {p:'narr',t:'Dorn presenta el ariete como suyo. Zuzu desvía la mirada.',op:[
      {t:'Felicitar a Dorn.',r:{x:'Dorn sonríe satisfecho. Zuzu baja la cabeza.',v:{dorn:1,zuzu:-1}}},
      {t:'Cruzar una mirada con Zuzu y asentir: viste de quién era el trabajo.',s:'emp',d:5,r:{x:'Ella lo nota. Solo un segundo, pero lo nota.',v:{zuzu:1},m:{zuzuVista:true}}},
      {t:'Preguntar en voz alta: “¿Quién lo diseñó?”',s:'ase',d:5,r:{x:'Dorn duda. Zuzu levanta la cabeza por primera vez.',v:{zuzu:2,dorn:-1}},q:{x:'Suena a acusación. Dorn responde: “El equipo, jefe.”',v:{}}}
    ]},
    {p:'narr',t:'Hay que elegir el plan base.',op:[
      {t:'Plan rápido de Dorn: atacar pronto en la frontera.',r:{x:'Dorn sonríe. Mora y Grakk no.',v:{dorn:1,mora:-1,grakk:-1},m:{plan:'rapido'}}},
      {t:'Plan cauto de Mora: tres semanas de reconocimiento.',r:{x:'Mora asiente. Snik resopla.',v:{mora:1,snik:-1,dorn:-1},m:{plan:'cauto'}}},
      {t:'Plan mixto: una semana de reconocimiento y ataque listo.',s:'lid',d:5,r:{x:'Mora y Snik se miran: no es lo que querían, pero lo aceptan.',v:{mora:1,snik:1},m:{plan:'mixto'}},q:{x:'Nadie queda conforme. Dorn frunce el ceño.',v:{dorn:-1},m:{plan:'mixto'}}}
    ]}
  ],
  cierre:'En una reunión no basta con tener razón: importa cómo y cuándo hablas. Una herramienta útil es preguntar “¿qué quieres evitar?” antes de discutir soluciones.'
}
// Escenas 3 a 9: se agregan aquí siguiendo el guion.
];

const FINALES = {
  1:{t:'El colmillo que arde junto',x:'La banda llega entera al amanecer y cada uno hace lo que mejor sabe. Tamb ya no baja la mirada.'},
  2:{t:'La banda dividida',x:'Al amanecer la banda se parte: unos se quedan con Tamb y otros se van con Dorn. La unidad no se rompió en un día, se rompió en conversaciones que no tuvieron lugar.'},
  3:{t:'Traición desde adentro',x:'Dorn toma el mando y la banda ataca sin Tamb. Los que confiaban en él se quedan a su lado. Todavía puede empezar de nuevo.'},
  4:{t:'Victoria vacía',x:'Ganan la batalla, pero pierden gente por el camino. Tamb queda con un valle conquistado y una banda rota.'}
};
const CIERRE_JUEGO = ['¿Qué habilidad usaste más?','¿Qué conversación habrías hecho distinta?','¿Con qué personaje te identificaste?'];
const APRENDIZAJE = 'Cada escena trabaja una habilidad blanda.';
