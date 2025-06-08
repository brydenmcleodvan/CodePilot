/**
 * Telehealth Router - Intelligent Doctor Matching & Consultation Routing
 * Routes patients to appropriate specialists based on health data and symptoms
 */

class TelehealthRouter {
  constructor() {
    this.specialists = [
      {
        id: 'dr-smith-cardio',
        name: 'Dr. Sarah Smith',
        specialty: 'Cardiology',
        subSpecialties: ['Heart Disease', 'Hypertension', 'Arrhythmia'],
        rating: 4.9,
        experience: '15 years',
        languages: ['English', 'Spanish'],
        availability: this.generateAvailability(),
        consultationFee: 150,
        acceptsInsurance: ['Aetna', 'Blue Cross', 'Cigna'],
        urgencyLevels: ['routine', 'urgent'],
        bio: 'Board-certified cardiologist specializing in preventive heart care and cardiac risk assessment.'
      },
      {
        id: 'dr-johnson-internal',
        name: 'Dr. Michael Johnson',
        specialty: 'Internal Medicine',
        subSpecialties: ['General Health', 'Diabetes', 'Preventive Care'],
        rating: 4.8,
        experience: '12 years',
        languages: ['English'],
        availability: this.generateAvailability(),
        consultationFee: 120,
        acceptsInsurance: ['Medicare', 'Medicaid', 'Blue Cross'],
        urgencyLevels: ['routine', 'urgent', 'critical'],
        bio: 'Internal medicine physician focused on comprehensive primary care and chronic disease management.'
      },
      {
        id: 'dr-chen-endocrine',
        name: 'Dr. Lisa Chen',
        specialty: 'Endocrinology',
        subSpecialties: ['Diabetes', 'Thyroid', 'Metabolic Disorders'],
        rating: 4.9,
        experience: '18 years',
        languages: ['English', 'Mandarin'],
        availability: this.generateAvailability(),
        consultationFee: 180,
        acceptsInsurance: ['Aetna', 'United Healthcare'],
        urgencyLevels: ['routine', 'urgent'],
        bio: 'Endocrinologist specializing in diabetes management and hormonal health optimization.'
      },
      {
        id: 'dr-williams-psychiatry',
        name: 'Dr. James Williams',
        specialty: 'Psychiatry',
        subSpecialties: ['Depression', 'Anxiety', 'Mental Health'],
        rating: 4.7,
        experience: '10 years',
        languages: ['English', 'French'],
        availability: this.generateAvailability(),
        consultationFee: 160,
        acceptsInsurance: ['Blue Cross', 'Cigna'],
        urgencyLevels: ['routine', 'urgent', 'critical'],
        bio: 'Psychiatrist specializing in mood disorders and anxiety management with holistic treatment approaches.'
      },
      {
        id: 'dr-patel-dermatology',
        name: 'Dr. Priya Patel',
        specialty: 'Dermatology',
        subSpecialties: ['Skin Conditions', 'Acne', 'Rashes'],
        rating: 4.8,
        experience: '8 years',
        languages: ['English', 'Hindi'],
        availability: this.generateAvailability(),
        consultationFee: 140,
        acceptsInsurance: ['Aetna', 'Blue Cross'],
        urgencyLevels: ['routine', 'urgent'],
        bio: 'Dermatologist focused on both medical and cosmetic dermatology with expertise in chronic skin conditions.'
      }
    ];

    this.consultationHistory = [];
    this.activeConsultations = new Map();
  }

  generateAvailability() {
    const slots = [];
    const now = new Date();
    
    // Generate availability for next 7 days
    for (let day = 0; day < 7; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() + day);
      
      // Skip weekends for some doctors
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // Generate time slots (9 AM to 5 PM)
      for (let hour = 9; hour < 17; hour++) {
        // Random availability (70% chance of being available)
        if (Math.random() > 0.3) {
          const slotTime = new Date(date);
          slotTime.setHours(hour, 0, 0, 0);
          slots.push({
            dateTime: slotTime.toISOString(),
            duration: 30, // 30-minute slots
            available: true
          });
        }
      }
    }
    
    return slots;
  }

  /**
   * Analyze patient health data and symptoms to determine urgency and specialty needed
   */
  analyzeHealthData(healthData, symptoms, currentMedications = []) {
    let urgencyScore = 0;
    let recommendedSpecialties = [];
    let concerns = [];

    // Critical symptoms - immediate attention needed
    const criticalSymptoms = [
      'chest pain', 'difficulty breathing', 'severe headache',
      'loss of consciousness', 'severe bleeding', 'stroke symptoms'
    ];
    
    const urgentSymptoms = [
      'persistent fever', 'severe pain', 'vision changes',
      'difficulty swallowing', 'severe dizziness'
    ];

    // Check for critical symptoms
    if (symptoms.some(symptom => 
      criticalSymptoms.some(critical => 
        symptom.toLowerCase().includes(critical)
      )
    )) {
      urgencyScore = 100;
      concerns.push('Critical symptoms detected - consider emergency care');
    }

    // Check for urgent symptoms
    else if (symptoms.some(symptom => 
      urgentSymptoms.some(urgent => 
        symptom.toLowerCase().includes(urgent)
      )
    )) {
      urgencyScore = 75;
    }

    // Analyze health metrics for specialty routing
    if (healthData.heartRate > 100 || healthData.bloodPressure?.systolic > 140) {
      recommendedSpecialties.push('Cardiology');
      urgencyScore += 20;
      concerns.push('Cardiovascular metrics elevated');
    }

    if (healthData.bloodSugar > 180 || healthData.hba1c > 7.5) {
      recommendedSpecialties.push('Endocrinology');
      urgencyScore += 15;
      concerns.push('Blood sugar management needed');
    }

    if (symptoms.some(s => s.toLowerCase().includes('depression') || s.toLowerCase().includes('anxiety'))) {
      recommendedSpecialties.push('Psychiatry');
      urgencyScore += 10;
    }

    if (symptoms.some(s => s.toLowerCase().includes('skin') || s.toLowerCase().includes('rash'))) {
      recommendedSpecialties.push('Dermatology');
    }

    // Default to Internal Medicine if no specific specialty identified
    if (recommendedSpecialties.length === 0) {
      recommendedSpecialties.push('Internal Medicine');
    }

    // Determine urgency level
    let urgencyLevel = 'routine';
    if (urgencyScore >= 90) urgencyLevel = 'critical';
    else if (urgencyScore >= 60) urgencyLevel = 'urgent';

    return {
      urgencyLevel,
      urgencyScore,
      recommendedSpecialties,
      concerns,
      estimatedWaitTime: this.calculateWaitTime(urgencyLevel, recommendedSpecialties[0])
    };
  }

  /**
   * Find best matching doctors based on analysis
   */
  findMatchingDoctors(analysis, patientPreferences = {}) {
    const { recommendedSpecialties, urgencyLevel } = analysis;
    
    let matchingDoctors = this.specialists.filter(doctor => {
      // Filter by specialty
      const specialtyMatch = recommendedSpecialties.includes(doctor.specialty);
      
      // Filter by urgency level capability
      const urgencyMatch = doctor.urgencyLevels.includes(urgencyLevel);
      
      // Filter by language preference if specified
      const languageMatch = !patientPreferences.language || 
        doctor.languages.includes(patientPreferences.language);
      
      // Filter by insurance if specified
      const insuranceMatch = !patientPreferences.insurance || 
        doctor.acceptsInsurance.includes(patientPreferences.insurance);
      
      return specialtyMatch && urgencyMatch && languageMatch && insuranceMatch;
    });

    // Sort by rating and availability
    matchingDoctors = matchingDoctors.sort((a, b) => {
      // Prioritize by rating
      const ratingDiff = b.rating - a.rating;
      if (Math.abs(ratingDiff) > 0.1) return ratingDiff;
      
      // Then by earliest availability
      const aNext = this.getNextAvailableSlot(a.id);
      const bNext = this.getNextAvailableSlot(b.id);
      
      if (aNext && bNext) {
        return new Date(aNext.dateTime) - new Date(bNext.dateTime);
      }
      
      return 0;
    });

    return matchingDoctors.slice(0, 3); // Return top 3 matches
  }

  /**
   * Calculate estimated wait time based on urgency and specialty
   */
  calculateWaitTime(urgencyLevel, specialty) {
    const baseWaitTimes = {
      'critical': '5-15 minutes',
      'urgent': '30-60 minutes', 
      'routine': '2-24 hours'
    };
    
    const specialtyMultipliers = {
      'Cardiology': 1.2,
      'Endocrinology': 1.3,
      'Psychiatry': 1.1,
      'Dermatology': 0.8,
      'Internal Medicine': 1.0
    };
    
    return baseWaitTimes[urgencyLevel];
  }

  /**
   * Get next available appointment slot for a doctor
   */
  getNextAvailableSlot(doctorId) {
    const doctor = this.specialists.find(d => d.id === doctorId);
    if (!doctor) return null;
    
    const now = new Date();
    const availableSlots = doctor.availability.filter(slot => 
      slot.available && new Date(slot.dateTime) > now
    );
    
    return availableSlots.length > 0 ? availableSlots[0] : null;
  }

  /**
   * Book consultation appointment
   */
  bookConsultation(doctorId, patientId, appointmentData) {
    const doctor = this.specialists.find(d => d.id === doctorId);
    if (!doctor) throw new Error('Doctor not found');
    
    const consultationId = `consult_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const consultation = {
      id: consultationId,
      doctorId,
      patientId,
      scheduledAt: appointmentData.dateTime,
      duration: appointmentData.duration || 30,
      type: appointmentData.type || 'video_call',
      urgencyLevel: appointmentData.urgencyLevel || 'routine',
      status: 'scheduled',
      symptoms: appointmentData.symptoms || [],
      notes: appointmentData.notes || '',
      meetingUrl: this.generateMeetingUrl(consultationId),
      createdAt: new Date().toISOString(),
      fee: doctor.consultationFee
    };
    
    // Mark the slot as booked
    const slot = doctor.availability.find(s => s.dateTime === appointmentData.dateTime);
    if (slot) slot.available = false;
    
    this.consultationHistory.push(consultation);
    this.activeConsultations.set(consultationId, consultation);
    
    return consultation;
  }

  /**
   * Generate secure meeting URL for video consultation
   */
  generateMeetingUrl(consultationId) {
    // In production, this would integrate with Zoom, WebRTC, or similar
    return `https://healthmap-consult.com/room/${consultationId}`;
  }

  /**
   * Start immediate emergency consultation
   */
  startEmergencyConsultation(patientId, emergencyData) {
    // Find available emergency-capable doctors
    const emergencyDoctors = this.specialists.filter(doctor => 
      doctor.urgencyLevels.includes('critical')
    );
    
    if (emergencyDoctors.length === 0) {
      throw new Error('No emergency doctors available - please call 911');
    }
    
    // Get first available doctor
    const doctor = emergencyDoctors[0];
    
    const consultationId = `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const consultation = {
      id: consultationId,
      doctorId: doctor.id,
      patientId,
      scheduledAt: new Date().toISOString(),
      duration: 60, // Emergency consultations get more time
      type: 'emergency_video_call',
      urgencyLevel: 'critical',
      status: 'active',
      symptoms: emergencyData.symptoms || [],
      notes: emergencyData.description || '',
      meetingUrl: this.generateMeetingUrl(consultationId),
      createdAt: new Date().toISOString(),
      fee: doctor.consultationFee * 1.5 // Emergency premium
    };
    
    this.activeConsultations.set(consultationId, consultation);
    
    return consultation;
  }

  /**
   * Get consultation details
   */
  getConsultation(consultationId) {
    return this.activeConsultations.get(consultationId) || 
           this.consultationHistory.find(c => c.id === consultationId);
  }

  /**
   * Update consultation status
   */
  updateConsultationStatus(consultationId, status, notes = '') {
    const consultation = this.getConsultation(consultationId);
    if (!consultation) return false;
    
    consultation.status = status;
    consultation.updatedAt = new Date().toISOString();
    
    if (notes) consultation.notes += `\n${new Date().toISOString()}: ${notes}`;
    
    if (status === 'completed') {
      this.activeConsultations.delete(consultationId);
    }
    
    return true;
  }

  /**
   * Get doctor's schedule
   */
  getDoctorSchedule(doctorId, days = 7) {
    const doctor = this.specialists.find(d => d.id === doctorId);
    if (!doctor) return null;
    
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + days);
    
    return doctor.availability.filter(slot => {
      const slotDate = new Date(slot.dateTime);
      return slotDate >= now && slotDate <= endDate;
    });
  }
}

// Export singleton instance
const telehealthRouter = new TelehealthRouter();

module.exports = {
  TelehealthRouter,
  telehealthRouter
};