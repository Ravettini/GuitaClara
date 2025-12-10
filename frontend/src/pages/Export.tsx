import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import * as XLSX from 'xlsx'
import { incomeService, expenseService, fixedTermService, investmentService, budgetService, goalService } from '../services/api'
import {
  exportToCSV,
  exportToXLSX,
  formatIncomeForExport,
  formatExpenseForExport,
  formatFixedTermForExport,
  formatPositionForExport,
} from '../utils/export'
import { PageHeader, Card, Button, EmptyState } from '../components/ui'
import { useToast } from '../components/ui/Toast'
import DateInput from '../components/DateInput'

type ExportType = 'incomes' | 'expenses' | 'transactions' | 'fixedTerms' | 'portfolio' | 'budgets' | 'goals' | 'all'

export default function Export() {
  const [selectedType, setSelectedType] = useState<ExportType>('all')
  const [dateRange, setDateRange] = useState<'all' | 'custom'>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [exporting, setExporting] = useState(false)
  const { toast } = useToast()

  // Queries para obtener datos
  const { data: incomes } = useQuery({
    queryKey: ['incomes'],
    queryFn: () => incomeService.getAll().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  const { data: expenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => expenseService.getAll().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  const { data: fixedTerms } = useQuery({
    queryKey: ['fixed-terms'],
    queryFn: () => fixedTermService.getAll().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  const { data: portfolio } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => investmentService.getPortfolio().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  const { data: budgets } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetService.getAll().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  const { data: goals } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalService.getAll().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  })

  const filterByDate = (data: any[]) => {
    if (dateRange === 'all' || !startDate || !endDate) return data
    const start = new Date(startDate)
    const end = new Date(endDate)
    return data.filter((item) => {
      const itemDate = new Date(item.date || item.periodStart || item.targetDate || item.startDate)
      return itemDate >= start && itemDate <= end
    })
  }

  const handleExport = async (format: 'csv' | 'xlsx') => {
    setExporting(true)
    try {
      switch (selectedType) {
        case 'incomes': {
          const data = filterByDate(incomes || [])
          if (data.length === 0) {
            toast({ message: 'No hay datos para exportar', type: 'warning' })
            return
          }
          const formatted = data.map(formatIncomeForExport)
          if (format === 'csv') {
            exportToCSV(formatted, 'ingresos')
          } else {
            exportToXLSX(formatted, 'ingresos', 'Ingresos')
          }
          toast({ message: 'Ingresos exportados correctamente', type: 'success' })
          break
        }
        case 'expenses': {
          const data = filterByDate(expenses || [])
          if (data.length === 0) {
            toast({ message: 'No hay datos para exportar', type: 'warning' })
            return
          }
          const formatted = data.map(formatExpenseForExport)
          if (format === 'csv') {
            exportToCSV(formatted, 'gastos')
          } else {
            exportToXLSX(formatted, 'gastos', 'Gastos')
          }
          toast({ message: 'Gastos exportados correctamente', type: 'success' })
          break
        }
        case 'transactions': {
          const incomeData = filterByDate(incomes || [])
          const expenseData = filterByDate(expenses || [])
          const allTransactions = [
            ...incomeData.map((inc: any) => ({
              ...formatIncomeForExport(inc),
              Tipo: 'Ingreso',
            })),
            ...expenseData.map((exp: any) => ({
              ...formatExpenseForExport(exp),
              Tipo: 'Gasto',
            })),
          ]
          if (allTransactions.length === 0) {
            toast({ message: 'No hay datos para exportar', type: 'warning' })
            return
          }
          if (format === 'csv') {
            exportToCSV(allTransactions, 'transacciones')
          } else {
            exportToXLSX(allTransactions, 'transacciones', 'Transacciones')
          }
          toast({ message: 'Transacciones exportadas correctamente', type: 'success' })
          break
        }
        case 'fixedTerms': {
          const data = filterByDate(fixedTerms || [])
          if (data.length === 0) {
            toast({ message: 'No hay datos para exportar', type: 'warning' })
            return
          }
          const formatted = data.map(formatFixedTermForExport)
          if (format === 'csv') {
            exportToCSV(formatted, 'plazos-fijos')
          } else {
            exportToXLSX(formatted, 'plazos-fijos', 'Plazos Fijos')
          }
          toast({ message: 'Plazos fijos exportados correctamente', type: 'success' })
          break
        }
        case 'portfolio': {
          if (!portfolio || portfolio.length === 0) {
            toast({ message: 'No hay datos para exportar', type: 'warning' })
            return
          }
          const formatted = portfolio.map(formatPositionForExport)
          if (format === 'csv') {
            exportToCSV(formatted, 'portfolio')
          } else {
            exportToXLSX(formatted, 'portfolio', 'Portfolio')
          }
          toast({ message: 'Portfolio exportado correctamente', type: 'success' })
          break
        }
        case 'budgets': {
          const data = filterByDate(budgets || [])
          if (data.length === 0) {
            toast({ message: 'No hay datos para exportar', type: 'warning' })
            return
          }
          const formatted = data.map((budget: any) => ({
            Categoría: budget.category?.name || 'Sin categoría',
            Presupuesto: Number(budget.amount),
            Moneda: budget.currency,
            'Fecha Inicio': budget.periodStart,
            'Fecha Fin': budget.periodEnd,
            Gastado: budget.spent || 0,
            Disponible: budget.remaining || 0,
            'Porcentaje Usado': `${(budget.percentage || 0).toFixed(1)}%`,
            Repetir: budget.repeat ? 'Sí' : 'No',
            Notas: budget.notes || '',
          }))
          if (format === 'csv') {
            exportToCSV(formatted, 'presupuestos')
          } else {
            exportToXLSX(formatted, 'presupuestos', 'Presupuestos')
          }
          toast({ message: 'Presupuestos exportados correctamente', type: 'success' })
          break
        }
        case 'goals': {
          if (!goals || goals.length === 0) {
            toast({ message: 'No hay datos para exportar', type: 'warning' })
            return
          }
          const formatted = goals.map((goal: any) => ({
            Nombre: goal.name,
            'Monto Objetivo': Number(goal.targetAmount),
            Moneda: goal.currency,
            'Fecha Objetivo': goal.targetDate,
            'Monto Actual': goal.currentAmount || 0,
            Progreso: `${(goal.percentage || 0).toFixed(1)}%`,
            Restante: goal.remaining || 0,
            Estado: goal.status,
            'Meses Restantes': goal.monthsRemaining || 0,
            'Aporte Mensual Sugerido': goal.suggestedMonthlyContribution || 0,
            Notas: goal.notes || '',
          }))
          if (format === 'csv') {
            exportToCSV(formatted, 'metas')
          } else {
            exportToXLSX(formatted, 'metas', 'Metas')
          }
          toast({ message: 'Metas exportadas correctamente', type: 'success' })
          break
        }
        case 'all': {
          // Exportar todo en un archivo XLSX con múltiples hojas
          if (format === 'csv') {
            toast({ message: 'Para exportar todo, usa el formato XLSX', type: 'info' })
            return
          }
          const wb = XLSX.utils.book_new()
          
          // Ingresos
          if (incomes && incomes.length > 0) {
            const formatted = filterByDate(incomes).map(formatIncomeForExport)
            const ws = XLSX.utils.json_to_sheet(formatted)
            XLSX.utils.book_append_sheet(wb, ws, 'Ingresos')
          }
          
          // Gastos
          if (expenses && expenses.length > 0) {
            const formatted = filterByDate(expenses).map(formatExpenseForExport)
            const ws = XLSX.utils.json_to_sheet(formatted)
            XLSX.utils.book_append_sheet(wb, ws, 'Gastos')
          }
          
          // Plazos fijos
          if (fixedTerms && fixedTerms.length > 0) {
            const formatted = filterByDate(fixedTerms).map(formatFixedTermForExport)
            const ws = XLSX.utils.json_to_sheet(formatted)
            XLSX.utils.book_append_sheet(wb, ws, 'Plazos Fijos')
          }
          
          // Portfolio
          if (portfolio && portfolio.length > 0) {
            const formatted = portfolio.map(formatPositionForExport)
            const ws = XLSX.utils.json_to_sheet(formatted)
            XLSX.utils.book_append_sheet(wb, ws, 'Portfolio')
          }
          
          // Presupuestos
          if (budgets && budgets.length > 0) {
            const formatted = filterByDate(budgets).map((budget: any) => ({
              Categoría: budget.category?.name || 'Sin categoría',
              Presupuesto: Number(budget.amount),
              Moneda: budget.currency,
              'Fecha Inicio': budget.periodStart,
              'Fecha Fin': budget.periodEnd,
              Gastado: budget.spent || 0,
              Disponible: budget.remaining || 0,
              'Porcentaje Usado': `${(budget.percentage || 0).toFixed(1)}%`,
            }))
            const ws = XLSX.utils.json_to_sheet(formatted)
            XLSX.utils.book_append_sheet(wb, ws, 'Presupuestos')
          }
          
          // Metas
          if (goals && goals.length > 0) {
            const formatted = goals.map((goal: any) => ({
              Nombre: goal.name,
              'Monto Objetivo': Number(goal.targetAmount),
              Moneda: goal.currency,
              'Fecha Objetivo': goal.targetDate,
              Progreso: `${(goal.percentage || 0).toFixed(1)}%`,
              Estado: goal.status,
            }))
            const ws = XLSX.utils.json_to_sheet(formatted)
            XLSX.utils.book_append_sheet(wb, ws, 'Metas')
          }
          
          XLSX.writeFile(wb, 'guitaclara-completo.xlsx')
          toast({ message: 'Todos los datos exportados correctamente', type: 'success' })
          break
        }
      }
    } catch (error) {
      toast({ message: 'Error al exportar datos', type: 'error' })
      console.error('Error exporting:', error)
    } finally {
      setExporting(false)
    }
  }

  const exportTypes = [
    { id: 'all', label: 'Todo', icon: '📦', description: 'Exporta todos los datos en un archivo XLSX con múltiples hojas' },
    { id: 'transactions', label: 'Transacciones', icon: '💸', description: 'Ingresos y gastos combinados' },
    { id: 'incomes', label: 'Ingresos', icon: '💰', description: 'Solo ingresos' },
    { id: 'expenses', label: 'Gastos', icon: '💸', description: 'Solo gastos' },
    { id: 'fixedTerms', label: 'Plazos Fijos', icon: '🏦', description: 'Plazos fijos y depósitos' },
    { id: 'portfolio', label: 'Portfolio', icon: '📈', description: 'Inversiones y posiciones' },
    { id: 'budgets', label: 'Presupuestos', icon: '📊', description: 'Presupuestos por categoría' },
    { id: 'goals', label: 'Metas', icon: '🎯', description: 'Metas financieras' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exportar Datos"
        description="Descarga tus datos financieros en CSV o XLSX"
      />

      {/* Selector de tipo de exportación */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {exportTypes.map((type) => (
          <Card
            key={type.id}
            hover
            onClick={() => setSelectedType(type.id as ExportType)}
            className={`p-4 cursor-pointer transition ${
              selectedType === type.id
                ? 'ring-2 ring-primary dark:ring-blue-400'
                : ''
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl text-gray-900 dark:text-gray-100" style={{ filter: 'none' }}>
                {type.icon}
              </span>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {type.label}
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {type.description}
            </p>
          </Card>
        ))}
      </div>

      {/* Filtro de fecha */}
      <Card className="p-6">
        <h3 className="text-h3 font-semibold mb-4 text-gray-900 dark:text-white">
          Filtro de Fecha
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="all-dates"
              name="dateRange"
              checked={dateRange === 'all'}
              onChange={() => setDateRange('all')}
              className="w-4 h-4"
            />
            <label htmlFor="all-dates" className="text-gray-900 dark:text-white">
              Todos los datos
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="custom-dates"
              name="dateRange"
              checked={dateRange === 'custom'}
              onChange={() => setDateRange('custom')}
              className="w-4 h-4"
            />
            <label htmlFor="custom-dates" className="text-gray-900 dark:text-white">
              Rango personalizado
            </label>
          </div>
          {dateRange === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Fecha de fin
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Botones de exportación */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => handleExport('csv')}
          disabled={exporting}
          loading={exporting}
          className="flex-1"
        >
          📥 Exportar CSV
        </Button>
        <Button
          onClick={() => handleExport('xlsx')}
          disabled={exporting}
          loading={exporting}
          variant="primary"
          className="flex-1"
        >
          📥 Exportar XLSX
        </Button>
      </div>

      {/* Información adicional */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <h3 className="text-h3 font-semibold mb-2 text-gray-900 dark:text-white">
          💡 Información
        </h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>• Los archivos CSV son compatibles con Excel, Google Sheets y otros programas</li>
          <li>• Los archivos XLSX mantienen mejor formato y soportan múltiples hojas</li>
          <li>• Al exportar "Todo", se crea un archivo XLSX con una hoja por cada tipo de dato</li>
          <li>• Los filtros de fecha solo aplican a transacciones, presupuestos y plazos fijos</li>
        </ul>
      </Card>
    </div>
  )
}

