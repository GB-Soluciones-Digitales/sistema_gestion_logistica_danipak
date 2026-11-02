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
  doc.roundedRect(x, y + 3, 190, 26, 1, 1);

  // LOGO
  if (logoImg) {
    doc.addImage(logoImg, 'PNG', x + 2, y + 5, 60, 16);
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text(datosEmpresa.nombre, x + 5, y + 16);
  }
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(datosEmpresa.telefonos, x + 3, y + 22);
  doc.text(datosEmpresa.direccion, x + 3, y + 27);

  // LA "X" CENTRAL 
  doc.setFillColor(255, 255, 255);
  doc.rect(100, y + 3, 10, 9, 'FD'); 
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("X", 105, y + 9, { align: "center" });

  doc.setFontSize(13);
  doc.text("COMPROBANTE DE ENVÍO", 120, y + 11);
  doc.setFontSize(12);
  doc.text(`N° ${comprobante.numero_comprobante || 'PENDIENTE'}`, 120, y + 18);

  doc.text("Fecha", 120, y + 26);
  const fecha = comprobante.fecha_emision ? new Date(comprobante.fecha_emision) : new Date();
  const dia = String(fecha.getDate() + 1).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = String(fecha.getFullYear());

  doc.text(`${dia}  /  ${mes}  /  ${anio}`, 140, y + 26);

  // ==========================================
  // 2. CUERPO PRINCIPAL
  // ==========================================
  y = y + 31; // Achiqué el salto al cuerpo
  doc.roundedRect(x, y, 190, 95, 1, 1);

  // Remitente
  doc.setFontSize(12);
  doc.text("Remitente:", x + 2, y + 6);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  const remitenteFinal = comprobante.nombre_remitente || (comprobante.cliente && comprobante.cliente.razon_social) || '';
  doc.text(remitenteFinal, x + 26, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("Domicilio:", x + 2, y + 14);
  doc.text((comprobante.domicilio_remitente || '').substring(0, 45), x + 22, y + 14);

  doc.text("Loc.:", x + 115, y + 14);
  const locRemitenteFinal = (comprobante.localidad_remitente_rel && comprobante.localidad_remitente_rel.nombre) || '';
  doc.text(locRemitenteFinal.substring(0, 25), x + 128, y + 14);

  doc.line(x, y + 18, x + 190, y + 18);

  // Destinatario
  doc.text("Destinatario:", x + 2, y + 24);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(comprobante.nombre_destinatario || '', x + 28, y + 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("Domicilio:", x + 2, y + 32);
  doc.text((comprobante.domicilio_destinatario || '').substring(0, 45), x + 22, y + 32);

  doc.text("Loc.:", x + 115, y + 32);
  const locDestFinal = (comprobante.localidad_destinatario_rel && comprobante.localidad_destinatario_rel.nombre) || '';
  doc.text(locDestFinal.substring(0, 25), x + 128, y + 32);

  doc.line(x, y + 36, x + 190, y + 36);

  // Importes y Bultos
  doc.line(x + 95, y + 36, x + 95, y + 54);
  doc.line(x + 140, y + 36, x + 140, y + 54);

  doc.text("Cantidad bultos:", x + 2, y + 43);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(String(comprobante.cantidad_bultos || '0'), x + 35, y + 43);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.text("C/R:", x + 2, y + 51);
  const crVal = comprobante.importe_contra_reembolso ? `$${comprobante.importe_contra_reembolso}` : "-";
  doc.text(crVal, x + 14, y + 51);

  doc.text("Flete pago", x + 117.5, y + 43, { align: "center" });
  const fpVal = comprobante.importe_flete_pago ? `$${comprobante.importe_flete_pago}` : "-";
  doc.text(fpVal, x + 117.5, y + 51, { align: "center" });

  doc.text("Flete a cobrar", x + 165, y + 43, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  const fcVal = comprobante.importe_flete_cobro ? `$${comprobante.importe_flete_cobro}` : "-";
  doc.text(fcVal, x + 165, y + 51, { align: "center" });

  doc.line(x, y + 54, x + 190, y + 54);

  // Observaciones
  doc.setFont("helvetica", "italic");
  doc.setFontSize(13);
  doc.text("Observaciones", 105, y + 61, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  if (comprobante.observaciones) {
    doc.text(comprobante.observaciones.substring(0, 100), x + 2, y + 68);
  }

  doc.line(x, y + 73, x + 190, y + 73);

  // Firmas
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("DEVOLVER", x + 2, y + 81);
  doc.text("FIRMADO", x + 2, y + 87);

  doc.setFont("helvetica", "normal");
  doc.setLineDash([1, 1], 0);
  
  doc.line(x + 35, y + 85, x + 75, y + 85);
  doc.text("Firma", x + 55, y + 91, { align: "center" });

  doc.line(x + 85, y + 85, x + 135, y + 85);
  doc.text("Aclaración", x + 110, y + 91, { align: "center" });

  doc.line(x + 145, y + 85, x + 185, y + 85);
  doc.text("D.N.I.", x + 165, y + 91, { align: "center" });

  doc.setLineDash([], 0); 
};

export const generarPdfLocal = async (comprobante) => {
  const datosEmpresa = await getDatosEmpresa();
  const logoImg = await cargarImagen(LogoExtendido); 

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
