import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { analyticsService } from '../services/api'
import { formatCurrency, formatCurrencyCompact } from '../utils/format'
import { PageHeader } from '../components/ui'

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Calcular el primer y último día del mes
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = firstDay.toISOString().split('T')[0]
  const endDate = lastDay.toISOString().split('T')[0]

  const { data: dailyData, isLoading } = useQuery({
    queryKey: ['analytics', 'income-vs-expense', startDate, endDate],
    queryFn: () =>
      analyticsService.getIncomeVsExpense(startDate, endDate).then((r) => r.data.data),
    staleTime: 60000,
    gcTime: 300000,
  })

  // Crear un mapa de datos por fecha
  const dataByDate = new Map<string, { income: number; expense: number; balance: number }>()
  if (dailyData) {
    dailyData.forEach((item: any) => {
      dataByDate.set(item.date, {
        income: Number(item.income || 0),
        expense: Number(item.expense || 0),
        balance: Number(item.income || 0) - Number(item.expense || 0),
      })
    })
  }

  // Obtener el primer día de la semana del mes (0 = domingo, 1 = lunes, etc.)
  const firstDayOfWeek = firstDay.getDay()
  // Ajustar para que la semana empiece en lunes (1)
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

  // Generar días del mes
  const daysInMonth = lastDay.getDate()
  const days: (number | null)[] = []
  
  // Agregar días vacíos al inicio
  for (let i = 0; i < adjustedFirstDay; i++) {
    days.push(null)
  }
  
  // Agregar días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getDayData = (day: number | null) => {
    if (day === null) return null
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return dataByDate.get(dateKey) || { income: 0, expense: 0, balance: 0 }
  }

  const isToday = (day: number | null) => {
    if (day === null) return false
    const today = new Date()
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
      <PageHeader
        title="Calendario"
        description="Visualiza tus gastos, ingresos y balance por día"
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-3 md:p-6">
        {/* Controles del calendario */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 md:mb-6">
          <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-lg md:text-xl"
            >
              ←
            </button>
            <h2 className="text-base md:text-xl font-semibold text-gray-900 dark:text-white text-center flex-1 sm:flex-none sm:min-w-[200px]">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-lg md:text-xl"
            >
              →
            </button>
          </div>
          <button
            onClick={goToToday}
            className="w-full sm:w-auto px-4 py-2 bg-primary text-gray-900 rounded-lg hover:bg-primary-dark transition font-medium text-sm md:text-base"
          >
            Hoy
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Cargando datos del calendario...
          </div>
        ) : (
          <>
            {/* Encabezados de días de la semana */}
            <div className="grid grid-cols-7 gap-1 md:gap-2 mb-1 md:mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 py-1 md:py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Días del calendario */}
            <div className="grid grid-cols-7 gap-1 md:gap-2">
              {days.map((day, index) => {
                const dayData = getDayData(day)
                const today = isToday(day)

                return (
                  <div
                    key={index}
                    className={`
                      min-h-[65px] md:min-h-[120px] p-1.5 md:p-2 rounded-lg border-2 transition
                      ${day === null
                        ? 'border-transparent'
                        : today
                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                    `}
                  >
                    {day !== null && (
                      <>
                        <div className="flex items-center justify-between mb-1 md:mb-2">
                          <span
                            className={`
                              text-xs md:text-sm font-semibold
                              ${today
                                ? 'text-primary dark:text-blue-400'
                                : 'text-gray-700 dark:text-gray-300'
                              }
                            `}
                          >
                            {day}
                          </span>
                        </div>
                        {dayData && (
                          <div className="space-y-0.5 md:space-y-1">
                            {/* Mobile: Solo balance con formato compacto */}
                            <div className="md:hidden">
                              {dayData.balance !== 0 && (
                                <div
                                  className={`
                                    font-bold text-[11px] leading-tight break-words
                                    ${dayData.balance > 0
                                      ? 'text-success dark:text-green-400'
                                      : 'text-danger dark:text-red-400'
                                    }
                                  `}
                                >
                                  {formatCurrencyCompact(dayData.balance, 'ARS')}
                                </div>
                              )}
                              {(dayData.income > 0 || dayData.expense > 0) && dayData.balance === 0 && (
                                <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                  $0
                                </div>
                              )}
                            </div>
                            
                            {/* Desktop: Todos los datos */}
                            <div className="hidden md:block text-xs">
                              {dayData.income > 0 && (
                                <div className="text-success dark:text-green-400 font-medium">
                                  +{formatCurrency(dayData.income, 'ARS')}
                                </div>
                              )}
                              {dayData.expense > 0 && (
                                <div className="text-danger dark:text-red-400 font-medium">
                                  -{formatCurrency(dayData.expense, 'ARS')}
                                </div>
                              )}
                              {dayData.balance !== 0 && (
                                <div
                                  className={`
                                    font-bold pt-1 border-t border-gray-200 dark:border-gray-700
                                    ${dayData.balance > 0
                                      ? 'text-success dark:text-green-400'
                                      : 'text-danger dark:text-red-400'
                                    }
                                  `}
                                >
                                  {dayData.balance > 0 ? '+' : ''}
                                  {formatCurrency(dayData.balance, 'ARS')}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Leyenda */}
            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm">
              <div className="flex items-center gap-1.5 md:gap-2">
                <div className="w-3 h-3 md:w-4 md:h-4 rounded border-2 border-primary bg-primary/5"></div>
                <span className="text-gray-600 dark:text-gray-400">Hoy</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <span className="text-success dark:text-green-400 font-medium">+</span>
                <span className="text-gray-600 dark:text-gray-400">Ingresos</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <span className="text-danger dark:text-red-400 font-medium">-</span>
                <span className="text-gray-600 dark:text-gray-400">Gastos</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <span className="text-gray-600 dark:text-gray-400 text-xs">Balance = Ingresos - Gastos</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

