import json
import os
import streamlit as st
import pandas as pd
from datetime import datetime

def display_medical_history(patient_data):
    """Display patient medical history"""
    st.header("Medical History")
    
    neurological_history = patient_data.get('medical_history', {}).get('neurological_history', {})
    
    if not neurological_history:
        st.warning("No neurological history data available.")
        return
    
    # Create tabs for different sections of medical history
    tabs = st.tabs(["Seizure History", "EEG Results", "Imaging Studies", "Cognitive Assessment"])
    
    # Tab 1: Seizure History
    with tabs[0]:
        st.subheader("Seizure History")
        seizure_history = neurological_history.get('seizure_history', [])
        
        if seizure_history:
            # Convert to DataFrame for easier display
            seizure_df = pd.DataFrame(seizure_history)
            seizure_df['date'] = pd.to_datetime(seizure_df['date'])
            seizure_df = seizure_df.sort_values('date', ascending=False)
            
            # Calculate some statistics
            total_seizures = len(seizure_df)
            avg_duration = seizure_df['duration_seconds'].mean()
            seizure_types = seizure_df['type'].value_counts().to_dict()
            
            # Display statistics
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("Total Seizures", total_seizures)
            with col2:
                st.metric("Avg Duration (sec)", f"{avg_duration:.1f}")
            with col3:
                types_str = ", ".join([f"{k}: {v}" for k, v in seizure_types.items()])
                st.metric("Types", types_str)
            
            # Display seizure history table
            st.markdown("##### Seizure Events")
            
            # Clean up dataframe for display
            display_df = seizure_df.copy()
            display_df['date'] = display_df['date'].dt.strftime('%Y-%m-%d')
            display_df['triggers'] = display_df['triggers'].apply(lambda x: ", ".join(x))
            display_df.columns = ['Date', 'Type', 'Duration (sec)', 'Triggers']
            
            st.dataframe(display_df, use_container_width=True)
            
            # Show triggers analysis
            st.markdown("##### Trigger Analysis")
            
            # Extract all triggers
            all_triggers = []
            for triggers in seizure_df['triggers']:
                all_triggers.extend(triggers)
            
            trigger_counts = pd.Series(all_triggers).value_counts()
            
            # Plot trigger frequency
            st.bar_chart(trigger_counts)
            
        else:
            st.info("No seizure history recorded.")
    
    # Tab 2: EEG Results
    with tabs[1]:
        st.subheader("EEG Results")
        eeg_results = neurological_history.get('eeg_results', [])
        
        if eeg_results:
            # Convert to DataFrame
            eeg_df = pd.DataFrame(eeg_results)
            eeg_df['date'] = pd.to_datetime(eeg_df['date'])
            eeg_df = eeg_df.sort_values('date', ascending=False)
            
            # Display results
            for _, row in eeg_df.iterrows():
                with st.expander(f"EEG - {row['date'].strftime('%Y-%m-%d')} ({row['severity']} severity)"):
                    st.markdown(f"**Findings:** {row['findings']}")
                    st.markdown(f"**Severity:** {row['severity']}")
                    st.markdown(f"**Date:** {row['date'].strftime('%Y-%m-%d')}")
        else:
            st.info("No EEG results recorded.")
    
    # Tab 3: Imaging Studies
    with tabs[2]:
        st.subheader("Imaging Studies")
        imaging_studies = neurological_history.get('imaging_studies', [])
        
        if imaging_studies:
            # Convert to DataFrame
            imaging_df = pd.DataFrame(imaging_studies)
            imaging_df['date'] = pd.to_datetime(imaging_df['date'])
            imaging_df = imaging_df.sort_values('date', ascending=False)
            
            # Display studies
            for _, row in imaging_df.iterrows():
                with st.expander(f"{row['type']} - {row['date'].strftime('%Y-%m-%d')}"):
                    st.markdown(f"**Type:** {row['type']}")
                    st.markdown(f"**Findings:** {row['findings']}")
                    st.markdown(f"**Recommendation:** {row['recommendation']}")
                    st.markdown(f"**Date:** {row['date'].strftime('%Y-%m-%d')}")
        else:
            st.info("No imaging studies recorded.")
    
    # Tab 4: Cognitive Assessment
    with tabs[3]:
        st.subheader("Cognitive Assessment")
        cognitive = neurological_history.get('cognitive_assessment', {})
        
        if cognitive:
            assessment_date = datetime.strptime(cognitive['date'], '%Y-%m-%d').strftime('%Y-%m-%d') if 'date' in cognitive else 'Unknown'
            
            st.markdown(f"**Assessment Date:** {assessment_date}")
            st.markdown(f"**Overall Status:** {cognitive.get('overall_cognitive_status', 'Unknown')}")
            
            # Display scores as a radar chart or bar chart
            scores = {
                'Memory': cognitive.get('memory_score', 0),
                'Attention': cognitive.get('attention_score', 0),
                'Processing Speed': cognitive.get('processing_speed', 0)
            }
            
            st.markdown("##### Cognitive Scores")
            st.bar_chart(scores)
            
            # Add interpretation
            st.markdown("##### Score Interpretation")
            st.markdown("""
            - **0-50:** Significant impairment
            - **51-70:** Moderate impairment
            - **71-85:** Mild impairment
            - **86-100:** Normal range
            """)
        else:
            st.info("No cognitive assessment recorded.")