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
