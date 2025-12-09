# Pasos después de configurar Supabase

## 1. Verificar que DATABASE_URL esté correcto

El archivo `backend/.env` debe tener algo como:

```
DATABASE_URL="postgresql://postgres:[TU_PASSWORD]@db.xxxxx.supabase.co:5432/postgres?sslmode=require"
```

## 2. Ejecutar migraciones

Desde el directorio `backend`:

```powershell
cd backend
npx prisma migrate dev --name init
```

Esto creará todas las tablas en Supabase.

## 3. (Opcional) Ejecutar seeds

Para crear datos de ejemplo y un usuario de prueba:

```powershell
npx prisma db seed
```

Usuario de prueba:
- Email: `test@example.com`
- Contraseña: `password123`

## 4. Ejecutar la aplicación

Desde la raíz del proyecto:

```powershell
npm run dev
```

O por separado:

```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## 5. Acceder a la aplicación

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Verificar que funciona

1. Visita http://localhost:3001/health - debería responder `{"status":"ok"}`
2. Abre http://localhost:5173 - deberías ver la landing page
3. Haz clic en "Registrarse" o usa el usuario de prueba si ejecutaste seeds

