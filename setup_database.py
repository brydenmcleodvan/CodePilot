import os
import sys
from sqlalchemy import create_engine, text

def main():
    """Initialize the database schema based on the SQL script."""
    # Check if database URL is available
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        print("ERROR: DATABASE_URL environment variable not set")
        sys.exit(1)
    
    print("Connecting to database...")
    try:
        engine = create_engine(db_url)
        print("Successfully connected to database")
    except Exception as e:
        print(f"ERROR: Failed to connect to database: {e}")
        sys.exit(1)
    
    # Check if schema file exists
    schema_path = "utils/schema.sql"
    if not os.path.exists(schema_path):
        print(f"ERROR: Schema file not found at {schema_path}")
        sys.exit(1)
    
    # Read schema SQL
    print(f"Reading schema from {schema_path}...")
    try:
        with open(schema_path, 'r') as f:
            schema_sql = f.read()
    except Exception as e:
        print(f"ERROR: Failed to read schema file: {e}")
        sys.exit(1)
    
    # Create tables
    print("Creating database tables...")
    try:
        with engine.begin() as conn:
            conn.execute(text(schema_sql))
        print("Successfully created database tables")
    except Exception as e:
        print(f"ERROR: Failed to create tables: {e}")
        sys.exit(1)
    
    # Check if tables were created
    check_sql = """
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
    """
    
    try:
        with engine.connect() as conn:
            result = conn.execute(text(check_sql))
            tables = [row[0] for row in result]
            
        if tables:
            print("Available tables:")
            for table in tables:
                print(f"  - {table}")
        else:
            print("No tables were created")
    except Exception as e:
        print(f"ERROR: Failed to verify table creation: {e}")
    
    print("\nDatabase setup complete!")

if __name__ == "__main__":
    main()