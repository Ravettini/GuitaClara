import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// Componente de acordeón para FAQ
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 text-left flex items-center justify-between hover:text-primary transition-colors"
      >
        <span className="font-semibold text-gray-900 dark:text-white pr-8">
          {question}
        </span>
        <span className={`text-2xl transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="pb-4 text-gray-600 dark:text-gray-300 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  )
}

// Componente de tarjeta de característica
function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:scale-105 border border-gray-100 dark:border-gray-700">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
        {description}
      </p>
    </div>
  )
}

// Componente de tarjeta de precio
function PricingCard({ 
  name, 
  price, 
  period, 
  features, 
  cta, 
  ctaLink, 
  popular = false 
}: { 
  name: string
  price: string
  period: string
  features: string[]
  cta: string
  ctaLink: string
  popular?: boolean
}) {
  return (
    <div className={`relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-card border-2 transition-all duration-300 hover:shadow-card-hover ${
      popular 
        ? 'border-primary scale-105 shadow-lg' 
        : 'border-gray-200 dark:border-gray-700'
    }`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
          Más popular
        </div>
      )}
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {name}
      </h3>
      <div className="mb-6">
        <span className="text-4xl font-bold text-gray-900 dark:text-white">{price}</span>
        <span className="text-gray-600 dark:text-gray-400 ml-2">{period}</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <span className="text-success mr-2 text-xl">✓</span>
            <span className="text-gray-600 dark:text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        to={ctaLink}
        className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-all ${
          popular
            ? 'bg-primary text-white hover:bg-primary-dark shadow-md'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
      >
        {cta}
      </Link>
    </div>
  )
}

// Componente de testimonio
function TestimonialCard({ name, role, text }: { name: string; role: string; text: string }) {
  const initial = name.charAt(0).toUpperCase()
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500']
  const color = colors[name.length % colors.length]

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-card border border-gray-100 dark:border-gray-700">
      <div className="flex items-center mb-4">
        <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-white font-bold text-lg mr-3`}>
          {initial}
        </div>
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">{name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{role}</div>
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-300 italic leading-relaxed">
        "{text}"
      </p>
    </div>
  )
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setMobileMenuOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6FB] dark:bg-gray-900">
      {/* Navbar fijo */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                GuitaClara
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection('features')}
                className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
              >
                Producto
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
              >
                Funcionalidades
              </button>
              <button
                onClick={() => scrollToSection('security')}
                className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
              >
                Seguridad
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
              >
                FAQ
              </button>
            </div>

            {/* Desktop CTAs */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-all font-semibold shadow-md hover:shadow-lg"
              >
                Registrarse
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 dark:text-gray-300"
            >
              <span className="text-2xl">☰</span>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
              <button
                onClick={() => scrollToSection('features')}
                className="block w-full text-left py-2 text-gray-700 dark:text-gray-300 hover:text-primary"
              >
                Producto
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="block w-full text-left py-2 text-gray-700 dark:text-gray-300 hover:text-primary"
              >
                Funcionalidades
              </button>
              <button
                onClick={() => scrollToSection('security')}
                className="block w-full text-left py-2 text-gray-700 dark:text-gray-300 hover:text-primary"
              >
                Seguridad
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="block w-full text-left py-2 text-gray-700 dark:text-gray-300 hover:text-primary"
              >
                FAQ
              </button>
              <div className="pt-4 space-y-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                <Link
                  to="/login"
                  className="block w-full text-center py-2 text-gray-700 dark:text-gray-300 hover:text-primary"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="block w-full text-center bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition-all font-semibold"
                >
                  Registrarse
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Text */}
              <div className="text-center lg:text-left">
                <div className="inline-block mb-4 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                  Controlá tu dinero sin hojas de cálculo
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  Tené tus finanzas claras, sin complicarte la vida.
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  GuitaClara te ayuda a registrar tus gastos, seguir tus inversiones y entender a dónde va tu plata, todo en un solo lugar.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <Link
                    to="/register"
                    className="bg-primary text-white px-8 py-4 rounded-lg hover:bg-primary-dark transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Empezar gratis
                  </Link>
                  <Link
                    to="/login"
                    className="bg-white dark:bg-gray-800 text-primary border-2 border-primary px-8 py-4 rounded-lg hover:bg-primary/5 transition-all font-semibold text-lg"
                  >
                    Ver demo
                  </Link>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Sin tarjeta de crédito · Podés cancelar cuando quieras
                </p>
              </div>

              {/* Right: Mockup */}
              <div className="relative">
                <div className="relative bg-gradient-to-br from-primary via-purple-500 to-pink-500 rounded-3xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
                    {/* Mock Dashboard */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Resumen del mes
                        </h3>
                        <span className="text-2xl">📊</span>
                      </div>
                      
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ingresos</div>
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">$125.000</div>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Gastos</div>
                          <div className="text-2xl font-bold text-red-600 dark:text-red-400">$87.500</div>
                        </div>
                      </div>

                      {/* Chart Placeholder */}
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl h-32 flex items-end justify-between gap-2">
                        {[40, 60, 45, 70, 55, 80, 65].map((height, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-primary rounded-t-lg"
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Balance</div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">+$37.500</div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Decorative blur */}
                <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-card">
                <div className="text-2xl font-bold text-primary mb-1">+2.000</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">usuarios en Latam</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-card">
                <div className="text-2xl font-bold text-primary mb-1">🔒</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Cifrado y seguridad bancaria</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-card">
                <div className="text-2xl font-bold text-primary mb-1">💼</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Ideal para sueldos, freelance e inversiones</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Todo tu dinero, en un solo lugar.
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                GuitaClara combina control de gastos, presupuesto e inversiones para que tengas una foto completa de tus finanzas.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon="📊"
                title="Dashboard de Analíticas"
                description="Visualizá ingresos, gastos y flujo de caja con gráficos claros y fáciles de entender."
              />
              <FeatureCard
                icon="💸"
                title="Gestión de Gastos e Ingresos"
                description="Registrá y categorizá tus movimientos en segundos. Detectá en qué se te va la plata."
              />
              <FeatureCard
                icon="📈"
                title="Seguimiento de Inversiones"
                description="Cargá tus plazos fijos, acciones, CEDEARs y más. Mirá tu P&L en tiempo real."
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Cómo funciona GuitaClara
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Empezar lleva menos de 2 minutos.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connection Line (Desktop) */}
              <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary to-purple-500" />
              
              {[
                {
                  step: '1',
                  title: 'Creás tu cuenta',
                  description: 'Registrate gratis con tu mail y configurá tu moneda y objetivos.'
                },
                {
                  step: '2',
                  title: 'Cargás tus movimientos',
                  description: 'Agregá tus ingresos, gastos e inversiones de forma rápida o importalos desde un archivo.'
                },
                {
                  step: '3',
                  title: 'Mirás tu dashboard',
                  description: 'Revisá tu resumen, detectá fugas de dinero y tomá mejores decisiones.'
                }
              ].map((item, index) => (
                <div key={index} className="text-center relative">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 shadow-lg">
                    <span className="text-3xl font-bold text-white">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  Pensado para la vida real, no solo para Excel.
                </h2>
                <div className="space-y-4">
                  {[
                    'Tenés todo centralizado en una sola app.',
                    'Entendés tus gastos fijos vs variables.',
                    'Seguís objetivos de ahorro mes a mes.',
                    'Ves el rendimiento real de tus inversiones.'
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start">
                      <span className="text-success text-2xl mr-3">✓</span>
                      <span className="text-lg text-gray-700 dark:text-gray-300">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 p-8 rounded-2xl border border-primary/20">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Resumen mensual
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Saldo inicial</span>
                    <span className="font-semibold text-gray-900 dark:text-white">$50.000</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Ingresos</span>
                    <span className="font-semibold text-success">+$125.000</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Gastos</span>
                    <span className="font-semibold text-danger">-$87.500</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Ahorro</span>
                    <span className="text-2xl font-bold text-primary">$87.500</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Screenshot Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-6xl mx-auto text-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-200 dark:border-gray-700">
              {/* Mock Browser Window */}
              <div className="bg-gray-100 dark:bg-gray-700 rounded-t-lg p-3 flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <div className="flex-1 text-center text-sm text-gray-500 dark:text-gray-400">
                  guitaclara.app/dashboard
                </div>
              </div>
              
              {/* Mock Dashboard Content */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-primary/10 p-6 rounded-xl">
                  <div className="text-3xl mb-2">📊</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">$175.000</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Balance total</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl">
                  <div className="text-3xl mb-2">💰</div>
                  <div className="text-2xl font-bold text-success mb-1">+$45.000</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Este mes</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl">
                  <div className="text-3xl mb-2">📈</div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">12.5%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Rendimiento</div>
                </div>
              </div>
            </div>
            <p className="mt-8 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Modo claro y simple. Diseñado para que puedas ver todo de un vistazo sin perderte en números.
            </p>
          </div>
        </section>

        {/* Pricing Section - Oculto temporalmente */}
        {/* <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Planes simples, sin sorpresas.
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Empezá gratis y actualizá cuando lo necesites.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <PricingCard
                name="Gratis"
                price="$0"
                period="/ mes"
                features={[
                  'Hasta 3 cuentas',
                  'Registro manual de ingresos y gastos',
                  'Dashboard básico',
                  'Soporte por email'
                ]}
                cta="Empezar gratis"
                ctaLink="/register"
              />
              <PricingCard
                name="Pro"
                price="$9"
                period="/ mes"
                features={[
                  'Todo lo del plan Gratis',
                  'Presupuestos por categoría',
                  'Reportes avanzados',
                  'Exportación CSV / Excel',
                  'Soporte prioritario'
                ]}
                cta="Probar 14 días"
                ctaLink="/register"
                popular={true}
              />
              <PricingCard
                name="Premium"
                price="$19"
                period="/ mes"
                features={[
                  'Todo lo del plan Pro',
                  'Múltiples perfiles / cuentas',
                  'API de integración',
                  'Soporte 24/7',
                  'Análisis personalizado'
                ]}
                cta="Hablar con nosotros"
                ctaLink="/register"
              />
            </div>
          </div>
        </section> */}

        {/* Testimonials */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Lo que dicen quienes usan GuitaClara
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <TestimonialCard
                name="María González"
                role="Analista de sistemas, Buenos Aires"
                text="Antes llevaba todo en un Excel caótico. Con GuitaClara sé exactamente cuánto puedo gastar sin culpa."
              />
              <TestimonialCard
                name="Carlos Rodríguez"
                role="Freelancer, Córdoba"
                text="Como trabajo por proyectos, necesitaba ver mis ingresos variables. Ahora tengo todo claro y puedo planificar mejor."
              />
              <TestimonialCard
                name="Ana Martínez"
                role="Emprendedora, Rosario"
                text="La parte de inversiones es genial. Puedo ver mis plazos fijos y acciones en un solo lugar. Totalmente recomendado."
              />
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Tu información, siempre protegida.
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🔒',
                  title: 'Cifrado y seguridad',
                  description: 'Usamos buenas prácticas de seguridad para cuidar tus datos.'
                },
                {
                  icon: '🎛️',
                  title: 'Control total',
                  description: 'Vos decidís qué cargás y qué eliminás. Sin conexiones forzadas a bancos.'
                },
                {
                  icon: '🛡️',
                  title: 'Privacidad',
                  description: 'No vendemos tus datos. Punto.'
                }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-12">
              Tus datos están protegidos con encriptación de nivel bancario. Cumplimos con las mejores prácticas de seguridad y privacidad.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Preguntas frecuentes
              </h2>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-8 border border-gray-200 dark:border-gray-700">
              <FaqItem
                question="¿GuitaClara es realmente gratis?"
                answer="Sí, el plan Gratis te permite usar todas las funciones básicas sin costo. Podés registrar tus ingresos, gastos e inversiones, y ver tu dashboard. Si necesitás funciones avanzadas como presupuestos o exportación, podés actualizar a Pro."
              />
              <FaqItem
                question="¿Necesito conectar mi cuenta bancaria?"
                answer="No, GuitaClara no requiere conexión a bancos. Vos cargás manualmente tus movimientos o podés importarlos desde un archivo. Esto te da control total sobre tus datos y mayor privacidad."
              />
              <FaqItem
                question="¿Puedo usarla desde el celular?"
                answer="Sí, GuitaClara es totalmente responsive y funciona perfectamente desde cualquier dispositivo. Podés acceder desde tu celular, tablet o computadora."
              />
              <FaqItem
                question="¿Puedo exportar mis datos?"
                answer="Sí, en los planes Pro y Premium podés exportar tus datos en formato CSV o Excel. También podés eliminar tu cuenta y todos tus datos cuando quieras."
              />
              <FaqItem
                question="¿Qué pasa si dejo de pagar el plan Pro?"
                answer="Si cancelás tu suscripción Pro, tu cuenta vuelve automáticamente al plan Gratis. No perdés tus datos, solo algunas funciones avanzadas. Podés reactivar Pro cuando quieras."
              />
              <FaqItem
                question="¿Tienen soporte?"
                answer="Sí, respondemos todas las consultas por email. Los usuarios Pro y Premium tienen soporte prioritario. También tenemos una sección de ayuda con guías y tutoriales."
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary via-purple-600 to-pink-600">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Empezá hoy a ordenar tu plata.
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Te lleva menos de 2 minutos crear tu cuenta y ver tu primer dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-primary px-8 py-4 rounded-lg hover:bg-gray-100 transition-all font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                Crear mi cuenta gratis
              </Link>
              <Link
                to="/login"
                className="bg-white/10 text-white border-2 border-white px-8 py-4 rounded-lg hover:bg-white/20 transition-all font-semibold text-lg"
              >
                Ver demo primero
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">💰</span>
                <span className="text-xl font-bold text-white">GuitaClara</span>
              </div>
              <p className="text-sm">
                Controlá tus finanzas personales de forma simple y visual.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Características</button></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Iniciar sesión</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => scrollToSection('faq')} className="hover:text-white transition-colors">FAQ</button></li>
                <li><button onClick={() => scrollToSection('security')} className="hover:text-white transition-colors">Seguridad</button></li>
                <li><Link to="/app/help" className="hover:text-white transition-colors">Ayuda</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Términos de servicio</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2025 GuitaClara. Desarrollado por Ignacio Ravettini.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
