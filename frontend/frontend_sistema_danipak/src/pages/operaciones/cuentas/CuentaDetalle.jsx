import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, DollarSign, ChevronLeft, ChevronRight, Filter, Sheet } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { movimientosService } from '../../../api/movimientosService';
import { facturaService } from '../../../api/facturaService';
import { pagoService } from '../../../api/pagoService';

import DataTable from '../../../components/ui/DataTable';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';

import { generarReciboPdf } from '../../../utils/pdfReciboPago';
import { exportarAExcel } from '../../../utils/excelGenerator';

export default function CuentaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filtros, setFiltros] = useState({ tipo_movimiento: "", fecha_desde: "", fecha_hasta: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Paginación
  const [page, setPage] = useState(1);
  const limit = 10;

  // Estados de Modales
  const [modalFacturaOpen, setModalFacturaOpen] = useState(false);
  const [modalPagoOpen, setModalPagoOpen] = useState(false);

  // Formularios
  const [formFactura, setFormFactura] = useState({
    numero_factura: '',
    mes_correspondiente: '',
    fecha: new Date().toISOString().split('T')[0],
    importe_total: '',
    observaciones: ''
  });

  const [formPago, setFormPago] = useState({
    numero_recibo: '',
    monto: '',
    metodo_pago: 'Efectivo',
    fecha_pago: new Date().toISOString().split('T')[0]
  });

  const { data: resumen = { saldo_total: 0, cantidad_movimientos: 0, razon_social: 'Cargando...' }, isLoading: loadingResumen } = useQuery({
    queryKey: ['cuenta-resumen', id],
    queryFn: () => movimientosService.getResumen(id),
  });

  const { data: movimientosData, isLoading: loadingMovimientos } = useQuery({
    queryKey: ['cuenta-movimientos', id, page, limit, filtros],
    queryFn: () => movimientosService.getAllByCliente(id, page, limit, null, filtros),
  });

  const movimientos = movimientosData?.items || [];
  const totalRegistros = movimientosData?.total || 0;
  const isLoading = loadingResumen || loadingMovimientos;
  const totalPages = Math.ceil(totalRegistros / limit);

  const facturaMutation = useMutation({
    mutationFn: (nuevaFactura) => facturaService.createFactura(nuevaFactura),
    onSuccess: () => {
      toast.success("Factura registrada y deuda actualizada");
      setModalFacturaOpen(false);
      setFormFactura({ numero_factura: '', mes_correspondiente: '', fecha: new Date().toISOString().split('T')[0], importe_total: '', observaciones: '' });
      queryClient.invalidateQueries({ queryKey: ['cuenta-resumen', id] });
      queryClient.invalidateQueries({ queryKey: ['cuenta-movimientos', id] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || "Error al registrar la factura");
    }
  });

  const pagoMutation = useMutation({
    mutationFn: (nuevoPagoData) => pagoService.createPago(nuevoPagoData),
    onSuccess: (nuevoPago) => {
      toast.success("Pago registrado con éxito");
      
      try {
        const blob = generarReciboPdf(nuevoPago, resumen.razon_social);
        const url = window.URL.createObjectURL(blob);
        const pdfWindow = window.open('');
        if (pdfWindow) {
          pdfWindow.document.write(`
            <html>
              <head>
                <title>Recibo_${nuevoPago.numero_recibo}.pdf</title>
                <style>body { margin: 0; overflow: hidden; background-color: #333; } embed { width: 100vw; height: 100vh; border: none; }</style>
              </head>
              <body><embed src="${url}" type="application/pdf"></body>
            </html>
          `);
          pdfWindow.document.close();
        } else {
          toast.error("El navegador bloqueó la ventana del PDF.");
        }
        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      } catch (e) {
         console.error("Error al generar PDF del recibo", e);
      }

      setModalPagoOpen(false);
      setFormPago({ numero_recibo: '', monto: '', metodo_pago: 'Efectivo', fecha_pago: new Date().toISOString().split('T')[0] });
      
      queryClient.invalidateQueries({ queryKey: ['cuenta-resumen', id] });
      queryClient.invalidateQueries({ queryKey: ['cuenta-movimientos', id] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || "Error al registrar el pago");
    }
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleExportarExcel = async () => {
    setIsExporting(true);
    toast.info("Generando historial en Excel...");
    try {
      const data = await movimientosService.getAllByCliente(id, 1, 10000, null, filtros);
      const movimientosExport = data.items || [];

      const datosFormateados = movimientosExport.map(mov => ({
        'Fecha': new Date(mov.fecha_movimiento).toLocaleDateString('es-AR'),
        'Tipo': mov.tipo_movimiento,
        'Importe ($)': mov.tipo_movimiento === 'Factura' ? mov.importe : -mov.importe,
        'Estado': mov.anulado ? 'Anulado' : 'Válido'
      }));

      const nombreLimpio = resumen.razon_social.replace(/\s+/g, '_');
      exportarAExcel(datosFormateados, `Historial_${nombreLimpio}`, 'Movimientos');
    } catch (error) {
      console.error(error);
      toast.error("Error al generar Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSubmitFactura = (e) => {
    e.preventDefault();
    facturaMutation.mutate({
      ...formFactura,
      cliente_id: parseInt(id),
      importe_total: parseFloat(formFactura.importe_total)
    });
  };

  const handleSubmitPago = (e) => {
    e.preventDefault();
    pagoMutation.mutate({
      ...formPago,
      cliente_id: parseInt(id),
      monto: parseFloat(formPago.monto)
    });
  };

  const columnas = [
    { key: 'fecha_movimiento', label: 'Fecha', render: (fila) => new Date(fila.fecha_movimiento).toLocaleDateString('es-AR') },
    { key: 'tipo_movimiento', label: 'Tipo', 
      render: (fila) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full 
            ${fila.tipo_movimiento === 'Factura' ? 'bg-red-100 text-red-700' : 
              fila.tipo_movimiento === 'Pago' ? 'bg-green-100 text-green-700' : 
              'bg-blue-100 text-blue-700'}`}>
            {fila.tipo_movimiento}
        </span>
      )
    },
    { key: 'importe', label: 'Importe',
      render: (fila) => (
        <span className={`font-medium ${fila.tipo_movimiento === 'Factura' ? 'text-red-600' : 'text-green-600'}`}>
            {fila.tipo_movimiento === 'Factura' ? '+' : '-'}$ {Number(fila.importe).toLocaleString('es-AR')}
        </span>
      )
    },
    { key: 'anulado', label: 'Estado',
      render: (fila) => fila.anulado ? <span className="text-muted-foreground line-through text-xs">Anulado</span> : 'Válido'
    }
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Botón Volver y Acciones */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" className="px-2 h-10" onClick={() => navigate('/cuentas-corrientes')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Detalle de Cuenta</h1>
            <p className="text-muted-foreground text-sm mt-1">Historial de {resumen.razon_social}</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={() => setModalFacturaOpen(true)} variant="outline" className="w-full sm:w-auto border-red-200 text-red-700 hover:bg-red-50">
            <FileText size={20} className="mr-2" /> Nueva Factura
          </Button>
          <Button onClick={() => setModalPagoOpen(true)} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
            <DollarSign size={20} className="mr-2" /> Registrar Pago
          </Button>
        </div>
      </div>

      {/* Tarjeta de Saldo */}
      <div className={`p-6 rounded-lg border flex flex-col md:flex-row justify-between items-center shadow-sm
          ${resumen.saldo_total > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
        <div>
          <h2 className="text-lg font-medium text-foreground">Estado Actual</h2>
        </div>
        <div className="text-right mt-2 md:mt-0">
          <h3 className={`text-4xl font-bold tracking-tight ${resumen.saldo_total > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {resumen.saldo_total > 0 ? 'Debe: ' : 'A favor: '}
            $ {Math.abs(resumen.saldo_total).toLocaleString('es-AR')}
          </h3>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button 
          variant="outline"
          onClick={handleExportarExcel}
          disabled={isExporting || loadingMovimientos}
          className="text-green-700 border-green-200 hover:bg-green-50"
        >
          <Sheet size={18} className="mr-2" />
          {isExporting ? 'Procesando...' : 'Excel'}
        </Button>
        <Button 
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} className="mr-2" />
          Filtros {Object.values(filtros).some(v => v !== "") && "(Activos)"}
        </Button>
      </div>

      {showFilters && (
        <div className="bg-card p-4 rounded-lg border border-border shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in slide-in-from-top-2">
          <div className="flex flex-col">
            <label className="text-[10px] uppercase text-muted-foreground font-bold mb-1">Tipo de Movimiento</label>
            <select 
              name="tipo_movimiento" 
              value={filtros.tipo_movimiento} 
              onChange={handleFilterChange}
              className="px-3 py-2 rounded-md border border-input bg-background text-sm"
            >
              <option value="">Todos los movimientos</option>
              <option value="Factura">Solo Facturas (Cargos)</option>
              <option value="Pago">Solo Pagos (Abonos)</option>
            </select>
          </div>
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

      {/* Tabla Historial */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Cargando historial...</div>
        ) : (
          <DataTable columns={columnas} data={movimientos} />
        )}

        {!isLoading && totalPages > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/20">
            <span className="text-sm text-muted-foreground">
              Mostrando {movimientos.length} de {totalRegistros}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="px-2 py-1 h-8" disabled={page === 1 || isLoading} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={18} />
              </Button>
              <span className="text-sm font-medium">Página {page} de {totalPages || 1}</span>
              <Button variant="outline" className="px-2 py-1 h-8" disabled={page === totalPages || isLoading} onClick={() => setPage(p => p + 1)}>
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <Modal isOpen={modalFacturaOpen} onClose={() => setModalFacturaOpen(false)} title="Cargar Nueva Factura">
        <form onSubmit={handleSubmitFactura} className="space-y-4">
          <Input label="Número de Factura" required placeholder="Ej: 0001-00000123" value={formFactura.numero_factura} onChange={(e) => setFormFactura({...formFactura, numero_factura: e.target.value})} />
          <Input label="Mes Correspondiente" required placeholder="Ej: Septiembre 2026" value={formFactura.mes_correspondiente} onChange={(e) => setFormFactura({...formFactura, mes_correspondiente: e.target.value})} />
          <Input type="date" label="Fecha de Emisión" required value={formFactura.fecha} onChange={(e) => setFormFactura({...formFactura, fecha: e.target.value})} />
          <Input type="number" step="0.01" label="Importe Total ($)" required placeholder="0.00" value={formFactura.importe_total} onChange={(e) => setFormFactura({...formFactura, importe_total: e.target.value})} />
          <Input label="Observaciones (Opcional)" value={formFactura.observaciones} onChange={(e) => setFormFactura({...formFactura, observaciones: e.target.value})} />
          
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={() => setModalFacturaOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={facturaMutation.isPending} className="bg-red-600 hover:bg-red-700 text-white border-transparent">
              {facturaMutation.isPending ? 'Cargando...' : 'Generar Cargo'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalPagoOpen} onClose={() => setModalPagoOpen(false)} title="Registrar Pago">
        <form onSubmit={handleSubmitPago} className="space-y-4">
          <Input label="Número de Recibo interno" required placeholder="Ej: REC-001" value={formPago.numero_recibo} onChange={(e) => setFormPago({...formPago, numero_recibo: e.target.value})} />
          <Input type="number" step="0.01" label="Monto a favor ($)" required placeholder="0.00" value={formPago.monto} onChange={(e) => setFormPago({...formPago, monto: e.target.value})} />
          
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Método de Pago</label>
            <select 
              className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-ring text-sm transition-colors"
              value={formPago.metodo_pago}
              onChange={(e) => setFormPago({...formPago, metodo_pago: e.target.value})}
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia Bancaria</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <Input type="date" label="Fecha de Pago" required value={formPago.fecha_pago} onChange={(e) => setFormPago({...formPago, fecha_pago: e.target.value})} />
          
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={() => setModalPagoOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={pagoMutation.isPending} className="bg-green-600 hover:bg-green-700 text-white border-transparent">
              {pagoMutation.isPending ? 'Registrando...' : 'Confirmar Pago'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}