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

const dibujarRecibo = (doc, startY, pago, clienteNombre, datosEmpresa, logoImg) => {
  const x = 10;
  let y = startY;

  // ==========================================
  // 1. ENCABEZADO
  // ==========================================
  doc.setFontSize(7);
  doc.text("DOCUMENTO NO VÁLIDO COMO FACTURA", 105, y + 2, { align: "center" });

  doc.setLineWidth(0.3);
  doc.roundedRect(x, y + 4, 190, 28, 1, 1);

  if (logoImg) {
    doc.addImage(logoImg, 'PNG', x + 5, y + 8, 60, 16);
  } else {
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(datosEmpresa.nombre, x + 5, y + 22);
  }

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(datosEmpresa.telefonos, x + 5, y + 27);
  doc.text(datosEmpresa.direccion, x + 5, y + 31);

  // LA "X" CENTRAL
  doc.setFillColor(255, 255, 255);
  doc.rect(100, y - 1, 10, 10, 'FD');
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("X", 105, y + 6, { align: "center" });

  doc.setFontSize(12);
  doc.text("RECIBO DE PAGO", 120, y + 14);
  doc.setFontSize(11);
  doc.text(`N° ${pago.numero_recibo}`, 120, y + 20);

  doc.setFont("helvetica", "normal");
  doc.text(`Fecha: ${new Date(pago.fecha_pago).toLocaleDateString('es-AR')}`, 120, y + 28);

  // ==========================================
  // 2. CUERPO PRINCIPAL
  // ==========================================
  y = y + 34;
  doc.roundedRect(x, y, 190, 60, 1, 1);
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Recibimos de:", x + 5, y + 15);
  doc.setFont("helvetica", "normal");
  doc.text(clienteNombre, x + 35, y + 15);

  doc.setFont("helvetica", "bold");
  doc.text("La suma de pesos:", x + 5, y + 27);
  doc.setFont("helvetica", "normal");
  doc.text(`$ ${Number(pago.monto).toLocaleString('es-AR')}`, x + 40, y + 27);

  doc.setFont("helvetica", "bold");
  doc.text("En concepto de:", x + 5, y + 39);
  doc.setFont("helvetica", "normal");
  doc.text(`Abono a cuenta corriente (Método: ${pago.metodo_pago})`, x + 35, y + 39);

  // Firmas
  doc.setLineDash([2, 2], 0);
  doc.line(x + 20, y + 50, x + 80, y + 50);
  doc.text(`Firma ${datosEmpresa.nombre}`, x + 50, y + 55, { align: "center" });

  doc.line(x + 110, y + 50, x + 170, y + 50);
  doc.text("Aclaración", x + 140, y + 55, { align: "center" });
  doc.setLineDash([], 0);
};

export const generarReciboPdf = async (pago, clienteNombre) => {
    let datosEmpresa;
    try {
      const empresa = await empresaService.getById(1);
      datosEmpresa = {
        nombre: empresa.nombre.toUpperCase(),
        telefonos: empresa.telefono_aux ? `Tel. / Cel.: ${empresa.telefono} / ${empresa.telefono_aux}` : `Tel: ${empresa.telefono}`,
        direccion: empresa.direccion
      };
    } catch (error) {
      console.error('Error al obtener datos de la empresa:', error);
      datosEmpresa = {
        nombre: "EXPRESO DANIPAK",
        telefonos: "Tel. / Cel.: (0343) 155-104448 / 154-588697",
        direccion: "(3100) Paraná - Entre Ríos"
      };
    }

    const logoImg = await cargarImagen(LogoExtendido);
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Dibujamos el Original
    dibujarRecibo(doc, 10, pago, clienteNombre, datosEmpresa, logoImg);

    // Línea de corte
    doc.setLineDash([2, 2], 0);
    doc.setLineWidth(0.3);
    doc.line(0, 148.5, 210, 148.5);
    doc.setLineDash([], 0);

    // Dibujamos el Duplicado
    dibujarRecibo(doc, 155, pago, clienteNombre, datosEmpresa, logoImg);

    return doc.output('blob');
};