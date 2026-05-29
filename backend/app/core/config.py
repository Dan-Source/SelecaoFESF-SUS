import json
from typing import Literal

from pydantic import ValidationInfo, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    environment: Literal["development", "test", "production"] = "development"
    app_name: str = "Sistema de Agendamento Odontologico"
    api_v1_prefix: str = "/api/v1"
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    cors_allow_methods: list[str] = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    cors_allow_headers: list[str] = ["*"]
    cors_allow_credentials: bool = True
    jwt_secret_key: str = "change-me-in-development-only"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    database_url: str = "postgresql+psycopg://odonto:odonto@localhost:5432/odonto"
    redis_url: str | None = "redis://localhost:6379/0"
    redis_cache_ttl_seconds: int = 30

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    def cors_origins_list(self) -> list[str]:
        raw = self.cors_origins.strip()
        if not raw:
            return []

        if raw.startswith("["):
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                return [str(origin).strip() for origin in parsed if str(origin).strip()]

        return [origin.strip() for origin in raw.split(",") if origin.strip()]

    @field_validator("jwt_secret_key")
    @classmethod
    def validate_jwt_secret_key(cls, value: str, info: ValidationInfo) -> str:
        environment = info.data.get("environment", "development")
        if environment == "production":
            if value.startswith("change-me"):
                raise ValueError("JWT_SECRET_KEY padrao nao pode ser usado em producao")
            if len(value) < 32:
                raise ValueError("JWT_SECRET_KEY deve ter no minimo 32 caracteres em producao")
        return value

    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        if self.environment == "production":
            if "odonto:odonto" in self.database_url:
                raise ValueError("DATABASE_URL padrao nao pode ser usada em producao")
            if not self.redis_url:
                raise ValueError("REDIS_URL deve ser definida em producao")
        return self


settings = Settings()
