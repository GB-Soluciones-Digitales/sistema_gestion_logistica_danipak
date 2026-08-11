import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto bg-surface rounded-2xl shadow-sm p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-primary mb-4">
          Panel de Control - DaniPak
        </h1>
        <p className="text-text-main mb-8">
          Bienvenido al sistema! Si estás viendo esto, estas autenticado
        </p>
        
        <button
          onClick={logout}
          className="bg-error hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}