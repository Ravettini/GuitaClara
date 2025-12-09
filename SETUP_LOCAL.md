# 🚀 Guía Rápida: Ejecutar en Local

Esta guía te permite probar la aplicación en tu máquina local usando PostgreSQL en Docker, **sin necesidad de configurar Supabase todavía**.

## 📋 Prerrequisitos

- Node.js 18+ instalado
- Docker y Docker Compose instalados
- npm o pnpm

## 🔧 Pasos para ejecutar en local

### 1. Instalar dependencias

Desde la raíz del proyecto:

```bash
npm run install:all
```

O manualmente:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Levantar PostgreSQL con Docker

```bash
docker-compose up -d
```

Esto levantará PostgreSQL en el puerto 5432 con:
- Usuario: `postgres`
- Contraseña: `postgres`
- Base de datos: `finanzas`

### 3. Configurar variables de entorno del backend

Crea el archivo `backend/.env` copiando el ejemplo:

```bash
# En Windows (PowerShell)
Copy-Item backend\.env.local.example backend\.env

# En Linux/Mac
cp backend/.env.local.example backend/.env
```

O crea manualmente `backend/.env` con este contenido:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finanzas"
JWT_SECRET="dev-secret-key-change-in-production"
JWT_REFRESH_SECRET="dev-refresh-secret-key-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

### 4. Configurar variables de entorno del frontend

Crea el archivo `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
```

### 5. Generar cliente Prisma y ejecutar migraciones

```bash
cd backend

# Generar cliente Prisma
npx prisma generate

# Crear y aplicar migraciones
npx prisma migrate dev --name init

# (Opcional) Ejecutar seeds para datos de ejemplo
npx prisma db seed
```

### 6. Ejecutar la aplicación

Desde la raíz del proyecto:

```bash
npm run dev
```

Esto levantará:
- **Backend** en `http://localhost:3001`
- **Frontend** en `http://localhost:5173`

O ejecuta por separado:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🎉 ¡Listo!

Abre tu navegador en `http://localhost:5173` y deberías ver la landing page.

### Usuario de prueba (si ejecutaste seeds)

- Email: `test@example.com`
- Contraseña: `password123`

## 🔍 Verificar que todo funciona

1. **Backend**: Visita `http://localhost:3001/health` - debería responder `{"status":"ok"}`
2. **Base de datos**: Verifica que PostgreSQL esté corriendo con `docker ps`
3. **Frontend**: Debería abrirse automáticamente en `http://localhost:5173`

## 🛑 Detener PostgreSQL

Cuando termines de probar:

```bash
docker-compose down
```

Para eliminar también los datos:

```bash
docker-compose down -v
```

## ❓ Problemas comunes

### Error: "Cannot connect to database"
- Verifica que Docker esté corriendo: `docker ps`
- Verifica que PostgreSQL esté levantado: `docker-compose ps`
- Revisa que el `DATABASE_URL` en `backend/.env` sea correcto

### Error: "Port 5432 already in use"
- Tienes otro PostgreSQL corriendo. Detén el contenedor: `docker-compose down`
- O cambia el puerto en `docker-compose.yml`

### Error: "Prisma Client not generated"
- Ejecuta: `cd backend && npx prisma generate`

### Error en el frontend: "Failed to fetch"
- Verifica que el backend esté corriendo en el puerto 3001
- Revisa que `VITE_API_URL` en `frontend/.env` sea correcto

## 📝 Notas

- Los datos se guardan en un volumen de Docker, así que persisten entre reinicios
- Para empezar de cero, ejecuta `docker-compose down -v` y vuelve a ejecutar las migraciones
- Cuando estés listo para usar Supabase, solo cambia el `DATABASE_URL` en `backend/.env`

