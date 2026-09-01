import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import black, lightgrey
from app.models.Comprobante import Comprobante

def dibujar_ticket(c: canvas.Canvas, x_offset: float, y_offset: float, comprobante: Comprobante):

    c.saveState()
    c.translate(x_offset, y_offset)
    
    ancho_ticket = 190 * mm
    alto_ticket = 135 * mm
    
    # ==========================================
    # 1. ENCABEZADO
    # ==========================================
    # Texto "DOCUMENTO NO VALIDO COMO FACTURA"
    c.setFont("Helvetica", 7)
    c.drawCentredString(ancho_ticket / 2, alto_ticket - 2 * mm, "DOCUMENTO NO VÁLIDO COMO FACTURA")
    
    # Recuadro principal del encabezado
    c.setLineWidth(1)
    c.roundRect(0, alto_ticket - 30 * mm, ancho_ticket, 28 * mm, radius=3)
    
    # Logo / Texto DaniPak (A la izquierda)
    # Cuando tengamos el logo en PNG, usamos: c.drawImage("ruta/logo.png", 5*mm, alto_ticket - 28*mm, width=40*mm, height=25*mm)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(10 * mm, alto_ticket - 12 * mm, "EXPRESO")
    c.setFont("Helvetica-Bold", 22)
    c.drawString(10 * mm, alto_ticket - 20 * mm, "DANIPAK")
    c.setFont("Helvetica", 8)
    c.drawString(5 * mm, alto_ticket - 25 * mm, "Tel. / Cel.: (0343) 155-104448 / 154-588697")
    c.drawString(15 * mm, alto_ticket - 29 * mm, "(3100) Paraná - Entre Ríos")
    
    # Recuadro central "X"
    c.rect(ancho_ticket / 2 - 5 * mm, alto_ticket - 12 * mm, 10 * mm, 10 * mm)
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(ancho_ticket / 2, alto_ticket - 10 * mm + 1.5 * mm, "X")
    
    # Datos de la derecha (Nro y Fecha)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(ancho_ticket / 2 + 15 * mm, alto_ticket - 10 * mm, "COMPROBANTE DE ENVÍO")
    c.setFont("Helvetica", 11)
    c.drawString(ancho_ticket / 2 + 15 * mm, alto_ticket - 16 * mm, f"N° {comprobante.numero_comprobante}")
    
    c.drawString(ancho_ticket / 2 + 15 * mm, alto_ticket - 24 * mm, "Fecha")
    # Cajas de la fecha [DD] [MM] [YYYY]
    dia = comprobante.fecha_emision.strftime("%d")
    mes = comprobante.fecha_emision.strftime("%m")
    anio = comprobante.fecha_emision.strftime("%Y")
    
    c.rect(ancho_ticket / 2 + 30 * mm, alto_ticket - 26 * mm, 10 * mm, 6 * mm)
    c.drawCentredString(ancho_ticket / 2 + 35 * mm, alto_ticket - 24.5 * mm, dia)
    
    c.rect(ancho_ticket / 2 + 42 * mm, alto_ticket - 26 * mm, 10 * mm, 6 * mm)
    c.drawCentredString(ancho_ticket / 2 + 47 * mm, alto_ticket - 24.5 * mm, mes)
    
    c.rect(ancho_ticket / 2 + 54 * mm, alto_ticket - 26 * mm, 15 * mm, 6 * mm)
    c.drawCentredString(ancho_ticket / 2 + 61.5 * mm, alto_ticket - 24.5 * mm, anio)

    # ==========================================
    # 2. CUERPO PRINCIPAL
    # ==========================================
    y_cuerpo_top = alto_ticket - 35 * mm
    alto_cuerpo = 95 * mm
    y_cuerpo_bottom = y_cuerpo_top - alto_cuerpo
    
    # Recuadro exterior del cuerpo
    c.roundRect(0, y_cuerpo_bottom, ancho_ticket, alto_cuerpo, radius=3)
    
    # --- Fila 1: Remitente ---
    c.line(0, y_cuerpo_bottom + 75 * mm, ancho_ticket, y_cuerpo_bottom + 75 * mm)
    c.setFont("Helvetica", 9)
    c.drawString(3 * mm, y_cuerpo_bottom + 88 * mm, "Remitente")
    c.rect(20 * mm, y_cuerpo_bottom + 86 * mm, 165 * mm, 6 * mm)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(22 * mm, y_cuerpo_bottom + 87.5 * mm, str(comprobante.cliente.razon_social)) 
    
    c.setFont("Helvetica", 9)
    c.drawString(3 * mm, y_cuerpo_bottom + 78 * mm, "Domicilio")
    c.rect(20 * mm, y_cuerpo_bottom + 76 * mm, 90 * mm, 6 * mm)
    c.drawString(22 * mm, y_cuerpo_bottom + 77.5 * mm, comprobante.domicilio_remitente[:45])
    
    c.drawString(115 * mm, y_cuerpo_bottom + 78 * mm, "Localidad")
    c.rect(132 * mm, y_cuerpo_bottom + 76 * mm, 53 * mm, 6 * mm)
    # Suponiendo que accedés a la relación, si no, ponés el ID
    loc_remitente = f"ID: {comprobante.localidad_remitente.nombre}" 
    c.drawString(134 * mm, y_cuerpo_bottom + 77.5 * mm, loc_remitente)

    # --- Fila 2: Destinatario ---
    c.line(0, y_cuerpo_bottom + 55 * mm, ancho_ticket, y_cuerpo_bottom + 55 * mm)
    c.drawString(3 * mm, y_cuerpo_bottom + 68 * mm, "Destinatario")
    c.rect(22 * mm, y_cuerpo_bottom + 66 * mm, 163 * mm, 6 * mm)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(24 * mm, y_cuerpo_bottom + 67.5 * mm, comprobante.nombre_destinatario)
    
    c.setFont("Helvetica", 9)
    c.drawString(3 * mm, y_cuerpo_bottom + 58 * mm, "Domicilio")
    c.rect(20 * mm, y_cuerpo_bottom + 56 * mm, 90 * mm, 6 * mm)
    c.drawString(22 * mm, y_cuerpo_bottom + 57.5 * mm, comprobante.domicilio_destinatario[:45])
    
    c.drawString(115 * mm, y_cuerpo_bottom + 58 * mm, "Localidad")
    c.rect(132 * mm, y_cuerpo_bottom + 56 * mm, 53 * mm, 6 * mm)
    loc_dest = f"ID: {comprobante.localidad_destinatario.nombre}"
    c.drawString(134 * mm, y_cuerpo_bottom + 57.5 * mm, loc_dest)

    # --- Fila 3: Importes y Bultos ---
    c.line(0, y_cuerpo_bottom + 35 * mm, ancho_ticket, y_cuerpo_bottom + 35 * mm)
    # Separadores verticales
    c.line(95 * mm, y_cuerpo_bottom + 35 * mm, 95 * mm, y_cuerpo_bottom + 55 * mm)
    c.line(140 * mm, y_cuerpo_bottom + 35 * mm, 140 * mm, y_cuerpo_bottom + 55 * mm)
    
    # Bultos y C/R (Izquierda)
    c.drawString(3 * mm, y_cuerpo_bottom + 48 * mm, "Cantidad de bultos")
    c.rect(32 * mm, y_cuerpo_bottom + 46 * mm, 60 * mm, 6 * mm)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(34 * mm, y_cuerpo_bottom + 47.5 * mm, str(comprobante.cantidad_bultos))
    
    c.setFont("Helvetica", 9)
    c.drawString(3 * mm, y_cuerpo_bottom + 39 * mm, "C/R")
    c.rect(12 * mm, y_cuerpo_bottom + 37 * mm, 80 * mm, 6 * mm)
    cr_val = f"${comprobante.importe_contra_reembolso}" if comprobante.importe_contra_reembolso else ""
    c.drawString(14 * mm, y_cuerpo_bottom + 38.5 * mm, cr_val)
    
    # Flete Pago (Centro)
    c.drawCentredString(117.5 * mm, y_cuerpo_bottom + 48 * mm, "Flete pago")
    c.rect(100 * mm, y_cuerpo_bottom + 38 * mm, 35 * mm, 7 * mm)
    fp_val = f"${comprobante.importe_flete_pago}" if comprobante.importe_flete_pago else ""
    c.drawCentredString(117.5 * mm, y_cuerpo_bottom + 40 * mm, fp_val)
    
    # Flete a cobrar (Derecha)
    c.drawCentredString(165 * mm, y_cuerpo_bottom + 48 * mm, "Flete a cobrar")
    c.rect(145 * mm, y_cuerpo_bottom + 38 * mm, 40 * mm, 7 * mm)
    fc_val = f"${comprobante.importe_flete_cobro}" if comprobante.importe_flete_cobro else ""
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(165 * mm, y_cuerpo_bottom + 40 * mm, fc_val)

    # --- Fila 4: Observaciones ---
    c.line(0, y_cuerpo_bottom + 18 * mm, ancho_ticket, y_cuerpo_bottom + 18 * mm)
    c.setFont("Helvetica-Oblique", 10)
    c.drawCentredString(ancho_ticket / 2, y_cuerpo_bottom + 28 * mm, "Observaciones")
    c.rect(3 * mm, y_cuerpo_bottom + 21 * mm, 184 * mm, 6 * mm)
    c.setFont("Helvetica", 9)
    if comprobante.observaciones:
        c.drawString(5 * mm, y_cuerpo_bottom + 22.5 * mm, comprobante.observaciones[:100])

    # --- Fila 5: Firmas ---
    c.setFont("Helvetica-Bold", 8)
    c.drawString(3 * mm, y_cuerpo_bottom + 10 * mm, "DEVOLVER")
    c.drawString(3 * mm, y_cuerpo_bottom + 6 * mm, "FIRMADO")
    
    c.setFont("Helvetica", 8)
    c.setDash(1, 2) 
    c.line(35 * mm, y_cuerpo_bottom + 6 * mm, 75 * mm, y_cuerpo_bottom + 6 * mm)
    c.drawCentredString(55 * mm, y_cuerpo_bottom + 2 * mm, "Firma")
    
    c.line(85 * mm, y_cuerpo_bottom + 6 * mm, 135 * mm, y_cuerpo_bottom + 6 * mm)
    c.drawCentredString(110 * mm, y_cuerpo_bottom + 2 * mm, "Aclaración")
    
    c.line(145 * mm, y_cuerpo_bottom + 6 * mm, 185 * mm, y_cuerpo_bottom + 6 * mm)
    c.drawCentredString(165 * mm, y_cuerpo_bottom + 2 * mm, "D.N.I.")
    
    c.restoreState()

def generar_comprobante_pdf(comprobante: Comprobante) -> io.BytesIO:
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    ancho_hoja, alto_hoja = A4

    # Coordenadas X centradas (10mm de margen izquierdo)
    x_pos = 10 * mm
    
    # Dibujamos el Original (Arriba)
    dibujar_ticket(c, x_pos, alto_hoja - 145 * mm, comprobante)
    
    # Línea punteada de corte al medio de la hoja A4
    c.setDash(4, 4)
    c.setLineWidth(0.5)
    c.line(0, alto_hoja / 2, ancho_hoja, alto_hoja / 2)
    c.setDash(1, 0) 
    
    # Dibujamos el Duplicado (Abajo)
    dibujar_ticket(c, x_pos, 10 * mm, comprobante)

    c.showPage()
    c.save()
    
    buffer.seek(0)
    return buffer