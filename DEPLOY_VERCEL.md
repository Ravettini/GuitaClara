# Guía de Despliegue en Vercel (Todo en un solo servicio)

## 🎯 Ventajas

- ✅ Todo en un solo servicio (frontend + backend)
- ✅ Sin necesidad de configurar CORS entre servicios
- ✅ Despliegue simplificado
- ✅ Costos más bajos (solo un servicio)

## 📋 Requisitos Previos

1. **Base de datos**: Asegúrate de que tu base de datos Supabase esté configurada
2. **Cuenta de Vercel**: Crea una cuenta en [vercel.com](https://vercel.com)
3. **Repositorio en GitHub**: Tu código debe estar en GitHub

## 🚀 Pasos para Desplegar

### Opción 1: Desde GitHub (Recomendado)

1. **Conecta tu repositorio a Vercel**:
   - Ve a [vercel.com](https://vercel.com)
   - Haz clic en "Add New Project"
   - Conecta tu repositorio de GitHub: `Ravettini/GuitaClara`
   - Vercel detectará automáticamente la configuración

2. **Configura el proyecto**:
   - **Framework Preset**: Vite (o déjalo en auto-detect)
   - **Root Directory**: `.` (raíz del proyecto)
   - **Build Command**: `npm run build:vercel`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install`

3. **Configura las variables de entorno**:
   En la configuración del proyecto, ve a "Environment Variables" y agrega:
   
   ```
   DATABASE_URL=tu-connection-string-de-supabase
   JWT_SECRET=un-secreto-aleatorio-muy-largo-y-seguro
   JWT_REFRESH_SECRET=otro-secreto-aleatorio-diferente
   NODE_ENV=production
   ```
   
   **Importante**: 
   - `DATABASE_URL` debe incluir `?sslmode=require` al final
   - `JWT_SECRET` y `JWT_REFRESH_SECRET` deben ser strings largos y aleatorios
   - Puedes generar secretos con: `openssl rand -base64 32`

4. **Despliega**:
   - Haz clic en "Deploy"
   - Vercel construirá y desplegará tu aplicación automáticamente
   - El proceso puede tardar unos minutos la primera vez

### Opción 2: Desde la CLI

1. **Instala Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Inicia sesión**:
   ```bash
   vercel login
   ```

3. **Navega al directorio raíz del proyecto**:
   ```bash
   cd C:\Users\ignac\Desktop\finanzas
   ```

4. **Despliega**:
   ```bash
   vercel
   ```

5. **Configura las variables de entorno**:
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   vercel env add JWT_REFRESH_SECRET
   vercel env add NODE_ENV
   ```

6. **Despliega en producción**:
   ```bash
   vercel --prod
   ```

## 📝 Variables de Entorno Necesarias

### Requeridas

- `DATABASE_URL`: String de conexión de Supabase (con `?sslmode=require`)
- `JWT_SECRET`: Secreto para firmar tokens JWT (mínimo 32 caracteres)
- `JWT_REFRESH_SECRET`: Secreto para refresh tokens (mínimo 32 caracteres)
- `NODE_ENV`: `production`

### Opcionales

- `FRONTEND_URL`: URL del frontend (Vercel lo detecta automáticamente)
- `PORT`: No es necesario en Vercel (se maneja automáticamente)

## 🔧 Estructura del Proyecto

```
finanzas/
├── api/
│   └── index.ts          # Serverless function handler (backend)
├── backend/
│   └── src/              # Código del backend (reutilizado)
├── frontend/
│   └── dist/             # Build del frontend
└── vercel.json           # Configuración de Vercel
```

## ✅ Verificación Post-Despliegue

1. **Verifica que el frontend carga**:
   - Visita tu URL de Vercel (ej: `https://guitaclara.vercel.app`)
   - Deberías ver la landing page

2. **Prueba el backend**:
   - Visita `https://tu-app.vercel.app/api/health`
   - Deberías ver: `{"status":"ok","timestamp":"..."}`

3. **Prueba el registro**:
   - Intenta crear una cuenta nueva
   - Verifica que funcione correctamente

4. **Revisa los logs**:
   - En el dashboard de Vercel, ve a "Functions" → "Logs"
   - Revisa si hay errores

## 🐛 Solución de Problemas

### Error: "Prisma Client not generated"
**Solución**: Asegúrate de que el script `postinstall` esté ejecutándose. Puedes forzarlo agregando en `package.json`:
```json
"vercel-build": "cd backend && npx prisma generate && cd ../frontend && npm run build"
```

### Error: "Cannot find module"
**Solución**: Verifica que todas las dependencias estén en `package.json` del root. Si usas workspaces, Vercel necesita acceso a todas las dependencias.

### Error: CORS
**Solución**: El código ya está configurado para permitir cualquier origen de Vercel. Si persiste, verifica que `FRONTEND_URL` esté configurada correctamente.

### Error: Database connection
**Solución**: 
- Verifica que `DATABASE_URL` tenga `?sslmode=require` al final
- Asegúrate de que la IP de Vercel esté permitida en Supabase (si aplica)
- Revisa que la conexión de Supabase sea pública

## 📚 Recursos

- [Documentación de Vercel](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Prisma en Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

## 💡 Notas Importantes

1. **Cold Starts**: Las serverless functions pueden tener un "cold start" la primera vez que se invocan. Esto es normal y no afecta el funcionamiento.

2. **Límites de Vercel**:
   - Plan Hobby: 100GB bandwidth, funciones ilimitadas
   - Las funciones tienen un timeout de 10 segundos (Hobby) o 60 segundos (Pro)

3. **Prisma**: Asegúrate de que `prisma generate` se ejecute durante el build. El script `postinstall` se encarga de esto.

4. **Variables de Entorno**: Las variables de entorno se pueden configurar por ambiente (Production, Preview, Development).
