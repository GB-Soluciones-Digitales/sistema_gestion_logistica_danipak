import httpx

from app.core.config import settings

BREVO_URL = "https://api.brevo.com/v3/smtp/email"

async def enviar_email_recuperacion(email_destino: str, token: str):
    link_recuperacion = f"{settings.FRONTEND_URL}/reset-password?token={token}"

    # --- Logica simulada (Mock) para desarrollo sin API key ---
    if not settings.BREVO_API_KEY:
        print("\n" + "="*40)
        print("MOCK: SIMULACIÓN DE ENVÍO DE EMAIL")
        print(f"Para: {email_destino}\nLink: {link_recuperacion}")
        print("="*40 + "\n")
        return

    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #2563eb;">DaniPak - Gestión Logística</h2>
        <p>Hola,</p>
        <p>Recibimos una solicitud para restablecer tu contraseña. Hacé clic en el siguiente botón para crear una nueva. El enlace vence en 15 minutos.</p>
        <a href="{link_recuperacion}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #2563eb; text-decoration: none; border-radius: 5px;">
            Restablecer Contraseña
        </a>
        <p style="margin-top: 20px; font-size: 0.9em; color: #666;">Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br>{link_recuperacion}</p>
        <p>Si no solicitaste este cambio, podés ignorar este correo.</p>
      </body>
    </html>
    """

    headers = {"api-key": settings.BREVO_API_KEY, "Content-Type": "application/json"}
    payload = {
        "sender": {"email": settings.MAIL_FROM, "name": "Sistema DaniPak"},
        "to": [{"email": email_destino}],
        "subject": "Recuperación de Contraseña",
        "htmlContent": html,
    }

    # Los errores se registran y no se propagan: la respuesta del endpoint no debe revelar si el email existe.
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(BREVO_URL, headers=headers, json=payload)
            response.raise_for_status()
        print(f"Correo de recuperación enviado exitosamente a {email_destino}")
    except Exception as e:
        print(f"Error al enviar el correo a {email_destino}: {str(e)}")
