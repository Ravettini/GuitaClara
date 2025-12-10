/**
 * Configuración centralizada de la API
 * 
 * Esta constante se usa en todo el frontend para hacer llamadas al backend.
 * 
 * Variables de entorno:
 * - VITE_API_URL: URL completa del backend (ej: https://mi-backend.railway.app)
 * 
 * Comportamiento:
 * - Si VITE_API_URL está definida, se usa esa URL
 * - Si no está definida y estamos en producción, se usa '/api' (para serverless functions)
 * - Si no está definida y estamos en desarrollo, se usa 'http://localhost:3001'
 * 
 * Ejemplo para desarrollo local:
 *   Crear archivo frontend/.env.local con:
 *   VITE_API_URL=http://localhost:3001
 * 
 * Ejemplo para producción (Vercel):
 *   En Vercel → Settings → Environment Variables:
 *   VITE_API_URL=https://mi-backend.railway.app
 */

const getApiUrl = (): string => {
  // Prioridad 1: Variable de entorno explícita
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  // Prioridad 2: En producción sin variable, usar /api (para serverless functions de Vercel)
  if (import.meta.env.PROD) {
    return '/api'
  }

  // Prioridad 3: Desarrollo local por defecto
  return 'http://localhost:3001'
}

export const API_URL = getApiUrl()

// Log solo en desarrollo para debugging
if (import.meta.env.DEV) {
  console.log('🔧 API URL configurada:', API_URL)
}

