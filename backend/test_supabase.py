import os
import sys
from dotenv import load_dotenv
from supabase import create_client

# Fix for Windows console encoding
if sys.platform == 'win32':
    import io
    import sys
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

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
        print("✅ Successfully connected to Supabase")
        
        # Test query to list tables
        print("\n=== Testing Database Connection ===")
        
        # Check if we can query the database
        try:
            # Try to get a list of tables using the Supabase REST API
            try:
                # First, let's try to get a list of all tables by querying the auth schema
                # which is typically available in Supabase
                print("\nAttempting to list available tables...")
                
                # Try to get a list of tables from the auth schema
                try:
                    auth_tables = supabase.table('auth.users').select('*', count='exact').limit(1).execute()
                    if hasattr(auth_tables, 'count'):
                        print(f"✅ Successfully connected to auth.users table (count: {auth_tables.count})")
                except Exception as auth_error:
                    print(f"⚠️ Could not query auth.users: {auth_error}")
                
                # Try to get a list of tables from the public schema
                print("\nChecking for common tables in public schema...")
                common_tables = ['recent_discoveries', 'logs', 'predictions', 'users']
                found_tables = []
                
                for table in common_tables:
                    try:
                        result = supabase.table(table).select('*', count='exact').limit(1).execute()
                        if hasattr(result, 'count') or (hasattr(result, 'data') and result.data is not None):
                            count = getattr(result, 'count', len(result.data) if hasattr(result, 'data') else 0)
                            print(f"✅ Found table '{table}' with {count} rows")
                            found_tables.append(table)
                    except Exception as table_error:
                        print(f"ℹ️ Table '{table}' not found or not accessible: {table_error}")
                
                if not found_tables:
                    print("\n❌ No common tables found. Here are some troubleshooting steps:")
                    print("1. Make sure your Supabase project is properly set up")
                    print("2. Check that your database has the required tables")
                    print("3. Verify that your service role key has the correct permissions")
                    print("4. Try creating a test table in the Supabase dashboard")
                
                # If we found the recent_discoveries table, show some sample data
                if 'recent_discoveries' in found_tables:
                    try:
                        print("\n=== Sample Data from recent_discoveries ===")
                        result = supabase.table('recent_discoveries') \
                                     .select('*') \
                                     .limit(3) \
                                     .order('created_at', desc=True) \
                                     .execute()
                        
                        if hasattr(result, 'data') and result.data:
                            for i, row in enumerate(result.data):
                                print(f"\nRow {i+1}:")
                                for key, value in row.items():
                                    print(f"  {key}: {value}")
                        else:
                            print("No data found in recent_discoveries table")
                    except Exception as sample_error:
                        print(f"⚠️ Could not fetch sample data: {sample_error}")
            
            # If we didn't find the recent_discoveries table, show instructions to create it
            if 'recent_discoveries' not in found_tables:
                print("\n❌ The 'recent_discoveries' table was not found. Here's how to create it:")
                print("""
-- Run this SQL in your Supabase SQL editor:

CREATE TABLE IF NOT EXISTS public.recent_discoveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    confidence FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- Enable Row Level Security
ALTER TABLE public.recent_discoveries ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recent_discoveries_created_at 
ON public.recent_discoveries(created_at DESC);

-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_recent_discoveries_updated_at
BEFORE UPDATE ON public.recent_discoveries
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON public.recent_discoveries TO postgres, anon, authenticated, service_role;
GRANT ALL ON SEQUENCE public.recent_discoveries_id_seq TO postgres, anon, authenticated, service_role;
""")
                print("""
                CREATE TABLE IF NOT EXISTS public.recent_discoveries (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    object_name TEXT NOT NULL,
                    object_type TEXT NOT NULL,
                    confidence FLOAT,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    metadata JSONB
                );
                
                -- Enable Row Level Security
                ALTER TABLE public.recent_discoveries ENABLE ROW LEVEL SECURITY;
                
                -- Create indexes for better performance
                CREATE INDEX IF NOT EXISTS idx_recent_discoveries_created_at 
                ON public.recent_discoveries(created_at DESC);
                """)
                
        except Exception as e:
            print(f"❌ Error querying database: {str(e)}")
            
    except Exception as e:
        print(f"❌ Error connecting to Supabase: {str(e)}")
        if hasattr(e, 'message'):
            print(f"Message: {e.message}")
        if hasattr(e, 'details'):
            print(f"Details: {e.details}")
    
    print("\nTest completed")

if __name__ == "__main__":
    test_supabase_connection()
