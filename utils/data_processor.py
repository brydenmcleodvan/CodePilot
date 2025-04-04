import json
import pandas as pd
import os
from datetime import datetime

def load_patient_data(data=None, patient_id=None, use_db=False):
    """
    Load and preprocess patient data from either JSON or database
    
    Args:
        data: Pre-loaded patient data (optional)
        patient_id: ID of patient to load from database (optional)
        use_db: Whether to use database as data source (default: False)
    
    Returns:
        Processed patient data dictionary
    """
    # If data is already provided, use it
    if data is not None:
        return data
    
    # If using database and patient_id is provided
    if use_db and patient_id is not None:
        try:
            from utils.db import fetch_patient_data
            data = fetch_patient_data(patient_id)
            if not data:
                print(f"No patient found with ID {patient_id}")
                return {"error": f"No patient found with ID {patient_id}"}
            return data
        except Exception as e:
            print(f"Error loading patient data from database: {e}")
            return {"error": f"Failed to load patient data from database: {str(e)}"}
    
    # Otherwise load from JSON file
    try:
        # First try loading neural profile data
        if os.path.exists('data/neural_profile.json'):
            with open('data/neural_profile.json', 'r') as f:
                json_data = json.load(f)
                data = json_data.get('profile', {})
                if data:
                    return data
        
        # Fall back to sample patient data
        with open('data/sample_patient.json', 'r') as f:
            data = json.load(f)
            return data
    except Exception as e:
        print(f"Error loading patient data from file: {e}")
        return {"error": f"Failed to load patient data: {str(e)}"}
    
def get_all_patients(use_db=False):
    """
    Get a list of all available patients
    
    Args:
        use_db: Whether to use database as data source (default: False)
    
    Returns:
        List of patient summary dictionaries
    """
    if use_db:
        try:
            from utils.db import fetch_all_patients
            patients = fetch_all_patients()
            return patients
        except Exception as e:
            print(f"Error fetching patients from database: {e}")
            return []
    
    # If not using database, check for JSON files
    patients = []
    try:
        # Check for neural profile
        if os.path.exists('data/neural_profile.json'):
            with open('data/neural_profile.json', 'r') as f:
                data = json.load(f)
                profile = data.get('profile', {})
                personal_info = profile.get('personal_info', {})
                
                if personal_info:
                    patients.append({
                        'id': 'neural_profile',
                        'display_name': personal_info.get('display_name', 'Unknown'),
                        'age_at_record': personal_info.get('age_at_record', 'Unknown'),
                        'record_date': personal_info.get('record_date', 'Unknown')
                    })
        
        # Check for sample patient
        if os.path.exists('data/sample_patient.json'):
            with open('data/sample_patient.json', 'r') as f:
                data = json.load(f)
                personal_info = data.get('personal_info', {})
                
                if personal_info:
                    patients.append({
                        'id': 'sample_patient',
                        'display_name': personal_info.get('display_name', 'Unknown'),
                        'age_at_record': personal_info.get('age_at_record', 'Unknown'),
                        'record_date': personal_info.get('record_date', 'Unknown')
                    })
    except Exception as e:
        print(f"Error loading patients from JSON: {e}")
    
    return patients

def analyze_seizure_frequency(data):
    """Analyze seizure frequency and patterns"""
    try:
        seizure_history = data.get('medical_history', {}).get('neurological_history', {}).get('seizure_history', [])
        if not seizure_history:
            return {"message": "No seizure history available"}
        
        # Convert to DataFrame for analysis
        df = pd.DataFrame(seizure_history)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        # Calculate time between seizures
        df['days_since_last'] = df['date'].diff().dt.days
        
        # Group by month for frequency analysis
        df['month'] = df['date'].dt.to_period('M')
        monthly_counts = df.groupby('month').size().reset_index()
        monthly_counts.columns = ['month', 'seizure_count']
        
        # Get trigger frequencies
        all_triggers = []
        for triggers in df['triggers']:
            all_triggers.extend(triggers)
        
        trigger_counts = pd.Series(all_triggers).value_counts().to_dict()
        
        # Analyze seizure types
        seizure_types = df['type'].value_counts().to_dict()
        
        # Calculate average seizure duration
        avg_duration = df['duration_seconds'].mean()
        
        # Determine if there's a trend (simple linear analysis)
        if len(monthly_counts) > 1:
            first_count = monthly_counts['seizure_count'].iloc[0]
            last_count = monthly_counts['seizure_count'].iloc[-1]
            trend = "Improving" if last_count < first_count else "Worsening" if last_count > first_count else "Stable"
        else:
            trend = "Insufficient data for trend analysis"
        
        return {
            "total_seizures": len(df),
            "seizure_types": seizure_types,
            "average_duration_seconds": round(avg_duration, 1),
            "common_triggers": trigger_counts,
            "trend": trend,
            "first_recorded": df['date'].min().strftime('%Y-%m-%d'),
            "last_recorded": df['date'].max().strftime('%Y-%m-%d'),
        }
    except Exception as e:
        print(f"Error analyzing seizure data: {e}")
        return {"error": f"Failed to analyze seizure data: {str(e)}"}

def process_diagnostic_tests(data):
    """Process and analyze diagnostic test results"""
    try:
        tests = data.get('diagnostic_tests', [])
        if not tests:
            return {"message": "No diagnostic tests available"}
        
        df = pd.DataFrame(tests)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        # Calculate flagged tests percentage
        flagged_tests = df[df['flag'] == True]
        flagged_percentage = len(flagged_tests) / len(df) * 100 if len(df) > 0 else 0
        
        # Group by test type
        test_types = df['test'].unique()
        test_summaries = {}
        
        for test_type in test_types:
            test_df = df[df['test'] == test_type]
            test_summaries[test_type] = {
                "count": len(test_df),
                "first_date": test_df['date'].min().strftime('%Y-%m-%d'),
                "last_date": test_df['date'].max().strftime('%Y-%m-%d'),
                "flagged_count": len(test_df[test_df['flag'] == True])
            }
        
        return {
            "total_tests": len(df),
            "flagged_percentage": round(flagged_percentage, 1),
            "test_types": list(test_types),
            "test_summaries": test_summaries,
            "latest_test_date": df['date'].max().strftime('%Y-%m-%d')
        }
    except Exception as e:
        print(f"Error processing diagnostic tests: {e}")
        return {"error": f"Failed to process diagnostic tests: {str(e)}"}