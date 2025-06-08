import json
import os
import streamlit as st
import pandas as pd
from datetime import datetime

def display_treatment_plan(patient_data):
    """Display patient treatment plan"""
    st.header("Treatment Plan")
    
    treatment_plan = patient_data.get('treatment_plan', {})
    
    if not treatment_plan:
        st.warning("No treatment plan data available.")
        return
    
    # Treatment Goals
    st.subheader("Treatment Goals")
    goals = treatment_plan.get('goals', [])
    if goals:
        for i, goal in enumerate(goals):
            st.checkbox(goal, value=False, key=f"goal_{i}", disabled=True)
    else:
        st.info("No treatment goals specified.")
    
    # Treatment Interventions
    st.subheader("Interventions")
    interventions = treatment_plan.get('interventions', [])
    
    if interventions:
        # Group interventions by type
        intervention_types = {}
        for intervention in interventions:
            int_type = intervention.get('type', 'Other')
            if int_type not in intervention_types:
                intervention_types[int_type] = []
            intervention_types[int_type].append(intervention.get('details', ''))
        
        # Create tabs for each intervention type
        tabs = st.tabs(list(intervention_types.keys()))
        
        for i, (int_type, details_list) in enumerate(intervention_types.items()):
            with tabs[i]:
                for details in details_list:
                    st.markdown(f"- {details}")
                
                # Add extra information based on intervention type
                if int_type == "Medication":
                    st.markdown("---")
                    st.markdown("##### Medication Management Tips")
                    st.markdown("""
                    - Take medications at the same time each day
                    - Set reminders to avoid missed doses
                    - Report any side effects to your doctor
                    - Do not stop medications without consulting your doctor
                    """)
                elif int_type == "Lifestyle":
                    st.markdown("---")
                    st.markdown("##### Lifestyle Modification Resources")
                    st.markdown("""
                    - [Sleep Hygiene Guidelines](https://www.sleepfoundation.org/sleep-hygiene)
                    - [Stress Reduction Techniques](https://www.health.harvard.edu/mind-and-mood/six-relaxation-techniques-to-reduce-stress)
                    - [Epilepsy Foundation Wellness Resources](https://www.epilepsy.com/living-with-epilepsy/healthy-living)
                    """)
    else:
        st.info("No interventions specified.")
    
    # Progress Notes
    st.subheader("Progress Notes")
    progress_notes = treatment_plan.get('progress_notes', [])
    
    if progress_notes:
        # Convert to dataframe for easier display
        notes_df = pd.DataFrame(progress_notes)
        notes_df['date'] = pd.to_datetime(notes_df['date'])
        notes_df = notes_df.sort_values('date', ascending=False)
        
        # Display progress notes with expandable sections
        for _, note in notes_df.iterrows():
            with st.expander(note['date'].strftime('%Y-%m-%d')):
                st.markdown(note['note'])
                
        # Timeline visualization
        st.markdown("##### Treatment Timeline")
        timeline_df = notes_df.copy()
        timeline_df['date_str'] = timeline_df['date'].dt.strftime('%Y-%m-%d')
        
        # Create a simple timeline
        st.markdown("<div style='height: 100px; position: relative;'>", unsafe_allow_html=True)
        
        # Calculate positions
        min_date = timeline_df['date'].min()
        max_date = timeline_df['date'].max()
        date_range = (max_date - min_date).days
        
        for i, (_, note) in enumerate(timeline_df.iterrows()):
            days_from_start = (note['date'] - min_date).days
            position = days_from_start / date_range * 100 if date_range > 0 else 50
            
            st.markdown(
                f"<div style='position: absolute; left: {position}%; top: 0;'>"
                f"<div style='width: 2px; height: 50px; background-color: #4A90E2;'></div>"
                f"<div style='transform: translateX(-50%); font-size: 10px; text-align: center;'>{note['date_str']}</div>"
                f"</div>",
                unsafe_allow_html=True
            )
        
        st.markdown("</div>", unsafe_allow_html=True)
    else:
        st.info("No progress notes recorded.")
    
    # Neural Profile Treatment Recommendations
    neural_profile = patient_data.get('neural_profile', {})
    if neural_profile:
        st.subheader("Neural Profile Treatment Impact")
        
        # Display treatment response
        if 'neural_treatment_response' in neural_profile:
            response = neural_profile['neural_treatment_response']
            
            col1, col2 = st.columns(2)
            
            with col1:
                efficacy = response.get('current_medication_efficacy', 0)
                st.progress(efficacy / 100)
                st.markdown(f"**Medication Efficacy:** {efficacy}%")
                
            with col2:
                st.markdown(f"**Neural Adaptation:** {response.get('neural_adaptation', 'Unknown')}")
                st.markdown(f"**Side Effect Profile:** {response.get('side_effect_profile', 'Unknown')}")
            
            # Generate recommendations based on neural profile
            st.markdown("##### Recommendations Based on Neural Profile")
            
            # Recommendations based on neurotransmitter levels
            neurotransmitters = neural_profile.get('neurotransmitter_levels', [])
            for nt in neurotransmitters:
                if nt.get('name') == 'GABA' and nt.get('status') == 'Low':
                    st.markdown("- Consider medications that enhance GABA activity")
                if nt.get('name') == 'Glutamate' and nt.get('status') == 'Elevated':
                    st.markdown("- Monitor for glutamate-modulating therapies")
            
            # Recommendations based on neural biomarkers
            biomarkers = neural_profile.get('neural_biomarkers', [])
            for marker in biomarkers:
                if 'Inflammatory' in marker.get('name', '') and 'elevated' in marker.get('value', '').lower():
                    st.markdown("- Consider anti-inflammatory interventions")
                if 'Oxidative' in marker.get('name', '') and 'elevated' in marker.get('value', '').lower():
                    st.markdown("- Consider antioxidant supplementation (consult with neurologist)")
    
    # Additional resources
    st.subheader("Additional Resources")
    st.markdown("""
    - [Epilepsy Foundation](https://www.epilepsy.com/)
    - [Neurology Appointment Preparation Guide](https://www.aan.com/patient-resources/)
    - [Medication Management Tools](https://www.epilepsy.com/learn/managing-your-epilepsy/using-rescue-medications)
    - [Seizure Tracking Apps](https://www.epilepsy.com/managing-seizure-activity/tracking-seizures)
    """)