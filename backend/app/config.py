from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    SECRET_KEY: str
    DEBUG: bool = True
    ALLOWED_HOSTS: str = "localhost,127.0.0.1"

    PGHOST: str
    PGDATABASE: str
    PGUSER: str
    PGPASSWORD: str
    PGPORT: int = 5432

    ENCRYPTION_KEY: str

    CORS_ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg2://{self.PGUSER}:{self.PGPASSWORD}"
            f"@{self.PGHOST}:{self.PGPORT}/{self.PGDATABASE}"
            f"?sslmode=require"
        )

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.CORS_ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()