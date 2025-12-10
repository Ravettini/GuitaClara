import { PageHeader, Card, Button } from '../components/ui'
import { useState } from 'react'

type FAQCategory = 'general' | 'transactions' | 'investments' | 'budgets' | 'goals' | 'export'

export default function Help() {
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory>('general')
  const [openQuestion, setOpenQuestion] = useState<string | null>(null)

  const faqs: Record<FAQCategory, Array<{ question: string; answer: string }>> = {
    general: [
      {
        question: '¿Qué es GuitaClara?',
        answer: 'GuitaClara es una aplicación web completa para gestionar tus finanzas personales. Te permite llevar un control detallado de tus ingresos, gastos, inversiones, presupuestos y metas financieras.',
      },
      {
        question: '¿Mis datos están seguros?',
        answer: 'Sí, todos tus datos están protegidos con autenticación segura. Cada usuario solo puede acceder a sus propios datos. Los datos se almacenan de forma encriptada y segura.',
      },
      {
        question: '¿Puedo usar la app en mi celular?',
        answer: 'Sí, la aplicación es completamente responsive y está optimizada para dispositivos móviles. Puedes acceder desde cualquier navegador en tu celular, tablet o computadora.',
      },
      {
        question: '¿Hay algún costo?',
        answer: 'Actualmente la aplicación es gratuita. Puedes usar todas las funcionalidades sin restricciones.',
      },
    ],
    transactions: [
      {
        question: '¿Cómo agrego un ingreso o gasto?',
        answer: 'Ve a la sección "Transacciones" y haz clic en el botón "+ Nuevo Movimiento". Selecciona si es un ingreso o gasto, completa el monto, fecha, categoría y otros detalles, luego guarda.',
      },
      {
        question: '¿Puedo editar o eliminar una transacción?',
        answer: 'Sí, haz clic en cualquier transacción de la lista para editarla, o usa el botón de eliminar. Los cambios se aplican inmediatamente.',
      },
      {
        question: '¿Qué monedas puedo usar?',
        answer: 'Puedes registrar transacciones en ARS (Pesos Argentinos) o USD (Dólares). El dashboard te permite ver todo en una sola moneda usando la cotización del dólar oficial.',
      },
      {
        question: '¿Cómo funcionan las categorías?',
        answer: 'Las categorías te ayudan a organizar tus transacciones. Puedes crear categorías personalizadas en "Configuración" con colores e iconos. Las categorías pueden ser para ingresos, gastos, o ambos.',
      },
    ],
    investments: [
      {
        question: '¿Cómo registro un plazo fijo?',
        answer: 'Ve a "Inversiones" → pestaña "Plazos Fijos" → "+ Nuevo". Completa el banco, monto, TNA (tasa nominal anual), fecha de inicio y plazo. La app calculará automáticamente el vencimiento y el interés.',
      },
      {
        question: '¿Cómo agrego una inversión al portfolio?',
        answer: 'Primero crea un instrumento (acciones, bonos, CEDEARs, etc.) en "Inversiones" → "Portfolio" → "Crear Instrumento". Luego agrega una posición con la cantidad y precio promedio de compra.',
      },
      {
        question: '¿Los precios se actualizan automáticamente?',
        answer: 'Sí, puedes hacer clic en "Actualizar Precios" para obtener las cotizaciones más recientes desde APIs externas. Si la API no está disponible, se usa el precio promedio de compra.',
      },
      {
        question: '¿Qué significa P&L?',
        answer: 'P&L significa "Profit & Loss" (Ganancia y Pérdida). Muestra cuánto has ganado o perdido respecto a tu precio de compra. Un valor positivo (verde) indica ganancia, negativo (rojo) indica pérdida.',
      },
    ],
    budgets: [
      {
        question: '¿Cómo creo un presupuesto?',
        answer: 'Ve a "Planes" → pestaña "Presupuestos" → "+ Nuevo Presupuesto". Selecciona la categoría, define el monto mensual y el período. Puedes activar la repetición automática para que se renueve cada mes.',
      },
      {
        question: '¿Cómo sé si me estoy pasando del presupuesto?',
        answer: 'La app te muestra una barra de progreso en cada presupuesto. Si está en amarillo (70-100%), estás cerca del límite. Si está en rojo (más de 100%), lo has excedido. También verás alertas en el dashboard.',
      },
      {
        question: '¿Puedo tener presupuestos para diferentes períodos?',
        answer: 'Sí, puedes crear presupuestos para cualquier período. Por defecto se muestran los del mes actual, pero puedes filtrar por mes pasado o crear presupuestos personalizados.',
      },
      {
        question: '¿Qué pasa si no tengo presupuesto para una categoría?',
        answer: 'No pasa nada, simplemente no verás el seguimiento de esa categoría. Puedes crear presupuestos cuando quieras empezar a controlarlos.',
      },
    ],
    goals: [
      {
        question: '¿Cómo creo una meta financiera?',
        answer: 'Ve a "Planes" → pestaña "Metas" → "+ Nueva Meta". Define el nombre, monto objetivo, fecha objetivo y moneda. La app calculará automáticamente cuánto deberías ahorrar por mes.',
      },
      {
        question: '¿Cómo se calcula el progreso de una meta?',
        answer: 'Por defecto, el progreso se calcula por saldo de cuenta asociada. También puedes usar el modo "TAG_SUM" para sumar transacciones etiquetadas específicamente para esa meta.',
      },
      {
        question: '¿Qué significa "meta en riesgo"?',
        answer: 'Una meta está en riesgo cuando el progreso actual no es suficiente para alcanzar el objetivo en la fecha establecida. La app te avisa para que puedas ajustar tu plan de ahorro.',
      },
      {
        question: '¿Puedo marcar una meta como completada?',
        answer: 'Sí, puedes editar una meta y cambiar su estado a "COMPLETED" cuando hayas alcanzado el objetivo, incluso antes de la fecha objetivo.',
      },
    ],
    export: [
      {
        question: '¿Cómo exporto mis datos?',
        answer: 'Ve a "Más" → "Exportar Datos". Selecciona el tipo de datos que quieres exportar (transacciones, inversiones, presupuestos, etc.), elige el formato (CSV o XLSX) y haz clic en exportar.',
      },
      {
        question: '¿Qué diferencia hay entre CSV y XLSX?',
        answer: 'CSV es un formato simple compatible con cualquier programa. XLSX es el formato de Excel que mantiene mejor el formato y permite múltiples hojas. Para exportar todo, usa XLSX.',
      },
      {
        question: '¿Puedo exportar solo ciertos períodos?',
        answer: 'Sí, puedes usar el filtro de fecha para exportar solo transacciones, presupuestos o plazos fijos de un rango específico.',
      },
      {
        question: '¿Los archivos exportados incluyen todos los detalles?',
        answer: 'Sí, los archivos incluyen toda la información relevante: fechas, montos, categorías, descripciones, y en el caso de inversiones, P&L y precios actuales.',
      },
    ],
  }

  const categories = [
    { id: 'general', label: 'General', icon: 'ℹ️' },
    { id: 'transactions', label: 'Transacciones', icon: '💸' },
    { id: 'investments', label: 'Inversiones', icon: '📈' },
    { id: 'budgets', label: 'Presupuestos', icon: '📊' },
    { id: 'goals', label: 'Metas', icon: '🎯' },
    { id: 'export', label: 'Exportar', icon: '📥' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ayuda"
        description="Preguntas frecuentes y guías de uso"
      />

      {/* Categorías */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id as FAQCategory)
              setOpenQuestion(null)
            }}
            className={`
              p-4 rounded-lg border-2 transition
              ${selectedCategory === cat.id
                ? 'border-primary bg-primary-soft dark:bg-blue-900/30'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary'
              }
            `}
          >
            <div className="text-2xl mb-2 text-gray-900 dark:text-gray-100" style={{ filter: 'none' }}>
              {cat.icon}
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {cat.label}
            </div>
          </button>
        ))}
      </div>

      {/* FAQs */}
      <div className="space-y-4">
        {faqs[selectedCategory].map((faq, index) => {
          const questionId = `${selectedCategory}-${index}`
          const isOpen = openQuestion === questionId
          
          return (
            <Card key={questionId} className="p-0 overflow-hidden">
              <button
                onClick={() => setOpenQuestion(isOpen ? null : questionId)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white pr-4">
                  {faq.question}
                </h3>
                <span className="text-gray-400 text-xl flex-shrink-0">
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-0">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Glosario */}
      <Card className="p-6">
        <h2 className="text-h2 font-semibold mb-4 text-gray-900 dark:text-white">
          📖 Glosario
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">TNA</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tasa Nominal Anual. Es el porcentaje de interés que te paga un plazo fijo por año.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">P&L</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Profit & Loss (Ganancia y Pérdida). Indica cuánto has ganado o perdido en una inversión.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Patrimonio Neto</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              La suma de todos tus activos (dinero, inversiones) menos tus pasivos (deudas).
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Tasa de Ahorro</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Porcentaje de tus ingresos que ahorras. Se calcula como (Ingresos - Gastos) / Ingresos × 100.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">CEDEAR</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Certificado de Depósito Argentino. Permite invertir en acciones extranjeras desde Argentina.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Balance</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Diferencia entre tus ingresos totales y gastos totales en un período determinado.
            </p>
          </div>
        </div>
      </Card>

      {/* Contacto */}
      <Card className="p-6 bg-primary-soft dark:bg-blue-900/20 border border-primary dark:border-blue-800">
        <h2 className="text-h2 font-semibold mb-2 text-gray-900 dark:text-white">
          💬 ¿Necesitas más ayuda?
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Si no encuentras la respuesta que buscas, puedes revisar la documentación completa o contactar al soporte.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">
            📧 Contactar Soporte
          </Button>
          <Button variant="secondary">
            📚 Ver Documentación
          </Button>
        </div>
      </Card>
    </div>
  )
}

