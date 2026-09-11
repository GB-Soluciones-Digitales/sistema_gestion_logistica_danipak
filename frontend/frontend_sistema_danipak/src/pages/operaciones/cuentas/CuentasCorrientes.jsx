import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import { movimientosService } from '../../../api/movimientosService';
import DataTable from '../../../components/ui/DataTable';
import Button from '../../../components/ui/Button';

export default function CuentasCorrientes() {
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const limit = 10;
  const navigate = useNavigate();

  const fetchCuentas = useCallback(async () => {
    try {
      setLoading(true);
      const data = await movimientosService.getResumenGeneral();
      setCuentas(data);
      setTotalRegistros(data.totalRegistros || 0);
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
    { key: 'telefono', label: 'Teléfono' },
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
        <div className="flex gap-1">
          <Button variant="outline" className="px-2 py-1 h-8" onClick={() => navigate(`/cuentas-corrientes/${fila.cliente_id}`)}>
            <Eye size={16} className="text-blue-600" />
          </Button>
        </div>
      )
    }
  ];

  const totalPages = Math.ceil(totalRegistros / limit);

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

        {!loading && totalPages > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/20">
            <span className="text-sm text-muted-foreground">
              Mostrando {cuentasFiltradas.length} de {totalRegistros} Cuentas Corrientes
            </span>
            <div className="flex gap-2 items-center">
              <Button 
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2 py-1 h-8"
              >
                <ChevronLeft size={18} />
              </Button>
              <span className="text-sm font-medium">Página {page} de {totalPages}</span>
              <Button 
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2 py-1 h-8"
              >
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}