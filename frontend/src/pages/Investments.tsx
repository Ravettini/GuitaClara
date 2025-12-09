import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { investmentService, fixedTermService } from '../services/api'
import { exportToCSV, exportToXLSX, formatFixedTermForExport, formatPositionForExport } from '../utils/export'
import DateInput from '../components/DateInput'
import { formatDate, formatCurrency } from '../utils/format'

export default function Investments() {
  const [activeTab, setActiveTab] = useState<'fixedTerms' | 'portfolio'>('fixedTerms')
  const [showFixedTermForm, setShowFixedTermForm] = useState(false)
  const [showPositionForm, setShowPositionForm] = useState(false)
  const [showInstrumentForm, setShowInstrumentForm] = useState(false)
  const [editingFixedTerm, setEditingFixedTerm] = useState<any>(null)
  const [editingPosition, setEditingPosition] = useState<any>(null)
  const queryClient = useQueryClient()

  const { data: fixedTerms } = useQuery({
    queryKey: ['fixed-terms'],
    queryFn: () => fixedTermService.getAll().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    placeholderData: (previousData) => previousData,
  })

  const { data: instruments } = useQuery({
    queryKey: ['instruments'],
    queryFn: () => investmentService.getInstruments().then((r) => r.data.data),
    staleTime: 10 * 60 * 1000, // 10 minutos - los instrumentos cambian poco
    gcTime: 30 * 60 * 1000, // 30 minutos
    placeholderData: (previousData) => previousData,
  })

  const { data: positions } = useQuery({
    queryKey: ['positions'],
    queryFn: () => investmentService.getPositions().then((r) => r.data.data),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    placeholderData: (previousData) => previousData,
  })

  const { data: portfolio } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => investmentService.getPortfolio().then((r) => r.data.data),
    staleTime: 2 * 60 * 1000, // 2 minutos - el portfolio puede cambiar más rápido
    gcTime: 10 * 60 * 1000, // 10 minutos
    placeholderData: (previousData) => previousData,
  })

  // Crear instrumento
  const createInstrumentMutation = useMutation({
    mutationFn: investmentService.createInstrument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instruments'] })
      setShowInstrumentForm(false)
    },
  })

  // Optimistic updates para plazos fijos
  const createFixedTermMutation = useMutation({
    mutationFn: fixedTermService.create,
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['fixed-terms'] })
      const previous = queryClient.getQueryData(['fixed-terms'])
      queryClient.setQueryData(['fixed-terms'], (old: any) => {
        const temp = {
          id: `temp-${Date.now()}`,
          ...newData,
          computedMaturityDate: new Date(new Date(newData.startDate).getTime() + newData.termInDays * 24 * 60 * 60 * 1000),
          computedInterestAmount: newData.principalAmount * (newData.tna / 100) * (newData.termInDays / 365),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        return old ? [...old, temp] : [temp]
      })
      return { previous }
    },
    onError: (err, newData, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['fixed-terms'], context.previous)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-terms'] })
      setShowFixedTermForm(false)
    },
  })

  const updateFixedTermMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      fixedTermService.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['fixed-terms'] })
      const previous = queryClient.getQueryData(['fixed-terms'])
      queryClient.setQueryData(['fixed-terms'], (old: any) => {
        return old?.map((item: any) => item.id === id ? { ...item, ...data } : item)
      })
      return { previous }
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['fixed-terms'], context.previous)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-terms'] })
      setEditingFixedTerm(null)
      setShowFixedTermForm(false)
    },
  })

  const deleteFixedTermMutation = useMutation({
    mutationFn: fixedTermService.delete,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['fixed-terms'] })
      const previous = queryClient.getQueryData(['fixed-terms'])
      queryClient.setQueryData(['fixed-terms'], (old: any) => {
        return old?.filter((item: any) => item.id !== id)
      })
      return { previous }
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['fixed-terms'], context.previous)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fixed-terms'] })
    },
  })

  // Optimistic updates para posiciones
  const createPositionMutation = useMutation({
    mutationFn: investmentService.createPosition,
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['positions', 'portfolio'] })
      const previousPositions = queryClient.getQueryData(['positions'])
      const previousPortfolio = queryClient.getQueryData(['portfolio'])
      
      // Actualizar posiciones
      const instrument = instruments?.find((inst: any) => inst.id === newData.instrumentId)
      if (instrument) {
        const tempPosition = {
          id: `temp-${Date.now()}`,
          ...newData,
          instrument,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        queryClient.setQueryData(['positions'], (old: any) => {
          return old ? [...old, tempPosition] : [tempPosition]
        })
      }
      
      return { previousPositions, previousPortfolio }
    },
    onError: (err, newData, context) => {
      if (context?.previousPositions) {
        queryClient.setQueryData(['positions'], context.previousPositions)
      }
      if (context?.previousPortfolio) {
        queryClient.setQueryData(['portfolio'], context.previousPortfolio)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions', 'portfolio'] })
      setShowPositionForm(false)
    },
  })

  const updatePositionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      investmentService.updatePosition(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['positions', 'portfolio'] })
      const previousPositions = queryClient.getQueryData(['positions'])
      const previousPortfolio = queryClient.getQueryData(['portfolio'])
      
      queryClient.setQueryData(['positions'], (old: any) => {
        return old?.map((item: any) => item.id === id ? { ...item, ...data } : item)
      })
      
      return { previousPositions, previousPortfolio }
    },
    onError: (err, variables, context) => {
      if (context?.previousPositions) {
        queryClient.setQueryData(['positions'], context.previousPositions)
      }
      if (context?.previousPortfolio) {
        queryClient.setQueryData(['portfolio'], context.previousPortfolio)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions', 'portfolio'] })
      setEditingPosition(null)
      setShowPositionForm(false)
    },
  })

  const deletePositionMutation = useMutation({
    mutationFn: investmentService.deletePosition,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['positions', 'portfolio'] })
      const previousPositions = queryClient.getQueryData(['positions'])
      const previousPortfolio = queryClient.getQueryData(['portfolio'])
      
      queryClient.setQueryData(['positions'], (old: any) => {
        return old?.filter((item: any) => item.id !== id)
      })
      
      queryClient.setQueryData(['portfolio'], (old: any) => {
        return old?.filter((item: any) => item.position.id !== id)
      })
      
      return { previousPositions, previousPortfolio }
    },
    onError: (err, id, context) => {
      if (context?.previousPositions) {
        queryClient.setQueryData(['positions'], context.previousPositions)
      }
      if (context?.previousPortfolio) {
        queryClient.setQueryData(['portfolio'], context.previousPortfolio)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions', 'portfolio'] })
    },
  })

  const updatePricesMutation = useMutation({
    mutationFn: investmentService.updatePrices,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
    },
  })

  const handleFixedTermSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    // Convertir fecha de DD/MM/YYYY a formato ISO si viene del componente DateInput
    let startDateValue = formData.get('startDate') as string
    if (!startDateValue && formData.get('startDate_display')) {
      // Si no hay valor en el input hidden, convertir desde el display
      const displayDate = formData.get('startDate_display') as string
      if (displayDate && displayDate.length === 10) {
        const [day, month, year] = displayDate.split('/')
        startDateValue = `${year}-${month}-${day}`
      }
    }
    
    const data = {
      principalAmount: parseFloat(formData.get('principalAmount') as string),
      currency: formData.get('currency') || 'ARS',
      tna: parseFloat(formData.get('tna') as string),
      startDate: startDateValue || formData.get('startDate'),
      termInDays: parseInt(formData.get('termInDays') as string),
      bankName: formData.get('bankName') || undefined,
      autoRenew: formData.get('autoRenew') === 'on',
    }

    if (editingFixedTerm) {
      updateFixedTermMutation.mutate({ id: editingFixedTerm.id, data })
    } else {
      createFixedTermMutation.mutate(data)
    }
  }

  const handleInstrumentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      ticker: (formData.get('ticker') as string).toUpperCase(),
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      market: formData.get('market') as string,
      currency: formData.get('currency') || 'ARS',
    }

    createInstrumentMutation.mutate(data, {
      onSuccess: () => {
        setShowInstrumentForm(false)
      },
    })
  }

  const handlePositionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      instrumentId: formData.get('instrumentId') as string,
      quantity: parseFloat(formData.get('quantity') as string),
      averageBuyPrice: parseFloat(formData.get('averageBuyPrice') as string),
      accountName: formData.get('accountName') || undefined,
      brokerName: formData.get('brokerName') || undefined,
    }

    if (editingPosition) {
      updatePositionMutation.mutate({ id: editingPosition.id, data })
    } else {
      createPositionMutation.mutate(data)
    }
  }

  const handleExportFixedTerms = (format: 'xlsx' | 'csv') => {
    if (!fixedTerms || fixedTerms.length === 0) {
      alert('No hay datos para exportar')
      return
    }
    const formatted = fixedTerms.map(formatFixedTermForExport)
    if (format === 'xlsx') {
      exportToXLSX(formatted, 'plazos-fijos', 'Plazos Fijos')
    } else {
      exportToCSV(formatted, 'plazos-fijos')
    }
  }

  const handleExportPortfolio = (format: 'xlsx' | 'csv') => {
    if (!portfolio || portfolio.length === 0) {
      alert('No hay datos para exportar')
      return
    }
    const formatted = portfolio.map(formatPositionForExport)
    if (format === 'xlsx') {
      exportToXLSX(formatted, 'portfolio', 'Portfolio')
    } else {
      exportToCSV(formatted, 'portfolio')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Inversiones</h1>
        <div className="flex gap-4">
          {activeTab === 'portfolio' && (
            <>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExportPortfolio('csv')}
                  className="px-4 py-2 bg-blue-600 text-gray-900 rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  📥 CSV
                </button>
                <button
                  onClick={() => handleExportPortfolio('xlsx')}
                  className="px-4 py-2 bg-green-600 text-gray-900 rounded-lg hover:bg-green-700 transition text-sm"
                >
                  📥 XLSX
                </button>
              </div>
              <button
                onClick={() => updatePricesMutation.mutate()}
                disabled={updatePricesMutation.isPending}
                className="px-4 py-2 bg-green-600 text-gray-900 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {updatePricesMutation.isPending ? 'Actualizando...' : 'Actualizar Precios'}
              </button>
            </>
          )}
          {activeTab === 'fixedTerms' && (
            <div className="flex gap-2">
              <button
                onClick={() => handleExportFixedTerms('csv')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
              >
                📥 CSV
              </button>
              <button
                onClick={() => handleExportFixedTerms('xlsx')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
              >
                📥 XLSX
              </button>
            </div>
          )}
          <button
            onClick={() => {
              if (activeTab === 'fixedTerms') {
                setEditingFixedTerm(null)
                setShowFixedTermForm(true)
              } else {
                setEditingPosition(null)
                setShowPositionForm(true)
              }
            }}
            className="px-4 py-2 bg-primary text-gray-900 rounded-lg hover:bg-primary-dark transition font-medium shadow-sm"
          >
            + Nuevo
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('fixedTerms')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'fixedTerms'
                ? 'border-b-2 border-primary text-primary dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Plazos Fijos
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'portfolio'
                ? 'border-b-2 border-primary text-primary dark:text-blue-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            Portfolio
          </button>
        </div>
      </div>

      {/* Fixed Terms Tab */}
      {activeTab === 'fixedTerms' && (
        <>
          {showFixedTermForm && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {editingFixedTerm ? 'Editar Plazo Fijo' : 'Nuevo Plazo Fijo'}
              </h2>
              <form onSubmit={handleFixedTermSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Monto *
                    </label>
                    <input
                      type="number"
                      name="principalAmount"
                      required
                      defaultValue={editingFixedTerm?.principalAmount}
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      TNA (%) *
                    </label>
                    <input
                      type="number"
                      name="tna"
                      required
                      defaultValue={editingFixedTerm?.tna}
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <DateInput
                    name="startDate"
                    label="Fecha de Inicio"
                    required
                    defaultValue={
                      editingFixedTerm?.startDate
                        ? new Date(editingFixedTerm.startDate).toISOString().split('T')[0]
                        : ''
                    }
                  />
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Plazo (días) *
                    </label>
                    <input
                      type="number"
                      name="termInDays"
                      required
                      defaultValue={editingFixedTerm?.termInDays}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Banco
                    </label>
                    <input
                      type="text"
                      name="bankName"
                      defaultValue={editingFixedTerm?.bankName || ''}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Moneda
                    </label>
                    <select
                      name="currency"
                      defaultValue={editingFixedTerm?.currency || 'ARS'}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      <option value="ARS">ARS</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        name="autoRenew"
                        defaultChecked={editingFixedTerm?.autoRenew}
                        className="rounded"
                      />
                      Auto-renovar
                    </label>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={createFixedTermMutation.isPending || updateFixedTermMutation.isPending}
                    className="px-4 py-2 bg-primary text-gray-900 rounded-lg hover:bg-primary-dark transition disabled:opacity-50 font-medium shadow-sm"
                  >
                    {editingFixedTerm ? 'Actualizar' : 'Crear'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowFixedTermForm(false)
                      setEditingFixedTerm(null)
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
                    Banco
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    TNA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Inicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Vencimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Interés
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {fixedTerms?.map((ft: any) => {
                  const isExpired = new Date(ft.computedMaturityDate) < new Date()
                  return (
                    <tr key={ft.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {ft.bankName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        ${Number(ft.principalAmount).toLocaleString('es-AR')} {ft.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {Number(ft.tna).toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(ft.startDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={isExpired ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}
                        >
                          {formatDate(ft.computedMaturityDate)}
                        </span>
                        {isExpired && (
                          <span className="ml-2 text-xs text-red-600 dark:text-red-400">
                            (Vencido)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                        ${Number(ft.computedInterestAmount).toLocaleString('es-AR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            setEditingFixedTerm(ft)
                            setShowFixedTermForm(true)
                          }}
                          className="text-primary dark:text-blue-400 hover:underline mr-4 font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('¿Estás seguro de eliminar este plazo fijo?')) {
                              deleteFixedTermMutation.mutate(ft.id)
                            }
                          }}
                          className="text-red-600 dark:text-red-400 hover:underline"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {(!fixedTerms || fixedTerms.length === 0) && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No hay plazos fijos registrados
              </div>
            )}
          </div>
        </>
      )}

      {/* Portfolio Tab */}
      {activeTab === 'portfolio' && (
        <>
          {showInstrumentForm && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Nuevo Instrumento
              </h2>
              <form onSubmit={handleInstrumentSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Ticker (Símbolo) *
                    </label>
                    <input
                      type="text"
                      name="ticker"
                      required
                      placeholder="GGAL, AAPL, AL30"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      El código del instrumento. Ej: GGAL (Galicia), AAPL (Apple), AL30 (Bono)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Grupo Financiero Galicia"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      El nombre completo de la empresa o instrumento
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Tipo de Instrumento *
                    </label>
                    <select
                      name="type"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      <option value="STOCK">Acción (Stock)</option>
                      <option value="CEDEAR">CEDEAR</option>
                      <option value="BOND">Bono</option>
                      <option value="LECAP">LECAP</option>
                      <option value="ETF">ETF</option>
                      <option value="OTHER">Otro</option>
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      CEDEAR = Acciones extranjeras en pesos argentinos
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Mercado *
                    </label>
                    <input
                      type="text"
                      name="market"
                      required
                      placeholder="BCBA, NYSE, NASDAQ, etc."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Ejemplos: BCBA (Argentina), NYSE/NASDAQ (EE.UU.), BYMA (Argentina)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Moneda
                    </label>
                    <select
                      name="currency"
                      defaultValue="ARS"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      <option value="ARS">ARS</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={createInstrumentMutation.isPending}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    Crear Instrumento
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInstrumentForm(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {showPositionForm && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {editingPosition ? 'Editar Posición' : 'Nueva Posición'}
              </h2>
              {(!instruments || instruments.length === 0) && (
                <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg">
                  <p className="mb-2">No hay instrumentos creados. Crea uno primero:</p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPositionForm(false)
                      setShowInstrumentForm(true)
                    }}
                    className="px-4 py-2 bg-yellow-600 text-gray-900 rounded-lg hover:bg-yellow-700 transition"
                  >
                    + Crear Instrumento
                  </button>
                </div>
              )}
              <form onSubmit={handlePositionSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Instrumento *
                      </label>
                      {instruments && instruments.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowPositionForm(false)
                            setShowInstrumentForm(true)
                          }}
                          className="text-xs text-primary dark:text-blue-400 hover:underline font-medium"
                        >
                          + Nuevo
                        </button>
                      )}
                    </div>
                    <select
                      name="instrumentId"
                      required
                      defaultValue={editingPosition?.instrumentId || ''}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      disabled={!instruments || instruments.length === 0}
                    >
                      <option value="">Seleccionar instrumento</option>
                      {instruments?.map((inst: any) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.ticker} - {inst.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Cantidad *
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      required
                      defaultValue={editingPosition?.quantity}
                      step="0.0001"
                      placeholder="10"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Cuántas unidades tienes (acciones, bonos, etc.)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Precio Promedio de Compra *
                    </label>
                    <input
                      type="number"
                      name="averageBuyPrice"
                      required
                      defaultValue={editingPosition?.averageBuyPrice}
                      step="0.01"
                      placeholder="1500"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Precio promedio al que compraste (si compraste varias veces, promedia)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Broker / Casa de Bolsa
                    </label>
                    <input
                      type="text"
                      name="brokerName"
                      defaultValue={editingPosition?.brokerName || ''}
                      placeholder="Ej: IOL, Balanz, etc."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Opcional: dónde tienes la inversión
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={createPositionMutation.isPending || updatePositionMutation.isPending || !instruments || instruments.length === 0}
                    className="px-4 py-2 bg-primary text-gray-900 rounded-lg hover:bg-primary-dark transition disabled:opacity-50 font-medium shadow-sm"
                  >
                    {editingPosition ? 'Actualizar' : 'Crear'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPositionForm(false)
                      setEditingPosition(null)
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
                    Instrumento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Precio Compra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Precio Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Valor Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Ganancia/Pérdida
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {portfolio?.map((item: any) => {
                  const typeLabels: Record<string, string> = {
                    STOCK: 'Acción',
                    CEDEAR: 'CEDEAR',
                    BOND: 'Bono',
                    LECAP: 'LECAP',
                    ETF: 'ETF',
                    OTHER: 'Otro',
                  }
                  return (
                    <tr key={item.position.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.instrument.ticker}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.instrument.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {typeLabels[item.instrument.type] || item.instrument.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {Number(item.position.quantity).toLocaleString('es-AR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(Number(item.position.averageBuyPrice), item.instrument.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {item.lastPrice ? (
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(item.lastPrice, item.instrument.currency)}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Sin precio</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(item.currentValue, item.instrument.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-col">
                          <span
                            className={`font-semibold ${
                              item.pnl >= 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {item.pnl >= 0 ? '↑' : '↓'} {formatCurrency(Math.abs(item.pnl), item.instrument.currency)}
                          </span>
                          <span
                            className={`text-xs ${
                              item.pnl >= 0
                                ? 'text-green-500 dark:text-green-400'
                                : 'text-red-500 dark:text-red-400'
                            }`}
                          >
                            {item.pnlPercent >= 0 ? '+' : ''}{item.pnlPercent.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            setEditingPosition(item.position)
                            setShowPositionForm(true)
                          }}
                          className="text-primary dark:text-blue-400 hover:underline mr-4 font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('¿Estás seguro de eliminar esta posición?')) {
                              deletePositionMutation.mutate(item.position.id)
                            }
                          }}
                          className="text-red-600 dark:text-red-400 hover:underline"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {(!portfolio || portfolio.length === 0) && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="mb-2">No hay posiciones registradas</p>
                <p className="text-sm">Crea un instrumento y agrega una posición para empezar</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
