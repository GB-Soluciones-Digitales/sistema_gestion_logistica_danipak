import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { comprobantesService } from '../../../api/comprobantesService';
import { clientesServices } from '../../../api/clientesServices';
import { localidadService } from '../../../api/localidadService';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { generarPdfLocal } from '../../../utils/pdfGenerator';
import Button from '../../../components/ui/Button';

export default function ComprobanteView() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [comprobante, setComprobante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [nombres, setNombres] = useState({ cliente: '', locRemitente: '', locDestinatario: '' });

  useEffect(() => {
    const fetchComprobante = async () => {
      try {
        const data = await comprobantesService.getById(id);
        setComprobante(data);

        try {
          const [clienteData, locRemData, locDestData] = await Promise.all([
            clientesServices.getById(data.cliente_remitente_id),
            localidadService.getById(data.localidad_remitente_id),
            localidadService.getById(data.localidad_destinatario_id)
          ]);

          setNombres({
            cliente: clienteData.razon_social || clienteData.nombre_fantasia || `ID: ${data.cliente_remitente_id}`,
            locRemitente: locRemData.nombre || `ID: ${data.localidad_remitente_id}`,
            locDestinatario: locDestData.nombre || `ID: ${data.localidad_destinatario_id}`
          });
        } catch (err) {
          console.error("Error al cargar datos vinculados", err);
          setNombres({
            cliente: `ID: ${data.cliente_remitente_id}`,
            locRemitente: `ID: ${data.localidad_remitente_id}`,
            locDestinatario: `ID: ${data.localidad_destinatario_id}`
          });
        }

      } catch (error) {
        console.error(error);
        toast.error("Error al cargar el comprobante.");
      } finally {
        setLoading(false);
      }
    };

    fetchComprobante();
  }, [id]);

  const handleDescargarPdf = async () => {
    const pdfWindow = window.open('', '_blank');
    
    if (!pdfWindow) {
      toast.error("El navegador bloqueó la ventana emergente. Por favor, habilite los pop-ups.");
      return;
    }

    pdfWindow.document.write('<html><body style="background:#333;color:white;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;"><h2>Generando comprobante...</h2></body></html>');
    
    setDownloading(true);
    toast.info("Generando PDF...");

    try {
      const blob = await generarPdfLocal(comprobante, nombres);
      const url = window.URL.createObjectURL(blob);
      const titulo = `Comprobante_${comprobante.numero_comprobante || 'Offline'}.pdf`;

      pdfWindow.document.open();
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

      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      toast.success("PDF generado exitosamente");
    } catch (error) {
      console.error(error);
      pdfWindow.close();
      toast.error("Error al generar el PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!comprobante) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-semibold">Comprobante no encontrado</h2>
        <button onClick={() => navigate('/comprobantes')} className="text-primary hover:underline">
          Volver al listado
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      
      {/* HEADER & ACCIONES */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/comprobantes')}
            className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground"
            aria-label="Volver"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <FileText className="text-primary w-5 h-5" />
              <h1 className="text-xl font-display font-bold text-foreground">
                Comprobante N° {comprobante.numero_comprobante}
              </h1>
            </div>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              comprobante.estado === 'Anulado' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}>
              {comprobante.estado}
            </span>
          </div>
        </div>

        <Button 
          onClick={handleDescargarPdf}
          disabled={downloading}
          className="w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <Download size={18} />
          {downloading ? 'Descargando...' : 'Descargar PDF'}
        </Button>
      </div>

      {/* CUERPO DEL COMPROBANTE */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        
        {/* Cabecera Info Básica */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-5 bg-secondary/30 border-b border-border">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Fecha Emisión</p>
            <p className="font-medium text-foreground mt-1">{formatDate(comprobante.fecha_emision)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Tipo</p>
            <p className="font-medium text-foreground mt-1 uppercase">{comprobante.tipo}</p>
          </div>
        </div>

        {/* Remitente y Destinatario */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-border">
          
          {/* Remitente */}
          <div className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              Datos del Remitente
            </h3>
            <div>
              <p className="text-xs text-muted-foreground">Cliente</p>
              <p className="font-medium text-foreground">{nombres.cliente}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Domicilio</p>
              <p className="font-medium text-foreground">{comprobante.domicilio_remitente}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Localidad</p>
              <p className="font-medium text-foreground">{nombres.locRemitente}</p>
            </div>
          </div>

          {/* Destinatario */}
          <div className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-foreground"></div>
              Datos del Destinatario
            </h3>
            <div>
              <p className="text-xs text-muted-foreground">Nombre</p>
              <p className="font-medium text-foreground">{comprobante.nombre_destinatario}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Domicilio</p>
              <p className="font-medium text-foreground">{comprobante.domicilio_destinatario}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Localidad</p>
              <p className="font-medium text-foreground">{nombres.locDestinatario}</p>
            </div>
          </div>
        </div>

        {/* Importes y Bultos */}
        <div className="p-5 border-t border-border bg-secondary/10">
          <h3 className="text-sm font-bold text-muted-foreground uppercase mb-4">Detalles del Envío</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-background p-3 rounded-md border border-border">
              <p className="text-xs text-muted-foreground">Bultos</p>
              <p className="text-lg font-bold text-foreground mt-1">{comprobante.cantidad_bultos}</p>
            </div>
            <div className="bg-background p-3 rounded-md border border-border">
              <p className="text-xs text-muted-foreground">C/R</p>
              <p className="text-lg font-bold text-foreground mt-1">{formatCurrency(comprobante.importe_contra_reembolso)}</p>
            </div>
            <div className="bg-background p-3 rounded-md border border-border">
              <p className="text-xs text-muted-foreground">Flete Pago</p>
              <p className="text-lg font-bold text-foreground mt-1">{formatCurrency(comprobante.importe_flete_pago)}</p>
            </div>
            <div className="bg-background p-3 rounded-md border border-border border-l-4 border-l-primary">
              <p className="text-xs text-muted-foreground">Flete a Cobrar</p>
              <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(comprobante.importe_flete_cobro)}</p>
            </div>
          </div>
        </div>

        {/* Observaciones */}
        {comprobante.observaciones && (
          <div className="p-5 border-t border-border">
            <h3 className="text-sm font-bold text-muted-foreground uppercase mb-2">Observaciones</h3>
            <p className="text-sm text-foreground bg-secondary/30 p-3 rounded-md border border-border italic">
              {comprobante.observaciones}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}