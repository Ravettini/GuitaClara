interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    success: 'bg-success-soft text-success-dark dark:bg-green-900 dark:text-green-300',
    danger: 'bg-danger-soft text-danger-dark dark:bg-red-900 dark:text-red-300',
    warning: 'bg-warning-soft text-warning-dark dark:bg-yellow-900 dark:text-yellow-300',
    info: 'bg-info-soft text-info-dark dark:bg-indigo-900 dark:text-indigo-300',
  }

  const sizes = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
  }

  return (
    <span
      className={`
        inline-flex items-center rounded-md font-medium
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}

