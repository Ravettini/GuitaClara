# Cómo Agregar los Índices de Moneda

## Problema
Prisma detectó un "drift" (la base de datos no está sincronizada con las migraciones) y hay un problema de conexión temporal.

## Solución: Agregar Índices Manualmente

### Opción 1: Usar el SQL Editor de Supabase (Recomendado)

1. Ve a tu proyecto en Supabase
2. Abre el **SQL Editor**
3. Copia y pega este SQL:

```sql
-- Índice para incomes por userId y currency
CREATE INDEX IF NOT EXISTS "incomes_userId_currency_idx" ON "incomes"("userId", "currency");

-- Índice para expenses por userId y currency
CREATE INDEX IF NOT EXISTS "expenses_userId_currency_idx" ON "expenses"("userId", "currency");
```

4. Ejecuta el script (botón "Run")

### Opción 2: Cuando la conexión funcione

Cuando la conexión a la base de datos funcione nuevamente, ejecuta:

```bash
cd backend
npx prisma db push
```

Esto sincronizará el schema sin borrar datos.

## Verificar que funcionó

Después de agregar los índices, puedes verificar con:

```sql
SELECT 
    tablename, 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename IN ('incomes', 'expenses') 
    AND indexname LIKE '%currency%'
ORDER BY tablename, indexname;
```

Deberías ver 2 índices:
- `incomes_userId_currency_idx`
- `expenses_userId_currency_idx`

## Nota Importante

**NO ejecutes `prisma migrate dev` con la opción de reset** - esto borraría todos tus datos.

Las optimizaciones en el código ya están aplicadas, así que aunque los índices no estén todavía, el código seguirá funcionando (solo será un poco más lento hasta que agregues los índices).

