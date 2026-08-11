import { createContext, useContext, useState } from 'react';
import api from '../api/axios';

{/* Se crea el contexto de autenticación */}
const AuthContext = createContext();

{/* Este archivo provee el contexto de autenticación para toda la aplicación */}
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Determina si el usuario esta autenticado si existe el token
  const isAuthenticated = !!token;

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      // Le damos formato a los datos para enviarlos
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await api.post('/api/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token } = response.data;
      
      // Se guarda en estado y localStorage
      setToken(access_token);
      localStorage.setItem('token', access_token);
      
      return true;
    } catch (err) {
      const detail = err.response?.data?.detail || 'Error al conectar con el servidor';
      setError(detail);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
  }
  return context;
};