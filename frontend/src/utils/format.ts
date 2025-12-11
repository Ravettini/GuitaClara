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

// Formatear moneda compacta para móvil (sin decimales, abreviado)
export const formatCurrencyCompact = (amount: number, currency: string = 'ARS'): string => {
  const absAmount = Math.abs(amount)
  const symbol = currency === 'USD' ? 'U$S' : '$'
  const sign = amount < 0 ? '-' : ''
  
  // Si es menor a 1000, mostrar normal sin decimales
  if (absAmount < 1000) {
    return `${sign}${symbol}${Math.round(absAmount)}`
  }
  
  // Si es menor a 1 millón, mostrar en miles (K) sin decimales si es entero
  if (absAmount < 1000000) {
    const thousands = absAmount / 1000
    if (thousands >= 100) {
      return `${sign}${symbol}${Math.round(thousands)}K`
    }
    return `${sign}${symbol}${thousands.toFixed(thousands < 10 ? 1 : 0)}K`
  }
  
  // Si es mayor a 1 millón, mostrar en millones (M)
  const millions = absAmount / 1000000
  if (millions >= 10) {
    return `${sign}${symbol}${Math.round(millions)}M`
  }
  return `${sign}${symbol}${millions.toFixed(1)}M`
}

// Convertir moneda (simplificado, en producción usar API de cambio)
export const convertCurrency = (amount: number, from: string, to: string, rate: number = 1000): number => {
  if (from === to) return amount
  if (from === 'USD' && to === 'ARS') return amount * rate
  if (from === 'ARS' && to === 'USD') return amount / rate
  return amount
}


