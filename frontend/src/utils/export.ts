import * as XLSX from 'xlsx'

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    alert('No hay datos para exportar')
    return
  }

  // Obtener las claves del primer objeto como headers
  const headers = Object.keys(data[0])
  
  // Crear contenido CSV
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Escapar comillas y envolver en comillas si contiene comas
        if (value === null || value === undefined) return ''
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      }).join(',')
    )
  ].join('\n')

  // Crear blob y descargar
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const exportToXLSX = (data: any[], filename: string, sheetName = 'Datos') => {
  if (!data || data.length === 0) {
    alert('No hay datos para exportar')
    return
  }

  // Crear workbook y worksheet
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)
  
  // Agregar worksheet al workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  
  // Descargar archivo
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

import { formatDate } from './format'

export const formatIncomeForExport = (income: any) => ({
  Fecha: formatDate(income.date),
  Monto: Number(income.amount),
  Moneda: income.currency,
  Categoría: income.category?.name || 'Sin categoría',
  Descripción: income.description || '',
  Tipo: income.sourceType || '',
})

export const formatExpenseForExport = (expense: any) => ({
  Fecha: formatDate(expense.date),
  Monto: Number(expense.amount),
  Moneda: expense.currency,
  Categoría: expense.category?.name || 'Sin categoría',
  Descripción: expense.description || '',
  'Método de Pago': expense.paymentMethod || '',
})

export const formatFixedTermForExport = (ft: any) => ({
  Banco: ft.bankName || '',
  Monto: Number(ft.principalAmount),
  Moneda: ft.currency,
  TNA: `${Number(ft.tna).toFixed(2)}%`,
  'Fecha Inicio': formatDate(ft.startDate),
  'Fecha Vencimiento': formatDate(ft.computedMaturityDate),
  'Plazo (días)': ft.termInDays,
  Interés: Number(ft.computedInterestAmount),
  'Auto-renovar': ft.autoRenew ? 'Sí' : 'No',
})

export const formatPositionForExport = (item: any) => ({
  Ticker: item.instrument.ticker,
  Nombre: item.instrument.name,
  Tipo: item.instrument.type,
  Cantidad: Number(item.position.quantity),
  'Precio Promedio': Number(item.position.averageBuyPrice),
  'Último Precio': item.lastPrice || 0,
  'Valor Actual': item.currentValue,
  'P&L': item.pnl,
  'P&L %': `${item.pnlPercent.toFixed(2)}%`,
  Broker: item.position.brokerName || '',
})

