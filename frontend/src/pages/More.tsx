import { Link } from 'react-router-dom'
import { PageHeader, Card } from '../components/ui'
import { useAuthStore } from '../store/authStore'

export default function More() {
  const { user, logout } = useAuthStore()

  const menuItems = [
    { path: '/app/settings', label: 'Configuración', icon: '⚙️', description: 'Gestiona tus categorías' },
    { path: '/app/export', label: 'Exportar Datos', icon: '📥', description: 'Descarga tus transacciones' },
    { path: '/app/help', label: 'Ayuda', icon: '❓', description: 'Preguntas frecuentes' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Más"
        description="Configuración y herramientas adicionales"
      />

      <div className="space-y-4">
        {menuItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <Card hover className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{item.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {item.label}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {user?.email}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sesión activa
            </p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-danger text-gray-900 rounded-lg hover:bg-danger-dark transition font-medium"
          >
            Cerrar Sesión
          </button>
        </div>
      </Card>
    </div>
  )
}

