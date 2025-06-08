import React, { useState, useEffect } from 'react';

const PatientSummary = ({ patientData }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patient, setPatient] = useState(null);

  // If patientData is passed directly, use it
  // Otherwise, fetch from API
  useEffect(() => {
    if (patientData) {
      setPatient(patientData);
      setLoading(false);
      return;
    }

    // Fetch patient data from API
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/patient');
        if (!response.ok) {
          throw new Error('Failed to fetch patient data');
        }
        const data = await response.json();
        setPatient(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching patient data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientData]);

  if (loading) {
    return <div className="p-4 bg-gray-100 rounded-lg">Loading patient data...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded-lg">Error: {error}</div>;
  }

  if (!patient) {
    return <div className="p-4 bg-yellow-100 rounded-lg">No patient data available</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">{patient.name}</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <span className="text-gray-600">Patient ID:</span>
          <span className="ml-2 font-medium">{patient.patient_id}</span>
        </div>
        <div>
          <span className="text-gray-600">Age:</span>
          <span className="ml-2 font-medium">{patient.age}</span>
        </div>
        <div>
          <span className="text-gray-600">Sex:</span>
          <span className="ml-2 font-medium">{patient.sex}</span>
        </div>
        <div>
          <span className="text-gray-600">Blood Type:</span>
          <span className="ml-2 font-medium">{patient.blood_type}</span>
        </div>
        <div>
          <span className="text-gray-600">Height:</span>
          <span className="ml-2 font-medium">{patient.height} cm</span>
        </div>
        <div>
          <span className="text-gray-600">Weight:</span>
          <span className="ml-2 font-medium">{patient.weight} kg</span>
        </div>
      </div>

      {patient.allergies && patient.allergies.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Allergies</h3>
          <div className="flex flex-wrap gap-2">
            {patient.allergies.map((allergy, index) => (
              <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                {allergy}
              </span>
            ))}
          </div>
        </div>
      )}

      {patient.conditions && patient.conditions.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Medical Conditions</h3>
          <div className="flex flex-wrap gap-2">
            {patient.conditions.map((condition, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {condition}
              </span>
            ))}
          </div>
        </div>
      )}

      {patient.emergency_contacts && patient.emergency_contacts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Emergency Contacts</h3>
          {patient.emergency_contacts.map((contact, index) => (
            <div key={index} className="p-3 border border-gray-200 rounded mb-2">
              <div className="font-medium">{contact.name}</div>
              <div className="text-sm text-gray-600">{contact.relationship}</div>
              <div className="text-sm text-gray-600">{contact.phone}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientSummary;