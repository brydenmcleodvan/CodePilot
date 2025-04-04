from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# In-memory storage for simplicity in this example
patient_data = None
health_metrics = None
medications = None
users = None
integrations = None
features = None

def load_patient_data():
    global patient_data
    try:
        data_path = os.path.join('data', 'sample_patient.json')
        if os.path.exists(data_path):
            with open(data_path, 'r') as f:
                patient_data = json.load(f)
        else:
            # Initialize with sample data if file doesn't exist
            patient_data = {
                "patient_id": "PT12345",
                "name": "John Doe",
                "age": 45,
                "gender": "Male",
                "medical_history": {
                    "conditions": ["Epilepsy", "Hypertension"],
                    "allergies": ["Penicillin"],
                    "neurological_history": {
                        "seizure_history": [
                            {"date": "2023-01-15", "type": "Focal", "duration_seconds": 120, "triggers": ["Stress", "Sleep deprivation"]},
                            {"date": "2023-03-22", "type": "Generalized", "duration_seconds": 180, "triggers": ["Missed medication"]},
                            {"date": "2023-06-10", "type": "Focal", "duration_seconds": 90, "triggers": ["Flashing lights"]}
                        ],
                        "eeg_results": [
                            {"date": "2023-02-01", "findings": "Abnormal electrical activity in the temporal lobe", "severity": "Moderate"},
                            {"date": "2023-07-15", "findings": "Improved electrical patterns, some abnormalities persist", "severity": "Mild"}
                        ],
                        "imaging_studies": [
                            {"date": "2023-01-20", "type": "MRI", "findings": "Small lesion in right temporal lobe", "recommendation": "Follow-up in 6 months"},
                            {"date": "2023-07-20", "type": "MRI", "findings": "No change in lesion size", "recommendation": "Continue current treatment"}
                        ],
                        "cognitive_assessment": {
                            "date": "2023-05-10",
                            "memory_score": 85,
                            "attention_score": 78,
                            "processing_speed": 82,
                            "overall_cognitive_status": "Mild impairment"
                        }
                    }
                },
                "medications": [
                    {"name": "Levetiracetam", "dosage": "500mg", "frequency": "Twice daily", "purpose": "Seizure control"},
                    {"name": "Lisinopril", "dosage": "10mg", "frequency": "Once daily", "purpose": "Blood pressure control"}
                ],
                "treatment_plan": {
                    "goals": ["Reduce seizure frequency", "Maintain blood pressure control", "Improve sleep quality"],
                    "interventions": [
                        {"type": "Medication", "details": "Continue current antiepileptic regimen"},
                        {"type": "Lifestyle", "details": "Stress reduction techniques, sleep hygiene"},
                        {"type": "Follow-up", "details": "Neurology appointment in 3 months"}
                    ],
                    "progress_notes": [
                        {"date": "2023-04-15", "note": "Patient reports 30% reduction in seizure frequency"},
                        {"date": "2023-07-20", "note": "Blood pressure well-controlled, seizure frequency stable"}
                    ]
                },
                "diagnostic_tests": [
                    {"date": "2023-01-05", "test": "Complete Blood Count", "result": "Normal", "reference_range": "N/A", "flag": False},
                    {"date": "2023-01-05", "test": "Comprehensive Metabolic Panel", "result": "Normal", "reference_range": "N/A", "flag": False},
                    {"date": "2023-01-05", "test": "Antiepileptic Drug Level", "result": "8.5 μg/mL", "reference_range": "4.0-12.0 μg/mL", "flag": False},
                    {"date": "2023-03-10", "test": "Antiepileptic Drug Level", "result": "14.2 μg/mL", "reference_range": "4.0-12.0 μg/mL", "flag": True},
                    {"date": "2023-07-01", "test": "Antiepileptic Drug Level", "result": "10.1 μg/mL", "reference_range": "4.0-12.0 μg/mL", "flag": False}
                ],
                "neural_profile": {
                    "brain_regions_affected": ["Temporal lobe", "Hippocampus"],
                    "neural_network_analysis": {
                        "connectivity_strength": 72,
                        "abnormal_patterns": ["Spike-wave discharges", "Theta rhythm abnormalities"],
                        "network_stability": "Moderate"
                    },
                    "neurotransmitter_levels": [
                        {"name": "GABA", "status": "Low", "clinical_significance": "May contribute to seizure susceptibility"},
                        {"name": "Glutamate", "status": "Elevated", "clinical_significance": "Potential excitotoxicity"}
                    ],
                    "neural_biomarkers": [
                        {"name": "Inflammatory markers", "value": "Slightly elevated", "interpretation": "Low-grade neuroinflammation"},
                        {"name": "Oxidative stress markers", "value": "Elevated", "interpretation": "Increased neuronal vulnerability"}
                    ],
                    "neural_treatment_response": {
                        "current_medication_efficacy": 65,
                        "neural_adaptation": "Positive response to therapy",
                        "side_effect_profile": "Minimal cognitive impact"
                    }
                }
            }
            # Save the sample data
            with open(data_path, 'w') as f:
                json.dump(patient_data, f, indent=2)
    except Exception as e:
        print(f"Error loading patient data: {e}")
        patient_data = {"error": "Failed to load patient data"}

def load_health_metrics():
    global health_metrics
    health_metrics = {
        "heart_rate": [{"date": "2023-07-01", "value": 72}, {"date": "2023-07-02", "value": 75}],
        "blood_pressure": [{"date": "2023-07-01", "value": "120/80"}, {"date": "2023-07-02", "value": "118/79"}],
        "sleep": [{"date": "2023-07-01", "value": 7.5}, {"date": "2023-07-02", "value": 8}],
        "steps": [{"date": "2023-07-01", "value": 8500}, {"date": "2023-07-02", "value": 10200}]
    }

def load_medications():
    global medications
    medications = [
        {"id": 1, "name": "Levetiracetam", "dosage": "500mg", "frequency": "Twice daily", "purpose": "Seizure control"},
        {"id": 2, "name": "Lisinopril", "dosage": "10mg", "frequency": "Once daily", "purpose": "Blood pressure control"}
    ]

def load_users():
    global users
    users = [
        {
            "id": 1,
            "name": "John Doe",
            "email": "john.doe@example.com",
            "role": "patient",
            "health_profile": {
                "height": 180,
                "weight": 80,
                "conditions": ["Epilepsy", "Hypertension"]
            }
        }
    ]

def load_integrations():
    global integrations
    integrations = [
        {"id": 1, "name": "Apple Health", "status": "connected", "last_sync": "2023-07-02T14:30:00Z"},
        {"id": 2, "name": "Fitbit", "status": "disconnected", "last_sync": None},
        {"id": 3, "name": "Google Fit", "status": "disconnected", "last_sync": None}
    ]

def load_features():
    global features
    features = [
        {"id": 1, "name": "Medication Tracking", "enabled": True},
        {"id": 2, "name": "Symptom Journal", "enabled": True},
        {"id": 3, "name": "Health Data Integration", "enabled": True},
        {"id": 4, "name": "Neural Profile Analysis", "enabled": True},
        {"id": 5, "name": "Doctor Appointment Scheduling", "enabled": False}
    ]

# Load all data on startup
load_patient_data()
load_health_metrics()
load_medications()
load_users()
load_integrations()
load_features()

@app.route('/api/patient', methods=['GET'])
def get_patient_data():
    return jsonify(patient_data)

@app.route('/api/health-metrics', methods=['GET'])
def get_health_metrics():
    return jsonify(health_metrics)

@app.route('/api/medications', methods=['GET'])
def get_medications():
    return jsonify(medications)

@app.route('/api/health-summary', methods=['GET'])
def get_health_summary():
    # Compute a summary based on patient data
    seizure_count = len(patient_data.get('medical_history', {}).get('neurological_history', {}).get('seizure_history', []))
    medication_count = len(patient_data.get('medications', []))
    latest_test = patient_data.get('diagnostic_tests', [])[-1] if patient_data.get('diagnostic_tests', []) else None
    
    summary = {
        "seizure_count": seizure_count,
        "medication_count": medication_count,
        "latest_test": latest_test,
        "overall_status": "Stable" if seizure_count < 3 else "Needs Attention"
    }
    return jsonify(summary)

@app.route('/api/check-symptoms', methods=['POST'])
def check_symptoms():
    data = request.json
    if not data or 'symptoms' not in data:
        return jsonify({"error": "No symptoms provided"}), 400
    
    symptoms = data['symptoms']
    # In a real application, this would be a more sophisticated analysis
    risk_level = "Low"
    if len(symptoms) > 3:
        risk_level = "Medium"
    if "seizure" in symptoms or "severe headache" in symptoms:
        risk_level = "High"
    
    return jsonify({
        "risk_level": risk_level,
        "recommendation": "Consult your neurologist" if risk_level == "High" else "Monitor your symptoms"
    })

@app.route('/api/users', methods=['GET'])
def get_users():
    return jsonify(users)

@app.route('/api/integrations', methods=['GET'])
def get_integrations():
    return jsonify(integrations)

@app.route('/api/features', methods=['GET'])
def get_features():
    return jsonify(features)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)