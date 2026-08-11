import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Vistas
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    // El Provider envuelve todo para que el estado global viva en toda la app
    <AuthProvider>
      {/* El Router maneja la navegacion en el navegador */}
      <BrowserRouter>
        <Routes>
          
          {/* Rutas Publicas */}
          <Route path="/login" element={<Login />} />

          {/* Rutas Protegidas*/}
          {/* Todas las rutas dentro de este bloque van a exigir token */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
          </Route>

          {/* Fallback */}
          {/* Si alguien ingresa una URL que no existe va a ser redirigido al inicio */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}