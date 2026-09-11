import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import { movimientosService } from '../../../api/movimientosService';
import { facturaService } from '../../../api/facturaService';
import { pagoService } from '../../../api/pagoService';

import DataTable from '../../../components/ui/DataTable';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';

import { generarReciboPdf } from '../../../utils/pdfRecibos';

export default function CuentaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados de datos
  const [resumen, setResumen] = useState({ saldo_total: 0, cantidad_movimientos: 0 });
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Paginación
  const [page, setPage] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
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

  const fetchDetalle = useCallback(async () => {
    try {
      setLoading(true);
      const [resumenData, movimientosData] = await Promise.all([
        movimientosService.getResumen(id),
        movimientosService.getAllByCliente(id, page, limit)
      ]);

      setResumen(resumenData);
      setMovimientos(movimientosData.items);
      setTotalRegistros(movimientosData.total);
    } catch (err) {
      toast.error('Error al cargar el detalle de la cuenta');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDetalle();
  }, [fetchDetalle]);

  const handleSubmitFactura = async (e) => {
    e.preventDefault();
    try {
      await facturaService.createFactura({
        ...formFactura,
        cliente_id: parseInt(id),
        importe_total: parseFloat(formFactura.importe_total)
      });
      toast.success("Factura registrada y deuda actualizada");
      setModalFacturaOpen(false);
      setFormFactura({ ...formFactura, numero_factura: '', importe_total: '', observaciones: '' });
      fetchDetalle();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al registrar la factura");
    }
  };

  const handleSubmitPago = async (e) => {
    e.preventDefault();
    try {
      const nuevoPago = await pagoService.createPago({
        ...formPago,
        cliente_id: parseInt(id),
        monto: parseFloat(formPago.monto)
      });
      
      toast.success("Pago registrado con éxito");

      const blob = generarReciboPdf(nuevoPago, resumen.razon_social);
      const url = window.URL.createObjectURL(blob);
      
      const pdfWindow = window.open('');
      if (pdfWindow) {
        pdfWindow.document.write(`
          <html>
            <head>
              <title>Recibo_${nuevoPago.numero_recibo}.pdf</title>
              <style>
                body { margin: 0; overflow: hidden; background-color: #333; }
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
        toast.error("El navegador bloqueó la ventana del PDF. Permita las ventanas emergentes.");
      }
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);

      // Cierre de modal y limpieza
      setModalPagoOpen(false);
      setFormPago({ ...formPago, numero_recibo: '', monto: '' });
      fetchDetalle(); 
      
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error al registrar el pago");
    }
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

  const totalPages = Math.ceil(totalRegistros / limit);

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
            <p className="text-muted-foreground text-sm mt-1">Historial del cliente</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            onClick={() => setModalFacturaOpen(true)} 
            variant="outline"
            className="w-full sm:w-auto border-red-200 text-red-700 hover:bg-red-50"
          >
            <FileText size={18} className="mr-2" /> Nueva Factura
          </Button>
          <Button 
            onClick={() => setModalPagoOpen(true)} 
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
          >
            <DollarSign size={18} className="mr-2" /> Registrar Pago
          </Button>
        </div>
      </div>

      {/* Tarjeta de Saldo */}
      <div className={`p-6 rounded-lg border flex flex-col md:flex-row justify-between items-center shadow-sm
          ${resumen.saldo_total > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
        <div>
          <h2 className="text-lg font-medium text-foreground">Estado Actual</h2>
          <p className="text-sm text-muted-foreground">Calculado al instante</p>
        </div>
        <div className="text-right mt-2 md:mt-0">
          <h3 className={`text-4xl font-bold tracking-tight ${resumen.saldo_total > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {resumen.saldo_total > 0 ? 'Debe: ' : 'A favor: '}
            $ {Math.abs(resumen.saldo_total).toLocaleString('es-AR')}
          </h3>
        </div>
      </div>

      {/* Tabla Historial */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        {loading && movimientos.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Cargando historial...</div>
        ) : (
          <DataTable columns={columnas} data={movimientos} />
        )}

        {!loading && totalPages > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/20">
            <span className="text-sm text-muted-foreground">
              Mostrando {movimientos.length} de {totalRegistros}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="px-2 py-1 h-8" disabled={page === 1 || loading} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={18} />
              </Button>
              <span className="text-sm font-medium">Página {page} de {totalPages || 1}</span>
              <Button variant="outline" className="px-2 py-1" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
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
            <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white border-transparent">Generar Cargo</Button>
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
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white border-transparent">Confirmar Pago</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}