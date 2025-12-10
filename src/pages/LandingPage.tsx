import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            💰 GuitaClara
          </h1>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-primary text-gray-900 rounded-lg hover:bg-primary-dark transition font-medium shadow-sm"
            >
              Registrarse
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          GuitaClara
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Cuidar tu plata, presupuestar y registrar todo en un solo lugar.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/register"
            className="px-8 py-3 bg-primary text-gray-900 rounded-lg hover:bg-primary-dark transition text-lg font-semibold shadow-sm"
          >
            Empezar ahora
          </Link>
          <Link
            to="/login"
            className="px-8 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-50 transition text-lg font-semibold border-2 border-indigo-600"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Características principales
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">📊</div>
            <h4 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Dashboard de Analíticas
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              Visualiza tus ingresos, gastos y flujo de caja con gráficos interactivos
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">💵</div>
            <h4 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Gestión de Gastos
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              Registra y categoriza tus gastos e ingresos de forma rápida y sencilla
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-4">📈</div>
            <h4 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Seguimiento de Inversiones
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              Gestiona plazos fijos, acciones, CEDEARs y más. Calcula tu P&L en tiempo real
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-20 bg-white dark:bg-gray-800 rounded-lg my-20">
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Cómo funciona
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">1</span>
            </div>
            <h4 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Regístrate
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              Crea tu cuenta de forma gratuita en menos de un minuto
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">2</span>
            </div>
            <h4 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Registra tus movimientos
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              Carga tus ingresos, gastos e inversiones de forma rápida
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">3</span>
            </div>
            <h4 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Analiza y mejora
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              Revisa tu dashboard y toma decisiones informadas sobre tus finanzas
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4 md:mb-0">
            © 2025 DESARROLLADO POR IGNACIO RAVETTINI
          </p>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/register"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

