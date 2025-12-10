# Deploy del Backend en Railway

## ✅ Cambios Realizados

### 1. `backend/package.json`
- **`"start"`**: Ahora solo ejecuta `node dist/index.js` (sin intentar hacer build)
- **`"build"`**: Compila TypeScript y genera Prisma Client (`tsc && npm run prisma:generate`)

### 2. `backend/Dockerfile`
- Ejecuta `npm run build` después de instalar dependencias
- Usa `CMD ["npm", "start"]` en lugar de `npm run dev`
- El build genera `dist/index.js` antes de iniciar el servidor

### 3. `backend/src/index.ts`
- ✅ Ya usa `process.env.PORT || 3001` (correcto para Railway)
- ✅ CORS configurado: `guitaclara.vercel.app` está incluido por defecto en producción
- ✅ Soporte para múltiples URLs en `FRONTEND_URL` (separadas por coma)
- ✅ Normalización automática de URLs (agrega `https://` si falta)

## 🚀 Configuración en Railway

### Opción A: Usando Dockerfile (Recomendado)

Railway detectará automáticamente el `Dockerfile` en `/backend`:

1. **Root Directory**: `/backend` (o `backend`)
2. **Build Command**: (No necesario, el Dockerfile lo maneja)
3. **Start Command**: (No necesario, el Dockerfile lo maneja)
4. **Port**: Railway lo asigna automáticamente a `process.env.PORT`

### Opción B: Sin Dockerfile (Nixpacks)

Si prefieres que Railway use Nixpacks (detección automática de Node.js):

1. **Root Directory**: `/backend` (o `backend`)
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm start`
4. **Port**: Railway lo asigna automáticamente

## 📋 Variables de Entorno en Railway

Configura estas variables en Railway → Settings → Variables:

```env
# Base de datos
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# JWT
JWT_SECRET=tu-jwt-secret-super-seguro-aqui
JWT_REFRESH_SECRET=tu-refresh-secret-super-seguro-aqui
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Frontend (para CORS) - OPCIONAL
# guitaclara.vercel.app ya está incluido por defecto en producción
# Usa FRONTEND_URL solo si necesitas agregar URLs adicionales (separadas por coma)
FRONTEND_URL=https://otra-url.com,https://otra-url-2.com

# Entorno
NODE_ENV=production
```

**Notas**:
- `PORT` no es necesario configurarlo manualmente, Railway lo asigna automáticamente.
- `guitaclara.vercel.app` ya está permitido por defecto en producción (no necesitas configurarlo).
- `FRONTEND_URL` es opcional y solo necesario si quieres agregar URLs adicionales.

## ✅ Verificación Local

Antes de hacer deploy, verifica localmente:

```bash
cd backend
npm install
npm run build
npm start
```

Deberías ver:
```
🚀 Server running on http://localhost:3001
```

Y el archivo `dist/index.js` debe existir después del build.

## 🔍 Troubleshooting

### Error: "Cannot find module '/app/dist/index.js'"
- **Causa**: El build no se ejecutó correctamente
- **Solución**: Verifica que el Dockerfile ejecute `npm run build` o que Railway tenga el Build Command configurado

### Error: "Prisma Client not generated"
- **Causa**: `prisma generate` no se ejecutó
- **Solución**: El script `build` ya incluye `npm run prisma:generate`, verifica que se ejecute

### Error de CORS en producción
- **Causa**: El origin no está en la lista de permitidos
- **Solución**: 
  - `guitaclara.vercel.app` ya está incluido por defecto en producción
  - Si necesitas agregar más URLs, configura `FRONTEND_URL` en Railway (puedes usar múltiples URLs separadas por coma)
  - Revisa los logs del servidor para ver qué origin está siendo bloqueado
