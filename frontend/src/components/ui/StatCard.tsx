interface StatCardProps {
  label: string
  value: string
  helper?: string
  trend?: {
    label: string
    direction: 'up' | 'down' | 'neutral'
  }
  icon?: string
  className?: string
}

export function StatCard({ label, value, helper, trend, icon, className = '' }: StatCardProps) {
  return (
    <div className={`rounded-lg bg-white dark:bg-gray-800 shadow-card p-4 flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {label}
        </span>
        {icon && <span className="text-xl text-gray-900 dark:text-gray-100" style={{ filter: 'none' }}>{icon}</span>}
      </div>
      <span className="text-xl font-semibold text-gray-900 dark:text-white">
        {value}
      </span>
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        {helper && <span>{helper}</span>}
        {trend && (
          <span
            className={
              trend.direction === 'up'
                ? 'text-success dark:text-green-400'
                : trend.direction === 'down'
                ? 'text-danger dark:text-red-400'
                : 'text-gray-400 dark:text-gray-500'
            }
          >
            {trend.label}
          </span>
        )}
      </div>
    </div>
  )
}

