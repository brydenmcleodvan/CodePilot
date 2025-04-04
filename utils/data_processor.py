import json
import pandas as pd
from datetime import datetime

def load_patient_data(data=None):
    """Load and preprocess patient data"""
    if data is None:
        try:
            with open('data/sample_patient.json', 'r') as f:
                data = json.load(f)
        except Exception as e:
            print(f"Error loading patient data: {e}")
            return {"error": "Failed to load patient data"}
    
    # Add additional processing here if needed
    return data

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