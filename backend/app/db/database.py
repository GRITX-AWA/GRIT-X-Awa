# app/db/database.py
from typing import AsyncGenerator
import ssl, certifi

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base

from app.core.config import settings

Base = declarative_base()

# SSL context for Supabase (toggle with PG_DISABLE_SSL_VERIFY)
ssl_ctx = ssl.create_default_context(cafile=certifi.where())
if str(settings.pg_disable_ssl_verify).lower() in {"1", "true", "yes"}:
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE

engine = create_async_engine(
    settings.database_url,           # e.g. postgresql+asyncpg://postgres:***@...:5432/postgres
    connect_args={"ssl": ssl_ctx},   # <- use ssl context; do NOT put ?sslmode=require in URL
    pool_pre_ping=True,
    future=True,
)

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
