import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from "./pages/auth/Login";
import OlvidePassword from "./pages/auth/OlvidePassword";
import NotFound from "./pages/error/NotFound";
import ComprobantesList from './pages/operaciones/comprobantes/ComprobantesList';
import ComprobanteForm from './pages/operaciones/comprobantes/ComprobanteForm';
import ComprobanteView from './pages/operaciones/comprobantes/ComprobanteView';
import Localidades from "./pages/operaciones/Localidades";

export default function App() {
  return (
    // El Provider envuelve todo para que el estado global viva en toda la app
    <AuthProvider>
      {/* El Router maneja la navegacion en el navegador */}
      <BrowserRouter>
        <Toaster richColors position="top-center" />
        
        <Routes>
          
          {/* Rutas Publicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/olvide-password" element={<OlvidePassword />} />

          {/* Rutas Protegidas*/}
          {/* Todas las rutas dentro de este bloque van a exigir token */}
          <Route element={<ProtectedRoute />}>
            <Route path="/comprobantes" element={<ComprobantesList />} />
            <Route path="/comprobantes/nuevo" element={<ComprobanteForm />} />
            <Route path="/comprobantes/editar/:id" element={<ComprobanteForm />} />
            <Route path="/comprobantes/:id" element={<ComprobanteView />} />
            <Route path="/localidades" element={<Localidades />} />
          </Route>

          {/* Fallback */}
          {/* Si alguien ingresa una URL que no existe va a ser redirigido al inicio */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}