import os
import json
from datetime import datetime, timezone
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(supabase_url, supabase_key)

# Sample data for recent discoveries
sample_discoveries = [
    {
        "title": "New Exoplanet Discovered in Habitable Zone",
        "description": "Scientists have discovered a potentially habitable exoplanet orbiting Proxima Centauri.",
        "discovery_date": "2025-09-28T00:00:00Z",
        "image_url": "https://example.com/exoplanet.jpg",
        "source": "NASA Exoplanet Archive"
    },
    {
        "title": "Water Detected on Mars",
        "description": "New evidence suggests liquid water may exist beneath the Martian surface.",
        "discovery_date": "2025-09-25T00:00:00Z",
        "image_url": "https://example.com/mars_water.jpg",
        "source": "NASA Mars Exploration Program"
    },
    {
        "title": "Record-Breaking Black Hole Found",
        "description": "Astronomers have discovered the most distant black hole ever observed.",
        "discovery_date": "2025-09-20T00:00:00Z",
        "image_url": "https://example.com/blackhole.jpg",
        "source": "Hubble Space Telescope"
    }
]

def seed_discoveries():
    print("Starting to seed recent_discoveries table...")
    
    # Insert each discovery
    for discovery in sample_discoveries:
        try:
            response = supabase.table('recent_discoveries').insert(discovery).execute()
            print(f"Inserted: {discovery['title']}")
        except Exception as e:
            print(f"Error inserting {discovery['title']}: {str(e)}")
    
    print("Seeding completed!")

if __name__ == "__main__":
    if not supabase_url or not supabase_key:
        print("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file")
    else:
        seed_discoveries()
