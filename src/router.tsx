import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { PublicLayout } from './components/layout/PublicLayout'
import { Dashboard } from './pages/Dashboard'
import { Templates } from './pages/Templates'
import { Contracts } from './pages/Contracts'
import { ContractNew } from './pages/ContractNew'
import { ContractDetail } from './pages/ContractDetail'
import { SignPage } from './pages/SignPage'
import { SignComplete } from './pages/SignComplete'
import { Login } from './pages/Login'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  // Rutas admin (protegidas)
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'templates', element: <Templates /> },
      { path: 'contracts', element: <Contracts /> },
      { path: 'contracts/new', element: <ContractNew /> },
      { path: 'contracts/:id', element: <ContractDetail /> },
    ],
  },
  // Rutas públicas (firma)
  {
    path: '/sign',
    element: <PublicLayout />,
    children: [
      { path: ':token', element: <SignPage /> },
      { path: ':token/complete', element: <SignComplete /> },
    ],
  },
])
