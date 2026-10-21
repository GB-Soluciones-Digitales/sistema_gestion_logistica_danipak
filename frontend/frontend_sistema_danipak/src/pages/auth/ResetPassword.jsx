import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { usuarioService } from '../../api/usuariosService'; 
import LogoExtendido from '../../assets/Expreso_DaniPak_Logo.png';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setStatus('error');
      setMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setStatus('loading');
    try {
      const response = await usuarioService.resetearPassword(token, password);
      setStatus('success');
      setMessage(response.mensaje || "Contraseña actualizada exitosamente.");
      
      setTimeout(() => {
        navigate('/login');
      }, 2500);

    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.detail || "El enlace es inválido o ha expirado.");
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="p-4 bg-destructive/10 text-destructive rounded-md font-medium text-center border border-destructive/20">
          Error: No se proporcionó un token de seguridad válido. <br/>
          <Link to="/login" className="underline mt-2 inline-block">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card rounded-lg shadow-sm border border-border p-8">
        
        <div className="text-center mb-8 flex flex-col items-center">
          <img src={LogoExtendido} alt="DaniPak Logo" className="h-10 mb-4 object-contain" />
          <h2 className="text-2xl font-display font-bold text-foreground">Crear Nueva Contraseña</h2>
        </div>
        
        {status === 'success' ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md font-medium">
              {message}
            </div>
            <p className="text-sm text-muted-foreground animate-pulse">Redirigiendo al inicio de sesión...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {status === 'error' && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm text-center">
                {message}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground block">Nueva Contraseña</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full p-2.5 rounded-md border border-input bg-background focus:ring-2 focus:ring-ring"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground block">Confirmar Contraseña</label>
              <input 
                type="password" 
                required 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="w-full p-2.5 rounded-md border border-input bg-background focus:ring-2 focus:ring-ring"
              />
            </div>

            <button 
              type="submit" 
              disabled={status === 'loading'} 
              className="w-full mt-2 py-2.5 px-4 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70"
            >
              {status === 'loading' ? "Actualizando..." : "Guardar Contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}