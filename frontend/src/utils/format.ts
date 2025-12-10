// Formatear fecha a DD/MM/YYYY
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

// Formatear moneda con símbolo
export const formatCurrency = (amount: number, currency: string = 'ARS'): string => {
  const symbol = currency === 'USD' ? 'U$S' : '$'
  return `${symbol} ${amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Convertir moneda (simplificado, en producción usar API de cambio)
export const convertCurrency = (amount: number, from: string, to: string, rate: number = 1000): number => {
  if (from === to) return amount
  if (from === 'USD' && to === 'ARS') return amount * rate
  if (from === 'ARS' && to === 'USD') return amount / rate
  return amount
}


