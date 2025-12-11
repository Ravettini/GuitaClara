import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { budgetService, goalService, categoryService } from '../services/api'
import { formatDate, formatCurrency } from '../utils/format'
import { PageHeader, EmptyState, Button, Badge, StatCard, Card } from '../components/ui'
import DateInput from '../components/DateInput'
import { useToast } from '../components/ui/Toast'

type TabType = 'budgets' | 'goals'

export default function Plans() {
  const [activeTab, setActiveTab] = useState<TabType>('budgets')
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState<any>(null)
  const [editingGoal, setEditingGoal] = useState<any>(null)
  const [periodFilter, setPeriodFilter] = useState<'current' | 'last' | 'custom'>('current')
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Calcular fechas del período
  const getPeriodDates = () => {
    const now = new Date()
    let start: Date, end: Date

    switch (periodFilter) {
      case 'current':
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case 'last':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        end = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      start,
      end,
    }
  }

  const { startDate, endDate } = getPeriodDates()

  // Queries
  const { data: budgetSummary } = useQuery({
    queryKey: ['budgets', 'summary', startDate, endDate],
    queryFn: () => budgetService.getSummary(startDate, endDate).then((r) => r.data.data),
    enabled: activeTab === 'budgets',
    staleTime: 60000,
  })

  const { data: budgets } = useQuery({
    queryKey: ['budgets', startDate, endDate],
    queryFn: () => budgetService.getAll(startDate, endDate).then((r) => r.data.data),
    enabled: activeTab === 'budgets',
    staleTime: 60000,
  })

  const { data: goalSummary } = useQuery({
    queryKey: ['goals', 'summary'],
    queryFn: () => goalService.getSummary().then((r) => r.data.data),
    enabled: activeTab === 'goals',
    staleTime: 60000,
  })

  const { data: goals } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalService.getAll().then((r) => r.data.data),
    enabled: activeTab === 'goals',
    staleTime: 60000,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories', 'EXPENSE'],
    queryFn: () => categoryService.getAll('EXPENSE').then((r) => r.data.data),
    staleTime: 10 * 60 * 1000,
  })

  // Mutations
  const createBudgetMutation = useMutation({
    mutationFn: budgetService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      setShowBudgetForm(false)
      setEditingBudget(null)
      toast({ message: 'Presupuesto creado', type: 'success' })
    },
    onError: () => {
      toast({ message: 'Error al crear presupuesto', type: 'error' })
    },
  })

  const updateBudgetMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => budgetService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      setShowBudgetForm(false)
      setEditingBudget(null)
      toast({ message: 'Presupuesto actualizado', type: 'success' })
    },
    onError: () => {
      toast({ message: 'Error al actualizar presupuesto', type: 'error' })
    },
  })

  const deleteBudgetMutation = useMutation({
    mutationFn: budgetService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast({ message: 'Presupuesto eliminado', type: 'success' })
    },
    onError: () => {
      toast({ message: 'Error al eliminar presupuesto', type: 'error' })
    },
  })

  const createGoalMutation = useMutation({
    mutationFn: goalService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      setShowGoalForm(false)
      setEditingGoal(null)
      toast({ message: 'Meta creada', type: 'success' })
    },
    onError: () => {
      toast({ message: 'Error al crear meta', type: 'error' })
    },
  })

  const updateGoalMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => goalService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      setShowGoalForm(false)
      setEditingGoal(null)
      toast({ message: 'Meta actualizada', type: 'success' })
    },
    onError: () => {
      toast({ message: 'Error al actualizar meta', type: 'error' })
    },
  })

  const deleteGoalMutation = useMutation({
    mutationFn: goalService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      toast({ message: 'Meta eliminada', type: 'success' })
    },
    onError: () => {
      toast({ message: 'Error al eliminar meta', type: 'error' })
    },
  })

  const handleBudgetSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    let periodStartValue = formData.get('periodStart') as string
    let periodEndValue = formData.get('periodEnd') as string

    if (!periodStartValue || !periodEndValue) {
      const { start, end } = getPeriodDates()
      periodStartValue = start.toISOString()
      periodEndValue = end.toISOString()
    }

    const data = {
      categoryId: formData.get('categoryId') as string,
      amount: parseFloat(formData.get('amount') as string),
      currency: formData.get('currency') as string || 'ARS',
      periodStart: new Date(periodStartValue).toISOString(),
      periodEnd: new Date(periodEndValue).toISOString(),
      repeat: formData.get('repeat') === 'on',
      repeatUntil: formData.get('repeatUntil') ? new Date(formData.get('repeatUntil') as string).toISOString() : null,
      notes: formData.get('notes') as string || undefined,
    }

    if (editingBudget) {
      updateBudgetMutation.mutate({ id: editingBudget.id, data })
    } else {
      createBudgetMutation.mutate(data as any)
    }
  }

  const handleGoalSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const data = {
      name: formData.get('name') as string,
      targetAmount: parseFloat(formData.get('targetAmount') as string),
      currency: formData.get('currency') as string || 'ARS',
      targetDate: new Date(formData.get('targetDate') as string).toISOString(),
      calculationMode: formData.get('calculationMode') as string || 'ACCOUNT_BALANCE',
      tagKey: formData.get('tagKey') as string || null,
      notes: formData.get('notes') as string || undefined,
    }

    if (editingGoal) {
      updateGoalMutation.mutate({ id: editingGoal.id, data })
    } else {
      createGoalMutation.mutate(data as any)
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage < 70) return 'success'
    if (percentage < 100) return 'warning'
    return 'danger'
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planes"
        description="Dale una dirección clara a tu dinero"
        actions={
          activeTab === 'budgets' ? (
            <Button
              onClick={() => {
                setEditingBudget(null)
                setShowBudgetForm(true)
              }}
            >
              + Nuevo Presupuesto
            </Button>
          ) : (
            <Button
              onClick={() => {
                setEditingGoal(null)
                setShowGoalForm(true)
              }}
            >
              + Nueva Meta
            </Button>
          )
        }
      />

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('budgets')}
            className={`
              px-4 py-2 font-medium border-b-2 transition
              ${activeTab === 'budgets'
                ? 'border-primary text-primary dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }
            `}
          >
            Presupuestos
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`
              px-4 py-2 font-medium border-b-2 transition
              ${activeTab === 'goals'
                ? 'border-primary text-primary dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }
            `}
          >
            Metas
          </button>
        </div>
      </div>

      {/* Presupuestos Tab */}
      {activeTab === 'budgets' && (
        <div className="space-y-6">
          {/* Filtro de período */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-card border border-gray-200 dark:border-gray-700">
            {[
              { id: 'current', label: 'Este mes' },
              { id: 'last', label: 'Mes pasado' },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setPeriodFilter(option.id as any)}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium transition
                  ${periodFilter === option.id
                    ? 'bg-primary text-gray-900 shadow-sm'
                    : 'text-gray-900 dark:text-gray-200 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Resumen de Presupuestos */}
          {budgetSummary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                label="Presupuesto Total"
                value={formatCurrency(budgetSummary.totalBudget, 'ARS')}
                icon="💰"
              />
              <StatCard
                label="Gastado"
                value={formatCurrency(budgetSummary.totalSpent, 'ARS')}
                trend={{
                  label: `${budgetSummary.overallPercentage.toFixed(1)}% usado`,
                  direction: budgetSummary.overallPercentage >= 100 ? 'down' : budgetSummary.overallPercentage >= 70 ? 'neutral' : 'up',
                }}
                icon="📊"
              />
              <StatCard
                label="Disponible"
                value={formatCurrency(budgetSummary.totalRemaining, 'ARS')}
                trend={{
                  label: budgetSummary.categoriesExceeded > 0
                    ? `${budgetSummary.categoriesExceeded} excedidas`
                    : budgetSummary.categoriesNearLimit > 0
                    ? `${budgetSummary.categoriesNearLimit} cerca del límite`
                    : 'Todo bien',
                  direction: budgetSummary.categoriesExceeded > 0 ? 'down' : budgetSummary.categoriesNearLimit > 0 ? 'neutral' : 'up',
                }}
                icon="✅"
              />
            </div>
          )}

          {/* Alertas */}
          {budgetSummary && (budgetSummary.categoriesNearLimit > 0 || budgetSummary.categoriesExceeded > 0) && (
            <div className={`
              p-4 rounded-lg border
              ${budgetSummary.categoriesExceeded > 0
                ? 'bg-danger-soft dark:bg-red-900 border-danger dark:border-red-700'
                : 'bg-warning-soft dark:bg-yellow-900 border-warning dark:border-yellow-700'
              }
            `}>
              <p className="font-medium text-gray-900 dark:text-white">
                {budgetSummary.categoriesExceeded > 0
                  ? `Tenés ${budgetSummary.categoriesExceeded} categoría${budgetSummary.categoriesExceeded > 1 ? 's' : ''} que excedieron su presupuesto.`
                  : `Tenés ${budgetSummary.categoriesNearLimit} categoría${budgetSummary.categoriesNearLimit > 1 ? 's' : ''} cerca de su límite de presupuesto.`
                }
              </p>
            </div>
          )}

          {/* Lista de Presupuestos */}
          {budgets && budgets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgets.map((budget: any) => {
                const progressColor = getProgressColor(budget.percentage)
                return (
                  <Card key={budget.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                          style={{ backgroundColor: budget.category?.color || '#3B82F6', opacity: 0.1 }}
                        >
                          <span className="text-gray-900 dark:text-gray-100" style={{ filter: 'none' }}>
                            {budget.category?.icon || '📁'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {budget.category?.name || 'Sin categoría'}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(budget.periodStart)} - {formatDate(budget.periodEnd)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingBudget(budget)
                            setShowBudgetForm(true)
                          }}
                          className="text-primary dark:text-blue-400 hover:underline text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('¿Eliminar este presupuesto?')) {
                              deleteBudgetMutation.mutate(budget.id)
                            }
                          }}
                          className="text-danger dark:text-red-400 hover:underline text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Presupuesto:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(Number(budget.amount), budget.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Gastado:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(budget.spent, budget.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Disponible:</span>
                        <span className={`font-medium ${
                          budget.remaining < 0 ? 'text-danger dark:text-red-400' : 'text-success dark:text-green-400'
                        }`}>
                          {formatCurrency(budget.remaining, budget.currency)}
                        </span>
                      </div>

                      {/* Barra de progreso */}
                      <div className="mt-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {budget.percentage.toFixed(1)}% usado
                          </span>
                          {budget.percentage >= 100 && (
                            <Badge variant="danger" size="sm">Excedido</Badge>
                          )}
                          {budget.percentage >= 70 && budget.percentage < 100 && (
                            <Badge variant="warning" size="sm">Cerca del límite</Badge>
                          )}
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className={`
                              h-2 rounded-full transition-all
                              ${progressColor === 'success' ? 'bg-green-500' : ''}
                              ${progressColor === 'warning' ? 'bg-yellow-500' : ''}
                              ${progressColor === 'danger' ? 'bg-red-500' : ''}
                            `}
                            style={{ width: `${Math.min(100, budget.percentage)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon="📊"
              title="Empecemos por tu primer presupuesto"
              description="Decidí cuánto querés gastar en cada categoría este mes y la app te avisa si te estás pasando."
              action={{
                label: 'Crear presupuesto mensual',
                onClick: () => {
                  setEditingBudget(null)
                  setShowBudgetForm(true)
                },
              }}
            />
          )}

          {/* Formulario de Presupuesto */}
          {showBudgetForm && (
            <Card className="p-6">
              <h2 className="text-h3 font-semibold mb-4 text-gray-900 dark:text-white">
                {editingBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
              </h2>
              <form onSubmit={handleBudgetSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Categoría *
                    </label>
                    {!categories || categories.length === 0 ? (
                      <div className="w-full px-4 py-3 border-2 border-yellow-300 dark:border-yellow-600 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          ⚠️ No tenés ninguna categoría creada.{' '}
                          <Link to="/app/more" className="underline font-semibold">
                            Andá a Más y creala
                          </Link>
                        </p>
                      </div>
                    ) : (
                      <select
                        name="categoryId"
                        required
                        defaultValue={editingBudget?.categoryId || ''}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Seleccionar</option>
                        {categories?.map((cat: any) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Monto *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      required
                      step="0.01"
                      defaultValue={editingBudget?.amount || ''}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Podés ajustar esto más adelante. No tiene que ser perfecto.
                    </p>
                  </div>
                  <DateInput
                    name="periodStart"
                    label="Fecha de inicio *"
                    required
                    defaultValue={
                      editingBudget?.periodStart
                        ? new Date(editingBudget.periodStart).toISOString().split('T')[0]
                        : startDate
                    }
                  />
                  <DateInput
                    name="periodEnd"
                    label="Fecha de fin *"
                    required
                    defaultValue={
                      editingBudget?.periodEnd
                        ? new Date(editingBudget.periodEnd).toISOString().split('T')[0]
                        : endDate
                    }
                  />
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Moneda
                    </label>
                    <select
                      name="currency"
                      defaultValue={editingBudget?.currency || 'ARS'}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      <option value="ARS">ARS</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="repeat"
                      id="repeat"
                      defaultChecked={editingBudget?.repeat || false}
                      className="w-4 h-4"
                    />
                    <label htmlFor="repeat" className="text-sm text-gray-700 dark:text-gray-300">
                      Repetir todos los meses
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Notas (opcional)
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    defaultValue={editingBudget?.notes || ''}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    loading={createBudgetMutation.isPending || updateBudgetMutation.isPending}
                  >
                    {editingBudget ? 'Actualizar' : 'Crear'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowBudgetForm(false)
                      setEditingBudget(null)
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      )}

      {/* Metas Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          {/* Resumen de Metas */}
          {goalSummary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                label="Progreso Total"
                value={`${goalSummary.overallPercentage.toFixed(1)}%`}
                icon="🎯"
              />
              <StatCard
                label="Metas Completadas"
                value={goalSummary.completed.toString()}
                trend={{ label: 'de ' + goalSummary.total, direction: 'up' }}
                icon="✅"
              />
              <StatCard
                label="En Curso"
                value={goalSummary.inProgress.toString()}
                icon="📈"
              />
              <StatCard
                label="En Riesgo"
                value={goalSummary.atRisk.toString()}
                trend={{ label: 'requieren atención', direction: 'down' }}
                icon="⚠️"
              />
            </div>
          )}

          {/* Lista de Metas */}
          {goals && goals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((goal: any) => (
                <Card key={goal.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {goal.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Objetivo: {formatCurrency(Number(goal.targetAmount), goal.currency)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Llevás: {formatCurrency(goal.currentAmount, goal.currency)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Fecha objetivo: {formatDate(goal.targetDate)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingGoal(goal)
                          setShowGoalForm(true)
                        }}
                        className="text-primary dark:text-blue-400 hover:underline text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('¿Eliminar esta meta?')) {
                            deleteGoalMutation.mutate(goal.id)
                          }
                        }}
                        className="text-danger dark:text-red-400 hover:underline text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Progreso</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {goal.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className={`
                          h-3 rounded-full transition-all
                          ${goal.percentage >= 100 ? 'bg-green-500' : goal.isAtRisk ? 'bg-yellow-500' : 'bg-blue-500'}
                        `}
                        style={{ width: `${Math.min(100, goal.percentage)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">
                        Faltan: {formatCurrency(goal.remaining, goal.currency)}
                      </span>
                      {goal.monthsRemaining > 0 && (
                        <span className="text-gray-500 dark:text-gray-400">
                          Aporte sugerido: {formatCurrency(goal.suggestedMonthlyContribution, goal.currency)}/mes
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {goal.status === 'COMPLETED' && (
                        <Badge variant="success" size="sm">Completada</Badge>
                      )}
                      {goal.isAtRisk && goal.status !== 'COMPLETED' && (
                        <Badge variant="warning" size="sm">En riesgo</Badge>
                      )}
                      {goal.status === 'ACTIVE' && !goal.isAtRisk && (
                        <Badge variant="info" size="sm">En curso</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="🎯"
              title="Crea tu primera meta"
              description="Establecé objetivos claros para tus ahorros y seguí tu progreso."
              action={{
                label: 'Nueva Meta',
                onClick: () => {
                  setEditingGoal(null)
                  setShowGoalForm(true)
                },
              }}
            />
          )}

          {/* Formulario de Meta */}
          {showGoalForm && (
            <Card className="p-6">
              <h2 className="text-h3 font-semibold mb-4 text-gray-900 dark:text-white">
                {editingGoal ? 'Editar Meta' : 'Nueva Meta'}
              </h2>
              <form onSubmit={handleGoalSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Nombre de la meta *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      defaultValue={editingGoal?.name || ''}
                      placeholder="Ej: Viaje a Brasil, Fondo de emergencia"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Monto objetivo *
                    </label>
                    <input
                      type="number"
                      name="targetAmount"
                      required
                      step="0.01"
                      defaultValue={editingGoal?.targetAmount || ''}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <DateInput
                    name="targetDate"
                    label="Fecha objetivo *"
                    required
                    defaultValue={
                      editingGoal?.targetDate
                        ? new Date(editingGoal.targetDate).toISOString().split('T')[0]
                        : ''
                    }
                  />
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Moneda
                    </label>
                    <select
                      name="currency"
                      defaultValue={editingGoal?.currency || 'ARS'}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      <option value="ARS">ARS</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Modo de cálculo
                    </label>
                    <select
                      name="calculationMode"
                      defaultValue={editingGoal?.calculationMode || 'ACCOUNT_BALANCE'}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      <option value="ACCOUNT_BALANCE">Por saldo de cuenta</option>
                      <option value="TAG_SUM">Por aportes etiquetados</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Tag (si usás TAG_SUM)
                    </label>
                    <input
                      type="text"
                      name="tagKey"
                      defaultValue={editingGoal?.tagKey || ''}
                      placeholder="Ej: meta-viaje-brasil"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Notas (opcional)
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    defaultValue={editingGoal?.notes || ''}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    loading={createGoalMutation.isPending || updateGoalMutation.isPending}
                  >
                    {editingGoal ? 'Actualizar' : 'Crear'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowGoalForm(false)
                      setEditingGoal(null)
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
