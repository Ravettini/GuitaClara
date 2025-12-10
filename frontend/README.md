# GuitaClara Frontend

Frontend independiente de la aplicación GuitaClara, construido con React + Vite + TypeScript.

## 🚀 Desarrollo Local

### Prerrequisitos
- Node.js 18+ y npm

### Instalación

```bash
cd frontend
npm install
```

### Variables de Entorno

Crea un archivo `.env.local` en la carpeta `frontend/`:

```env
VITE_API_URL=http://localhost:3001
```

### Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Build de Producción

```bash
npm run build
```

Genera los archivos estáticos en la carpeta `dist/`

### Preview del Build

```bash
npm run preview
```

## 📦 Deploy en Vercel

### Pasos para Deploy

1. **Subir el repositorio a GitHub**
   - Asegúrate de que todos los cambios estén commiteados y pusheados

2. **En Vercel Dashboard**
   - Ve a [vercel.com](https://vercel.com)
   - Click en "Add New Project"
   - Selecciona tu repositorio de GitHub

3. **Configuración del Proyecto**
   - **Root Directory**: Selecciona `frontend` (o escribe `/frontend`)
   - **Framework Preset**: Vite (o "Other" si no aparece)
   - **Build Command**: `npm run build` (debería detectarse automáticamente)
   - **Output Directory**: `dist` (debería detectarse automáticamente)
   - **Install Command**: `npm install` (debería detectarse automáticamente)

4. **Variables de Entorno**
   - Click en "Environment Variables"
   - Agrega:
     - **Key**: `VITE_API_URL`
     - **Value**: La URL de tu backend (ej: `https://mi-backend.railway.app`)
     - **Environment**: Production, Preview, Development (marca todas)

5. **Deploy**
   - Click en "Deploy"
   - Espera a que termine el build
   - Tu aplicación estará disponible en `https://tu-proyecto.vercel.app`

### Notas Importantes

- El frontend es **completamente independiente** del backend
- No necesita acceso a `/backend`, `/api`, ni ninguna otra carpeta fuera de `/frontend`
- La comunicación con el backend se hace mediante la variable de entorno `VITE_API_URL`
- Si el backend no está disponible, la UI cargará pero las funciones que requieren API fallarán

## 🔧 Configuración de la API

La URL del backend se configura mediante la variable de entorno `VITE_API_URL`.

### Desarrollo Local
```env
VITE_API_URL=http://localhost:3001
```

### Producción (Vercel)
En Vercel → Settings → Environment Variables:
```
VITE_API_URL=https://tu-backend.railway.app
```

### Sin Variable de Entorno
- **Desarrollo**: Usa `http://localhost:3001` por defecto
- **Producción**: Usa `/api` (para serverless functions de Vercel)

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── config/          # Configuración centralizada (API URL)
│   ├── components/      # Componentes reutilizables
│   ├── layouts/         # Layouts de la aplicación
│   ├── pages/           # Páginas/rutas
│   ├── services/        # Servicios de API
│   ├── store/           # Estado global (Zustand)
│   └── utils/           # Utilidades
├── index.html
├── package.json
├── vite.config.ts
└── vercel.json          # Configuración específica para Vercel
```

## 🛠️ Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run preview` - Preview del build local
- `npm run lint` - Linter de código

## 📝 Notas Técnicas

- **Stack**: React 18 + Vite 5 + TypeScript
- **Estado**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Estilos**: TailwindCSS
- **Gráficos**: Recharts

