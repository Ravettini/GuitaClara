import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { analyticsService } from '../services/api'
import { formatCurrency } from '../utils/format'
import { StatCard, PageHeader, EmptyState } from '../components/ui'
import AlertsCard from '../components/AlertsCard'
import { useAuthStore } from '../store/authStore'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function Summary() {
  const { user } = useAuthStore()
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'ytd'>('30d')
  const [currencyView, setCurrencyView] = useState<'ARS' | 'USD'>('ARS')
  const [chartType, setChartType] = useState<'balance' | 'income-expense'>('balance')

  const getDateRange = () => {
    const end = new Date()
    let start = new Date()
    
    switch (dateRange) {
      case '7d':
        start.setDate(start.getDate() - 7)
        break
      case '30d':
        start.setMonth(start.getMonth() - 1)
        break
      case '90d':
        start.setMonth(start.getMonth() - 3)
        break
      case 'ytd':
        start = new Date(new Date().getFullYear(), 0, 1)
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
    staleTime: 60000,
    gcTime: 300000,
    retry: 1,
  })

  const { data: expensesByCategory } = useQuery({
    queryKey: ['analytics', 'expenses-by-category', startDate, endDate],
    queryFn: () =>
      analyticsService.getExpensesByCategory(startDate, endDate).then((r) => r.data.data),
    staleTime: 60000,
    gcTime: 300000,
  })

  const { data: cashFlow } = useQuery({
    queryKey: ['analytics', 'cashflow', startDate, endDate],
    queryFn: () => analyticsService.getCashFlow(startDate, endDate).then((r) => r.data.data),
    staleTime: 60000,
    gcTime: 300000,
  })

  const dateRangeChips = [
    { id: '7d', label: '7 días' },
    { id: '30d', label: '30 días' },
    { id: '90d', label: '90 días' },
    { id: 'ytd', label: 'Año' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-h1 font-semibold text-gray-900 dark:text-white mb-1">
          Hola, {user?.email?.split('@')[0] || 'Usuario'}
        </h1>
        <p className="text-body-sm text-gray-600 dark:text-gray-400">
          Resumen de tu plata
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-card border border-gray-200 dark:border-gray-700">
          {dateRangeChips.map((chip) => (
            <button
              key={chip.id}
              onClick={() => setDateRange(chip.id as any)}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition
                ${dateRange === chip.id
                  ? 'bg-primary text-gray-900 shadow-sm'
                  : 'text-gray-900 dark:text-gray-200 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-card border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setCurrencyView('ARS')}
            className={`
              px-3 py-1.5 rounded-md text-sm font-medium transition
              ${currencyView === 'ARS'
                ? 'bg-primary text-gray-900 shadow-sm'
                : 'text-gray-900 dark:text-gray-200 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
          >
            ARS
          </button>
          <button
            onClick={() => setCurrencyView('USD')}
            className={`
              px-3 py-1.5 rounded-md text-sm font-medium transition
              ${currencyView === 'USD'
                ? 'bg-primary text-gray-900 shadow-sm'
                : 'text-gray-900 dark:text-gray-200 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
          >
            USD
          </button>
        </div>
      </div>

      {summaryLoading && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Cargando datos...
        </div>
      )}

      {summaryError && (
        <div className="bg-danger-soft dark:bg-red-900 border border-danger dark:border-red-700 text-danger-dark dark:text-red-300 px-4 py-3 rounded-lg">
          <p className="font-bold">Error al cargar datos</p>
          <p className="text-sm">{summaryError instanceof Error ? summaryError.message : 'Error desconocido'}</p>
        </div>
      )}

      {!summaryLoading && !summaryError && summary && (
        <>
          {/* KPIs Grid - Carrusel en mobile, grid en desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            <div className="min-w-[160px] md:min-w-0">
              <StatCard
                label="Balance"
                value={formatCurrency(
                  currencyView === 'ARS' ? summary.balance : summary.balanceUSD,
                  currencyView
                )}
                trend={
                  summary.balance > 0
                    ? { label: 'Positivo', direction: 'up' }
                    : summary.balance < 0
                    ? { label: 'Negativo', direction: 'down' }
                    : { label: 'Neutro', direction: 'neutral' }
                }
                icon="💰"
              />
            </div>
            <div className="min-w-[160px] md:min-w-0">
              <StatCard
                label="Ingresos"
                value={formatCurrency(
                  currencyView === 'ARS' ? summary.totalIncome : summary.totalIncomeUSD,
                  currencyView
                )}
                trend={{ label: 'Total', direction: 'up' }}
                icon="📈"
              />
            </div>
            <div className="min-w-[160px] md:min-w-0">
              <StatCard
                label="Gastos"
                value={formatCurrency(
                  currencyView === 'ARS' ? summary.totalExpenses : summary.totalExpensesUSD,
                  currencyView
                )}
                trend={{ label: 'Total', direction: 'down' }}
                icon="📉"
              />
            </div>
            <div className="min-w-[160px] md:min-w-0">
              <StatCard
                label="Patrimonio"
                value={formatCurrency(
                  currencyView === 'ARS' ? summary.netWorth : summary.netWorthUSD,
                  currencyView
                )}
                icon="🏦"
              />
            </div>
          </div>

          {/* Alertas */}
          <AlertsCard />

          {/* Gráfico Principal */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-h3 font-semibold text-gray-900 dark:text-white">
                Flujo de Caja
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setChartType('balance')}
                  className={`
                    px-3 py-1.5 rounded-md text-sm font-medium transition
                    ${chartType === 'balance'
                      ? 'bg-primary text-gray-900 shadow-sm'
                      : 'text-gray-900 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  Saldo
                </button>
                <button
                  onClick={() => setChartType('income-expense')}
                  className={`
                    px-3 py-1.5 rounded-md text-sm font-medium transition
                    ${chartType === 'income-expense'
                      ? 'bg-primary text-gray-900 shadow-sm'
                      : 'text-gray-900 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  Ingresos vs Gastos
                </button>
              </div>
            </div>
            {cashFlow && cashFlow.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                {chartType === 'balance' ? (
                  <AreaChart data={cashFlow}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="balance"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                ) : (
                  <LineChart data={cashFlow}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Ingresos"
                    />
                    <Line
                      type="monotone"
                      dataKey="expense"
                      stroke="#EF4444"
                      strokeWidth={2}
                      name="Gastos"
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            ) : (
              <EmptyState
                title="Sin datos"
                description="No hay datos de flujo de caja para el período seleccionado"
              />
            )}
          </div>

          {/* Gastos por Categoría */}
          {expensesByCategory && expensesByCategory.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-6">
              <h2 className="text-h3 font-semibold text-gray-900 dark:text-white mb-4">
                ¿En qué se me va la plata?
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={expensesByCategory.slice(0, 6)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total"
                      >
                        {expensesByCategory.slice(0, 6).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {expensesByCategory.slice(0, 5).map((cat: any) => (
                    <div key={cat.categoryId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: cat.color || '#3B82F6' }}
                        />
                        <span className="text-body-sm font-medium text-gray-900 dark:text-white">
                          {cat.categoryName}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-body-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(cat.total, 'ARS')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {cat.percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

