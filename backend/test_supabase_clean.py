import os
import sys
from dotenv import load_dotenv
from supabase import create_client

# Fix Windows console encoding
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
        print("[SUCCESS] Successfully connected to Supabase")
        
        # Test query to list tables
        print("\n=== Testing Database Connection ===")
        
        # Try to get a list of tables from the auth schema
        try:
            print("\nAttempting to query auth.users table...")
            result = supabase.table('auth.users').select('*', count='exact').limit(1).execute()
            if hasattr(result, 'count'):
                print(f"[SUCCESS] Successfully connected to auth.users table (count: {result.count})")
            else:
                print("ℹ️ Could not get user count, but connection is working")
        except Exception as auth_error:
            print(f"⚠️ Could not query auth.users: {auth_error}")
        
        # Try to query the recent_discoveries table
        print("\nChecking for recent_discoveries table...")
        try:
            result = supabase.table('recent_discoveries').select('*', count='exact').limit(1).execute()
            if hasattr(result, 'count'):
                print(f"[SUCCESS] Found recent_discoveries table with {result.count} rows")
                
                # Try to get sample data
                if result.count > 0:
                    print("\nSample row from recent_discoveries:")
                    sample = supabase.table('recent_discoveries').select('*').limit(1).execute()
                    if hasattr(sample, 'data') and sample.data:
                        for key, value in sample.data[0].items():
                            print(f"  {key}: {value}")
            else:
                print("ℹ️ recent_discoveries table exists but is empty")
                
        except Exception as e:
            print(f"[ERROR] Error querying recent_discoveries: {e}")
            print("\nThe 'recent_discoveries' table was not found. Here's how to create it:")
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
    
    except Exception as e:
        print(f"[ERROR] Error connecting to Supabase: {e}")
        if hasattr(e, 'message'):
            print(f"Message: {e.message}")
        if hasattr(e, 'details'):
            print(f"Details: {e.details}")
    
    print("\nTest completed")

if __name__ == "__main__":
    test_supabase_connection()
