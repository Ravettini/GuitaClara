# Solución al Error de Build en Vercel

## Problema
Vercel está intentando construir el backend cuando debería solo generar Prisma y construir el frontend.

## Solución Aplicada

1. **vercel.json** ya tiene el build command correcto:
   ```json
   "buildCommand": "cd backend && npx prisma generate && cd ../frontend && npm install && npm run build"
   ```

2. **backend/package.json** - El script `build` ahora solo muestra un mensaje (no construye TypeScript)

## Si el error persiste

En la configuración de Vercel, asegúrate de que:

1. **Build Command** esté configurado manualmente como:
   ```
   cd backend && npx prisma generate && cd ../frontend && npm install && npm run build
   ```

2. **Output Directory**: `frontend/dist`

3. **Install Command**: `npm install`

4. **Framework Preset**: Vite (o auto-detect)

## Alternativa: Usar vercel-build script

Si prefieres usar el script del package.json, en Vercel configura:

- **Build Command**: `npm run vercel-build`

Pero asegúrate de que el script esté en el package.json del root (ya está).

