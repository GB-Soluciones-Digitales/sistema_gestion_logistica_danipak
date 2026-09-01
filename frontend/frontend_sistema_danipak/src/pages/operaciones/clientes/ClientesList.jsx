import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import { clientesServices } from '../../../api/clientesServices';
import DataTable from '../../../components/ui/DataTable';
import Button from '../../../components/ui/Button';

export default function ClientesList() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      setLoading(true);
      try {
        const data = await clientesServices.getAll(page, limit, searchQuery);
        if (!ignore) {
          setClientes(data.items || []);
          setTotalRegistros(data.total || 0);
        }
      } catch (error) {
        if (!ignore) toast.error('Error al cargar los clientes');
        console.error("Error al cargar los clientes", error)
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, [page, searchQuery, limit]);

  const columnas = [
    { key: 'razon_social', label: 'Razón Social' },
    { key: 'cuit_dni', label: 'CUIT / DNI' },
    { key: 'telefono', label: 'Teléfono', render: (fila) => fila.telefono || '-' },
    { key: 'estado', label: 'Estado',
      render: (fila) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${fila.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {fila.estado ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    { key: 'acciones', label: 'Acciones',
      render: (fila) => (
        <Button 
          variant="outline" 
          onClick={() => navigate(`/clientes/editar/${fila.id}`)} 
          className="px-2 py-1 h-8" 
          title="Editar"
        >
          <Edit2 size={16} className="text-amber-600" />
        </Button>
      )
    }
  ];

  const totalPages = Math.ceil(totalRegistros / limit);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestión de remitentes y destinatarios frecuentes.</p>
        </div>
        <Button onClick={() => navigate('/clientes/nuevo')} className="w-full sm:w-auto">
          <Plus size={20} className="mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por Razón Social o DNI/CUIT..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        
        {loading && clientes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Cargando...</div>
        ) : (
          <DataTable columns={columnas} data={clientes} />
        )}
        
        {!loading && totalPages > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/20">
            <span className="text-sm text-muted-foreground">
              Mostrando {clientes.length} de {totalRegistros} clientes
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