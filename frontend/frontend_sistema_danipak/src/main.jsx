import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toast } from 'sonner'
import { registerSW } from 'virtual:pwa-register'

import App from './App.jsx'
import './index.css'

const updateSW = registerSW({
  onNeedRefresh() {
    toast.info('Hay una nueva versión de DaniPak disponible', {
      duration: Infinity,
      action: {
        label: 'Actualizar ahora',
        onClick: () => updateSW(true)
      }
    })
  },
  onOfflineReady() {
    toast.success('Sistema listo para funcionar sin conexión.');
  }
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
      retry: 1,
      networkMode: 'always'
    },
    mutations: {
      networkMode: 'always'
    }
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)