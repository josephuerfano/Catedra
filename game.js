// Motor del juego: estado, reglas de stats, XP, vínculos, niveles y finales.
const STATS = {emp:'Empatía',esc:'Escucha activa',ase:'Comunicación asertiva',con:'Manejo de conflictos',lid:'Liderazgo'};
const XP_NIVEL = 60, MAX_NIVELES = 5, PUNTOS_NIVEL = 2, KEY = 'tamb_guardado';
const ALIADOS = ['grakk','snik','mora','vrak','zuzu'];
let E = null;
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

function nuevo(){
  return {i:0, stats:{emp:7,esc:7,ase:2,con:3,lid:3}, xp:0, niv:0, pts:0,
    v:{grakk:3,snik:3,mora:2,vrak:3,zuzu:3,dorn:2}, m:{}, seg:0, v5:{}};
}
function guardar(){ try{ localStorage.setItem(KEY, JSON.stringify(E)); }catch(e){} }
function leer(){ try{ return JSON.parse(localStorage.getItem(KEY)); }catch(e){ return null; } }
function seguridad(){ return E.seg >= 10 ? 'firme' : E.seg >= 5 ? 'tanteando' : 'dudoso'; }

const barra = n => `<div class="barra"><i style="width:${n*10}%"></i></div>`;
function hud(){
  $('v-stats').innerHTML = `<h4>Tamb · Nivel ${E.niv + 1}</h4><div class="sub">XP ${E.xp} · ${seguridad()}</div>` +
    Object.keys(STATS).map(k => `<div class="fila2"><span title="${STATS[k]}">${STATS[k]}</span>${barra(E.stats[k])}<b>${E.stats[k]}</b></div>`).join('');
  $('v-vinc').innerHTML = '<h4>Vínculos</h4><div class="sub">Confianza de cada uno</div>' +
    Object.keys(E.v).map(k => `<div class="fila2"><span>${PERSONAJES[k].n}</span>${barra(E.v[k])}<b>${E.v[k]}</b></div>`).join('');
}

// Tamb siempre a la izquierda; a la derecha, el personaje con quien se habla en la escena.
let ultimo = null, escId = null;
const ficha = (id, activo) => { const p = PERSONAJES[id]; return `<div class="pj ${p.t||''} ${activo?'habla':''}" style="background:${p.c}">${p.n}</div>`; };
function escenario(sc, habla){
  if(escId !== sc.id){ escId = sc.id; ultimo = sc.foco || sc.pj.find(x => x !== 'tamb'); }
  if(habla && habla !== 'narr' && habla !== 'tamb') ultimo = habla;
  $('fondo').style.backgroundImage = sc.fondo ? `url(${sc.fondo})` : 'none';
  $('izq').innerHTML = ficha('tamb', !habla || habla === 'narr' || habla === 'tamb');
  $('der').innerHTML = ultimo ? ficha(ultimo, habla === ultimo) : '';
}
function hablante(id){ $('hablante').textContent = id==='narr' ? '' : PERSONAJES[id].n; }
function limpiar(){ $('opciones').innerHTML = ''; }
function boton(txt, fn, cls, sub){
  const b = document.createElement('button');
  b.innerHTML = esc(txt) + (sub ? `<small>${sub}</small>` : '');
  if(cls) b.className = cls;
  b.onclick = fn; $('opciones').appendChild(b); return b;
}

// ---- flujo de una escena
function empezarEscena(){
  const sc = ESCENAS[E.i];
  if(!sc) return fin();
  guardar(); hud(); $('pantalla').hidden = true;
  titulo(sc, () => linea(0));
}
function titulo(sc, sig){
  escenario(sc, null); hablante('narr'); limpiar();
  $('texto').textContent = `Escena ${sc.id}: ${sc.titulo}`;
  boton('Empezar', sig);
}
function linea(n){
  const sc = ESCENAS[E.i], l = sc.situacion[n];
  if(!l) return decision(0);
  escenario(sc, l.p); hablante(l.p); $('texto').textContent = l.t; limpiar();
  boton('Continuar', () => linea(n+1));
}
function decision(n){
  const sc = ESCENAS[E.i], d = sc.decisiones[n];
  if(!d) return cierre();
  escenario(sc, d.p); hablante(d.p); $('texto').textContent = d.t; limpiar();
  d.op.forEach(o => {
    if(o.req && !E.m[o.req]) return;
    if(!o.s){ boton(o.t, () => elegir(n, o, o.r, false)); return; }
    const st = E.stats[o.s], nom = STATS[o.s], tag = `${nom} ${o.d}`;
    if(st >= o.d) boton(o.t, () => elegir(n, o, o.r, true), 'dificil', tag);
    else if(st >= o.d - 2) boton(o.t, () => elegir(n, o, o.q || o.r, true), 'dificil', `${tag} · te falta práctica, puede salir torpe`);
    else { const b = boton(o.t, null, 'dificil', `${tag} · sabes qué decir, pero no te sale`); b.disabled = true; }
  });
}
function elegir(n, o, res, dificil){
  E.xp += dificil ? 15 : 10;
  if(dificil) E.seg++;
  Object.keys(res.v || {}).forEach(k => {
    E.v[k] = Math.max(0, Math.min(10, E.v[k] + res.v[k]));
    if(E.v[k] >= 5 && !E.v5[k]){ E.v5[k] = 1; E.seg++; }
  });
  Object.assign(E.m, res.m || {});
  while(E.niv + E.pts/PUNTOS_NIVEL < MAX_NIVELES && E.xp >= XP_NIVEL * (E.niv + E.pts/PUNTOS_NIVEL + 1)) E.pts += PUNTOS_NIVEL;
  hud(); limpiar(); $('texto').textContent = res.x;
  boton('Continuar', () => decision(n+1));
}
function cierre(){
  const sc = ESCENAS[E.i];
  $('pantalla').hidden = false;
  $('pantalla').innerHTML = `<h2>Lo que pasó</h2><p>${esc(sc.cierre)}</p><div class="acciones"><button id="sig">Continuar</button></div>`;
  $('sig').onclick = () => E.pts > 0 ? nivel() : siguiente();
}
function siguiente(){ E.i++; empezarEscena(); }

// ---- subir de nivel: el jugador reparte los puntos
function nivel(){
  let libres = E.pts; const nuevos = {...E.stats};
  const dibujar = () => {
    $('pantalla').innerHTML = `<h2>Subiste de nivel</h2><p>Reparte ${E.pts} puntos como quieras. No se puede dominar todo.</p>` +
      Object.keys(STATS).map(k => `<div class="fila"><span>${STATS[k]}: <b>${nuevos[k]}</b></span><button data-k="${k}" data-d="-1">−</button><button data-k="${k}" data-d="1">+</button></div>`).join('') +
      `<p>Puntos libres: <b>${libres}</b></p><div class="acciones"><button id="ok" ${libres?'disabled':''}>Confirmar</button></div>`;
    document.querySelectorAll('.fila button').forEach(b => b.onclick = () => {
      const k = b.dataset.k, d = +b.dataset.d;
      if(d > 0 && libres > 0 && nuevos[k] < 10){ nuevos[k]++; libres--; }
      if(d < 0 && nuevos[k] > E.stats[k]){ nuevos[k]--; libres++; }
      dibujar();
    });
    $('ok').onclick = () => { E.stats = nuevos; E.niv += E.pts/PUNTOS_NIVEL; E.pts = 0; hud(); siguiente(); };
  };
  dibujar();
}

// ---- final
function calcularFinal(){
  const A = ALIADOS.filter(k => E.v[k] >= 6).length, m = E.m;
  if(m.cedioMando || A <= 1) return 3;
  if(m.decisionFinal === 'dividir') return 2;
  if(A >= 4 && E.v.dorn >= 5) return 1;
  if(m.decisionFinal === 'atacar' && (m.smAcuerdo !== 'si' || E.v.grakk < 6)) return 4;
  return 2;
}
function resumen(){
  return '<h3>Tus stats</h3>' + Object.keys(STATS).map(k => `<div class="fila"><span>${STATS[k]}</span><div class="barra"><i style="width:${E.stats[k]*10}%"></i></div><b>${E.stats[k]}</b></div>`).join('') +
    '<h3>Tus vínculos</h3>' + Object.keys(E.v).map(k => `<div class="fila"><span>${PERSONAJES[k].n}</span><div class="barra"><i style="width:${E.v[k]*10}%"></i></div><b>${E.v[k]}</b></div>`).join('');
}
function fin(){
  hud(); $('pantalla').hidden = false;
  const completo = ESCENAS.some(s => s.id === 9);
  let cab;
  if(completo){ const f = FINALES[calcularFinal()]; cab = `<h2>${esc(f.t)}</h2><p>${esc(f.x)}</p><h3>Para pensar</h3><ul>${CIERRE_JUEGO.map(q=>`<li>${q}</li>`).join('')}</ul>`; }
  else cab = `<h2>Fin de las escenas cargadas</h2><p>Hay ${ESCENAS.length} de 9 escenas disponibles. El resto se agrega en escenas.js.</p>`;
  $('pantalla').innerHTML = cab + resumen() + '<div class="acciones"><button id="otra">Jugar de nuevo</button></div>';
  $('otra').onclick = inicio;
}

// ---- inicio
function inicio(){
  $('pantalla').hidden = false;
  const g = leer();
  $('pantalla').innerHTML = `<h2>Tamb y su banda</h2><p>Heredaste el mando de una banda de goblins y orcos. Quieren invadir un reino, pero el verdadero problema está adentro. Cada decisión cambia tus stats, tus vínculos y el final.</p><div class="acciones"><button id="nueva">Nueva partida</button>${g ? '<button id="cont">Continuar</button>' : ''}</div>`;
  $('nueva').onclick = () => { E = nuevo(); empezarEscena(); };
  if(g) $('cont').onclick = () => { E = g; empezarEscena(); };
  E = E || nuevo(); hud();
}
inicio();
