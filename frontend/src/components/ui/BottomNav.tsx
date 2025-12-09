import { Link, useLocation } from 'react-router-dom'

interface NavItem {
  path: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { path: '/app/summary', label: 'Resumen', icon: '📊' },
  { path: '/app/transactions', label: 'Transacciones', icon: '💸' },
  { path: '/app/investments', label: 'Inversiones', icon: '📈' },
  { path: '/app/plans', label: 'Planes', icon: '🎯' },
  { path: '/app/more', label: 'Más', icon: '⚙️' },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden z-40">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center flex-1 h-full
                transition-colors
                ${isActive 
                  ? 'text-primary dark:text-blue-400' 
                  : 'text-gray-500 dark:text-gray-400'
                }
              `}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

