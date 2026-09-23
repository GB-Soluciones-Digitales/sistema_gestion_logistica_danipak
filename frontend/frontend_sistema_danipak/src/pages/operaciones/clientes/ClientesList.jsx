import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Search, ChevronLeft, ChevronRight, Filter, Sheet, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { clientesServices } from '../../../api/clientesServices';
import DataTable from '../../../components/ui/DataTable';
import Button from '../../../components/ui/Button';
import { exportarAExcel } from '../../../utils/excelGenerator';

export default function ClientesList() {
  const navigate = useNavigate();
  
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filtros, setFiltros] = useState({ estado: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchQuery(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const { data, isLoading } = useQuery({
    queryKey: ['clientes', page, limit, searchQuery],
    queryFn: () => clientesServices.getAll(page, limit, searchQuery),
  });

  const clientesCrudos = data?.items || [];
  const totalRegistros = data?.total || 0;
  const totalPages = Math.ceil(totalRegistros / limit);

  const clientes = clientesCrudos.filter(c => {
    if (filtros.estado === 'Activos') return c.estado === true;
    if (filtros.estado === 'Inactivos') return c.estado === false;
    return true;
  });

  const hayFiltros = searchTerm !== "" || filtros.estado !== "";
  const limpiarFiltros = () => {
    setSearchTerm("");
    setSearchQuery("");
    setFiltros({ estado: "" });
    setPage(1);
  };

  const handleExportarExcel = async () => {
    setIsExporting(true);
    toast.info("Generando archivo Excel...");
    try {
      const dataFull = await clientesServices.getAll(1, 10000, searchQuery);
      let clientesExport = dataFull.items || [];

      if (filtros.estado === 'Activos') clientesExport = clientesExport.filter(c => c.estado === true);
      if (filtros.estado === 'Inactivos') clientesExport = clientesExport.filter(c => c.estado === false);

      if (clientesExport.length === 0) {
        toast.warning("No hay datos para exportar con estos filtros.");
        return;
      }

      const datosFormateados = clientesExport.map(c => ({
        'Razón Social': c.razon_social,
        'CUIT / DNI': c.cuit_dni,
        'Dirección': c.direccion || '-',
        'Teléfono': c.telefono || '-',
        'Email': c.email || '-',
        'Estado': c.estado ? 'Activo' : 'Inactivo',
        'Cta. Corriente': c.tiene_cuenta_corriente ? 'Sí' : 'No'
      }));

      exportarAExcel(datosFormateados, 'Reporte_Clientes', 'Clientes');
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error al generar el Excel.");
    } finally {
      setIsExporting(false);
    }
  };

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
        <Button variant="outline" onClick={() => navigate(`/clientes/editar/${fila.id}`)} className="px-2 py-1 h-8" title="Editar">
          <Edit2 size={16} className="text-amber-600" />
        </Button>
      )
    }
  ];

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
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
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

          <div className="flex gap-2 w-full sm:w-auto flex-wrap">
            <Button variant="outline" onClick={handleExportarExcel} disabled={isExporting || isLoading} className="w-full sm:w-auto text-green-700 border-green-200 hover:bg-green-50">
              <Sheet size={18} className="mr-2" />
              {isExporting ? 'Procesando...' : 'Excel'}
            </Button>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="w-full sm:w-auto">
              <Filter size={18} className="mr-2" />
              Filtros {filtros.estado !== "" && "(Activos)"}
            </Button>
            {hayFiltros && (
              <Button variant="outline" onClick={limpiarFiltros} className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50">
                <X size={18} className="mr-2" /> Limpiar
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border animate-in slide-in-from-top-2">
            <div className="flex flex-col">
              <label className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Estado</label>
              <select 
                value={filtros.estado} 
                onChange={(e) => { setFiltros({ estado: e.target.value }); setPage(1); }}
                className="px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="">Todos los Estados</option>
                <option value="Activos">Solo Activos</option>
                <option value="Inactivos">Solo Inactivos</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando...</div>
        ) : (
          <DataTable columns={columnas} data={clientes} />
        )}
        
        {!isLoading && totalPages > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/20">
            <span className="text-sm text-muted-foreground">
              Mostrando página {page} de {totalPages}
            </span>
            <div className="flex gap-2 items-center">
              <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || isLoading} className="px-2 py-1 h-8">
                <ChevronLeft size={18} />
              </Button>
              <Button variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || isLoading} className="px-2 py-1 h-8">
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}