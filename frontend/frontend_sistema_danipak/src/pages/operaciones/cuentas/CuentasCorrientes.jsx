import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { movimientosService } from '../../../api/movimientosService';

import DataTable from '../../../components/ui/DataTable';
import Button from '../../../components/ui/Button';

export default function CuentasCorrientes() {
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchCuentas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await movimientosService.getResumenGeneral();
      setCuentas(data);
    } catch (err) {
      console.error('Error al cargar los saldos generales:', err);
      toast.error('Error al cargar los saldos generales');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCuentas();
  }, [fetchCuentas]);

  // Filtrado local rápido
  const cuentasFiltradas = cuentas.filter(c => 
    c.razon_social.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columnas = [
    { key: 'razon_social', label: 'Cliente' },
    { key: 'cuit_dni', label: 'CUIT/DNI' },
    { key: 'saldo_total', label: 'Estado de Cuenta',
      render: (fila) => (
        <span className={`font-bold ${fila.saldo_total > 0 ? 'text-red-600' : fila.saldo_total < 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
          {fila.saldo_total > 0 ? 'Debe: ' : fila.saldo_total < 0 ? 'A favor: ' : 'Al día: '}
          $ {Math.abs(fila.saldo_total).toLocaleString('es-AR')}
        </span>
      )
    },
    { key: 'acciones', label: 'Acciones',
      render: (fila) => (
        <Button 
          variant="outline" 
          className="px-3 py-1 h-8"
          onClick={() => navigate(`/cuentas-corrientes/${fila.cliente_id}`)}
        >
          <Eye size={16} className="mr-2" /> Ver Detalle
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Cuentas Corrientes</h1>
        <p className="text-muted-foreground text-sm mt-1">Saldos globales de clientes autorizados</p>
      </div>

      <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text"
            placeholder="Buscar por razón social..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Calculando saldos...</div>
        ) : (
          <DataTable columns={columnas} data={cuentasFiltradas} />
        )}
      </div>
    </div>
  );
}