from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import logging
from utils.db_pool import get_db_cursor, close_pool

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# In-memory cache for frequently accessed data
patient_data = None
health_metrics = None
medications = None
users = None
integrations = None
features = None

# Register close_pool function to be called when app shuts down
@app.teardown_appcontext
def shutdown_session(exception=None):
    close_pool()

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

# Check database connection on startup
try:
    with get_db_cursor() as cursor:
        cursor.execute("SELECT 1")
        logger.info("Database connection successful")
except Exception as e:
    logger.error(f"Database connection failed: {e}")
    logger.info("Falling back to in-memory data")

# Load all data on startup
load_patient_data()
load_health_metrics()
load_medications()
load_users()
load_integrations()
load_features()

@app.route('/api/patient', methods=['GET'])
def get_patient_data():
    # Try to get data from database first, fall back to in-memory cache
    try:
        with get_db_cursor() as cursor:
            # Get primary patient data
            cursor.execute("""
                SELECT p.id, p.display_name, p.age_at_record, 
                       p.physical_description, p.record_date
                FROM patients p
                LIMIT 1
            """)
            patient_row = cursor.fetchone()
            
            if patient_row and patient_row[0]:
                patient_id = patient_row[0]
                patient = {
                    "id": patient_id,
                    "patient_id": f"PT{patient_id}",
                    "name": patient_row[1] or "John Doe",
                    "age": patient_row[2] or 45,
                    "gender": "Male",  # Assuming default since we don't have this column
                    "physical_description": patient_row[3] or ""
                }
                
                # Get medical history
                cursor.execute("""
                    SELECT id, allergies, conditions, surgeries, family_history
                    FROM medical_history
                    WHERE patient_id = %s
                """, (patient_id,))
                med_history_row = cursor.fetchone()
                
                if med_history_row:
                    patient["medical_history"] = {
                        "conditions": med_history_row[2] if med_history_row[2] else ["Epilepsy", "Hypertension"],
                        "allergies": med_history_row[1] if med_history_row[1] else ["Penicillin"],
                        "surgeries": med_history_row[3] if med_history_row[3] else []
                    }
                else:
                    patient["medical_history"] = {
                        "conditions": ["Epilepsy", "Hypertension"],
                        "allergies": ["Penicillin"]
                    }
                
                # Get seizure events for neurological history
                cursor.execute("""
                    SELECT id, date, type, duration_seconds, triggers
                    FROM seizure_events
                    WHERE patient_id = %s
                    ORDER BY date DESC
                """, (patient_id,))
                seizure_rows = cursor.fetchall()
                
                # Get EEG results
                cursor.execute("""
                    SELECT id, date, findings, severity
                    FROM eeg_results
                    WHERE patient_id = %s
                    ORDER BY date DESC
                """, (patient_id,))
                eeg_rows = cursor.fetchall()
                
                # Get imaging studies
                cursor.execute("""
                    SELECT id, date, type, findings, recommendations
                    FROM imaging_studies
                    WHERE patient_id = %s
                    ORDER BY date DESC
                """, (patient_id,))
                imaging_rows = cursor.fetchall()
                
                # Get cognitive assessment
                cursor.execute("""
                    SELECT id, date, memory_score, attention_score, processing_speed, overall_status
                    FROM cognitive_assessments
                    WHERE patient_id = %s
                    ORDER BY date DESC
                    LIMIT 1
                """, (patient_id,))
                cognitive_row = cursor.fetchone()
                
                # Construct neurological history
                neuro_history = {}
                if seizure_rows:
                    neuro_history["seizure_history"] = [
                        {
                            "date": row[1].strftime("%Y-%m-%d") if row[1] else "2023-01-15",
                            "type": row[2] or "Focal",
                            "duration_seconds": row[3] or 120,
                            "triggers": row[4] if row[4] else ["Stress", "Sleep deprivation"]
                        }
                        for row in seizure_rows
                    ]
                
                if eeg_rows:
                    neuro_history["eeg_results"] = [
                        {
                            "date": row[1].strftime("%Y-%m-%d") if row[1] else "2023-02-01",
                            "findings": row[2] or "Abnormal electrical activity",
                            "severity": row[3] or "Moderate"
                        }
                        for row in eeg_rows
                    ]
                
                if imaging_rows:
                    neuro_history["imaging_studies"] = [
                        {
                            "date": row[1].strftime("%Y-%m-%d") if row[1] else "2023-01-20",
                            "type": row[2] or "MRI",
                            "findings": row[3] or "Small lesion in right temporal lobe",
                            "recommendation": row[4] or "Follow-up in 6 months"
                        }
                        for row in imaging_rows
                    ]
                
                if cognitive_row:
                    neuro_history["cognitive_assessment"] = {
                        "date": cognitive_row[1].strftime("%Y-%m-%d") if cognitive_row[1] else "2023-05-10",
                        "memory_score": cognitive_row[2] or 85,
                        "attention_score": cognitive_row[3] or 78,
                        "processing_speed": cognitive_row[4] or 82,
                        "overall_cognitive_status": cognitive_row[5] or "Mild impairment"
                    }
                
                # Add neurological history to medical history
                if neuro_history and isinstance(patient["medical_history"], dict):
                    patient["medical_history"] = {
                        **patient["medical_history"],
                        "neurological_history": neuro_history
                    }
                
                # Get medications from treatment plan
                cursor.execute("""
                    SELECT tp.id
                    FROM treatment_plans tp
                    WHERE tp.patient_id = %s
                    ORDER BY tp.created_at DESC
                    LIMIT 1
                """, (patient_id,))
                treatment_plan_row = cursor.fetchone()
                
                if treatment_plan_row:
                    treatment_plan_id = treatment_plan_row[0]
                    cursor.execute("""
                        SELECT id, name, dosage, purpose
                        FROM medications
                        WHERE treatment_plan_id = %s
                    """, (treatment_plan_id,))
                    med_rows = cursor.fetchall()
                    
                    if med_rows:
                        patient["medications"] = [
                            {
                                "id": row[0],
                                "name": row[1] or "Medication",
                                "dosage": row[2] or "500mg",
                                "frequency": "Twice daily",  # Default value since we don't have this column
                                "purpose": row[3] or "Treatment"
                            }
                            for row in med_rows
                        ]
                
                # Get treatment plan details
                cursor.execute("""
                    SELECT id, goals, interventions, progress_notes
                    FROM treatment_plans
                    WHERE patient_id = %s
                    ORDER BY created_at DESC
                    LIMIT 1
                """, (patient_id,))
                tp_row = cursor.fetchone()
                
                if tp_row:
                    patient["treatment_plan"] = {
                        "goals": tp_row[1] if tp_row[1] else ["Reduce seizure frequency", "Maintain blood pressure control"],
                        "interventions": tp_row[2] if tp_row[2] else [
                            {"type": "Medication", "details": "Continue current antiepileptic regimen"},
                            {"type": "Lifestyle", "details": "Stress reduction techniques, sleep hygiene"}
                        ],
                        "progress_notes": tp_row[3] if tp_row[3] else [
                            {"date": "2023-04-15", "note": "Patient reports 30% reduction in seizure frequency"}
                        ]
                    }
                
                # Get diagnostic tests
                cursor.execute("""
                    SELECT id, test_date, test_type, test_results
                    FROM diagnostic_tests
                    WHERE patient_id = %s
                    ORDER BY test_date DESC
                """, (patient_id,))
                test_rows = cursor.fetchall()
                
                if test_rows:
                    patient["diagnostic_tests"] = [
                        {
                            "date": row[1].strftime("%Y-%m-%d") if row[1] else "2023-01-05",
                            "test": row[2] or "Complete Blood Count",
                            "result": row[3] or "Normal",
                            "reference_range": "N/A",
                            "flag": False
                        }
                        for row in test_rows
                    ]
                
                # Add neural profile data (simplified for now)
                patient["neural_profile"] = {
                    "brain_regions_affected": ["Temporal lobe", "Hippocampus"],
                    "neural_network_analysis": {
                        "connectivity_strength": 72,
                        "abnormal_patterns": ["Spike-wave discharges", "Theta rhythm abnormalities"],
                        "network_stability": "Moderate"
                    },
                    "neurotransmitter_levels": [
                        {"name": "GABA", "status": "Low", "clinical_significance": "May contribute to seizure susceptibility"},
                        {"name": "Glutamate", "status": "Elevated", "clinical_significance": "Potential excitotoxicity"}
                    ]
                }
                
                # Update cache
                global patient_data
                patient_data = patient
                return jsonify(patient)
    except Exception as e:
        logger.error(f"Error fetching patient data from database: {e}")
        # If error occurs, use cached data
    
    return jsonify(patient_data)

@app.route('/api/health-metrics', methods=['GET'])
def get_health_metrics():
    return jsonify(health_metrics)

@app.route('/api/medications', methods=['GET'])
def get_medications():
    # Try to get data from database first, fall back to in-memory cache
    try:
        with get_db_cursor() as cursor:
            cursor.execute("""
                SELECT m.id, m.name, m.dosage, m.purpose, tp.patient_id 
                FROM medications m
                LEFT JOIN treatment_plans tp ON m.treatment_plan_id = tp.id
            """)
            rows = cursor.fetchall()
            if rows:
                result = [
                    {
                        "id": row[0],
                        "name": row[1] or "Unknown Medication",
                        "dosage": row[2] or "Standard dose",
                        "frequency": "As directed",  # This field isn't in our DB schema
                        "purpose": row[3] or "Treatment",
                        "patient_id": row[4]
                    }
                    for row in rows
                ]
                # Update cache
                global medications
                medications = result
                return jsonify(result)
    except Exception as e:
        logger.error(f"Error fetching medications from database: {e}")
        # If error occurs, use cached data
    
    return jsonify(medications)

@app.route('/api/health-summary', methods=['GET'])
def get_health_summary():
    try:
        with get_db_cursor() as cursor:
            # Get a patient ID for reference
            cursor.execute("SELECT id FROM patients LIMIT 1")
            patient_id_row = cursor.fetchone()
            
            if not patient_id_row:
                raise Exception("No patients found in database")
                
            patient_id = patient_id_row[0]
            
            # Get seizure count from database
            cursor.execute("""
                SELECT COUNT(*) 
                FROM seizure_events
                WHERE patient_id = %s
            """, (patient_id,))
            seizure_count = cursor.fetchone()[0] or 0
            
            # Get medication count
            cursor.execute("""
                SELECT COUNT(*) 
                FROM medications m
                JOIN treatment_plans tp ON m.treatment_plan_id = tp.id
                WHERE tp.patient_id = %s
            """, (patient_id,))
            medication_count = cursor.fetchone()[0] or 0
            
            # Get latest diagnostic test
            cursor.execute("""
                SELECT test_date, test_type, test_results 
                FROM diagnostic_tests
                WHERE patient_id = %s
                ORDER BY test_date DESC
                LIMIT 1
            """, (patient_id,))
            latest_test_row = cursor.fetchone()
            
            latest_test = None
            if latest_test_row:
                latest_test = {
                    "date": latest_test_row[0].strftime("%Y-%m-%d") if latest_test_row[0] else None,
                    "test": latest_test_row[1] or "Comprehensive Metabolic Panel",
                    "result": latest_test_row[2] or "Normal",
                    "reference_range": "N/A",
                    "flag": False
                }
            
            summary = {
                "seizure_count": seizure_count,
                "medication_count": medication_count,
                "latest_test": latest_test,
                "overall_status": "Stable" if seizure_count < 3 else "Needs Attention"
            }
            return jsonify(summary)
    except Exception as e:
        logger.error(f"Error fetching health summary from database: {e}")
        # Fall back to calculating from cache if necessary
        
        # Use a more defensive approach with the potentially new structure
        seizure_count = 0
        if isinstance(patient_data, dict):
            med_history = patient_data.get('medical_history', {})
            if isinstance(med_history, dict):
                neuro_history = med_history.get('neurological_history', {})
                if isinstance(neuro_history, dict):
                    seizure_history = neuro_history.get('seizure_history', [])
                    seizure_count = len(seizure_history) if isinstance(seizure_history, list) else 0
        
        medication_count = 0
        if isinstance(patient_data, dict):
            medications_list = patient_data.get('medications', [])
            medication_count = len(medications_list) if isinstance(medications_list, list) else 0
        
        latest_test = None
        if isinstance(patient_data, dict):
            diagnostic_tests = patient_data.get('diagnostic_tests', [])
            if isinstance(diagnostic_tests, list) and diagnostic_tests:
                latest_test = diagnostic_tests[-1]
        
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
    # Just return the in-memory cache as we don't have a users table in the database
    return jsonify(users)

@app.route('/api/integrations', methods=['GET'])
def get_integrations():
    return jsonify(integrations)

@app.route('/api/features', methods=['GET'])
def get_features():
    return jsonify(features)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)