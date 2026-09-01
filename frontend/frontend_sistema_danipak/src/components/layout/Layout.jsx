import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FileText, Users, Wallet, MapPin, ShieldCheck, BarChart3, Settings, LogOut, Menu, X, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

import { useAuth } from '../../context/AuthContext';
import { processSyncQueue } from '../../utils/syncManager';
import LogoExtendido from '../../assets/logo-extendido.svg';
import Isotipo from '../../assets/isotipo.svg';

export default function Layout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuSections = [
    {
      title: 'OPERACIÓN',
      items: [
        { name: 'Comprobantes', path: '/comprobantes', icon: FileText },
        { name: 'Clientes', path: '/clientes', icon: Users },
        { name: 'Cuentas Corrientes', path: '/cuentas-corrientes', icon: Wallet },
        { name: 'Localidades', path: '/localidades', icon: MapPin },
      ]
    },
    {
      title: 'CONTROL',
      items: [
        { name: 'Auditoría', path: '/auditoria', icon: ShieldCheck },
        { name: 'Reportes', path: '/reportes', icon: BarChart3 },
      ]
    },
    {
      title: 'SISTEMA',
      items: [
        { name: 'Configuración', path: '/configuracion', icon: Settings },
      ]
    }
  ];

  // Sincronización automática al recuperar conexión
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      toast.info('Conexión restablecida. Sincronizando datos pendientes...');
      setIsSyncing(true);
      await processSyncQueue();
      setIsSyncing(false);
      toast.success('Sincronización completada.');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Sin conexión a internet. Modo offline activado.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sincronización manual
  const handleManualSync = async () => {
    if (!navigator.onLine) {
      toast.error('No hay conexión a internet en este momento.');
      return;
    }
    setIsSyncing(true);
    toast.info('Sincronizando datos pendientes...');
    await processSyncQueue();
    setIsSyncing(false);
    toast.success('Sincronización completada.');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col md:flex-row font-sans">
      
      <header className="md:hidden flex items-center justify-between p-4 bg-sidebar text-sidebar-foreground border-b border-sidebar-border z-20">
        <div className="font-display font-bold text-xl tracking-tight text-sidebar-primary-foreground">
          <img src={Isotipo} alt="DaniPak Isotipo" className="h-8 w-8" />
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-ring"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <aside 
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border
          transform transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="hidden md:flex items-center h-16 px-6 border-b border-sidebar-border font-display font-bold text-2xl text-sidebar-primary-foreground">
          <img src={LogoExtendido} alt="DaniPak Logo" className="h-8" />
        </div>

        <nav className="flex-1 py-6 overflow-y-auto">
          {menuSections.map((section, index) => (
            <div key={index} className="mb-6">
              <h3 className="px-6 mb-2 text-xs font-bold tracking-wider text-sidebar-foreground/50 uppercase">
                {section.title}
              </h3>
              
              <div className="space-y-1 px-3">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={`
                        relative flex items-center gap-3 px-3 py-2.5 rounded-md font-medium transition-colors
                        ${isActive 
                          ? 'bg-sidebar-primary/10 text-sidebar-primary-foreground' 
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        }
                      `}
                    >
                      {isActive && (
                        <svg 
                          className="absolute -left-1 w-4 h-4 text-sidebar-primary fill-current" 
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                      
                      <item.icon 
                        size={20} 
                        className={isActive ? 'text-sidebar-primary' : 'text-sidebar-foreground/70'} 
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-2">
          <button 
            onClick={handleManualSync}
            disabled={isSyncing}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors disabled:opacity-50"
          >
            <RefreshCw size={20} className={isSyncing ? "animate-spin text-primary" : ""} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Datos'}
          </button>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-destructive hover:bg-sidebar-accent hover:text-destructive transition-colors"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      <div className="fixed bottom-4 right-4 z-40 md:top-6 md:right-8">
        {!isOnline ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-destructive/20 bg-destructive/10 text-destructive shadow-sm backdrop-blur-sm">
            <WifiOff size={14} />
            <span className="text-xs font-bold tracking-wide">Modo Offline</span>
          </div>
        ) : isSyncing ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 shadow-sm backdrop-blur-sm">
            <RefreshCw size={14} className="animate-spin" />
            <span className="text-xs font-bold tracking-wide">Sincronizando...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-200 bg-green-50 text-green-700 shadow-sm backdrop-blur-sm transition-opacity duration-1000 opacity-70 hover:opacity-100">
            <Wifi size={14} />
            <span className="text-xs font-bold tracking-wide">Conectado - Sincronizado</span>
          </div>
        )}
      </div>
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-background relative">
        {children}
      </main>

    </div>
  );
}