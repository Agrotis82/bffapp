// netlify/functions/api.js · BFFapp v4 — con módulo Finanzas completo
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.NETLIFY_DATABASE_URL);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  const path   = event.path.replace('/.netlify/functions/api', '').replace('/api', '');
  const method = event.httpMethod;
  const body   = event.body ? JSON.parse(event.body) : {};

  try {

    // ── HEALTH ─────────────────────────────────────────
    if (path === '/health' && method === 'GET') {
      const [r] = await sql`SELECT NOW() AS time`;
      return ok(headers, { status: 'ok', db: r.time });
    }

    // ── CHICAS ─────────────────────────────────────────
    if (path === '/chicas' && method === 'GET')
      return ok(headers, await sql`SELECT * FROM chicas ORDER BY nombre`);

    if (path.match(/^\/chicas\/(\d+)$/) && method === 'PUT') {
      const id = +path.split('/')[2];
      const { nombre, apodo, telefono, bday } = body;
      await sql`UPDATE chicas SET nombre=${nombre}, apodo=${apodo}, telefono=${telefono}, bday=${bday} WHERE id=${id}`;
      return ok(headers, { success: true });
    }

    // ── EVENTOS ────────────────────────────────────────
    if (path === '/eventos' && method === 'GET')
      return ok(headers, await sql`SELECT * FROM eventos WHERE activo=true ORDER BY fecha_inicio NULLS LAST`);

    if (path === '/eventos' && method === 'POST') {
      const { tipo, nombre, descripcion, fecha_inicio, fecha_fin, lugar, hotel, cupo_max } = body;
      const [row] = await sql`
        INSERT INTO eventos (tipo,nombre,descripcion,fecha_inicio,fecha_fin,lugar,hotel,cupo_max)
        VALUES (${tipo},${nombre},${descripcion},${fecha_inicio},${fecha_fin},${lugar},${hotel},${cupo_max})
        RETURNING *`;
      return ok(headers, row);
    }

    if (path.match(/^\/eventos\/(\d+)$/) && method === 'PUT') {
      const id = +path.split('/')[2];
      const { nombre, descripcion, fecha_inicio, fecha_fin, lugar, hotel } = body;
      await sql`UPDATE eventos SET nombre=${nombre},descripcion=${descripcion},fecha_inicio=${fecha_inicio},fecha_fin=${fecha_fin},lugar=${lugar},hotel=${hotel} WHERE id=${id}`;
      return ok(headers, { success: true });
    }

    if (path.match(/^\/eventos\/(\d+)\/archivar$/) && method === 'PUT') {
      await sql`UPDATE eventos SET activo=false WHERE id=${+path.split('/')[2]}`;
      return ok(headers, { success: true });
    }

    // ── RSVP ───────────────────────────────────────────
    if (path.match(/^\/rsvp\/(\d+)$/) && method === 'GET') {
      const id = +path.split('/')[2];
      return ok(headers, await sql`
        SELECT r.*,c.nombre,c.apodo,c.color,c.bg_color
        FROM rsvp r JOIN chicas c ON c.id=r.chica_id
        WHERE r.evento_id=${id} ORDER BY c.nombre`);
    }
    if (path === '/rsvp' && method === 'POST') {
      const { evento_id, chica_id, estado } = body;
      await sql`INSERT INTO rsvp (evento_id,chica_id,estado) VALUES (${evento_id},${chica_id},${estado}) ON CONFLICT (evento_id,chica_id) DO UPDATE SET estado=${estado},updated_at=NOW()`;
      return ok(headers, { success: true });
    }

    // ── ITINERARIO ─────────────────────────────────────
    if (path.match(/^\/itinerario\/(\d+)$/) && method === 'GET') {
      const id = +path.split('/')[2];
      const dias = await sql`SELECT * FROM itinerario_dias WHERE evento_id=${id} ORDER BY numero_dia`;
      for (const d of dias)
        d.actividades = await sql`SELECT * FROM actividades WHERE dia_id=${d.id} ORDER BY orden`;
      return ok(headers, dias);
    }
    if (path === '/itinerario_dia' && method === 'POST') {
      const { evento_id, numero_dia, titulo, fecha } = body;
      const [row] = await sql`INSERT INTO itinerario_dias (evento_id,numero_dia,titulo,fecha) VALUES (${evento_id},${numero_dia},${titulo},${fecha}) RETURNING *`;
      return ok(headers, row);
    }
    if (path === '/actividades' && method === 'POST') {
      const { dia_id, momento, nombre, descripcion, categoria } = body;
      const [max] = await sql`SELECT COALESCE(MAX(orden),0)+1 AS next FROM actividades WHERE dia_id=${dia_id}`;
      const [row] = await sql`INSERT INTO actividades (dia_id,momento,nombre,descripcion,categoria,orden) VALUES (${dia_id},${momento},${nombre},${descripcion},${categoria},${max.next}) RETURNING *`;
      return ok(headers, row);
    }
    if (path.match(/^\/actividades\/(\d+)$/) && method === 'PUT') {
      const id = +path.split('/')[2];
      await sql`UPDATE actividades SET momento=${body.momento},nombre=${body.nombre},descripcion=${body.descripcion},categoria=${body.categoria} WHERE id=${id}`;
      return ok(headers, { success: true });
    }
    if (path.match(/^\/actividades\/(\d+)$/) && method === 'DELETE') {
      await sql`DELETE FROM actividades WHERE id=${+path.split('/')[2]}`;
      return ok(headers, { success: true });
    }

    // ══════════════════════════════════════════════════
    // ── GASTOS (módulo finanzas completo) ─────────────
    // ══════════════════════════════════════════════════

    // GET /gastos/:evento_id?moneda=USD
    if (path.match(/^\/gastos\/(\d+)$/) && method === 'GET') {
      const eventoId = +path.split('/')[2];
      const moneda   = event.queryStringParameters?.moneda || null;

      const gastos = moneda
        ? await sql`SELECT g.*,c.nombre AS pagado_por_nombre,c.apodo AS pagado_por_apodo,c.color AS pagado_por_color,c.bg_color AS pagado_por_bg FROM gastos g JOIN chicas c ON c.id=g.pagado_por WHERE g.evento_id=${eventoId} AND g.moneda=${moneda} ORDER BY g.created_at DESC`
        : await sql`SELECT g.*,c.nombre AS pagado_por_nombre,c.apodo AS pagado_por_apodo,c.color AS pagado_por_color,c.bg_color AS pagado_por_bg FROM gastos g JOIN chicas c ON c.id=g.pagado_por WHERE g.evento_id=${eventoId} ORDER BY g.created_at DESC`;

      // traer participantes de cada gasto
      for (const g of gastos) {
        const parts = await sql`
          SELECT pg.*,c.nombre,c.apodo,c.color,c.bg_color
          FROM participantes_gasto pg JOIN chicas c ON c.id=pg.chica_id
          WHERE pg.gasto_id=${g.id}`;
        g.participantes = parts;
      }

      // totales por moneda
      const totales = await sql`
        SELECT moneda,
          SUM(monto) AS total,
          SUM(CASE WHEN saldado THEN monto ELSE 0 END) AS saldado,
          SUM(CASE WHEN NOT saldado THEN monto ELSE 0 END) AS pendiente,
          COUNT(*)::int AS cantidad
        FROM gastos WHERE evento_id=${eventoId}
        GROUP BY moneda`;

      return ok(headers, { gastos, totales });
    }

    // POST /gastos — crear gasto + participantes
    if (path === '/gastos' && method === 'POST') {
      const { evento_id, nombre, monto, moneda, categoria, pagado_por, participantes, notas } = body;

      // insertar gasto
      const [gasto] = await sql`
        INSERT INTO gastos (evento_id,nombre,monto,moneda,categoria,pagado_por,notas)
        VALUES (${evento_id},${nombre},${monto},${moneda},${categoria},${pagado_por},${notas||null})
        RETURNING *`;

      // insertar participantes con monto_debe calculado
      const montoPorPersona = parseFloat(monto) / participantes.length;
      for (const chica_id of participantes) {
        await sql`
          INSERT INTO participantes_gasto (gasto_id, chica_id, monto_debe)
          VALUES (${gasto.id}, ${chica_id}, ${montoPorPersona})
          ON CONFLICT DO NOTHING`;
      }

      // log feed
      const [c] = await sql`SELECT nombre FROM chicas WHERE id=${pagado_por}`;
      await logFeed(sql, pagado_por, 'gasto', `${c.nombre} registró un gasto: ${nombre} (${moneda === 'USD' ? '$' : '$'}${monto} ${moneda})`, evento_id);

      return ok(headers, { ...gasto, participantes });
    }

    // PUT /gastos/:id — editar gasto
    if (path.match(/^\/gastos\/(\d+)$/) && method === 'PUT') {
      const id = +path.split('/')[2];
      const { nombre, monto, moneda, categoria, pagado_por, participantes, notas } = body;

      await sql`UPDATE gastos SET nombre=${nombre},monto=${monto},moneda=${moneda},categoria=${categoria},pagado_por=${pagado_por},notas=${notas||null} WHERE id=${id}`;

      if (participantes) {
        // borrar y reinsertar participantes
        await sql`DELETE FROM participantes_gasto WHERE gasto_id=${id}`;
        const montoPorPersona = parseFloat(monto) / participantes.length;
        for (const chica_id of participantes) {
          await sql`INSERT INTO participantes_gasto (gasto_id,chica_id,monto_debe) VALUES (${id},${chica_id},${montoPorPersona})`;
        }
      }
      return ok(headers, { success: true });
    }

    // DELETE /gastos/:id
    if (path.match(/^\/gastos\/(\d+)$/) && method === 'DELETE') {
      await sql`DELETE FROM gastos WHERE id=${+path.split('/')[2]}`;
      return ok(headers, { success: true });
    }

    // PUT /gastos/:id/saldar — marcar gasto como saldado
    if (path.match(/^\/gastos\/(\d+)\/saldar$/) && method === 'PUT') {
      const id = +path.split('/')[2];
      await sql`UPDATE gastos SET saldado=true WHERE id=${id}`;
      await sql`UPDATE participantes_gasto SET pagado=true, pagado_at=NOW() WHERE gasto_id=${id}`;
      return ok(headers, { success: true });
    }

    // PUT /gastos/:id/desaldar — desmarcar
    if (path.match(/^\/gastos\/(\d+)\/desaldar$/) && method === 'PUT') {
      const id = +path.split('/')[2];
      await sql`UPDATE gastos SET saldado=false WHERE id=${id}`;
      await sql`UPDATE participantes_gasto SET pagado=false, pagado_at=NULL WHERE gasto_id=${id}`;
      return ok(headers, { success: true });
    }

    // GET /gastos/:evento_id/deudas?moneda=USD — deudas simplificadas
    if (path.match(/^\/gastos\/(\d+)\/deudas$/) && method === 'GET') {
      const eventoId = +path.split('/')[2];
      const moneda   = event.queryStringParameters?.moneda || 'USD';

      // traer todos los gastos no saldados del evento en esa moneda
      const gastos = await sql`
        SELECT g.id, g.monto, g.pagado_por,
          ARRAY_AGG(pg.chica_id) AS participantes
        FROM gastos g
        JOIN participantes_gasto pg ON pg.gasto_id=g.id AND pg.pagado=false
        WHERE g.evento_id=${eventoId} AND g.moneda=${moneda} AND g.saldado=false
        GROUP BY g.id`;

      // calcular balance neto por chica
      const balance = {};
      for (const g of gastos) {
        const parte = parseFloat(g.monto) / g.participantes.length;
        balance[g.pagado_por] = (balance[g.pagado_por] || 0) + parseFloat(g.monto);
        for (const id of g.participantes) {
          balance[id] = (balance[id] || 0) - parte;
        }
      }

      // simplificar deudas (algoritmo greedy)
      const deudores   = Object.entries(balance).filter(([,v]) => v < -0.01).map(([id,v]) => ({ id:+id, monto:-v })).sort((a,b) => b.monto-a.monto);
      const acreedores = Object.entries(balance).filter(([,v]) => v >  0.01).map(([id,v]) => ({ id:+id, monto:v  })).sort((a,b) => b.monto-a.monto);

      const transacciones = [];
      const d = deudores.map(x => ({...x}));
      const a = acreedores.map(x => ({...x}));
      let i = 0, j = 0;
      while (i < d.length && j < a.length) {
        const pagar = Math.min(d[i].monto, a[j].monto);
        if (pagar > 0.01) transacciones.push({ de: d[i].id, para: a[j].id, monto: +pagar.toFixed(2) });
        d[i].monto -= pagar;
        a[j].monto -= pagar;
        if (d[i].monto < 0.01) i++;
        if (a[j].monto < 0.01) j++;
      }

      // enriquecer con datos de chicas
      const chicas = await sql`SELECT id,nombre,apodo,color,bg_color FROM chicas`;
      const byId = Object.fromEntries(chicas.map(c => [c.id, c]));
      const result = transacciones.map(t => ({
        ...t,
        de_chica:   byId[t.de],
        para_chica: byId[t.para],
      }));

      // balance enriquecido
      const balanceEnriquecido = Object.entries(balance).map(([id, val]) => ({
        chica_id: +id,
        chica: byId[+id],
        balance: +val.toFixed(2),
      }));

      return ok(headers, { transacciones: result, balance: balanceEnriquecido });
    }

    // GET /gastos/:evento_id/resumen — resumen por categoría
    if (path.match(/^\/gastos\/(\d+)\/resumen$/) && method === 'GET') {
      const eventoId = +path.split('/')[2];
      const resumen  = await sql`
        SELECT categoria, moneda,
          COUNT(*)::int AS cantidad,
          SUM(monto)    AS total
        FROM gastos WHERE evento_id=${eventoId}
        GROUP BY categoria, moneda
        ORDER BY total DESC`;
      return ok(headers, resumen);
    }

    // ── ENCUESTAS ──────────────────────────────────────
    if (path === '/encuestas' && method === 'POST') {
      const { evento_id, titulo, pregunta, tipo } = body;
      const [row] = await sql`INSERT INTO encuestas (evento_id,titulo,pregunta,tipo) VALUES (${evento_id},${titulo},${pregunta},${tipo}) RETURNING *`;
      return ok(headers, row);
    }
    if (path.match(/^\/encuestas\/(\d+)$/) && method === 'GET') {
      const id = +path.split('/')[2];
      const encuestas = await sql`SELECT * FROM encuestas WHERE evento_id=${id} AND activa=true ORDER BY id`;
      for (const enc of encuestas) {
        enc.opciones = await sql`SELECT o.*,COUNT(v.id)::int AS votos FROM opciones_encuesta o LEFT JOIN votos v ON v.opcion_id=o.id WHERE o.encuesta_id=${enc.id} GROUP BY o.id ORDER BY o.orden`;
      }
      return ok(headers, encuestas);
    }
    if (path === '/encuestas/opcion' && method === 'POST') {
      const [row] = await sql`INSERT INTO opciones_encuesta (encuesta_id,nombre,descripcion) VALUES (${body.encuesta_id},${body.nombre},${body.descripcion}) RETURNING *`;
      return ok(headers, row);
    }
    if (path.match(/^\/encuestas\/opcion\/(\d+)$/) && method === 'PUT') {
      const id = +path.split('/')[3];
      await sql`UPDATE opciones_encuesta SET nombre=${body.nombre},descripcion=${body.descripcion} WHERE id=${id}`;
      return ok(headers, { success: true });
    }
    if (path.match(/^\/encuestas\/opcion\/(\d+)$/) && method === 'DELETE') {
      await sql`DELETE FROM opciones_encuesta WHERE id=${+path.split('/')[3]}`;
      return ok(headers, { success: true });
    }
    if (path === '/votos' && method === 'POST') {
      const { opcion_id, chica_id } = body;
      const [op] = await sql`SELECT encuesta_id FROM opciones_encuesta WHERE id=${opcion_id}`;
      await sql`DELETE FROM votos WHERE chica_id=${chica_id} AND opcion_id IN (SELECT id FROM opciones_encuesta WHERE encuesta_id=${op.encuesta_id})`;
      await sql`INSERT INTO votos (opcion_id,chica_id) VALUES (${opcion_id},${chica_id})`;
      return ok(headers, { success: true });
    }

    // ── FEED ───────────────────────────────────────────
    if (path === '/feed' && method === 'GET')
      return ok(headers, await sql`SELECT f.*,c.apodo,c.color,c.bg_color FROM actividad_feed f LEFT JOIN chicas c ON c.id=f.chica_id ORDER BY f.created_at DESC LIMIT 20`);

    // ── MISIONES SECRETAS ──────────────────────────────
    if (path === '/misiones' && method === 'GET')
      return ok(headers, await sql`SELECT m.*,COALESCE(SUM(a.monto),0) AS recaudado,COUNT(a.id)::int AS aportantes FROM misiones_secretas m LEFT JOIN aportes_mision a ON a.mision_id=m.id AND a.pagado=true WHERE m.activa=true GROUP BY m.id ORDER BY m.created_at DESC`);

    if (path === '/misiones' && method === 'POST') {
      const { nombre, descripcion, festejada_id, monto_objetivo, fecha_limite } = body;
      const [row] = await sql`INSERT INTO misiones_secretas (nombre,descripcion,festejada_id,monto_objetivo,fecha_limite) VALUES (${nombre},${descripcion},${festejada_id},${monto_objetivo},${fecha_limite}) RETURNING *`;
      return ok(headers, row);
    }
    if (path === '/misiones/aporte' && method === 'POST') {
      const { mision_id, chica_id, monto } = body;
      await sql`INSERT INTO aportes_mision (mision_id,chica_id,monto,pagado) VALUES (${mision_id},${chica_id},${monto},true) ON CONFLICT (mision_id,chica_id) DO UPDATE SET monto=${monto},pagado=true,updated_at=NOW()`;
      return ok(headers, { success: true });
    }

    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Ruta no encontrada', path }) };

  } catch (err) {
    console.error('API Error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

async function logFeed(sql, chica_id, tipo, texto, evento_id) {
  try {
    await sql`INSERT INTO actividad_feed (chica_id,tipo,texto,evento_id) VALUES (${chica_id},${tipo},${texto},${evento_id})`;
  } catch (e) { console.warn('Feed log:', e); }
}

function ok(headers, data) {
  return { statusCode: 200, headers, body: JSON.stringify(data) };
}
