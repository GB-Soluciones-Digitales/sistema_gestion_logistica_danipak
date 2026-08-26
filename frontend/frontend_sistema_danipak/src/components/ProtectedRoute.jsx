import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import Layout from './layout/Layout';

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  const skipLogin = import.meta.env.VITE_SKIP_LOGIN === 'true';


  // Si no esta autenticado, lo enviamos al login reemplazando el historial
  if (!isAuthenticated && !skipLogin) {
    return <Navigate to="/login" replace />;
  }

  // Si esta autenticado, renderiza la ruta hija
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}