# 📋 Descripción Completa de la Webapp de Finanzas Personales

## 🎯 Visión General

Aplicación web completa de **finanzas personales multiusuario** diseñada para ayudar a usuarios a gestionar sus ingresos, gastos e inversiones. La aplicación está construida como un **monorepo** con separación clara entre frontend y backend, utilizando tecnologías modernas y mejores prácticas.

**Objetivo principal**: Proporcionar una herramienta intuitiva y completa para el seguimiento financiero personal con capacidades de análisis, gestión de inversiones y soporte multi-moneda (ARS/USD).

---

## 🏗️ Arquitectura y Stack Tecnológico

### **Arquitectura General**
- **Tipo**: Monorepo con workspaces (pnpm/npm)
- **Patrón**: Separación frontend/backend
- **Base de datos**: PostgreSQL (Supabase en producción, Docker local en desarrollo)
- **Autenticación**: JWT con access tokens (15 min) y refresh tokens (7 días)
- **Multi-tenancy**: Simple, basado en `userId` en todas las tablas

### **Frontend Stack**

#### **Core**
- **React 18.2.0** con TypeScript
- **Vite 5.0.8** como build tool (desarrollo rápido)
- **React Router 6.21.1** para navegación

#### **Estado y Datos**
- **TanStack Query (React Query) 5.14.2** para:
  - Fetching de datos
  - Caché inteligente (5 minutos staleTime, 10 minutos gcTime)
  - Optimistic updates
  - Invalidación automática de queries
- **Zustand 4.4.7** para estado global de autenticación
  - Persistencia en localStorage
  - Manejo de tokens (access + refresh)

#### **UI/Estilos**
- **TailwindCSS 3.3.6** para estilos
  - Sistema de diseño utility-first
  - Tema claro/oscuro nativo
  - Responsive design (mobile-first)
- **Recharts 2.10.3** para visualizaciones:
  - Gráficos de barras
  - Gráficos de líneas
  - Gráficos de pie (torta)
  - Responsive containers

#### **Utilidades**
- **Axios 1.13.2** para HTTP requests
- **XLSX 0.18.5** para exportación de datos (CSV/XLSX)

### **Backend Stack**

#### **Core**
- **Node.js** con **TypeScript 5.9.3**
- **Express 4.22.1** como framework web
- **tsx 4.7.0** para ejecución en desarrollo

#### **Base de Datos**
- **Prisma 5.22.0** como ORM
  - Type-safe database client
  - Migraciones automáticas
  - Seeds para datos iniciales
- **PostgreSQL** (Supabase)
  - UUIDs como primary keys
  - Decimal para valores monetarios
  - Índices optimizados para consultas

#### **Seguridad y Validación**
- **JWT (jsonwebtoken 9.0.3)** para autenticación
- **bcrypt 5.1.1** para hash de contraseñas
- **Zod 3.25.76** para validación de schemas
- **CORS 2.8.5** configurado

#### **Servicios Externos**
- **Axios 1.13.2** para APIs externas:
  - DolarAPI.com (cotización dólar oficial)
  - Bluelytics (fallback para cotización)
  - Yahoo Finance (precios de instrumentos)
  - Alpha Vantage (opcional, para precios)

---

## 📁 Estructura del Proyecto

```
finanzas/
├── backend/
│   ├── src/
│   │   ├── controllers/          # Controladores Express (lógica HTTP)
│   │   │   ├── analyticsController.ts
│   │   │   ├── authController.ts
│   │   │   ├── categoryController.ts
│   │   │   ├── expenseController.ts
│   │   │   ├── fixedTermDepositController.ts
│   │   │   ├── incomeController.ts
│   │   │   └── investmentController.ts
│   │   ├── services/              # Lógica de negocio
│   │   │   ├── analyticsService.ts      # Cálculos de dashboard
│   │   │   ├── authService.ts           # Registro, login, JWT
│   │   │   ├── categoryService.ts
│   │   │   ├── exchangeRateService.ts   # API de cotización dólar
│   │   │   ├── expenseService.ts
│   │   │   ├── fixedTermDepositService.ts
│   │   │   ├── incomeService.ts
│   │   │   ├── investmentService.ts     # Portfolio, posiciones
│   │   │   └── marketApiService.ts      # Yahoo Finance, Alpha Vantage
│   │   ├── middleware/
│   │   │   ├── auth.ts                  # Verificación JWT
│   │   │   ├── errorHandler.ts          # Manejo global de errores
│   │   │   └── validation.ts            # Validación Zod
│   │   ├── routes/                 # Definición de rutas
│   │   │   ├── analytics.ts
│   │   │   ├── auth.ts
│   │   │   ├── categories.ts
│   │   │   ├── expenses.ts
│   │   │   ├── fixedTermDeposits.ts
│   │   │   ├── incomes.ts
│   │   │   └── investments.ts
│   │   ├── utils/
│   │   │   └── jwt.ts                   # Generación/verificación tokens
│   │   └── index.ts                # Entry point Express
│   ├── prisma/
│   │   ├── schema.prisma           # Schema de base de datos
│   │   └── seed.ts                 # Datos iniciales
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── DateInput.tsx       # Input de fecha personalizado (DD/MM/YYYY)
│   │   ├── layouts/
│   │   │   └── AppLayout.tsx       # Layout con sidebar y header
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx       # Dashboard principal con KPIs y gráficos
│   │   │   ├── Expenses.tsx        # CRUD de gastos
│   │   │   ├── Incomes.tsx         # CRUD de ingresos
│   │   │   ├── Investments.tsx     # Plazos fijos y portfolio
│   │   │   ├── LandingPage.tsx     # Página pública de bienvenida
│   │   │   ├── Login.tsx           # Formulario de login
│   │   │   ├── Register.tsx        # Formulario de registro
│   │   │   └── Settings.tsx        # Gestión de categorías
│   │   ├── services/
│   │   │   └── api.ts              # Cliente Axios con interceptors
│   │   ├── store/
│   │   │   └── authStore.ts       # Zustand store para auth
│   │   ├── utils/
│   │   │   ├── export.ts          # Funciones de exportación CSV/XLSX
│   │   │   └── format.ts          # Formateo de fechas y monedas
│   │   ├── App.tsx                # Router principal
│   │   ├── main.tsx              # Entry point React
│   │   └── index.css             # Tailwind imports
│   └── package.json
│
└── package.json                  # Root workspace config
```

---

## 🗄️ Modelo de Datos (Prisma Schema)

### **Entidades Principales**

#### **User**
- `id`: UUID (primary key)
- `email`: String único
- `passwordHash`: String (bcrypt)
- `createdAt`, `updatedAt`: Timestamps
- **Relaciones**: Todas las demás entidades tienen `userId`

#### **Category**
- `id`: UUID
- `userId`: UUID (foreign key)
- `name`: String
- `type`: Enum (EXPENSE, INCOME, BOTH)
- `color`: String opcional (hex)
- `icon`: String opcional
- **Índices**: `[userId, type]`

#### **Income**
- `id`: UUID
- `userId`: UUID
- `categoryId`: UUID opcional (nullable)
- `amount`: Decimal(18, 2)
- `currency`: String (default: "ARS")
- `date`: DateTime
- `description`: String opcional
- `sourceType`: String opcional (ej: "Salario", "Freelance")
- **Índices**: `[userId, date]`, `[userId, categoryId]`, `[userId, currency]`

#### **Expense**
- `id`: UUID
- `userId`: UUID
- `categoryId`: UUID (required)
- `amount`: Decimal(18, 2)
- `currency`: String (default: "ARS")
- `date`: DateTime
- `description`: String opcional
- `paymentMethod`: String opcional (efectivo, tarjeta, transferencia)
- `tags`: JSON opcional
- **Índices**: `[userId, date]`, `[userId, categoryId]`, `[userId, currency]`

#### **FixedTermDeposit**
- `id`: UUID
- `userId`: UUID
- `principalAmount`: Decimal(18, 2)
- `currency`: String (default: "ARS")
- `tna`: Decimal(8, 4) - Tasa Nominal Anual
- `startDate`: DateTime
- `termInDays`: Int
- `bankName`: String opcional
- `autoRenew`: Boolean (default: false)
- `computedMaturityDate`: DateTime (calculado)
- `computedInterestAmount`: Decimal(18, 2) (calculado)
- **Índices**: `[userId, startDate]`

#### **InvestmentInstrument**
- `id`: UUID
- `userId`: UUID
- `ticker`: String (ej: "AAPL", "GGAL")
- `name`: String
- `type`: Enum (STOCK, CEDEAR, BOND, LECAP, ETF, OTHER)
- `market`: String (ej: "NYSE", "BCBA")
- `currency`: String
- **Unique**: `[userId, ticker]`
- **Índices**: `[userId, ticker]`

#### **InvestmentPosition**
- `id`: UUID
- `userId`: UUID
- `instrumentId`: UUID
- `quantity`: Decimal(18, 4)
- `averageBuyPrice`: Decimal(18, 4)
- `accountName`: String opcional
- `brokerName`: String opcional
- **Índices**: `[userId, instrumentId]`

#### **InvestmentPriceSnapshot**
- `id`: UUID
- `instrumentId`: UUID
- `price`: Decimal(18, 4)
- `currency`: String
- `at`: DateTime
- **Índices**: `[instrumentId, at]`

---

## 🎨 Diseño Actual (UI/UX)

### **Sistema de Diseño**

#### **Colores y Temas**
- **Tema claro/oscuro**: Implementado con TailwindCSS `dark:` variants
- **Colores principales**:
  - Verde: Ingresos, valores positivos
  - Rojo: Gastos, valores negativos
  - Azul: Dashboard, acciones principales
  - Púrpura: Inversiones
  - Índigo: Configuración

#### **Componentes UI**
- **Layout**: Sidebar colapsable en mobile, fijo en desktop
- **Formularios**: Inputs con bordes redondeados, labels claros
- **Tablas**: Responsive, con hover effects
- **Botones**: Estados disabled, loading, hover
- **Gráficos**: Responsive containers de Recharts

#### **Tipografía**
- Sistema por defecto de TailwindCSS
- Títulos: `text-3xl font-bold`
- Subtítulos: `text-xl font-semibold`
- Cuerpo: `text-sm` o `text-base`

#### **Espaciado**
- Sistema consistente de TailwindCSS
- Padding: `p-4`, `p-6`
- Gaps: `gap-4`, `gap-6`
- Margins: `mb-4`, `mt-6`

### **Páginas y Flujos**

#### **1. Landing Page (`/`)**
- **Hero section**: Título, descripción, CTAs (Login/Register)
- **Features section**: 3 cards con características principales
- **How it works**: Sección explicativa
- **Footer**: Links y copyright
- **Diseño**: Centrado, espaciado generoso, fondo claro/oscuro

#### **2. Login (`/login`)**
- Formulario simple: Email + Password
- Link a registro
- Manejo de errores con mensajes claros
- Validación en frontend

#### **3. Register (`/register`)**
- Formulario: Email + Password + Confirm Password
- Validación de contraseña (mínimo 6 caracteres)
- Link a login
- Manejo de errores

#### **4. Dashboard (`/app/dashboard`)**
- **Header**: Título + controles (botón Pesos/Dólares + selector de rango de fechas)
- **KPIs Grid** (4 columnas en desktop, responsive):
  - Total Ingresos (verde)
  - Total Gastos (rojo)
  - Balance (verde/rojo según signo)
  - Valor Portfolio (azul)
  - Plazos Fijos (púrpura)
  - Patrimonio Neto (índigo)
- **Gráficos**:
  - Pie chart: Gastos por categoría
  - Line chart: Ingresos vs Gastos (por día)
  - Bar chart: Flujo de caja (por mes)
- **Estados**: Loading, error, empty state

#### **5. Ingresos (`/app/incomes`)**
- **Header**: Título + botones (Exportar CSV/XLSX + Nuevo Ingreso)
- **Formulario** (modal/expandible):
  - Monto (number)
  - Fecha (DateInput DD/MM/YYYY)
  - Categoría (select)
  - Moneda (ARS/USD)
  - Descripción (text)
  - Tipo de ingreso (text)
- **Tabla**:
  - Columnas: Fecha, Categoría, Monto, Moneda, Descripción, Tipo, Acciones
  - Acciones: Editar, Eliminar
  - Orden: Más recientes primero
- **Optimistic updates**: Cambios inmediatos en UI

#### **6. Gastos (`/app/expenses`)**
- **Estructura similar a Ingresos**
- **Diferencias**:
  - Método de pago (select: efectivo, tarjeta, transferencia)
  - Categoría requerida (no opcional)
  - Tags (JSON, no implementado en UI aún)

#### **7. Inversiones (`/app/investments`)**
- **Tabs**: Plazos Fijos | Portfolio
- **Tab: Plazos Fijos**:
  - Formulario: Monto, Moneda, TNA, Fecha inicio, Plazo (días), Banco, Auto-renovación
  - Tabla: Monto, Moneda, TNA, Fecha inicio, Vencimiento, Interés, Valor total, Acciones
  - Cálculos automáticos: Fecha vencimiento, Interés
- **Tab: Portfolio**:
  - Formulario de posición: Instrumento (select o crear nuevo), Cantidad, Precio promedio, Cuenta, Broker
  - Formulario de instrumento: Ticker, Nombre, Tipo, Mercado, Moneda
  - Tabla: Instrumento, Tipo, Cantidad, Precio promedio, Último precio, Valor actual, P&L, P&L %, Acciones
  - **Características especiales**:
    - Precios desde Yahoo Finance (automático)
    - P&L calculado en tiempo real
    - Indicadores visuales (↑ verde, ↓ rojo)
    - Explicaciones para principiantes

#### **8. Configuración (`/app/settings`)**
- **Gestión de Categorías**:
  - Formulario: Nombre, Tipo (EXPENSE/INCOME/BOTH), Color (input color), Icono (text)
  - Lista: Cards o tabla con categorías
  - Acciones: Editar, Eliminar
  - Validación: No eliminar categorías con gastos asociados

#### **9. Layout (`AppLayout`)**
- **Sidebar** (desktop):
  - Logo/título
  - Navegación: Dashboard, Ingresos, Gastos, Inversiones, Configuración
  - Usuario actual (email)
  - Botón logout
- **Header** (mobile):
  - Menú hamburguesa
  - Título de página actual
  - Usuario
- **Responsive**: Sidebar colapsable en mobile

---

## 🔌 APIs y Endpoints

### **Autenticación (`/auth`)**
- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Login (retorna access + refresh tokens)
- `POST /auth/refresh` - Renovar access token
- `GET /auth/me` - Obtener usuario actual

### **Categorías (`/categories`)**
- `GET /categories?type=EXPENSE` - Listar categorías (filtro opcional)
- `GET /categories/:id` - Obtener categoría
- `POST /categories` - Crear categoría
- `PUT /categories/:id` - Actualizar categoría
- `DELETE /categories/:id` - Eliminar categoría

### **Ingresos (`/incomes`)**
- `GET /incomes` - Listar ingresos (filtros opcionales: startDate, endDate, categoryId, minAmount, maxAmount)
- `GET /incomes/:id` - Obtener ingreso
- `POST /incomes` - Crear ingreso
- `PUT /incomes/:id` - Actualizar ingreso
- `DELETE /incomes/:id` - Eliminar ingreso

### **Gastos (`/expenses`)**
- `GET /expenses` - Listar gastos (filtros similares a ingresos)
- `GET /expenses/:id` - Obtener gasto
- `POST /expenses` - Crear gasto
- `PUT /expenses/:id` - Actualizar gasto
- `DELETE /expenses/:id` - Eliminar gasto

### **Plazos Fijos (`/fixed-term-deposits`)**
- `GET /fixed-term-deposits` - Listar plazos fijos
- `GET /fixed-term-deposits/:id` - Obtener plazo fijo
- `POST /fixed-term-deposits` - Crear plazo fijo
- `PUT /fixed-term-deposits/:id` - Actualizar plazo fijo
- `DELETE /fixed-term-deposits/:id` - Eliminar plazo fijo

### **Inversiones (`/investments`)**
- `GET /investments/instruments` - Listar instrumentos
- `GET /investments/instruments/:id` - Obtener instrumento
- `POST /investments/instruments` - Crear instrumento
- `PUT /investments/instruments/:id` - Actualizar instrumento
- `DELETE /investments/instruments/:id` - Eliminar instrumento
- `GET /investments/positions` - Listar posiciones
- `GET /investments/positions/:id` - Obtener posición
- `POST /investments/positions` - Crear posición
- `PUT /investments/positions/:id` - Actualizar posición
- `DELETE /investments/positions/:id` - Eliminar posición
- `GET /investments/portfolio` - Obtener portfolio completo con precios y P&L
- `POST /investments/update-prices` - Actualizar precios desde API externa

### **Analíticas (`/analytics`)**
- `GET /analytics/summary?startDate=&endDate=&convertTo=` - Resumen general (KPIs)
- `GET /analytics/expenses-by-category?startDate=&endDate=` - Gastos agrupados por categoría
- `GET /analytics/income-vs-expense?startDate=&endDate=` - Ingresos vs gastos por día
- `GET /analytics/cashflow?startDate=&endDate=` - Flujo de caja por mes

---

## ⚡ Características Especiales Implementadas

### **1. Optimizaciones de Rendimiento**
- **Agregaciones en BD**: Uso de `aggregate` y `groupBy` de Prisma en lugar de traer todos los registros
- **Consultas paralelas**: `Promise.all` para ejecutar múltiples queries simultáneamente
- **Índices optimizados**: Índices compuestos en campos frecuentemente consultados
- **Caché inteligente**: React Query con `staleTime` de 5 minutos y `gcTime` de 10 minutos
- **Placeholder data**: Muestra datos anteriores mientras carga nueva información

### **2. Conversión de Monedas**
- **Toggle Pesos/Dólares** en dashboard
- **API de cotización**: Integración con DolarAPI.com (dólar oficial)
- **Fallback**: Bluelytics si la primera API falla
- **Caché de cotización**: 1 hora para evitar demasiadas llamadas
- **Conversión automática**: Todos los valores se convierten a la moneda seleccionada

### **3. Integración con APIs de Mercado**
- **Yahoo Finance**: Precios de instrumentos en tiempo real
- **Alpha Vantage**: Opcional, más robusto (requiere API key)
- **Fallback**: Si la API falla, usa precio promedio de compra
- **Actualización manual**: Botón para actualizar precios
- **P&L en tiempo real**: Cálculo automático de ganancias/pérdidas

### **4. Exportación de Datos**
- **Formatos**: CSV y XLSX
- **Datos exportables**: Ingresos, Gastos, Plazos Fijos, Portfolio
- **Formateo**: Fechas en DD/MM/YYYY, monedas formateadas

### **5. Optimistic Updates**
- **UI inmediata**: Cambios se reflejan instantáneamente
- **Rollback automático**: Si falla la API, revierte los cambios
- **Invalidación inteligente**: Solo invalida queries relacionadas

### **6. Validación y Seguridad**
- **Validación Zod**: Schemas en backend y frontend
- **JWT con refresh**: Tokens de corta duración + refresh tokens
- **Middleware de auth**: Verificación en todas las rutas protegidas
- **Multi-tenancy**: Filtrado automático por `userId` en todas las queries
- **Hash de contraseñas**: bcrypt con salt rounds

### **7. Manejo de Errores**
- **Error handler global**: Middleware centralizado en Express
- **Mensajes amigables**: Errores traducidos al español
- **Logs detallados**: En desarrollo para debugging
- **Try-catch**: En servicios críticos

### **8. Componentes Personalizados**
- **DateInput**: Input de fecha con formato DD/MM/YYYY
  - Conversión automática a ISO para backend
  - Validación de formato
  - Placeholder claro

---

## 📊 Funcionalidades por Módulo

### **Dashboard**
- ✅ KPIs: Ingresos, Gastos, Balance, Portfolio, Plazos Fijos, Patrimonio Neto
- ✅ Filtros de fecha: Último mes, trimestre, año, todo
- ✅ Conversión de monedas: Toggle ARS/USD
- ✅ Gráficos: Pie (gastos por categoría), Line (ingresos vs gastos), Bar (flujo de caja)
- ✅ Distinción de monedas: ARS y USD separados
- ✅ Caché optimizado: 60 segundos staleTime

### **Ingresos**
- ✅ CRUD completo
- ✅ Filtros: Fecha, categoría, monto
- ✅ Categorías personalizables
- ✅ Soporte multi-moneda (ARS/USD)
- ✅ Exportación CSV/XLSX
- ✅ Optimistic updates
- ✅ Formato de fecha DD/MM/YYYY

### **Gastos**
- ✅ CRUD completo
- ✅ Filtros similares a ingresos
- ✅ Método de pago
- ✅ Tags (JSON, no implementado en UI)
- ✅ Exportación CSV/XLSX
- ✅ Optimistic updates
- ✅ Formato de fecha DD/MM/YYYY

### **Inversiones - Plazos Fijos**
- ✅ CRUD completo
- ✅ Cálculo automático: Fecha vencimiento, Interés
- ✅ Auto-renovación
- ✅ Soporte multi-moneda
- ✅ Exportación CSV/XLSX
- ✅ Optimistic updates

### **Inversiones - Portfolio**
- ✅ Gestión de instrumentos: Crear, editar, eliminar
- ✅ Gestión de posiciones: Crear, editar, eliminar
- ✅ Precios desde API: Yahoo Finance
- ✅ Cálculo P&L: Ganancia/pérdida en tiempo real
- ✅ Tipos de instrumentos: STOCK, CEDEAR, BOND, LECAP, ETF, OTHER
- ✅ Explicaciones para principiantes
- ✅ Exportación CSV/XLSX

### **Configuración**
- ✅ Gestión de categorías: CRUD completo
- ✅ Colores personalizables
- ✅ Iconos personalizables
- ✅ Tipos: EXPENSE, INCOME, BOTH
- ✅ Validación: No eliminar categorías con datos asociados

---

## 🔄 Flujos de Usuario

### **Flujo de Registro/Login**
1. Usuario visita landing page
2. Click en "Registrarse" o "Iniciar Sesión"
3. Completa formulario
4. Backend valida y crea/autentica usuario
5. Frontend recibe tokens y los guarda en Zustand + localStorage
6. Redirección a `/app/dashboard`

### **Flujo de Crear Ingreso/Gasto**
1. Usuario navega a Ingresos/Gastos
2. Click en "Nuevo Ingreso/Gasto"
3. Completa formulario (fecha en DD/MM/YYYY)
4. Submit → Optimistic update (UI inmediata)
5. API call en background
6. Si éxito: Invalidación de queries relacionadas
7. Si error: Rollback + mensaje de error

### **Flujo de Dashboard**
1. Usuario accede a dashboard
2. React Query verifica caché
3. Si hay datos frescos (< 5 min): Muestra inmediatamente
4. Si datos viejos: Muestra datos anteriores + fetch en background
5. Si no hay datos: Loading state
6. Usuario puede cambiar rango de fechas o moneda
7. Nueva query con nuevos parámetros

### **Flujo de Portfolio**
1. Usuario crea instrumento (ticker, nombre, tipo, mercado)
2. Usuario crea posición (instrumento, cantidad, precio)
3. Sistema busca precio actual en Yahoo Finance
4. Calcula P&L: (precio_actual - precio_promedio) * cantidad
5. Muestra en tabla con indicadores visuales

---

## 🎯 Estado Actual y Limitaciones

### **✅ Implementado y Funcional**
- Autenticación completa (JWT)
- CRUD de todas las entidades
- Dashboard con gráficos
- Exportación de datos
- Conversión de monedas
- Integración con APIs de mercado
- Optimizaciones de rendimiento
- Responsive design
- Tema claro/oscuro

### **⚠️ Limitaciones Conocidas**
- **Tags en gastos**: Campo JSON existe pero no hay UI para gestionarlo
- **Filtros avanzados**: Solo filtros básicos implementados
- **Notificaciones**: No hay sistema de notificaciones (ej: plazo fijo vencido)
- **Presupuestos**: No hay gestión de presupuestos
- **Metas financieras**: No hay sistema de objetivos
- **Reportes avanzados**: Solo dashboard básico
- **Multi-cuenta**: No hay gestión de múltiples cuentas bancarias
- **Recurrencias**: No hay gastos/ingresos recurrentes automáticos
- **Adjuntos**: No hay upload de comprobantes/facturas
- **Búsqueda**: No hay búsqueda global de transacciones
- **Etiquetas**: Tags no implementados en UI

### **🐛 Problemas Conocidos**
- Dashboard puede tardar en cargar si hay muchos datos (optimizado pero mejorable)
- Conexión a base de datos puede fallar temporalmente (Supabase)
- APIs externas pueden fallar (Yahoo Finance, DolarAPI)

---

## 🚀 Mejoras Futuras Sugeridas

### **Diseño**
- Sistema de diseño más robusto (Design Tokens)
- Componentes reutilizables más abstractos
- Animaciones y transiciones
- Mejor feedback visual (toasts, modals)
- Onboarding para nuevos usuarios
- Tutorial interactivo

### **Funcionalidades**
- Presupuestos y alertas
- Metas financieras
- Gastos/ingresos recurrentes
- Multi-cuenta bancaria
- Upload de comprobantes
- Búsqueda avanzada
- Filtros más potentes
- Reportes personalizables
- Exportación de reportes (PDF)
- Integración con bancos (Open Banking)

### **Técnico**
- Tests unitarios y E2E
- CI/CD pipeline
- Monitoreo y logging (Sentry, LogRocket)
- PWA (Progressive Web App)
- Offline mode
- Sincronización en tiempo real (WebSockets)
- Mejor manejo de errores con retry logic
- Rate limiting en APIs

---

## 📝 Notas Técnicas Importantes

### **Configuración de Caché**
- React Query: `staleTime: 5 minutos`, `gcTime: 10 minutos`
- Cotización dólar: Caché de 1 hora
- Precios de instrumentos: Se actualizan manualmente o al crear posición

### **Formato de Fechas**
- **Frontend**: DD/MM/YYYY (mostrado al usuario)
- **Backend**: ISO 8601 (YYYY-MM-DD)
- **Conversión**: Automática en componente DateInput

### **Formato de Monedas**
- **ARS**: `$1.234,56`
- **USD**: `USD 1,234.56`
- Función `formatCurrency()` en `utils/format.ts`

### **Multi-tenancy**
- Todas las queries filtran por `userId`
- Middleware de auth inyecta `userId` en `req.userId`
- No hay compartir datos entre usuarios

### **Optimizaciones de BD**
- Uso de `aggregate` para sumas
- Uso de `groupBy` para agrupaciones
- Índices compuestos en campos frecuentes
- Consultas paralelas con `Promise.all`

---

## 🎨 Paleta de Colores Actual

- **Verde**: `#10B981` (ingresos, positivo)
- **Rojo**: `#EF4444` (gastos, negativo)
- **Azul**: `#3B82F6` (dashboard, acciones)
- **Púrpura**: `#8B5CF6` (inversiones)
- **Índigo**: `#6366F1` (configuración)
- **Rosa**: `#EC4899` (accent)
- **Amarillo**: `#F59E0B` (warnings)

---

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (sidebar colapsable)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px (sidebar fijo)

---

Este documento proporciona una visión completa de la aplicación actual. Úsalo como base para rediseñar y agregar nuevas funcionalidades.

