import json
import os
import streamlit as st

def display_patient_profile(patient_data):
    """Display patient profile information"""
    st.header("Patient Profile")
    
    col1, col2 = st.columns([1, 2])
    
    with col1:
        st.image("https://placehold.co/400x400/4A90E2/FFFFFF?text=JD", width=150)
    
    with col2:
        st.subheader(f"{patient_data.get('name', 'Unknown Patient')}")
        st.markdown(f"**Patient ID:** {patient_data.get('patient_id', 'Unknown')}")
        st.markdown(f"**Age:** {patient_data.get('age', 'Unknown')} years")
        st.markdown(f"**Gender:** {patient_data.get('gender', 'Unknown')}")
    
    st.markdown("---")
    
    # Health conditions and allergies
    st.subheader("Health Profile")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("##### Medical Conditions")
        conditions = patient_data.get('medical_history', {}).get('conditions', [])
        if conditions:
            for condition in conditions:
                st.markdown(f"- {condition}")
        else:
            st.markdown("No medical conditions recorded.")
    
    with col2:
        st.markdown("##### Allergies")
        allergies = patient_data.get('medical_history', {}).get('allergies', [])
        if allergies:
            for allergy in allergies:
                st.markdown(f"- {allergy}")
        else:
            st.markdown("No allergies recorded.")
    
    # Current medications
    st.subheader("Current Medications")
    medications = patient_data.get('medications', [])
    if medications:
        cols = st.columns(len(medications))
        for i, med in enumerate(medications):
            with cols[i]:
                st.markdown(f"##### {med.get('name', 'Unknown')}")
                st.markdown(f"**Dosage:** {med.get('dosage', 'Unknown')}")
                st.markdown(f"**Frequency:** {med.get('frequency', 'Unknown')}")
                st.markdown(f"**Purpose:** {med.get('purpose', 'Unknown')}")
    else:
        st.markdown("No current medications recorded.")
    
    # Neural Profile Overview (summary)
    st.subheader("Neural Profile Overview")
    neural_profile = patient_data.get('neural_profile', {})
    
    if neural_profile:
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("##### Affected Brain Regions")
            regions = neural_profile.get('brain_regions_affected', [])
            for region in regions:
                st.markdown(f"- {region}")
            
            if 'neural_network_analysis' in neural_profile:
                analysis = neural_profile['neural_network_analysis']
                st.markdown("##### Neural Network Status")
                st.markdown(f"- **Connectivity:** {analysis.get('connectivity_strength', 'Unknown')}/100")
                st.markdown(f"- **Stability:** {analysis.get('network_stability', 'Unknown')}")
        
        with col2:
            st.markdown("##### Key Neurotransmitters")
            neurotransmitters = neural_profile.get('neurotransmitter_levels', [])
            for nt in neurotransmitters:
                st.markdown(f"- **{nt.get('name', 'Unknown')}:** {nt.get('status', 'Unknown')}")
                
            st.markdown("##### Treatment Response")
            if 'neural_treatment_response' in neural_profile:
                response = neural_profile['neural_treatment_response']
                st.markdown(f"- **Medication Efficacy:** {response.get('current_medication_efficacy', 'Unknown')}/100")
                st.markdown(f"- **Neural Adaptation:** {response.get('neural_adaptation', 'Unknown')}")
    else:
        st.markdown("No neural profile data available.")