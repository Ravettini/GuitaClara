# 💰 Finanzas App - Aplicación de Finanzas Personales

Aplicación web completa para el seguimiento de finanzas personales con dashboard de analíticas, gestión de ingresos, gastos e inversiones, diseñada para múltiples usuarios desde el inicio.

## 🚀 Características

- ✅ **Multiusuario**: Cada usuario solo ve sus propios datos
- 📊 **Dashboard de analíticas** con gráficos y KPIs
- 💵 **Gestión de ingresos y gastos** con categorías configurables
- 📈 **Seguimiento de inversiones**: Plazos fijos e instrumentos financieros (acciones, CEDEARs, bonos, etc.)
- 🔐 **Autenticación JWT** con refresh tokens
- 🎨 **Diseño responsive** con tema claro/oscuro
- 🌐 **Landing page pública** de bienvenida

## 🛠️ Stack Tecnológico

### Frontend
- React + TypeScript
- Vite
- React Router
- TanStack Query (React Query)
- Zustand (estado global)
- TailwindCSS
- Recharts (gráficos)

### Backend
- Node.js + TypeScript
- Express
- Prisma ORM
- PostgreSQL (Supabase)
- JWT (autenticación)
- Zod (validación)

## 📋 Prerrequisitos

- Node.js 18+ y npm/pnpm
- Cuenta en Supabase (para PostgreSQL)
- Docker (opcional, para desarrollo local)

## 🔧 Configuración

### Opción A: Desarrollo Local (Recomendado para empezar)

Para probar la aplicación en local sin Supabase, sigue la guía en [SETUP_LOCAL.md](./SETUP_LOCAL.md)

### Opción B: Con Supabase (Producción)

### 1. Clonar e instalar dependencias

```bash
npm run install:all
```

### 2. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve a Settings > Database y copia el connection string
3. El formato debería ser: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?sslmode=require`

### 3. Configurar variables de entorno

#### Backend

Crea `backend/.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?sslmode=require"

# JWT
JWT_SECRET="tu-secret-super-seguro-aqui"
JWT_REFRESH_SECRET="tu-refresh-secret-super-seguro-aqui"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL="http://localhost:5173"

# API de mercado (opcional, para precios de instrumentos)
MARKET_API_KEY="tu-api-key"
MARKET_API_URL="https://api.example.com"
```

#### Frontend

Crea `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
```

### 4. Configurar base de datos

```bash
cd backend

# Generar cliente Prisma
npx prisma generate

# Crear y aplicar migraciones
npx prisma migrate dev --name init

# (Opcional) Ejecutar seeds
npx prisma db seed
```

### 5. Ejecutar en desarrollo

```bash
# Desde la raíz del proyecto
npm run dev
```

Esto levantará:
- Backend en `http://localhost:3001`
- Frontend en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
finanzas/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── app.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── services/
│   │   └── main.tsx
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🐳 Docker (Opcional)

Para desarrollo local con PostgreSQL:

```bash
docker-compose up -d
```

Esto levantará un PostgreSQL local en el puerto 5432. Asegúrate de actualizar `DATABASE_URL` en `backend/.env` si usas esta opción.

## 📚 Scripts Disponibles

### Root
- `npm run dev` - Levanta backend y frontend en desarrollo
- `npm run build` - Build de producción para ambos
- `npm run install:all` - Instala dependencias en todos los workspaces

### Backend
- `npm run dev` - Desarrollo con hot reload
- `npm run build` - Compila TypeScript
- `npm run start` - Ejecuta producción
- `npm run prisma:generate` - Genera cliente Prisma
- `npm run prisma:migrate` - Aplica migraciones
- `npm run prisma:seed` - Ejecuta seeds

### Frontend
- `npm run dev` - Desarrollo con Vite
- `npm run build` - Build de producción
- `npm run preview` - Preview del build

## 🔐 Autenticación

La aplicación usa JWT con access tokens (15 min) y refresh tokens (7 días). Los tokens incluyen el `userId` para filtrar datos por usuario.

## 📊 Modelo de Datos

- **User**: Usuarios del sistema
- **Category**: Categorías de ingresos/gastos
- **Income**: Registros de ingresos
- **Expense**: Registros de gastos
- **FixedTermDeposit**: Plazos fijos
- **InvestmentInstrument**: Instrumentos financieros
- **InvestmentPosition**: Posiciones de inversión
- **InvestmentPriceSnapshot**: Histórico de precios

## 🧪 Testing

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## 🚢 Despliegue

### Backend
1. Configura variables de entorno en producción
2. Ejecuta migraciones: `npx prisma migrate deploy`
3. Build: `npm run build`
4. Inicia: `npm start`

### Frontend
1. Configura `VITE_API_URL` con la URL del backend en producción
2. Build: `npm run build`
3. Sirve los archivos de `dist/` con un servidor estático (Nginx, Vercel, Netlify, etc.)

## 📝 Notas

- Las migraciones de Prisma deben ejecutarse antes de levantar el backend en un entorno nuevo
- El `DATABASE_URL` debe incluir `?sslmode=require` para Supabase
- Los seeds crean un usuario de prueba: `test@example.com` / `password123`

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

MIT

