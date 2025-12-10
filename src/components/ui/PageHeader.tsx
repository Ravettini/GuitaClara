import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  filters?: ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, filters, className = '' }: PageHeaderProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h1 className="text-h1 font-semibold text-gray-900 dark:text-white mb-1">
            {title}
          </h1>
          {description && (
            <p className="text-body-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      {filters && (
        <div className="flex flex-wrap items-center gap-2">
          {filters}
        </div>
      )}
    </div>
  )
}

