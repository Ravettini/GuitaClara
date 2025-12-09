import { useEffect } from 'react'
import { create } from 'zustand'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(7)
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, toast.duration || 3000)
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },
}))

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts)
  const removeToast = useToastStore((state) => state.removeToast)

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 md:top-6 md:right-6">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, toast.duration || 3000)
    return () => clearTimeout(timer)
  }, [toast.duration, onClose])

  const variants = {
    success: 'bg-success text-gray-900',
    error: 'bg-danger text-gray-900',
    info: 'bg-info text-gray-900',
    warning: 'bg-warning text-gray-900',
  }

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  }

  return (
    <div
      className={`
        ${variants[toast.type]}
        rounded-lg shadow-elevated px-4 py-3
        flex items-center gap-3 min-w-[300px] max-w-md
        animate-in slide-in-from-right
      `}
    >
      <span className="text-lg">{icons[toast.type]}</span>
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      <button
        onClick={onClose}
        className="text-gray-900/80 hover:text-gray-900 transition"
      >
        ✕
      </button>
    </div>
  )
}

export function useToast() {
  const addToast = useToastStore((state) => state.addToast)
  return { toast: addToast }
}

