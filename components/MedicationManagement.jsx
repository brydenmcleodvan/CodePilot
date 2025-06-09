import React, { useState, useEffect } from 'react';
import { formatMedications } from '../utils/visualization_helpers';

const MedicationStatus = ({ status }) => {
  if (status === 'due') {
    return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Due Now</span>;
  } else if (status === 'upcoming') {
    return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Upcoming</span>;
  } else if (status === 'taken') {
    return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Taken</span>;
  }
  return null;
};

const MedicationManagement = ({ customData }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [medications, setMedications] = useState([]);
  const [showTakenMeds, setShowTakenMeds] = useState(true);

  // Fetch or use provided medication data
  useEffect(() => {
    if (customData) {
      processMedicationData(customData);
      return;
    }

    const fetchMedicationData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/medications');
        if (!response.ok) {
          throw new Error('Failed to fetch medication data');
        }
        const data = await response.json();
        processMedicationData(data);
      } catch (err) {
        console.error('Error fetching medication data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMedicationData();
  }, [customData]);

  // Process medication data
  const processMedicationData = (data) => {
    const formattedMeds = formatMedications(data);
    setMedications(formattedMeds);
    setLoading(false);
  };

  // Toggle taken medications visibility
  const toggleTakenMeds = () => {
    setShowTakenMeds(prev => !prev);
  };

  // Mark medication as taken
  const markAsTaken = (index) => {
    const updatedMeds = [...medications];
    updatedMeds[index] = {
      ...updatedMeds[index],
      status: 'taken'
    };
    setMedications(updatedMeds);
  };

  // Filter medications based on visibility setting
  const filteredMedications = showTakenMeds 
    ? medications 
    : medications.filter(med => med.status !== 'taken');

  if (loading) {
    return <div className="p-4 bg-gray-100 rounded-lg">Loading medications...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-100 text-red-700 rounded-lg">Error: {error}</div>;
  }

  if (!medications || medications.length === 0) {
    return <div className="p-4 bg-yellow-100 rounded-lg">No medications available</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Medications</h2>
        
        <div className="flex items-center">
          <label className="inline-flex items-center">
            <input 
              type="checkbox" 
              className="form-checkbox h-4 w-4 text-blue-600" 
              checked={showTakenMeds} 
              onChange={toggleTakenMeds}
            />
            <span className="ml-2 text-sm text-gray-700">Show taken medications</span>
          </label>
        </div>
      </div>
      
      {filteredMedications.length === 0 ? (
        <div className="text-center p-4 bg-gray-50 rounded">
          <p>No medications to display</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMedications.map((medication, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-md hover:shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{medication.name}</h3>
                  <div className="text-sm text-gray-600">{medication.dosage}, {medication.frequency}</div>
                  <div className="mt-1 text-sm">{medication.purpose}</div>
                  
                  <div className="mt-2">
                    <div className="text-sm text-gray-600">
                      Next dose: <span className="font-medium">{medication.nextDose}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <MedicationStatus status={medication.status} />
                  
                  {medication.status !== 'taken' && (
                    <button 
                      className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => markAsTaken(index)}
                    >
                      Mark as Taken
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6 flex justify-between">
        <button className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
          View Medication History
        </button>
        
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
          Add New Medication
        </button>
      </div>
    </div>
  );
};

export default MedicationManagement;