import json
import os
import streamlit as st
import pandas as pd
from datetime import datetime

def display_diagnostic_tests(patient_data):
    """Display patient diagnostic test results"""
    st.header("Diagnostic Tests")
    
    diagnostic_tests = patient_data.get('diagnostic_tests', [])
    
    if not diagnostic_tests:
        st.warning("No diagnostic test data available.")
        return
    
    # Convert to dataframe for easier manipulation
    tests_df = pd.DataFrame(diagnostic_tests)
    tests_df['date'] = pd.to_datetime(tests_df['date'])
    
    # Get unique test types
    test_types = tests_df['test'].unique()
    
    # Create filter for test types
    selected_test_types = st.multiselect(
        "Filter by test type",
        options=test_types,
        default=test_types
    )
    
    if not selected_test_types:
        st.info("Please select at least one test type to display results.")
        return
    
    # Filter by selected test types
    filtered_df = tests_df[tests_df['test'].isin(selected_test_types)]
    filtered_df = filtered_df.sort_values(['date', 'test'], ascending=[False, True])
    
    # Basic statistics
    total_tests = len(filtered_df)
    flagged_tests = len(filtered_df[filtered_df['flag'] == True])
    flagged_percentage = (flagged_tests / total_tests * 100) if total_tests > 0 else 0
    
    # Display statistics
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Total Tests", total_tests)
    with col2:
        st.metric("Flagged Tests", flagged_tests)
    with col3:
        st.metric("Flagged Percentage", f"{flagged_percentage:.1f}%")
    
    # Function to highlight flagged values
    def highlight_flags(val):
        return 'background-color: #ffcccc' if val else ''
    
    # Function to format dates
    def format_date(date_val):
        return date_val.strftime('%Y-%m-%d')
    
    # Clean up dataframe for display
    display_df = filtered_df.copy()
    display_df['date'] = display_df['date'].apply(format_date)
    
    # Rename columns for better display
    display_df.columns = ['Date', 'Test', 'Result', 'Reference Range', 'Flagged']
    
    # Apply styling to flagged values
    styled_df = display_df.style.map(lambda x: 'background-color: #ffcccc' if x else '', subset=['Flagged'])
    
    # Display test results
    st.markdown("### Test Results")
    st.dataframe(styled_df, use_container_width=True)
    
    # Check if we have any time series data that can be plotted
    time_series_tests = []
    for test in test_types:
        test_df = tests_df[tests_df['test'] == test]
        if len(test_df) > 1 and any(test_df['result'].str.contains(r'[0-9]')):
            time_series_tests.append(test)
    
    if time_series_tests:
        st.markdown("### Test Trends")
        selected_trend_test = st.selectbox(
            "Select test to view trend",
            options=time_series_tests
        )
        
        if selected_trend_test:
            plot_df = tests_df[tests_df['test'] == selected_trend_test].copy()
            
            # Extract numeric values from results (assuming format like '8.5 μg/mL')
            def extract_numeric(result_str):
                try:
                    return float(result_str.split()[0])
                except:
                    return None
            
            plot_df['numeric_result'] = plot_df['result'].apply(extract_numeric)
            plot_df = plot_df.dropna(subset=['numeric_result'])
            
            if not plot_df.empty:
                plot_df = plot_df.sort_values('date')
                
                # Create a reference range visualization
                st.markdown(f"##### {selected_trend_test} Trend")
                
                # Extract reference range
                ref_range = plot_df['reference_range'].iloc[0]
                ref_min = None
                ref_max = None
                
                if '-' in ref_range:
                    try:
                        ref_parts = ref_range.split('-')
                        ref_min = float(ref_parts[0].strip().split()[0])
                        ref_max = float(ref_parts[1].strip().split()[0])
                    except:
                        pass
                
                # Plot data
                chart_data = pd.DataFrame({
                    'date': plot_df['date'],
                    'value': plot_df['numeric_result'],
                    'flag': plot_df['flag']
                })
                
                st.line_chart(chart_data.set_index('date')['value'])
                
                # Display reference range if available
                if ref_min is not None and ref_max is not None:
                    st.markdown(f"Reference Range: {ref_min} - {ref_max}")
                    
                    # Check if any values are outside reference range
                    below_range = chart_data[chart_data['value'] < ref_min]
                    above_range = chart_data[chart_data['value'] > ref_max]
                    
                    if not below_range.empty or not above_range.empty:
                        st.markdown("##### Out of Range Results")
                        
                        if not below_range.empty:
                            st.markdown("**Below Range:**")
                            for _, row in below_range.iterrows():
                                st.markdown(f"- {row['date'].strftime('%Y-%m-%d')}: {row['value']} (Reference: {ref_min} - {ref_max})")
                        
                        if not above_range.empty:
                            st.markdown("**Above Range:**")
                            for _, row in above_range.iterrows():
                                st.markdown(f"- {row['date'].strftime('%Y-%m-%d')}: {row['value']} (Reference: {ref_min} - {ref_max})")
            else:
                st.info(f"No numeric data available for {selected_trend_test}")
    
    # Add interpretation and recommendations section
    st.markdown("### Test Interpretation")
    
    # Check for specific test result patterns
    if 'Antiepileptic Drug Level' in selected_test_types:
        aed_tests = tests_df[tests_df['test'] == 'Antiepileptic Drug Level'].sort_values('date')
        if not aed_tests.empty:
            latest_aed = aed_tests.iloc[-1]
            latest_flag = latest_aed['flag']
            
            if latest_flag:
                st.markdown("#### Antiepileptic Drug Level")
                st.markdown("""
                **Current Status:** The most recent antiepileptic drug level is outside the reference range.
                
                **Recommendations:**
                - Consult with your neurologist about dose adjustment
                - Confirm medication compliance
                - Consider checking for drug interactions
                - Schedule a follow-up test within 2-4 weeks
                """)
            else:
                st.markdown("#### Antiepileptic Drug Level")
                st.markdown("""
                **Current Status:** The most recent antiepileptic drug level is within the reference range.
                
                **Recommendations:**
                - Continue current medication regimen
                - Monitor for breakthrough seizures
                - Schedule routine follow-up testing as recommended by your neurologist
                """)
    
    # Add general recommendations
    st.markdown("### General Recommendations")
    st.markdown("""
    - Keep all test results organized in one place
    - Bring a copy of your test results to every doctor appointment
    - Always follow up on flagged or abnormal results
    - Ask your healthcare provider to explain what your test results mean for your specific condition
    - Schedule follow-up tests as recommended
    """)