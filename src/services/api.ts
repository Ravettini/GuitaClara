import axios from 'axios'
import { useAuthStore } from '../store/authStore'

// En producción, usar la misma URL (Vercel maneja las rutas /api)
// En desarrollo, usar localhost
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '/api' : 'http://localhost:3001')

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para manejar refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = useAuthStore.getState().refreshToken
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          })
          const { accessToken } = response.data.data
          useAuthStore.getState().setTokens(accessToken, refreshToken)
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        } catch (refreshError) {
          useAuthStore.getState().logout()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      } else {
        // No hay refresh token, redirigir a login
        useAuthStore.getState().logout()
        if (window.location.pathname.startsWith('/app')) {
          window.location.href = '/login'
        }
      }
    }

    return Promise.reject(error)
  }
)

export const authService = {
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
}

export const categoryService = {
  getAll: (type?: string) =>
    api.get('/categories', { params: type ? { type } : {} }),
  getById: (id: string) => api.get(`/categories/${id}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
}

export const incomeService = {
  getAll: (filters?: any) => api.get('/incomes', { params: filters }),
  getById: (id: string) => api.get(`/incomes/${id}`),
  create: (data: any) => api.post('/incomes', data),
  update: (id: string, data: any) => api.put(`/incomes/${id}`, data),
  delete: (id: string) => api.delete(`/incomes/${id}`),
}

export const expenseService = {
  getAll: (filters?: any) => api.get('/expenses', { params: filters }),
  getById: (id: string) => api.get(`/expenses/${id}`),
  create: (data: any) => api.post('/expenses', data),
  update: (id: string, data: any) => api.put(`/expenses/${id}`, data),
  delete: (id: string) => api.delete(`/expenses/${id}`),
}

export const fixedTermService = {
  getAll: () => api.get('/fixed-term-deposits'),
  getById: (id: string) => api.get(`/fixed-term-deposits/${id}`),
  create: (data: any) => api.post('/fixed-term-deposits', data),
  update: (id: string, data: any) => api.put(`/fixed-term-deposits/${id}`, data),
  delete: (id: string) => api.delete(`/fixed-term-deposits/${id}`),
}

export const investmentService = {
  getInstruments: () => api.get('/investments/instruments'),
  getInstrument: (id: string) => api.get(`/investments/instruments/${id}`),
  createInstrument: (data: any) => api.post('/investments/instruments', data),
  updateInstrument: (id: string, data: any) =>
    api.put(`/investments/instruments/${id}`, data),
  deleteInstrument: (id: string) => api.delete(`/investments/instruments/${id}`),
  getPositions: () => api.get('/investments/positions'),
  getPosition: (id: string) => api.get(`/investments/positions/${id}`),
  createPosition: (data: any) => api.post('/investments/positions', data),
  updatePosition: (id: string, data: any) =>
    api.put(`/investments/positions/${id}`, data),
  deletePosition: (id: string) => api.delete(`/investments/positions/${id}`),
  getPortfolio: () => api.get('/investments/portfolio'),
  updatePrices: () => api.post('/investments/update-prices'),
}

export const analyticsService = {
  getSummary: (startDate?: string, endDate?: string, convertTo?: string) =>
    api.get('/analytics/summary', {
      params: {
        ...(startDate && endDate ? { startDate, endDate } : {}),
        ...(convertTo ? { convertTo } : {}),
      },
    }),
  getExpensesByCategory: (startDate?: string, endDate?: string) =>
    api.get('/analytics/expenses-by-category', {
      params: startDate && endDate ? { startDate, endDate } : {},
    }),
  getIncomeVsExpense: (startDate?: string, endDate?: string) =>
    api.get('/analytics/income-vs-expense', {
      params: startDate && endDate ? { startDate, endDate } : {},
    }),
  getCashFlow: (startDate?: string, endDate?: string) =>
    api.get('/analytics/cashflow', {
      params: startDate && endDate ? { startDate, endDate } : {},
    }),
}

export const budgetService = {
  getAll: (periodStart?: string, periodEnd?: string) =>
    api.get('/budgets', {
      params: periodStart && periodEnd ? { periodStart, periodEnd } : {},
    }),
  getById: (id: string) => api.get(`/budgets/${id}`),
  create: (data: any) => api.post('/budgets', data),
  update: (id: string, data: any) => api.put(`/budgets/${id}`, data),
  delete: (id: string) => api.delete(`/budgets/${id}`),
  getSummary: (periodStart?: string, periodEnd?: string) =>
    api.get('/budgets/summary', {
      params: periodStart && periodEnd ? { periodStart, periodEnd } : {},
    }),
}

export const goalService = {
  getAll: (status?: string) =>
    api.get('/goals', { params: status ? { status } : {} }),
  getById: (id: string) => api.get(`/goals/${id}`),
  create: (data: any) => api.post('/goals', data),
  update: (id: string, data: any) => api.put(`/goals/${id}`, data),
  delete: (id: string) => api.delete(`/goals/${id}`),
  getSummary: () => api.get('/goals/summary'),
}

export default api

