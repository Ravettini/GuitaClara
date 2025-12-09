-- Script SQL para agregar índices de moneda manualmente
-- Ejecutar este script en el SQL Editor de Supabase

-- Índice para incomes por userId y currency
CREATE INDEX IF NOT EXISTS "incomes_userId_currency_idx" ON "incomes"("userId", "currency");

-- Índice para expenses por userId y currency
CREATE INDEX IF NOT EXISTS "expenses_userId_currency_idx" ON "expenses"("userId", "currency");

-- Verificar que los índices se crearon correctamente
SELECT 
    tablename, 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename IN ('incomes', 'expenses') 
    AND indexname LIKE '%currency%'
ORDER BY tablename, indexname;

