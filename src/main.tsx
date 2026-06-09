import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import AppRouter from './router/AppRouter'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1c2130', color: '#e2e8f0', border: '1px solid #252d3d' }
      }} />
    </QueryClientProvider>
  </React.StrictMode>
)
