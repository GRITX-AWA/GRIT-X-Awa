from typing import AsyncGenerator
import ssl
import certifi

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
)
from sqlalchemy.orm import declarative_base
from sqlalchemy.engine.url import make_url

from app.core.config import settings

Base = declarative_base()

# Pick DB URL from settings (handles sqlite+aiosqlite and postgresql+asyncpg)
DB_URL = getattr(settings, "async_database_url", None) or getattr(settings, "DATABASE_URL", None)
if not DB_URL:
    raise RuntimeError("DATABASE_URL/async_database_url is not configured.")

url = make_url(DB_URL)

# Common engine kwargs
_engine_kwargs = dict(pool_pre_ping=True, future=True)

# Add SSL only for non-sqlite drivers (sqlite/aiosqlite does NOT accept 'ssl')
if not url.drivername.startswith("sqlite"):
    ssl_ctx = ssl.create_default_context(cafile=certifi.where())
    # Dev override if you have this flag in Settings
    if getattr(settings, "pg_disable_ssl_verify_bool", False):
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE
    _engine_kwargs["connect_args"] = {"ssl": ssl_ctx}

engine = create_async_engine(str(url), **_engine_kwargs)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    class_=AsyncSession,
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

__all__ = ["engine", "Base", "AsyncSessionLocal", "get_db"]
