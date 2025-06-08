import os
import json
from sqlalchemy import create_engine, text

def initialize_database():
    """Initialize the database with the required schema"""
    # Get database connection
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        print("ERROR: DATABASE_URL environment variable not set")
        return False

    # Create database engine
    try:
        engine = create_engine(db_url)
    except Exception as e:
        print(f"ERROR: Failed to connect to database: {e}")
        return False

    # Read the SQL schema file
    try:
        with open('utils/schema.sql', 'r') as file:
            schema_sql = file.read()
    except Exception as e:
        print(f"ERROR: Failed to read schema file: {e}")
        return False

    # Execute the schema SQL
    try:
        with engine.begin() as conn:
            conn.execute(text(schema_sql))
        print("Database schema successfully initialized")
        return True
    except Exception as e:
        print(f"ERROR: Failed to execute schema SQL: {e}")
        return False

def import_sample_data():
    """Import sample data from neural_profile.json into the database"""
    # Fix import statement using a relative import
    # When called from the root directory, we need to adjust the path
    import sys
    sys.path.append('.')  # Add current directory to path
    
    from utils.db import import_json_to_database
    
    try:
        json_path = "data/neural_profile.json"
        if not os.path.exists(json_path):
            print(f"ERROR: Sample data file not found at {json_path}")
            return False
            
        patient_id, message = import_json_to_database(json_path)
        if patient_id:
            print(f"Successfully imported sample data with patient ID: {patient_id}")
            return True
        else:
            print(f"ERROR: Failed to import sample data: {message}")
            return False
    except Exception as e:
        print(f"ERROR: Exception during sample data import: {e}")
        return False

if __name__ == "__main__":
    # Initialize the database schema
    if initialize_database():
        # Import sample data if schema initialization was successful
        import_sample_data()
    else:
        print("Skipping sample data import due to schema initialization failure")