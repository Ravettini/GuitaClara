# Resetear Contraseña de Usuario

Si olvidaste tu contraseña o necesitas resetearla, puedes usar este script:

## Opción 1: Resetear contraseña de un usuario existente

```powershell
cd backend
npx tsx reset-password.ts tu@email.com nuevaPassword123
```

## Opción 2: Resetear contraseña del usuario de prueba

```powershell
cd backend
npx tsx reset-password.ts test@example.com password123
```

## Opción 3: Crear un nuevo usuario desde cero

Si prefieres crear una cuenta nueva con otro email:

1. Ve a http://localhost:5173/register
2. Usa un email diferente al que ya existe
3. Crea la cuenta nueva

## Verificar usuarios en Supabase

También puedes ver los usuarios directamente en Supabase:
1. Ve al dashboard de Supabase
2. Table Editor → `users`
3. Verás todos los usuarios registrados


