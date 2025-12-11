import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { incomeService, expenseService, categoryService } from '../services/api'
import { formatDate, formatCurrency } from '../utils/format'
import { PageHeader, EmptyState, Button, Badge } from '../components/ui'
import DateInput from '../components/DateInput'
import { useToast } from '../components/ui/Toast'

type TransactionType = 'all' | 'income' | 'expense'

export default function Transactions() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [type, setType] = useState<TransactionType>(
    (searchParams.get('type') as TransactionType) || 'all'
  )
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<'income' | 'expense'>(
    (searchParams.get('action') === 'create' && searchParams.get('type') === 'income') ? 'income' : 'expense'
  )
  const [editing, setEditing] = useState<any>(null)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setShowForm(true)
      if (searchParams.get('type') === 'income') {
        setFormType('income')
      } else if (searchParams.get('type') === 'expense') {
        setFormType('expense')
      }
    }
  }, [searchParams])

  const { data: incomes } = useQuery({
    queryKey: ['incomes'],
    queryFn: () => incomeService.getAll().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  })

  const { data: expenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => expenseService.getAll().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  })

  const { data: incomeCategories } = useQuery({
    queryKey: ['categories', 'INCOME'],
    queryFn: () => categoryService.getAll('INCOME').then((r) => r.data.data),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })

  const { data: expenseCategories } = useQuery({
    queryKey: ['categories', 'EXPENSE'],
    queryFn: () => categoryService.getAll('EXPENSE').then((r) => r.data.data),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })

  // Combinar y filtrar transacciones
  const allTransactions = [
    ...(incomes || []).map((inc: any) => ({ ...inc, _type: 'income' as const })),
    ...(expenses || []).map((exp: any) => ({ ...exp, _type: 'expense' as const })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const filteredTransactions = allTransactions.filter((t) => {
    if (type === 'all') return true
    return t._type === type
  })

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex)

  // Resetear página cuando cambia el filtro
  useEffect(() => {
    setCurrentPage(1)
  }, [type])

  // Generar números de página inteligentes (con puntos suspensivos)
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 7 // Máximo de números visibles
    
    if (totalPages <= maxVisible) {
      // Si hay pocas páginas, mostrar todas
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    
    // Siempre mostrar primera página
    pages.push(1)
    
    if (currentPage <= 3) {
      // Cerca del inicio: 1, 2, 3, 4, ..., última
      for (let i = 2; i <= 4; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages)
    } else if (currentPage >= totalPages - 2) {
      // Cerca del final: 1, ..., penúltima-2, penúltima-1, penúltima, última
      pages.push('...')
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // En el medio: 1, ..., actual-1, actual, actual+1, ..., última
      pages.push('...')
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages)
    }
    
    return pages
  }

  const createIncomeMutation = useMutation({
    mutationFn: incomeService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes', 'analytics'] })
      setShowForm(false)
      toast({ message: 'Ingreso creado', type: 'success' })
    },
    onError: () => {
      toast({ message: 'Error al crear ingreso', type: 'error' })
    },
  })

  const createExpenseMutation = useMutation({
    mutationFn: expenseService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', 'analytics'] })
      setShowForm(false)
      setSearchParams({})
      toast({ message: 'Gasto creado', type: 'success' })
    },
    onError: () => {
      toast({ message: 'Error al crear gasto', type: 'error' })
    },
  })

  const updateIncomeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => incomeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes', 'analytics'] })
      setShowForm(false)
      setEditing(null)
      setSearchParams({})
      toast({ message: 'Ingreso actualizado', type: 'success' })
    },
    onError: () => {
      toast({ message: 'Error al actualizar ingreso', type: 'error' })
    },
  })

  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => expenseService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', 'analytics'] })
      setShowForm(false)
      setEditing(null)
      setSearchParams({})
      toast({ message: 'Gasto actualizado', type: 'success' })
    },
    onError: () => {
      toast({ message: 'Error al actualizar gasto', type: 'error' })
    },
  })

  const deleteIncomeMutation = useMutation({
    mutationFn: incomeService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes', 'analytics'] })
      toast({ message: 'Ingreso eliminado', type: 'success' })
    },
    onError: () => {
      toast({ message: 'Error al eliminar ingreso', type: 'error' })
    },
  })

  const deleteExpenseMutation = useMutation({
    mutationFn: expenseService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', 'analytics'] })
      toast({ message: 'Gasto eliminado', type: 'success' })
    },
    onError: () => {
      toast({ message: 'Error al eliminar gasto', type: 'error' })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    let dateValue = formData.get('date') as string
    if (!dateValue && formData.get('date_display')) {
      const displayDate = formData.get('date_display') as string
      if (displayDate && displayDate.length === 10) {
        const [day, month, year] = displayDate.split('/')
        dateValue = `${year}-${month}-${day}`
      }
    }

    const data = {
      categoryId: formData.get('categoryId') || undefined,
      amount: parseFloat(formData.get('amount') as string),
      currency: formData.get('currency') as string || 'ARS',
      date: dateValue || formData.get('date'),
      description: formData.get('description') || undefined,
      ...(formType === 'expense' && {
        paymentMethod: formData.get('paymentMethod') || undefined,
      }),
      ...(formType === 'income' && {
        sourceType: formData.get('sourceType') || undefined,
      }),
    }

    if (editing) {
      if (editing._type === 'income') {
        updateIncomeMutation.mutate({ id: editing.id, data })
      } else {
        updateExpenseMutation.mutate({ id: editing.id, data })
      }
    } else {
      if (formType === 'income') {
        createIncomeMutation.mutate(data as any)
      } else {
        createExpenseMutation.mutate(data as any)
      }
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transacciones"
        description="Gestiona tus ingresos y gastos"
        actions={
          <Button
            onClick={() => {
              setFormType('expense')
              setShowForm(true)
              setEditing(null)
            }}
          >
            + Nuevo Movimiento
          </Button>
        }
        filters={
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-card border border-gray-200 dark:border-gray-700">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'income', label: 'Ingresos' },
              { id: 'expense', label: 'Gastos' },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setType(option.id as TransactionType)}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium transition
                  ${type === option.id
                    ? 'bg-primary text-gray-900 shadow-sm'
                    : 'text-gray-900 dark:text-gray-200 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        }
      />

      {/* Formulario */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-6">
          <h2 className="text-h3 font-semibold mb-4 text-gray-900 dark:text-white">
            {editing ? 'Editar' : 'Nuevo'} {formType === 'income' ? 'Ingreso' : 'Gasto'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setFormType('income')}
                className={`
                  flex-1 px-4 py-2 rounded-lg font-medium transition
                  ${formType === 'income'
                    ? 'bg-success text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }
                `}
              >
                Ingreso
              </button>
              <button
                type="button"
                onClick={() => setFormType('expense')}
                className={`
                  flex-1 px-4 py-2 rounded-lg font-medium transition
                  ${formType === 'expense'
                    ? 'bg-danger text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }
                `}
              >
                Gasto
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Monto *
                </label>
                <input
                  type="number"
                  name="amount"
                  required
                  defaultValue={editing?.amount}
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <DateInput
                name="date"
                label="Fecha"
                required
                defaultValue={
                  editing?.date ? new Date(editing.date).toISOString().split('T')[0] : ''
                }
              />
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Categoría {formType === 'expense' && '*'}
                </label>
                <select
                  name="categoryId"
                  required={formType === 'expense'}
                  defaultValue={editing?.categoryId || ''}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Seleccionar</option>
                  {(formType === 'income' ? incomeCategories : expenseCategories)?.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Moneda
                </label>
                <select
                  name="currency"
                  defaultValue={editing?.currency || 'ARS'}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="ARS">ARS</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              {formType === 'expense' && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Método de Pago
                  </label>
                  <select
                    name="paymentMethod"
                    defaultValue={editing?.paymentMethod || ''}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Seleccionar</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                </div>
              )}
              {formType === 'income' && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Tipo de Ingreso
                  </label>
                  <input
                    type="text"
                    name="sourceType"
                    defaultValue={editing?.sourceType || ''}
                    placeholder="Ej: Salario, Freelance"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Descripción
              </label>
              <textarea
                name="description"
                defaultValue={editing?.description || ''}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex gap-4">
              <Button
                type="submit"
                loading={
                  createIncomeMutation.isPending ||
                  createExpenseMutation.isPending ||
                  updateIncomeMutation.isPending ||
                  updateExpenseMutation.isPending
                }
              >
                {editing ? 'Actualizar' : 'Crear'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false)
                  setEditing(null)
                  setSearchParams({})
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Transacciones */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon="💸"
          title="No hay transacciones"
          description="Comienza agregando tu primer ingreso o gasto"
          action={{
            label: 'Agregar Movimiento',
            onClick: () => {
              setFormType('expense')
              setShowForm(true)
            },
          }}
        />
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            {paginatedTransactions.map((transaction: any) => (
            <div
              key={transaction.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-4 hover:shadow-card-hover transition cursor-pointer"
              onClick={() => {
                setEditing(transaction)
                setFormType(transaction._type)
                setShowForm(true)
              }}
            >
              {/* Desktop Layout */}
              <div className="hidden md:flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`
                      w-12 h-12 rounded-lg flex items-center justify-center text-xl
                      ${transaction._type === 'income'
                        ? 'bg-success-soft dark:bg-green-900'
                        : 'bg-danger-soft dark:bg-red-900'
                      }
                    `}
                  >
                    <span className="text-gray-900 dark:text-gray-100" style={{ filter: 'none' }}>
                      {transaction.category?.icon || (transaction._type === 'income' ? '💰' : '💸')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {transaction.description || transaction.category?.name || 'Sin descripción'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(transaction.date)}
                      </span>
                      {transaction.paymentMethod && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {transaction.paymentMethod}
                          </span>
                        </>
                      )}
                      {transaction.sourceType && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {transaction.sourceType}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p
                      className={`
                        font-semibold text-lg
                        ${transaction._type === 'income'
                          ? 'text-success dark:text-green-400'
                          : 'text-danger dark:text-red-400'
                        }
                      `}
                    >
                      {transaction._type === 'income' ? '+' : '-'}
                      {formatCurrency(Number(transaction.amount), transaction.currency)}
                    </p>
                    <Badge variant={transaction._type === 'income' ? 'success' : 'danger'} size="sm">
                      {transaction.currency}
                    </Badge>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (transaction._type === 'income') {
                        if (confirm('¿Eliminar este ingreso?')) {
                          deleteIncomeMutation.mutate(transaction.id)
                        }
                      } else {
                        if (confirm('¿Eliminar este gasto?')) {
                          deleteExpenseMutation.mutate(transaction.id)
                        }
                      }
                    }}
                    className="text-gray-400 hover:text-danger transition p-2"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="md:hidden">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`
                        w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0
                        ${transaction._type === 'income'
                          ? 'bg-success-soft dark:bg-green-900'
                          : 'bg-danger-soft dark:bg-red-900'
                        }
                      `}
                    >
                      <span className="text-gray-900 dark:text-gray-100" style={{ filter: 'none' }}>
                        {transaction.category?.icon || (transaction._type === 'income' ? '💰' : '💸')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {transaction.description || transaction.category?.name || 'Sin descripción'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (transaction._type === 'income') {
                        if (confirm('¿Eliminar este ingreso?')) {
                          deleteIncomeMutation.mutate(transaction.id)
                        }
                      } else {
                        if (confirm('¿Eliminar este gasto?')) {
                          deleteExpenseMutation.mutate(transaction.id)
                        }
                      }
                    }}
                    className="text-gray-400 hover:text-danger transition p-1 flex-shrink-0"
                  >
                    🗑️
                  </button>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Fecha</span>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                      {formatDate(transaction.date)}
                    </span>
                  </div>
                  {(transaction.paymentMethod || transaction.sourceType) && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {transaction.paymentMethod ? 'Método' : 'Tipo'}
                      </span>
                      <span className="text-xs font-medium text-gray-900 dark:text-white">
                        {transaction.paymentMethod || transaction.sourceType}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Monto</span>
                      <Badge 
                        variant={transaction._type === 'income' ? 'success' : 'danger'} 
                        size="sm"
                        className="ml-2"
                      >
                        {transaction.currency}
                      </Badge>
                    </div>
                    <p
                      className={`
                        font-bold text-lg
                        ${transaction._type === 'income'
                          ? 'text-success dark:text-green-400'
                          : 'text-danger dark:text-red-400'
                        }
                      `}
                    >
                      {transaction._type === 'income' ? '+' : '-'}
                      {formatCurrency(Number(transaction.amount), transaction.currency)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-4 mb-20 md:mb-0">
              {/* Mobile: Solo anterior/siguiente y página actual */}
              <div className="md:hidden flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition text-sm"
                >
                  ← Anterior
                </button>
                <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    Página {currentPage} de {totalPages}
                  </div>
                  <div className="text-xs mt-0.5">
                    {startIndex + 1} - {Math.min(endIndex, filteredTransactions.length)} de {filteredTransactions.length}
                  </div>
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition text-sm"
                >
                  Siguiente →
                </button>
              </div>

              {/* Desktop: Paginación completa */}
              <div className="hidden md:flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando {startIndex + 1} - {Math.min(endIndex, filteredTransactions.length)} de {filteredTransactions.length} transacciones
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                  >
                    Anterior
                  </button>
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => {
                      if (page === '...') {
                        return (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-2 text-gray-500 dark:text-gray-400"
                          >
                            ...
                          </span>
                        )
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page as number)}
                          className={`px-3 py-2 rounded-lg border transition ${
                            currentPage === page
                              ? 'bg-primary text-gray-900 border-primary'
                              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

