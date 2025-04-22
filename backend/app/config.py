import os


class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-keep-it-secret")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRATION_MINUTES", "3")
    )
    CORS_ORIGINS: list = os.getenv(
        "CORS_ORIGINS", "http://localhost:8080,http://localhost:5173"
    ).split(",")

    # OpenAI Settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    FERMION_API_KEY: str = os.getenv("FERMION_API_KEY", "")


settings = Settings()
