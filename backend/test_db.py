import asyncio
import asyncpg

async def test_connection():
    try:
        # Test connection using the DATABASE_URL from .env (asyncpg uses standard postgresql:// format)
        conn = await asyncpg.connect('postgresql://postgres:joQha5-kotdym-gessip@db.nafpqdeyshrdstecqldc.supabase.co:5432/postgres')
        print("SUCCESS: Connection successful!")

        # Test a simple query
        result = await conn.fetchval("SELECT 1")
        print(f"SUCCESS: Query test successful: {result}")

        await conn.close()
    except Exception as e:
        print(f"ERROR: Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
