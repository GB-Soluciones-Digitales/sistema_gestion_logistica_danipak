import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Ban, Download, Search, Filter, ChevronLeft, ChevronRight, Sheet, X, RefreshCw, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { comprobantesService } from '../../../api/comprobantesService';
import { facturaService } from '../../../api/facturaService'; 
import { clientesServices } from '../../../api/clientesServices';
import ConfirmDialog from '../../../components/ConfirmDialog';
import DataTable from '../../../components/ui/DataTable';
import Button from '../../../components/ui/Button';
import { formatDate, formatCurrency } from '../../../utils/formatters';
import { generarPdfLocal } from '../../../utils/pdfGenerator';

export default function ComprobantesList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const [comprobanteAAnular, setComprobanteAAnular] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [filtros, setFiltros] = useState({ tipos: [], estado: "", fecha_desde: "", fecha_hasta: "", cliente_id: "", localidad_id: "" });
  const [showFilters, setShowFilters] = useState(false);

  const { data: clientesData } = useQuery({
    queryKey: ['clientes-select'],
    queryFn: () => clientesServices.getAll(1, 1000),
  });
  const clientesSelect = clientesData?.items || [];

  const { data: compData, isLoading: isLoadingComp } = useQuery({
    queryKey: ['comprobantes-raw'],
    queryFn: () => comprobantesService.getAll(1, 1000), 
  });

  const { data: factData, isLoading: isLoadingFact } = useQuery({
    queryKey: ['facturas-raw'],
    queryFn: () => facturaService.getAll(1, 1000),
  });

  const isLoading = isLoadingComp || isLoadingFact;

  const datosUnificadosYFiltrados = useMemo(() => {
    let unificados = [];

    if (compData?.items) {
      unificados = [...unificados, ...compData.items.map(c => ({...c, es_factura: false}))];
    }
    if (factData?.items) {
      unificados = [...unificados, ...factData.items.map(f => ({
        ...f,
        es_factura: true,
        tipo: 'Factura',
        numero_comprobante: f.numero_factura,
        nombre_destinatario: f.cliente?.razon_social || '-',
        importe_flete_cobro: f.monto_total,
      }))];
    }

    unificados.sort((a, b) => new Date(b.fecha_emision) - new Date(a.fecha_emision));

    return unificados.filter(item => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const num = String(item.numero_comprobante || '').toLowerCase();
        const dest = String(item.nombre_destinatario || '').toLowerCase();
        if (!num.includes(searchLower) && !dest.includes(searchLower)) return false;
      }

      if (filtros.tipos.length > 0) {
        if (!filtros.tipos.includes(item.tipo)) return false;
      }

      if (filtros.estado && item.estado !== filtros.estado) return false;

      if (filtros.fecha_desde && new Date(item.fecha_emision) < new Date(filtros.fecha_desde)) return false;
      if (filtros.fecha_hasta && new Date(item.fecha_emision) > new Date(filtros.fecha_hasta)) return false;

      if (filtros.cliente_id) {
        const itemClienteId = item.es_factura ? item.cliente_id : item.remitente_id; // Ajustar según tu BD
        if (String(itemClienteId) !== String(filtros.cliente_id)) return false;
      }

      return true;
    });

  }, [compData, factData, searchTerm, filtros]);

  const totalRecords = datosUnificadosYFiltrados.length;
  const totalPages = Math.ceil(totalRecords / limit);
  const comprobantesPaginados = datosUnificadosYFiltrados.slice((currentPage - 1) * limit, currentPage * limit);

  const anularMutation = useMutation({
    mutationFn: (item) => {
      if (item.es_factura) {
        return facturaService.updateFactura(item.id, { estado: "Anulado" });
      } else {
        return comprobantesService.updateEstado(item.id, { estado: "Anulado" });
      }
    },
    onSuccess: () => {
      toast.success("Documento anulado");
      queryClient.invalidateQueries({ queryKey: ['comprobantes-raw'] });
      queryClient.invalidateQueries({ queryKey: ['facturas-raw'] });
    },
    onError: (error) => {
      toast.error("Error al anular");
      console.error(error);
    }
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const toggleTipoFiltro = (tipoAAlternar) => {
    setFiltros(prev => {
      const nuevosTipos = prev.tipos.includes(tipoAAlternar)
        ? prev.tipos.filter(t => t !== tipoAAlternar)
        : [...prev.tipos, tipoAAlternar];
      return { ...prev, tipos: nuevosTipos };
    });
    setCurrentPage(1);
  };

  const hayFiltros = searchTerm !== "" || filtros.tipos.length > 0 || filtros.estado !== "" || filtros.fecha_desde !== "" || filtros.fecha_hasta !== "" || filtros.cliente_id !== "" || filtros.localidad_id !== "";
  
  const limpiarFiltros = () => {
    setSearchTerm("");
    setFiltros({ tipos: [], estado: "", fecha_desde: "", fecha_hasta: "", cliente_id: "", localidad_id: "" });
    setCurrentPage(1);
  };

  const handleDescargarPdf = async (item) => {
    if (item.es_factura) {
       toast.info("Descarga de PDF de Factura en desarrollo");
       return; 
    }

    const pdfWindow = window.open('', '_blank');
    if (!pdfWindow) {
      toast.error("El navegador bloqueó la ventana emergente.");
      return;
    }
    pdfWindow.document.write('<html><body style="background:#333;color:white;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;"><h2>Generando comprobante...</h2></body></html>');
    
    setDownloadingId(item.id);
    try {
      const comprobanteCompleto = await comprobantesService.getById(item.id);

      const blob = await generarPdfLocal(comprobanteCompleto);
      const url = window.URL.createObjectURL(blob);
      pdfWindow.document.open(); 
      pdfWindow.document.write(`<html><head><title>Comprobante</title><style>body{margin:0;overflow:hidden;background:#333;}embed{width:100vw;height:100vh;border:none;}</style></head><body><embed src="${url}" type="application/pdf"></body></html>`);
      pdfWindow.document.close();
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (error) {
      pdfWindow.close(); 
      toast.error("Error al generar el PDF");
      console.error(error);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleAnular = (item) => {
    setComprobanteAAnular(item);
  };

  const confirmarAnulacion = () => {
    const item = comprobanteAAnular;
    setComprobanteAAnular(null);
    anularMutation.mutate(item);
  };

  const descargarArchivoBackend = async (urlEndpoint, nombreArchivo) => {
    setIsExporting(true);
    toast.info("Generando archivo Excel...");
    try {
      const response = await comprobantesService.descargarExcel(urlEndpoint);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${nombreArchivo}_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Excel descargado correctamente");
    } catch (error) {
      toast.error("Ocurrió un error al descargar.");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const columnas = [
    { key: 'fecha_emision', label: 'Fecha Emisión', render: (fila) => formatDate(fila.fecha_emision) },
    { key: 'tipo_comprobante', label: 'Tipo', render: (fila) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${fila.es_factura ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800'}`}>
          {fila.tipo || '-'}
        </span>
      ) 
    },
    { key: 'numero_comprobante', label: 'Número', render: (fila) => <span className="font-medium">{fila.numero_comprobante}</span> },
    { key: 'nombre_destinatario', label: 'Destinatario/Cliente', render: (fila) => fila.nombre_destinatario || '-' },
    { key: 'importe_flete_cobro', label: 'Importe', render: (fila) => <span className="font-semibold">{formatCurrency(fila.importe_flete_cobro)}</span> },
    { key: 'estado', label: 'Estado',
      render: (fila) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${fila.estado === 'Anulado' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {fila.estado}
        </span>
      )
    },
    { key: 'acciones', label: 'Acciones',
      render: (fila) => (
        <div className="flex gap-1">
          <Button variant="outline" onClick={() => navigate(fila.es_factura ? `/facturas/${fila.id}` : `/comprobantes/${fila.id}`)} className="px-2 py-1 h-8" title="Ver">
            <Eye size={16} className="text-blue-600" />
          </Button>
          {!fila.es_factura && (
            <Button variant="outline" onClick={() => handleDescargarPdf(fila)} disabled={downloadingId === fila.id} className="px-2 py-1 h-8" title="Descargar PDF">
              <Download size={16} className="text-green-600" />
            </Button>
          )}
          {!fila.es_factura && (
            <Button variant="outline" onClick={() => navigate(`/comprobantes/editar/${fila.id}`)} disabled={fila.estado === 'Anulado'} className="px-2 py-1 h-8" title="Editar">
              <Pencil size={16} className="text-amber-600" />
            </Button>
          )}
          <Button variant="outline" onClick={() => handleAnular(fila)} disabled={fila.estado === 'Anulado' || anularMutation.isPending} className="px-2 py-1 h-8" title="Anular">
            <Ban size={16} className="text-red-600" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Comprobantes y Facturas</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestión unificada de documentos.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => {queryClient.invalidateQueries({ queryKey: ['comprobantes-raw'] }); queryClient.invalidateQueries({ queryKey: ['facturas-raw'] })}} className="w-full sm:w-auto text-muted-foreground">
            <RefreshCw size={18} className="mr-2" /> Refrescar
          </Button>
          <Button onClick={() => navigate('/comprobantes/nuevo')} className="w-full sm:w-auto">
            <Plus size={20} className="mr-2" /> Nuevo
          </Button>
        </div>
      </div>

      <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por número o destinatario..." 
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto flex-wrap">
            <Button variant="outline" onClick={() => descargarArchivoBackend('/api/comprobantes/exportar/general', 'Reporte_General')} disabled={isExporting} className="w-full sm:w-auto text-green-700 border-green-200 hover:bg-green-50">
              <Sheet size={18} className="mr-2" /> {isExporting ? 'Procesando...' : 'General'}
            </Button>
            
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="w-full sm:w-auto">
              <Filter size={18} className="mr-2" /> Filtros {hayFiltros && "(Activos)"}
            </Button>
            
            {hayFiltros && (
              <Button variant="outline" onClick={limpiarFiltros} className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50">
                <X size={18} className="mr-2" /> Limpiar
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 mt-4 border-t border-border animate-in slide-in-from-top-2">
            
            <div className="flex flex-col col-span-1 sm:col-span-4 bg-secondary/30 p-3 rounded-md border border-border">
              <label className="text-[10px] uppercase text-muted-foreground font-bold mb-2">Tipos de Documento a Mostrar:</label>
              <div className="flex flex-wrap gap-4">
                {["Comprobante de Envío", "Remito", "Factura"].map(tipoDoc => (
                  <label key={tipoDoc} className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${filtros.tipos.includes(tipoDoc) ? 'bg-primary border-primary' : 'bg-background border-input group-hover:border-primary'}`}>
                      {filtros.tipos.includes(tipoDoc) && <Check size={14} className="text-primary-foreground" />}
                    </div>
                    <span className="text-sm font-medium">{tipoDoc}</span>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={filtros.tipos.includes(tipoDoc)} 
                      onChange={() => toggleTipoFiltro(tipoDoc)} 
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Cliente (Remitente)</label>
              <select name="cliente_id" value={filtros.cliente_id} onChange={handleFilterChange} className="px-3 py-2 rounded-md border border-input bg-background text-sm">
                <option value="">Todos</option>
                {clientesSelect.map(c => <option key={c.id} value={c.id}>{c.razon_social}</option>)}
              </select>
            </div>
            
            <div className="flex flex-col">
              <label className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Estado</label>
              <select name="estado" value={filtros.estado} onChange={handleFilterChange} className="px-3 py-2 rounded-md border border-input bg-background text-sm">
                <option value="">Todos</option>
                <option value="Emitido">Emitido</option>
                <option value="Anulado">Anulado</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Desde</label>
              <input type="date" name="fecha_desde" value={filtros.fecha_desde} onChange={handleFilterChange} className="px-3 py-2 rounded-md border border-input bg-background text-sm" />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Hasta</label>
              <input type="date" name="fecha_hasta" value={filtros.fecha_hasta} onChange={handleFilterChange} className="px-3 py-2 rounded-md border border-input bg-background text-sm" />
            </div>
          </div>
        )}
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando documentos...</div>
        ) : (
          <DataTable columns={columnas} data={comprobantesPaginados} />
        )}
        
        {!isLoading && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/20">
            <span className="text-sm text-muted-foreground">
              Total: <span className="font-medium text-foreground">{totalRecords}</span> registros
            </span>
            {totalPages > 0 && (
              <>
                <span className="text-sm text-muted-foreground">Página {currentPage} de {totalPages}</span>
                <div className="flex gap-2 items-center">
                  <Button variant="outline" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-2 py-1 h-8"><ChevronLeft size={18} /></Button>
                  <Button variant="outline" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="px-2 py-1 h-8"><ChevronRight size={18} /></Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={comprobanteAAnular !== null}
        title={`¿Anular ${comprobanteAAnular?.tipo}?`}
        message="Esta acción no se puede deshacer."
        confirmText="Sí, anular"
        variant="danger"
        onConfirm={confirmarAnulacion}
        onCancel={() => setComprobanteAAnular(null)}
      />
    </div>
  );
}