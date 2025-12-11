import { useState, useEffect, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { assistantService } from '../services/api'
import { useToast } from '../components/ui/Toast'
import ReactMarkdown from 'react-markdown'
import { useAuthStore } from '../store/authStore'

type MessageRole = 'user' | 'assistant'

interface Message {
  id: string
  role: MessageRole
  content: string
  createdAt?: string
}

const DISCLAIMER_NOTE = 'Las respuestas del asistente son orientativas y no constituyen asesoramiento financiero profesional ni recomendación de inversión.'

const QUICK_PROMPTS = [
  '¿En qué gasto más este mes?',
  '¿Cómo puedo ahorrar sin dejar de salir?',
  '¿Mis inversiones están equilibradas?',
  '¿Qué debería revisar primero de mis gastos?',
]

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()
  const { user } = useAuthStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  const chatMutation = useMutation({
    mutationFn: (message: string) => assistantService.chat(message).then(r => r.data.data),
    onSuccess: (data) => {
      const newMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        createdAt: new Date().toISOString(),
      }
      setMessages(prev => [...prev, newMessage])
      setInput('')
      setIsSending(false)
    },
    onError: (error: any) => {
      setIsSending(false)
      toast({
        message: error.response?.data?.error || 'Error al comunicarse con el asistente',
        type: 'error',
      })
    },
  })

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || isSending) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsSending(true)
    chatMutation.mutate(trimmed)
  }

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt)
    // Opcional: enviar directamente
    // handleSend()
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U'

  return (
    <div className="flex flex-col flex-1 w-full bg-slate-50/80 dark:bg-gray-900 -m-4 lg:-m-6 min-h-0">
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 min-h-0">
        {/* Header del asistente */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 flex-shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-sky-500 flex items-center justify-center shadow-lg">
              <span className="text-2xl sm:text-3xl">🤖</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Asistente financiero
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 mt-0.5">
                Hacé preguntas sobre tus finanzas y recibí ideas personalizadas
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
              Basado en tus datos de GuitaClara
            </span>
          </div>
        </div>

        {/* Banner de disclaimer */}
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-900/20 px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-amber-900 dark:text-amber-200 flex-shrink-0">
          <span className="text-base sm:text-lg flex-shrink-0 mt-0.5">ℹ️</span>
          <p className="leading-relaxed">{DISCLAIMER_NOTE}</p>
        </div>

        {/* Contenedor principal del chat */}
        <section className="mt-4 sm:mt-6 flex-1 flex flex-col rounded-2xl sm:rounded-3xl border border-slate-200/70 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden min-h-0 max-h-[calc(100vh-16rem)]">
          {/* Área de mensajes */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 lg:px-6 py-4 sm:py-5 space-y-4 min-h-0"
          >
            {messages.length === 0 ? (
              <div className="text-center text-slate-500 dark:text-gray-400 py-12 sm:py-16">
                <div className="text-5xl sm:text-6xl mb-4">🤖</div>
                <p className="text-lg sm:text-xl font-medium mb-2 text-slate-900 dark:text-white">
                  Hola, soy tu asistente financiero
                </p>
                <p className="text-sm sm:text-base max-w-md mx-auto">
                  Hacé preguntas sobre tus gastos, ingresos, inversiones o cualquier aspecto de tus finanzas.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  userInitial={userInitial}
                />
              ))
            )}

            {/* Estado "pensando" */}
            {isSending && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg sm:text-xl">🤖</span>
                </div>
                <div className="max-w-full sm:max-w-[75%] lg:max-w-[70%] rounded-2xl bg-slate-50 dark:bg-gray-700 border border-slate-200/70 dark:border-gray-600 px-3 sm:px-4 py-3 sm:py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-slate-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm text-slate-600 dark:text-gray-400">El asistente está pensando...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length === 0 && (
            <div className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4 flex-shrink-0">
              <div className="flex flex-wrap gap-2 justify-center">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="text-xs sm:text-sm rounded-full border border-slate-200 dark:border-gray-700 px-3 py-1.5 bg-slate-50 dark:bg-gray-700 hover:bg-slate-100 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-300 transition-all hover:scale-105"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input del chat */}
          <div className="border-t border-slate-200/70 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur px-3 sm:px-4 lg:px-6 py-3 sm:py-3.5 flex-shrink-0">
            <div className="flex gap-2 sm:gap-3 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Escribí tu pregunta..."
                className="flex-1 resize-none bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-xl px-3 sm:px-3.5 py-2.5 text-sm sm:text-[0.95rem] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500/70 transition-all"
                rows={1}
                disabled={isSending}
                style={{ minHeight: '44px', maxHeight: '120px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = `${Math.min(target.scrollHeight, 120)}px`
                }}
              />
              <button
                onClick={handleSend}
                disabled={isSending || !input.trim()}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-medium shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 min-w-[44px] sm:min-w-[52px]"
                title="Enviar mensaje"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-2 text-center hidden sm:block">
              Presioná Enter para enviar, Shift + Enter para nueva línea
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

// Componente de burbuja de mensaje
function MessageBubble({ message, userInitial }: { message: Message; userInitial: string }) {
  if (message.role === 'user') {
    return (
      <div className="flex items-end justify-end gap-2 sm:gap-3">
        <div className="max-w-full sm:max-w-[75%] lg:max-w-[70%] rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm">
          <p className="text-sm sm:text-[0.95rem] leading-relaxed whitespace-pre-wrap break-words text-slate-900 dark:text-slate-100">
            {message.content}
          </p>
        </div>
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-semibold flex-shrink-0 border border-blue-200 dark:border-blue-700">
          {userInitial}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2 sm:gap-3">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center flex-shrink-0 shadow-sm">
        <span className="text-lg sm:text-xl">🤖</span>
      </div>
      <div className="max-w-full sm:max-w-[75%] lg:max-w-[70%] rounded-2xl bg-slate-50 dark:bg-gray-700 border border-slate-200/70 dark:border-gray-600 px-3 sm:px-4 py-3 sm:py-3.5 shadow-sm">
        <div className="text-sm sm:text-[0.95rem] text-slate-900 dark:text-white">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold text-slate-900 dark:text-white">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
              h1: ({ children }) => <h1 className="text-lg font-semibold mt-4 mb-2 first:mt-0 text-slate-900 dark:text-white">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-semibold mt-3 mb-2 first:mt-0 text-slate-900 dark:text-white">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-semibold mt-3 mb-1.5 first:mt-0 text-slate-900 dark:text-white">{children}</h3>,
              ul: ({ children }) => <ul className="list-disc list-inside my-2 space-y-1 ml-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside my-2 space-y-1 ml-2">{children}</ol>,
              li: ({ children }) => <li className="ml-2">{children}</li>,
              code: ({ children }) => (
                <code className="bg-slate-200/50 dark:bg-gray-600 px-1.5 py-0.5 rounded text-xs font-mono">
                  {children}
                </code>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-slate-300 dark:border-gray-600 pl-3 my-2 italic text-slate-700 dark:text-gray-300">
                  {children}
                </blockquote>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
