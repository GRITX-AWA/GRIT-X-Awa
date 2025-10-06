import os
import sys
from dotenv import load_dotenv
from supabase import create_client

# Fix for Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

def test_supabase_connection():
    print("\n=== Testing Supabase Connection ===")
    
    # Load environment variables
    load_dotenv()
    
    # Get Supabase credentials
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    print(f"Supabase URL: {supabase_url}")
    print(f"Supabase Key: {'*' * 20}{supabase_key[-4:] if supabase_key else 'None'}")
    
    if not supabase_url or not supabase_key:
        print("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file")
        return
    
    try:
        # Initialize the client
        supabase = create_client(supabase_url, supabase_key)
        print("[SUCCESS] Connected to Supabase")
        
        # Test query to list tables
        print("\n=== Listing Tables ===")
        try:
            tables = supabase.table('pg_tables').select('tablename').execute()
            table_list = [t['tablename'] for t in tables.data] if tables and hasattr(tables, 'data') else []
            print(f"Found {len(table_list)} tables")
            print("Tables:", ", ".join(table_list[:10]) + ("..." if len(table_list) > 10 else ""))
            
            # Check if recent_discoveries exists
            if 'recent_discoveries' in table_list:
                print("\n=== Testing recent_discoveries Table ===")
                try:
                    # Try to get column information
                    columns = supabase.table('recent_discoveries').select('*', count='exact', limit=1).execute()
                    if hasattr(columns, 'data') and columns.data:
                        print("Table columns:", list(columns.data[0].keys()))
                    
                    # Try to count rows
                    count = supabase.table('recent_discoveries').select("*", count='exact').execute()
                    print(f"Row count: {count.count if hasattr(count, 'count') else 'Unknown'}")
                    
                    # Try to fetch some data
                    data = supabase.table('recent_discoveries').select("*").limit(3).execute()
                    if data and hasattr(data, 'data') and data.data:
                        print("\nSample data:")
                        for i, row in enumerate(data.data[:3]):
                            print(f"Row {i+1}:")
                            for k, v in row.items():
                                print(f"  {k}: {v}")
                    else:
                        print("No data found in recent_discoveries table")
                        
                except Exception as e:
                    print(f"Error querying recent_discoveries: {str(e)}")
            else:
                print("\n[ERROR] recent_discoveries table not found in database")
                print("Please create the table with this SQL:")
                print("""
                CREATE TABLE IF NOT EXISTS public.recent_discoveries (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    title TEXT NOT NULL,
                    description TEXT,
                    discovery_date TIMESTAMPTZ DEFAULT NOW(),
                    image_url TEXT,
                    source TEXT,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
                """)
                
        except Exception as e:
            print(f"Error listing tables: {str(e)}")
            
    except Exception as e:
        print(f"[ERROR] Error connecting to Supabase: {str(e)}")
        print("Please check your Supabase URL and service role key")

if __name__ == "__main__":
    test_supabase_connection()
