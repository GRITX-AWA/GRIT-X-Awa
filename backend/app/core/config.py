from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, AnyHttpUrl

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="",
        case_sensitive=False,
    )

    # App metadata
    app_title: str = "SpaceApps Backend"
    app_version: str = "0.1.0"

    # Required env vars
    database_url: str = Field(..., alias="DATABASE_URL")
    pg_disable_ssl_verify: bool | int | str = Field(False, alias="PG_DISABLE_SSL_VERIFY")

    # Optional ML service
    ml_models_dir: str = Field("./models", alias="ML_MODELS_DIR")
    model_api_key: str = Field("dev", alias="MODEL_API_KEY")
    ml_api_url: AnyHttpUrl | str = Field("http://127.0.0.1:8501", alias="ML_API_URL")

settings = Settings()
