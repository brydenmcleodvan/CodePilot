import json
import datetime

class HealthDataProcessor:
    def __init__(self, data_source=None):
        self.data_source = data_source
        self.processed_data = {}
    
    def load_data(self, file_path=None):
        """Load data from a JSON file"""
        if file_path:
            try:
                with open(file_path, 'r') as file:
                    return json.load(file)
            except Exception as e:
                print(f"Error loading data: {e}")
                return {}
        return {}
    
    def process_metrics(self, metrics_data):
        """Process and transform health metrics data"""
        processed = {}
        
        for metric in metrics_data:
            metric_name = metric.get('name', 'Unknown')
            readings = metric.get('readings', [])
            
            # Extract dates and values
            dates = [reading.get('date') for reading in readings]
            values = [reading.get('value') for reading in readings]
            
            # Store processed data
            processed[metric_name] = {
                'dates': dates,
                'values': values,
                'average': self._calculate_average(values),
                'trend': self._calculate_trend(values)
            }
            
        return processed
    
    def _calculate_average(self, values):
        """Calculate average of numeric values"""
        try:
            # Convert all values to float if possible
            numeric_values = []
            for val in values:
                # Handle blood pressure format (e.g., "120/80")
                if isinstance(val, str) and '/' in val:
                    systolic = float(val.split('/')[0])
                    numeric_values.append(systolic)  # Just use systolic for averaging
                else:
                    numeric_values.append(float(val))
            
            if not numeric_values:
                return 0
            return sum(numeric_values) / len(numeric_values)
        except (ValueError, TypeError):
            return 0
    
    def _calculate_trend(self, values):
        """Calculate trend direction based on last two values"""
        try:
            # Handle blood pressure format
            numeric_values = []
            for val in values:
                if isinstance(val, str) and '/' in val:
                    systolic = float(val.split('/')[0])
                    numeric_values.append(systolic)
                else:
                    numeric_values.append(float(val))
            
            if len(numeric_values) < 2:
                return "stable"
            
            last = numeric_values[-1]
            second_last = numeric_values[-2]
            
            diff = last - second_last
            if abs(diff) < 0.05 * second_last:  # Less than 5% change
                return "stable"
            return "up" if diff > 0 else "down"
        except (ValueError, TypeError, IndexError):
            return "stable"
    
    def generate_health_summary(self, patient_data):
        """Generate a text summary of patient health data"""
        if not patient_data:
            return "No patient data available."
        
        name = patient_data.get('name', 'Patient')
        age = patient_data.get('age', 'Unknown age')
        conditions = patient_data.get('conditions', [])
        metrics = patient_data.get('metrics', [])
        
        summary = f"Health Summary for {name}, {age}\n\n"
        
        if conditions:
            summary += "Medical Conditions: " + ", ".join(conditions) + "\n\n"
        
        if metrics:
            summary += "Recent Health Metrics:\n"
            for metric in metrics:
                metric_name = metric.get('name', 'Unknown')
                readings = metric.get('readings', [])
                if readings:
                    latest_reading = readings[-1]
                    summary += f"- {metric_name}: {latest_reading.get('value')} ({latest_reading.get('date')})\n"
        
        return summary
    
    def analyze_medication_adherence(self, medication_data, medication_logs):
        """Analyze medication adherence based on prescribed medications and logs"""
        # This is a placeholder for medication adherence analysis
        # In a real implementation, this would compare prescribed medications
        # with actual medication logs to calculate adherence rates
        
        adherence_report = {}
        
        for med in medication_data:
            med_name = med.get('name', 'Unknown')
            adherence_report[med_name] = {
                'prescribed': med,
                'adherence_rate': 0.85,  # Placeholder value
                'missed_doses': 3,       # Placeholder value
                'recommendation': "Continue as prescribed"
            }
            
        return adherence_report