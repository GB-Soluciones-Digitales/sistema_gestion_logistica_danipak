import { jsPDF } from 'jspdf';
import { empresaService } from '../api/empresaService'; //

const getDatosEmpresa = async () => {
  try {
    const empresa = await empresaService.getById(1);
    return {
      nombre: empresa.nombre.toUpperCase(),
      telefonos: empresa.telefono_aux ? `Tel. / Cel.: ${empresa.telefono} / ${empresa.telefono_aux}` : `Tel: ${empresa.telefono}`,
      direccion: empresa.direccion
    };
  } catch (error) {
    console.error('Error al obtener datos de la empresa:', error);
    return {
      nombre: "EXPRESO DANIPAK",
      telefonos: "Tel. / Cel.: (0343) 155-104448 / 154-588697",
      direccion: "(3100) Paraná - Entre Ríos"
    };
  }
};

const dibujarTicket = (doc, startY, comprobante, nombres, datosEmpresa) => {
  const x = 10;
  let y = startY;

  // ==========================================
  // 1. ENCABEZADO
  // ==========================================
  doc.setFontSize(7);
  doc.text("DOCUMENTO NO VÁLIDO COMO FACTURA", 105, y + 2, { align: "center" });

  // Recuadro principal
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y + 4, 190, 28, 1, 1);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("EXPRESO", x + 10, y + 14);
  doc.setFontSize(22);
  
  // INYECCIÓN DINÁMICA DE EMPRESA
  doc.text(datosEmpresa.nombre, x + 10, y + 22);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(datosEmpresa.telefonos, x + 5, y + 27);
  doc.text(datosEmpresa.direccion, x + 15, y + 31);

  // Recuadro central "X"
  doc.rect(100, y + 12, 10, 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("X", 105, y + 19, { align: "center" });

  // Datos derecha (Nro y Fecha)
  doc.setFontSize(12);
  doc.text("COMPROBANTE DE ENVÍO", 120, y + 14);
  doc.setFontSize(11);
  doc.text(`N° ${comprobante.numero_comprobante || 'PENDIENTE'}`, 120, y + 20);

  doc.text("Fecha", 120, y + 28);
  
  // Extraer fecha segura
  const fecha = comprobante.fecha_emision ? new Date(comprobante.fecha_emision) : new Date();
  const dia = String(fecha.getDate() + 1).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = String(fecha.getFullYear());

  // Cajas de fecha
  doc.rect(135, y + 24, 10, 6);
  doc.text(dia, 140, y + 28.5, { align: "center" });
  doc.rect(147, y + 24, 10, 6);
  doc.text(mes, 152, y + 28.5, { align: "center" });
  doc.rect(159, y + 24, 15, 6);
  doc.text(anio, 166.5, y + 28.5, { align: "center" });

  // ==========================================
  // 2. CUERPO PRINCIPAL
  // ==========================================
  y = y + 34; // Bajamos al inicio del cuerpo
  
  // Recuadro exterior del cuerpo (95mm de alto)
  doc.roundedRect(x, y, 190, 95, 1, 1);

  // --- Fila 1: Remitente ---
  doc.setFontSize(9);
  doc.text("Remitente", x + 3, y + 7);
  doc.rect(x + 20, y + 3, 165, 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(nombres.cliente || String(comprobante.cliente_remitente_id || ''), x + 22, y + 7.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Domicilio", x + 3, y + 17);
  doc.rect(x + 20, y + 13, 90, 6);
  doc.text((comprobante.domicilio_remitente || '').substring(0, 45), x + 22, y + 17.5);

  doc.text("Localidad", x + 115, y + 17);
  doc.rect(x + 132, y + 13, 53, 6);
  doc.text(nombres.locRemitente || String(comprobante.localidad_remitente_id || ''), x + 134, y + 17.5);

  doc.line(x, y + 20, x + 190, y + 20); // Separador horizontal

  // --- Fila 2: Destinatario ---
  doc.text("Destinatario", x + 3, y + 27);
  doc.rect(x + 22, y + 23, 163, 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(comprobante.nombre_destinatario || '', x + 24, y + 27.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Domicilio", x + 3, y + 37);
  doc.rect(x + 20, y + 33, 90, 6);
  doc.text((comprobante.domicilio_destinatario || '').substring(0, 45), x + 22, y + 37.5);

  doc.text("Localidad", x + 115, y + 37);
  doc.rect(x + 132, y + 33, 53, 6);
  doc.text(nombres.locDestinatario || String(comprobante.localidad_destinatario_id || ''), x + 134, y + 37.5);

  doc.line(x, y + 40, x + 190, y + 40); // Separador horizontal

  // --- Fila 3: Importes y Bultos ---
  doc.line(x + 95, y + 40, x + 95, y + 60);
  doc.line(x + 140, y + 40, x + 140, y + 60);

  doc.text("Cantidad de bultos", x + 3, y + 47);
  doc.rect(x + 32, y + 43, 60, 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(String(comprobante.cantidad_bultos || '0'), x + 34, y + 47.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("C/R", x + 3, y + 56);
  doc.rect(x + 12, y + 52, 80, 6);
  const crVal = comprobante.importe_contra_reembolso ? `$${comprobante.importe_contra_reembolso}` : "";
  doc.text(crVal, x + 14, y + 56.5);

  doc.text("Flete pago", x + 117.5, y + 47, { align: "center" });
  doc.rect(x + 100, y + 51, 35, 7);
  const fpVal = comprobante.importe_flete_pago ? `$${comprobante.importe_flete_pago}` : "";
  doc.text(fpVal, x + 117.5, y + 56, { align: "center" });

  doc.text("Flete a cobrar", x + 165, y + 47, { align: "center" });
  doc.rect(x + 145, y + 51, 40, 7);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  const fcVal = comprobante.importe_flete_cobro ? `$${comprobante.importe_flete_cobro}` : "";
  doc.text(fcVal, x + 165, y + 56, { align: "center" });

  doc.line(x, y + 60, x + 190, y + 60); // Separador horizontal

  // --- Fila 4: Observaciones ---
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.text("Observaciones", 105, y + 67, { align: "center" });
  doc.rect(x + 3, y + 70, 184, 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  if (comprobante.observaciones) {
    doc.text(comprobante.observaciones.substring(0, 100), x + 5, y + 74);
  }

  doc.line(x, y + 79, x + 190, y + 79); // Separador horizontal

  // --- Fila 5: Firmas ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("DEVOLVER", x + 3, y + 85);
  doc.text("FIRMADO", x + 3, y + 89);

  doc.setFont("helvetica", "normal");
  doc.setLineDash([1, 1], 0);
  
  doc.line(x + 35, y + 89, x + 75, y + 89);
  doc.text("Firma", x + 55, y + 93, { align: "center" });

  doc.line(x + 85, y + 89, x + 135, y + 89);
  doc.text("Aclaración", x + 110, y + 93, { align: "center" });

  doc.line(x + 145, y + 89, x + 185, y + 89);
  doc.text("D.N.I.", x + 165, y + 93, { align: "center" });

  doc.setLineDash([], 0); 
};

export const generarPdfLocal = async (comprobante, nombres = {}) => {
  const datosEmpresa = await getDatosEmpresa();

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Ticket Original (Mitad superior)
  dibujarTicket(doc, 10, comprobante, nombres, datosEmpresa);

  // Línea de corte punteada
  doc.setLineDash([2, 2], 0);
  doc.setLineWidth(0.3);
  doc.line(0, 148.5, 210, 148.5);
  doc.setLineDash([], 0);

  // Ticket Duplicado (Mitad inferior)
  dibujarTicket(doc, 155, comprobante, nombres, datosEmpresa);

  return doc.output('blob');
};