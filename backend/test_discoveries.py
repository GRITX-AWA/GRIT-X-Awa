import os
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

def print_red(text):
    print(f"\033[91m{text}\033[0m")

def print_green(text):
    print(f"\033[92m{text}\033[0m")

# Fix for Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

def test_discoveries():
    print("\n=== Testing Recent Discoveries ===")
    
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
        supabase: Client = create_client(supabase_url, supabase_key)
        print_green("✅ Successfully connected to Supabase")
        
        # Test query to get recent discoveries
        print("\n=== Testing recent_discoveries Table ===")
        try:
            # First, get one record to see the structure
            response = supabase.table('recent_discoveries').select('*').limit(1).execute()
            
            if not response.data:
                print("ℹ️  The recent_discoveries table exists but is empty")
                return
                
            # Print the column names from the first record
            first_record = response.data[0]
            print("\nTable columns:", list(first_record.keys()))
            
            # Try to order by the first date-like column we find
            date_columns = [col for col in first_record.keys() if 'date' in col.lower() or 'created' in col.lower()]
            order_by = date_columns[0] if date_columns else list(first_record.keys())[0]
            
            # Fetch data with ordering
            response = supabase.table('recent_discoveries')\
                             .select('*')\
                             .order(order_by, desc=True)\
                             .limit(5)\
                             .execute()
            
            if hasattr(response, 'data'):
                if response.data:
                    print_green(f"✅ Found {len(response.data)} records in recent_discoveries table")
                    print("\nSample records:")
                    for i, item in enumerate(response.data[:3]):  # Show first 3 records
                        print(f"\nRecord {i+1}:")
                        for key, value in item.items():
                            print(f"  {key}: {value}")
                else:
                    print("ℹ️  The recent_discoveries table exists but is empty")
                    print("You can add data using the Supabase dashboard or through the API")
            else:
                print_red("❌ Unexpected response format from Supabase")
                if hasattr(response, 'error'):
                    print_red(f"Error: {response.error}")
                
        except Exception as e:
            print_red(f"❌ Error querying recent_discoveries: {str(e)}")
            if hasattr(e, 'message'):
                print_red(f"Message: {e.message}")
            if hasattr(e, 'details'):
                print_red(f"Details: {e.details}")
            
    except Exception as e:
        print_red(f"❌ Error connecting to Supabase: {str(e)}")
        print("Please check your Supabase URL and service role key")

if __name__ == "__main__":
    test_discoveries()
