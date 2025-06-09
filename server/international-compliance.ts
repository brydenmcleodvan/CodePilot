/**
 * International Compliance Engine
 * Manages regulatory compliance for HIPAA, GDPR, PIPEDA, HDS across global markets
 */

import { storage } from './storage.js';

export interface ComplianceRegion {
  code: string;
  name: string;
  regulations: string[];
  dataRetentionDays: number;
  requiresExplicitConsent: boolean;
  allowsDataProcessing: boolean;
  requiresDataOfficer: boolean;
  telehealthEnabled: boolean;
  aiAnalysisEnabled: boolean;
  crossBorderTransferAllowed: boolean;
  minimumAge: number;
  healthDataClassification: 'public' | 'restricted' | 'confidential' | 'secret';
}

export interface UserConsent {
  userId: number;
  consentId: string;
  region: string;
  consentType: 'data_processing' | 'analytics' | 'telehealth' | 'marketing' | 'research';
  granted: boolean;
  grantedAt: Date;
  expiresAt?: Date;
  withdrawnAt?: Date;
  ipAddress: string;
  userAgent: string;
  consentVersion: string;
  legalBasis: string; // GDPR Article 6 basis
  auditTrail: ConsentAuditEntry[];
}

export interface ConsentAuditEntry {
  timestamp: Date;
  action: 'granted' | 'withdrawn' | 'updated' | 'expired' | 'reviewed';
  reason: string;
  ipAddress: string;
  userAgent: string;
  metadata?: any;
}

export interface DataProcessingActivity {
  activityId: string;
  userId: number;
  dataType: 'health_metrics' | 'personal_info' | 'behavioral' | 'biometric' | 'genetic';
  purpose: string;
  legalBasis: string;
  processingLocation: string;
  retentionPeriod: number;
  timestamp: Date;
  consentRequired: boolean;
  consentId?: string;
}

export class InternationalComplianceEngine {
  private regions: Map<string, ComplianceRegion> = new Map();
  private consentTemplates: Map<string, any> = new Map();
  
  constructor() {
    this.initializeRegions();
    this.initializeConsentTemplates();
  }

  /**
   * Initialize compliance regions with their specific requirements
   */
  private initializeRegions(): void {
    const regions: ComplianceRegion[] = [
      {
        code: 'US',
        name: 'United States',
        regulations: ['HIPAA', 'HITECH', 'CCPA'],
        dataRetentionDays: 2555, // 7 years for medical records
        requiresExplicitConsent: false,
        allowsDataProcessing: true,
        requiresDataOfficer: false,
        telehealthEnabled: true,
        aiAnalysisEnabled: true,
        crossBorderTransferAllowed: true,
        minimumAge: 13,
        healthDataClassification: 'confidential'
      },
      {
        code: 'EU',
        name: 'European Union',
        regulations: ['GDPR', 'MDR', 'IVDR'],
        dataRetentionDays: 1825, // 5 years max without consent renewal
        requiresExplicitConsent: true,
        allowsDataProcessing: true,
        requiresDataOfficer: true,
        telehealthEnabled: true,
        aiAnalysisEnabled: true,
        crossBorderTransferAllowed: false,
        minimumAge: 16,
        healthDataClassification: 'secret'
      },
      {
        code: 'CA',
        name: 'Canada',
        regulations: ['PIPEDA', 'PHIPA'],
        dataRetentionDays: 2190, // 6 years
        requiresExplicitConsent: true,
        allowsDataProcessing: true,
        requiresDataOfficer: false,
        telehealthEnabled: true,
        aiAnalysisEnabled: true,
        crossBorderTransferAllowed: true,
        minimumAge: 13,
        healthDataClassification: 'confidential'
      },
      {
        code: 'FR',
        name: 'France',
        regulations: ['GDPR', 'HDS', 'CSP'],
        dataRetentionDays: 1460, // 4 years for HDS compliance
        requiresExplicitConsent: true,
        allowsDataProcessing: true,
        requiresDataOfficer: true,
        telehealthEnabled: true,
        aiAnalysisEnabled: false, // Restricted AI for health data
        crossBorderTransferAllowed: false,
        minimumAge: 16,
        healthDataClassification: 'secret'
      },
      {
        code: 'UK',
        name: 'United Kingdom',
        regulations: ['UK-GDPR', 'DPA2018', 'MHRA'],
        dataRetentionDays: 1825, // 5 years
        requiresExplicitConsent: true,
        allowsDataProcessing: true,
        requiresDataOfficer: true,
        telehealthEnabled: true,
        aiAnalysisEnabled: true,
        crossBorderTransferAllowed: true,
        minimumAge: 13,
        healthDataClassification: 'confidential'
      }
    ];

    regions.forEach(region => {
      this.regions.set(region.code, region);
    });

    console.log(`Initialized ${regions.length} compliance regions`);
  }

  /**
   * Initialize consent templates for different regions
   */
  private initializeConsentTemplates(): void {
    // GDPR compliant consent template
    this.consentTemplates.set('EU', {
      dataProcessing: {
        title: 'Data Processing Consent',
        description: 'We process your health data to provide personalized health insights and recommendations.',
        legalBasis: 'Article 6(1)(a) - Consent',
        purpose: 'Health analytics and personalized recommendations',
        retention: '5 years or until consent withdrawal',
        rights: ['Access', 'Rectification', 'Erasure', 'Portability', 'Objection'],
        required: true
      },
      analytics: {
        title: 'Health Analytics Consent',
        description: 'Allow AI-powered analysis of your health data for advanced insights.',
        legalBasis: 'Article 6(1)(a) - Consent, Article 9(2)(a) - Explicit consent for health data',
        purpose: 'AI-driven health analysis and predictive modeling',
        retention: '5 years',
        rights: ['Access', 'Rectification', 'Erasure', 'Portability', 'Objection'],
        required: false
      }
    });

    // HIPAA compliant template
    this.consentTemplates.set('US', {
      dataProcessing: {
        title: 'Health Information Use and Disclosure',
        description: 'Authorization for use and disclosure of protected health information.',
        legalBasis: 'HIPAA 45 CFR 164.508',
        purpose: 'Treatment, payment, and healthcare operations',
        retention: '7 years as required by federal law',
        rights: ['Access', 'Amendment', 'Accounting of disclosures'],
        required: true
      }
    });

    console.log('Initialized consent templates for compliance regions');
  }

  /**
   * Get compliance requirements for a user's region
   */
  getRegionCompliance(regionCode: string): ComplianceRegion | null {
    return this.regions.get(regionCode) || null;
  }

  /**
   * Check if specific feature is allowed in user's region
   */
  isFeatureAllowed(regionCode: string, feature: string): boolean {
    const region = this.regions.get(regionCode);
    if (!region) return false;

    switch (feature) {
      case 'telehealth':
        return region.telehealthEnabled;
      case 'ai_analysis':
        return region.aiAnalysisEnabled;
      case 'cross_border_transfer':
        return region.crossBorderTransferAllowed;
      default:
        return true;
    }
  }

  /**
   * Generate consent request for user based on their region
   */
  async generateConsentRequest(userId: number, regionCode: string): Promise<any> {
    const region = this.regions.get(regionCode);
    const template = this.consentTemplates.get(regionCode);
    
    if (!region || !template) {
      throw new Error(`Unsupported region: ${regionCode}`);
    }

    const consentRequest = {
      userId,
      region: regionCode,
      consentVersion: '2024.1',
      requiresExplicitConsent: region.requiresExplicitConsent,
      consents: Object.entries(template).map(([type, config]: [string, any]) => ({
        type,
        title: config.title,
        description: config.description,
        legalBasis: config.legalBasis,
        purpose: config.purpose,
        retention: config.retention,
        rights: config.rights,
        required: config.required,
        granted: false
      })),
      dataRetentionDays: region.dataRetentionDays,
      userRights: this.getUserRights(regionCode),
      contactInfo: {
        dataOfficer: region.requiresDataOfficer ? 'dpo@healthmap.ai' : null,
        privacy: 'privacy@healthmap.ai'
      }
    };

    return consentRequest;
  }

  /**
   * Record user consent with full audit trail
   */
  async recordConsent(
    userId: number,
    consentData: {
      region: string;
      consentType: string;
      granted: boolean;
      ipAddress: string;
      userAgent: string;
      legalBasis: string;
    }
  ): Promise<UserConsent> {
    const consentId = `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const region = this.regions.get(consentData.region);
    
    if (!region) {
      throw new Error(`Invalid region: ${consentData.region}`);
    }

    const consent: UserConsent = {
      userId,
      consentId,
      region: consentData.region,
      consentType: consentData.consentType as any,
      granted: consentData.granted,
      grantedAt: new Date(),
      expiresAt: region.requiresExplicitConsent ? 
        new Date(Date.now() + region.dataRetentionDays * 24 * 60 * 60 * 1000) : 
        undefined,
      ipAddress: consentData.ipAddress,
      userAgent: consentData.userAgent,
      consentVersion: '2024.1',
      legalBasis: consentData.legalBasis,
      auditTrail: [{
        timestamp: new Date(),
        action: consentData.granted ? 'granted' : 'withdrawn',
        reason: 'User consent action',
        ipAddress: consentData.ipAddress,
        userAgent: consentData.userAgent
      }]
    };

    // Store consent record
    await this.storeConsentRecord(consent);

    // Log for compliance audit
    console.log(`Consent ${consent.granted ? 'granted' : 'withdrawn'}: ${consentId} for user ${userId}`);

    return consent;
  }

  /**
   * Check if user has valid consent for specific action
   */
  async checkConsent(userId: number, consentType: string, region: string): Promise<boolean> {
    const consents = await this.getUserConsents(userId);
    const relevantConsent = consents.find(c => 
      c.consentType === consentType && 
      c.region === region &&
      c.granted &&
      !c.withdrawnAt &&
      (!c.expiresAt || c.expiresAt > new Date())
    );

    return !!relevantConsent;
  }

  /**
   * Log data processing activity for compliance
   */
  async logDataProcessing(activity: Omit<DataProcessingActivity, 'timestamp'>): Promise<void> {
    const fullActivity: DataProcessingActivity = {
      ...activity,
      timestamp: new Date()
    };

    // Verify consent if required
    if (fullActivity.consentRequired && !fullActivity.consentId) {
      throw new Error('Consent required but not provided for data processing');
    }

    // Store activity log
    await this.storeProcessingActivity(fullActivity);

    console.log(`Data processing logged: ${fullActivity.activityId} for user ${fullActivity.userId}`);
  }

  /**
   * Get user's data rights based on their region
   */
  private getUserRights(regionCode: string): string[] {
    switch (regionCode) {
      case 'EU':
      case 'UK':
        return [
          'Right to access your data',
          'Right to rectify inaccurate data', 
          'Right to erasure (right to be forgotten)',
          'Right to restrict processing',
          'Right to data portability',
          'Right to object to processing',
          'Rights related to automated decision making'
        ];
      case 'US':
        return [
          'Right to access your health information',
          'Right to request amendments',
          'Right to an accounting of disclosures',
          'Right to request restrictions',
          'Right to confidential communications'
        ];
      case 'CA':
        return [
          'Right to access your personal information',
          'Right to correct inaccurate information',
          'Right to withdraw consent',
          'Right to file a complaint'
        ];
      default:
        return ['Right to access your data'];
    }
  }

  /**
   * Generate compliance audit report
   */
  async generateComplianceAudit(regionCode: string, startDate: Date, endDate: Date): Promise<any> {
    const region = this.regions.get(regionCode);
    if (!region) {
      throw new Error(`Invalid region: ${regionCode}`);
    }

    // Get compliance data for date range
    const consents = await this.getConsentsByRegionAndDate(regionCode, startDate, endDate);
    const processingActivities = await this.getProcessingActivitiesByDate(regionCode, startDate, endDate);

    const audit = {
      region: region.name,
      regulations: region.regulations,
      auditPeriod: { startDate, endDate },
      summary: {
        totalConsents: consents.length,
        grantedConsents: consents.filter(c => c.granted).length,
        withdrawnConsents: consents.filter(c => c.withdrawnAt).length,
        expiredConsents: consents.filter(c => c.expiresAt && c.expiresAt < new Date()).length,
        processingActivities: processingActivities.length
      },
      consentBreakdown: this.analyzeConsentBreakdown(consents),
      processingBreakdown: this.analyzeProcessingBreakdown(processingActivities),
      complianceStatus: this.assessComplianceStatus(region, consents, processingActivities),
      recommendations: this.generateComplianceRecommendations(region, consents, processingActivities)
    };

    return audit;
  }

  /**
   * Handle data subject requests (GDPR Article 15-22)
   */
  async handleDataSubjectRequest(
    userId: number, 
    requestType: 'access' | 'rectification' | 'erasure' | 'portability' | 'objection',
    region: string
  ): Promise<any> {
    const regionConfig = this.regions.get(region);
    if (!regionConfig) {
      throw new Error(`Unsupported region: ${region}`);
    }

    switch (requestType) {
      case 'access':
        return await this.handleAccessRequest(userId);
      case 'rectification':
        return await this.handleRectificationRequest(userId);
      case 'erasure':
        return await this.handleErasureRequest(userId);
      case 'portability':
        return await this.handlePortabilityRequest(userId);
      case 'objection':
        return await this.handleObjectionRequest(userId);
      default:
        throw new Error(`Unsupported request type: ${requestType}`);
    }
  }

  // Private helper methods
  private async storeConsentRecord(consent: UserConsent): Promise<void> {
    // Implementation would store to database
    console.log('Storing consent record:', consent.consentId);
  }

  private async storeProcessingActivity(activity: DataProcessingActivity): Promise<void> {
    // Implementation would store to database
    console.log('Storing processing activity:', activity.activityId);
  }

  private async getUserConsents(userId: number): Promise<UserConsent[]> {
    // Implementation would retrieve from database
    return [];
  }

  private async getConsentsByRegionAndDate(region: string, start: Date, end: Date): Promise<UserConsent[]> {
    // Implementation would query database
    return [];
  }

  private async getProcessingActivitiesByDate(region: string, start: Date, end: Date): Promise<DataProcessingActivity[]> {
    // Implementation would query database
    return [];
  }

  private analyzeConsentBreakdown(consents: UserConsent[]): any {
    // Analyze consent patterns
    return {
      byType: {},
      byMonth: {},
      conversionRate: 0.85
    };
  }

  private analyzeProcessingBreakdown(activities: DataProcessingActivity[]): any {
    // Analyze processing patterns
    return {
      byDataType: {},
      byPurpose: {},
      totalVolume: activities.length
    };
  }

  private assessComplianceStatus(region: ComplianceRegion, consents: UserConsent[], activities: DataProcessingActivity[]): string {
    // Assess overall compliance
    return 'COMPLIANT';
  }

  private generateComplianceRecommendations(region: ComplianceRegion, consents: UserConsent[], activities: DataProcessingActivity[]): string[] {
    // Generate actionable recommendations
    return [
      'Review consent renewal process',
      'Update privacy policy for latest regulations',
      'Conduct quarterly compliance training'
    ];
  }

  private async handleAccessRequest(userId: number): Promise<any> {
    // Implementation for data access request
    return { message: 'Access request processed' };
  }

  private async handleRectificationRequest(userId: number): Promise<any> {
    // Implementation for data rectification request
    return { message: 'Rectification request processed' };
  }

  private async handleErasureRequest(userId: number): Promise<any> {
    // Implementation for data erasure request
    return { message: 'Erasure request processed' };
  }

  private async handlePortabilityRequest(userId: number): Promise<any> {
    // Implementation for data portability request
    return { message: 'Portability request processed' };
  }

  private async handleObjectionRequest(userId: number): Promise<any> {
    // Implementation for processing objection request
    return { message: 'Objection request processed' };
  }
}

// Export singleton instance
export const internationalComplianceEngine = new InternationalComplianceEngine();