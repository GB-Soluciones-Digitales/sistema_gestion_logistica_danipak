import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Ban, Download, Search, ChevronLeft, ChevronRight, Sheet, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { comprobantesService } from '../../../api/comprobantesService';
import { facturaService } from '../../../api/facturaService'; 
import { clientesServices } from '../../../api/clientesServices';
import { localidadService } from '../../../api/localidadService';
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
  const [estadoFiltro, setEstadoFiltro] = useState("");

  const { data: clientesData } = useQuery({ queryKey: ['clientes-select'], queryFn: () => clientesServices.getAll(1, 1000) });
  const clientesSelect = useMemo(() => clientesData?.items || [], [clientesData?.items]);
  const { data: localidadesData } = useQuery({ queryKey: ['localidades-select'], queryFn: () => localidadService.getAll(1, 1000) });
  const localidadesSelect = useMemo(() => localidadesData?.items || [], [localidadesData?.items]);

  // Consumimos el nuevo endpoint unificado
  const { data, isLoading } = useQuery({
    queryKey: ['comprobantes-unificados', currentPage, limit, searchTerm, estadoFiltro],
    queryFn: () => comprobantesService.getUnificadosPaginados(currentPage, limit, searchTerm, estadoFiltro),
  });

  const totalRecords = data?.total || 0;
  const totalPages = Math.ceil(totalRecords / limit);
  const comprobantesPaginados = data?.items || [];

  const anularMutation = useMutation({
    mutationFn: (item) => {
        if(item.es_factura) return facturaService.updateFactura(item.id, { estado: "Anulado" })
        return comprobantesService.updateEstado(item.id, { estado: "Anulado" })
    },
    onSuccess: () => {
      toast.success("Documento anulado");
      queryClient.invalidateQueries({ queryKey: ['comprobantes-unificados'] });
    },
    onError: () => toast.error("Error al anular")
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleEstadoChange = (e) => {
    setEstadoFiltro(e.target.value);
    setCurrentPage(1);
  };

  const limpiarFiltros = () => {
    setSearchTerm("");
    setEstadoFiltro("");
    setCurrentPage(1);
  };

  const handleDescargarPdf = async (item) => {
    if (item.es_factura) {
       toast.info("Descarga de PDF de Factura no implementada");
       return; 
    }

    const pdfWindow = window.open('', '_blank');
    if (!pdfWindow) return toast.error("Habilite los pop-ups.");

    pdfWindow.document.write('<html><body style="background:#333;color:white;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;"><h2>Generando comprobante...</h2></body></html>');
    setDownloadingId(item.id);
    toast.info("Generando PDF...");

    try {
      const comprobanteCompleto = await comprobantesService.getById(item.id);
      
      let nombreCliente = comprobanteCompleto.nombre_remitente || ""; 
      let nombreLocRem = "";
      let nombreLocDest = "";

      const idCliente = comprobanteCompleto.remitente_id || comprobanteCompleto.cliente_remitente_id;
      const idLocOrigen = comprobanteCompleto.localidad_origen_id || comprobanteCompleto.localidad_remitente_id;
      const idLocDestino = comprobanteCompleto.localidad_destino_id || comprobanteCompleto.localidad_destinatario_id;

      if (idCliente) nombreCliente = clientesSelect.find(c => c.id === idCliente)?.razon_social || nombreCliente;
      if (idLocOrigen) nombreLocRem = localidadesSelect.find(l => l.id === idLocOrigen)?.nombre || "";
      if (idLocDestino) nombreLocDest = localidadesSelect.find(l => l.id === idLocDestino)?.nombre || "";

      const nombresResueltos = { cliente: nombreCliente, locRemitente: nombreLocRem, locDestinatario: nombreLocDest };
      
      const blob = await generarPdfLocal(comprobanteCompleto, nombresResueltos);
      const url = window.URL.createObjectURL(blob);
      const titulo = `Comprobante_${comprobanteCompleto.numero_comprobante || 'Offline'}.pdf`;

      pdfWindow.document.open(); 
      pdfWindow.document.write(`<html><head><title>${titulo}</title><style>body { margin: 0; padding: 0; overflow: hidden; background-color: #333; } embed { width: 100vw; height: 100vh; border: none; }</style></head><body><embed src="${url}" type="application/pdf"></body></html>`);
      pdfWindow.document.close();

      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      toast.success("PDF generado exitosamente");
    } catch (error) {
      console.error("Error al generar PDF:", error);
      pdfWindow.close(); 
      toast.error("Error al generar el PDF");
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
      console.error("Error al generar Excel:", error);
      toast.error("Error al generar Excel. Revise las fechas (Máx 93 días).");
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
    { key: 'nombre_destinatario', label: 'Destinatario', render: (fila) => fila.nombre_destinatario || '-' },
    { key: 'importe_flete_cobro', label: 'Importe', render: (fila) => <span className="font-semibold">{formatCurrency(fila.importe_flete_cobro)}</span> },
    { key: 'estado', label: 'Estado',
      render: (fila) => {
        let clases = 'bg-gray-100 text-gray-800';
        if (fila.estado === 'Anulado') clases = 'bg-red-100 text-red-800';
        else if (fila.estado === 'Emitido' || fila.estado === 'pagada') clases = 'bg-green-100 text-green-800';
        else if (fila.estado === 'pendiente') clases = 'bg-yellow-100 text-yellow-800';

        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${clases}`}>
            {fila.estado}
          </span>
        );
      }
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
          <h1 className="text-2xl font-display font-bold text-foreground">Comprobantes</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestión de envíos y remitos.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['comprobantes-unificados'] })} className="w-full sm:w-auto text-muted-foreground">
            <RefreshCw size={18} className="mr-2" /> Refrescar
          </Button>
          <Button onClick={() => navigate('/comprobantes/nuevo')} className="w-full sm:w-auto">
            <Plus size={20} className="mr-2" /> Nuevo Comprobante
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
              <Sheet size={18} className="mr-2" /> {isExporting ? '...' : 'General'}
            </Button>
            
            <Button variant="outline" onClick={() => descargarArchivoBackend('/api/comprobantes/exportar/representante', 'Reporte_Representantes')} disabled={isExporting} className="w-full sm:w-auto text-blue-700 border-blue-200 hover:bg-blue-50">
              <Sheet size={18} className="mr-2" /> {isExporting ? '...' : 'Representantes'}
            </Button>
            
            <select value={estadoFiltro} onChange={handleEstadoChange} className="px-3 py-2 rounded-md border border-input bg-background text-sm">
                <option value="">Todos los Estados</option>
                <option value="Emitido">Emitido</option>
                <option value="pendiente">Pendiente (Factura)</option>
                <option value="pagada">Pagada (Factura)</option>
                <option value="Anulado">Anulado</option>
            </select>
            
            {(searchTerm || estadoFiltro) && (
              <Button variant="outline" onClick={limpiarFiltros} className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50">
                <X size={18} className="mr-2" /> Limpiar
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando datos...</div>
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
                  <Button variant="outline" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-2 py-1 h-8">
                    <ChevronLeft size={18} />
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="px-2 py-1 h-8">
                    <ChevronRight size={18} />
                  </Button>
                </div>
              </>
            )}
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