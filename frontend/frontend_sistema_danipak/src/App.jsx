import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { SessionExpiredModal } from './components/SessionExpiredModal';

import Login from "./pages/auth/Login";
import OlvidePassword from "./pages/auth/OlvidePassword";
import ResetPassword from "./pages/auth/ResetPassword";

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
import Reportes from './pages/control/Reportes';
import Usuarios from './pages/sistema/Usuarios';
import Configuracion from './pages/sistema/Configuracion';

export default function App() {

  useEffect(() => {
    const handleOnline = () => {
      toast.success('Conexión a internet restaurada.', { duration: 4000 });
    };

    const handleOffline = () => {
      toast.error('Se perdió la conexión a internet. Trabajando de forma local.', { duration: 8000 });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster richColors position="top-center" />
        <SessionExpiredModal />
        
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/olvide-password" element={<OlvidePassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

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
            <Route path="*" element={<Reportes />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/configuracion" element={<Configuracion />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}