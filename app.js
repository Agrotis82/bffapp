/* =============================================
   BFFapp · app.js — versión final
   Con login simple + módulo regalo rediseñado
   ============================================= */

const API = '/api';
const get  = async path => { const r = await fetch(API+path); if(!r.ok) throw new Error(`GET ${path} → ${r.status}`); return r.json(); };
const post = async (path,body) => { const r = await fetch(API+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); if(!r.ok) throw new Error(`POST ${path} → ${r.status}`); return r.json(); };
const put  = async (path,body) => { const r = await fetch(API+path,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}); if(!r.ok) throw new Error(`PUT ${path} → ${r.status}`); return r.json(); };
const del  = async path => { const r = await fetch(API+path,{method:'DELETE'}); if(!r.ok) throw new Error(`DELETE ${path} → ${r.status}`); return r.json(); };

/* ══ LOGIN ══ */
let currentUser = null;

const APP_PASSWORD = 'lasonce';

function loadSession() {
  try { const s = localStorage.getItem('bffapp_user'); if(s) currentUser = JSON.parse(s); } catch(e) {}
  return !!currentUser;
}

function checkPassword() {
  const passwordAuthorized = localStorage.getItem('bffapp_auth') === APP_PASSWORD;
  return passwordAuthorized;
}

function showPasswordScreen() {
  document.getElementById('password-screen').style.display = 'flex';
  document.getElementById('login-screen').style.display    = 'none';
  document.getElementById('app-shell').style.display       = 'none';
  setTimeout(() => document.getElementById('pwd-input')?.focus(), 100);
}

function submitPassword() {
  const val = document.getElementById('pwd-input').value;
  if(val === APP_PASSWORD) {
    localStorage.setItem('bffapp_auth', APP_PASSWORD);
    document.getElementById('password-screen').style.display = 'none';
    showLoginScreen();
  } else {
    const err = document.getElementById('pwd-error');
    const inp = document.getElementById('pwd-input');
    if(err) { err.style.display = 'block'; }
    if(inp) { inp.style.borderColor = '#E24B4A'; inp.value = ''; inp.focus(); }
    setTimeout(() => {
      if(err) err.style.display = 'none';
      if(inp) inp.style.borderColor = '';
    }, 2000);
  }
}
function saveSession(chica) { currentUser = chica; localStorage.setItem('bffapp_user', JSON.stringify(chica)); }
function clearSession() { currentUser = null; localStorage.removeItem('bffapp_user'); }

function showLoginScreen() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('app-shell').style.display    = 'none';
  const grid = document.getElementById('login-chicas-grid');
  if(!grid) return;
  grid.innerHTML = window.chicas.map(c => `
    <div onclick="selectLogin(${c.id})" style="cursor:pointer;text-align:center;padding:10px 6px;border-radius:14px;border:2px solid transparent;transition:all 0.15s;" onmouseover="this.style.background='var(--aurora-l)';this.style.borderColor='var(--aurora-1)'" onmouseout="this.style.background='transparent';this.style.borderColor='transparent'">
      <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,${c.bg_color},${c.color}22);color:${c.color};display:flex;align-items:center;justify-content:center;font-size:${(c.apodo||c.nombre).length>3?'11px':'14px'};font-weight:500;margin:0 auto 6px;border:2px solid ${c.color};">
        ${c.apodo||c.nombre.slice(0,2)}
      </div>
      <div style="font-size:11px;font-weight:500;color:var(--text);">${c.nombre.split(' ')[0]}</div>
    </div>`).join('');
}

function selectLogin(chicaId) {
  const chica = window.chicas.find(c => c.id === chicaId);
  if(!chica) return;
  saveSession(chica);
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app-shell').style.display    = 'flex';
  postLoginRender();
}

function postLoginRender() {
  const userEl = document.getElementById('topbar-user');
  if(userEl && currentUser) {
    userEl.innerHTML = `
      <div onclick="confirmLogout()" style="display:flex;align-items:center;gap:5px;cursor:pointer;background:var(--aurora-l);border-radius:20px;padding:3px 8px 3px 3px;border:1px solid var(--aurora-1);">
        <div style="width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#7C3AED,#DB2777);color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:500;flex-shrink:0;">
          ${(currentUser.apodo||currentUser.nombre).slice(0,2)}
        </div>
        <span style="font-size:11px;font-weight:500;color:var(--aurora-d);">${currentUser.nombre.split(' ')[0]}</span>
      </div>`;
  }
  loadRegalo().catch(e => console.warn('Regalo:', e));
}

function confirmLogout() {
  openModal(`
    <div class="modal-title">👋 Hola, ${currentUser?.nombre?.split(' ')[0]}!</div>
    <div style="background:var(--surface);border-radius:12px;padding:0.75rem 1rem;margin-bottom:1rem;display:flex;align-items:center;gap:10px;">
      <div style="width:40px;height:40px;border-radius:50%;background:${currentUser.bg_color};color:${currentUser.color};display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:500;">${(currentUser.apodo||currentUser.nombre).slice(0,2)}</div>
      <div><div style="font-size:14px;font-weight:500;color:var(--text);">${currentUser.nombre}</div><div style="font-size:11px;color:var(--text-sec);">Usuario activo</div></div>
    </div>
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-save" onclick="logout()" style="background:var(--purple);">🔄 Cambiar usuario</button>
    </div>`);
}

function logout() { clearSession(); closeModal(); showLoginScreen(); }

/* ══ STATE ══ */
window.chicas = [];
let eventos = [], days = [], polls = {}, misiones = [];
let currentEventoId = null, encuestasEventoActual = null;

const CATS_FIN = [
  {id:'alojamiento',icon:'🏨',label:'Alojamiento',bg:'#E6F1FB',color:'#0C447C'},
  {id:'transporte', icon:'✈️',label:'Transporte', bg:'#EEEDFE',color:'#26215C'},
  {id:'comida',     icon:'🍽️',label:'Comida',     bg:'#E1F5EE',color:'#085041'},
  {id:'actividad',  icon:'🎡',label:'Actividad',  bg:'#FAEEDA',color:'#633806'},
  {id:'compras',    icon:'🛍️',label:'Compras',    bg:'#FBEAF0',color:'#4B1528'},
  {id:'otro',       icon:'📌',label:'Otro',       bg:'#F1EFE8',color:'#444441'},
];
let finState = {eventoId:null,moneda:'USD',gastos:[],gastosAll:null,totales:[],deudas:[],balance:[],editingGasto:null,selCats:['alojamiento'],selSplit:[],selMon:'USD',rsvpConfirmadas:[],comprobanteUrl:null,comprobanteName:null};
const TIPOS = {
  viaje: {icon:'✈️',label:'Viaje',  color:'var(--hot)',   badge:'badge-red'   },
  spa:   {icon:'🧖',label:'Spa',    color:'var(--teal)',  badge:'badge-teal'  },
  salida:{icon:'🍽️',label:'Salida', color:'var(--amber)', badge:'badge-amber' },
  cumple:{icon:'🎂',label:'Cumple', color:'var(--purple)',badge:'badge-purple'},
  otro:  {icon:'📍',label:'Otro',   color:'var(--blue)',  badge:'badge-blue'  },
};
const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

/* ══ HELPERS ══ */
function getCatFin(id){return CATS_FIN.find(c=>c.id===id)||CATS_FIN[5];}
function fmt(m,mon){if(m===null||m===undefined)return'–';const n=parseFloat(m);return mon==='ARS'?`$${n.toLocaleString('es-AR',{maximumFractionDigits:0})}`:`$${n.toFixed(2)}`;}
function cleanDate(d){return d?String(d).slice(0,10):null;}
function formatFecha(f){const c=cleanDate(f);if(!c)return'';const p=c.split('-');return`${parseInt(p[2])} ${meses[parseInt(p[1])-1]} ${p[0]}`;}
function bdayLabel(b){const c=cleanDate(b);if(!c)return'';const p=c.split('-');return`${parseInt(p[2])} ${meses[parseInt(p[1])-1]}`;}
function daysUntilBday(b){const c=cleanDate(b);if(!c)return 999;const p=c.split('-');const today=new Date();const next=new Date(today.getFullYear(),parseInt(p[1])-1,parseInt(p[2]));if(next<today)next.setFullYear(today.getFullYear()+1);return Math.ceil((next-today)/(864e5));}
function timeAgo(ts){const d=Math.floor((Date.now()-new Date(ts))/60000);if(d<1)return'Ahora';if(d<60)return`Hace ${d}m`;if(d<1440)return`Hace ${Math.floor(d/60)}h`;return`Hace ${Math.floor(d/1440)}d`;}

/* ══ NAV / MODAL ══ */
function goTo(s){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.nav-item').forEach(b=>{b.classList.remove('active');b.querySelector('.nav-label')?.style.setProperty('color','');b.querySelector('.nav-icon')?.style.setProperty('color','');});document.getElementById('screen-'+s)?.classList.add('active');const nb=document.getElementById('nav-'+s);if(nb){nb.classList.add('active');nb.querySelector('.nav-label')?.style.setProperty('color','var(--hot)');nb.querySelector('.nav-icon')?.style.setProperty('color','var(--hot)');}}
function openModal(html){document.getElementById('modal-inner').innerHTML=`<div class="modal-handle"></div><button onclick="closeModal()" style="position:absolute;top:1rem;right:1.25rem;background:none;border:none;font-size:22px;cursor:pointer;color:var(--text-ter);line-height:1;padding:0;">×</button>${html}`;document.getElementById('modal').style.display='flex';}
function closeModal(){document.getElementById('modal').style.display='none';}

/* ══ HOME ══ */
async function renderHome(){
  const avRow=document.getElementById('home-avatars');
  if(avRow)avRow.innerHTML=window.chicas.map(c=>`<div class="av" style="background:${c.bg_color};color:${c.color};font-size:${(c.apodo||c.nombre).length>2?'9px':'10px'};">${c.apodo||c.nombre.slice(0,2)}</div>`).join('');
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const sorted=[...eventos]
    .filter(e => !e.fecha_inicio || new Date(e.fecha_inicio+'T12:00:00') >= hoy)
    .sort((a,b)=>new Date(a.fecha_inicio||'9999')-new Date(b.fecha_inicio||'9999'));
  const p = sorted[0] || [...eventos].sort((a,b)=>new Date(b.fecha_inicio||'0')-new Date(a.fecha_inicio||'0'))[0];
  if(p){const t=TIPOS[p.tipo]||TIPOS.otro;const el=document.getElementById('home-hero-name');if(el)el.textContent=`${t.icon} ${p.nombre}`;const sub=document.getElementById('home-hero-sub');if(sub)sub.textContent=[p.fecha_inicio&&formatFecha(p.fecha_inicio),p.hotel||p.lugar].filter(Boolean).join(' · ');if(p.fecha_inicio){
      const diff=Math.ceil((new Date(p.fecha_inicio+'T12:00:00')-new Date())/864e5);
      const el2=document.getElementById('home-dias');
      if(el2){
        if(diff>0) el2.textContent=`${t.icon} En ${diff} días`;
        else if(diff===0) el2.textContent=`${t.icon} ¡Es hoy!`;
        else el2.textContent=`${t.icon} ${Math.abs(diff)}d atrás`;
      }
    }}
  if(document.getElementById('total-chicas'))document.getElementById('total-chicas').textContent=window.chicas.length;
  if(document.getElementById('home-eventos-sub'))document.getElementById('home-eventos-sub').textContent=`${eventos.length} planes`;
  if(document.getElementById('home-chicas-sub'))document.getElementById('home-chicas-sub').textContent=`${window.chicas.length} chicas`;
  try{const feed=await get('/feed');const feedEl=document.getElementById('feed-list');if(feedEl){feedEl.innerHTML=feed.length?feed.map(f=>`<div class="feed-item" id="feed-${f.id}"><div class="feed-av" style="background:${f.bg_color||'#eee'};color:${f.color||'#333'};">${f.apodo||'?'}</div><div style="flex:1;"><div class="feed-text">${f.texto}</div><div class="feed-time">${timeAgo(f.created_at)}</div></div><button onclick="confirmDeleteFeed(${f.id})" style="background:none;border:none;cursor:pointer;color:var(--text-ter);font-size:18px;padding:2px 4px;flex-shrink:0;line-height:1;">×</button></div>`).join(''):'<div style="font-size:12px;color:var(--text-ter);padding:8px 0;">Sin actividad reciente</div>';}}catch(e){console.warn('Feed:',e);}
}
function confirmDeleteFeed(id){openModal(`<div class="modal-title">¿Eliminar notificación?</div><div style="font-size:13px;color:var(--text-sec);margin-bottom:1rem;">Esta acción no se puede deshacer.</div><div class="modal-btns"><button class="btn-cancel" onclick="closeModal()">Cancelar</button><button class="btn-danger" style="flex:2;" onclick="deleteFeedItem(${id})">Eliminar</button></div>`);}
async function deleteFeedItem(id){try{await del(`/feed/${id}`);}catch(e){}closeModal();const el=document.getElementById(`feed-${id}`);if(el){el.style.transition='opacity 0.3s,max-height 0.3s';el.style.overflow='hidden';el.style.maxHeight=el.offsetHeight+'px';setTimeout(()=>{el.style.opacity='0';el.style.maxHeight='0';},10);setTimeout(()=>el.remove(),320);}}

/* ══ EVENTOS ══ */
let eventosFiltro='todos';
function renderEventos(f){
  if(f)eventosFiltro=f;
  const container=document.getElementById('eventos-list');if(!container)return;
  const filtered=eventosFiltro==='todos'?eventos:eventos.filter(e=>e.tipo===eventosFiltro);
  if(!filtered.length){container.innerHTML=`<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-text">No hay planes de este tipo</div><div class="empty-state-sub">¡Creá uno con el botón de arriba!</div></div>`;return;}
  container.innerHTML=filtered.map(e=>{
    const t=TIPOS[e.tipo]||TIPOS.otro;
    const fStr=e.fecha_inicio?`📅 ${formatFecha(e.fecha_inicio)}${e.fecha_fin?' → '+formatFecha(e.fecha_fin):''}`:'📅 Fecha por confirmar';
    return `<div class="evento-card"><div style="height:3px;background:${t.color};"></div><div class="evento-card-header"><div style="flex:1;min-width:0;"><div style="margin-bottom:5px;"><span class="badge ${t.badge}">${t.icon} ${t.label}</span></div><div class="evento-nombre">${e.nombre}</div><div class="evento-meta" style="flex-direction:column;gap:3px;"><span>${fStr}</span>${e.hotel||e.lugar?`<span>📍 ${e.hotel||e.lugar}</span>`:''} ${e.confirmadas_count?`<span>👯 ${e.confirmadas_count} van</span>`:''}</div></div><div style="display:flex;gap:4px;flex-shrink:0;margin-left:8px;"><button class="icon-btn e" onclick="openEditEventoModal(${e.id})"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button><button class="icon-btn" style="color:#991B1B;background:#FEE2E2;" onclick="confirmEliminarEvento(${e.id})"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg></button></div></div><div class="evento-actions">${e.tipo==='viaje'?`<button class="evento-btn primary" onclick="abrirDetalle(${e.id})">Ver itinerario →</button>`:''}<button class="evento-btn" onclick="abrirEncuestas(${e.id})">🗳️ Encuestas</button><button class="evento-btn" onclick="shareWhatsApp('evento',${e.id})">📱 Compartir</button></div></div>`;
  }).join('');
}
function filterEventos(val,btn){document.querySelectorAll('#eventos-filters .filter-btn').forEach(b=>b.classList.remove('on'));btn.classList.add('on');renderEventos(val);}
function abrirDetalle(id){currentEventoId=id;goTo('rio');loadRio(id);}
function openNewEventoModal(){
  openModal(`<div class="modal-title">Nuevo plan</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px;">${Object.entries(TIPOS).map(([k,v],i)=>`<div class="cat-opt ${i===0?'sel':''}" id="tipo-${k}" style="${i===0?`border-color:${v.color};background:var(--surface);`:''}" onclick="selTipo('${k}','${v.color}')"><div style="font-size:18px;text-align:center;">${v.icon}</div><div style="font-size:10px;font-weight:500;color:var(--text-sec);text-align:center;">${v.label}</div></div>`).join('')}</div><input type="hidden" id="m-tipo" value="viaje"><label class="field-label">Nombre del plan</label><input class="field-input" id="m-nombre" placeholder="Ej: Viaje a Bariloche"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><div><label class="field-label">Fecha inicio</label><input class="field-input" id="m-fi" type="date"></div><div><label class="field-label">Fecha fin</label><input class="field-input" id="m-ff" type="date"></div></div><label class="field-label">Lugar / Hotel</label><input class="field-input" id="m-lugar" placeholder="Ej: Hotel Llao Llao"><label class="field-label">Descripción (opcional)</label><input class="field-input" id="m-desc" placeholder="Detalles..."><div class="modal-btns"><button class="btn-cancel" onclick="closeModal()">Cancelar</button><button class="btn-save" onclick="crearEvento()">Crear ✨</button></div>`);
}
function selTipo(k,color){document.querySelectorAll('[id^="tipo-"]').forEach(el=>{el.classList.remove('sel');el.style.borderColor='';el.style.background='';});const el=document.getElementById('tipo-'+k);if(el){el.classList.add('sel');el.style.borderColor=color;el.style.background='var(--surface)';}document.getElementById('m-tipo').value=k;}
async function crearEvento(){const nombre=document.getElementById('m-nombre').value.trim();if(!nombre)return;const lugar=document.getElementById('m-lugar').value.trim();await post('/eventos',{tipo:document.getElementById('m-tipo').value,nombre,descripcion:document.getElementById('m-desc').value.trim(),fecha_inicio:document.getElementById('m-fi').value||null,fecha_fin:document.getElementById('m-ff').value||null,lugar,hotel:lugar,cupo_max:null});eventos=await get('/eventos');closeModal();renderEventos();renderHome();}
async function openEditEventoModal(eventoId){
  const e=eventos.find(e=>e.id===eventoId);if(!e)return;
  const t=TIPOS[e.tipo]||TIPOS.otro;let rsvpActual=[];
  try{const rsvp=await get(`/rsvp/${eventoId}`);rsvpActual=rsvp.filter(r=>r.estado==='confirmada').map(r=>r.chica_id);}catch(err){}
  openModal(`<div class="modal-title">Editar plan</div><div style="display:flex;align-items:center;gap:8px;margin-bottom:1rem;"><span class="badge ${t.badge}">${t.icon} ${t.label}</span><span style="font-family:var(--fd);font-size:15px;">${e.nombre}</span></div><label class="field-label">Nombre</label><input class="field-input" id="m-nombre" value="${e.nombre}"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><div><label class="field-label">Fecha inicio</label><input class="field-input" id="m-fi" type="date" value="${e.fecha_inicio||''}"></div><div><label class="field-label">Fecha fin</label><input class="field-input" id="m-ff" type="date" value="${e.fecha_fin||''}"></div></div><label class="field-label">Lugar / Hotel</label><input class="field-input" id="m-lugar" value="${e.hotel||e.lugar||''}"><label class="field-label">Descripción</label><input class="field-input" id="m-desc" value="${e.descripcion||''}"><label class="field-label">¿Quiénes van? <span style="font-weight:400;color:var(--text-ter);">${rsvpActual.length} confirmadas</span></label><div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">${window.chicas.map(c=>{const va=rsvpActual.includes(c.id);return`<div class="split-chip ${va?'sel':''}" id="rsvp-${c.id}" style="${va?'border-color:var(--teal);background:var(--teal-l);':''}" onclick="toggleRsvpChip(${c.id})"><div style="width:18px;height:18px;border-radius:50%;background:${c.bg_color};color:${c.color};display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:500;">${(c.apodo||c.nombre).slice(0,2)}</div>${c.nombre.split(' ')[0]}</div>`;}).join('')}</div><div class="modal-btns"><button class="btn-danger" onclick="archivarEvento(${e.id})">Archivar</button><button class="btn-save" onclick="guardarEvento(${e.id})">Guardar</button></div>`);
  window._editRsvp={eventoId,confirmadas:[...rsvpActual]};
}
function toggleRsvpChip(id){if(!window._editRsvp)return;const a=window._editRsvp.confirmadas;window._editRsvp.confirmadas=a.includes(id)?a.filter(x=>x!==id):[...a,id];const el=document.getElementById(`rsvp-${id}`);const va=window._editRsvp.confirmadas.includes(id);if(el){el.style.borderColor=va?'var(--teal)':'';el.style.background=va?'var(--teal-l)':'';el.classList.toggle('sel',va);}}
async function guardarEvento(id){const lugar=document.getElementById('m-lugar').value.trim();await put(`/eventos/${id}`,{nombre:document.getElementById('m-nombre').value.trim(),fecha_inicio:document.getElementById('m-fi').value||null,fecha_fin:document.getElementById('m-ff').value||null,lugar,hotel:lugar,descripcion:document.getElementById('m-desc').value.trim()});if(window._editRsvp&&window._editRsvp.eventoId===id){await put('/rsvp/bulk',{evento_id:id,confirmadas:window._editRsvp.confirmadas});if(finState.eventoId===id)finState.rsvpConfirmadas=window._editRsvp.confirmadas;window._editRsvp=null;}eventos=await get('/eventos');closeModal();renderEventos();renderHome();}
async function archivarEvento(id){await put(`/eventos/${id}/archivar`,{});eventos=eventos.filter(e=>e.id!==id);closeModal();renderEventos();renderHome();}

function confirmEliminarEvento(id){
  const e=eventos.find(e=>e.id===id);
  openModal(`
    <div class="modal-title">¿Eliminar "${e?.nombre}"?</div>
    <div style="font-size:13px;color:var(--text-sec);margin-bottom:1rem;">
      Se eliminará el evento y su itinerario. Los gastos asociados quedan en el historial.
    </div>
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-danger" style="flex:2;" onclick="archivarEvento(${id})">Sí, eliminar</button>
    </div>`);
}

/* ══ ENCUESTAS ══ */
function abrirEncuestas(eventoId){encuestasEventoActual=eventoId;const ev=eventos.find(e=>e.id===eventoId);openModal(`<div class="modal-title">🗳️ ${ev?.nombre||'Encuestas'}</div><div id="encuestas-modal-list" style="min-height:80px;"><div style="text-align:center;padding:1rem;font-size:12px;color:var(--text-ter);">Cargando...</div></div><button class="fin-add-btn" style="margin-top:0.5rem;" onclick="openNuevaEncuesta(${eventoId})">+ Nueva encuesta</button>`);cargarEncuestasModal(eventoId);}
async function cargarEncuestasModal(eventoId){try{const encuestas=await get(`/encuestas/${eventoId}`);const list=document.getElementById('encuestas-modal-list');if(!list)return;if(!encuestas.length){list.innerHTML='<div style="text-align:center;padding:1rem;font-size:12px;color:var(--text-ter);">Sin encuestas todavía</div>';return;}list.innerHTML=encuestas.map(p=>{const total=(p.opciones||[]).reduce((a,o)=>a+(o.votos||0),0);return`<div style="padding:10px 0;border-bottom:0.5px solid var(--border);"><div style="display:flex;justify-content:space-between;margin-bottom:6px;"><div style="font-size:13px;font-weight:500;">${p.titulo}</div><span style="font-size:10px;color:var(--text-ter);">${total} votos</span></div>${(p.opciones||[]).map(o=>{const pct=total>0?Math.round((o.votos||0)/total*100):0;return`<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;cursor:pointer;" onclick="votarEncuesta(${p.id},${o.id})"><div style="flex:1;font-size:12px;">${o.nombre}</div><div style="font-size:10px;color:var(--text-sec);min-width:28px;text-align:right;">${pct}%</div><div style="width:60px;height:4px;border-radius:4px;background:var(--border);overflow:hidden;"><div style="height:100%;border-radius:4px;background:var(--teal);width:${pct}%;"></div></div></div>`;}).join('')}<button class="add-opt-btn" style="margin-top:4px;border-radius:8px;" onclick="openAddOpcionEncuesta(${p.id})">+ Opción</button></div>`;}).join('');}catch(e){console.warn(e);}}
async function votarEncuesta(encId,optId){try{await post('/votos',{opcion_id:optId,chica_id:currentUser?.id||1});}catch(e){}cargarEncuestasModal(encuestasEventoActual);}
function openNuevaEncuesta(eventoId){openModal(`<div class="modal-title">Nueva encuesta</div><label class="field-label">Título</label><input class="field-input" id="enc-titulo" placeholder="Ej: ¿Qué día preferís?"><label class="field-label">Pregunta (opcional)</label><input class="field-input" id="enc-pregunta" placeholder="Detalles..."><div class="modal-btns"><button class="btn-cancel" onclick="closeModal()">Cancelar</button><button class="btn-save" onclick="crearEncuestaManual(${eventoId})">Crear</button></div>`);}
async function crearEncuestaManual(eventoId){const titulo=document.getElementById('enc-titulo').value.trim();if(!titulo)return;await post('/encuestas',{evento_id:eventoId,titulo,pregunta:document.getElementById('enc-pregunta').value.trim(),tipo:'opcion_unica'});closeModal();setTimeout(()=>abrirEncuestas(eventoId),100);}
async function openAddOpcionEncuesta(encId){openModal(`<div class="modal-title">Nueva opción</div><label class="field-label">Nombre</label><input class="field-input" id="oe-nombre" placeholder="Ej: Sábado 15"><div class="modal-btns"><button class="btn-cancel" onclick="closeModal()">Cancelar</button><button class="btn-save" onclick="agregarOpcionEncuesta(${encId})">Agregar</button></div>`);}
async function agregarOpcionEncuesta(encId){const nombre=document.getElementById('oe-nombre').value.trim();if(!nombre)return;await post('/encuestas/opcion',{encuesta_id:encId,nombre});closeModal();if(encuestasEventoActual)setTimeout(()=>abrirEncuestas(encuestasEventoActual),100);}

/* ══ ITINERARIO ══ */
async function loadRio(eventoId){const id=eventoId||eventos.find(e=>e.tipo==='viaje')?.id;const rio=eventos.find(e=>e.id===id);if(!rio)return;const dest=document.getElementById('r-destino');if(dest)dest.textContent=rio.nombre;const fech=document.getElementById('r-fechas');if(fech)fech.textContent=[rio.fecha_inicio&&formatFecha(rio.fecha_inicio),rio.fecha_fin&&'→ '+formatFecha(rio.fecha_fin),rio.hotel||rio.lugar].filter(Boolean).join(' ');try{days=await get(`/itinerario/${id}`);renderDays(id);}catch(e){console.warn('Itinerario:',e);}}
const DAY_COLORS=[{cl:'#FCEBEB',tc:'#A32D2D'},{cl:'#EEEDFE',tc:'#26215C'},{cl:'#E1F5EE',tc:'#085041'},{cl:'#FAEEDA',tc:'#633806'},{cl:'#E6F1FB',tc:'#0C447C'},{cl:'#EAF3DE',tc:'#27500A'}];
function renderDays(eventoId){const container=document.getElementById('days-rio');if(!container)return;container.innerHTML='';days.forEach((day,i)=>{const c=DAY_COLORS[i%DAY_COLORS.length];const actsHtml=(day.actividades||[]).map(a=>`<div class="act-row"><div class="act-time">${a.momento||''}</div><div class="act-dot" style="background:#7F77DD;"></div><div class="act-body"><div class="act-name">${a.nombre}</div><div class="act-desc">${a.descripcion||''}</div></div><div class="act-actions"><button class="act-icon-btn" onclick="openEditAct(${day.id},${a.id})">✏️</button><button class="act-icon-btn" onclick="confirmDeleteAct(${a.id},${eventoId||currentEventoId})">🗑</button></div></div>`).join('');const div=document.createElement('div');div.className='day-section';div.innerHTML=`<div class="day-header-row"><div class="day-num" style="background:${c.cl};color:${c.tc};">${day.numero_dia}</div><div style="flex:1;"><div class="day-title">${day.titulo}</div><div class="day-date">${day.fecha?formatFecha(day.fecha):''}</div></div><button class="icon-btn e" onclick="openEditDay(${day.id})"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button></div><div class="act-list">${actsHtml}<button class="add-act-btn" onclick="openAddAct(${day.id},${eventoId||currentEventoId})"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Agregar actividad</button></div>`;container.appendChild(div);});}
function openRioModal(){const rio=eventos.find(e=>e.id===currentEventoId)||eventos.find(e=>e.tipo==='viaje');if(!rio)return;openModal(`<div class="modal-title">Editar viaje</div><label class="field-label">Nombre</label><input class="field-input" id="m-nombre" value="${rio.nombre}"><label class="field-label">Hotel / Lugar</label><input class="field-input" id="m-hotel" value="${rio.hotel||rio.lugar||''}"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><div><label class="field-label">Fecha inicio</label><input class="field-input" id="m-fi" type="date" value="${rio.fecha_inicio||''}"></div><div><label class="field-label">Fecha fin</label><input class="field-input" id="m-ff" type="date" value="${rio.fecha_fin||''}"></div></div><div class="modal-btns"><button class="btn-cancel" onclick="closeModal()">Cancelar</button><button class="btn-save" onclick="saveRioDB(${rio.id})">Guardar</button></div>`);}
async function saveRioDB(id){const lugar=document.getElementById('m-hotel').value;await put(`/eventos/${id}`,{nombre:document.getElementById('m-nombre').value,hotel:lugar,lugar,fecha_inicio:document.getElementById('m-fi').value,fecha_fin:document.getElementById('m-ff').value,descripcion:''});closeModal();eventos=await get('/eventos');loadRio(id);}
function openEditDay(dayId){const d=days.find(d=>d.id===dayId);if(!d)return;openModal(`<div class="modal-title">Editar día ${d.numero_dia}</div><label class="field-label">Título</label><input class="field-input" id="m-dt" value="${d.titulo}"><label class="field-label">Fecha</label><input class="field-input" id="m-dd" type="date" value="${d.fecha||''}"><div class="modal-btns"><button class="btn-cancel" onclick="closeModal()">Cancelar</button><button class="btn-save" onclick="saveDayLocal(${dayId})">Guardar</button></div>`);}
function saveDayLocal(id){const d=days.find(d=>d.id===id);if(d){d.titulo=document.getElementById('m-dt').value;d.fecha=document.getElementById('m-dd').value;}closeModal();renderDays(currentEventoId);}
const TIME_OPTS=['Mañana','Mediodía','Tarde','Noche','Todo el día'];
function openAddAct(dayId,eventoId){openModal(`<div class="modal-title">Nueva actividad</div><label class="field-label">Nombre</label><input class="field-input" id="m-an" placeholder="Ej: Visita al museo"><label class="field-label">Descripción</label><input class="field-input" id="m-ad" placeholder="Detalles..."><label class="field-label">Momento</label><select class="field-input" id="m-at">${TIME_OPTS.map(t=>`<option>${t}</option>`).join('')}</select><div class="modal-btns"><button class="btn-cancel" onclick="closeModal()">Cancelar</button><button class="btn-save" onclick="saveActDB(${dayId},null,${eventoId})">Agregar</button></div>`);}
function openEditAct(dayId,actId){const d=days.find(d=>d.id===dayId);const a=d?.actividades?.find(a=>a.id===actId);if(!a)return;openModal(`<div class="modal-title">Editar actividad</div><label class="field-label">Nombre</label><input class="field-input" id="m-an" value="${a.nombre}"><label class="field-label">Descripción</label><input class="field-input" id="m-ad" value="${a.descripcion||''}"><label class="field-label">Momento</label><select class="field-input" id="m-at">${TIME_OPTS.map(t=>`<option ${a.momento===t?'selected':''}>${t}</option>`).join('')}</select><div class="modal-btns"><button class="btn-danger" onclick="confirmDeleteAct(${actId},${currentEventoId})">Eliminar</button><button class="btn-save" onclick="saveActDB(${dayId},${actId},${currentEventoId})">Guardar</button></div>`);}
async function saveActDB(dayId,actId,eventoId){const name=document.getElementById('m-an').value.trim();if(!name)return;const payload={dia_id:dayId,momento:document.getElementById('m-at').value,nombre:name,descripcion:document.getElementById('m-ad').value.trim(),categoria:'Actividad'};if(actId)await put(`/actividades/${actId}`,payload);else await post('/actividades',payload);closeModal();days=await get(`/itinerario/${eventoId}`);renderDays(eventoId);}
function confirmDeleteAct(actId,eventoId){openModal(`<div class="modal-title">¿Eliminar actividad?</div><div style="font-size:13px;color:var(--text-sec);margin-bottom:1rem;">Esta acción no se puede deshacer.</div><div class="modal-btns"><button class="btn-cancel" onclick="closeModal()">Cancelar</button><button class="btn-danger" style="flex:2;" onclick="deleteActDB(${actId},${eventoId})">Sí, eliminar</button></div>`);}
async function deleteActDB(actId,eventoId){await del(`/actividades/${actId}`);closeModal();days=await get(`/itinerario/${eventoId}`);renderDays(eventoId);}

/* ══ FINANZAS ══ */
async function loadFinanzas(){const rio=eventos.find(e=>e.tipo==='viaje');if(!rio)return;finState.eventoId=rio.id;try{const rsvp=await get(`/rsvp/${rio.id}`);finState.rsvpConfirmadas=rsvp.filter(r=>r.estado==='confirmada').map(r=>r.chica_id);}catch(e){finState.rsvpConfirmadas=window.chicas.map(c=>c.id);}await refreshFinanzas();}
async function refreshFinanzas(){try{const{eventoId,moneda}=finState;const[data,deudaData]=await Promise.all([get(`/gastos/${eventoId}`),get(`/gastos/${eventoId}/deudas?moneda=${moneda}`)]);finState.gastosAll=data.gastos||[];finState.gastos=(data.gastos||[]).filter(g=>g.moneda===moneda);finState.totales=data.totales||[];finState.deudas=deudaData.transacciones||[];finState.balance=deudaData.balance||[];renderFinanzasAll();}catch(e){console.warn('Finanzas:',e);}}
function renderFinanzasAll(){renderFinStats();renderFinGastos();renderFinDeudas();renderFinBalance();renderCerrarBtn();}
function renderCerrarBtn(){
  const btn=document.getElementById('fin-cerrar-btn');
  if(!btn) return;
  const deudas=finState.deudas||[];
  const gastos=finState.gastos||[];
  const todoSaldado=deudas.length===0 && gastos.length>0 && gastos.every(g=>g.saldado||g.solo_registro);
  btn.style.display=todoSaldado?'block':'none';
}

function confirmarCerrarEvento(){
  const ev=eventos.find(e=>e.id===finState.eventoId);
  openModal(`
    <div class="modal-title">✓ Cerrar evento</div>
    <div style="background:var(--teal-l);border-radius:12px;padding:1rem;margin-bottom:1rem;text-align:center;">
      <div style="font-size:20px;margin-bottom:4px;">🎉</div>
      <div style="font-size:14px;font-weight:500;color:var(--teal-d);">${ev?.nombre||'Evento'}</div>
      <div style="font-size:12px;color:var(--teal-m);margin-top:3px;">Todos los gastos están saldados</div>
    </div>
    <div style="font-size:13px;color:var(--text-sec);margin-bottom:1rem;">
      El evento se archivará y quedará solo como historial. No se pueden agregar más gastos.
    </div>
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-teal" onclick="cerrarEvento(${finState.eventoId})">Cerrar evento ✓</button>
    </div>`);
}

async function cerrarEvento(id){
  await put(\`/eventos/\${id}/archivar\`,{});
  eventos=eventos.filter(e=>e.id!==id);
  closeModal();
  renderEventos();
  renderHome();
  // Show history message in finanzas
  const list=document.getElementById('fin-gastos-list');
  if(list) list.insertAdjacentHTML('beforebegin','<div style="background:var(--teal-l);border-radius:12px;padding:0.85rem 1rem;margin-bottom:1rem;font-size:12px;color:var(--teal-d);text-align:center;">✓ Evento cerrado — historial guardado</div>');
}

function renderFinStats(){const{moneda,totales}=finState;const t=totales.find(t=>t.moneda===moneda)||{};const total=parseFloat(t.total||0);const saldado=parseFloat(t.saldado||0);const pendiente=parseFloat(t.pendiente||0);const divG=(finState.gastos||[]).filter(g=>!g.solo_registro);const nMax=Math.max(...divG.map(g=>g.participantes?.length||1),1);const xP=nMax>0?total/nMax:0;const pct=total>0?Math.round(saldado/total*100):0;const s=id=>document.getElementById(id);if(s('fin-stat-total'))s('fin-stat-total').textContent=fmt(total,moneda);if(s('fin-stat-xperson'))s('fin-stat-xperson').textContent=fmt(xP,moneda);if(s('fin-stat-pendiente'))s('fin-stat-pendiente').textContent=fmt(pendiente,moneda);if(s('fin-prog'))s('fin-prog').style.width=pct+'%';if(s('fin-prog-lbl'))s('fin-prog-lbl').textContent=`${pct}% saldado · ${fmt(saldado,moneda)} de ${fmt(total,moneda)}`;if(s('fin-moneda-lbl'))s('fin-moneda-lbl').textContent=moneda;const hs=s('home-finanzas-sub');if(hs)hs.textContent=pendiente>0?`${fmt(pendiente,moneda)} pendiente`:'✓ Todo saldado';}
function renderFinGastos(){const list=document.getElementById('fin-gastos-list');if(!list)return;const{gastos,moneda}=finState;if(!gastos.length){list.innerHTML=`<div style="text-align:center;padding:1.5rem;font-size:12px;color:var(--text-ter);">Sin gastos en ${moneda} todavía</div>`;return;}list.innerHTML=gastos.map(g=>{const cats=g.categoria?g.categoria.split(','):['otro'];const cat=getCatFin(cats[0]);const parte=g.participantes?.length>0?parseFloat(g.monto)/g.participantes.length:0;const avs=(g.participantes||[]).slice(0,5).map(p=>`<div style="width:18px;height:18px;border-radius:50%;background:${p.bg_color};color:${p.color};font-size:${(p.apodo||'?').length>2?'6px':'8px'};font-weight:500;display:inline-flex;align-items:center;justify-content:center;border:1.5px solid var(--card-bg);margin-left:-4px;">${p.apodo||'?'}</div>`).join('');return`<div class="fin-gasto-row${g.saldado?' saldado':''}${g.solo_registro?' solo-reg':''}"><div class="fin-cat-icon" style="background:${cat.bg};position:relative;">${cat.icon}${g.saldado?'<div style="position:absolute;inset:0;background:var(--teal);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;">✓</div>':''}</div><div style="flex:1;min-width:0;"><div class="fin-gasto-nombre">${g.nombre}</div><div class="fin-gasto-meta"><div class="fin-av-small" style="background:${g.pagado_por_bg};color:${g.pagado_por_color};" style="font-size:${(g.pagado_por_apodo||'?').length>2?'7px':'9px'};">${g.pagado_por_apodo||'?'}</div>pagó ${g.pagado_por_nombre} <div style="display:inline-flex;margin-left:4px;">${avs}</div></div><div style="display:flex;gap:4px;margin-top:3px;flex-wrap:wrap;">${cats.map(cid=>{const cc=getCatFin(cid);return`<span class="fin-badge" style="background:${cc.bg};color:${cc.color};">${cc.icon} ${cc.label}</span>`;}).join('')}${g.solo_registro?'<span class="fin-badge" style="background:var(--purple-l);color:var(--purple-d);">📌 Solo registro</span>':g.saldado?'<span class="fin-badge" style="background:var(--teal-l);color:var(--teal-d);">✓ Saldado</span>':'<span class="fin-badge" style="background:var(--amber-l);color:var(--amber-d);">Pendiente</span>'}${g.fecha_registro?`<span class="fin-badge" style="background:var(--surface);color:var(--text-ter);">📅 ${g.fecha_registro}</span>`:''} ${g.comprobante_url?`<a href="${g.comprobante_url}" target="_blank" style="text-decoration:none;"><span class="fin-badge" style="background:var(--aurora-l);color:var(--aurora-d);">📎 Comprobante</span></a>`:''}</div></div><div style="text-align:right;flex-shrink:0;"><div class="fin-monto">${fmt(g.monto,g.moneda)}</div><div class="fin-monto-sub">${fmt(parte,g.moneda)}/c/u</div><div class="fin-row-actions"><button class="fin-act-btn" onclick="openEditGasto(${g.id})">✏️</button><button class="fin-act-btn" onclick="toggleSaldado(${g.id},${g.saldado})">${g.saldado?'↩':'✓'}</button><button class="fin-act-btn" onclick="confirmDeleteGasto(${g.id})">🗑</button></div></div></div>`;}).join('');}
function renderFinDeudas(){const list=document.getElementById('fin-deudas-list');if(!list)return;const{deudas,moneda}=finState;const allG=finState.gastosAll||finState.gastos||[];const comp=allG.filter(g=>!g.solo_registro&&g.moneda===moneda);if(!deudas.length){if(!comp.length){list.innerHTML='';return;}list.innerHTML=`<div style="text-align:center;padding:1rem;font-size:12px;color:var(--teal-d);">${comp.every(g=>g.saldado)?'🎉 ¡Gastos compartidos saldados!':'🎉 ¡Todo saldado!'}</div>`;return;}const grouped={};deudas.forEach(t=>{const k=t.de;if(!grouped[k])grouped[k]={chica:t.de_chica,deudas:[]};grouped[k].deudas.push(t);});list.innerHTML=Object.values(grouped).map(g=>{const c=g.chica||{};const total=g.deudas.reduce((a,t)=>a+t.monto,0);const rId=`dg-${c.id||Math.random().toString(36).slice(2)}`;const rows=g.deudas.map(t=>{const para=t.para_chica||{};return`<div class="fin-deuda-detail"><div class="fin-av" style="background:${para.bg_color};color:${para.color};width:24px;height:24px;font-size:9px;">${(para.apodo||'?').slice(0,2)}</div><div style="flex:1;font-size:12px;color:var(--text-sec);">→ ${para.nombre}</div><div style="font-size:12px;font-weight:500;color:var(--hot-d);">${fmt(t.monto,moneda)}</div><button class="fin-wa-btn" style="padding:3px 8px;font-size:10px;" onclick="waDeuda('${c.nombre}','${para.nombre}',${t.monto},'${moneda}')">📱</button></div>`;}).join('');return`<div class="fin-deuda-group" onclick="toggleDeudaGroup('${rId}')"><div style="display:flex;align-items:center;gap:8px;"><div class="fin-av" style="background:${c.bg_color};color:${c.color};" style="font-size:${(c.apodo||'?').length>2?'8px':'10px'};">${c.apodo||'?'}</div><div style="flex:1;"><div style="font-size:13px;font-weight:500;color:var(--text);">${c.nombre}</div><div style="font-size:11px;color:var(--text-sec);">debe ${fmt(total,moneda)}</div></div><svg id="${rId}-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-ter)" stroke-width="2" stroke-linecap="round" style="transition:transform 0.2s;flex-shrink:0;"><polyline points="6 9 12 15 18 9"/></svg></div><div id="${rId}" style="display:none;margin-top:8px;border-top:0.5px solid var(--border);padding-top:8px;">${rows}<div style="display:flex;gap:6px;margin-top:8px;"><button class="fin-wa-btn" style="flex:1;" onclick="event.stopPropagation();waDeuda('${c.nombre}','sus acreedoras',${total},'${moneda}')">📱 Recordatorio</button><button class="fin-wa-btn" style="flex:1;background:var(--teal);" onclick="event.stopPropagation();confirmarSaldarDeuda('${c.nombre}','sus acreedoras',${total},'${moneda}',${c.id})">✓ Saldar</button></div></div></div>`;}).join('');}
function toggleDeudaGroup(id){const el=document.getElementById(id);const arrow=document.getElementById(id+'-arrow');if(!el)return;const open=el.style.display!=='none';el.style.display=open?'none':'block';if(arrow)arrow.style.transform=open?'':'rotate(180deg)';}
function renderFinBalance(){const list=document.getElementById('fin-balance-list');if(!list)return;const{balance,moneda}=finState;if(!balance.length){list.innerHTML='';return;}const maxAbs=Math.max(...balance.map(b=>Math.abs(b.balance)),1);list.innerHTML=balance.map(b=>{const c=b.chica||{};const val=parseFloat(b.balance);const pct=Math.abs(val)/maxAbs*100;const color=val>0.01?'var(--teal)':val<-0.01?'var(--hot)':'var(--border-med)';const label=val>0.01?`le deben ${fmt(val,moneda)}`:val<-0.01?`debe ${fmt(-val,moneda)}`:'en paz ✓';return`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:0.5px solid var(--border);"><div class="fin-av" style="background:${c.bg_color};color:${c.color};" style="font-size:${(c.apodo||'?').length>2?'8px':'10px'};">${c.apodo||'?'}</div><div style="flex:1;"><div style="font-size:12px;font-weight:500;color:var(--text);">${c.nombre}</div><div style="height:4px;border-radius:4px;background:var(--border);margin-top:4px;overflow:hidden;"><div style="height:100%;border-radius:4px;background:${color};width:${pct}%;transition:width 0.4s;"></div></div></div><div style="font-size:11px;font-weight:500;color:${color};min-width:80px;text-align:right;">${label}</div></div>`;}).join('');const rows=list.querySelectorAll('div[style*="border-bottom"]');if(rows.length)rows[rows.length-1].style.borderBottom='none';}
function finToggleMoneda(mon){finState.moneda=mon;document.getElementById('fin-btn-usd')?.classList.toggle('on',mon==='USD');document.getElementById('fin-btn-ars')?.classList.toggle('on',mon==='ARS');if(finState.gastosAll){finState.gastos=finState.gastosAll.filter(g=>g.moneda===mon);get(`/gastos/${finState.eventoId}/deudas?moneda=${mon}`).then(d=>{finState.deudas=d.transacciones||[];finState.balance=d.balance||[];renderFinanzasAll();}).catch(e=>console.warn(e));}else refreshFinanzas();}
async function finCambiarEvento(eventoId){finState.eventoId=+eventoId;try{const rsvp=await get(`/rsvp/${eventoId}`);finState.rsvpConfirmadas=rsvp.filter(r=>r.estado==='confirmada').map(r=>r.chica_id);finState.selSplit=finState.rsvpConfirmadas.length?finState.rsvpConfirmadas:window.chicas.map(c=>c.id);finUpdatePreview();}catch(e){}}
function openAddGasto(){finState.editingGasto=null;finState.selCats=['alojamiento'];finState.selSplit=finState.rsvpConfirmadas?.length?finState.rsvpConfirmadas:window.chicas.map(c=>c.id);finState.selMon=finState.moneda;_openGastoModal();}
function openEditGasto(id){const g=finState.gastos.find(g=>g.id===id);if(!g)return;finState.editingGasto=g;finState.selCats=g.categoria?g.categoria.split(',').map(s=>s.trim()).filter(Boolean):['otro'];finState.selSplit=(g.participantes||[]).map(p=>p.chica_id);finState.selMon=g.moneda;_openGastoModal(g);}
function _openGastoModal(prefill){const{selCats,selSplit,selMon}=finState;const rsvpC=finState.rsvpConfirmadas||window.chicas.map(c=>c.id);openModal(`<div class="modal-title">${prefill?'Editar gasto':'Registrar gasto'}</div><label class="field-label">Evento</label><select class="field-input" id="fg-evento" onchange="finCambiarEvento(this.value)">${eventos.map(e=>`<option value="${e.id}" ${e.id===finState.eventoId?'selected':''}>${e.nombre}</option>`).join('')}</select><label class="field-label">Descripción</label><input class="field-input" id="fg-nombre" placeholder="Ej: Cena en Copacabana" value="${prefill?.nombre||''}"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;"><div><label class="field-label">Monto</label><input class="field-input" id="fg-monto" type="number" min="0" step="0.01" placeholder="0.00" value="${prefill?.monto||''}" oninput="finUpdatePreview()" style="margin-bottom:0;"></div><div><label class="field-label">Moneda</label><div style="display:flex;gap:6px;margin-top:4px;"><button class="moneda-btn ${selMon==='USD'?'on':''}" id="fg-usd" onclick="finSelMon('USD')">USD</button><button class="moneda-btn ${selMon==='ARS'?'on':''}" id="fg-ars" onclick="finSelMon('ARS')">ARS</button></div></div></div><label class="field-label">Categoría</label><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px;">${CATS_FIN.map(c=>`<div class="cat-opt ${selCats.includes(c.id)?'sel':''}" id="fgcat-${c.id}" style="${selCats.includes(c.id)?`border-color:${c.color};background:var(--surface);`:''}" onclick="finSelCat('${c.id}','${c.color}')"><div style="font-size:18px;text-align:center;">${c.icon}</div><div style="font-size:10px;font-weight:500;color:var(--text-sec);text-align:center;">${c.label}</div></div>`).join('')}</div><label class="field-label">¿Quién pagó?</label><select class="field-input" id="fg-pagadopor">${window.chicas.map(c=>`<option value="${c.id}" ${prefill?.pagado_por===c.id?'selected':''}>${c.nombre}</option>`).join('')}</select><label class="field-label">Se divide entre</label><div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;">${window.chicas.map(c=>{const sel=selSplit.includes(c.id);const enE=rsvpC.includes(c.id);return`<div class="split-chip ${sel?'sel':''}" id="fgsp-${c.id}" style="${sel?'border-color:var(--teal);background:var(--teal-l);':!enE?'opacity:0.35;':''}" onclick="${enE?`finToggleSplit(${c.id})`:''}"><div style="width:18px;height:18px;border-radius:50%;background:${c.bg_color};color:${c.color};display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:500;">${(c.apodo||c.nombre).slice(0,2)}</div>${c.nombre.split(' ')[0]}</div>`;}).join('')}</div><div id="fg-preview" style="font-size:11px;color:var(--text-sec);margin-bottom:10px;"></div><div style="display:flex;align-items:center;justify-content:space-between;background:var(--surface);border-radius:12px;padding:10px 12px;margin-bottom:10px;"><div><div style="font-size:13px;color:var(--text);font-weight:500;">📌 Solo registro</div><div style="font-size:11px;color:var(--text-sec);">No divide entre participantes</div></div><button class="toggle ${prefill?.solo_registro?'on':''}" id="fg-solo" onclick="this.classList.toggle('on');finUpdatePreview()"></button></div><div class="field-group"><label class="field-label">Fecha del gasto</label><input class="field-input" id="fg-fecha" type="date" value="${prefill?.fecha_registro||new Date().toISOString().slice(0,10)}"></div><div class="field-group"><label class="field-label">Notas (opcional)</label><input class="field-input" id="fg-notas" placeholder="Detalles..." value="${prefill?.notas||''}"></div><div class="field-group"><label class="field-label">📎 Comprobante (imagen o PDF)</label>${prefill?.comprobante_url? `<div id="fg-existing-comp" style="display:flex;align-items:center;gap:8px;background:var(--aurora-l);border-radius:10px;padding:8px 10px;margin-bottom:6px;"><span style="font-size:16px;">📎</span><span style="flex:1;font-size:11px;color:var(--aurora-d);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${prefill.comprobante_name||"Comprobante"}</span><a href="${prefill.comprobante_url}" target="_blank" style="font-size:10px;color:var(--aurora-1);font-weight:500;text-decoration:none;flex-shrink:0;white-space:nowrap;">Ver 👁</a><button onclick="quitarComprobante()" style="background:none;border:none;cursor:pointer;color:var(--aurora-d);font-size:16px;padding:0 2px;flex-shrink:0;line-height:1;">×</button></div>`: ""}<label style="display:flex;align-items:center;gap:8px;background:var(--surface);border:1.5px dashed var(--border-med);border-radius:12px;padding:10px 12px;cursor:pointer;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--aurora-1)" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><span id="fg-file-label" style="font-size:12px;color:var(--text-sec);">Subir imagen o PDF</span><input type="file" id="fg-file" accept="image/*,.pdf" style="display:none;" onchange="onComprobanteSelected(this)"></label><div id="fg-file-preview" style="margin-top:6px;"></div></div><div class="modal-btns">${prefill?`<button class="btn-danger" onclick="confirmDeleteGasto(${prefill.id})">Eliminar</button>`:'<button class="btn-cancel" onclick="closeModal()">Cancelar</button>'}<button class="btn-save" onclick="saveGastoAPI()">Guardar</button></div>`);finUpdatePreview();}
function finSelCat(id,color){const cats=finState.selCats;if(cats.includes(id)){if(cats.length===1)return;finState.selCats=cats.filter(c=>c!==id);}else{finState.selCats=[...cats,id];}CATS_FIN.forEach(c=>{const el=document.getElementById('fgcat-'+c.id);if(!el)return;if(finState.selCats.includes(c.id)){el.classList.add('sel');el.style.borderColor=c.color;el.style.background='var(--surface)';}else{el.classList.remove('sel');el.style.borderColor='';el.style.background='';}});}
function finSelMon(mon){finState.selMon=mon;document.getElementById('fg-usd')?.classList.toggle('on',mon==='USD');document.getElementById('fg-ars')?.classList.toggle('on',mon==='ARS');finUpdatePreview();}
function finToggleSplit(id){if(finState.selSplit.includes(id)){if(finState.selSplit.length===1)return;finState.selSplit=finState.selSplit.filter(x=>x!==id);}else{finState.selSplit=[...finState.selSplit,id];}document.querySelectorAll('[id^="fgsp-"]').forEach(el=>{el.classList.remove('sel');el.style.borderColor='';el.style.background='';});finState.selSplit.forEach(sid=>{const el=document.getElementById('fgsp-'+sid);if(el){el.classList.add('sel');el.style.borderColor='var(--teal)';el.style.background='var(--teal-l)';}});finUpdatePreview();}
function finUpdatePreview(){const monto=parseFloat(document.getElementById('fg-monto')?.value||0);const n=finState.selSplit.length;const prev=document.getElementById('fg-preview');const soloReg=document.getElementById('fg-solo')?.classList.contains('on');if(!prev)return;if(soloReg){prev.textContent='📌 Solo registro — no se divide entre nadie';prev.style.color='var(--amber-d)';}else{prev.style.color='';prev.textContent=monto>0?`${fmt(monto/n,finState.selMon)} por persona · ${n} participante${n!==1?'s':''}`:'';};}
function onComprobanteSelected(input) {
  const file = input.files[0];
  if (!file) return;
  // Clear previous selection
  finState.comprobanteFile = file;
  finState.comprobanteName = file.name;
  finState.comprobanteUrl  = null; // replacing existing
  const label   = document.getElementById('fg-file-label');
  const preview = document.getElementById('fg-file-preview');
  const existing = document.getElementById('fg-existing-comp');
  if (existing) existing.style.display = 'none'; // hide old comprobante
  if (label) label.textContent = file.name;
  if (preview) {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      preview.innerHTML = `
        <div style="position:relative;margin-top:6px;">
          <img src="${url}" style="width:100%;border-radius:10px;max-height:140px;object-fit:cover;">
          <button onclick="quitarComprobante()" style="position:absolute;top:5px;right:5px;background:rgba(0,0,0,0.5);border:none;border-radius:50%;width:22px;height:22px;color:#fff;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;">×</button>
        </div>`;
    } else {
      preview.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;background:var(--aurora-l);border-radius:10px;padding:8px 10px;margin-top:6px;">
          <span style="font-size:16px;">📄</span>
          <span style="flex:1;font-size:11px;color:var(--aurora-d);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${file.name}</span>
          <button onclick="quitarComprobante()" style="background:none;border:none;cursor:pointer;color:var(--aurora-d);font-size:16px;padding:0;line-height:1;">×</button>
        </div>`;
    }
  }
}

function quitarComprobante() {
  finState.comprobanteUrl  = null;
  finState.comprobanteName = null;
  finState.comprobanteFile = null;
  // Clear UI without re-rendering entire modal
  const preview  = document.getElementById('fg-file-preview');
  const label    = document.getElementById('fg-file-label');
  const existing = document.getElementById('fg-existing-comp');
  const input    = document.getElementById('fg-file');
  if (preview)  preview.innerHTML = '';
  if (label)    label.textContent = 'Subir imagen o PDF';
  if (existing) existing.style.display = 'none';
  if (input)    input.value = '';
}

async function uploadComprobante(file) {
  const CLOUD = 'dgora758p';
  const PRESET = 'bffapp_comprobantes';
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', PRESET);
  formData.append('folder', 'bffapp');
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/auto/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Cloudinary upload failed');
  const data = await res.json();
  return { url: data.secure_url, filename: file.name };
}

async function saveGastoAPI(){
  const nombre    = document.getElementById('fg-nombre').value.trim();
  const monto     = parseFloat(document.getElementById('fg-monto').value);
  const pagadoPor = parseInt(document.getElementById('fg-pagadopor').value);
  const soloReg   = document.getElementById('fg-solo')?.classList.contains('on') || false;
  if(!nombre || !monto || monto<=0) return;
  if(!soloReg && !finState.selSplit.length) return;

  // Handle comprobante
  let comprobanteUrl  = finState.editingGasto?.comprobante_url  || null;
  let comprobanteName = finState.editingGasto?.comprobante_name || null;

  // User explicitly removed comprobante
  if(finState.comprobanteUrl === null && finState.editingGasto?.comprobante_url) {
    comprobanteUrl  = null;
    comprobanteName = null;
  }

  // User selected a new file — upload it
  if(finState.comprobanteFile) {
    try {
      const up    = await uploadComprobante(finState.comprobanteFile);
      comprobanteUrl  = up.url;
      comprobanteName = up.filename;
    } catch(e) {
      console.warn('Upload failed:', e);
      alert('No se pudo subir el comprobante. Verificá tu conexión.');
      return;
    }
  }

  const payload = {
    evento_id:        finState.eventoId,
    nombre,
    monto,
    moneda:           finState.selMon,
    categoria:        finState.selCats.join(','),
    pagado_por:       pagadoPor,
    participantes:    soloReg ? [] : finState.selSplit,
    notas:            document.getElementById('fg-notas').value.trim(),
    fecha_registro:   document.getElementById('fg-fecha')?.value || null,
    solo_registro:    soloReg,
    comprobante_url:  comprobanteUrl,
    comprobante_name: comprobanteName,
  };

  finState.comprobanteFile = null;
  finState.comprobanteUrl  = null;

  if(finState.editingGasto) await put(`/gastos/${finState.editingGasto.id}`, payload);
  else await post('/gastos', payload);

  closeModal();
  await Promise.all([refreshFinanzas(), renderHome()]);
}
function confirmDeleteGasto(id){openModal(`<div class="modal-title">¿Eliminar gasto?</div><div style="font-size:13px;color:var(--text-sec);margin-bottom:1rem;">Esta acción no se puede deshacer.</div><div class="modal-btns"><button class="btn-cancel" onclick="closeModal()">Cancelar</button><button class="btn-danger" style="flex:2;" onclick="deleteGastoAPI(${id})">Eliminar</button></div>`);}
async function deleteGastoAPI(id){await del(`/gastos/${id}`);closeModal();await Promise.all([refreshFinanzas(),renderHome()]);}
async function toggleSaldado(id,saldado){await put(`/gastos/${id}/${saldado?'desaldar':'saldar'}`,{});await Promise.all([refreshFinanzas(),renderHome()]);}
async function confirmarSaldarDeuda(deNombre,paraNombre,monto,moneda,deChicaId){const gastosD=(finState.gastosAll||finState.gastos||[]).filter(g=>!g.solo_registro&&g.moneda===moneda&&!g.saldado&&g.participantes?.some(p=>p.chica_id===deChicaId&&!p.pagado));openModal(`<div class="modal-title">¿Confirmar pago?</div><div style="background:var(--teal-l);border-radius:12px;padding:1rem;margin-bottom:1rem;text-align:center;"><div style="font-size:13px;color:var(--teal-d);"><strong>${deNombre}</strong> le pagó a <strong>${paraNombre}</strong></div><div style="font-size:20px;font-weight:500;color:var(--teal-d);margin-top:4px;">${fmt(monto,moneda)}</div></div><div style="font-size:12px;color:var(--text-sec);margin-bottom:1rem;">Se marcará la parte de <strong>${deNombre}</strong> como pagada en ${gastosD.length} gasto${gastosD.length!==1?'s':''}.</div><div class="modal-btns"><button class="btn-cancel" onclick="closeModal()">Cancelar</button><button class="btn-teal" onclick="saldarParticipante(${deChicaId},${JSON.stringify(gastosD.map(g=>g.id))})">✓ Confirmar</button></div>`);}
async function saldarParticipante(chicaId,gastoIds){closeModal();await Promise.all(gastoIds.map(id=>put(`/gastos/${id}/saldar_participante`,{chica_id:chicaId})));finState.gastosAll=null;await Promise.all([refreshFinanzas(),renderHome()]);}
function waDeuda(de,para,monto,mon){window.open('https://wa.me/?text='+encodeURIComponent(`💸 *Recordatorio · BFFapp*\n\n${de} le debe a *${para}* ${fmt(monto,mon)}\n\n¡Recordá transferir! 🙏`),'_blank');}

/* ══ 🎁 REGALO ══ */
async function loadRegalo(){
  try{ misiones=await get('/misiones'); renderRegalo(); }
  catch(e){ console.warn('Regalo:',e); }
}

function renderRegalo(){
  const container=document.getElementById('regalo-list');if(!container)return;
  if(!misiones.length){container.innerHTML=`<div class="empty-state"><div class="empty-state-icon">🎁</div><div class="empty-state-text">No hay ningún regalo secreto activo</div><div class="empty-state-sub">Creá uno con el botón de arriba</div></div>`;return;}

  // Ocultar si el usuario es la homenajeada interna
  const visibles=misiones.filter(m=>{
    if(!currentUser)return true;
    if(m.festejada_id&&m.festejada_id===currentUser.id)return false;
    return true;
  });

  if(!visibles.length){container.innerHTML=`<div class="empty-state"><div class="empty-state-icon">🤫</div><div class="empty-state-text">¡Shhh! Hay algo preparado pero no es para tus ojos 👀</div></div>`;return;}

  container.innerHTML=visibles.map(m=>{
    const festN=m.festejada_nombre||window.chicas.find(c=>c.id===m.festejada_id)?.nombre||'–';
    const pct=m.monto_objetivo>0?Math.min(100,Math.round(parseFloat(m.recaudado)/parseFloat(m.monto_objetivo)*100)):0;
    const falta=m.monto_objetivo>0?Math.max(0,parseFloat(m.monto_objetivo)-parseFloat(m.recaudado)):0;
    const totalV=(m.opciones||[]).reduce((a,o)=>a+(o.votos||0),0);

    const aportesH=(m.aportes||[]).map(a=>`<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:0.5px solid var(--border);"><div class="fin-av" style="width:24px;height:24px;font-size:9px;background:${a.bg_color};color:${a.color};">${(a.apodo||'?').slice(0,2)}</div><div style="flex:1;font-size:12px;">${a.nombre}</div><div style="font-size:12px;font-weight:500;color:var(--teal-d);">$${parseFloat(a.monto).toLocaleString('es-AR')}</div><button onclick="editarAporte(${m.id},${a.chica_id},${a.monto})" style="background:none;border:none;cursor:pointer;font-size:12px;color:var(--text-ter);">✏️</button></div>`).join('');

    const opcionesH=(m.opciones||[]).map(o=>{const pctV=totalV>0?Math.round((o.votos||0)/totalV*100):0;return`<div style="padding:8px 0;border-bottom:0.5px solid var(--border);"><div style="display:flex;align-items:flex-start;gap:8px;"><div style="flex:1;"><div style="font-size:12px;font-weight:500;">${o.nombre}</div>${o.descripcion?`<div style="font-size:11px;color:var(--text-sec);">${o.descripcion}</div>`:''}<div style="display:flex;gap:6px;align-items:center;margin-top:2px;">${o.precio_est?`<span style="font-size:11px;color:var(--teal-d);">~$${parseFloat(o.precio_est).toLocaleString('es-AR')}</span>`:''}${o.link?`<a href="${o.link}" target="_blank" style="font-size:10px;color:var(--blue-d);">🔗 Ver</a>`:''}</div></div><button onclick="votarOpcionRegalo(${o.id},${m.id})" style="background:var(--pink-l);border:none;border-radius:8px;padding:4px 10px;font-size:11px;color:var(--pink-d);cursor:pointer;flex-shrink:0;">❤️ ${o.votos||0}</button></div><div style="height:3px;border-radius:3px;background:var(--border);margin-top:5px;overflow:hidden;"><div style="height:100%;border-radius:3px;background:var(--pink);width:${pctV}%;transition:width 0.4s;"></div></div></div>`;}).join('');

    return`<div class="card" style="margin-bottom:0.85rem;"><div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:0.75rem;"><div style="flex:1;"><div style="font-family:var(--fd);font-size:16px;color:var(--text);">🎁 ${m.nombre}</div>${m.descripcion?`<div style="font-size:12px;color:var(--text-sec);margin-top:2px;">${m.descripcion}</div>`:''}<div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;"><span class="fin-badge" style="background:var(--pink-l);color:var(--pink-d);">🎂 Para: ${festN}</span>${m.fecha_limite?`<span class="fin-badge" style="background:var(--amber-l);color:var(--amber-d);">📅 ${formatFecha(m.fecha_limite)}</span>`:''}<span class="fin-badge" style="background:var(--teal-l);color:var(--teal-d);">👯 ${m.aportantes} aportaron</span></div></div><div style="display:flex;gap:4px;"><button onclick="openEditMision(${m.id})" class="icon-btn e">✏️</button><button onclick="confirmArchivarMision(${m.id})" class="icon-btn" style="color:var(--hot-d);background:var(--hot-l);">🗑</button></div></div>${m.monto_objetivo>0?`<div style="margin-bottom:0.75rem;"><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-sec);margin-bottom:4px;"><span>Recaudado: <strong>$${parseFloat(m.recaudado).toLocaleString('es-AR')}</strong></span><span>Objetivo: <strong>$${parseFloat(m.monto_objetivo).toLocaleString('es-AR')}</strong></span></div><div style="height:6px;border-radius:6px;background:var(--border);overflow:hidden;"><div style="height:100%;border-radius:6px;background:var(--teal);width:${pct}%;transition:width 0.5s;"></div></div><div style="font-size:11px;color:${falta>0?'var(--hot-d)':'var(--teal-d)'};margin-top:3px;">${falta>0?`Faltan $${falta.toLocaleString('es-AR')}`:'🎉 ¡Objetivo alcanzado!'}</div></div>`:''}<button class="fin-add-btn" style="margin-bottom:0.5rem;" onclick="openAporte(${m.id})">💰 Registrar aporte</button>${aportesH?`<div style="margin-bottom:0.75rem;">${aportesH}</div>`:''}<div style="font-family:var(--fd);font-size:14px;color:var(--text);margin:0.5rem 0;">💡 Ideas de regalo</div>${opcionesH||'<div style="font-size:12px;color:var(--text-ter);padding:6px 0;">Sin ideas todavía</div>'}<button class="add-opt-btn" style="margin-top:6px;border-radius:10px;" onclick="openAddOpcionRegalo(${m.id})">+ Agregar idea</button></div>`;
  }).join('');
}

function openNuevaMision(){
  openModal(`<div class="modal-title">🎁 Nuevo regalo secreto</div><label class="field-label">Nombre / ocasión</label><input class="field-input" id="rm-nombre" placeholder="Ej: Cumple de Romi"><label class="field-label">Descripción (opcional)</label><input class="field-input" id="rm-desc" placeholder="Detalles..."><label class="field-label">¿Para quién es?</label><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;"><div><label class="field-label" style="font-size:10px;">Texto libre</label><input class="field-input" id="rm-festejada-txt" placeholder="Ej: Mamá de Agos" oninput="document.getElementById('rm-festejada-sel').value=''"></div><div><label class="field-label" style="font-size:10px;">O chica del grupo</label><select class="field-input" id="rm-festejada-sel" onchange="document.getElementById('rm-festejada-txt').value=''"><option value="">– Seleccionar –</option>${window.chicas.map(c=>`<option value="${c.id}">${c.nombre}</option>`).join('')}</select></div></div><label class="field-label">¿Quiénes participan?</label><div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;">${window.chicas.map(c=>`<div class="split-chip sel" id="rmp-${c.id}" style="border-color:var(--teal);background:var(--teal-l);" onclick="toggleMisionParticipante(${c.id})"><div style="width:18px;height:18px;border-radius:50%;background:${c.bg_color};color:${c.color};display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:500;">${(c.apodo||c.nombre).slice(0,2)}</div>${c.nombre.split(' ')[0]}</div>`).join('')}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><div><label class="field-label">Monto objetivo</label><input class="field-input" id="rm-monto" type="number" placeholder="0"></div><div><label class="field-label">Fecha límite</label><input class="field-input" id="rm-fecha" type="date"></div></div><div class="modal-btns"><button class="btn-cancel" onclick="closeModal()">Cancelar</button><button class="btn-save" onclick="guardarMision()">Crear 🎁</button></div>`);
  window._misionParticipantes=window.chicas.map(c=>c.id);
}
function toggleMisionParticipante(id){if(!window._misionParticipantes)window._misionParticipantes=[];const a=window._misionParticipantes;window._misionParticipantes=a.includes(id)?a.filter(x=>x!==id):[...a,id];const el=document.getElementById('rmp-'+id);const va=window._misionParticipantes.includes(id);if(el){el.style.borderColor=va?'var(--teal)':'';el.style.background=va?'var(--teal-l)':'';el.classList.toggle('sel',va);}}
async function guardarMision(id){
  const nombre=document.getElementById('rm-nombre').value.trim();if(!nombre)return;
  const fTxt=document.getElementById('rm-festejada-txt')?.value.trim();
  const fSel=parseInt(document.getElementById('rm-festejada-sel')?.value)||null;
  const payload={nombre,descripcion:document.getElementById('rm-desc').value.trim(),festejada_nombre:fTxt||null,festejada_id:fSel||null,monto_objetivo:parseFloat(document.getElementById('rm-monto').value)||null,fecha_limite:document.getElementById('rm-fecha').value||null,participantes:window._misionParticipantes||[]};
  if(id)await put(`/misiones/${id}`,payload);else await post('/misiones',payload);
  window._misionParticipantes=null;closeModal();await loadRegalo();
}
function openEditMision(id){const m=misiones.find(m=>m.id===id);if(!m)return;openModal(`<div class="modal-title">Editar regalo</div><label class="field-label">Nombre</label><input class="field-input" id="rm-nombre" value="${m.nombre}"><label class="field-label">Descripción</label><input class="field-input" id="rm-desc" value="${m.descripcion||''}"><label class="field-label">Para quién</label><input class="field-input" id="rm-festejada-txt" value="${m.festejada_nombre||window.chicas.find(c=>c.id===m.festejada_id)?.nombre||''}" placeholder="Nombre"><input type="hidden" id="rm-festejada-sel" value=""><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><div><label class="field-label">Monto objetivo</label><input class="field-input" id="rm-monto" type="number" value="${m.monto_objetivo||''}"></div><div><label class="field-label">Fecha límite</label><input class="field-input" id="rm-fecha" type="date" value="${m.fecha_limite?String(m.fecha_limite).slice(0,10):''}"></div></div><div class="modal-btns"><button class="btn-danger" onclick="archivarMision(${id})">Archivar</button><button class="btn-save" onclick="guardarMision(${id})">Guardar</button></div>`);}
function confirmArchivarMision(id){
  const m=misiones.find(m=>m.id===id);
  openModal(`
    <div class="modal-title">¿Eliminar regalo?</div>
    <div style="font-size:13px;color:var(--text-sec);margin-bottom:1rem;">Se eliminará <strong>${m?.nombre||'este regalo'}</strong> y todos sus aportes e ideas. Esta acción no se puede deshacer.</div>
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-danger" style="flex:2;" onclick="archivarMision(${id})">Sí, eliminar</button>
    </div>`);
}
async function archivarMision(id){await del(`/misiones/${id}`);closeModal();await loadRegalo();}
function openAporte(misionId){openModal(`<div class="modal-title">💰 Registrar aporte</div><label class="field-label">¿Quién aporta?</label><select class="field-input" id="ap-chica">${window.chicas.map(c=>`<option value="${c.id}" ${currentUser?.id===c.id?'selected':''}>${c.nombre}</option>`).join('')}</select><label class="field-label">Monto</label><input class="field-input" id="ap-monto" type="number" placeholder="0" min="0"><div class="modal-btns"><button class="btn-cancel" onclick="closeModal()">Cancelar</button><button class="btn-save" onclick="guardarAporte(${misionId})">Guardar</button></div>`);}
function editarAporte(misionId,chicaId,montoActual){const c=window.chicas.find(c=>c.id===chicaId);openModal(`<div class="modal-title">✏️ Aporte de ${c?.nombre}</div><label class="field-label">Monto</label><input class="field-input" id="ap-monto" type="number" value="${montoActual}" min="0"><div class="modal-btns"><button class="btn-danger" onclick="eliminarAporte(${misionId},${chicaId})">Eliminar</button><button class="btn-save" onclick="guardarAporteEdit(${misionId},${chicaId})">Guardar</button></div>`);}
async function guardarAporte(misionId){const chica_id=parseInt(document.getElementById('ap-chica').value);const monto=parseFloat(document.getElementById('ap-monto').value);if(!monto||monto<=0)return;await post('/misiones/aporte',{mision_id:misionId,chica_id,monto});closeModal();await loadRegalo();}
async function guardarAporteEdit(misionId,chicaId){const monto=parseFloat(document.getElementById('ap-monto').value);if(!monto||monto<=0)return;await post('/misiones/aporte',{mision_id:misionId,chica_id:chicaId,monto});closeModal();await loadRegalo();}
async function eliminarAporte(misionId,chicaId){await post('/misiones/aporte/delete',{mision_id:misionId,chica_id:chicaId});closeModal();await loadRegalo();}
function openAddOpcionRegalo(misionId){openModal(`<div class="modal-title">💡 Idea de regalo</div><label class="field-label">Nombre</label><input class="field-input" id="or-nombre" placeholder="Ej: Perfume Chanel N°5"><label class="field-label">Descripción</label><input class="field-input" id="or-desc" placeholder="Detalles..."><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><div><label class="field-label">Precio estimado</label><input class="field-input" id="or-precio" type="number" placeholder="0"></div><div><label class="field-label">Link (opcional)</label><input class="field-input" id="or-link" placeholder="https://..."></div></div><div class="modal-btns"><button class="btn-cancel" onclick="closeModal()">Cancelar</button><button class="btn-save" onclick="guardarOpcionRegalo(${misionId})">Agregar</button></div>`);}
async function guardarOpcionRegalo(misionId){const nombre=document.getElementById('or-nombre').value.trim();if(!nombre)return;await post('/misiones/opcion',{mision_id:misionId,nombre,descripcion:document.getElementById('or-desc').value.trim(),precio_est:parseFloat(document.getElementById('or-precio').value)||null,link:document.getElementById('or-link').value.trim()||null});closeModal();await loadRegalo();}
async function votarOpcionRegalo(opcionId){await post('/misiones/voto',{opcion_id:opcionId,chica_id:currentUser?.id||1});await loadRegalo();}

/* ══ CHICAS ══ */
function renderBdayBanner(){const banner=document.getElementById('bday-banner');if(!banner)return;const up=window.chicas.map(c=>({...c,days:daysUntilBday(c.bday)})).filter(c=>c.days<=30).sort((a,b)=>a.days-b.days);if(!up.length){banner.style.display='none';return;}banner.style.display='flex';banner.innerHTML=`<div style="font-size:18px;">🎂</div><div class="bday-text">Próximos: ${up.map(c=>`<strong>${c.nombre}</strong> (${c.days===0?'¡hoy!':c.days===1?'mañana':`en ${c.days}d`})`).join(' · ')}</div>`;}
function renderChicas(filter=''){const list=document.getElementById('chicas-list');if(!list)return;const filtered=window.chicas.filter(c=>c.nombre.toLowerCase().includes(filter.toLowerCase())||(c.apodo||'').toLowerCase().includes(filter.toLowerCase()));list.innerHTML=filtered.length?filtered.map(c=>{const d=daysUntilBday(c.bday);return`<div class="chica-card" onclick="openEditChica(${c.id})"><div class="chica-av ${d<=7?'bday-ring':''}" style="background:${c.bg_color};color:${c.color};font-size:${(c.apodo||c.nombre).length>2?'11px':'14px'};">${c.apodo||c.nombre.slice(0,2)}</div><div style="flex:1;"><div class="chica-name">${c.nombre}</div><div class="chica-apodo">"${c.apodo||''}" · 🎂 ${bdayLabel(c.bday)}</div><div class="chica-meta">${d<=7?'<span class="meta-chip chip-bday">🎂 Pronto</span>':''}</div></div><div class="chica-edit-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div></div>`;}).join(''):'<div style="text-align:center;padding:2rem;color:var(--text-ter);font-size:13px;">No se encontró ninguna</div>';if(document.getElementById('chicas-sub'))document.getElementById('chicas-sub').textContent=`${window.chicas.length} chicas`;if(document.getElementById('total-chicas'))document.getElementById('total-chicas').textContent=window.chicas.length;}
function filterChicas(val){renderChicas(val);}
function openAddChica(){
  openModal(`
    <div class="modal-title">Nueva amiga 💅</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div><label class="field-label">Nombre</label><input class="field-input" id="m-nombre" placeholder="Nombre completo"></div>
      <div><label class="field-label">Apodo</label><input class="field-input" id="m-apodo" placeholder="Apodo"></div>
    </div>
    <label class="field-label">Teléfono / WhatsApp</label>
    <input class="field-input" id="m-tel" placeholder="+54911...">
    <label class="field-label">Cumpleaños</label>
    <input class="field-input" id="m-bday" type="date">
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-save" onclick="guardarNuevaChica()">Agregar 💅</button>
    </div>`);
}

async function guardarNuevaChica(){
  const nombre=document.getElementById('m-nombre').value.trim();
  if(!nombre) return;
  const nueva = await post('/chicas',{
    nombre,
    apodo:    document.getElementById('m-apodo').value.trim(),
    telefono: document.getElementById('m-tel').value.trim(),
    bday:     document.getElementById('m-bday').value||null,
  });
  window.chicas.push(nueva);
  window.chicas.sort((a,b)=>a.nombre.localeCompare(b.nombre));
  closeModal();
  renderChicas();
  renderBdayBanner();
  renderHome();
}

function openEditChica(id){const c=window.chicas.find(c=>c.id===id);if(!c)return;openModal(`<div class="modal-av" style="background:${c.bg_color};color:${c.color};font-size:${(c.apodo||c.nombre).length>2?'11px':'14px'};">${c.apodo||c.nombre.slice(0,2)}</div><div class="modal-name-center">${c.nombre}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><div><label class="field-label">Nombre</label><input class="field-input" id="m-nombre" value="${c.nombre}"></div><div><label class="field-label">Apodo</label><input class="field-input" id="m-apodo" value="${c.apodo||''}"></div></div><label class="field-label">Teléfono</label><div style="display:flex;gap:8px;align-items:center;"><input class="field-input" id="m-tel" value="${c.telefono||''}" style="flex:1;"><button class="wa-contact-btn" onclick="openWA('${c.telefono||''}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>Abrir</button></div><label class="field-label">Cumpleaños</label><input class="field-input" id="m-bday" type="date" value="${cleanDate(c.bday)||''}"><div class="modal-btns"><button class="btn-danger" onclick="confirmEliminarChica(${c.id})">Eliminar</button><button class="btn-save" onclick="saveChicaDB(${c.id})">Guardar</button></div>`);}
async function saveChicaDB(id){const nombre=document.getElementById('m-nombre').value.trim();await put(`/chicas/${id}`,{nombre,apodo:document.getElementById('m-apodo').value.trim(),telefono:document.getElementById('m-tel').value.trim(),bday:document.getElementById('m-bday').value});const c=window.chicas.find(c=>c.id===id);if(c){c.nombre=nombre;c.apodo=document.getElementById('m-apodo').value.trim();c.telefono=document.getElementById('m-tel').value.trim();c.bday=document.getElementById('m-bday').value;}closeModal();renderBdayBanner();renderChicas(document.getElementById('search-input')?.value||'');}
async function confirmEliminarChica(id){
  const c=window.chicas.find(c=>c.id===id);
  openModal(`
    <div class="modal-title">¿Eliminar a ${c?.nombre}?</div>
    <div style="font-size:13px;color:var(--text-sec);margin-bottom:1rem;">
      Si tiene gastos o aportes registrados, no se puede eliminar para mantener el historial.
    </div>
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-danger" style="flex:2;" onclick="eliminarChica(${id})">Sí, eliminar</button>
    </div>`);
}

async function eliminarChica(id){
  const res = await del(`/chicas/${id}`);
  if(res.success){
    window.chicas = window.chicas.filter(c=>c.id!==id);
    closeModal();
    renderChicas();
    renderHome();
  } else {
    closeModal();
    openModal(`
      <div class="modal-title">No se puede eliminar</div>
      <div style="font-size:13px;color:var(--text-sec);margin-bottom:1rem;">${res.message}</div>
      <div class="modal-btns"><button class="btn-save" onclick="closeModal()">Entendido</button></div>`);
  }
}

function openWA(tel){if(tel)window.open('https://wa.me/'+tel.replace(/\D/g,''),'_blank');}

/* ══ WHATSAPP ══ */
function shareWhatsApp(type,eventoId){
  const rio=eventos.find(e=>e.tipo==='viaje');const mon=finState.moneda||'USD';const gastos=finState.gastosAll||finState.gastos||[];const deudas=finState.deudas||[];
  function buildMsg(){switch(type){
    case 'general':{const p=[...eventos].sort((a,b)=>new Date(a.fecha_inicio||'9999')-new Date(b.fecha_inicio||'9999'))[0];let m=`👯‍♀️ *BFFapp - Las Amigas* 💅\n\n`;eventos.forEach(e=>{const t=TIPOS[e.tipo]||TIPOS.otro;m+=`${t.icon} ${e.nombre}`;if(e.fecha_inicio)m+=` · ${formatFecha(e.fecha_inicio)}`;m+=`\n`;});if(p?.hotel||p?.lugar)m+=`\n🏨 ${p.hotel||p.lugar}\n`;m+=`\n🔗 bffapp-lasamigas.netlify.app`;return m;}
    case 'itinerario':{let m=`✈️ *Itinerario ${rio?.nombre||'Viaje'}*\n`;if(rio?.fecha_inicio)m+=`📅 ${formatFecha(rio.fecha_inicio)}`;if(rio?.fecha_fin)m+=` → ${formatFecha(rio.fecha_fin)}`;m+=`\n`;if(rio?.hotel||rio?.lugar)m+=`🏨 ${rio.hotel||rio.lugar}\n`;m+=`\n`;days.forEach(d=>{m+=`📅 *Día ${d.numero_dia} — ${d.titulo}*\n`;(d.actividades||[]).forEach(a=>m+=`• ${a.momento?a.momento+': ':''}${a.nombre}\n`);m+=`\n`;});m+=`🔗 bffapp-lasamigas.netlify.app`;return m;}
    case 'pagos':{
      const eventoNombre = eventos.find(e=>e.id===finState.eventoId)?.nombre || 'Evento';
      let m = '';
      ['USD','ARS'].forEach(moneda=>{
        const gm = (finState.gastosAll||gastos).filter(g=>g.moneda===moneda);
        if(!gm.length) return;
        m += `💸 *Gastos registrados - ${eventoNombre}*\n\n`;
        gm.forEach(g=>{
          const pg = window.chicas.find(c=>c.id===g.pagado_por);
          const cat = getCatFin(g.categoria?.split(',')[0]);
          m += `${cat.icon} ${g.nombre}: *${fmt(g.monto,moneda)}*`;
          if(pg) m += ` (${pg.nombre})`;
          if(g.solo_registro) m += ` 📌`;
          else if(g.saldado)  m += ` ✅`;
          m += `\n`;
        });
        const totalReg = gm.reduce((a,g)=>a+parseFloat(g.monto),0);
        const deudasMon = (finState.deudas||[]).filter(t=>t.monto>0);
        if(deudasMon.length){
          m += `\n💸 *Deudas pendientes:*\n`;
          deudasMon.forEach(t=>m+=`• ${t.de_chica?.nombre} → ${t.para_chica?.nombre}: *${fmt(t.monto,moneda)}*\n`);
          m += `\n¡Recuerden transferir antes del viaje! 🙏\n`;
        } else {
          m += `\n✅ ¡Todo saldado!\n`;
        }
        m += `\n*Total registrado: ${fmt(totalReg,moneda)}*`;
      });
      return m || `💸 Sin gastos registrados todavía.`;
    }
    case 'evento':{const e=eventos.find(e=>e.id===eventoId);if(!e)return'';const t=TIPOS[e.tipo]||TIPOS.otro;let m=`${t.icon} *${e.nombre}*\n\n`;if(e.fecha_inicio)m+=`📅 ${formatFecha(e.fecha_inicio)}${e.fecha_fin?' → '+formatFecha(e.fecha_fin):''}\n`;if(e.hotel||e.lugar)m+=`📍 ${e.hotel||e.lugar}\n`;m+=`\n🔗 bffapp-lasamigas.netlify.app`;return m;}
    default:return `👯‍♀️ *BFFapp - Las Amigas*\n🔗 bffapp-lasamigas.netlify.app`;
  }}
  const msg=buildMsg();if(msg)window.open('https://wa.me/?text='+encodeURIComponent(msg),'_blank');
}

/* ══ INIT ══ */
async function init(){
  try{
    [window.chicas,eventos]=await Promise.all([get('/chicas'),get('/eventos')]);
    currentEventoId=eventos.find(e=>e.tipo==='viaje')?.id||null;

    // Renders sincrónicos primero
    renderEventos();
    renderBdayBanner();
    renderChicas();

    // Password + login check
    if(!checkPassword()){
      showPasswordScreen();
    } else if(loadSession()){
      document.getElementById('password-screen').style.display='none';
      document.getElementById('login-screen').style.display='none';
      document.getElementById('app-shell').style.display='flex';
      postLoginRender();
    } else {
      document.getElementById('password-screen').style.display='none';
      showLoginScreen();
    }

    // Módulos en paralelo
    await Promise.all([
      renderHome(),
      loadFinanzas(),
      loadRegalo().catch(e=>console.warn('Regalo:',e)),
    ]);
    if(currentEventoId)loadRio(currentEventoId);

  }catch(e){
    console.error('Init error:',e);
    const feed=document.getElementById('feed-list');
    if(feed)feed.innerHTML=`<div style="font-size:12px;color:var(--hot-d);padding:8px 0;">⚠️ Error conectando. Verificá la API en Netlify.</div>`;
  }
}

document.addEventListener('DOMContentLoaded',init);