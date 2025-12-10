import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { incomeService, categoryService } from '../services/api'
import { exportToCSV, exportToXLSX, formatIncomeForExport } from '../utils/export'
import { formatDate } from '../utils/format'
import DateInput from '../components/DateInput'

export default function Incomes() {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const queryClient = useQueryClient()

  const { data: incomes, isLoading: incomesLoading } = useQuery({
    queryKey: ['incomes'],
    queryFn: () => incomeService.getAll().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    placeholderData: (previousData) => previousData, // Mostrar datos anteriores mientras carga
  })

  const { data: categories } = useQuery({
    queryKey: ['categories', 'INCOME'],
    queryFn: () => categoryService.getAll('INCOME').then((r) => r.data.data),
    staleTime: 10 * 60 * 1000, // 10 minutos - las categorías cambian poco
    gcTime: 30 * 60 * 1000, // 30 minutos
    placeholderData: (previousData) => previousData,
  })

  const createMutation = useMutation({
    mutationFn: incomeService.create,
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['incomes'] })
      const previous = queryClient.getQueryData(['incomes'])
      const category = categories?.find((cat: any) => cat.id === newData.categoryId)
      const temp = {
        id: `temp-${Date.now()}`,
        ...newData,
        category: category || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      queryClient.setQueryData(['incomes'], (old: any) => {
        return old ? [...old, temp] : [temp]
      })
      return { previous }
    },
    onError: (err, newData, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['incomes'], context.previous)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes', 'analytics'] })
      setShowForm(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      incomeService.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['incomes'] })
      const previous = queryClient.getQueryData(['incomes'])
      const category = categories?.find((cat: any) => cat.id === data.categoryId)
      queryClient.setQueryData(['incomes'], (old: any) => {
        return old?.map((item: any) => 
          item.id === id 
            ? { ...item, ...data, category: category || item.category }
            : item
        )
      })
      return { previous }
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['incomes'], context.previous)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes', 'analytics'] })
      setEditing(null)
      setShowForm(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: incomeService.delete,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['incomes'] })
      const previous = queryClient.getQueryData(['incomes'])
      queryClient.setQueryData(['incomes'], (old: any) => {
        return old?.filter((item: any) => item.id !== id)
      })
      return { previous }
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['incomes'], context.previous)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes', 'analytics'] })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      categoryId: formData.get('categoryId') || undefined,
      amount: parseFloat(formData.get('amount') as string),
      currency: formData.get('currency') || 'ARS',
      date: formData.get('date'),
      description: formData.get('description') || undefined,
      sourceType: formData.get('sourceType') || undefined,
    }

    if (editing) {
      updateMutation.mutate({ id: editing.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ingresos</h1>
        <div className="flex gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (!incomes || incomes.length === 0) {
                  alert('No hay datos para exportar')
                  return
                }
                const formatted = incomes.map(formatIncomeForExport)
                exportToCSV(formatted, 'ingresos')
              }}
              className="px-4 py-2 bg-blue-600 text-gray-900 rounded-lg hover:bg-blue-700 transition text-sm"
            >
              📥 CSV
            </button>
            <button
              onClick={() => {
                if (!incomes || incomes.length === 0) {
                  alert('No hay datos para exportar')
                  return
                }
                const formatted = incomes.map(formatIncomeForExport)
                exportToXLSX(formatted, 'ingresos', 'Ingresos')
              }}
              className="px-4 py-2 bg-green-600 text-gray-900 rounded-lg hover:bg-green-700 transition text-sm"
            >
              📥 XLSX
            </button>
          </div>
          <button
            onClick={() => {
              setEditing(null)
              setShowForm(true)
            }}
            className="px-4 py-2 bg-primary text-gray-900 rounded-lg hover:bg-primary-dark transition font-medium shadow-sm"
          >
            + Nuevo Ingreso
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {editing ? 'Editar Ingreso' : 'Nuevo Ingreso'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Monto
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
                  Categoría
                </label>
                <select
                  name="categoryId"
                  defaultValue={editing?.categoryId || ''}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Sin categoría</option>
                  {categories?.map((cat: any) => (
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
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 bg-primary text-gray-900 rounded-lg hover:bg-primary-dark transition disabled:opacity-50 font-medium shadow-sm"
              >
                {editing ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditing(null)
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Monto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {incomes?.map((income: any) => (
              <tr key={income.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {formatDate(income.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                  ${Number(income.amount).toLocaleString('es-AR')} {income.currency}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {income.category?.name || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {income.description || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => {
                      setEditing(income)
                      setShowForm(true)
                    }}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline mr-4"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('¿Estás seguro de eliminar este ingreso?')) {
                        deleteMutation.mutate(income.id)
                      }
                    }}
                    className="text-red-600 dark:text-red-400 hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!incomes || incomes.length === 0) && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No hay ingresos registrados
          </div>
        )}
      </div>
    </div>
  )
}

