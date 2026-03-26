# BFFapp 💅

La app de Las Amigas para organizar viajes, eventos, encuestas y finanzas.

## Estructura del proyecto

```
bffapp/
├── index.html      → estructura HTML de la app
├── style.css       → todos los estilos
├── app.js          → toda la lógica y datos
├── manifest.json   → configuración PWA
└── netlify.toml    → configuración de deploy
```

## Cómo subir a GitHub + Netlify

### 1. Crear repositorio en GitHub
1. Ir a [github.com](https://github.com) → **New repository**
2. Nombre: `bffapp`
3. Visibility: **Private** (recomendado)
4. Click **Create repository**

### 2. Subir los archivos
En la página del repo nuevo, click **uploading an existing file** y arrastrá todos los archivos de esta carpeta.

### 3. Conectar con Netlify
1. En Netlify → **Add new site** → **Import an existing project**
2. Elegir **GitHub** → seleccionar el repo `bffapp`
3. Build settings: dejar todo vacío (no hay build)
4. Click **Deploy site**

¡Listo! En 1 minuto vas a tener una URL para compartir con las chicas.

### 4. Instalar como app en el celular (PWA)
- **iPhone**: Abrir la URL en Safari → botón compartir → "Agregar a pantalla de inicio"
- **Android**: Abrir en Chrome → menú → "Agregar a pantalla de inicio"

## Personalizar los datos

Todo el contenido (chicas, pagos, itinerario, encuestas) está en `app.js`.
Buscá las secciones marcadas con `/* DATA */` para editar nombres, fechas y montos.

## Próximos módulos
- 🎁 Regalo secreto (juntar plata sin que la cumpleañera vea)
- 📸 Galería de fotos del grupo
- 💬 Comentarios en actividades
