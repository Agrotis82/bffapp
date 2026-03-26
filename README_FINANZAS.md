# BFFapp · Módulo de Finanzas

## Archivos incluidos

| Archivo | Qué hace |
|---------|----------|
| `migration_gastos.sql` | Ejecutar en Neon → crea tablas `gastos` y `participantes_gasto` |
| `netlify/functions/api.js` | API completa con rutas de gastos (reemplaza el anterior) |
| `finanzas.js` | Lógica del módulo → agregar en index.html como `<script src="finanzas.js">` |
| `finanzas-styles.css` | Estilos → pegar al final de `style.css` |
| `finanzas-screen.html` | HTML de la pantalla → reemplazar el bloque `screen-finanzas` en `index.html` |

---

## Paso 1 — Ejecutar migración en Neon

1. Ir a [console.neon.tech](https://console.neon.tech) → proyecto `bffapp` → **SQL Editor**
2. Pegar el contenido de `migration_gastos.sql`
3. Click **Run**

Esto crea:
- Tabla `gastos` — cada gasto del evento
- Tabla `participantes_gasto` — quiénes participan en cada gasto y cuánto deben
- Vista `deudas_netas` — deudas simplificadas entre chicas
- Vista `balance_por_chica` — balance neto por persona

---

## Paso 2 — Actualizar index.html

### 2a. Agregar script de finanzas antes del cierre </body>
```html
<script src="finanzas.js"></script>
<script src="app.js"></script>
```

### 2b. Reemplazar el bloque screen-finanzas
Buscar en `index.html`:
```html
<!-- FINANZAS -->
<div class="screen" id="screen-finanzas">
  ...
</div>
```
Reemplazar con el contenido de `finanzas-screen.html`

---

## Paso 3 — Actualizar style.css
Pegar el contenido de `finanzas-styles.css` al final de `style.css`

---

## Paso 4 — Actualizar app.js
En la función `loadFinanzas()` de `app.js`, reemplazar el cuerpo con:
```javascript
async function loadFinanzas() {
  const rio = eventos.find(e => e.tipo === 'viaje');
  if (!rio) return;
  await loadFinanzasModule(rio.id);
}
```

---

## Paso 5 — Subir todo a GitHub
- `netlify/functions/api.js` (reemplazar)
- `finanzas.js` (nuevo)
- `style.css` (con estilos agregados)
- `index.html` (con screen actualizado)
- `app.js` (con loadFinanzas actualizado)

---

## Rutas API nuevas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/gastos/:evento_id?moneda=USD` | Listar gastos del evento |
| POST | `/api/gastos` | Crear gasto + participantes |
| PUT | `/api/gastos/:id` | Editar gasto |
| DELETE | `/api/gastos/:id` | Eliminar gasto |
| PUT | `/api/gastos/:id/saldar` | Marcar gasto como saldado |
| PUT | `/api/gastos/:id/desaldar` | Desmarcar saldado |
| GET | `/api/gastos/:evento_id/deudas?moneda=USD` | Deudas simplificadas |
| GET | `/api/gastos/:evento_id/resumen` | Resumen por categoría |
