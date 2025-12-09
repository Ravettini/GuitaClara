#!/bin/bash

echo "🚀 Configurando proyecto para desarrollo local..."

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Crear archivos .env si no existen
echo "⚙️  Configurando variables de entorno..."

if [ ! -f backend/.env ]; then
    echo "Creando backend/.env..."
    cat > backend/.env << EOF
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finanzas"
JWT_SECRET="dev-secret-key-change-in-production"
JWT_REFRESH_SECRET="dev-refresh-secret-key-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
EOF
    echo "✅ backend/.env creado"
else
    echo "⚠️  backend/.env ya existe, no se sobrescribió"
fi

if [ ! -f frontend/.env ]; then
    echo "Creando frontend/.env..."
    echo 'VITE_API_URL=http://localhost:3001' > frontend/.env
    echo "✅ frontend/.env creado"
else
    echo "⚠️  frontend/.env ya existe, no se sobrescribió"
fi

# Levantar PostgreSQL
echo "🐘 Levantando PostgreSQL con Docker..."
docker-compose up -d

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 5

# Generar Prisma Client y ejecutar migraciones
echo "🗄️  Configurando base de datos..."
cd backend
npx prisma generate
npx prisma migrate dev --name init

# Preguntar si quiere ejecutar seeds
read -p "¿Ejecutar seeds para crear datos de ejemplo? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    npx prisma db seed
fi

cd ..

echo ""
echo "✅ ¡Configuración completada!"
echo ""
echo "Para ejecutar la aplicación:"
echo "  npm run dev"
echo ""
echo "O por separado:"
echo "  Terminal 1: cd backend && npm run dev"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:3001"
echo ""
echo "Usuario de prueba (si ejecutaste seeds):"
echo "  Email: test@example.com"
echo "  Contraseña: password123"

