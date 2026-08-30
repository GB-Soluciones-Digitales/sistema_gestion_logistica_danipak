import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { clientesServices } from '../../../api/clientesServices';

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
        console.error('Error al cargar los clientes', error)
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, [page, searchQuery, limit]);

  const totalPages = Math.ceil(totalRegistros / limit);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestión de remitentes y destinatarios frecuentes.</p>
        </div>
        <button 
          onClick={() => navigate('/clientes/nuevo')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity font-medium shadow-sm"
        >
          <Plus size={20} />
          Nuevo Cliente
        </button>
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-secondary/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Razón Social</th>
                <th className="px-4 py-3 font-medium">CUIT / DNI</th>
                <th className="px-4 py-3 font-medium">Teléfono</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8">Cargando...</td></tr>
              ) : clientes.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-muted-foreground">No se encontraron clientes.</td></tr>
              ) : (
                clientes.map(cliente => (
                  <tr key={cliente.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{cliente.razon_social}</td>
                    <td className="px-4 py-3">{cliente.cuit_dni}</td>
                    <td className="px-4 py-3">{cliente.telefono || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        cliente.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {cliente.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => navigate(`/clientes/editar/${cliente.id}`)} className="text-amber-600 hover:opacity-80 p-1" title="Editar">
                        <Edit2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && totalPages > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/20">
            <span className="text-sm text-muted-foreground">
              Mostrando {clientes.length} de {totalRegistros} clientes
            </span>
            <div className="flex gap-2 items-center">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded border border-border bg-background hover:bg-secondary disabled:opacity-50"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-medium">Página {page} de {totalPages}</span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 rounded border border-border bg-background hover:bg-secondary disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}