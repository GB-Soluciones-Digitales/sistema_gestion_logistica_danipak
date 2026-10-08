import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './ui/Modal';

export const SessionExpiredModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleSessionExpired = () => setIsOpen(true);
        window.addEventListener('session-expired', handleSessionExpired);
        
        return () => window.removeEventListener('session-expired', handleSessionExpired);
    }, []);

    const handleAccept = () => {
        setIsOpen(false);
        navigate('/login');
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={() => {}}
            title="Sesión Expirada"
        >
            <div className="text-center p-4">
                <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-lg font-bold text-gray-900 mb-2">¡Atención!</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Por tu seguridad, tu sesión ha caducado. Por favor, ingresá tus credenciales nuevamente para continuar trabajando.
                </p>
                <button 
                    onClick={handleAccept} 
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium transition-colors"
                >
                    Entendido, ir al Login
                </button>
            </div>
        </Modal>
    );
};