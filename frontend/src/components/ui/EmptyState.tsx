interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="text-6xl mb-4 text-gray-900 dark:text-gray-100" style={{ filter: 'none' }}>{icon}</div>}
      <h3 className="text-h3 font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-body-sm text-gray-600 dark:text-gray-400 max-w-md mb-6">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-primary text-gray-900 rounded-lg hover:bg-primary-dark transition font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

