import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { BottomNav, FAB } from '../components/ui'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/app/summary', label: 'Resumen', icon: '📊' },
    { path: '/app/transactions', label: 'Transacciones', icon: '💸' },
    { path: '/app/investments', label: 'Inversiones', icon: '📈' },
    { path: '/app/plans', label: 'Planes', icon: '🎯' },
    { path: '/app/calendar', label: 'Calendario', icon: '📅' },
    { path: '/app/assistant', label: 'Asistente', icon: '🤖' },
    { path: '/app/admin', label: 'Admin', icon: '🛡️' },
    { path: '/app/more', label: 'Más', icon: '⚙️' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 w-full overflow-hidden flex flex-col">
      {/* Mobile header */}
      <header className="lg:hidden bg-white dark:bg-gray-800 shadow-sm px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
          💰 GuitaClara
        </h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <span className="text-2xl">☰</span>
        </button>
      </header>

      <div className="flex w-full relative flex-1 min-h-0 overflow-hidden">
        {/* Overlay para mobile - fuera del sidebar */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 flex-shrink-0 bg-white dark:bg-gray-800 shadow-lg lg:shadow-none transition-transform duration-300 h-full`}
        >
          <div className="h-full flex flex-col bg-white dark:bg-gray-800">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800">
              <h2 className="text-xl font-bold text-primary dark:text-blue-400">
                💰 GuitaClara
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                {user?.email?.split('@')[0] || 'Usuario'}
              </p>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto bg-white dark:bg-gray-800">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive(item.path)
                      ? 'bg-primary-soft dark:bg-blue-900 text-primary dark:text-blue-300 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                <span>🚪</span>
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-0 pb-20 md:pb-0 w-full flex flex-col min-h-0 overflow-y-auto">
          <div className="flex-1 flex flex-col p-4 lg:p-6 lg:max-w-7xl lg:mx-auto w-full min-h-0">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNav />
      <FAB
        actions={[
          { id: 'expense', label: 'Nuevo Gasto', icon: '💸' },
          { id: 'income', label: 'Nuevo Ingreso', icon: '💰' },
          { id: 'fixed-term', label: 'Nuevo Plazo Fijo', icon: '🏦' },
          { id: 'position', label: 'Nueva Posición', icon: '📈' },
        ]}
        onAction={(action) => {
          switch (action) {
            case 'expense':
              navigate('/app/transactions?action=create&type=expense')
              break
            case 'income':
              navigate('/app/transactions?action=create&type=income')
              break
            case 'fixed-term':
              navigate('/app/investments?tab=fixedTerms&action=create')
              break
            case 'position':
              navigate('/app/investments?tab=portfolio&action=create')
              break
          }
        }}
      />
    </div>
  )
}

