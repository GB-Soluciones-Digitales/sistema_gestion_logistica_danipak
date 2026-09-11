import { jsPDF } from 'jspdf';

export const generarReciboPdf = (pago, clienteNombre) => {
    const doc = new jsPDF();

    // Encabezado Institucional
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("EXPRESO DANIPAK", 14, 22);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Tel. / Cel.: (0343) 155-104448 / 154-588697", 14, 30);
    doc.text("(3100) Paraná - Entre Ríos", 14, 35);

    // Cuadro derecho: Datos del Recibo
    doc.rect(120, 12, 75, 28);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("RECIBO DE PAGO", 125, 20);
    doc.setFontSize(11);
    doc.text(`N° ${pago.numero_recibo}`, 125, 28);
    doc.setFont("helvetica", "normal");
    doc.text(`Fecha: ${new Date(pago.fecha_pago).toLocaleDateString('es-AR')}`, 125, 36);

    // Cuadro principal: Detalles
    doc.rect(14, 50, 181, 45);
    
    doc.setFont("helvetica", "bold");
    doc.text("Recibimos de:", 18, 62);
    doc.setFont("helvetica", "normal");
    doc.text(clienteNombre, 50, 62);

    doc.setFont("helvetica", "bold");
    doc.text("La suma de pesos:", 18, 74);
    doc.setFont("helvetica", "normal");
    doc.text(`$ ${Number(pago.monto).toLocaleString('es-AR')}`, 55, 74);

    doc.setFont("helvetica", "bold");
    doc.text("En concepto de:", 18, 86);
    doc.setFont("helvetica", "normal");
    doc.text(`Abono a cuenta corriente (Método: ${pago.metodo_pago})`, 52, 86);

    // Firmas
    doc.setLineDashPattern([2, 2], 0);
    doc.line(20, 140, 80, 140);
    doc.text("Firma Expreso Danipak", 50, 146, { align: "center" });

    doc.line(120, 140, 180, 140);
    doc.text("Aclaración", 150, 146, { align: "center" });

    return doc.output('blob');
};