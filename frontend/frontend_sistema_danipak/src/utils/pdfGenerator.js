import { jsPDF } from 'jspdf';
import { empresaService } from '../api/empresaService';
import LogoExtendido from '../assets/Expreso_DaniPak_Logo.png';

const cargarImagen = (src) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
  });
};

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

const dibujarTicket = (doc, startY, comprobante, datosEmpresa, logoImg) => {
  const x = 10;
  let y = startY;

  // ==========================================
  // 1. ENCABEZADO
  // ==========================================
  doc.setFontSize(7);
  doc.text("DOCUMENTO NO VÁLIDO COMO FACTURA", 105, y + 2, { align: "center" });

  doc.setLineWidth(0.3);
  doc.roundedRect(x, y + 4, 190, 28, 1, 1);

  // LOGO (Si cargó bien lo dibuja, sino pone el texto)
  if (logoImg) {
    doc.addImage(logoImg, 'PNG', x + 5, y + 8, 60, 16);
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(datosEmpresa.nombre, x + 10, y + 22);
  }
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(datosEmpresa.telefonos, x + 5, y + 27);
  doc.text(datosEmpresa.direccion, x + 5, y + 31);

  // LA "X" CENTRAL (Con fondo blanco para cortar la línea)
  doc.setFillColor(255, 255, 255);
  doc.rect(100, y - 1, 10, 10, 'FD'); 
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("X", 105, y + 6, { align: "center" });

  doc.setFontSize(12);
  doc.text("COMPROBANTE DE ENVÍO", 120, y + 14);
  doc.setFontSize(11);
  doc.text(`N° ${comprobante.numero_comprobante || 'PENDIENTE'}`, 120, y + 20);

  doc.text("Fecha", 120, y + 28);
  const fecha = comprobante.fecha_emision ? new Date(comprobante.fecha_emision) : new Date();
  const dia = String(fecha.getDate() + 1).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = String(fecha.getFullYear());

  doc.text(`${dia}  /  ${mes}  /  ${anio}`, 140, y + 28);

  // ==========================================
  // 2. CUERPO PRINCIPAL (Sin recuadros internos)
  // ==========================================
  y = y + 34; 
  doc.roundedRect(x, y, 190, 95, 1, 1);

  // Remitente
  doc.setFontSize(9);
  doc.text("Remitente:", x + 3, y + 7);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  const remitenteFinal = comprobante.nombre_remitente || (comprobante.cliente && comprobante.cliente.razon_social) || '';
  doc.text(remitenteFinal, x + 22, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Domicilio:", x + 3, y + 17);
  doc.text((comprobante.domicilio_remitente || '').substring(0, 45), x + 20, y + 17);

  doc.text("Localidad:", x + 115, y + 17);
  const locRemitenteFinal = (comprobante.localidad_remitente_rel && comprobante.localidad_remitente_rel.nombre) || '';
  doc.text(locRemitenteFinal, x + 135, y + 17);

  doc.line(x, y + 20, x + 190, y + 20);

  // Destinatario
  doc.text("Destinatario:", x + 3, y + 27);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(comprobante.nombre_destinatario || '', x + 24, y + 27);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Domicilio:", x + 3, y + 37);
  doc.text((comprobante.domicilio_destinatario || '').substring(0, 45), x + 20, y + 37);

  doc.text("Localidad:", x + 115, y + 37);
  const locDestFinal = (comprobante.localidad_destinatario_rel && comprobante.localidad_destinatario_rel.nombre) || '';
  doc.text(locDestFinal, x + 135, y + 37);

  doc.line(x, y + 40, x + 190, y + 40);

  // Importes y Bultos
  doc.line(x + 95, y + 40, x + 95, y + 60);
  doc.line(x + 140, y + 40, x + 140, y + 60);

  doc.text("Cantidad de bultos:", x + 3, y + 47);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(String(comprobante.cantidad_bultos || '0'), x + 35, y + 47);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("C/R:", x + 3, y + 56);
  const crVal = comprobante.importe_contra_reembolso ? `$${comprobante.importe_contra_reembolso}` : "-";
  doc.text(crVal, x + 15, y + 56);

  doc.text("Flete pago", x + 117.5, y + 47, { align: "center" });
  const fpVal = comprobante.importe_flete_pago ? `$${comprobante.importe_flete_pago}` : "-";
  doc.text(fpVal, x + 117.5, y + 56, { align: "center" });

  doc.text("Flete a cobrar", x + 165, y + 47, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  const fcVal = comprobante.importe_flete_cobro ? `$${comprobante.importe_flete_cobro}` : "-";
  doc.text(fcVal, x + 165, y + 56, { align: "center" });

  doc.line(x, y + 60, x + 190, y + 60);

  // Observaciones
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.text("Observaciones", 105, y + 67, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  if (comprobante.observaciones) {
    doc.text(comprobante.observaciones.substring(0, 100), x + 5, y + 74);
  }

  doc.line(x, y + 79, x + 190, y + 79);

  // Firmas
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

export const generarPdfLocal = async (comprobante) => {
  const datosEmpresa = await getDatosEmpresa();
  const logoImg = await cargarImagen(LogoExtendido); // Cargamos el logo en memoria

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  dibujarTicket(doc, 10, comprobante, datosEmpresa, logoImg);

  doc.setLineDash([2, 2], 0);
  doc.setLineWidth(0.3);
  doc.line(0, 148.5, 210, 148.5);
  doc.setLineDash([], 0);

  dibujarTicket(doc, 155, comprobante, datosEmpresa, logoImg);

  return doc.output('blob');
};