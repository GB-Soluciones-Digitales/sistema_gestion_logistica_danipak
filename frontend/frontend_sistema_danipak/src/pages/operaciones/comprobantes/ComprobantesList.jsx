import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Ban, Download, Search, Filter, ChevronLeft, ChevronRight, Sheet } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as XLSX from 'xlsx';

import { comprobantesService } from '../../../api/comprobantesService';
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
  const [downloading, setDownloading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtros, setFiltros] = useState({ tipo: "", mes: "", fecha_desde: "", fecha_hasta: "" });
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['comprobantes', currentPage, limit, searchTerm, filtros],
    queryFn: () => comprobantesService.getAll(currentPage, limit, searchTerm, filtros),
  });

  const comprobantes = data?.items || [];
  const totalRecords = data?.total || 0;
  const totalPages = Math.ceil(totalRecords / limit);

  const anularMutation = useMutation({
    mutationFn: (id) => comprobantesService.updateEstado(id, { estado: "Anulado" }),
    onSuccess: () => {
      toast.success("Comprobante anulado");
      queryClient.invalidateQueries({ queryKey: ['comprobantes'] });
    },
    onError: (error) => {
      toast.error("Error al anular");
      console.error("Error al anular", error);
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

  const handleDescargarPdf = async (fila) => {
    setDownloading(true);
    toast.info("Generando PDF...");
    try {
      const blob = generarPdfLocal(fila);
      
      const url = window.URL.createObjectURL(blob);
      const titulo = `Comprobante_${fila.numero_comprobante || 'Offline'}.pdf`;

      const pdfWindow = window.open('');
      if (pdfWindow) {
        pdfWindow.document.write(`
          <html>
            <head>
              <title>${titulo}</title>
              <style>
                body { margin: 0; padding: 0; overflow: hidden; background-color: #333; }
                embed { width: 100vw; height: 100vh; border: none; }
              </style>
            </head>
            <body>
              <embed src="${url}" type="application/pdf">
            </body>
          </html>
        `);
        pdfWindow.document.close();
      } else {
        toast.error("El navegador bloqueó la ventana emergente.");
      }

      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      toast.success("PDF generado exitosamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al generar el PDF");
    } finally {
      setDownloading(false);
    }
  };

  const handleAnular = (id) => {
    setComprobanteAAnular(id);
  };

  const confirmarAnulacion = () => {
    const id = comprobanteAAnular;
    setComprobanteAAnular(null);
    anularMutation.mutate(id);
  };

  const handleExportarExcel = async () => {
    setIsExporting(true);
    toast.info("Generando archivo Excel...");
    try {
      const data = await comprobantesService.getAll(1, 10000, searchTerm, filtros);
      const comprobantesExport = data.items || [];

      if (comprobantesExport.length === 0) {
        toast.warning("No hay datos para exportar con estos filtros.");
        return;
      }

      const datosFormateados = comprobantesExport.map(comp => ({
        'Fecha Emisión': formatDate(comp.fecha_emision),
        'Tipo': comp.tipo_comprobante || comp.tipo,
        'Número': comp.numero_comprobante,
        'Remitente': comp.cliente?.razon_social || '-',
        'Destinatario': comp.nombre_destinatario,
        'Bultos': comp.cantidad_bultos,
        'Flete a Cobrar ($)': comp.importe_flete_cobro,
        'Estado': comp.estado
      }));

      const hoja = XLSX.utils.json_to_sheet(datosFormateados);
      const libro = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(libro, hoja, "Comprobantes");
      
      XLSX.writeFile(libro, `Reporte_Comprobantes_${new Date().getTime()}.xlsx`);
      toast.success("Excel descargado correctamente");
    } catch (error) {
      console.error("Error exportando a Excel", error);
      toast.error("Ocurrió un error al generar el Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  const columnas = [
    { key: 'fecha_emision', label: 'Fecha Emisión', render: (fila) => formatDate(fila.fecha_emision) },
    { key: 'tipo_comprobante', label: 'Tipo', render: (fila) => fila.tipo_comprobante || '-' },
    { key: 'numero_comprobante', label: 'Número', render: (fila) => <span className="font-medium">{fila.numero_comprobante}</span> },
    { key: 'nombre_destinatario', label: 'Destinatario', render: (fila) => fila.nombre_destinatario || '-' },
    { key: 'importe_flete_cobro', label: 'Flete Cobrar', render: (fila) => <span className="font-semibold">{formatCurrency(fila.importe_flete_cobro)}</span> },
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
          <Button variant="outline" onClick={() => navigate(`/comprobantes/${fila.id}`)} className="px-2 py-1 h-8" title="Ver">
            <Eye size={16} className="text-blue-600" />
          </Button>
          <Button variant="outline" onClick={() => handleDescargarPdf(fila)} disabled={downloading} className="px-2 py-1 h-8" title="Descargar PDF">
            <Download size={16} className="text-green-600" />
          </Button>
          <Button variant="outline" onClick={() => navigate(`/comprobantes/editar/${fila.id}`)} disabled={fila.estado === 'Anulado'} className="px-2 py-1 h-8" title="Editar">
            <Pencil size={16} className="text-amber-600" />
          </Button>
          <Button variant="outline" onClick={() => handleAnular(fila.id)} disabled={fila.estado === 'Anulado' || anularMutation.isPending} className="px-2 py-1 h-8" title="Anular">
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
        <Button onClick={() => navigate('/comprobantes/nuevo')} className="w-full sm:w-auto">
          <Plus size={20} className="mr-2" />
          Nuevo Comprobante
        </Button>
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

          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline"
              onClick={handleExportarExcel}
              disabled={isExporting || isLoading}
              className="w-full sm:w-auto text-green-700 border-green-200 hover:bg-green-50"
            >
              <Sheet size={18} className="mr-2" />
              {isExporting ? 'Procesando...' : 'Excel'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full sm:w-auto"
            >
              <Filter size={18} className="mr-2" />
              Filtros {Object.values(filtros).some(v => v !== "") && "(Activos)"}
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-border animate-in slide-in-from-top-2">
            <select 
              name="tipo" 
              value={filtros.tipo} 
              onChange={handleFilterChange}
              className="px-3 py-2 rounded-md border border-input bg-background text-sm"
            >
              <option value="">Todos los Tipos</option>
              <option value="Comprobante de Envío">Envío</option>
              <option value="Remito">Remito</option>
            </select>
            <select 
              name="mes" 
              value={filtros.mes} 
              onChange={handleFilterChange}
              className="px-3 py-2 rounded-md border border-input bg-background text-sm"
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
            <div className="flex flex-col">
              <label className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Desde</label>
              <input 
                type="date" 
                name="fecha_desde" 
                value={filtros.fecha_desde} 
                onChange={handleFilterChange}
                className="px-3 py-2 rounded-md border border-input bg-background text-sm"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Hasta</label>
              <input 
                type="date" 
                name="fecha_hasta" 
                value={filtros.fecha_hasta} 
                onChange={handleFilterChange}
                className="px-3 py-2 rounded-md border border-input bg-background text-sm"
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando...</div>
        ) : (
          <DataTable columns={columnas} data={comprobantes} />
        )}
        
        {!isLoading && totalPages > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/20">
            <span className="text-sm text-muted-foreground">
              Mostrando página {comprobantes.length} de {totalRecords} comprobantes
            </span>
            <div className="flex gap-2 items-center">
              <Button variant="outline" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1 || isLoading} className="px-2 py-1 h-8">
                <ChevronLeft size={18} />
              </Button>
              <Button variant="outline" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="px-2 py-1 h-8">
                <ChevronRight size={18} />
              </Button>
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