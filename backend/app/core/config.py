import os

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # --- JWT ---
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 7200))

    # --- EMAIL (Brevo) ---
    BREVO_API_KEY: str = os.getenv("BREVO_API_KEY", "")
    MAIL_FROM: str = "sistema.danipak@gmail.com"

    # --- ADMINISTRADOR (usuario fundador, ID 1) ---
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "")

    # --- FRONTEND URL ---
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "https://sistemagestionlogisticadanipak-production.up.railway.app")

settings = Settings()