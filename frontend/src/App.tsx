import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import AppLayout from './layouts/AppLayout'
import Summary from './pages/Summary'
import Transactions from './pages/Transactions'
import Investments from './pages/Investments'
import Plans from './pages/Plans'
import Calendar from './pages/Calendar'
import Assistant from './pages/Assistant'
import AdminDashboard from './pages/AdminDashboard'
import More from './pages/More'
import Settings from './pages/Settings'
import Export from './pages/Export'
import Help from './pages/Help'
import { ToastContainer } from './components/ui'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, accessToken } = useAuthStore()
  // Verificar tanto isAuthenticated como accessToken
  const isAuth = isAuthenticated && !!accessToken
  return isAuth ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/summary" replace />} />
          <Route path="summary" element={<Summary />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="investments" element={<Investments />} />
          <Route path="plans" element={<Plans />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="assistant" element={<Assistant />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="more" element={<More />} />
          <Route path="settings" element={<Settings />} />
          <Route path="export" element={<Export />} />
          <Route path="help" element={<Help />} />
          {/* Rutas legacy para compatibilidad */}
          <Route path="dashboard" element={<Navigate to="/app/summary" replace />} />
          <Route path="incomes" element={<Navigate to="/app/transactions?type=income" replace />} />
          <Route path="expenses" element={<Navigate to="/app/transactions?type=expense" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

