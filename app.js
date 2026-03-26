/* ===================== DATA ===================== */
let nextId = 100;
const uid = () => nextId++;

const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

let chicas = [
  {id:1,  nombre:'Luisa',    apodo:'Lu',   tel:'5491112340001', bday:'1984-03-15', rio:true,  spa:true,  color:'#A32D2D', bg:'#FCEBEB'},
  {id:2,  nombre:'Marta',    apodo:'Ma',   tel:'5491112340002', bday:'1983-07-22', rio:true,  spa:true,  color:'#085041', bg:'#E1F5EE'},
  {id:3,  nombre:'Carolina', apodo:'Caro', tel:'5491112340003', bday:'1984-11-03', rio:true,  spa:true,  color:'#633806', bg:'#FAEEDA'},
  {id:4,  nombre:'Valentina',apodo:'Vale', tel:'5491112340004', bday:'1985-04-28', rio:true,  spa:true,  color:'#533BAB', bg:'#EEEDFE'},
  {id:5,  nombre:'Paola',    apodo:'Pau',  tel:'5491112340005', bday:'1983-08-10', rio:true,  spa:true,  color:'#185FA5', bg:'#E6F1FB'},
  {id:6,  nombre:'Silvia',   apodo:'Sil',  tel:'5491112340006', bday:'1984-12-19', rio:true,  spa:true,  color:'#0F6E56', bg:'#E1F5EE'},
  {id:7,  nombre:'Romina',   apodo:'Romi', tel:'5491112340007', bday:'1985-02-07', rio:true,  spa:true,  color:'#993C1D', bg:'#FAECE7'},
  {id:8,  nombre:'Andrea',   apodo:'Andy', tel:'5491112340008', bday:'1983-09-14', rio:false, spa:true,  color:'#993556', bg:'#FBEAF0'},
  {id:9,  nombre:'Gabriela', apodo:'Gabi', tel:'5491112340009', bday:'1984-06-30', rio:false, spa:true,  color:'#3B6D11', bg:'#EAF3DE'},
  {id:10, nombre:'Marcela',  apodo:'Mar',  tel:'5491112340010', bday:'1985-05-21', rio:false, spa:true,  color:'#854F0B', bg:'#FAEEDA'},
  {id:11, nombre:'Claudia',  apodo:'Clau', tel:'5491112340011', bday:'1983-10-08', rio:false, spa:true,  color:'#5F5E5A', bg:'#F1EFE8'},
];

let pagos = [
  {ini:'Lu', nombre:'Luisa',    status:'pagado',   monto:250},
  {ini:'Ma', nombre:'Marta',    status:'pagado',   monto:250},
  {ini:'Ca', nombre:'Carolina', status:'pagado',   monto:250},
  {ini:'Va', nombre:'Valentina',status:'pendiente',monto:0},
  {ini:'Pa', nombre:'Paola',    status:'pendiente',monto:0},
  {ini:'Si', nombre:'Silvia',   status:'parcial',  monto:125},
  {ini:'Ro', nombre:'Romina',   status:'pendiente',monto:0},
];

let days = [
  {id:1, title:'Llegada y Barra da Tijuca', date:'Jueves 26 de junio',    cl:'#FCEBEB', tc:'#A32D2D',
   acts:[
    {id:1,  time:'Mañana', name:'Llegada al aeropuerto GIG',   desc:'Transfer al Windsor Barra · Check-in', cat:'Hotel',      dot:'#378ADD'},
    {id:2,  time:'Tarde',  name:'Playa de Barra da Tijuca',    desc:'La playa más larga de Río',            cat:'Playa',      dot:'#378ADD'},
    {id:3,  time:'Noche',  name:'Cena en BarraShopping',       desc:'Restaurantes variados',                cat:'Gastronomía',dot:'#1D9E75'},
   ]},
  {id:2, title:'Íconos de Río', date:'Viernes 27 de junio', cl:'#EEEDFE', tc:'#26215C',
   acts:[
    {id:4,  time:'Mañana', name:'Cristo Redentor',             desc:'Tren del Corcovado · vista panorámica',cat:'Turismo',    dot:'#7F77DD'},
    {id:5,  time:'Tarde',  name:'Pão de Açúcar',               desc:'Teleférico · atardecer imperdible',    cat:'Turismo',    dot:'#BA7517'},
    {id:6,  time:'Noche',  name:'Santa Teresa o Lapa',         desc:'Samba en vivo · caipirinhas',          cat:'Noche',      dot:'#E24B4A'},
   ]},
  {id:3, title:'Ipanema y Copacabana', date:'Sábado 28 de junio', cl:'#E1F5EE', tc:'#085041',
   acts:[
    {id:7,  time:'Mañana', name:'Playa de Ipanema',            desc:'Puesto 9 · la más famosa',             cat:'Playa',      dot:'#378ADD'},
    {id:8,  time:'Tarde',  name:'Copacabana + compras',        desc:'Paseo Atlántico · souvenirs',          cat:'Compras',    dot:'#1D9E75'},
    {id:9,  time:'Noche',  name:'Cena especial en Ipanema',    desc:'Restaurante frente al mar',            cat:'Gastronomía',dot:'#E24B4A'},
   ]},
  {id:4, title:'Mañana libre y regreso', date:'Domingo 29 de junio', cl:'#FAEEDA', tc:'#633806',
   acts:[
    {id:10, time:'Mañana', name:'Última mañana en Barra',      desc:'Playa libre · desayuno tranquilo',     cat:'Libre',      dot:'#639922'},
    {id:11, time:'Tarde',  name:'Check-out y transfer al GIG', desc:'Vuelo de regreso a Buenos Aires',      cat:'Vuelo',      dot:'#BA7517'},
   ]},
];

let polls = {
  lugar: {
    title:'¿Dónde hacemos el Spa Day?', q:'Elegí tu lugar preferido',
    showR:false, myVote:null,
    opts:[
      {id:1, name:'Sheraton Pilar',       desc:'Hotel 5★ · Pilar',              votes:0},
      {id:2, name:'Sofitel Los Cardales', desc:'Resort de lujo · naturaleza',    votes:0},
    ]
  },
  fecha: {
    title:'¿Qué día preferís?', q:'Elegí tu fecha preferida',
    showR:false, myVote:null,
    opts:[
      {id:3, name:'Viernes 17 de abril',  desc:'Día de semana', votes:0},
      {id:4, name:'Sábado 18 de abril',   desc:'Fin de semana', votes:0},
      {id:5, name:'Domingo 19 de abril',  desc:'Fin de semana', votes:0},
    ]
  },
  precio: {
    title:'¿Cuánto estás dispuesta a gastar?', q:'Presupuesto por persona',
    myVote:null, confirmed:false,
    opts:[
      {id:6, name:'$30k–$50k',   votes:0},
      {id:7, name:'$50k–$80k',   votes:0},
      {id:8, name:'$80k–$120k',  votes:0},
      {id:9, name:'+$120k',      votes:0},
    ]
  },
};

const feed = [
  {ini:'Lu', color:'#A32D2D', bg:'#FCEBEB', text:'Luisa pagó su cuota de Río ✓',                    time:'Hace 2h'},
  {ini:'Si', color:'#0F6E56', bg:'#E1F5EE', text:'Silvia hizo pago parcial de Río',                  time:'Hace 5h'},
  {ini:'Ca', color:'#633806', bg:'#FAEEDA', text:'Carolina agregó actividad al día 3',               time:'Ayer'},
  {ini:'Ma', color:'#085041', bg:'#E1F5EE', text:'Marta votó en la encuesta del Spa Day',            time:'Ayer'},
];

/* ===================== NAVIGATION ===================== */
function goTo(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => {
    b.classList.remove('active');
    const lbl = b.querySelector('.nav-label');
    const icon = b.querySelector('.nav-icon');
    if (lbl) lbl.style.color = '';
    if (icon) icon.style.color = '';
  });
  document.getElementById('screen-' + screen).classList.add('active');
  const nb = document.getElementById('nav-' + screen);
  if (nb) {
    nb.classList.add('active');
    const lbl = nb.querySelector('.nav-label');
    const icon = nb.querySelector('.nav-icon');
    if (lbl) lbl.style.color = 'var(--hot)';
    if (icon) icon.style.color = 'var(--hot)';
  }
}

/* ===================== MODAL ===================== */
function openModal(html) {
  document.getElementById('modal-inner').innerHTML = `<div class="modal-handle"></div>${html}`;
  document.getElementById('modal').style.display = 'flex';
}
function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

/* ===================== HOME ===================== */
function renderHome() {
  // avatars
  const avRow = document.getElementById('home-avatars');
  if (avRow) {
    avRow.innerHTML = chicas.map(c =>
      `<div class="av" style="background:${c.color};">${c.apodo.slice(0,2)}</div>`
    ).join('');
  }
  // días hasta Río
  const rioDate = new Date('2025-06-26');
  const today = new Date();
  const diff = Math.ceil((rioDate - today) / (1000*60*60*24));
  const diasEl = document.getElementById('home-dias');
  if (diasEl) diasEl.textContent = diff > 0 ? `✈️ En ${diff} días` : '✈️ ¡Es hoy!';

  document.getElementById('total-chicas').textContent = chicas.length;

  // feed
  const feedEl = document.getElementById('feed-list');
  if (feedEl) {
    feedEl.innerHTML = feed.map(f => `
      <div class="feed-item">
        <div class="feed-av" style="background:${f.bg};color:${f.color};">${f.ini}</div>
        <div>
          <div class="feed-text">${f.text}</div>
          <div class="feed-time">${f.time}</div>
        </div>
      </div>`).join('');
  }
}

/* ===================== RÍO ===================== */
function renderDays() {
  const container = document.getElementById('days-rio');
  if (!container) return;
  container.innerHTML = '';
  days.forEach(day => {
    const actsHtml = day.acts.map(a => `
      <div class="act-row">
        <div class="act-time">${a.time}</div>
        <div class="act-dot" style="background:${a.dot};"></div>
        <div class="act-body">
          <div class="act-name">${a.name}</div>
          <div class="act-desc">${a.desc}</div>
          <span class="act-tag">${a.cat}</span>
        </div>
        <div class="act-actions">
          <button class="act-icon-btn" onclick="openEditAct(${day.id},${a.id})">✏️</button>
          <button class="act-icon-btn" onclick="deleteAct(${day.id},${a.id})">🗑</button>
        </div>
      </div>`).join('');

    const div = document.createElement('div');
    div.className = 'day-section';
    div.innerHTML = `
      <div class="day-header-row">
        <div class="day-num" style="background:${day.cl};color:${day.tc};">${day.id}</div>
        <div style="flex:1;">
          <div class="day-title">${day.title}</div>
          <div class="day-date">${day.date}</div>
        </div>
        <button class="icon-btn e" onclick="openEditDay(${day.id})">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
      </div>
      <div class="act-list">
        ${actsHtml}
        <button class="add-act-btn" onclick="openAddAct(${day.id})">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Agregar actividad
        </button>
      </div>`;
    container.appendChild(div);
  });
}

function openRioModal() {
  openModal(`
    <div class="modal-title">Editar viaje</div>
    <div class="field-group">
      <label class="field-label">Destino</label>
      <input class="field-input" id="m-dest" value="${document.getElementById('r-destino').textContent}">
    </div>
    <div class="field-group">
      <label class="field-label">Fechas / Hotel</label>
      <input class="field-input" id="m-fech" value="${document.getElementById('r-fechas').textContent}">
    </div>
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-save" onclick="saveRio()">Guardar</button>
    </div>`);
}
function saveRio() {
  document.getElementById('r-destino').textContent = document.getElementById('m-dest').value;
  document.getElementById('r-fechas').textContent = document.getElementById('m-fech').value;
  closeModal();
}

function openEditDay(dayId) {
  const d = days.find(d => d.id === dayId);
  openModal(`
    <div class="modal-title">Editar día ${d.id}</div>
    <div class="field-group">
      <label class="field-label">Título</label>
      <input class="field-input" id="m-dt" value="${d.title}">
    </div>
    <div class="field-group">
      <label class="field-label">Fecha</label>
      <input class="field-input" id="m-dd" value="${d.date}">
    </div>
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-save" onclick="saveDay(${dayId})">Guardar</button>
    </div>`);
}
function saveDay(id) {
  const d = days.find(d => d.id === id);
  d.title = document.getElementById('m-dt').value;
  d.date  = document.getElementById('m-dd').value;
  closeModal(); renderDays();
}

const timeOpts = ['Mañana','Mediodía','Tarde','Noche','Todo el día'];

function openAddAct(dayId) {
  const opts = timeOpts.map(t => `<option>${t}</option>`).join('');
  openModal(`
    <div class="modal-title">Nueva actividad</div>
    <div class="field-group">
      <label class="field-label">Nombre</label>
      <input class="field-input" id="m-an" placeholder="Ej: Jardín Botánico">
    </div>
    <div class="field-group">
      <label class="field-label">Descripción</label>
      <input class="field-input" id="m-ad" placeholder="Detalles, info...">
    </div>
    <div class="field-group">
      <label class="field-label">Momento del día</label>
      <select class="field-input" id="m-at">${opts}</select>
    </div>
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-save" onclick="saveAct(${dayId},null)">Agregar</button>
    </div>`);
}

function openEditAct(dayId, actId) {
  const d = days.find(d => d.id === dayId);
  const a = d.acts.find(a => a.id === actId);
  const opts = timeOpts.map(t => `<option ${a.time===t?'selected':''}>${t}</option>`).join('');
  openModal(`
    <div class="modal-title">Editar actividad</div>
    <div class="field-group">
      <label class="field-label">Nombre</label>
      <input class="field-input" id="m-an" value="${a.name}">
    </div>
    <div class="field-group">
      <label class="field-label">Descripción</label>
      <input class="field-input" id="m-ad" value="${a.desc}">
    </div>
    <div class="field-group">
      <label class="field-label">Momento del día</label>
      <select class="field-input" id="m-at">${opts}</select>
    </div>
    <div class="modal-btns">
      <button class="btn-danger" onclick="deleteAct(${dayId},${actId})">Eliminar</button>
      <button class="btn-save" onclick="saveAct(${dayId},${actId})">Guardar</button>
    </div>`);
}

function saveAct(dayId, actId) {
  const name = document.getElementById('m-an').value.trim();
  if (!name) return;
  const d = days.find(d => d.id === dayId);
  const time = document.getElementById('m-at').value;
  const desc = document.getElementById('m-ad').value.trim();
  if (actId) {
    const a = d.acts.find(a => a.id === actId);
    a.name = name; a.desc = desc; a.time = time;
  } else {
    d.acts.push({id: uid(), time, name, desc, cat:'Actividad', dot:'#7F77DD'});
  }
  closeModal(); renderDays();
}

function deleteAct(dayId, actId) {
  const d = days.find(d => d.id === dayId);
  d.acts = d.acts.filter(a => a.id !== actId);
  closeModal(); renderDays();
}

/* ===================== FINANZAS ===================== */
/* =============================================
   BFFapp · finanzas.js
   Módulo de gastos/finanzas — reemplaza la lógica
   de finanzas en app.js
   ============================================= */

const CATS_FIN = [
  { id:'alojamiento', icon:'🏨', label:'Alojamiento', bg:'#E6F1FB', color:'#0C447C' },
  { id:'transporte',  icon:'✈️', label:'Transporte',  bg:'#EEEDFE', color:'#26215C' },
  { id:'comida',      icon:'🍽️', label:'Comida',      bg:'#E1F5EE', color:'#085041' },
  { id:'actividad',   icon:'🎡', label:'Actividad',   bg:'#FAEEDA', color:'#633806' },
  { id:'compras',     icon:'🛍️', label:'Compras',     bg:'#FBEAF0', color:'#4B1528' },
  { id:'otro',        icon:'📌', label:'Otro',        bg:'#F1EFE8', color:'#444441' },
];

// State del módulo
let finState = {
  eventoId:     null,
  moneda:       'USD',
  gastos:       [],
  totales:      [],
  deudas:       [],
  balance:      [],
  editingGasto: null,
  selCat:       'alojamiento',
  selSplit:     [],
  selMon:       'USD',
};

/* ── helpers ── */
function getCatFin(id) { return CATS_FIN.find(c => c.id === id) || CATS_FIN[5]; }
function fmt(m, mon) {
  if (!m && m !== 0) return '–';
  const n = parseFloat(m);
  return mon === 'ARS'
    ? `$${n.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
    : `$${n.toFixed(2)}`;
}

/* ════════════════════════════════════════════
   LOAD — carga gastos + deudas del evento
════════════════════════════════════════════ */
async function loadFinanzasModule(eventoId) {
  finState.eventoId = eventoId;
  await refreshFinanzas();
}

async function refreshFinanzas() {
  try {
    const { eventoId, moneda } = finState;
    const [data, deudaData] = await Promise.all([
      get(`/gastos/${eventoId}?moneda=${moneda}`),
      get(`/gastos/${eventoId}/deudas?moneda=${moneda}`),
    ]);
    finState.gastos   = data.gastos   || [];
    finState.totales  = data.totales  || [];
    finState.deudas   = deudaData.transacciones || [];
    finState.balance  = deudaData.balance       || [];
    renderFinanzasModule();
  } catch (e) {
    console.error('Finanzas load error:', e);
  }
}

/* ════════════════════════════════════════════
   RENDER PRINCIPAL
════════════════════════════════════════════ */
function renderFinanzasModule() {
  renderFinStats();
  renderFinGastos();
  renderFinDeudas();
  renderFinBalance();
}

/* ── STATS ── */
function renderFinStats() {
  const { moneda, totales } = finState;
  const t = totales.find(t => t.moneda === moneda) || {};
  const total     = parseFloat(t.total    || 0);
  const saldado   = parseFloat(t.saldado  || 0);
  const pendiente = parseFloat(t.pendiente|| 0);
  const nChicas   = finState.gastos.reduce((max, g) => Math.max(max, g.participantes?.length || 1), 1);
  const xPerson   = nChicas > 0 ? total / nChicas : 0;
  const pct       = total > 0 ? Math.round(saldado / total * 100) : 0;

  const s = id => document.getElementById(id);
  if (s('fin-stat-total'))    s('fin-stat-total').textContent    = fmt(total,    moneda);
  if (s('fin-stat-xperson'))  s('fin-stat-xperson').textContent  = fmt(xPerson,  moneda);
  if (s('fin-stat-pendiente'))s('fin-stat-pendiente').textContent= fmt(pendiente,moneda);
  if (s('fin-prog'))          s('fin-prog').style.width           = pct + '%';
  if (s('fin-prog-lbl'))      s('fin-prog-lbl').textContent       = `${pct}% saldado · ${fmt(saldado,moneda)} de ${fmt(total,moneda)}`;
  if (s('fin-moneda-lbl'))    s('fin-moneda-lbl').textContent     = moneda;

  // sync home card
  const hs = document.getElementById('home-finanzas-sub');
  if (hs) hs.textContent = `${fmt(saldado, moneda)} / ${fmt(total, moneda)}`;
}

/* ── GASTOS LIST ── */
function renderFinGastos() {
  const list = document.getElementById('fin-gastos-list');
  if (!list) return;
  const { gastos, moneda } = finState;
  if (!gastos.length) {
    list.innerHTML = `<div style="text-align:center;padding:1.5rem;font-size:12px;color:var(--text-ter);">Sin gastos en ${moneda} todavía</div>`;
    return;
  }
  list.innerHTML = gastos.map(g => {
    const cat   = getCatFin(g.categoria);
    const parte = g.participantes?.length > 0 ? parseFloat(g.monto) / g.participantes.length : 0;
    const avatarsHtml = (g.participantes || []).slice(0, 5).map(p =>
      `<div style="width:18px;height:18px;border-radius:50%;background:${p.bg_color};color:${p.color};font-size:8px;font-weight:500;display:inline-flex;align-items:center;justify-content:center;border:1.5px solid var(--card-bg);margin-left:-4px;">${(p.apodo||'?').slice(0,2)}</div>`
    ).join('');
    return `
      <div class="fin-gasto-row ${g.saldado ? 'saldado' : ''}">
        <div class="fin-cat-icon" style="background:${cat.bg};">${cat.icon}</div>
        <div style="flex:1;min-width:0;">
          <div class="fin-gasto-nombre">${g.nombre}</div>
          <div class="fin-gasto-meta">
            <div class="fin-av-small" style="background:${g.pagado_por_bg};color:${g.pagado_por_color};">${(g.pagado_por_apodo||'?').slice(0,2)}</div>
            pagó ${g.pagado_por_nombre}
            <div style="display:inline-flex;margin-left:4px;">${avatarsHtml}</div>
          </div>
          <div style="display:flex;gap:4px;margin-top:3px;flex-wrap:wrap;">
            <span class="fin-badge" style="background:${cat.bg};color:${cat.color};">${cat.label}</span>
            ${g.saldado
              ? '<span class="fin-badge" style="background:var(--teal-l);color:var(--teal-d);">✓ Saldado</span>'
              : '<span class="fin-badge" style="background:var(--amber-l);color:var(--amber-d);">Pendiente</span>'}
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <div class="fin-monto">${fmt(g.monto, g.moneda)}</div>
          <div class="fin-monto-sub">${fmt(parte, g.moneda)}/c/u</div>
          <div class="fin-row-actions">
            <button class="fin-act-btn" onclick="openEditGasto(${g.id})">✏️</button>
            <button class="fin-act-btn" onclick="toggleSaldado(${g.id},${g.saldado})">${g.saldado ? '↩' : '✓'}</button>
            <button class="fin-act-btn" onclick="deleteGastoAPI(${g.id})">🗑</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

/* ── DEUDAS ── */
function renderFinDeudas() {
  const list = document.getElementById('fin-deudas-list');
  if (!list) return;
  const { deudas, moneda } = finState;
  if (!deudas.length) {
    list.innerHTML = `<div style="text-align:center;padding:1rem;font-size:12px;color:var(--teal-d);">🎉 ¡Todo saldado! No hay deudas pendientes.</div>`;
    return;
  }
  list.innerHTML = deudas.map(t => {
    const de   = t.de_chica   || {};
    const para = t.para_chica || {};
    return `
      <div class="fin-deuda-row">
        <div class="fin-av" style="background:${de.bg_color};color:${de.color};">${(de.apodo||'?').slice(0,2)}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:12px;font-weight:500;color:var(--text);">${de.nombre}</div>
          <div style="font-size:11px;color:var(--text-sec);">le debe a ${para.nombre}</div>
        </div>
        <div class="fin-av" style="background:${para.bg_color};color:${para.color};">${(para.apodo||'?').slice(0,2)}</div>
        <div style="font-size:13px;font-weight:500;color:var(--hot-d);min-width:52px;text-align:right;">${fmt(t.monto, moneda)}</div>
        <button class="fin-wa-btn" onclick="waDeuda('${de.nombre}','${para.nombre}',${t.monto},'${moneda}')">📱</button>
      </div>`;
  }).join('');
}

/* ── BALANCE ── */
function renderFinBalance() {
  const list = document.getElementById('fin-balance-list');
  if (!list) return;
  const { balance, moneda } = finState;
  if (!balance.length) { list.innerHTML = ''; return; }

  const maxAbs = Math.max(...balance.map(b => Math.abs(b.balance)), 1);
  list.innerHTML = balance.map(b => {
    const c     = b.chica || {};
    const val   = parseFloat(b.balance);
    const pct   = Math.abs(val) / maxAbs * 100;
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
  // fix last border
  const rows = list.querySelectorAll('div[style*="border-bottom"]');
  if (rows.length) rows[rows.length-1].style.borderBottom = 'none';
}

/* ════════════════════════════════════════════
   MONEDA TOGGLE
════════════════════════════════════════════ */
function finToggleMoneda(mon) {
  finState.moneda = mon;
  document.getElementById('fin-btn-usd')?.classList.toggle('on', mon === 'USD');
  document.getElementById('fin-btn-ars')?.classList.toggle('on', mon === 'ARS');
  refreshFinanzas();
}

/* ════════════════════════════════════════════
   MODAL — AGREGAR / EDITAR GASTO
════════════════════════════════════════════ */
function openAddGasto() {
  finState.editingGasto = null;
  finState.selCat   = 'alojamiento';
  finState.selSplit = window.chicas ? window.chicas.map(c => c.id) : [];
  finState.selMon   = finState.moneda;
  _openGastoModal();
}

function openEditGasto(gastoId) {
  const g = finState.gastos.find(g => g.id === gastoId);
  if (!g) return;
  finState.editingGasto = g;
  finState.selCat   = g.categoria;
  finState.selSplit = (g.participantes || []).map(p => p.chica_id);
  finState.selMon   = g.moneda;
  _openGastoModal(g);
}

function _openGastoModal(prefill) {
  const chicas = window.chicas || [];
  const { selCat, selSplit, selMon } = finState;

  openModal(`
    <div class="modal-title">${prefill ? 'Editar gasto' : 'Registrar gasto'}</div>

    <label class="field-label">Descripción</label>
    <input class="field-input" id="fg-nombre" placeholder="Ej: Cena en Copacabana" value="${prefill?.nombre||''}">

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
      <div>
        <label class="field-label">Monto</label>
        <input class="field-input" id="fg-monto" type="number" min="0" step="0.01"
               placeholder="0.00" value="${prefill?.monto||''}" oninput="finUpdatePreview()" style="margin-bottom:0;">
      </div>
      <div>
        <label class="field-label">Moneda</label>
        <div style="display:flex;gap:6px;">
          <button class="moneda-btn ${selMon==='USD'?'sel':''}" id="fg-usd" onclick="finSelMon('USD')">USD</button>
          <button class="moneda-btn ${selMon==='ARS'?'sel':''}" id="fg-ars" onclick="finSelMon('ARS')">ARS</button>
        </div>
      </div>
    </div>

    <label class="field-label">Categoría</label>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px;" id="fg-cats">
      ${CATS_FIN.map(c => `
        <div class="cat-opt ${c.id===selCat?'sel':''}" id="fgcat-${c.id}"
             style="${c.id===selCat?`border-color:${c.color};background:var(--surface);`:''}"
             onclick="finSelCat('${c.id}','${c.color}')">
          <div style="font-size:18px;text-align:center;">${c.icon}</div>
          <div style="font-size:10px;font-weight:500;color:var(--text-sec);text-align:center;">${c.label}</div>
        </div>`).join('')}
    </div>

    <label class="field-label">¿Quién pagó?</label>
    <select class="field-input" id="fg-pagadopor">
      ${chicas.map(c => `<option value="${c.id}" ${prefill?.pagado_por===c.id?'selected':''}>${c.nombre}</option>`).join('')}
    </select>

    <label class="field-label">Se divide entre</label>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;" id="fg-split">
      ${chicas.map(c => {
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

    <label class="field-label">Notas (opcional)</label>
    <input class="field-input" id="fg-notas" placeholder="Detalles adicionales..." value="${prefill?.notas||''}">

    <div class="modal-btns">
      ${prefill
        ? `<button class="btn-danger" onclick="deleteGastoAPI(${prefill.id})">Eliminar</button>`
        : '<button class="btn-cancel" onclick="closeModal()">Cancelar</button>'}
      <button class="btn-save" onclick="saveGastoAPI()">Guardar</button>
    </div>`);

  finUpdatePreview();
}

function finSelCat(id, color) {
  finState.selCat = id;
  document.querySelectorAll('[id^="fgcat-"]').forEach(el => { el.classList.remove('sel'); el.style.borderColor=''; el.style.background=''; });
  const el = document.getElementById('fgcat-'+id);
  if (el) { el.classList.add('sel'); el.style.borderColor=color; el.style.background='var(--surface)'; }
}
function finSelMon(mon) {
  finState.selMon = mon;
  document.getElementById('fg-usd')?.classList.toggle('sel', mon==='USD');
  document.getElementById('fg-ars')?.classList.toggle('sel', mon==='ARS');
  finUpdatePreview();
}
function finToggleSplit(id) {
  if (finState.selSplit.includes(id)) {
    if (finState.selSplit.length === 1) return;
    finState.selSplit = finState.selSplit.filter(x => x !== id);
  } else {
    finState.selSplit = [...finState.selSplit, id];
  }
  document.querySelectorAll('[id^="fgsp-"]').forEach(el => { el.classList.remove('sel'); el.style.borderColor=''; el.style.background=''; });
  finState.selSplit.forEach(sid => {
    const el = document.getElementById('fgsp-'+sid);
    if (el) { el.classList.add('sel'); el.style.borderColor='var(--teal)'; el.style.background='var(--teal-l)'; }
  });
  finUpdatePreview();
}
function finUpdatePreview() {
  const monto   = parseFloat(document.getElementById('fg-monto')?.value || 0);
  const n       = finState.selSplit.length;
  const parte   = n > 0 ? monto / n : 0;
  const prev    = document.getElementById('fg-preview');
  if (!prev) return;
  prev.textContent = monto > 0
    ? `${fmt(parte, finState.selMon)} por persona · ${n} participante${n!==1?'s':''}`
    : `${n} participante${n!==1?'s':''}`;
}

async function saveGastoAPI() {
  const nombre    = document.getElementById('fg-nombre').value.trim();
  const monto     = parseFloat(document.getElementById('fg-monto').value);
  const pagadoPor = parseInt(document.getElementById('fg-pagadopor').value);
  const notas     = document.getElementById('fg-notas').value.trim();
  if (!nombre || !monto || monto <= 0 || !finState.selSplit.length) return;

  const payload = {
    evento_id:     finState.eventoId,
    nombre,
    monto,
    moneda:        finState.selMon,
    categoria:     finState.selCat,
    pagado_por:    pagadoPor,
    participantes: finState.selSplit,
    notas,
  };

  if (finState.editingGasto) {
    await put(`/gastos/${finState.editingGasto.id}`, payload);
  } else {
    await post('/gastos', payload);
  }

  closeModal();
  await refreshFinanzas();
}

async function deleteGastoAPI(id) {
  await del(`/gastos/${id}`);
  closeModal();
  await refreshFinanzas();
}

async function toggleSaldado(id, saldado) {
  if (saldado) {
    await put(`/gastos/${id}/desaldar`, {});
  } else {
    await put(`/gastos/${id}/saldar`, {});
  }
  await refreshFinanzas();
}

/* ── WhatsApp deuda ── */
function waDeuda(de, para, monto, mon) {
  const msg = `💸 *Recordatorio de pago · BFFapp*\n\n${de} le debe a *${para}* ${fmt(monto, mon)}\n\n¡Recordá transferir antes del viaje! 🙏`;
  window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
}

// Exportar funciones al scope global
window.loadFinanzasModule  = loadFinanzasModule;
window.refreshFinanzas     = refreshFinanzas;
window.finToggleMoneda     = finToggleMoneda;
window.openAddGasto        = openAddGasto;
window.openEditGasto       = openEditGasto;
window.saveGastoAPI        = saveGastoAPI;
window.deleteGastoAPI      = deleteGastoAPI;
window.toggleSaldado       = toggleSaldado;
window.finSelCat           = finSelCat;
window.finSelMon           = finSelMon;
window.finToggleSplit      = finToggleSplit;
window.finUpdatePreview    = finUpdatePreview;
window.waDeuda             = waDeuda;
/* ===================== POLLS / SPA ===================== */
function tvotes(opts) { return opts.reduce((a,o) => a + o.votes, 0); }

function renderPolls() {
  const container = document.getElementById('polls-spa');
  if (!container) return;
  container.innerHTML = '';

  ['lugar','fecha'].forEach(key => {
    const p = polls[key];
    const total = tvotes(p.opts);
    const optsHtml = p.opts.map(o => {
      const pct = total > 0 ? Math.round(o.votes / total * 100) : 0;
      const voted = p.myVote === o.id;
      if (p.showR) {
        return `<div class="opt-row ${voted?'voted':''}" onclick="votePoll('${key}',${o.id})">
          <div class="opt-circle"><div class="opt-check"></div></div>
          <div class="opt-body">
            <div style="display:flex;justify-content:space-between;">
              <span class="opt-name">${o.name}</span>
              <span class="opt-pct">${pct}%</span>
            </div>
            ${o.desc ? `<div class="opt-desc">${o.desc}</div>` : ''}
            <div class="opt-bar-bg"><div class="opt-bar-fill" style="width:${pct}%"></div></div>
          </div>
        </div>`;
      } else {
        return `<div class="opt-row ${voted?'voted':''}" onclick="votePoll('${key}',${o.id})">
          <div class="opt-circle"><div class="opt-check"></div></div>
          <div class="opt-body">
            <div class="opt-name">${o.name}</div>
            ${o.desc ? `<div class="opt-desc">${o.desc}</div>` : ''}
            ${voted ? '<span class="my-badge">Tu voto ✓</span>' : ''}
          </div>
        </div>`;
      }
    }).join('');

    container.innerHTML += `
      <div class="poll-block">
        <div class="poll-top">
          <div class="poll-title">${p.title}</div>
          <button class="edit-poll-btn" onclick="openEditPoll('${key}')">✏️ Editar</button>
        </div>
        <div class="poll-card">
          <div class="poll-meta-row">
            <div class="poll-q">${p.q}</div>
            <div class="poll-meta-txt">${total} votos · ${p.myVote ? 'Ya votaste' : 'Tocá para votar'}</div>
          </div>
          ${optsHtml}
          <button class="add-opt-btn" onclick="openAddOpt('${key}')">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Agregar opción
          </button>
          <button class="results-toggle" onclick="toggleR('${key}')">${p.showR ? 'Ocultar resultados ↑' : 'Ver resultados ↓'}</button>
        </div>
      </div>`;
  });

  // precio
  const pp = polls.precio;
  const pOpts = pp.opts.map(o =>
    `<div class="precio-opt ${pp.myVote===o.id?'sel':''}" onclick="selPrecio(${o.id})">
      <div class="precio-val">${o.name}</div>
    </div>`).join('');

  container.innerHTML += `
    <div class="poll-block">
      <div class="poll-top">
        <div class="poll-title">${pp.title}</div>
        <button class="edit-poll-btn" onclick="openEditPoll('precio')">✏️ Editar</button>
      </div>
      <div class="poll-card">
        <div class="poll-meta-row">
          <div class="poll-q">${pp.q}</div>
          <div class="poll-meta-txt">${tvotes(pp.opts)} votos</div>
        </div>
        <div class="precio-opts">${pOpts}</div>
        <button class="vote-btn" id="precio-btn" onclick="confirmPrecio()" ${!pp.myVote || pp.confirmed ? 'disabled' : ''}>
          ${pp.confirmed ? '¡Presupuesto registrado ✓' : 'Confirmar presupuesto'}
        </button>
      </div>
    </div>`;
}

function votePoll(key, id) {
  const p = polls[key];
  if (p.myVote === id) return;
  if (p.myVote) p.opts.find(o => o.id === p.myVote).votes--;
  p.myVote = id;
  p.opts.find(o => o.id === id).votes++;
  renderPolls();
}
function toggleR(key) { polls[key].showR = !polls[key].showR; renderPolls(); }
function selPrecio(id) { if (polls.precio.confirmed) return; polls.precio.myVote = id; renderPolls(); }
function confirmPrecio() {
  if (!polls.precio.myVote) return;
  polls.precio.opts.find(o => o.id === polls.precio.myVote).votes++;
  polls.precio.confirmed = true;
  renderPolls();
}

function openEditPoll(key) {
  const p = polls[key];
  const rows = p.opts.map(o => `
    <div class="edit-opt-row">
      <div style="flex:1;">
        <div style="font-size:13px;font-weight:500;color:var(--text);">${o.name}</div>
        ${o.desc ? `<div style="font-size:11px;color:var(--text-sec);">${o.desc}</div>` : ''}
      </div>
      <div class="icon-btn e" onclick="openEditOpt('${key}',${o.id})">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </div>
      <div class="icon-btn" onclick="deleteOpt('${key}',${o.id})">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
      </div>
    </div>`).join('');
  openModal(`
    <div class="modal-title">Editar opciones</div>
    <div style="background:var(--surface);border-radius:12px;padding:0 0.75rem;margin-bottom:1rem;">${rows}</div>
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal()">Cerrar</button>
      <button class="btn-teal" onclick="closeModal();openAddOpt('${key}')">+ Agregar opción</button>
    </div>`);
}

function openAddOpt(key) {
  const isPrecio = key === 'precio';
  openModal(`
    <div class="modal-title">Nueva opción</div>
    <div class="field-group">
      <label class="field-label">${isPrecio ? 'Rango de precio' : 'Nombre'}</label>
      <input class="field-input" id="m-on" placeholder="${isPrecio ? 'Ej: $150k–$200k' : 'Ej: Alvear Spa BA'}">
    </div>
    ${!isPrecio ? `<div class="field-group"><label class="field-label">Descripción (opcional)</label><input class="field-input" id="m-od" placeholder="Zona, tipo..."></div>` : ''}
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-teal" onclick="addOpt('${key}')">Agregar</button>
    </div>`);
}

function addOpt(key) {
  const name = document.getElementById('m-on').value.trim();
  if (!name) return;
  const descEl = document.getElementById('m-od');
  polls[key].opts.push({id: uid(), name, desc: descEl ? descEl.value.trim() : '', votes: 0});
  closeModal(); renderPolls();
}

function openEditOpt(key, optId) {
  const o = polls[key].opts.find(o => o.id === optId);
  const isPrecio = key === 'precio';
  openModal(`
    <div class="modal-title">Editar opción</div>
    <div class="field-group">
      <label class="field-label">Nombre</label>
      <input class="field-input" id="m-on" value="${o.name}">
    </div>
    ${!isPrecio ? `<div class="field-group"><label class="field-label">Descripción</label><input class="field-input" id="m-od" value="${o.desc||''}"></div>` : ''}
    <div class="modal-btns">
      <button class="btn-danger" onclick="deleteOpt('${key}',${optId})">Eliminar</button>
      <button class="btn-teal" onclick="saveOpt('${key}',${optId})">Guardar</button>
    </div>`);
}

function saveOpt(key, id) {
  const o = polls[key].opts.find(o => o.id === id);
  o.name = document.getElementById('m-on').value.trim();
  const descEl = document.getElementById('m-od');
  if (descEl) o.desc = descEl.value.trim();
  closeModal(); renderPolls();
}

function deleteOpt(key, id) {
  polls[key].opts = polls[key].opts.filter(o => o.id !== id);
  if (polls[key].myVote === id) polls[key].myVote = null;
  closeModal(); renderPolls();
}

/* ===================== CHICAS ===================== */
function bdayLabel(bday) {
  if (!bday) return '';
  const d = new Date(bday + 'T12:00:00');
  return `${d.getDate()} ${meses[d.getMonth()]}`;
}

function daysUntilBday(bday) {
  if (!bday) return 999;
  const today = new Date();
  const d = new Date(bday + 'T12:00:00');
  const next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  return Math.ceil((next - today) / (1000*60*60*24));
}

function renderBdayBanner() {
  const banner = document.getElementById('bday-banner');
  if (!banner) return;
  const upcoming = chicas
    .map(c => ({...c, days: daysUntilBday(c.bday)}))
    .filter(c => c.days <= 30)
    .sort((a, b) => a.days - b.days);
  if (!upcoming.length) { banner.style.display = 'none'; return; }
  banner.style.display = 'flex';
  const names = upcoming.map(c =>
    `<strong>${c.nombre}</strong> (${c.days===0 ? '¡hoy!' : c.days===1 ? 'mañana' : `en ${c.days} días`})`
  ).join(' · ');
  banner.innerHTML = `<div style="font-size:18px;">🎂</div><div class="bday-text">Cumpleaños próximos: ${names}</div>`;
}

function renderChicas(filter = '') {
  const list = document.getElementById('chicas-list');
  if (!list) return;
  const filtered = chicas.filter(c =>
    c.nombre.toLowerCase().includes(filter.toLowerCase()) ||
    c.apodo.toLowerCase().includes(filter.toLowerCase())
  );
  if (!filtered.length) {
    list.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--text-ter);font-size:13px;">No se encontró ninguna chica</div>`;
    return;
  }
  list.innerHTML = filtered.map(c => {
    const days = daysUntilBday(c.bday);
    const isBday = days <= 7;
    return `<div class="chica-card" onclick="openEditChica(${c.id})">
      <div class="chica-av ${isBday ? 'bday-ring' : ''}" style="background:${c.bg};color:${c.color};">${c.apodo.slice(0,2)}</div>
      <div style="flex:1;">
        <div class="chica-name">${c.nombre}</div>
        <div class="chica-apodo">"${c.apodo}" · 🎂 ${bdayLabel(c.bday)}</div>
        <div class="chica-meta">
          ${c.rio ? '<span class="meta-chip chip-rio">✈️ Río</span>' : ''}
          ${c.spa ? '<span class="meta-chip chip-spa">🧖 Spa</span>' : ''}
          ${isBday ? '<span class="meta-chip chip-bday">🎂 Pronto</span>' : ''}
        </div>
      </div>
      <div class="chica-edit-btn">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </div>
    </div>`;
  }).join('');

  const sub = document.getElementById('chicas-sub');
  if (sub) sub.textContent = `${chicas.length} chicas`;
  document.getElementById('total-chicas').textContent = chicas.length;
}

function filterChicas(val) { renderChicas(val); }

function openEditChica(id) {
  const c = chicas.find(c => c.id === id);
  openModal(`
    <div class="modal-av" style="background:${c.bg};color:${c.color};">${c.apodo.slice(0,2)}</div>
    <div class="modal-name-center">${c.nombre}</div>
    <div class="field-row">
      <div class="field-group">
        <label class="field-label">Nombre completo</label>
        <input class="field-input" id="m-nombre" value="${c.nombre}">
      </div>
      <div class="field-group">
        <label class="field-label">Apodo</label>
        <input class="field-input" id="m-apodo" value="${c.apodo}">
      </div>
    </div>
    <div class="field-group">
      <label class="field-label">Teléfono / WhatsApp</label>
      <div style="display:flex;gap:8px;align-items:center;">
        <input class="field-input" id="m-tel" value="${c.tel}" style="flex:1;">
        <button class="wa-contact-btn" onclick="openWA('${c.tel}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Abrir
        </button>
      </div>
    </div>
    <div class="field-group">
      <label class="field-label">Fecha de cumpleaños</label>
      <input class="field-input" id="m-bday" type="date" value="${c.bday}">
    </div>
    <div class="section-lbl">Eventos</div>
    <div style="background:var(--surface);border-radius:12px;padding:0 0.75rem;">
      <div class="toggle-row">
        <span class="toggle-label">✈️ Va al viaje a Río</span>
        <button class="toggle ${c.rio?'on':''}" id="tog-rio" onclick="this.classList.toggle('on')"></button>
      </div>
      <div class="toggle-row">
        <span class="toggle-label">🧖 Va al Spa Day</span>
        <button class="toggle ${c.spa?'on':''}" id="tog-spa" onclick="this.classList.toggle('on')"></button>
      </div>
    </div>
    <div class="modal-btns">
      <button class="btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn-save" onclick="saveChica(${c.id})">Guardar</button>
    </div>`);
}

function saveChica(id) {
  const c = chicas.find(c => c.id === id);
  c.nombre = document.getElementById('m-nombre').value.trim() || c.nombre;
  c.apodo  = document.getElementById('m-apodo').value.trim() || c.apodo;
  c.tel    = document.getElementById('m-tel').value.trim();
  c.bday   = document.getElementById('m-bday').value;
  c.rio    = document.getElementById('tog-rio').classList.contains('on');
  c.spa    = document.getElementById('tog-spa').classList.contains('on');
  closeModal();
  renderBdayBanner();
  renderChicas(document.getElementById('search-input').value);
}

function openWA(tel) {
  window.open('https://wa.me/' + tel.replace(/\D/g,''), '_blank');
}

/* ===================== WHATSAPP ===================== */
const waMessages = {
  general:    `👯‍♀️ *BFFapp - Las Amigas* 👯‍♀️\n\n📍 Próximos planes:\n✈️ Viaje a Río · 26-29 Junio · Windsor Barra\n🧖 Spa Day · Votación en curso · Abril 2025\n\n💸 Finanzas Río: $750 cobrado de $1.750\n⚠️ Pendientes: Valentina, Paola, Romina\n\n¡Revisá la app para ver todos los detalles! 💅`,
  resumen:    `👯‍♀️ *Resumen - Las Amigas*\n\n✈️ *Río (26-29 Jun)*\nHotel: Windsor Barra ✓\nItinerario: Completo ✓\nPagos: 3/7 pagaron ($750/$1750)\n\n🧖 *Spa Day (Abril)*\nEncuesta abierta · ¡Faltan votar!\nLugar: Sheraton Pilar vs Sofitel Cardales\n\n💌 ¡No olviden votar y pagar su cuota! 🙏`,
  itinerario: `✈️ *Itinerario Río de Janeiro*\n26-29 de Junio · 7 chicas · Windsor Barra\n\n📅 *Día 1 - Jue 26*\n• Llegada y check-in Windsor Barra\n• Playa de Barra da Tijuca\n• Cena en BarraShopping\n\n📅 *Día 2 - Vie 27*\n• Cristo Redentor 🙌\n• Pão de Açúcar 🌅\n• Noche en Santa Teresa / Lapa 💃\n\n📅 *Día 3 - Sáb 28*\n• Playa de Ipanema 🏖️\n• Copacabana + compras 🛍️\n• Cena especial en Ipanema 🍷\n\n📅 *Día 4 - Dom 29*\n• Mañana libre · Vuelo de regreso ✈️`,
  pagos:      `💸 *Recordatorio de pagos - Viaje Río*\n\n✅ Ya pagaron: Luisa, Marta, Carolina\n⏳ Pago parcial: Silvia ($125 de $250)\n❌ Pendiente: Valentina, Paola, Romina\n\nCuota: $250 USD · Recaudadora: Luisa 📩\n\n¡Recuerden transferir para confirmar el lugar! 🙏`,
  spa:        `🧖‍♀️ *¡Encuesta Spa Day abierta!*\n\n¡Chicas, voten!\n\n📍 *Lugar:*\n• Sheraton Pilar\n• Sofitel Los Cardales\n\n📅 *Fecha:*\n• Viernes 17 de abril\n• Sábado 18 de abril\n• Domingo 19 de abril\n\n¡Abran la app y voten! 🗳️💅`,
};

function shareWhatsApp(type) {
  const msg = waMessages[type] || waMessages.general;
  window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
}

/* ===================== INIT ===================== */
document.addEventListener('DOMContentLoaded', () => {
  renderHome();
  renderDays();
  renderPagos();
  renderPolls();
  renderBdayBanner();
  renderChicas();
});
