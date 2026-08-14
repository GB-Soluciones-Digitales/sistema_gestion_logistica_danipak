import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import Layout from './Layout';

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  // Si no esta autenticado, lo enviamos al login reemplazando el historial
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si esta autenticado, renderiza la ruta hija
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}