from typing import Optional, Literal
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, AnyHttpUrl


class Settings(BaseSettings):
    # Load from .env (no prefix; keys are case-insensitive)
    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="",
        case_sensitive=False,
    )

    # ===== App metadata =====
    app_title: str = Field(default="SpaceApps Backend", alias="APP_TITLE")
    app_version: str = Field(default="0.1.0", alias="APP_VERSION")
    app_base_url: AnyHttpUrl | str = Field("http://127.0.0.1:8000", alias="APP_BASE_URL")

    # ===== Database (Supabase Postgres) =====
    database_url: str = Field(..., alias="DATABASE_URL")
    pg_disable_ssl_verify: bool | int | str = Field(False, alias="PG_DISABLE_SSL_VERIFY")

    # ===== Local ML helper (only used if you point to local service) =====
    ml_models_dir: str = Field("./models", alias="ML_MODELS_DIR")
    model_api_key: str = Field("dev", alias="MODEL_API_KEY")
    ml_api_url: AnyHttpUrl | str = Field("http://127.0.0.1:8501", alias="ML_API_URL")

    # ===== Supabase =====
    supabase_url: AnyHttpUrl = Field(..., alias="SUPABASE_URL")
    supabase_anon_key: str = Field(..., alias="SUPABASE_ANON_KEY")
    supabase_service_role_key: str = Field(..., alias="SUPABASE_SERVICE_ROLE_KEY")
    supabase_bucket: str = Field("exoplanet_csvs", alias="SUPABASE_BUCKET")

    # ===== Cloud Run ML service =====
    cloud_run_ml_service_url: AnyHttpUrl = Field(..., alias="CLOUD_RUN_ML_SERVICE_URL")
    cloud_run_auth: Literal["public", "idtoken", "apikey"] = Field("idtoken", alias="CLOUD_RUN_AUTH")
    cloud_run_audience: Optional[AnyHttpUrl] = Field(None, alias="CLOUD_RUN_AUDIENCE")
    cloud_run_api_key: Optional[str] = Field(None, alias="CLOUD_RUN_API_KEY")

    # ===== Webhook (ML -> backend callback verification) =====
    webhook_secret: str = Field(..., alias="WEBHOOK_SECRET")

    # ---- Derived / helper props ----
    @property
    def async_database_url(self) -> str:
        """
        Normalize DATABASE_URL for SQLAlchemy async + asyncpg.
        Accepts postgres[ql]://... with optional ?sslmode=require.
        Returns postgresql+asyncpg://...
        """
        url = (self.database_url or "").strip()
        if "?sslmode=require" in url:
            url = url.split("?sslmode=require", 1)[0]
        if url.startswith("postgresql://"):
            url = "postgresql+asyncpg://" + url[len("postgresql://"):]
        elif url.startswith("postgres://"):
            url = "postgresql+asyncpg://" + url[len("postgres://"):]
        return url

    @property
    def pg_disable_ssl_verify_bool(self) -> bool:
        val = str(self.pg_disable_ssl_verify).strip().lower()
        return val in {"1", "true", "yes", "y", "on"}

    # ML URLs commonly used by the backend
    @property
    def ml_predict_url(self) -> str:
        base = str(self.cloud_run_ml_service_url).rstrip("/")
        # our Cloud Run exposes /v1/predict
        return f"{base}/v1/predict"

    @property
    def ml_health_url(self) -> str:
        base = str(self.cloud_run_ml_service_url).rstrip("/")
        return f"{base}/v1/health"

    # Convenience flags
    @property
    def use_idtoken(self) -> bool:
        return self.cloud_run_auth == "idtoken"

    @property
    def use_apikey(self) -> bool:
        return self.cloud_run_auth == "apikey" and bool(self.cloud_run_api_key)

    @property
    def ml_default_headers(self) -> dict:
        """
        Headers to include when calling Cloud Run.
        - public / idtoken: no static header (idtoken is obtained at runtime)
        - apikey: attach x-api-key
        """
        if self.use_apikey:
            return {"x-api-key": self.cloud_run_api_key}
        return {}


settings = Settings()
