/**
 * Medical Claim Integration System
 * Exports health data in insurance-compatible formats (ICD-10, CPT, FHIR)
 */

class MedicalClaimIntegration {
  constructor() {
    this.claimTemplates = new Map();
    this.exportHistory = new Map();
    this.insuranceProviders = new Map();
    
    // Standard medical coding systems
    this.codingSystems = {
      icd10: {
        name: 'ICD-10 (International Classification of Diseases)',
        description: 'Standard diagnostic codes used globally',
        version: '2024',
        authority: 'WHO'
      },
      cpt: {
        name: 'CPT (Current Procedural Terminology)',
        description: 'Medical procedure codes used in US',
        version: '2024',
        authority: 'AMA'
      },
      snomed: {
        name: 'SNOMED CT',
        description: 'Comprehensive clinical terminology',
        version: '2024-03',
        authority: 'SNOMED International'
      },
      loinc: {
        name: 'LOINC',
        description: 'Laboratory and clinical observation codes',
        version: '2.76',
        authority: 'Regenstrief Institute'
      }
    };

    // Insurance provider formats
    this.insuranceFormats = {
      us_standard: {
        name: 'US Insurance Standard',
        formats: ['FHIR R4', 'HL7 v2.5', 'X12 EDI'],
        codes: ['ICD-10', 'CPT', 'HCPCS'],
        regions: ['US']
      },
      canada_phr: {
        name: 'Canada PHR Compatible',
        formats: ['FHIR R4', 'CDA R2'],
        codes: ['ICD-10-CA', 'CCI'],
        regions: ['Canada']
      },
      europe_standard: {
        name: 'European Standard',
        formats: ['FHIR R4', 'HL7 CDA'],
        codes: ['ICD-10', 'SNOMED CT'],
        regions: ['EU', 'UK']
      }
    };

    // Common claim types
    this.claimTypes = {
      preventive_care: {
        name: 'Preventive Care',
        description: 'Annual checkups, screenings, wellness visits',
        typical_codes: ['Z00.00', 'Z01.419', '99395-99397'],
        reimbursement_rate: 0.95
      },
      chronic_disease: {
        name: 'Chronic Disease Management',
        description: 'Diabetes, hypertension, heart disease monitoring',
        typical_codes: ['E11.9', 'I10', 'I25.9'],
        reimbursement_rate: 0.85
      },
      mental_health: {
        name: 'Mental Health Services',
        description: 'Therapy, counseling, psychiatric care',
        typical_codes: ['F43.10', '90834', '90837'],
        reimbursement_rate: 0.80
      },
      diagnostic_tests: {
        name: 'Diagnostic Testing',
        description: 'Lab work, imaging, specialized tests',
        typical_codes: ['36415', '80053', '73060'],
        reimbursement_rate: 0.90
      }
    };

    this.initializeInsuranceProviders();
  }

  /**
   * Generate insurance claim export for user's health data
   */
  async generateClaimExport(userId, exportRequest) {
    try {
      const {
        dateRange,
        claimType,
        insuranceProvider,
        format,
        includeCategories
      } = exportRequest;

      // Get user's health data for the specified period
      const healthData = await this.getHealthDataForClaims(userId, dateRange, includeCategories);
      
      if (!healthData || healthData.length === 0) {
        throw new Error('No eligible health data found for the specified period');
      }

      // Map health data to medical codes
      const codedData = await this.mapHealthDataToCodes(healthData, claimType);
      
      // Generate claim document in requested format
      const claimDocument = await this.generateClaimDocument(
        codedData,
        format,
        insuranceProvider,
        userId
      );

      // Calculate estimated reimbursement
      const reimbursementEstimate = this.calculateReimbursementEstimate(codedData, claimType);

      // Store export history
      const exportRecord = {
        id: `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        claimType,
        format,
        insuranceProvider,
        dataPoints: healthData.length,
        estimatedReimbursement: reimbursementEstimate,
        status: 'generated',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      };

      this.exportHistory.set(exportRecord.id, exportRecord);

      return {
        success: true,
        exportId: exportRecord.id,
        claimDocument,
        estimatedReimbursement: reimbursementEstimate,
        summary: {
          totalDataPoints: healthData.length,
          claimType,
          format,
          codingSystems: this.getUsedCodingSystems(format),
          validityPeriod: '30 days'
        }
      };

    } catch (error) {
      console.error('Claim export generation error:', error);
      throw new Error(`Failed to generate claim export: ${error.message}`);
    }
  }

  /**
   * Map health data to standardized medical codes
   */
  async mapHealthDataToCodes(healthData, claimType) {
    const codedData = [];

    for (const dataPoint of healthData) {
      const codes = await this.assignMedicalCodes(dataPoint, claimType);
      
      if (codes.length > 0) {
        codedData.push({
          originalData: dataPoint,
          codes,
          category: dataPoint.category,
          date: dataPoint.date,
          eligibleForReimbursement: this.isEligibleForReimbursement(codes, claimType)
        });
      }
    }

    return codedData;
  }

  /**
   * Assign appropriate medical codes to health data
   */
  async assignMedicalCodes(dataPoint, claimType) {
    const codes = [];

    // Map different health data types to medical codes
    switch (dataPoint.category) {
      case 'vital_signs':
        codes.push({
          system: 'LOINC',
          code: this.getVitalSignCode(dataPoint.type),
          display: this.getVitalSignDisplay(dataPoint.type),
          value: dataPoint.value,
          unit: dataPoint.unit
        });
        break;

      case 'laboratory_results':
        codes.push({
          system: 'LOINC',
          code: this.getLabCode(dataPoint.testName),
          display: dataPoint.testName,
          value: dataPoint.result,
          referenceRange: dataPoint.referenceRange
        });
        break;

      case 'medications':
        codes.push({
          system: 'RxNorm',
          code: this.getMedicationCode(dataPoint.name),
          display: dataPoint.name,
          dosage: dataPoint.dosage,
          frequency: dataPoint.frequency
        });
        break;

      case 'procedures':
        codes.push({
          system: 'CPT',
          code: this.getProcedureCode(dataPoint.procedure),
          display: dataPoint.procedure,
          date: dataPoint.date,
          provider: dataPoint.provider
        });
        break;

      case 'diagnoses':
        codes.push({
          system: 'ICD-10',
          code: this.getDiagnosisCode(dataPoint.condition),
          display: dataPoint.condition,
          severity: dataPoint.severity,
          status: dataPoint.status
        });
        break;

      case 'wellness_monitoring':
        if (this.isWellnessEligible(dataPoint, claimType)) {
          codes.push({
            system: 'CPT',
            code: this.getWellnessCode(dataPoint.type),
            display: `Wellness monitoring - ${dataPoint.type}`,
            duration: dataPoint.monitoringPeriod
          });
        }
        break;
    }

    return codes;
  }

  /**
   * Generate claim document in specified format
   */
  async generateClaimDocument(codedData, format, insuranceProvider, userId) {
    switch (format.toLowerCase()) {
      case 'fhir':
        return this.generateFHIRDocument(codedData, userId);
      case 'hl7':
        return this.generateHL7Document(codedData, userId);
      case 'x12_edi':
        return this.generateX12EDIDocument(codedData, userId);
      case 'canada_phr':
        return this.generateCanadaPHRDocument(codedData, userId);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Generate FHIR R4 compliant document
   */
  generateFHIRDocument(codedData, userId) {
    const bundle = {
      resourceType: 'Bundle',
      id: `healthmap-claim-${Date.now()}`,
      type: 'collection',
      timestamp: new Date().toISOString(),
      entry: []
    };

    // Add patient resource
    bundle.entry.push({
      resource: {
        resourceType: 'Patient',
        id: `patient-${userId}`,
        identifier: [{
          system: 'https://healthmap.app/patient-id',
          value: userId
        }],
        active: true
      }
    });

    // Add observations, procedures, medications, etc.
    codedData.forEach((item, index) => {
      item.codes.forEach(code => {
        const resource = this.createFHIRResource(code, item, index);
        if (resource) {
          bundle.entry.push({ resource });
        }
      });
    });

    return {
      format: 'FHIR R4',
      mimeType: 'application/fhir+json',
      content: JSON.stringify(bundle, null, 2),
      validation: this.validateFHIRBundle(bundle)
    };
  }

  /**
   * Create FHIR resource based on code type
   */
  createFHIRResource(code, item, index) {
    switch (code.system) {
      case 'LOINC':
        return {
          resourceType: 'Observation',
          id: `obs-${index}`,
          status: 'final',
          code: {
            coding: [{
              system: 'http://loinc.org',
              code: code.code,
              display: code.display
            }]
          },
          subject: { reference: `Patient/patient-${item.userId}` },
          effectiveDateTime: item.date,
          valueQuantity: code.value ? {
            value: parseFloat(code.value),
            unit: code.unit
          } : undefined
        };

      case 'CPT':
        return {
          resourceType: 'Procedure',
          id: `proc-${index}`,
          status: 'completed',
          code: {
            coding: [{
              system: 'http://www.ama-assn.org/go/cpt',
              code: code.code,
              display: code.display
            }]
          },
          subject: { reference: `Patient/patient-${item.userId}` },
          performedDateTime: item.date
        };

      case 'ICD-10':
        return {
          resourceType: 'Condition',
          id: `cond-${index}`,
          clinicalStatus: {
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
              code: 'active'
            }]
          },
          code: {
            coding: [{
              system: 'http://hl7.org/fhir/sid/icd-10',
              code: code.code,
              display: code.display
            }]
          },
          subject: { reference: `Patient/patient-${item.userId}` },
          recordedDate: item.date
        };

      default:
        return null;
    }
  }

  /**
   * Calculate estimated reimbursement amount
   */
  calculateReimbursementEstimate(codedData, claimType) {
    let totalEstimate = 0;
    const breakdown = {};

    const claimTypeInfo = this.claimTypes[claimType];
    const baseReimbursementRate = claimTypeInfo?.reimbursement_rate || 0.80;

    codedData.forEach(item => {
      if (item.eligibleForReimbursement) {
        item.codes.forEach(code => {
          const codeValue = this.getCodeReimbursementValue(code);
          const reimbursementAmount = codeValue * baseReimbursementRate;
          
          totalEstimate += reimbursementAmount;
          
          if (!breakdown[code.system]) {
            breakdown[code.system] = 0;
          }
          breakdown[code.system] += reimbursementAmount;
        });
      }
    });

    return {
      total: Math.round(totalEstimate * 100) / 100,
      breakdown,
      reimbursementRate: baseReimbursementRate,
      eligibleItems: codedData.filter(item => item.eligibleForReimbursement).length,
      currency: 'USD' // In production, determine based on user location
    };
  }

  /**
   * Get reimbursement value for medical codes
   */
  getCodeReimbursementValue(code) {
    // Medicare reimbursement rates (simplified)
    const reimbursementRates = {
      // Preventive care
      '99395': 250, // Preventive medicine, established patient
      '99396': 280, // Preventive medicine, established patient
      'Z00.00': 200, // Encounter for general adult medical examination
      
      // Diagnostic procedures
      '36415': 15,  // Collection of venous blood by venipuncture
      '80053': 35,  // Comprehensive metabolic panel
      '85025': 25,  // Blood count; complete (CBC)
      
      // Chronic disease management
      '99213': 150, // Office/outpatient visit, established patient
      '99214': 200, // Office/outpatient visit, established patient
      
      // Mental health
      '90834': 120, // Psychotherapy, 45 minutes
      '90837': 150, // Psychotherapy, 60 minutes
      
      // Wellness monitoring (emerging coverage)
      'WELLNESS_001': 50, // Digital health monitoring
      'WELLNESS_002': 75, // Chronic disease digital monitoring
    };

    return reimbursementRates[code.code] || 50; // Default value
  }

  /**
   * Get insurance provider submission format
   */
  async getInsuranceSubmissionFormat(providerId) {
    const provider = this.insuranceProviders.get(providerId);
    
    if (!provider) {
      throw new Error('Insurance provider not found');
    }

    return {
      provider: provider.name,
      preferredFormats: provider.acceptedFormats,
      submissionEndpoint: provider.submissionEndpoint,
      authenticationRequired: provider.requiresAuth,
      processingTime: provider.typicalProcessingTime,
      contactInfo: provider.contactInfo
    };
  }

  /**
   * Submit claim directly to insurance provider (if API available)
   */
  async submitClaimToInsurance(exportId, providerId, submissionOptions = {}) {
    try {
      const exportRecord = this.exportHistory.get(exportId);
      
      if (!exportRecord) {
        throw new Error('Export record not found');
      }

      const provider = this.insuranceProviders.get(providerId);
      
      if (!provider || !provider.apiEnabled) {
        return {
          success: false,
          message: 'Direct submission not available for this provider',
          alternativeMethod: 'manual_submission'
        };
      }

      // In production, this would make actual API calls to insurance providers
      const submissionResult = await this.mockInsuranceSubmission(exportRecord, provider);

      // Update export record
      exportRecord.status = 'submitted';
      exportRecord.submittedAt = new Date().toISOString();
      exportRecord.submissionId = submissionResult.submissionId;

      return {
        success: true,
        submissionId: submissionResult.submissionId,
        status: 'submitted',
        estimatedProcessingTime: provider.typicalProcessingTime,
        trackingUrl: submissionResult.trackingUrl
      };

    } catch (error) {
      console.error('Insurance submission error:', error);
      throw new Error(`Failed to submit claim: ${error.message}`);
    }
  }

  // Helper methods for code mapping

  getVitalSignCode(type) {
    const vitalCodes = {
      'blood_pressure_systolic': '8480-6',
      'blood_pressure_diastolic': '8462-4',
      'heart_rate': '8867-4',
      'body_temperature': '8310-5',
      'respiratory_rate': '9279-1',
      'oxygen_saturation': '2708-6',
      'body_weight': '29463-7',
      'body_height': '8302-2'
    };
    return vitalCodes[type] || '8310-5'; // Default to temperature
  }

  getVitalSignDisplay(type) {
    const displays = {
      'blood_pressure_systolic': 'Systolic blood pressure',
      'blood_pressure_diastolic': 'Diastolic blood pressure',
      'heart_rate': 'Heart rate',
      'body_temperature': 'Body temperature',
      'respiratory_rate': 'Respiratory rate',
      'oxygen_saturation': 'Oxygen saturation in Arterial blood',
      'body_weight': 'Body weight',
      'body_height': 'Body height'
    };
    return displays[type] || 'Vital sign measurement';
  }

  getLabCode(testName) {
    const labCodes = {
      'glucose': '2345-7',
      'hemoglobin_a1c': '4548-4',
      'cholesterol_total': '2093-3',
      'cholesterol_ldl': '18262-6',
      'cholesterol_hdl': '2085-9',
      'triglycerides': '2571-8'
    };
    return labCodes[testName.toLowerCase()] || '2345-7';
  }

  getProcedureCode(procedure) {
    const procedureCodes = {
      'annual_physical': '99395',
      'blood_draw': '36415',
      'ekg': '93000',
      'chest_xray': '71020',
      'wellness_visit': '99401'
    };
    return procedureCodes[procedure.toLowerCase()] || '99213';
  }

  getDiagnosisCode(condition) {
    const diagnosisCodes = {
      'hypertension': 'I10',
      'diabetes_type_2': 'E11.9',
      'hyperlipidemia': 'E78.5',
      'obesity': 'E66.9',
      'anxiety': 'F41.9',
      'depression': 'F32.9'
    };
    return diagnosisCodes[condition.toLowerCase()] || 'Z00.00';
  }

  getWellnessCode(type) {
    const wellnessCodes = {
      'digital_monitoring': 'WELLNESS_001',
      'chronic_disease_monitoring': 'WELLNESS_002',
      'preventive_screening': '99401',
      'health_coaching': '99401'
    };
    return wellnessCodes[type] || 'WELLNESS_001';
  }

  isWellnessEligible(dataPoint, claimType) {
    // Determine if wellness monitoring is eligible for reimbursement
    const eligibleTypes = ['preventive_care', 'chronic_disease'];
    return eligibleTypes.includes(claimType) && dataPoint.monitoringPeriod >= 30;
  }

  isEligibleForReimbursement(codes, claimType) {
    // Basic eligibility check
    return codes.length > 0 && this.claimTypes[claimType];
  }

  getUsedCodingSystems(format) {
    switch (format.toLowerCase()) {
      case 'fhir':
        return ['ICD-10', 'CPT', 'LOINC', 'SNOMED CT'];
      case 'canada_phr':
        return ['ICD-10-CA', 'CCI'];
      default:
        return ['ICD-10', 'CPT'];
    }
  }

  validateFHIRBundle(bundle) {
    // Basic FHIR validation
    const requiredFields = ['resourceType', 'type', 'entry'];
    const isValid = requiredFields.every(field => bundle[field]);
    
    return {
      isValid,
      errors: isValid ? [] : ['Missing required FHIR bundle fields'],
      version: 'R4'
    };
  }

  async mockInsuranceSubmission(exportRecord, provider) {
    // Mock insurance submission response
    return {
      submissionId: `SUB_${Date.now()}`,
      status: 'received',
      trackingUrl: `${provider.portalUrl}/track/${Date.now()}`
    };
  }

  async getHealthDataForClaims(userId, dateRange, categories) {
    // Mock health data - in production, fetch from actual health database
    return [
      {
        category: 'vital_signs',
        type: 'blood_pressure_systolic',
        value: 120,
        unit: 'mmHg',
        date: '2024-01-27',
        userId
      },
      {
        category: 'laboratory_results',
        testName: 'glucose',
        result: 95,
        unit: 'mg/dL',
        referenceRange: '70-100',
        date: '2024-01-25',
        userId
      },
      {
        category: 'procedures',
        procedure: 'annual_physical',
        provider: 'Dr. Smith',
        date: '2024-01-20',
        userId
      }
    ];
  }

  initializeInsuranceProviders() {
    // Major US insurance providers
    this.insuranceProviders.set('aetna', {
      name: 'Aetna',
      acceptedFormats: ['FHIR R4', 'X12 EDI'],
      apiEnabled: false,
      typicalProcessingTime: '10-14 days',
      portalUrl: 'https://provider.aetna.com'
    });

    this.insuranceProviders.set('bcbs', {
      name: 'Blue Cross Blue Shield',
      acceptedFormats: ['FHIR R4', 'HL7 v2.5'],
      apiEnabled: false,
      typicalProcessingTime: '7-10 days',
      portalUrl: 'https://provider.bcbs.com'
    });

    // Canadian provinces
    this.insuranceProviders.set('ontario_health', {
      name: 'Ontario Health',
      acceptedFormats: ['FHIR R4', 'CDA R2'],
      apiEnabled: false,
      typicalProcessingTime: '5-7 days',
      portalUrl: 'https://health.ontario.ca'
    });
  }
}

// Export singleton instance
const medicalClaimIntegration = new MedicalClaimIntegration();

module.exports = {
  MedicalClaimIntegration,
  medicalClaimIntegration
};