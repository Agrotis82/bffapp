/* =============================================
   BFFapp · app.js — versión completa
   Todo en un archivo: eventos, itinerario,
   finanzas/gastos, encuestas, chicas.
   Lee 100% desde Neon via API.
   ============================================= */

/* ══════════════════════════════════════════════
   API HELPERS
══════════════════════════════════════════════ */
const API = '/api';

const get  = async path => {
  const r = await fetch(API + path);
  if (!r.ok) throw new Error(`GET ${path} → ${r.status}`);
  return r.json();
};
const post = async (path, body) => {
  const r = await fetch(API + path, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`POST ${path} → ${r.status}`);
  return r.json();
};
const put = async (path, body) => {
  const r = await fetch(API + path, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`PUT ${path} → ${r.status}`);
  return r.json();
};
const del = async path => {
  const r = await fetch(API + path, { method:'DELETE' });
  if (!r.ok) throw new Error(`DELETE ${path} → ${r.status}`);
  return r.json();
};

/* ══════════════════════════════════════════════
   STATE GLOBAL
══════════════════════════════════════════════ */
window.chicas    = [];
let eventos      = [];
let days         = [];
let polls        = {};
let currentEventoId = null;

// Finanzas
const CATS_FIN = [
  { id:'alojamiento', icon:'🏨', label:'Alojamiento', bg:'#E6F1FB', color:'#0C447C' },
  { id:'transporte',  icon:'✈️', label:'Transporte',  bg:'#EEEDFE', color:'#26215C' },
  { id:'comida',      icon:'🍽️', label:'Comida',      bg:'#E1F5EE', color:'#085041' },
  { id:'actividad',   icon:'🎡', label:'Actividad',   bg:'#FAEEDA', color:'#633806' },
  { id:'compras',     icon:'🛍️', label:'Compras',     bg:'#FBEAF0', color:'#4B1528' },
  { id:'otro',        icon:'📌', label:'Otro',        bg:'#F1EFE8', color:'#444441' },
];
let finState = {
  eventoId: null, moneda: 'USD',
  gastos: [], totales: [], deudas: [], balance: [],
  editingGasto: null, selCats: ['alojamiento'],
  selSplit: [], selMon: 'USD',
};

const TIPOS = {
  viaje:  { icon:'✈️',  label:'Viaje',   color:'var(--hot)',    badge:'badge-red'    },
  spa:    { icon:'🧖',  label:'Spa',     color:'var(--teal)',   badge:'badge-teal'   },
  salida: { icon:'🍽️', label:'Salida',  color:'var(--amber)',  badge:'badge-amber'  },
  cumple: { icon:'🎂',  label:'Cumple',  color:'var(--pink)',   badge:'badge-pink'   },
  otro:   { icon:'📍',  label:'Otro',    color:'var(--purple)', badge:'badge-purple' },
};

const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
function getCatFin(id) { return CATS_FIN.find(c => c.id === id) || CATS_FIN[5]; }

function fmt(m, mon) {
  if (m === null || m === undefined) return '–';
  const n = parseFloat(m);
  return mon === 'ARS'
    ? `$${n.toLocaleString('es-AR', { maximumFractionDigits:0 })}`
    : `$${n.toFixed(2)}`;
}

function formatFecha(f) {
  if (!f) return '';
  const d = new Date(f + 'T12:00:00');
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}

// ── FEED DELETE ──
function confirmDeleteFeed(id) {
  openModal(`
    <div class="modal-title">¿Eliminar notificación?</div>
    <div style="font-size:13px;color:var(--text-sec);margin-bottom:1rem;">Esta acción no se puede deshacer.</div>
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-danger" style="flex:2;" onclick="deleteFeedItem(${id})">Sí, eliminar</button>
    </div>`);
}
async function deleteFeedItem(id) {
  try { await del(`/feed/${id}`); } catch(e) { console.warn(e); }
  closeModal();
  const el = document.getElementById(`feed-${id}`);
  if (el) {
    el.style.transition = 'opacity 0.3s, max-height 0.3s';
    el.style.overflow = 'hidden';
    el.style.maxHeight = el.offsetHeight + 'px';
    setTimeout(() => { el.style.opacity = '0'; el.style.maxHeight = '0'; }, 10);
    setTimeout(() => el.remove(), 320);
  }
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 60000);
  if (diff < 1)    return 'Ahora';
  if (diff < 60)   return `Hace ${diff}m`;
  if (diff < 1440) return `Hace ${Math.floor(diff/60)}h`;
  return `Hace ${Math.floor(diff/1440)}d`;
}

// Neon puede devolver "1984-03-15T00:00:00.000Z" o "1984-03-15" — normalizar siempre
function cleanDate(bday) {
  if (!bday) return null;
  return String(bday).slice(0, 10); // tomar solo YYYY-MM-DD
}

function bdayLabel(bday) {
  const clean = cleanDate(bday);
  if (!clean) return '';
  const parts = clean.split('-');
  if (parts.length < 3) return '';
  return `${parseInt(parts[2])} ${meses[parseInt(parts[1]) - 1]}`;
}

function daysUntilBday(bday) {
  const clean = cleanDate(bday);
  if (!clean) return 999;
  const parts = clean.split('-');
  if (parts.length < 3) return 999;
  const today = new Date();
  const month = parseInt(parts[1]) - 1;
  const day   = parseInt(parts[2]);
  const next  = new Date(today.getFullYear(), month, day);
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return Math.ceil((next - today) / (1000*60*60*24));
}

/* ══════════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════════ */
function goTo(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => {
    b.classList.remove('active');
    const lbl  = b.querySelector('.nav-label');
    const icon = b.querySelector('.nav-icon');
    if (lbl)  lbl.style.color  = '';
    if (icon) icon.style.color = '';
  });
  document.getElementById('screen-' + screen)?.classList.add('active');
  const nb = document.getElementById('nav-' + screen);
  if (nb) {
    nb.classList.add('active');
    nb.querySelector('.nav-label')?.style.setProperty('color', 'var(--hot)');
    nb.querySelector('.nav-icon')?.style.setProperty('color', 'var(--hot)');
  }
}

/* ══════════════════════════════════════════════
   MODAL
══════════════════════════════════════════════ */
function openModal(html) {
  document.getElementById('modal-inner').innerHTML = `<div class="modal-handle"></div><button onclick="closeModal()" style="position:absolute;top:1rem;right:1.25rem;background:none;border:none;font-size:22px;cursor:pointer;color:var(--text-ter);line-height:1;padding:0;">×</button>${html}`;
  document.getElementById('modal').style.display = 'flex';
}
function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

/* ══════════════════════════════════════════════
   HOME
══════════════════════════════════════════════ */
async function renderHome() {
  // avatars
  const avRow = document.getElementById('home-avatars');
  if (avRow) {
    avRow.innerHTML = window.chicas.map(c =>
      `<div class="av" style="background:${c.color};">${(c.apodo||c.nombre).slice(0,2)}</div>`
    ).join('');
  }

  // próximo evento
  const sorted = [...eventos].sort((a,b) => new Date(a.fecha_inicio||'9999') - new Date(b.fecha_inicio||'9999'));
  const proximo = sorted[0];
  if (proximo) {
    const t = TIPOS[proximo.tipo] || TIPOS.otro;
    const el = document.getElementById('home-hero-name');
    if (el) el.textContent = `${t.icon} ${proximo.nombre}`;
    const sub = document.getElementById('home-hero-sub');
    if (sub) sub.textContent = [proximo.fecha_inicio && formatFecha(proximo.fecha_inicio), proximo.hotel||proximo.lugar].filter(Boolean).join(' · ');
    if (proximo.fecha_inicio) {
      const diff = Math.ceil((new Date(proximo.fecha_inicio) - new Date()) / (1000*60*60*24));
      const el2 = document.getElementById('home-dias');
      if (el2) el2.textContent = diff > 0 ? `${t.icon} En ${diff} días` : `${t.icon} ¡Es hoy!`;
    }
  }

  const elTC = document.getElementById('total-chicas');
  if (elTC) elTC.textContent = window.chicas.length;
  const eSub = document.getElementById('home-eventos-sub');
  if (eSub) eSub.textContent = `${eventos.length} planes`;
  const cSub = document.getElementById('home-chicas-sub');
  if (cSub) cSub.textContent = `${window.chicas.length} chicas`;

  // feed
  try {
    const feed = await get('/feed');
    const feedEl = document.getElementById('feed-list');
    if (feedEl) {
      feedEl.innerHTML = feed.length
        ? feed.map(f => `
            <div class="feed-item" id="feed-${f.id}">
              <div class="feed-av" style="background:${f.bg_color||'#eee'};color:${f.color||'#333'};">${f.apodo||'?'}</div>
              <div style="flex:1;">
                <div class="feed-text">${f.texto}</div>
                <div class="feed-time">${timeAgo(f.created_at)}</div>
              </div>
              <button onclick="confirmDeleteFeed(${f.id})" style="background:none;border:none;cursor:pointer;color:var(--text-ter);font-size:16px;padding:2px 4px;border-radius:6px;flex-shrink:0;line-height:1;" title="Eliminar">×</button>
            </div>`).join('')
        : '<div style="font-size:12px;color:var(--text-ter);padding:8px 0;">Sin actividad reciente</div>';
    }
  } catch(e) { console.warn('Feed:', e); }
}

/* ══════════════════════════════════════════════
   EVENTOS SCREEN
══════════════════════════════════════════════ */
let eventosFiltro = 'todos';

function renderEventos(filtro) {
  if (filtro) eventosFiltro = filtro;
  const container = document.getElementById('eventos-list');
  if (!container) return;

  const filtered = eventosFiltro === 'todos'
    ? eventos
    : eventos.filter(e => e.tipo === eventosFiltro);

  if (!filtered.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📅</div>
        <div class="empty-state-text">No hay planes de este tipo todavía</div>
        <div class="empty-state-sub">¡Creá uno con el botón de arriba!</div>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(e => {
    const t = TIPOS[e.tipo] || TIPOS.otro;
    const fechaStr = e.fecha_inicio
      ? `📅 ${formatFecha(e.fecha_inicio)}${e.fecha_fin ? ' → ' + formatFecha(e.fecha_fin) : ''}`
      : '📅 Fecha por confirmar';
    return `
      <div class="evento-card">
        <div style="height:3px;background:${t.color};"></div>
        <div class="evento-card-header">
          <div style="flex:1;">
            <div style="margin-bottom:5px;"><span class="badge ${t.badge}">${t.icon} ${t.label}</span></div>
            <div class="evento-nombre">${e.nombre}</div>
            <div class="evento-meta">
              <span>${fechaStr}</span>
              ${e.hotel||e.lugar ? `<span>📍 ${e.hotel||e.lugar}</span>` : ''}
              ${e.cupo_max ? `<span>👯 ${e.cupo_max} cupos</span>` : ''}
            </div>
            ${e.descripcion ? `<div style="font-size:11px;color:var(--text-ter);margin-top:3px;">${e.descripcion}</div>` : ''}
          </div>
          <button class="icon-btn e" onclick="openEditEventoModal(${e.id})" style="flex-shrink:0;margin-left:8px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </div>
        <div class="evento-actions">
          ${e.tipo==='viaje' ? `<button class="evento-btn primary" onclick="abrirDetalle(${e.id})">Ver itinerario →</button>` : ''}
          ${e.tipo==='spa'   ? `<button class="evento-btn primary" onclick="goTo('spa')">Ver encuesta →</button>` : ''}
          <button class="evento-btn" onclick="shareWhatsApp('evento',${e.id})">📱 Compartir</button>
        </div>
      </div>`;
  }).join('');
}

function filterEventos(val, btn) {
  document.querySelectorAll('#eventos-filters .filter-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  renderEventos(val);
}

function abrirDetalle(eventoId) {
  currentEventoId = eventoId;
  goTo('rio');
  loadRio(eventoId);
}

/* ── Nuevo evento ── */
function openNewEventoModal() {
  openModal(`
    <div class="modal-title">Nuevo plan</div>
    <div class="field-group">
      <label class="field-label">Tipo de plan</label>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px;" id="tipo-grid">
        ${Object.entries(TIPOS).map(([k,v],i) => `
          <div class="cat-opt ${i===0?'sel':''}" id="tipo-${k}"
               style="${i===0?`border-color:${v.color};background:var(--surface);`:''}"
               onclick="selectTipo('${k}','${v.color}')">
            <div style="font-size:18px;text-align:center;">${v.icon}</div>
            <div style="font-size:10px;font-weight:500;color:var(--text-sec);text-align:center;">${v.label}</div>
          </div>`).join('')}
      </div>
      <input type="hidden" id="m-tipo" value="viaje">
    </div>
    <label class="field-label">Nombre del plan</label>
    <input class="field-input" id="m-nombre" placeholder="Ej: Viaje a Bariloche">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div><label class="field-label">Fecha inicio</label><input class="field-input" id="m-fi" type="date"></div>
      <div><label class="field-label">Fecha fin</label><input class="field-input" id="m-ff" type="date"></div>
    </div>
    <label class="field-label">Lugar / Hotel</label>
    <input class="field-input" id="m-lugar" placeholder="Ej: Hotel Llao Llao">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div>
        <label class="field-label">Cupo máximo</label>
        <input class="field-input" id="m-cupo" type="number" placeholder="11" min="1">
      </div>
      <div>
        <label class="field-label">Recaudadora</label>
        <select class="field-input" id="m-recaudadora">
          <option value="">Sin recaudadora</option>
          ${window.chicas.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('')}
        </select>
      </div>
    </div>
    <label class="field-label">Descripción (opcional)</label>
    <input class="field-input" id="m-desc" placeholder="Detalles...">
    <div style="display:flex;align-items:center;justify-content:space-between;background:var(--surface);border-radius:12px;padding:10px 12px;margin-bottom:10px;">
      <span style="font-size:13px;color:var(--text);">🗳️ Crear encuesta automáticamente</span>
      <button class="toggle on" id="tog-encuesta" onclick="this.classList.toggle('on')"></button>
    </div>
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-save"   onclick="crearEvento()">Crear plan ✨</button>
    </div>`);
}

function selectTipo(tipo, color) {
  document.querySelectorAll('[id^="tipo-"]').forEach(el => { el.classList.remove('sel'); el.style.borderColor=''; el.style.background=''; });
  const el = document.getElementById('tipo-'+tipo);
  if (el) { el.classList.add('sel'); el.style.borderColor=color; el.style.background='var(--surface)'; }
  document.getElementById('m-tipo').value = tipo;
}

async function crearEvento() {
  const nombre = document.getElementById('m-nombre').value.trim();
  if (!nombre) return;
  const tipo   = document.getElementById('m-tipo').value;
  const lugar  = document.getElementById('m-lugar').value.trim();
  const cupo   = document.getElementById('m-cupo').value;
  const conEnc = document.getElementById('tog-encuesta').classList.contains('on');

  const evt = await post('/eventos', {
    tipo, nombre,
    descripcion:  document.getElementById('m-desc').value.trim(),
    fecha_inicio: document.getElementById('m-fi').value || null,
    fecha_fin:    document.getElementById('m-ff').value || null,
    lugar, hotel: tipo==='viaje' ? lugar : null,
    cupo_max:     cupo ? parseInt(cupo) : null,
  });

  if (tipo==='viaje' && document.getElementById('m-fi').value && document.getElementById('m-ff').value) {
    await crearDiasViaje(evt.id, document.getElementById('m-fi').value, document.getElementById('m-ff').value);
  }
  if (conEnc) await crearEncuestaAuto(evt.id, tipo, nombre);

  eventos = await get('/eventos');
  closeModal();
  renderEventos();
  renderHome();
}

async function crearDiasViaje(eventoId, fi, ff) {
  const start = new Date(fi+'T12:00:00'), end = new Date(ff+'T12:00:00');
  let cur = new Date(start), num = 1;
  while (cur <= end) {
    const titulo = num===1 ? 'Llegada y primer día' : cur.getTime()===end.getTime() ? 'Último día y regreso' : `Día ${num}`;
    await post('/itinerario_dia', { evento_id:eventoId, numero_dia:num, titulo, fecha:cur.toISOString().slice(0,10) });
    cur.setDate(cur.getDate()+1); num++;
  }
}

async function crearEncuestaAuto(eventoId, tipo, nombre) {
  const qs = {
    viaje:  [{ titulo:'¿Qué actividades querés hacer?', pregunta:'Elegí tus preferencias', tipo:'opcion_unica' }],
    spa:    [{ titulo:'¿Qué día preferís?', pregunta:'Elegí tu fecha', tipo:'opcion_unica' },
             { titulo:'¿Cuánto podés gastar?', pregunta:'Presupuesto', tipo:'precio' }],
    salida: [{ titulo:'¿Qué día te queda bien?', pregunta:'Elegí tu fecha', tipo:'opcion_unica' }],
    cumple: [{ titulo:'¿Qué tipo de festejo querés?', pregunta:'Votá', tipo:'opcion_unica' }],
    otro:   [{ titulo:`¿Qué opinás de "${nombre}"?`, pregunta:'Votá', tipo:'opcion_unica' }],
  };
  for (const q of (qs[tipo]||qs.otro)) await post('/encuestas', { evento_id:eventoId, ...q });
}

function openEditEventoModal(eventoId) {
  const e = eventos.find(e=>e.id===eventoId);
  if (!e) return;
  const t = TIPOS[e.tipo]||TIPOS.otro;
  openModal(`
    <div class="modal-title">Editar plan</div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:1rem;">
      <span class="badge ${t.badge}">${t.icon} ${t.label}</span>
      <span style="font-family:var(--fd);font-size:15px;">${e.nombre}</span>
    </div>
    <label class="field-label">Nombre</label>
    <input class="field-input" id="m-nombre" value="${e.nombre}">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div><label class="field-label">Fecha inicio</label><input class="field-input" id="m-fi" type="date" value="${e.fecha_inicio||''}"></div>
      <div><label class="field-label">Fecha fin</label><input class="field-input" id="m-ff" type="date" value="${e.fecha_fin||''}"></div>
    </div>
    <label class="field-label">Lugar / Hotel</label>
    <input class="field-input" id="m-lugar" value="${e.hotel||e.lugar||''}">
    <label class="field-label">Descripción</label>
    <input class="field-input" id="m-desc" value="${e.descripcion||''}">
    <div class="modal-btns">
      <button class="btn-danger" onclick="archivarEvento(${e.id})">Archivar</button>
      <button class="btn-save"   onclick="guardarEvento(${e.id})">Guardar</button>
    </div>`);
}

async function guardarEvento(id) {
  const lugar = document.getElementById('m-lugar').value.trim();
  await put(`/eventos/${id}`, {
    nombre:      document.getElementById('m-nombre').value.trim(),
    fecha_inicio:document.getElementById('m-fi').value||null,
    fecha_fin:   document.getElementById('m-ff').value||null,
    lugar, hotel: lugar,
    descripcion: document.getElementById('m-desc').value.trim(),
  });
  eventos = await get('/eventos');
  closeModal(); renderEventos(); renderHome();
}

async function archivarEvento(id) {
  if (!confirm('¿Archivar este evento?')) return;
  await put(`/eventos/${id}/archivar`, {});
  eventos = eventos.filter(e=>e.id!==id);
  closeModal(); renderEventos(); renderHome();
}

/* ══════════════════════════════════════════════
   RÍO / ITINERARIO
══════════════════════════════════════════════ */
async function loadRio(eventoId) {
  const id  = eventoId || eventos.find(e=>e.tipo==='viaje')?.id;
  const rio = eventos.find(e=>e.id===id);
  if (!rio) return;

  const dest = document.getElementById('r-destino');
  const fech = document.getElementById('r-fechas');
  if (dest) dest.textContent = rio.nombre;
  if (fech) fech.textContent = [
    rio.fecha_inicio && formatFecha(rio.fecha_inicio),
    rio.fecha_fin && '→ '+formatFecha(rio.fecha_fin),
    rio.hotel||rio.lugar
  ].filter(Boolean).join(' ');

  try {
    days = await get(`/itinerario/${id}`);
    renderDays(id);
  } catch(e) { console.warn('Itinerario:', e); }
}

const DAY_COLORS = [
  {cl:'#FCEBEB',tc:'#A32D2D'},{cl:'#EEEDFE',tc:'#26215C'},
  {cl:'#E1F5EE',tc:'#085041'},{cl:'#FAEEDA',tc:'#633806'},
  {cl:'#E6F1FB',tc:'#0C447C'},{cl:'#EAF3DE',tc:'#27500A'},
];

function renderDays(eventoId) {
  const container = document.getElementById('days-rio');
  if (!container) return;
  container.innerHTML = '';
  days.forEach((day, i) => {
    const c = DAY_COLORS[i % DAY_COLORS.length];
    const actsHtml = (day.actividades||[]).map(a => `
      <div class="act-row">
        <div class="act-time">${a.momento||''}</div>
        <div class="act-dot" style="background:#7F77DD;"></div>
        <div class="act-body">
          <div class="act-name">${a.nombre}</div>
          <div class="act-desc">${a.descripcion||''}</div>
          <span class="act-tag">${a.categoria||''}</span>
        </div>
        <div class="act-actions">
          <button class="act-icon-btn" onclick="openEditAct(${day.id},${a.id})">✏️</button>
          <button class="act-icon-btn" onclick="deleteActDB(${a.id},${eventoId||currentEventoId})">🗑</button>
        </div>
      </div>`).join('');

    const div = document.createElement('div');
    div.className = 'day-section';
    div.innerHTML = `
      <div class="day-header-row">
        <div class="day-num" style="background:${c.cl};color:${c.tc};">${day.numero_dia}</div>
        <div style="flex:1;">
          <div class="day-title">${day.titulo}</div>
          <div class="day-date">${day.fecha ? formatFecha(day.fecha) : ''}</div>
        </div>
        <button class="icon-btn e" onclick="openEditDay(${day.id})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
      </div>
      <div class="act-list">
        ${actsHtml}
        <button class="add-act-btn" onclick="openAddAct(${day.id},${eventoId||currentEventoId})">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Agregar actividad
        </button>
      </div>`;
    container.appendChild(div);
  });
}

function openRioModal() {
  const rio = eventos.find(e=>e.id===currentEventoId)||eventos.find(e=>e.tipo==='viaje');
  if (!rio) return;
  openModal(`
    <div class="modal-title">Editar viaje</div>
    <label class="field-label">Nombre</label>
    <input class="field-input" id="m-nombre" value="${rio.nombre}">
    <label class="field-label">Hotel / Lugar</label>
    <input class="field-input" id="m-hotel" value="${rio.hotel||rio.lugar||''}">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div><label class="field-label">Fecha inicio</label><input class="field-input" id="m-fi" type="date" value="${rio.fecha_inicio||''}"></div>
      <div><label class="field-label">Fecha fin</label><input class="field-input" id="m-ff" type="date" value="${rio.fecha_fin||''}"></div>
    </div>
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-save"   onclick="saveRioDB(${rio.id})">Guardar</button>
    </div>`);
}

async function saveRioDB(id) {
  const lugar = document.getElementById('m-hotel').value;
  await put(`/eventos/${id}`, {
    nombre: document.getElementById('m-nombre').value,
    hotel:lugar, lugar,
    fecha_inicio: document.getElementById('m-fi').value,
    fecha_fin:    document.getElementById('m-ff').value,
    descripcion:'',
  });
  closeModal(); eventos = await get('/eventos'); loadRio(id);
}

function openEditDay(dayId) {
  const d = days.find(d=>d.id===dayId);
  if (!d) return;
  openModal(`
    <div class="modal-title">Editar día ${d.numero_dia}</div>
    <label class="field-label">Título</label>
    <input class="field-input" id="m-dt" value="${d.titulo}">
    <label class="field-label">Fecha</label>
    <input class="field-input" id="m-dd" type="date" value="${d.fecha||''}">
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-save"   onclick="saveDayLocal(${dayId})">Guardar</button>
    </div>`);
}

function saveDayLocal(id) {
  const d = days.find(d=>d.id===id);
  if (d) { d.titulo=document.getElementById('m-dt').value; d.fecha=document.getElementById('m-dd').value; }
  closeModal(); renderDays(currentEventoId);
}

const TIME_OPTS = ['Mañana','Mediodía','Tarde','Noche','Todo el día'];

function openAddAct(dayId, eventoId) {
  const opts = TIME_OPTS.map(t=>`<option>${t}</option>`).join('');
  openModal(`
    <div class="modal-title">Nueva actividad</div>
    <label class="field-label">Nombre</label>
    <input class="field-input" id="m-an" placeholder="Ej: Visita al museo">
    <label class="field-label">Descripción</label>
    <input class="field-input" id="m-ad" placeholder="Detalles...">
    <label class="field-label">Momento del día</label>
    <select class="field-input" id="m-at">${opts}</select>
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-save"   onclick="saveActDB(${dayId},null,${eventoId})">Agregar</button>
    </div>`);
}

function openEditAct(dayId, actId) {
  const d = days.find(d=>d.id===dayId);
  const a = d?.actividades?.find(a=>a.id===actId);
  if (!a) return;
  const opts = TIME_OPTS.map(t=>`<option ${a.momento===t?'selected':''}>${t}</option>`).join('');
  openModal(`
    <div class="modal-title">Editar actividad</div>
    <label class="field-label">Nombre</label>
    <input class="field-input" id="m-an" value="${a.nombre}">
    <label class="field-label">Descripción</label>
    <input class="field-input" id="m-ad" value="${a.descripcion||''}">
    <label class="field-label">Momento del día</label>
    <select class="field-input" id="m-at">${opts}</select>
    <div class="modal-btns">
      <button class="btn-danger" onclick="deleteActDB(${actId},${currentEventoId})">Eliminar</button>
      <button class="btn-save"   onclick="saveActDB(${dayId},${actId},${currentEventoId})">Guardar</button>
    </div>`);
}

async function saveActDB(dayId, actId, eventoId) {
  const name = document.getElementById('m-an').value.trim();
  if (!name) return;
  const payload = { dia_id:dayId, momento:document.getElementById('m-at').value, nombre:name, descripcion:document.getElementById('m-ad').value.trim(), categoria:'Actividad' };
  if (actId) await put(`/actividades/${actId}`, payload);
  else       await post('/actividades', payload);
  closeModal();
  days = await get(`/itinerario/${eventoId}`);
  renderDays(eventoId);
}

function confirmDeleteAct(actId, eventoId) {
  openModal(`
    <div class="modal-title">¿Eliminar actividad?</div>
    <div style="font-size:13px;color:var(--text-sec);margin-bottom:1rem;">Esta acción no se puede deshacer.</div>
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-danger" style="flex:2;" onclick="deleteActDB(${actId},${eventoId})">Sí, eliminar</button>
    </div>`);
}
async function deleteActDB(actId, eventoId) {
  await del(`/actividades/${actId}`);
  closeModal();
  days = await get(`/itinerario/${eventoId}`);
  renderDays(eventoId);
}

/* ══════════════════════════════════════════════
   FINANZAS / GASTOS
══════════════════════════════════════════════ */
async function loadFinanzas() {
  const rio = eventos.find(e=>e.tipo==='viaje');
  if (!rio) return;
  finState.eventoId = rio.id;
  await refreshFinanzas();
}

async function refreshFinanzas() {
  try {
    const { eventoId, moneda } = finState;
    // Load ALL gastos (no moneda filter) + deudas for current moneda
    const [data, deudaData] = await Promise.all([
      get(`/gastos/${eventoId}`),  // all monedas
      get(`/gastos/${eventoId}/deudas?moneda=${moneda}`),
    ]);
    finState.gastosAll = data.gastos  || [];  // keep all
    finState.gastos    = (data.gastos||[]).filter(g => g.moneda === moneda); // filtered for display
    finState.totales   = data.totales || [];
    finState.deudas    = deudaData.transacciones || [];
    finState.balance   = deudaData.balance       || [];
    renderFinanzasAll();
  } catch(e) { console.warn('Finanzas:', e); }
}

function renderFinanzasAll() {
  renderFinStats();
  renderFinGastos();
  renderFinDeudas();
  renderFinBalance();
}

function renderFinStats() {
  const { moneda, totales } = finState;
  const t         = totales.find(t=>t.moneda===moneda) || {};
  const total     = parseFloat(t.total    ||0);
  const saldado   = parseFloat(t.saldado  ||0);
  const pendiente = parseFloat(t.pendiente||0);
  const divGastos = finState.gastos.filter(g => !g.solo_registro);
  const nMax      = Math.max(...divGastos.map(g=>g.participantes?.length||1), 1);
  const xPerson   = nMax > 0 ? total/nMax : 0;
  const pct       = total > 0 ? Math.round(saldado/total*100) : 0;

  const s = id => document.getElementById(id);
  if (s('fin-stat-total'))     s('fin-stat-total').textContent     = fmt(total,    moneda);
  if (s('fin-stat-xperson'))   s('fin-stat-xperson').textContent   = fmt(xPerson,  moneda);
  if (s('fin-stat-pendiente')) s('fin-stat-pendiente').textContent = fmt(pendiente,moneda);
  if (s('fin-prog'))           s('fin-prog').style.width            = pct+'%';
  if (s('fin-prog-lbl'))       s('fin-prog-lbl').textContent        = `${pct}% saldado · ${fmt(saldado,moneda)} de ${fmt(total,moneda)}`;
  if (s('fin-moneda-lbl'))     s('fin-moneda-lbl').textContent      = moneda;
  const hs = s('home-finanzas-sub');
  if (hs) hs.textContent = `${fmt(saldado,moneda)} / ${fmt(total,moneda)}`;
}

function renderFinGastos() {
  const list = document.getElementById('fin-gastos-list');
  if (!list) return;
  const { gastos, moneda } = finState;
  if (!gastos.length) {
    list.innerHTML = `<div style="text-align:center;padding:1.5rem;font-size:12px;color:var(--text-ter);">Sin gastos en ${moneda} todavía<br><span style="font-size:11px;">Tocá "+ Registrar gasto" para agregar uno</span></div>`;
    return;
  }
  list.innerHTML = gastos.map(g => {
    const cats  = g.categoria ? g.categoria.split(',') : ['otro'];
    const cat   = getCatFin(cats[0]);
    const parte = g.participantes?.length > 0 ? parseFloat(g.monto)/g.participantes.length : 0;
    const avs   = (g.participantes||[]).slice(0,5).map(p =>
      `<div style="width:18px;height:18px;border-radius:50%;background:${p.bg_color};color:${p.color};font-size:8px;font-weight:500;display:inline-flex;align-items:center;justify-content:center;border:1.5px solid var(--card-bg);margin-left:-4px;">${(p.apodo||'?').slice(0,2)}</div>`
    ).join('');
    return `
      <div class="fin-gasto-row${g.saldado?' saldado':''}${g.solo_registro?' solo-reg':''}">
        <div class="fin-cat-icon" style="background:${cat.bg};">${cat.icon}</div>
        <div style="flex:1;min-width:0;">
          <div class="fin-gasto-nombre">${g.nombre}</div>
          <div class="fin-gasto-meta">
            <div class="fin-av-small" style="background:${g.pagado_por_bg};color:${g.pagado_por_color};">${(g.pagado_por_apodo||'?').slice(0,2)}</div>
            pagó ${g.pagado_por_nombre}
            <div style="display:inline-flex;margin-left:4px;">${avs}</div>
          </div>
          <div style="display:flex;gap:4px;margin-top:3px;flex-wrap:wrap;">
            ${cats.map(cid => { const cc = getCatFin(cid); return `<span class="fin-badge" style="background:${cc.bg};color:${cc.color};">${cc.icon} ${cc.label}</span>`; }).join('')}
            ${g.solo_registro
              ? '<span class="fin-badge" style="background:var(--purple-l);color:var(--purple-d);">📌 Solo registro</span>'
              : g.saldado
                ? '<span class="fin-badge" style="background:var(--teal-l);color:var(--teal-d);">✓ Saldado</span>'
                : '<span class="fin-badge" style="background:var(--amber-l);color:var(--amber-d);">Pendiente</span>'}
            ${g.fecha_registro ? `<span class="fin-badge" style="background:var(--surface);color:var(--text-ter);">📅 ${g.fecha_registro}</span>` : ''}
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <div class="fin-monto">${fmt(g.monto,g.moneda)}</div>
          <div class="fin-monto-sub">${fmt(parte,g.moneda)}/c/u</div>
          <div class="fin-row-actions">
            <button class="fin-act-btn" onclick="openEditGasto(${g.id})">✏️</button>
            <button class="fin-act-btn" onclick="toggleSaldado(${g.id},${g.saldado})">${g.saldado?'↩':'✓'}</button>
            <button class="fin-act-btn" onclick="confirmDeleteGasto(${g.id})">🗑</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function renderFinDeudas() {
  const list = document.getElementById('fin-deudas-list');
  if (!list) return;
  const { deudas, moneda } = finState;

  // Check if ALL gastos compartidos are saldado
  const compartidos = (finState.gastos||[]).filter(g => !g.solo_registro && g.moneda===moneda);
  const todosSaldados = compartidos.length > 0 && compartidos.every(g => g.saldado);

  if (!deudas.length) {
    const msg = todosSaldados
      ? '🎉 ¡Todo saldado! Los gastos compartidos están cerrados.'
      : compartidos.length === 0
        ? '📌 Solo hay gastos de registro, sin deudas compartidas.'
        : '🎉 ¡Todo saldado! No hay deudas pendientes.';
    list.innerHTML = `<div style="text-align:center;padding:1rem;font-size:12px;color:var(--teal-d);">${msg}</div>`;
    return;
  }

  list.innerHTML = deudas.map(t => {
    const de   = t.de_chica   || {};
    const para = t.para_chica || {};
    return `
      <div class="fin-deuda-row" style="flex-wrap:wrap;gap:6px;">
        <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0;">
          <div class="fin-av" style="background:${de.bg_color};color:${de.color};">${(de.apodo||'?').slice(0,2)}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:12px;font-weight:500;color:var(--text);">${de.nombre} → ${para.nombre}</div>
            <div style="font-size:13px;font-weight:500;color:var(--hot-d);">${fmt(t.monto,moneda)}</div>
          </div>
          <div class="fin-av" style="background:${para.bg_color};color:${para.color};">${(para.apodo||'?').slice(0,2)}</div>
        </div>
        <div style="display:flex;gap:6px;width:100%;padding-top:4px;">
          <button class="fin-wa-btn" style="flex:1;" onclick="waDeuda('${de.nombre}','${para.nombre}',${t.monto},'${moneda}')">📱 Recordatorio</button>
          <button class="fin-wa-btn" style="flex:1;background:var(--teal);" onclick="confirmarSaldarDeuda('${de.nombre}','${para.nombre}',${t.monto},'${moneda}',${JSON.stringify(finState.gastos.filter(g=>!g.solo_registro&&!g.saldado&&g.moneda===moneda).map(g=>g.id))})">✓ Saldar</button>
        </div>
      </div>`;
  }).join('');
}

async function confirmarSaldarDeuda(deNombre, paraNombre, monto, moneda, gastoIds) {
  openModal(`
    <div class="modal-title">¿Saldar deuda?</div>
    <div style="background:var(--teal-l);border-radius:12px;padding:1rem;margin-bottom:1rem;text-align:center;">
      <div style="font-size:13px;color:var(--teal-d);">
        <strong>${deNombre}</strong> le pagó a <strong>${paraNombre}</strong>
      </div>
      <div style="font-size:20px;font-weight:500;color:var(--teal-d);margin-top:4px;">${fmt(monto, moneda)}</div>
    </div>
    <div style="font-size:12px;color:var(--text-sec);margin-bottom:1rem;">
      Esto marcará todos los gastos compartidos pendientes como saldados.
    </div>
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-teal" onclick="saldarDeudaCompleta(${JSON.stringify(gastoIds)})">✓ Confirmar saldo</button>
    </div>`);
}

async function saldarDeudaCompleta(gastoIds) {
  closeModal();
  for (const id of gastoIds) {
    await put(`/gastos/${id}/saldar`, {});
  }
  await refreshFinanzas();
}

function renderFinBalance() {
  const list = document.getElementById('fin-balance-list');
  if (!list) return;
  const { balance, moneda } = finState;
  if (!balance.length) { list.innerHTML=''; return; }
  const maxAbs = Math.max(...balance.map(b=>Math.abs(b.balance)), 1);
  list.innerHTML = balance.map(b => {
    const c     = b.chica || {};
    const val   = parseFloat(b.balance);
    const pct   = Math.abs(val)/maxAbs*100;
    const color = val > 0.01 ? 'var(--teal)' : val < -0.01 ? 'var(--hot)' : 'var(--border-med)';
    const label = val > 0.01 ? `le deben ${fmt(val,moneda)}` : val < -0.01 ? `debe ${fmt(-val,moneda)}` : 'en paz ✓';
    return `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:0.5px solid var(--border);">
        <div class="fin-av" style="background:${c.bg_color};color:${c.color};">${(c.apodo||'?').slice(0,2)}</div>
        <div style="flex:1;">
          <div style="font-size:12px;font-weight:500;color:var(--text);">${c.nombre}</div>
          <div style="height:4px;border-radius:4px;background:var(--border);margin-top:4px;overflow:hidden;">
            <div style="height:100%;border-radius:4px;background:${color};width:${pct}%;transition:width 0.4s;"></div>
          </div>
        </div>
        <div style="font-size:11px;font-weight:500;color:${color};min-width:80px;text-align:right;">${label}</div>
      </div>`;
  }).join('');
  const rows = list.querySelectorAll('div[style*="border-bottom"]');
  if (rows.length) rows[rows.length-1].style.borderBottom='none';
}

function finToggleMoneda(mon) {
  finState.moneda = mon;
  document.getElementById('fin-btn-usd')?.classList.toggle('on', mon==='USD');
  document.getElementById('fin-btn-ars')?.classList.toggle('on', mon==='ARS');
  // re-filter from cached gastosAll, only refetch deudas for new moneda
  if (finState.gastosAll) {
    finState.gastos = finState.gastosAll.filter(g => g.moneda === mon);
    get(`/gastos/${finState.eventoId}/deudas?moneda=${mon}`).then(d => {
      finState.deudas  = d.transacciones || [];
      finState.balance = d.balance       || [];
      renderFinanzasAll();
    }).catch(e => console.warn(e));
  } else {
    refreshFinanzas();
  }
}

/* ── Modal gasto ── */
function openAddGasto() {
  finState.editingGasto = null;
  finState.selCats  = ['alojamiento'];
  finState.selSplit = window.chicas.map(c=>c.id);
  finState.selMon   = finState.moneda;
  _openGastoModal();
}

function openEditGasto(id) {
  const g = finState.gastos.find(g=>g.id===id);
  if (!g) return;
  finState.editingGasto = g;
  // categoria comes as 'alojamiento,transporte' string — always split by comma
  finState.selCats  = g.categoria ? g.categoria.split(',').map(s=>s.trim()).filter(Boolean) : ['otro'];
  finState.selSplit = (g.participantes||[]).map(p=>p.chica_id);
  finState.selMon   = g.moneda;
  _openGastoModal(g);
}

function _openGastoModal(prefill) {
  const { selCats, selSplit, selMon } = finState;
  openModal(`
    <div class="modal-title">${prefill ? 'Editar gasto' : 'Registrar gasto'}</div>
    <label class="field-label">Descripción</label>
    <input class="field-input" id="fg-nombre" placeholder="Ej: Cena en Copacabana" value="${prefill?.nombre||''}">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
      <div>
        <label class="field-label">Monto</label>
        <input class="field-input" id="fg-monto" type="number" min="0" step="0.01" placeholder="0.00" value="${prefill?.monto||''}" oninput="finUpdatePreview()" style="margin-bottom:0;">
      </div>
      <div>
        <label class="field-label">Moneda</label>
        <div style="display:flex;gap:6px;">
          <button class="moneda-btn ${selMon==='USD'?'on':''}" id="fg-usd" onclick="finSelMon('USD')">USD</button>
          <button class="moneda-btn ${selMon==='ARS'?'on':''}" id="fg-ars" onclick="finSelMon('ARS')">ARS</button>
        </div>
      </div>
    </div>
    <label class="field-label">Categoría</label>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px;">
      ${CATS_FIN.map(c=>`
        <div class="cat-opt ${selCats.includes(c.id)?'sel':''}" id="fgcat-${c.id}"
             style="${selCats.includes(c.id)?`border-color:${c.color};background:var(--surface);`:''}"
             onclick="finSelCat('${c.id}','${c.color}')">
          <div style="font-size:18px;text-align:center;">${c.icon}</div>
          <div style="font-size:10px;font-weight:500;color:var(--text-sec);text-align:center;">${c.label}</div>
        </div>`).join('')}
    </div>
    <label class="field-label">¿Quién pagó?</label>
    <select class="field-input" id="fg-pagadopor">
      ${window.chicas.map(c=>`<option value="${c.id}" ${prefill?.pagado_por===c.id?'selected':''}>${c.nombre}</option>`).join('')}
    </select>
    <label class="field-label">Se divide entre</label>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;">
      ${window.chicas.map(c=>{
        const sel = selSplit.includes(c.id);
        return `<div class="split-chip ${sel?'sel':''}" id="fgsp-${c.id}"
                     style="${sel?'border-color:var(--teal);background:var(--teal-l);':''}"
                     onclick="finToggleSplit(${c.id})">
          <div style="width:18px;height:18px;border-radius:50%;background:${c.bg_color||c.bg};color:${c.color};display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:500;">${(c.apodo||c.nombre).slice(0,2)}</div>
          ${c.nombre.split(' ')[0]}
        </div>`;
      }).join('')}
    </div>
    <div id="fg-preview" style="font-size:11px;color:var(--text-sec);margin-bottom:10px;"></div>
    <div class="field-group">
      <label class="field-label">Fecha del gasto</label>
      <input class="field-input" id="fg-fecha" type="date" value="${prefill?.fecha_registro||new Date().toISOString().slice(0,10)}">
    </div>
    <div class="field-group">
      <label class="field-label">Notas (opcional)</label>
      <input class="field-input" id="fg-notas" placeholder="Detalles..." value="${prefill?.notas||''}">
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;background:var(--surface);border-radius:12px;padding:10px 12px;margin-bottom:10px;">
      <div>
        <div style="font-size:13px;color:var(--text);font-weight:500;">📌 Solo registro</div>
        <div style="font-size:11px;color:var(--text-sec);margin-top:1px;">No divide entre participantes</div>
      </div>
      <button class="toggle ${prefill?.solo_registro?'on':''}" id="fg-solo" onclick="this.classList.toggle('on');finUpdatePreview()"></button>
    </div>
    <div class="modal-btns">
      ${prefill ? `<button class="btn-danger" onclick="confirmDeleteGasto(${prefill.id})">Eliminar</button>` : '<button class="btn-cancel" onclick="closeModal()">Cancelar</button>'}
      <button class="btn-save" onclick="saveGastoAPI()">Guardar</button>
    </div>`);
  finUpdatePreview();
}

function finSelCat(id, color) {
  const cats = finState.selCats;
  if (cats.includes(id)) {
    if (cats.length === 1) return; // keep at least one
    finState.selCats = cats.filter(c => c !== id);
  } else {
    finState.selCats = [...cats, id];
  }
  // re-render all cat buttons
  CATS_FIN.forEach(c => {
    const el = document.getElementById('fgcat-'+c.id);
    if (!el) return;
    if (finState.selCats.includes(c.id)) {
      el.classList.add('sel');
      el.style.borderColor = c.color;
      el.style.background = 'var(--surface)';
    } else {
      el.classList.remove('sel');
      el.style.borderColor = '';
      el.style.background = '';
    }
  });
}
function finSelMon(mon) {
  finState.selMon = mon;
  document.getElementById('fg-usd')?.classList.toggle('on', mon==='USD');
  document.getElementById('fg-ars')?.classList.toggle('on', mon==='ARS');
  finUpdatePreview();
}
function finToggleSplit(id) {
  if (finState.selSplit.includes(id)) {
    if (finState.selSplit.length===1) return;
    finState.selSplit = finState.selSplit.filter(x=>x!==id);
  } else {
    finState.selSplit = [...finState.selSplit, id];
  }
  document.querySelectorAll('[id^="fgsp-"]').forEach(el=>{el.classList.remove('sel');el.style.borderColor='';el.style.background='';});
  finState.selSplit.forEach(sid=>{
    const el = document.getElementById('fgsp-'+sid);
    if (el) { el.classList.add('sel'); el.style.borderColor='var(--teal)'; el.style.background='var(--teal-l)'; }
  });
  finUpdatePreview();
}
function finUpdatePreview() {
  const monto     = parseFloat(document.getElementById('fg-monto')?.value||0);
  const n         = finState.selSplit.length;
  const prev      = document.getElementById('fg-preview');
  const soloReg   = document.getElementById('fg-solo')?.classList.contains('on');
  // toggle visibility of split section
  const splitSec  = document.getElementById('fg-split-section');
  if (splitSec) splitSec.style.display = soloReg ? 'none' : '';
  if (!prev) return;
  if (soloReg) {
    prev.textContent = '📌 Solo registro — no se divide entre nadie';
    prev.style.color = 'var(--amber-d)';
  } else {
    prev.style.color = '';
    prev.textContent = monto > 0
      ? `${fmt(monto/n, finState.selMon)} por persona · ${n} participante${n!==1?'s':''}`
      : `${n} participante${n!==1?'s':''}`;
  }
}

async function saveGastoAPI() {
  const nombre    = document.getElementById('fg-nombre').value.trim();
  const monto     = parseFloat(document.getElementById('fg-monto').value);
  const pagadoPor = parseInt(document.getElementById('fg-pagadopor').value);
  const soloReg = document.getElementById('fg-solo')?.classList.contains('on') || false;
  if (!nombre || !monto || monto<=0) return;
  if (!soloReg && !finState.selSplit.length) return;
  const payload = {
    evento_id:       finState.eventoId,
    nombre, monto,
    moneda:          finState.selMon,
    categoria:       finState.selCats.join(','),
    pagado_por:      pagadoPor,
    participantes:   soloReg ? [] : finState.selSplit,
    notas:           document.getElementById('fg-notas').value.trim(),
    fecha_registro:  document.getElementById('fg-fecha')?.value || null,
    solo_registro:   soloReg,
  };
  if (finState.editingGasto) await put(`/gastos/${finState.editingGasto.id}`, payload);
  else                        await post('/gastos', payload);
  closeModal(); await refreshFinanzas();
}

function confirmDeleteGasto(id) {
  openModal(`
    <div class="modal-title">¿Eliminar gasto?</div>
    <div style="font-size:13px;color:var(--text-sec);margin-bottom:1rem;">Esta acción eliminará el gasto y no se puede deshacer.</div>
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-danger" style="flex:2;" onclick="deleteGastoAPI(${id})">Sí, eliminar</button>
    </div>`);
}
async function deleteGastoAPI(id) {
  await del(`/gastos/${id}`);
  closeModal(); await refreshFinanzas();
}

async function toggleSaldado(id, saldado) {
  await put(`/gastos/${id}/${saldado?'desaldar':'saldar'}`, {});
  await refreshFinanzas();
}

function waDeuda(de, para, monto, mon) {
  const msg = `💸 *Recordatorio de pago · BFFapp*\n\n${de} le debe a *${para}* ${fmt(monto, mon)}\n\n¡Recordá transferir antes del viaje! 🙏`;
  window.open('https://wa.me/?text='+encodeURIComponent(msg), '_blank');
}

/* ══════════════════════════════════════════════
   POLLS / SPA
══════════════════════════════════════════════ */
// expose polls globally for WhatsApp message
function _exposePollsGlobal() { window._polls = polls; }

async function loadPolls() {
  const spa = eventos.find(e=>e.tipo==='spa');
  if (!spa) return;
  try {
    const encuestas = await get(`/encuestas/${spa.id}`);
    polls = {};
    encuestas.forEach(e => { polls[e.id] = e; });
    _exposePollsGlobal();
    renderPolls();
  } catch(e) { console.warn('Polls:', e); }
}

function tvotes(opts) { return (opts||[]).reduce((a,o)=>a+(o.votos||0),0); }

function renderPolls() {
  const container = document.getElementById('polls-spa');
  if (!container) return;
  container.innerHTML = '';
  Object.values(polls).forEach(p => {
    const isPrecio = p.tipo==='precio';
    const total    = tvotes(p.opciones);
    if (isPrecio) {
      const pOpts = (p.opciones||[]).map(o=>
        `<div class="precio-opt ${p._myVote===o.id?'sel':''}" onclick="selPrecio(${p.id},${o.id})"><div class="precio-val">${o.nombre}</div></div>`
      ).join('');
      container.innerHTML += `
        <div class="poll-block">
          <div class="poll-top"><div class="poll-title">${p.titulo}</div><button class="edit-poll-btn" onclick="openEditPoll(${p.id})">✏️ Editar</button></div>
          <div class="poll-card">
            <div class="poll-meta-row"><div class="poll-q">${p.pregunta}</div><div class="poll-meta-txt">${total} votos</div></div>
            <div class="precio-opts">${pOpts}</div>
            <button class="vote-btn" onclick="confirmPrecio(${p.id})" ${!p._myVote||p._confirmed?'disabled':''}>
              ${p._confirmed?'¡Presupuesto registrado ✓':'Confirmar presupuesto'}
            </button>
          </div>
        </div>`;
    } else {
      const optsHtml = (p.opciones||[]).map(o => {
        const pct   = total>0?Math.round((o.votos||0)/total*100):0;
        const voted = p._myVote===o.id;
        return p._showR
          ? `<div class="opt-row ${voted?'voted':''}" onclick="votePollDB(${p.id},${o.id})">
              <div class="opt-circle"><div class="opt-check"></div></div>
              <div class="opt-body">
                <div style="display:flex;justify-content:space-between;"><span class="opt-name">${o.nombre}</span><span class="opt-pct">${pct}%</span></div>
                ${o.descripcion?`<div class="opt-desc">${o.descripcion}</div>`:''}
                <div class="opt-bar-bg"><div class="opt-bar-fill" style="width:${pct}%"></div></div>
              </div></div>`
          : `<div class="opt-row ${voted?'voted':''}" onclick="votePollDB(${p.id},${o.id})">
              <div class="opt-circle"><div class="opt-check"></div></div>
              <div class="opt-body">
                <div class="opt-name">${o.nombre}</div>
                ${o.descripcion?`<div class="opt-desc">${o.descripcion}</div>`:''}
                ${voted?'<span class="my-badge">Tu voto ✓</span>':''}
              </div></div>`;
      }).join('');
      container.innerHTML += `
        <div class="poll-block">
          <div class="poll-top"><div class="poll-title">${p.titulo}</div><button class="edit-poll-btn" onclick="openEditPoll(${p.id})">✏️ Editar</button></div>
          <div class="poll-card">
            <div class="poll-meta-row"><div class="poll-q">${p.pregunta}</div><div class="poll-meta-txt">${total} votos · ${p._myVote?'Ya votaste':'Tocá para votar'}</div></div>
            ${optsHtml}
            <button class="add-opt-btn" onclick="openAddOpt(${p.id})">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Agregar opción
            </button>
            <button class="results-toggle" onclick="toggleR(${p.id})">${p._showR?'Ocultar resultados ↑':'Ver resultados ↓'}</button>
          </div>
        </div>`;
    }
  });
}

async function votePollDB(encId, optId) {
  polls[encId]._myVote = optId;
  const opt = polls[encId].opciones.find(o=>o.id===optId);
  if (opt) opt.votos = (opt.votos||0)+1;
  renderPolls();
  try { await post('/votos', { opcion_id:optId, chica_id:1 }); } catch(e) { console.warn(e); }
}
function toggleR(id)        { polls[id]._showR=!polls[id]._showR; renderPolls(); }
function selPrecio(encId, optId) { polls[encId]._myVote=optId; renderPolls(); }
async function confirmPrecio(encId) {
  polls[encId]._confirmed=true; renderPolls();
  try { await post('/votos', { opcion_id:polls[encId]._myVote, chica_id:1 }); } catch(e) {}
}
function openEditPoll(encId) {
  const p = polls[encId];
  const rows = (p.opciones||[]).map(o=>`
    <div class="edit-opt-row">
      <div style="flex:1;font-size:13px;font-weight:500;color:var(--text);">${o.nombre}${o.descripcion?`<div style="font-size:11px;color:var(--text-sec);">${o.descripcion}</div>`:''}</div>
      <div class="icon-btn e" onclick="openEditOpt(${encId},${o.id})"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
      <div class="icon-btn"   onclick="deleteOptDB(${encId},${o.id})"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg></div>
    </div>`).join('');
  openModal(`
    <div class="modal-title">Editar opciones</div>
    <div style="background:var(--surface);border-radius:12px;padding:0 0.75rem;margin-bottom:1rem;">${rows}</div>
    <div class="modal-btns"><button class="btn-cancel" onclick="closeModal()">Cerrar</button><button class="btn-teal" onclick="closeModal();openAddOpt(${encId})">+ Agregar</button></div>`);
}
function openAddOpt(encId) {
  openModal(`
    <div class="modal-title">Nueva opción</div>
    <label class="field-label">Nombre</label><input class="field-input" id="m-on" placeholder="Ej: Alvear Spa">
    <label class="field-label">Descripción</label><input class="field-input" id="m-od" placeholder="Detalles...">
    <div class="modal-btns"><button class="btn-cancel" onclick="closeModal()">Cancelar</button><button class="btn-teal" onclick="addOptDB(${encId})">Agregar</button></div>`);
}
async function addOptDB(encId) {
  const nombre = document.getElementById('m-on').value.trim();
  if (!nombre) return;
  const row = await post('/encuestas/opcion', { encuesta_id:encId, nombre, descripcion:document.getElementById('m-od').value.trim() });
  polls[encId].opciones.push({...row, votos:0});
  closeModal(); renderPolls();
}
function openEditOpt(encId, optId) {
  const o = polls[encId]?.opciones?.find(o=>o.id===optId);
  if (!o) return;
  openModal(`
    <div class="modal-title">Editar opción</div>
    <label class="field-label">Nombre</label><input class="field-input" id="m-on" value="${o.nombre}">
    <label class="field-label">Descripción</label><input class="field-input" id="m-od" value="${o.descripcion||''}">
    <div class="modal-btns"><button class="btn-danger" onclick="deleteOptDB(${encId},${optId})">Eliminar</button><button class="btn-teal" onclick="saveOptDB(${encId},${optId})">Guardar</button></div>`);
}
async function saveOptDB(encId, optId) {
  await put(`/encuestas/opcion/${optId}`, { nombre:document.getElementById('m-on').value.trim(), descripcion:document.getElementById('m-od').value.trim() });
  const o = polls[encId].opciones.find(o=>o.id===optId);
  if (o) { o.nombre=document.getElementById('m-on').value.trim(); o.descripcion=document.getElementById('m-od').value.trim(); }
  closeModal(); renderPolls();
}
async function deleteOptDB(encId, optId) {
  await del(`/encuestas/opcion/${optId}`);
  polls[encId].opciones = polls[encId].opciones.filter(o=>o.id!==optId);
  closeModal(); renderPolls();
}

/* ══════════════════════════════════════════════
   CHICAS
══════════════════════════════════════════════ */
function renderBdayBanner() {
  const banner = document.getElementById('bday-banner');
  if (!banner) return;
  const upcoming = window.chicas.map(c=>({...c,days:daysUntilBday(c.bday)})).filter(c=>c.days<=30).sort((a,b)=>a.days-b.days);
  if (!upcoming.length) { banner.style.display='none'; return; }
  banner.style.display='flex';
  banner.innerHTML = `<div style="font-size:18px;">🎂</div><div class="bday-text">Cumpleaños próximos: ${upcoming.map(c=>`<strong>${c.nombre}</strong> (${c.days===0?'¡hoy!':c.days===1?'mañana':`en ${c.days} días`})`).join(' · ')}</div>`;
}

function renderChicas(filter='') {
  const list = document.getElementById('chicas-list');
  if (!list) return;
  const filtered = window.chicas.filter(c =>
    c.nombre.toLowerCase().includes(filter.toLowerCase()) ||
    (c.apodo||'').toLowerCase().includes(filter.toLowerCase())
  );
  list.innerHTML = filtered.length
    ? filtered.map(c => {
        const d = daysUntilBday(c.bday);
        return `
          <div class="chica-card" onclick="openEditChica(${c.id})">
            <div class="chica-av ${d<=7?'bday-ring':''}" style="background:${c.bg_color};color:${c.color};">${(c.apodo||c.nombre).slice(0,2)}</div>
            <div style="flex:1;">
              <div class="chica-name">${c.nombre}</div>
              <div class="chica-apodo">"${c.apodo||''}" · 🎂 ${bdayLabel(c.bday)}</div>
              <div class="chica-meta">${d<=7?'<span class="meta-chip chip-bday">🎂 Pronto</span>':''}</div>
            </div>
            <div class="chica-edit-btn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </div>
          </div>`;
      }).join('')
    : '<div style="text-align:center;padding:2rem;color:var(--text-ter);font-size:13px;">No se encontró ninguna</div>';

  const sub = document.getElementById('chicas-sub');
  if (sub) sub.textContent = `${window.chicas.length} chicas`;
  const tc = document.getElementById('total-chicas');
  if (tc)  tc.textContent  = window.chicas.length;
}

function filterChicas(val) { renderChicas(val); }

function openEditChica(id) {
  const c = window.chicas.find(c=>c.id===id);
  if (!c) return;
  openModal(`
    <div class="modal-av" style="background:${c.bg_color};color:${c.color};">${(c.apodo||c.nombre).slice(0,2)}</div>
    <div class="modal-name-center">${c.nombre}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <div><label class="field-label">Nombre</label><input class="field-input" id="m-nombre" value="${c.nombre}"></div>
      <div><label class="field-label">Apodo</label><input class="field-input" id="m-apodo" value="${c.apodo||''}"></div>
    </div>
    <label class="field-label">Teléfono / WhatsApp</label>
    <div style="display:flex;gap:8px;align-items:center;">
      <input class="field-input" id="m-tel" value="${c.telefono||''}" style="flex:1;">
      <button class="wa-contact-btn" onclick="openWA('${c.telefono||''}')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        Abrir
      </button>
    </div>
    <label class="field-label">Fecha de cumpleaños</label>
    <input class="field-input" id="m-bday" type="date" value="${cleanDate(c.bday)||''}">
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-save"   onclick="saveChicaDB(${c.id})">Guardar</button>
    </div>`);
}

async function saveChicaDB(id) {
  const nombre = document.getElementById('m-nombre').value.trim();
  const apodo  = document.getElementById('m-apodo').value.trim();
  const tel    = document.getElementById('m-tel').value.trim();
  const bday   = document.getElementById('m-bday').value;
  await put(`/chicas/${id}`, { nombre, apodo, telefono:tel, bday });
  const c = window.chicas.find(c=>c.id===id);
  if (c) { c.nombre=nombre; c.apodo=apodo; c.telefono=tel; c.bday=bday; }
  closeModal();
  renderBdayBanner();
  renderChicas(document.getElementById('search-input')?.value||'');
}

function openWA(tel) {
  if (tel) window.open('https://wa.me/'+tel.replace(/\D/g,''), '_blank');
}

/* ══════════════════════════════════════════════
   WHATSAPP
══════════════════════════════════════════════ */
function shareWhatsApp(type, eventoId) {
  const rio    = eventos.find(e=>e.tipo==='viaje');
  const spa    = eventos.find(e=>e.tipo==='spa');
  const mon    = finState.moneda || 'USD';
  const gastos = finState.gastos || [];
  const deudas = finState.deudas || [];

  function buildMsg() {
    switch(type) {

      case 'general': {
        const proximo = [...eventos].sort((a,b)=>new Date(a.fecha_inicio||'9999')-new Date(b.fecha_inicio||'9999'))[0];
        let m = `👯‍♀️ *BFFapp - Las Amigas* 💅

`;
        m += `📍 *Nuestros planes:*
`;
        eventos.forEach(e => {
          const t = TIPOS[e.tipo]||TIPOS.otro;
          m += `${t.icon} ${e.nombre}`;
          if (e.fecha_inicio) m += ` · ${formatFecha(e.fecha_inicio)}`;
          m += `
`;
        });
        if (proximo?.hotel||proximo?.lugar) m += `
🏨 ${proximo.hotel||proximo.lugar}
`;
        m += `
🔗 bffapp-lasamigas.netlify.app`;
        return m;
      }

      case 'resumen': {
        let m = `👯‍♀️ *Resumen semanal - Las Amigas*

`;
        eventos.forEach(e => {
          const t = TIPOS[e.tipo]||TIPOS.otro;
          m += `${t.icon} *${e.nombre}*
`;
          if (e.fecha_inicio) m += `   📅 ${formatFecha(e.fecha_inicio)}${e.fecha_fin?' → '+formatFecha(e.fecha_fin):''}
`;
          if (e.hotel||e.lugar) m += `   📍 ${e.hotel||e.lugar}
`;
          m += `
`;
        });
        const gastosUSD = gastos.filter(g=>g.moneda==='USD');
        const gastosARS = gastos.filter(g=>g.moneda==='ARS');
        if (gastosUSD.length||gastosARS.length) {
          m += `💸 *Gastos registrados:*
`;
          if (gastosUSD.length) m += `   USD: ${gastosUSD.length} gastos
`;
          if (gastosARS.length) m += `   ARS: ${gastosARS.length} gastos
`;
          m += `
`;
        }
        if (deudas.length) {
          m += `⚠️ Hay deudas pendientes. Revisá la app!
`;
        } else if (gastos.length) {
          m += `✅ ¡Todo saldado!
`;
        }
        m += `
🔗 bffapp-lasamigas.netlify.app`;
        return m;
      }

      case 'itinerario': {
        let m = `✈️ *Itinerario ${rio?.nombre||'Viaje'}*
`;
        if (rio?.fecha_inicio) m += `📅 ${formatFecha(rio.fecha_inicio)}`;
        if (rio?.fecha_fin)    m += ` → ${formatFecha(rio.fecha_fin)}`;
        m += `
`;
        if (rio?.hotel||rio?.lugar) m += `🏨 ${rio.hotel||rio.lugar}
`;
        m += `
`;
        if (days.length) {
          days.forEach(d => {
            m += `📅 *Día ${d.numero_dia} — ${d.titulo}*
`;
            if (d.fecha) m += `_(${formatFecha(d.fecha)})_
`;
            (d.actividades||[]).forEach(a => m += `• ${a.momento ? a.momento+': ' : ''}${a.nombre}
`);
            m += `
`;
          });
        } else {
          m += `_Itinerario por confirmar_
`;
        }
        m += `🔗 bffapp-lasamigas.netlify.app`;
        return m;
      }

      case 'pagos': {
        let m = `💸 *Gastos y pagos - Las Amigas*
`;
        m += `Moneda: ${mon}

`;
        const gastMon = gastos.filter(g=>g.moneda===mon);
        if (gastMon.length) {
          m += `📋 *Gastos registrados:*
`;
          gastMon.forEach(g => {
            const pago = window.chicas.find(c=>c.id===g.pagado_por);
            m += `• ${g.nombre}: *${fmt(g.monto,mon)}*`;
            if (pago) m += ` (pagó ${pago.nombre})`;
            if (g.solo_registro) m += ` 📌`;
            m += `
`;
          });
          const total = gastMon.reduce((a,g)=>a+parseFloat(g.monto),0);
          m += `*Total: ${fmt(total,mon)}*

`;
        } else {
          m += `Sin gastos registrados en ${mon}

`;
        }
        if (deudas.length) {
          m += `💸 *Quién le debe a quién:*
`;
          deudas.forEach(t => {
            m += `• ${t.de_chica?.nombre} → ${t.para_chica?.nombre}: *${fmt(t.monto,mon)}*
`;
          });
          m += `
¡Recuerden transferir antes del viaje! 🙏`;
        } else {
          m += `✅ ¡Todo saldado! No hay deudas pendientes.`;
        }
        return m;
      }

      case 'spa': {
        let m = `🧖‍♀️ *¡Encuesta Spa Day abierta!*

`;
        m += `Chicas, ¡voten para organizar nuestro día de relax!

`;
        const polls = Object.values(window._polls||{});
        polls.forEach(p => {
          m += `📊 *${p.titulo}*
`;
          (p.opciones||[]).forEach(o => m += `• ${o.nombre}${o.votos?' ('+o.votos+' votos)':''}
`);
          m += `
`;
        });
        m += `🔗 bffapp-lasamigas.netlify.app`;
        return m;
      }

      case 'evento': {
        const e = eventos.find(e=>e.id===eventoId);
        if (!e) return '';
        const t = TIPOS[e.tipo]||TIPOS.otro;
        let m = `${t.icon} *${e.nombre}*

`;
        if (e.fecha_inicio) m += `📅 ${formatFecha(e.fecha_inicio)}${e.fecha_fin?' → '+formatFecha(e.fecha_fin):''}
`;
        if (e.hotel||e.lugar) m += `📍 ${e.hotel||e.lugar}
`;
        if (e.cupo_max) m += `👯 ${e.cupo_max} personas
`;
        if (e.descripcion) m += `
${e.descripcion}
`;
        m += `
🔗 bffapp-lasamigas.netlify.app`;
        return m;
      }

      default: return `👯‍♀️ *BFFapp - Las Amigas*
🔗 bffapp-lasamigas.netlify.app`;
    }
  }

  const msg = buildMsg();
  if (msg) window.open('https://wa.me/?text='+encodeURIComponent(msg), '_blank');
}

/* ══════════════════════════════════════════════
   INIT — carga todo desde Neon
══════════════════════════════════════════════ */
async function init() {
  try {
    // Cargar datos base en paralelo
    [window.chicas, eventos] = await Promise.all([
      get('/chicas'),
      get('/eventos'),
    ]);

    // Evento principal (viaje)
    currentEventoId = eventos.find(e=>e.tipo==='viaje')?.id || null;

    // Renderizar todo en paralelo
    await Promise.all([
      renderHome(),
      loadFinanzas(),
      loadPolls(),
    ]);

    // Renders sincrónicos
    renderEventos();
    renderBdayBanner();
    renderChicas();
    if (currentEventoId) loadRio(currentEventoId);

  } catch(e) {
    console.error('Init error:', e);
    // Mostrar error amigable
    const feed = document.getElementById('feed-list');
    if (feed) feed.innerHTML = `<div style="font-size:12px;color:var(--hot-d);padding:8px 0;">⚠️ Error conectando con la base de datos. Verificá que la API esté deployada en Netlify.</div>`;
  }
}

document.addEventListener('DOMContentLoaded', init);
