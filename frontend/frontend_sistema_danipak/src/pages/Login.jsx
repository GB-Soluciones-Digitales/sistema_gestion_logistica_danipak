import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(formData.username, formData.password);
    if (success) {
        navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-md rounded-2xl shadow-md p-8 border border-gray-100">
            
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">DaniPak</h1>
          <p className="text-text-muted">Ingresá tus credenciales para continuar</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-error text-sm rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-text-main mb-1" htmlFor="username">Usuario</label>
            <input
              id="username" name="username" type="text" required
              value={formData.username} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-text-main"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-1" htmlFor="password">Contraseña</label>
            <input
              id="password" name="password" type="password" required
              value={formData.password} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-text-main"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 mt-4 
              ${loading ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover'}`}
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

      </div>
    </div>
  );
}