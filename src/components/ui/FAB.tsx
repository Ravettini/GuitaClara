import { useState } from 'react'

interface FABProps {
  onAction: (action: string) => void
  actions: Array<{
    id: string
    label: string
    icon: string
  }>
}

export function FAB({ onAction, actions }: FABProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-20 right-4 md:hidden z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-2 mb-2">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                onAction(action.id)
                setIsOpen(false)
              }}
              className="
                bg-white dark:bg-gray-800 shadow-elevated rounded-lg px-4 py-3
                flex items-center gap-3 min-w-[180px]
                hover:bg-gray-50 dark:hover:bg-gray-700 transition
                text-left
              "
            >
              <span className="text-xl">{action.icon}</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          w-14 h-14 rounded-full
          bg-gradient-to-br from-blue-600 to-indigo-600 text-white
          md:bg-primary md:text-gray-900
          shadow-elevated hover:shadow-lg
          hover:from-blue-700 hover:to-indigo-700
          md:hover:bg-primary-dark
          flex items-center justify-center text-2xl font-bold
          transition-all transform hover:scale-105
          ring-4 ring-blue-200/50 md:ring-0
        "
      >
        {isOpen ? '✕' : '+'}
      </button>
    </div>
  )
}

