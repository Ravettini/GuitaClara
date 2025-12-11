import { useQuery } from '@tanstack/react-query'
import { adminService } from '../services/api'
import { Card } from '../components/ui'
import { formatCurrency } from '../utils/format'

interface AdminStats {
  totalUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number
  activeUsersLast30Days: number
  totalIncomes: number
  totalExpenses: number
  totalFixedTerms: number
  totalInvestments: number
  usersByMonth: Array<{
    month: string
    count: number
  }>
  recentUsers: Array<{
    id: string
    email: string
    createdAt: string
  }>
}

export default function AdminDashboard() {
  const { data: stats, isLoading, isError, error } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await adminService.getStats()
      return response.data.data
    },
    refetchInterval: 60000, // Refrescar cada minuto
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard de Administración
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    const errorMessage =
      (error as any)?.response?.status === 403
        ? 'Acceso denegado. Solo superadmin puede acceder a esta página.'
        : 'Error al cargar las estadísticas. Por favor, intentá de nuevo.'

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard de Administración
        </h1>
        <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <p className="text-red-800 dark:text-red-200">{errorMessage}</p>
        </Card>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          🛡️ Dashboard de Administración
        </h1>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total de Usuarios
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalUsers}
              </p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Nuevos Hoy
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.newUsersToday}
              </p>
            </div>
            <div className="text-4xl">✨</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Esta Semana
              </p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.newUsersThisWeek}
              </p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Este Mes
              </p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.newUsersThisMonth}
              </p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Activos (30 días)
              </p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {stats.activeUsersLast30Days}
              </p>
            </div>
            <div className="text-4xl">🔥</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Ingresos Totales
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalIncomes.toLocaleString()}
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Gastos Totales
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className="text-4xl">💸</div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Plazos Fijos
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalFixedTerms}
              </p>
            </div>
            <div className="text-4xl">🏦</div>
          </div>
        </Card>
      </div>

      {/* Gráfico de usuarios por mes */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Usuarios Registrados por Mes (Últimos 12 meses)
        </h2>
        <div className="space-y-3">
          {stats.usersByMonth.map((item, index) => {
            const maxCount = Math.max(...stats.usersByMonth.map((m) => m.count), 1)
            const percentage = (item.count / maxCount) * 100

            return (
              <div key={index} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
                  {item.month}
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="bg-primary dark:bg-blue-500 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  >
                    {item.count > 0 && (
                      <span className="text-xs font-semibold text-white">
                        {item.count}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-12 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  {item.count}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Usuarios recientes */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Usuarios Recientes
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Email
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Fecha de Registro
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {user.email}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString('es-AR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

