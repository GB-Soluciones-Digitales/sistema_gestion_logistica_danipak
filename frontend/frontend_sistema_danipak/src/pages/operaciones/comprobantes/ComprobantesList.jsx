import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Ban, Download, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { comprobantesService } from '../../../api/comprobantesService';
import ConfirmDialog from '../../../components/ConfirmDialog'
import { formatDate, formatCurrency } from '../../../utils/formatters';

export default function ComprobantesList() {
  const navigate = useNavigate();
  
  const [comprobantes, setComprobantes] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const [comprobanteAAnular, setComprobanteAAnular] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filtros, setFiltros] = useState({
    tipo: "",
    mes: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchComprobantes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await comprobantesService.getAll(currentPage, limit, searchTerm, filtros);
      setComprobantes(data.items || []);
      setTotalRecords(data.total || 0);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar los comprobantes");
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchTerm, filtros]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchComprobantes();
  }, [fetchComprobantes]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleDescargar = async (id, numero) => {
    toast.info("Generando PDF...");
    try {
      const blob = await comprobantesService.descargarPdf(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Comprobante_${numero}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Descarga completada");
    } catch (error) {
      toast.error("Error al generar el PDF");
      console.log('Error al generar PDF', error)
    }
  };

  const handleAnular = (id) => {
    setComprobanteAAnular(id);
  };

  const confirmarAnulacion = async () => {
    const id = comprobanteAAnular;
    setComprobanteAAnular(null); // cierra el modal ya
    try {
      await comprobantesService.updateEstado(id, { estado: "Anulado" });
      toast.success("Comprobante anulado");
      fetchComprobantes();
    } catch (error) {
      toast.error("Error al anular");
      console.log('Error al anular', error);
    }
  };


  const totalPages = Math.ceil(totalRecords / limit);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Comprobantes</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestión de envíos y remitos.</p>
        </div>
        <button 
          onClick={() => navigate('/comprobantes/nuevo')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity font-medium shadow-sm"
        >
          <Plus size={20} />
          Nuevo Comprobante
        </button>
      </div>

      {/* Buscador y Filtros */}
      <div className="bg-card p-4 rounded-lg border border-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por número o destinatario..." 
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground px-4 py-2 border border-border rounded-md transition-colors"
          >
            <Filter size={18} />
            Filtros {Object.values(filtros).some(v => v !== "") && "(Activos)"}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border animate-in slide-in-from-top-2">
            <select 
              name="tipo" 
              value={filtros.tipo} 
              onChange={handleFilterChange}
              className="px-3 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-ring"
            >
              <option value="">Todos los Tipos</option>
              <option value="Comprobante de Envío">Comprobante de Envío</option>
              <option value="Remito">Remito</option>
            </select>
            <select 
              name="mes" 
              value={filtros.mes} 
              onChange={handleFilterChange}
              className="px-3 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-ring"
            >
              <option value="">Cualquier Mes</option>
              <option value="1">Enero</option>
              <option value="2">Febrero</option>
              <option value="3">Marzo</option>
              <option value="4">Abril</option>
              <option value="5">Mayo</option>
              <option value="6">Junio</option>
              <option value="7">Julio</option>
              <option value="8">Agosto</option>
              <option value="9">Septiembre</option>
              <option value="10">Octubre</option>
              <option value="11">Noviembre</option>
              <option value="12">Diciembre</option>
            </select>
          </div>
        )}
      </div>

      {/* Grilla */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-secondary/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Número</th>
                <th className="px-4 py-3 font-medium">Destinatario</th>
                <th className="px-4 py-3 font-medium">Flete Cobrar</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8">Cargando...</td></tr>
              ) : comprobantes.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-muted-foreground">No se encontraron comprobantes.</td></tr>
              ) : (
                comprobantes.map(item => (
                  <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">{formatDate(item.fecha_emision)}</td>
                    <td className="px-4 py-3 font-medium">{item.numero_comprobante}</td>
                    <td className="px-4 py-3">{item.nombre_destinatario}</td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(item.importe_flete_cobro)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.estado === 'Anulado' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {item.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => navigate(`/comprobantes/${item.id}`)} className="text-blue-600 hover:opacity-80 p-1" title="Ver">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => handleDescargar(item.id, item.numero_comprobante)} className="text-green-600 hover:opacity-80 p-1" title="Descargar PDF">
                        <Download size={18} />
                      </button>
                      <button onClick={() => navigate(`/comprobantes/editar/${item.id}`)} className="text-amber-600 hover:opacity-80 p-1" title="Editar" disabled={item.estado === 'Anulado'}>
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleAnular(item.id)} className="text-red-600 hover:opacity-80 p-1" title="Anular" disabled={item.estado === 'Anulado'}>
                        <Ban size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginacion */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/20">
            <span className="text-sm text-muted-foreground">
              Mostrando página {currentPage} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded border border-border bg-background hover:bg-secondary disabled:opacity-50"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded border border-border bg-background hover:bg-secondary disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={comprobanteAAnular !== null}
        title="¿Anular comprobante?"
        message="Esta acción no se puede deshacer."
        confirmText="Sí, anular"
        variant="danger"
        onConfirm={confirmarAnulacion}
        onCancel={() => setComprobanteAAnular(null)}
      />
      
    </div>
  );
}