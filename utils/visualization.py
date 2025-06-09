import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
from datetime import datetime, timedelta

def create_timeline(data):
    """Create a timeline of neurological events"""
    events = []
    
    # Add seizure events
    seizure_history = data.get('medical_history', {}).get('neurological_history', {}).get('seizure_history', [])
    for seizure in seizure_history:
        events.append({
            'date': seizure['date'],
            'event': f"Seizure: {seizure['type']}",
            'duration': seizure['duration_seconds'],
            'category': 'Seizure',
            'details': f"Duration: {seizure['duration_seconds']} seconds<br>Triggers: {', '.join(seizure['triggers'])}"
        })
    
    # Add EEG results
    eeg_results = data.get('medical_history', {}).get('neurological_history', {}).get('eeg_results', [])
    for eeg in eeg_results:
        events.append({
            'date': eeg['date'],
            'event': 'EEG Test',
            'duration': 0,
            'category': 'Diagnostic',
            'details': f"Findings: {eeg['findings']}<br>Severity: {eeg['severity']}"
        })
    
    # Add imaging studies
    imaging_studies = data.get('medical_history', {}).get('neurological_history', {}).get('imaging_studies', [])
    for study in imaging_studies:
        events.append({
            'date': study['date'],
            'event': f"Imaging: {study['type']}",
            'duration': 0,
            'category': 'Diagnostic',
            'details': f"Findings: {study['findings']}<br>Recommendation: {study['recommendation']}"
        })
    
    # Add medication tests
    tests = data.get('diagnostic_tests', [])
    for test in tests:
        if "Antiepileptic" in test['test']:
            events.append({
                'date': test['date'],
                'event': 'Medication Level Test',
                'duration': 0,
                'category': 'Medication',
                'details': f"Result: {test['result']}<br>Reference: {test['reference_range']}<br>Flagged: {'Yes' if test['flag'] else 'No'}"
            })
    
    # Add treatment notes
    progress_notes = data.get('treatment_plan', {}).get('progress_notes', [])
    for note in progress_notes:
        events.append({
            'date': note['date'],
            'event': 'Treatment Progress',
            'duration': 0,
            'category': 'Treatment',
            'details': note['note']
        })
    
    if not events:
        # Sample data if no events are available
        return go.Figure()
    
    # Create DataFrame
    df = pd.DataFrame(events)
    df['date'] = pd.to_datetime(df['date'])
    df = df.sort_values('date')
    
    # Create figure
    fig = px.timeline(
        df, 
        x_start='date', 
        y='category',
        color='category',
        text='event',
        hover_data=['details'],
        color_discrete_map={
            'Seizure': 'red',
            'Diagnostic': 'blue',
            'Medication': 'purple',
            'Treatment': 'green'
        }
    )
    
    # Update layout
    fig.update_layout(
        title='Neural Health Timeline',
        xaxis_title='Date',
        yaxis_title='Event Type',
        height=400,
        margin=dict(l=10, r=10, t=30, b=10)
    )
    
    # Add vertical lines for significant dates
    if len(seizure_history) > 0:
        last_seizure = max([s['date'] for s in seizure_history])
        fig.add_vline(x=last_seizure, line_dash="dash", line_color="red", annotation_text="Last Seizure")
    
    return fig

def create_severity_gauge(data):
    """Create a gauge for current severity based on neural profile"""
    # Get neural data
    neural_profile = data.get('neural_profile', {})
    network_analysis = neural_profile.get('neural_network_analysis', {})
    
    # Calculate severity score (0-100)
    severity_score = 0
    
    # Add connectivity contribution (higher is better)
    if 'connectivity_strength' in network_analysis:
        connectivity = network_analysis['connectivity_strength']
        severity_score += (100 - connectivity) * 0.4  # Invert so higher connectivity means lower severity
    
    # Add stability contribution
    stability_map = {'Stable': 0, 'Moderate': 50, 'Poor': 100}
    if 'network_stability' in network_analysis:
        stability = network_analysis['network_stability']
        if stability in stability_map:
            severity_score += stability_map[stability] * 0.3
    
    # Add medication efficacy contribution (higher is better)
    if 'neural_treatment_response' in neural_profile and 'current_medication_efficacy' in neural_profile['neural_treatment_response']:
        efficacy = neural_profile['neural_treatment_response']['current_medication_efficacy']
        severity_score += (100 - efficacy) * 0.3  # Invert so higher efficacy means lower severity
    
    # Create gauge
    fig = go.Figure(go.Indicator(
        mode = "gauge+number",
        value = severity_score,
        title = {'text': "Neural Severity Index"},
        gauge = {
            'axis': {'range': [0, 100]},
            'bar': {'color': "black"},
            'steps': [
                {'range': [0, 30], 'color': "green"},
                {'range': [30, 70], 'color': "yellow"},
                {'range': [70, 100], 'color': "red"}
            ],
            'threshold': {
                'line': {'color': "red", 'width': 4},
                'thickness': 0.75,
                'value': severity_score
            }
        }
    ))
    
    # Update layout
    fig.update_layout(height=250, margin=dict(l=10, r=10, t=50, b=10))
    
    return fig

def create_seizure_heatmap(data):
    """Create a heatmap of seizure frequency by month and trigger"""
    seizure_history = data.get('medical_history', {}).get('neurological_history', {}).get('seizure_history', [])
    
    if not seizure_history:
        return go.Figure()
    
    # Create DataFrame
    df = pd.DataFrame(seizure_history)
    df['date'] = pd.to_datetime(df['date'])
    df['month'] = df['date'].dt.month
    df['year'] = df['date'].dt.year
    
    # Get all triggers
    all_triggers = set()
    for triggers in df['triggers']:
        all_triggers.update(triggers)
    
    # Create trigger count by month
    monthly_trigger_counts = {}
    for trigger in all_triggers:
        monthly_trigger_counts[trigger] = [0] * 12  # Initialize counts for each month
    
    for _, row in df.iterrows():
        month_idx = row['month'] - 1  # 0-based index
        for trigger in row['triggers']:
            monthly_trigger_counts[trigger][month_idx] += 1
    
    # Create heatmap
    z_data = []
    y_labels = []
    
    for trigger, counts in monthly_trigger_counts.items():
        z_data.append(counts)
        y_labels.append(trigger)
    
    fig = go.Figure(data=go.Heatmap(
        z=z_data,
        x=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        y=y_labels,
        colorscale='Reds',
        showscale=True
    ))
    
    fig.update_layout(
        title='Seizure Triggers by Month',
        xaxis_title='Month',
        yaxis_title='Trigger',
        height=300,
        margin=dict(l=10, r=10, t=30, b=10)
    )
    
    return fig