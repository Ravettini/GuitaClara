# 🚂 Deploy del Backend en Railway

Este documento explica cómo desplegar el backend de GuitaClara en Railway.

## 📋 Prerrequisitos

- Cuenta en [Railway](https://railway.app)
- Repositorio en GitHub con el código del backend
- Base de datos PostgreSQL (Supabase recomendado)

## 🚀 Pasos para Deploy

### 1. Preparar el Repositorio

**Opción A: Repo separado (Recomendado)**

```bash
cd backend
git init
git add .
git commit -m "Backend listo para Railway"
git branch -M main
git remote add origin <URL_DEL_REPO_NUEVO_EN_GITHUB>
git push -u origin main
```

**Opción B: Usar el repo actual (monorepo)**

Railway puede trabajar con monorepos configurando el Root Directory.

### 2. Crear Proyecto en Railway

1. Ve a [railway.app](https://railway.app) y haz login con GitHub
2. Click en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"**
4. Elige tu repositorio:
   - Si es repo separado: selecciona el repo del backend
   - Si es monorepo: selecciona el repo completo

### 3. Configurar el Servicio

#### Si es Repo Separado:
- Railway detectará automáticamente que es Node.js
- No necesitas configurar Root Directory

#### Si es Monorepo:
1. En **Settings** → **Root Directory**: escribe `backend`
2. Railway buscará el `package.json` en `/backend`

### 4. Configurar Build y Start Commands

En Railway → Settings → Deploy:

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

**Nota:** Railway automáticamente ejecuta `npm install` antes del build, pero es bueno ser explícito.

### 5. Variables de Entorno

En Railway → Variables, agrega las siguientes:

#### Obligatorias:

```
NODE_ENV=production
PORT=3001
```

**Nota:** Railway configura `PORT` automáticamente, pero puedes dejarlo por si acaso.

```
FRONTEND_URL=https://tu-frontend.vercel.app
```
Reemplaza con la URL real de tu frontend en Vercel.

```
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```
Tu connection string de Supabase o PostgreSQL.

```
JWT_SECRET=tu-secret-super-seguro-aqui
JWT_REFRESH_SECRET=tu-refresh-secret-super-seguro-aqui
```
Genera valores aleatorios seguros (puedes usar `openssl rand -base64 32`).

#### Opcionales:

```
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### 6. Base de Datos

Si usas Supabase:
1. Ya deberías tener la `DATABASE_URL` de Supabase
2. Asegúrate de que tenga `?sslmode=require` al final
3. Ejecuta las migraciones si es necesario:
   - Railway puede ejecutar `npm run prisma:deploy` en el build
   - O ejecuta manualmente: `npx prisma migrate deploy`

### 7. Deploy

1. Railway detectará automáticamente los cambios y hará deploy
2. O puedes hacer click en **"Deploy"** manualmente
3. Espera a que termine el build
4. Railway generará una URL automáticamente (ej: `tu-backend.railway.app`)

### 8. Verificar

1. Abre la URL de Railway en el navegador
2. Deberías ver: `{"status":"ok","timestamp":"..."}` en `/health`
3. Prueba desde el frontend que las llamadas funcionen

## 🔧 Configuración Técnica

### Puerto

El servidor **siempre** escucha en `process.env.PORT` (Railway lo configura automáticamente).

```typescript
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

### CORS

El backend está configurado para:
- **Producción**: Solo acepta requests del `FRONTEND_URL` configurado
- **Desarrollo**: Acepta cualquier origen (incluyendo `localhost:5173`)

### Build Process

1. `npm install` - Instala dependencias
2. `npm run build` - Compila TypeScript a JavaScript
3. `npm run prisma:generate` - Genera Prisma Client
4. `npm start` - Ejecuta `node dist/index.js`

## 📝 Comandos Locales para Verificar

Antes de deployar, verifica localmente:

```bash
cd backend

# Instalar dependencias
npm install

# Compilar TypeScript
npm run build

# Verificar que dist/index.js existe
ls dist/

# Ejecutar (necesitas .env configurado)
npm start
```

El servidor debería iniciar en el puerto configurado (por defecto 3001).

## 🐛 Troubleshooting

### Error: "Cannot find module"
- Verifica que `npm run build` se ejecutó correctamente
- Asegúrate de que `dist/index.js` existe

### Error: "Port already in use"
- Railway maneja el puerto automáticamente
- No necesitas configurar PORT manualmente en Railway

### Error de CORS
- Verifica que `FRONTEND_URL` en Railway sea exactamente la URL de Vercel
- Incluye `https://` y no dejes trailing slash

### Error de Prisma
- Asegúrate de que `DATABASE_URL` esté correctamente configurada
- Verifica que Prisma Client se genere: `npm run prisma:generate`

## ✅ Checklist Pre-Deploy

- [ ] `package.json` tiene `"build"` y `"start"` scripts
- [ ] `dist/index.js` se genera correctamente con `npm run build`
- [ ] Variables de entorno configuradas en Railway
- [ ] `FRONTEND_URL` apunta a tu frontend en Vercel
- [ ] `DATABASE_URL` está configurada y funciona
- [ ] JWT secrets están configurados
- [ ] Health check responde en `/health`

## 🔗 URLs Importantes

- **Railway Dashboard**: https://railway.app/dashboard
- **Documentación Railway**: https://docs.railway.app
- **Supabase Dashboard**: https://supabase.com/dashboard

