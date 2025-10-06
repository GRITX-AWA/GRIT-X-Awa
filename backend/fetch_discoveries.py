import os
import sys
from dotenv import load_dotenv
from supabase import create_client

def print_green(text):
    print(f"\033[92m{text}\033[0m")

def print_red(text):
    print(f"\033[91m{text}\033[0m")

# Fix for Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

def fetch_discoveries(limit=10):
    """
    Fetch and display recent discoveries from the database
    
    Args:
        limit: Maximum number of records to fetch (default: 10)
    """
    print("\n=== Fetching Recent Discoveries ===")
    
    # Load environment variables
    load_dotenv()
    
    # Get Supabase credentials
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print_red("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file")
        return
    
    try:
        # Initialize the client
        supabase = create_client(supabase_url, supabase_key)
        print_green("✅ Successfully connected to Supabase")
        
        # Fetch data from recent_discoveries table
        print(f"\nFetching up to {limit} recent discoveries...")
        response = supabase.table('recent_discoveries')\
                         .select('*')\
                         .order('Date', desc=True)\
                         .limit(limit)\
                         .execute()
        
        if hasattr(response, 'data') and response.data:
            print_green(f"✅ Successfully fetched {len(response.data)} records")
            print("\nRecent Discoveries:")
            print("-" * 50)
            
            for i, item in enumerate(response.data, 1):
                print(f"\nRecord {i}:")
                for key, value in item.items():
                    print(f"  {key}: {value}")
                print("-" * 50)
            
            return response.data
        else:
            print("ℹ️  No records found in the recent_discoveries table")
            return []
            
    except Exception as e:
        print_red(f"❌ Error: {str(e)}")
        if hasattr(e, 'message'):
            print_red(f"Message: {e.message}")
        if hasattr(e, 'details'):
            print_red(f"Details: {e.details}")
        return None

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Fetch recent discoveries from the database')
    parser.add_argument('--limit', type=int, default=10, help='Maximum number of records to fetch (default: 10)')
    
    args = parser.parse_args()
    fetch_discoveries(limit=args.limit)
