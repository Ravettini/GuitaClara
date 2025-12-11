import { useQuery } from '@tanstack/react-query'
import { analyticsService } from '../services/api'
import { Card } from './ui'

interface Alert {
  type: string
  severity: 'info' | 'warning' | 'danger'
  message: string
}

export default function AlertsCard() {
  const { data: alerts, isLoading, error } = useQuery({
    queryKey: ['analytics', 'alerts'],
    queryFn: () => analyticsService.getAlerts().then(r => r.data.data),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000,
  })

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'danger':
        return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
      case 'warning':
        return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
      case 'info':
        return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
      default:
        return 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'danger':
        return '🚨'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return '📌'
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Alertas
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Cargando alertas...
        </p>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Alertas
        </h3>
        <p className="text-sm text-red-600 dark:text-red-400">
          Error al cargar alertas
        </p>
      </Card>
    )
  }

  if (!alerts || alerts.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Alertas
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          No hay alertas por ahora 🎉
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Alertas
      </h3>
      <div className="space-y-3">
        {(alerts as Alert[]).map((alert, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${getSeverityStyles(alert.severity)}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">
                {getSeverityIcon(alert.severity)}
              </span>
              <p className="text-sm font-medium flex-1">
                {alert.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

