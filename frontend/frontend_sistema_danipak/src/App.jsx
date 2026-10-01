import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { processSyncQueue } from './utils/syncManager';

import Login from "./pages/auth/Login";
import OlvidePassword from "./pages/auth/OlvidePassword";
import { SessionExpiredModal } from './components/SessionExpiredModal';
import NotFound from "./pages/error/NotFound";
import ComprobantesList from './pages/operaciones/comprobantes/ComprobantesList';
import ComprobanteForm from './pages/operaciones/comprobantes/ComprobanteForm';
import ComprobanteView from './pages/operaciones/comprobantes/ComprobanteView';
import ClientesList from './pages/operaciones/clientes/ClientesList';
import ClienteForm from './pages/operaciones/clientes/ClienteForm';
import CuentasCorrientes from './pages/operaciones/cuentas/CuentasCorrientes';
import CuentaDetalle from './pages/operaciones/cuentas/CuentaDetalle';
import Localidades from "./pages/operaciones/Localidades";
import Auditoria from './pages/control/auditoria/Auditoria';

export default function App() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const syncOnLoad = async () => {
      if (navigator.onLine) {
        const synced = await processSyncQueue();
        if (synced) queryClient.invalidateQueries();
      }
    };
    syncOnLoad();

    const handleOnline = async () => {
      toast.success('Conexión a internet restaurada. Sincronizando datos...', {
        duration: 4000,
      });
      
      const synced = await processSyncQueue();
      if (synced) {
        toast.success('Comprobantes pendientes enviados al servidor con éxito.');
        queryClient.invalidateQueries(); 
      }
    };

    const handleOffline = () => {
      toast.error('Se perdió la conexión a internet. Trabajando de forma local.', {
        duration: 8000, 
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [queryClient]);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster richColors position="top-center" />
        <SessionExpiredModal />
        
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/olvide-password" element={<OlvidePassword />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<ComprobantesList />} />
            <Route path="/comprobantes" element={<ComprobantesList />} />
            <Route path="/comprobantes/nuevo" element={<ComprobanteForm />} />
            <Route path="/comprobantes/editar/:id" element={<ComprobanteForm />} />
            <Route path="/comprobantes/:id" element={<ComprobanteView />} />
            <Route path="/clientes" element={<ClientesList />} />
            <Route path="/clientes/nuevo" element={<ClienteForm />} />
            <Route path="/clientes/editar/:id" element={<ClienteForm />} />
            <Route path="/cuentas-corrientes" element={<CuentasCorrientes />} />
            <Route path="/cuentas-corrientes/:id" element={<CuentaDetalle />} />
            <Route path="/localidades" element={<Localidades />} />
            <Route path="/auditoria" element={<Auditoria />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}