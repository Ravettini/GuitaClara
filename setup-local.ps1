# Script de setup para Windows PowerShell

Write-Host "🚀 Configurando proyecto para desarrollo local..." -ForegroundColor Cyan

# Verificar Docker
try {
    docker --version | Out-Null
} catch {
    Write-Host "❌ Docker no está instalado. Por favor instala Docker primero." -ForegroundColor Red
    exit 1
}

# Instalar dependencias
Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
npm install
Set-Location backend
npm install
Set-Location ..
Set-Location frontend
npm install
Set-Location ..

# Crear archivos .env si no existen
Write-Host "⚙️  Configurando variables de entorno..." -ForegroundColor Yellow

if (-not (Test-Path "backend\.env")) {
    Write-Host "Creando backend\.env..." -ForegroundColor Green
    $envContent = @"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finanzas"
JWT_SECRET="dev-secret-key-change-in-production"
JWT_REFRESH_SECRET="dev-refresh-secret-key-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
"@
    $envContent | Out-File -FilePath "backend\.env" -Encoding utf8
    Write-Host "✅ backend\.env creado" -ForegroundColor Green
} else {
    Write-Host "⚠️  backend\.env ya existe, no se sobrescribió" -ForegroundColor Yellow
}

if (-not (Test-Path "frontend\.env")) {
    Write-Host "Creando frontend\.env..." -ForegroundColor Green
    "VITE_API_URL=http://localhost:3001" | Out-File -FilePath "frontend\.env" -Encoding utf8
    Write-Host "✅ frontend\.env creado" -ForegroundColor Green
} else {
    Write-Host "⚠️  frontend\.env ya existe, no se sobrescribió" -ForegroundColor Yellow
}

# Levantar PostgreSQL
Write-Host "🐘 Levantando PostgreSQL con Docker..." -ForegroundColor Yellow
docker-compose up -d

# Esperar a que PostgreSQL esté listo
Write-Host "⏳ Esperando a que PostgreSQL esté listo..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Generar Prisma Client y ejecutar migraciones
Write-Host "🗄️  Configurando base de datos..." -ForegroundColor Yellow
Set-Location backend
npx prisma generate
npx prisma migrate dev --name init

# Preguntar si quiere ejecutar seeds
$seed = Read-Host "¿Ejecutar seeds para crear datos de ejemplo? (s/n)"
if ($seed -eq "s" -or $seed -eq "S") {
    npx prisma db seed
}

Set-Location ..

Write-Host ""
Write-Host "✅ ¡Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "Para ejecutar la aplicación:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "O por separado:" -ForegroundColor Cyan
Write-Host "  Terminal 1: cd backend && npm run dev" -ForegroundColor White
Write-Host "  Terminal 2: cd frontend && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Usuario de prueba (si ejecutaste seeds):" -ForegroundColor Cyan
Write-Host "  Email: test@example.com" -ForegroundColor White
Write-Host "  Contraseña: password123" -ForegroundColor White

