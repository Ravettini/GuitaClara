import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { categoryService } from '../services/api'

export default function Settings() {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const queryClient = useQueryClient()

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll().then((r) => r.data.data),
    staleTime: 10 * 60 * 1000, // 10 minutos - las categorías cambian poco
    gcTime: 30 * 60 * 1000, // 30 minutos
    placeholderData: (previousData) => previousData,
  })

  const createMutation = useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setShowForm(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      categoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setEditing(null)
      setShowForm(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: categoryService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      color: formData.get('color') || undefined,
      icon: formData.get('icon') || undefined,
    }

    if (editing) {
      updateMutation.mutate({ id: editing.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configuración</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Categorías</h2>
          <button
            onClick={() => {
              setEditing(null)
              setShowForm(true)
            }}
            className="px-4 py-2 bg-primary text-gray-900 rounded-lg hover:bg-primary-dark transition font-medium shadow-sm"
          >
            + Nueva Categoría
          </button>
        </div>

        {showForm && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {editing ? 'Editar Categoría' : 'Nueva Categoría'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editing?.name}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Tipo *
                  </label>
                  <select
                    name="type"
                    required
                    defaultValue={editing?.type || 'EXPENSE'}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white"
                  >
                    <option value="EXPENSE">Gasto</option>
                    <option value="INCOME">Ingreso</option>
                    <option value="BOTH">Ambos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Color
                  </label>
                  <input
                    type="color"
                    name="color"
                    defaultValue={editing?.color || '#3B82F6'}
                    className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Icono (emoji)
                  </label>
                  <input
                    type="text"
                    name="icon"
                    defaultValue={editing?.icon || ''}
                    placeholder="🎬"
                    maxLength={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-600 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-gray-900 rounded-lg hover:bg-primary-dark transition font-medium shadow-sm"
                >
                  {editing ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditing(null)
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories?.map((category: any) => (
            <div
              key={category.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                {category.icon && <span className="text-2xl">{category.icon}</span>}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{category.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {category.type === 'EXPENSE'
                      ? 'Gasto'
                      : category.type === 'INCOME'
                      ? 'Ingreso'
                      : 'Ambos'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(category)
                    setShowForm(true)
                  }}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
                      deleteMutation.mutate(category.id)
                    }
                  }}
                  className="text-red-600 dark:text-red-400 hover:underline text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
        {(!categories || categories.length === 0) && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No hay categorías. Crea una nueva para empezar.
          </div>
        )}
      </div>
    </div>
  )
}

