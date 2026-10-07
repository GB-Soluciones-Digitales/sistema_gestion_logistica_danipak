import os

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # --- JWT ---
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 7200))

    # --- EMAIL (SMTP) ---
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", 587))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")

    # --- FRONTEND URL ---
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost")

settings = Settings()