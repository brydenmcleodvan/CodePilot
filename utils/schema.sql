-- Database Schema for Neural Profiles

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    display_name VARCHAR(255) NOT NULL,
    age_at_record INTEGER,
    physical_description TEXT,
    record_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medical History table
CREATE TABLE IF NOT EXISTS medical_history (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    neonatal_brain_injury BOOLEAN DEFAULT FALSE,
    seizure_type VARCHAR(255),
    seizure_frequency VARCHAR(255),
    migraines BOOLEAN DEFAULT FALSE,
    headaches TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Diagnostic Tests table
CREATE TABLE IF NOT EXISTS diagnostic_tests (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    test_type VARCHAR(100) NOT NULL,
    test_results TEXT,
    test_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Treatment Plans table
CREATE TABLE IF NOT EXISTS treatment_plans (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
    id SERIAL PRIMARY KEY,
    treatment_plan_id INTEGER REFERENCES treatment_plans(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    purpose TEXT,
    dosage VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    treatment_plan_id INTEGER REFERENCES treatment_plans(id) ON DELETE CASCADE,
    referral_type VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Social Health table
CREATE TABLE IF NOT EXISTS social_health (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    impact_on_daily_life TEXT,
    support_network TEXT,
    self_management TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EEG Results table (for detailed EEG data)
CREATE TABLE IF NOT EXISTS eeg_results (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    date DATE,
    findings TEXT,
    severity VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Imaging Studies table (for MRI, CT scans, etc.)
CREATE TABLE IF NOT EXISTS imaging_studies (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    type VARCHAR(100),
    date DATE,
    findings TEXT,
    recommendation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cognitive Assessment table
CREATE TABLE IF NOT EXISTS cognitive_assessments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    date DATE,
    overall_cognitive_status VARCHAR(100),
    memory_score INTEGER,
    attention_score INTEGER,
    processing_speed INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seizure Events table (for detailed seizure tracking)
CREATE TABLE IF NOT EXISTS seizure_events (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    date DATE,
    type VARCHAR(100),
    duration_seconds INTEGER,
    triggers TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for improved query performance
CREATE INDEX IF NOT EXISTS idx_medical_history_patient_id ON medical_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_tests_patient_id ON diagnostic_tests(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_patient_id ON treatment_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_social_health_patient_id ON social_health(patient_id);
CREATE INDEX IF NOT EXISTS idx_medications_treatment_plan_id ON medications(treatment_plan_id);
CREATE INDEX IF NOT EXISTS idx_referrals_treatment_plan_id ON referrals(treatment_plan_id);
CREATE INDEX IF NOT EXISTS idx_eeg_results_patient_id ON eeg_results(patient_id);
CREATE INDEX IF NOT EXISTS idx_imaging_studies_patient_id ON imaging_studies(patient_id);
CREATE INDEX IF NOT EXISTS idx_cognitive_assessments_patient_id ON cognitive_assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_seizure_events_patient_id ON seizure_events(patient_id);