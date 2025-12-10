import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { analyticsService } from '../services/api'
import { formatDate, formatCurrency } from '../utils/format'
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<'month' | 'quarter' | 'year' | 'all'>('month')
  const [currencyView, setCurrencyView] = useState<'ARS' | 'USD'>('ARS')

  const getDateRange = () => {
    const end = new Date()
    let start = new Date()
    
    switch (dateRange) {
      case 'month':
        start.setMonth(start.getMonth() - 1)
        break
      case 'quarter':
        start.setMonth(start.getMonth() - 3)
        break
      case 'year':
        start.setFullYear(start.getFullYear() - 1)
        break
      case 'all':
        start = new Date(2020, 0, 1)
        break
    }
    
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    }
  }

  const { startDate, endDate } = getDateRange()

  const { data: summary, isLoading: summaryLoading, error: summaryError } = useQuery({
    queryKey: ['analytics', 'summary', startDate, endDate, currencyView],
    queryFn: () => analyticsService.getSummary(startDate, endDate, currencyView).then((r) => r.data.data),
    staleTime: 60000, // Cache por 60 segundos
    gcTime: 300000, // Mantener en caché por 5 minutos
    retry: 1,
  })

  const { data: expensesByCategory, isLoading: expensesLoading } = useQuery({
    queryKey: ['analytics', 'expenses-by-category', startDate, endDate],
    queryFn: () =>
      analyticsService.getExpensesByCategory(startDate, endDate).then((r) => r.data.data),
    staleTime: 60000,
    gcTime: 300000,
  })

  const { data: incomeVsExpense, isLoading: incomeVsExpenseLoading } = useQuery({
    queryKey: ['analytics', 'income-vs-expense', startDate, endDate],
    queryFn: () =>
      analyticsService.getIncomeVsExpense(startDate, endDate).then((r) => r.data.data),
    staleTime: 60000,
    gcTime: 300000,
  })

  const { data: cashFlow, isLoading: cashFlowLoading } = useQuery({
    queryKey: ['analytics', 'cashflow', startDate, endDate],
    queryFn: () => analyticsService.getCashFlow(startDate, endDate).then((r) => r.data.data),
    staleTime: 60000,
    gcTime: 300000,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => setCurrencyView(currencyView === 'ARS' ? 'USD' : 'ARS')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              currencyView === 'ARS'
                ? 'bg-blue-600 text-gray-900 hover:bg-blue-700'
                : 'bg-green-600 text-gray-900 hover:bg-green-700'
            }`}
          >
            {currencyView === 'ARS' ? '💰 Pesos' : '💵 Dólares'}
          </button>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="month">Último mes</option>
            <option value="quarter">Último trimestre</option>
            <option value="year">Último año</option>
            <option value="all">Todo</option>
          </select>
        </div>
      </div>

      {summaryLoading && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Cargando datos...
        </div>
      )}

      {summaryError && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error al cargar datos</p>
          <p className="text-sm">{summaryError instanceof Error ? summaryError.message : 'Error desconocido'}</p>
        </div>
      )}

      {/* KPIs */}
      {!summaryLoading && !summaryError && summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Ingresos</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(
                currencyView === 'ARS' 
                  ? (summary?.totalIncome || 0)
                  : (summary?.totalIncomeUSD || 0),
                currencyView
              )}
            </p>
            {summary?.dollarRate && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Dólar oficial: ${summary.dollarRate.toFixed(2)}
              </p>
            )}
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Gastos</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(
                currencyView === 'ARS' 
                  ? (summary?.totalExpenses || 0)
                  : (summary?.totalExpensesUSD || 0),
                currencyView
              )}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Balance</p>
            <p
              className={`text-2xl font-bold ${
                (currencyView === 'ARS' 
                  ? (summary?.balance || 0)
                  : (summary?.balanceUSD || 0)) >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {formatCurrency(
                currencyView === 'ARS' 
                  ? (summary?.balance || 0)
                  : (summary?.balanceUSD || 0),
                currencyView
              )}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tasa de Ahorro</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {summary?.savingsRate.toFixed(1) || '0'}%
            </p>
          </div>
        </div>
      )}

      {/* Inversiones */}
      {!summaryLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Valor Portfolio</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(
                currencyView === 'ARS' 
                  ? (summary?.totalPortfolioValue || 0)
                  : (summary?.totalPortfolioValueUSD || 0),
                currencyView
              )}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Plazos Fijos</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(
                currencyView === 'ARS' 
                  ? (summary?.totalFixedTermsValue || 0)
                  : (summary?.totalFixedTermsValueUSD || 0),
                currencyView
              )}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Patrimonio Neto</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {formatCurrency(
                currencyView === 'ARS' 
                  ? (summary?.netWorth || 0)
                  : (summary?.netWorthUSD || 0),
                currencyView
              )}
            </p>
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gastos por categoría */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Gastos por Categoría
          </h2>
          {expensesLoading ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">Cargando...</p>
          ) : expensesByCategory && expensesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                >
                  {expensesByCategory.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString('es-AR')}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                No hay datos de gastos en el período seleccionado
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Intenta cambiar el rango de fechas o agrega algunos gastos
              </p>
            </div>
          )}
        </div>

        {/* Ingresos vs Gastos */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Ingresos vs Gastos
          </h2>
          {incomeVsExpense && incomeVsExpense.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={incomeVsExpense}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return formatDate(date)
                  }}
                />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString('es-AR')}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10B981"
                  name="Ingresos"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#EF4444"
                  name="Gastos"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No hay datos disponibles
            </p>
          )}
        </div>
      </div>

      {/* Flujo de caja */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Flujo de Caja Mensual
        </h2>
        {cashFlowLoading ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">Cargando...</p>
        ) : cashFlow && cashFlow.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cashFlow}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `$${value.toLocaleString('es-AR')}`} />
              <Legend />
              <Bar dataKey="income" fill="#10B981" name="Ingresos" />
              <Bar dataKey="expense" fill="#EF4444" name="Gastos" />
              <Bar dataKey="balance" fill="#3B82F6" name="Balance" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              No hay datos en el período seleccionado
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Intenta cambiar el rango de fechas
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

