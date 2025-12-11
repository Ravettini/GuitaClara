import { useState, useEffect } from 'react'

interface DateInputProps {
  name: string
  label: string
  required?: boolean
  defaultValue?: string
  className?: string
}

// Componente de input de fecha con formato DD/MM/YYYY
export default function DateInput({
  name,
  label,
  required = false,
  defaultValue,
  className = '',
}: DateInputProps) {
  const [displayValue, setDisplayValue] = useState('')
  const [hiddenValue, setHiddenValue] = useState('')

  // Convertir fecha ISO (YYYY-MM-DD) a DD/MM/YYYY para mostrar
  const formatForDisplay = (isoDate: string): string => {
    if (!isoDate) return ''
    const [year, month, day] = isoDate.split('-')
    return `${day}/${month}/${year}`
  }

  // Convertir DD/MM/YYYY a ISO (YYYY-MM-DD) para el input hidden
  const parseToISO = (ddmmyyyy: string): string => {
    if (!ddmmyyyy) return ''
    // Remover cualquier carácter que no sea número
    const cleaned = ddmmyyyy.replace(/\D/g, '')
    if (cleaned.length !== 8) return ''
    
    const day = cleaned.substring(0, 2)
    const month = cleaned.substring(2, 4)
    const year = cleaned.substring(4, 8)
    
    // Validar que sea una fecha válida
    const date = new Date(`${year}-${month}-${day}`)
    if (isNaN(date.getTime())) return ''
    
    return `${year}-${month}-${day}`
  }

  // Inicializar con el valor por defecto
  useEffect(() => {
    if (defaultValue) {
      // Si viene en formato ISO (YYYY-MM-DD)
      if (defaultValue.includes('-') && defaultValue.length === 10) {
        setDisplayValue(formatForDisplay(defaultValue))
        setHiddenValue(defaultValue)
      } else {
        // Si viene en formato DD/MM/YYYY
        const iso = parseToISO(defaultValue)
        if (iso) {
          setDisplayValue(defaultValue)
          setHiddenValue(iso)
        }
      }
    }
  }, [defaultValue])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    
    // Remover caracteres no numéricos excepto /
    value = value.replace(/[^\d/]/g, '')
    
    // Agregar / automáticamente
    if (value.length > 2 && value[2] !== '/') {
      value = value.substring(0, 2) + '/' + value.substring(2)
    }
    if (value.length > 5 && value[5] !== '/') {
      value = value.substring(0, 5) + '/' + value.substring(5)
    }
    
    // Limitar a DD/MM/YYYY
    if (value.length > 10) {
      value = value.substring(0, 10)
    }
    
    setDisplayValue(value)
    
    // Convertir a ISO para el input hidden
    const iso = parseToISO(value)
    setHiddenValue(iso)
  }

  const handleBlur = () => {
    // Validar y formatear al perder el foco
    if (displayValue && displayValue.length === 10) {
      const iso = parseToISO(displayValue)
      if (iso) {
        setHiddenValue(iso)
      }
    }
  }

  const handleToday = () => {
    const today = new Date()
    const day = String(today.getDate()).padStart(2, '0')
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const year = today.getFullYear()
    const formatted = `${day}/${month}/${year}`
    const iso = `${year}-${month}-${day}`
    setDisplayValue(formatted)
    setHiddenValue(iso)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label} {required && '*'}
        </label>
        <button
          type="button"
          onClick={handleToday}
          className="text-xs px-2 py-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-400 rounded-md hover:bg-primary/20 dark:hover:bg-primary/30 transition font-medium"
        >
          Hoy
        </button>
      </div>
      <input
        type="text"
        name={`${name}_display`}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="dd/mm/yyyy"
        maxLength={10}
        required={required}
        pattern="\d{2}/\d{2}/\d{4}"
        className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white ${className}`}
      />
      {/* Input hidden con el valor en formato ISO para el formulario */}
      <input
        type="hidden"
        name={name}
        value={hiddenValue}
        required={required}
      />
    </div>
  )
}

