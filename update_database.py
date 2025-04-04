#!/usr/bin/env python3
"""
Database Update Utility

This script checks the database and adds any missing data from JSON sources.
"""

import os
import sys
import json
from datetime import datetime

def main():
    """Update the database with any missing records from JSON files"""
    # Ensure current directory is in path
    sys.path.append('.')
    
    # Check if database URL is available
    if not os.environ.get('DATABASE_URL'):
        print("ERROR: DATABASE_URL environment variable not set")
        return 1
    
    # Import database utilities
    try:
        from utils.db import fetch_all_patients, import_json_to_database
    except ImportError as e:
        print(f"ERROR: Failed to import database utilities: {e}")
        return 1
    
    # Check for existing patients
    patients = fetch_all_patients()
    patient_count = len(patients)
    print(f"Found {patient_count} patients in the database")
    
    # If no patients found, import sample data
    if patient_count == 0:
        print("No patients found in database. Adding sample data...")
        
        # Check for neural profile
        if os.path.exists('data/neural_profile.json'):
            print("Importing neural profile data...")
            patient_id, message = import_json_to_database('data/neural_profile.json')
            if patient_id:
                print(f"Successfully imported neural profile data with patient ID: {patient_id}")
            else:
                print(f"ERROR: Failed to import neural profile data: {message}")
    else:
        print("Database already contains patient data")
        
    # Print all available patients
    print("\nAvailable patients in database:")
    for patient in fetch_all_patients():
        print(f"  - {patient['display_name']} (ID: {patient['id']}, Record date: {patient['record_date']})")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())