import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

def enviar_email_recuperacion(email_destino: str, token: str):
    # --- Logica simulada (Mock) ---
    if not settings.SMTP_USER:
        link_recuperacion = f"http://localhost/reset-password?token={token}"
        print("\n" + "="*40)
        print("MOCK: SIMULACIÓN DE ENVÍO DE EMAIL")
        print(f"Para: {email_destino}\nLink: {link_recuperacion}")
        print("="*40 + "\n")
        return

    # --- Logica real ---
    link_recuperacion = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    
    # Armamos el mensaje con formato HTML
    mensaje = MIMEMultipart("alternative")
    mensaje["Subject"] = "Recuperación de contraseña - DaniPak"
    mensaje["From"] = settings.SMTP_USER
    mensaje["To"] = email_destino

    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #2563eb;">DaniPak - Gestión Logística</h2>
        <p>Hola,</p>
        <p>Recibimos una solicitud para restablecer tu contraseña. Hacé clic en el siguiente botón para crear una nueva:</p>
        <a href="{link_recuperacion}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #2563eb; text-decoration: none; border-radius: 5px;">
            Restablecer Contraseña
        </a>
        <p style="margin-top: 20px; font-size: 0.9em; color: #666;">Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br>{link_recuperacion}</p>
        <p>Si no solicitaste este cambio, podés ignorar este correo.</p>
      </body>
    </html>
    """
    
    # Adjuntamos el HTML al correo
    mensaje.attach(MIMEText(html, "html"))

    # Nos conectamos al servidor SMTP y enviamos
    try:
        server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_USER, email_destino, mensaje.as_string())
        server.quit()
        print(f"Correo de recuperación enviado exitosamente a {email_destino}")
    except Exception as e:
        print(f"Error al enviar el correo a {email_destino}: {str(e)}")