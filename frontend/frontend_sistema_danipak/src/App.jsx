import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from "./pages/auth/Login";
import OlvidePassword from "./pages/auth/OlvidePassword";
import NotFound from "./pages/error/NotFound";
import Comprobantes from "./pages/operaciones/Comprobantes";
import Localidades from "./pages/operaciones/Localidades";

export default function App() {
  return (
    // El Provider envuelve todo para que el estado global viva en toda la app
    <AuthProvider>
      {/* El Router maneja la navegacion en el navegador */}
      <BrowserRouter>
        <Routes>
          
          {/* Rutas Publicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/olvide-password" element={<OlvidePassword />} />

          {/* Rutas Protegidas*/}
          {/* Todas las rutas dentro de este bloque van a exigir token */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Comprobantes />} />
            <Route path="/comprobantes" element={<Comprobantes />} />
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