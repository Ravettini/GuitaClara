# 🚀 Deployment Completo en Netlify (Frontend + Backend)

## ⚠️ IMPORTANTE: Opciones para el Backend

Tienes **2 opciones** para el backend:

---

## Opción 1: Backend Separado (RECOMENDADO)

### Frontend en Netlify:
- Solo el frontend (React/Vite)
- Deploy simple y rápido
- Variables de entorno: `VITE_API_URL=https://tu-backend.railway.app`

### Backend en Railway/Render:
- Backend completo como servicio Node.js
- Más fácil de configurar
- Mejor para APIs complejas

### Pasos:
1. **Backend en Railway:**
   - Ve a [railway.app](https://railway.app)
   - Conecta tu repo
   - Selecciona la carpeta `backend/`
   - Railway detectará automáticamente Node.js
   - Agrega variables de entorno (DATABASE_URL, JWT_SECRET, etc.)
   - Deploy automático

2. **Frontend en Netlify:**
   - Ve a [netlify.com](https://netlify.com)
   - Conecta tu repo
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Variable de entorno: `VITE_API_URL=https://tu-backend.railway.app`
   - Deploy

### Ventajas:
- ✅ Más simple
- ✅ Escala independientemente
- ✅ Menos problemas
- ✅ Mejor para producción

---

## Opción 2: Todo en Netlify (Frontend + Serverless Functions)

### Configuración:

1. **Instalar dependencias para serverless:**
```bash
npm install --save-dev serverless-http
```

2. **Crear función serverless:**
Ya creé `netlify/functions/api.js` que envuelve tu backend Express.

3. **Variables de entorno en Netlify:**
- DATABASE_URL
- JWT_SECRET
- JWT_REFRESH_SECRET
- etc.

4. **Deploy:**
- Netlify detectará automáticamente las funciones en `netlify/functions/`
- El frontend se servirá desde `dist/`
- Las rutas `/api/*` se redirigirán a las funciones serverless

### Limitaciones:
- ⚠️ Timeout de 10 segundos (plan gratuito)
- ⚠️ Límite de 100GB de transferencia
- ⚠️ Más complejo de configurar

---

## 🎯 MI RECOMENDACIÓN FINAL

**Usa Opción 1: Backend separado**

### Por qué:
1. **Más simple:** Cada parte en su lugar
2. **Más confiable:** Menos problemas de configuración
3. **Mejor rendimiento:** Sin límites de timeout
4. **Más fácil de debuggear:** Problemas aislados

### Estructura:
```
Frontend (Netlify) → https://guitaclara.netlify.app
Backend (Railway)  → https://guitaclara-api.railway.app
```

### Configuración del Frontend:
En `src/services/api.ts`, cambiar:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? 'https://guitaclara-api.railway.app' : 'http://localhost:3001')
```

Y en Netlify, agregar variable de entorno:
- Key: `VITE_API_URL`
- Value: `https://guitaclara-api.railway.app`

---

## 📝 Pasos Detallados - Opción 1 (Recomendada)

### Paso 1: Deploy Backend en Railway

1. Ve a [railway.app](https://railway.app)
2. Login con GitHub
3. "New Project" > "Deploy from GitHub repo"
4. Selecciona `Ravettini/GuitaClara`
5. Railway detectará automáticamente el proyecto
6. En "Settings" > "Root Directory": cambia a `backend`
7. En "Variables", agrega:
   - `DATABASE_URL` (tu Supabase URL)
   - `JWT_SECRET` (genera uno)
   - `JWT_REFRESH_SECRET` (genera uno)
   - `PORT=3001`
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://tu-frontend.netlify.app`
8. Railway generará una URL automáticamente (ej: `guitaclara-api.railway.app`)
9. Copia esa URL

### Paso 2: Deploy Frontend en Netlify

1. Ve a [netlify.com](https://netlify.com)
2. Login con GitHub
3. "Add new site" > "Import an existing project"
4. Selecciona `Ravettini/GuitaClara`
5. Configuración:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. En "Site settings" > "Environment variables", agrega:
   - `VITE_API_URL` = `https://guitaclara-api.railway.app` (la URL de Railway)
7. Click "Deploy site"
8. ¡Listo!

---

## ✅ Verificación

1. Frontend debería cargar en `https://tu-app.netlify.app`
2. Backend debería responder en `https://guitaclara-api.railway.app`
3. El frontend debería poder hacer requests al backend

---

## 🔧 Si algo no funciona

1. **CORS:** Asegúrate de que `FRONTEND_URL` en Railway sea la URL de Netlify
2. **Variables de entorno:** Verifica que todas estén configuradas
3. **Database:** Verifica que `DATABASE_URL` sea correcta y tenga `?sslmode=require`

---

## 💡 Alternativa Rápida: Solo Frontend en Netlify

Si quieres probar rápido solo el frontend:

1. Deploy frontend en Netlify
2. Usa el backend localmente o en otro servicio
3. Cambia `VITE_API_URL` en Netlify a tu backend

Esto te permite probar el frontend mientras configuras el backend.

