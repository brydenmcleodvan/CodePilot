# streamlit_app.py
import streamlit as st
import json
import os
import pandas as pd
from utils.data_processor import load_patient_data, analyze_seizure_frequency
from utils.visualization import create_timeline
from components.patient_profile import display_patient_profile
from components.medical_history import display_medical_history
from components.treatment_plan import display_treatment_plan
from components.diagnostics import display_diagnostic_tests

st.set_page_config(
    page_title="Medical Record Dashboard",
    page_icon="🏥",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.title("Medical Record Dashboard")
st.markdown("---")

def get_data_path(data_type="patient"):
    if data_type == "neural_profile":
        return "data/neural_profile.json"
    return "data/sample_patient.json"

@st.cache_data
def load_data(data_type="patient"):
    data_path = get_data_path(data_type)
    with open(data_path, 'r') as f:
        return json.load(f)

patient_data = load_data()
processed_data = load_patient_data(patient_data)
neural_profile_data = load_data("neural_profile")

st.sidebar.title("Navigation")
selected_view = st.sidebar.radio(
    "Select View",
    ["Patient Profile", "Medical History", "Treatment Plan", "Diagnostic Tests", "Analysis Dashboard", "Neurological Profile"]
)

if selected_view == "Patient Profile":
    display_patient_profile(processed_data)
elif selected_view == "Medical History":
    display_medical_history(processed_data)
elif selected_view == "Treatment Plan":
    display_treatment_plan(processed_data)
elif selected_view == "Diagnostic Tests":
    display_diagnostic_tests(processed_data)
elif selected_view == "Analysis Dashboard":
    st.header("Analysis Dashboard")
    col1, col2 = st.columns(2)
    with col1:
        st.subheader("Neurological Summary")
        timeline_chart = create_timeline(processed_data)
        st.plotly_chart(timeline_chart, use_container_width=True)
    with col2:
        st.subheader("Symptom Impact Analysis")
        if 'seizure_history' in processed_data.get('medical_history', {}).get('neurological_history', {}):
            seizure_analysis = analyze_seizure_frequency(processed_data)
            st.write(seizure_analysis)
        else:
            st.info("No seizure history data available for analysis.")
elif selected_view == "Neurological Profile":
    profile_data = neural_profile_data.get('profile', {})
    
    st.header(f"Neurological Profile: {profile_data.get('personal_info', {}).get('display_name', 'Unknown')}")
    
    # Personal Info Section
    st.subheader("Personal Information")
    personal_info = profile_data.get('personal_info', {})
    col1, col2 = st.columns(2)
    with col1:
        st.write(f"**Age at Record:** {personal_info.get('age_at_record', 'Unknown')}")
        st.write(f"**Physical Description:** {personal_info.get('physical_description', 'Unknown')}")
    with col2:
        st.write(f"**Record Date:** {personal_info.get('record_date', 'Unknown')}")
    
    # Medical History Section
    st.subheader("Neurological History")
    neuro_history = profile_data.get('medical_history', {}).get('neurological_history', {})
    
    col1, col2 = st.columns(2)
    with col1:
        st.write(f"**Neonatal Brain Injury:** {'Yes' if neuro_history.get('neonatal_brain_injury') else 'No'}")
        st.write(f"**Migraines:** {'Yes' if neuro_history.get('migraines') else 'No'}")
        st.write(f"**Headaches:** {neuro_history.get('headaches', 'Unknown')}")
    with col2:
        seizure_history = neuro_history.get('seizure_history', {})
        st.write("**Seizure History:**")
        st.write(f"- Type: {seizure_history.get('type', 'Unknown')}")
        st.write(f"- Frequency: {seizure_history.get('frequency', 'Unknown')}")
    
    # Diagnostic Tests Section
    st.subheader("Diagnostic Tests")
    diagnostic_tests = profile_data.get('medical_history', {}).get('diagnostic_tests', {})
    
    col1, col2 = st.columns(2)
    with col1:
        st.write(f"**EEG Results:** {diagnostic_tests.get('EEG', 'Unknown')}")
    with col2:
        st.write(f"**MRI Results:** {diagnostic_tests.get('MRI', 'Unknown')}")
    
    # Treatment Plan Section
    st.subheader("Treatment Plan")
    treatment_plan = profile_data.get('treatment_plan', {})
    
    st.write("**Medications:**")
    medications = treatment_plan.get('medications', [])
    if medications:
        for med in medications:
            st.write(f"- {med.get('name', 'Unknown')}: {med.get('purpose', 'Unknown')}")
    else:
        st.write("No medications listed")
        
    st.write("**Referrals:**")
    referrals = treatment_plan.get('referrals', [])
    if referrals:
        for referral in referrals:
            st.write(f"- {referral}")
    else:
        st.write("No referrals listed")
    
    # Social Health Section
    st.subheader("Social Health Impact")
    social_health = profile_data.get('social_health', {})
    
    st.write(f"**Impact on Daily Life:** {social_health.get('impact_on_daily_life', 'Unknown')}")
    st.write(f"**Support Network:** {social_health.get('support_network', 'Unknown')}")
    st.write(f"**Self Management:** {social_health.get('self_management', 'Unknown')}")