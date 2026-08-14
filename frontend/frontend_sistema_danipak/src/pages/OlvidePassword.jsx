import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function OlvidePassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); 
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const response = await api.post('/api/auth/olvide-password', { email });
      setStatus('success');
      setMessage(response.data.mensaje);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.detail || 'Ocurrió un error al procesar la solicitud.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card rounded-lg shadow-sm border border-border p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-display font-bold text-foreground">
            Recuperar Contraseña
          </h1>
          <p className="text-muted-foreground mt-2 font-sans text-sm">
            Ingresá tu correo electrónico y te enviaremos las instrucciones para restablecer tu acceso.
          </p>
        </div>

        {status === 'success' ? (
          <div className="space-y-6">
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md text-center text-sm font-medium">
              {message}
            </div>
            <Link 
              to="/login"
              className="block w-full text-center py-2.5 px-4 bg-secondary text-secondary-foreground font-medium rounded-md hover:bg-secondary/80 transition-colors"
            >
              Volver al Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {status === 'error' && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm text-center">
                {message}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground block">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                placeholder="ejemplo@correo.com"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-2.5 px-4 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-70 flex justify-center items-center"
            >
              {status === 'loading' ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>

            <div className="text-center mt-4">
              <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Volver a Iniciar Sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}