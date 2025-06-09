import os
import json
from utils.db import import_json_to_database

def main():
    """Import neural profile sample data into database"""
    # Check if database URL is available
    if not os.environ.get('DATABASE_URL'):
        print("ERROR: DATABASE_URL environment variable not set")
        return
    
    # Import the sample data
    json_path = "data/neural_profile.json"
    if not os.path.exists(json_path):
        print(f"ERROR: Sample data file not found at {json_path}")
        return
    
    try:
        print(f"Importing neural profile data from {json_path}...")
        patient_id, message = import_json_to_database(json_path)
        
        if patient_id:
            print(f"SUCCESS: Data imported with patient ID: {patient_id}")
            
            # Verify import using direct SQL queries instead of fetch_patient_data
            print("\nVerifying patient data using direct SQL queries:")
            
            # Use SQL to verify the import
            from sqlalchemy import create_engine, text
            
            engine = create_engine(os.environ.get('DATABASE_URL'))
            
            # Check patient
            with engine.connect() as conn:
                patient_result = conn.execute(
                    text("SELECT display_name, record_date FROM patients WHERE id = :id"),
                    {"id": patient_id}
                )
                patient = patient_result.fetchone()
                if patient:
                    print(f"Patient Name: {patient[0]}")
                    print(f"Record Date: {patient[1]}")
                else:
                    print("Patient not found!")
                
                # Check medications
                med_result = conn.execute(
                    text("""
                        SELECT m.name, m.purpose FROM medications m 
                        JOIN treatment_plans tp ON m.treatment_plan_id = tp.id
                        WHERE tp.patient_id = :patient_id
                    """),
                    {"patient_id": patient_id}
                )
                medications = med_result.fetchall()
                
                if medications:
                    print(f"\nMedications: {len(medications)}")
                    for med in medications:
                        print(f"  - {med[0]}: {med[1]}")
                else:
                    print("\nNo medications found")
                
                # Check referrals
                ref_result = conn.execute(
                    text("""
                        SELECT r.referral_type FROM referrals r
                        JOIN treatment_plans tp ON r.treatment_plan_id = tp.id
                        WHERE tp.patient_id = :patient_id
                    """),
                    {"patient_id": patient_id}
                )
                referrals = ref_result.fetchall()
                
                if referrals:
                    print(f"\nReferrals: {len(referrals)}")
                    for ref in referrals:
                        print(f"  - {ref[0]}")
                else:
                    print("\nNo referrals found")
                    
                # Check diagnostic tests
                test_result = conn.execute(
                    text("""
                        SELECT test_type, test_results FROM diagnostic_tests
                        WHERE patient_id = :patient_id
                    """),
                    {"patient_id": patient_id}
                )
                tests = test_result.fetchall()
                
                if tests:
                    print(f"\nDiagnostic Tests: {len(tests)}")
                    for test in tests:
                        print(f"  - {test[0]}: {test[1]}")
                else:
                    print("\nNo diagnostic tests found")
        else:
            print(f"ERROR: {message}")
    except Exception as e:
        print(f"ERROR: Failed to import sample data: {e}")

if __name__ == "__main__":
    main()