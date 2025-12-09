# 🌱 Instrucciones para Cargar Datos de Demo

Este script de seed crea un ecosistema completo de datos simulados para presentar la aplicación con información realista.

## 📊 Datos que se crearán

### Usuario
- **Email:** `demo@finanzas.com`
- **Contraseña:** `password123`

### Categorías
- **Ingresos:** Sueldo, Freelance, Alquiler
- **Gastos:** Comida, Transporte, Servicios, Entretenimiento, Salud, Ropa, Educación

### Transacciones (últimos 6 meses)
- **Ingresos:** 
  - Sueldo mensual de $350.000 ARS
  - Proyectos freelance ocasionales
  - Algunos ingresos en USD
  
- **Gastos:**
  - ~150+ gastos distribuidos en 6 meses
  - Patrones realistas de frecuencia (comida cada 15 días, transporte diario, etc.)
  - Algunos gastos en USD (suscripciones)

### Presupuestos
- 7 presupuestos mensuales configurados
- Con opción de repetición automática

### Metas Financieras
- Fondo de emergencia: $1.000.000 ARS
- Viaje a Europa: $5.000 USD
- Notebook nueva: $1.500 USD

### Plazos Fijos
- 3 plazos fijos con diferentes bancos y términos
- Algunos con auto-renovación

### Inversiones
- 4 instrumentos: AAPL, GGAL, AL30, AAPLD
- Posiciones de inversión con diferentes brokers
- Historial de precios (snapshots)

## 🚀 Cómo ejecutar

### 1. Asegúrate de tener las migraciones aplicadas

```bash
cd backend
npx prisma db push
# O
npx prisma migrate dev
```

### 2. Ejecuta el seed

```bash
cd backend
npm run prisma:seed
# O directamente:
npx tsx prisma/seed.ts
```

### 3. Verifica los datos

Inicia sesión con:
- Email: `demo@finanzas.com`
- Contraseña: `password123`

## ⚠️ Nota importante

El script **elimina todos los datos existentes** antes de crear los nuevos. Si ya tienes datos importantes, haz un backup primero o comenta la sección de limpieza en el archivo `seed.ts`.

## 📈 Estadísticas esperadas

Después de ejecutar el seed, deberías ver:
- ~18 ingresos
- ~150+ gastos
- 7 presupuestos
- 3 metas
- 3 plazos fijos
- 4 instrumentos de inversión
- 4 posiciones
- 20 snapshots de precios

## 🔄 Para resetear y volver a cargar

Simplemente ejecuta el seed nuevamente. Limpiará todo y creará datos frescos.

