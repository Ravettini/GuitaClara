# Solución Rápida - Crear Tablas en Supabase

Si `prisma migrate dev` está tardando mucho, usa este método más rápido:

## Paso 1: Cancelar el comando actual
Presiona `Ctrl + C` en la terminal donde está ejecutándose

## Paso 2: Usar db push (más rápido)
```powershell
cd backend
npx prisma db push
```

Este comando crea las tablas directamente sin archivos de migración.

## Paso 3: Crear datos de ejemplo
```powershell
npx prisma db seed
```

Esto creará:
- Usuario de prueba: test@example.com / password123
- Categorías de ejemplo
- Algunos ingresos y gastos
- Un plazo fijo
- Una inversión

## Paso 4: Verificar en Supabase
Ve al dashboard de Supabase → Table Editor
Deberías ver todas las tablas creadas.

## Paso 5: Ejecutar la aplicación
```powershell
cd ..
npm run dev
```


