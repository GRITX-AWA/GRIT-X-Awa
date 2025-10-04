from app.db.database import SessionLocal
from app.models.dataset import SpaceData

def add_sample_data():
    db = SessionLocal()
    try:
        # Add some sample data
        sample_data = [
            SpaceData(x_value=1.0, y_value=2.0, description="Sample point 1"),
            SpaceData(x_value=3.0, y_value=4.0, description="Sample point 2"),
            SpaceData(x_value=5.0, y_value=6.0, description="Sample point 3"),
        ]
        for data in sample_data:
            db.add(data)
        db.commit()
        print("Sample data added to database.")
    finally:
        db.close()

if __name__ == "__main__":
    add_sample_data()
