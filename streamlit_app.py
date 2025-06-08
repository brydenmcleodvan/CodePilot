# streamlit_app.py
import streamlit as st
import json
import os
import pandas as pd
from utils.data_processor import load_patient_data, analyze_seizure_frequency, get_all_patients
from utils.visualization import create_timeline
from components.patient_profile import display_patient_profile
from components.medical_history import display_medical_history
from components.treatment_plan import display_treatment_plan
from components.diagnostics import display_diagnostic_tests
from components.database_admin import display_database_admin

st.set_page_config(
    page_title="Medical Record Dashboard",
    page_icon="🏥",
    layout="wide",
    initial_sidebar_state="expanded"
)

st.title("Medical Record Dashboard")
st.markdown("---")

# Initialize session state for data source preference
if 'use_database' not in st.session_state:
    st.session_state.use_database = False

# Data Source Selection
with st.sidebar:
    st.title("Data Settings")
    use_db = st.checkbox("Use Database", value=st.session_state.use_database)
    st.session_state.use_database = use_db

# Get patient list based on data source
patients = get_all_patients(use_db=st.session_state.use_database)

# Patient Selection
selected_patient_id = None
if patients:
    with st.sidebar:
        st.subheader("Select Patient")
        
        if st.session_state.use_database:
            # Format options for database patients
            patient_options = {f"{p['display_name']} (ID: {p['id']})": p['id'] for p in patients}
            selected_patient = st.selectbox(
                "Patient",
                options=list(patient_options.keys()),
                key="patient_selector"
            )
            selected_patient_id = patient_options[selected_patient]
        else:
            # Format options for JSON patients
            patient_options = {f"{p['display_name']}": p['id'] for p in patients}
            selected_patient = st.selectbox(
                "Patient",
                options=list(patient_options.keys()),
                key="patient_selector_json"
            )
            selected_patient_id = patient_options[selected_patient]
else:
    st.sidebar.warning("No patients available")

# Load the selected patient data
processed_data = load_patient_data(
    patient_id=selected_patient_id,
    use_db=st.session_state.use_database
)

# Navigation menu
st.sidebar.title("Navigation")
nav_options = [
    "Patient Profile",
    "Medical History",
    "Treatment Plan",
    "Diagnostic Tests",
    "Analysis Dashboard"
]

# Add admin page if using database
if st.session_state.use_database:
    nav_options.append("Database Admin")

selected_view = st.sidebar.radio(
    "Select View",
    nav_options
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
elif selected_view == "Database Admin":
    # Show database administration view
    display_database_admin()