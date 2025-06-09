/**
 * Transparent Data Use Ledger
 * Comprehensive privacy management and data usage tracking system
 */

class DataTransparencyLedger {
  constructor() {
    this.dataUsageLogs = new Map();
    this.userPermissions = new Map();
    this.complianceFrameworks = new Map();
    this.dataProcessingActivities = new Map();
    
    // Data usage categories and purposes
    this.dataCategories = {
      health_metrics: {
        name: 'Health Metrics',
        description: 'Vital signs, fitness data, and health measurements',
        sensitive_level: 'high',
        retention_period: 2555, // 7 years in days
        processing_purposes: [
          'personal_health_insights',
          'trend_analysis',
          'goal_tracking',
          'recommendation_generation'
        ]
      },
      
      behavioral_data: {
        name: 'Behavioral Patterns',
        description: 'App usage, interaction patterns, and engagement metrics',
        sensitive_level: 'medium',
        retention_period: 1095, // 3 years in days
        processing_purposes: [
          'user_experience_improvement',
          'feature_optimization',
          'personalization',
          'platform_analytics'
        ]
      },
      
      demographic_info: {
        name: 'Demographic Information',
        description: 'Age, gender, location, and basic profile data',
        sensitive_level: 'medium',
        retention_period: 2555, // 7 years in days
        processing_purposes: [
          'service_personalization',
          'regional_recommendations',
          'demographic_analytics'
        ]
      },
      
      medical_history: {
        name: 'Medical History',
        description: 'Conditions, medications, and clinical information',
        sensitive_level: 'very_high',
        retention_period: 2555, // 7 years in days
        processing_purposes: [
          'health_risk_assessment',
          'medication_tracking',
          'clinical_insights',
          'provider_sharing'
        ]
      },
      
      communication_data: {
        name: 'Communication Data',
        description: 'Messages, support interactions, and feedback',
        sensitive_level: 'low',
        retention_period: 730, // 2 years in days
        processing_purposes: [
          'customer_support',
          'service_improvement',
          'quality_assurance'
        ]
      }
    };

    // Compliance framework implementations
    this.complianceFrameworks = {
      gdpr: {
        name: 'General Data Protection Regulation (EU)',
        jurisdiction: 'European Union',
        requirements: {
          lawful_basis: 'consent',
          data_minimization: true,
          purpose_limitation: true,
          right_to_erasure: true,
          data_portability: true,
          consent_withdrawal: true,
          breach_notification: 72 // hours
        },
        user_rights: [
          'access',
          'rectification',
          'erasure',
          'portability',
          'restriction',
          'objection',
          'automated_decision_making'
        ]
      },
      
      ccpa: {
        name: 'California Consumer Privacy Act',
        jurisdiction: 'California, USA',
        requirements: {
          disclosure_requirements: true,
          opt_out_rights: true,
          non_discrimination: true,
          third_party_disclosure: true,
          deletion_rights: true
        },
        user_rights: [
          'know',
          'delete',
          'opt_out',
          'non_discrimination'
        ]
      },
      
      hipaa: {
        name: 'Health Insurance Portability and Accountability Act',
        jurisdiction: 'United States',
        requirements: {
          protected_health_info: true,
          minimum_necessary: true,
          business_associate_agreements: true,
          breach_notification: true,
          access_logs: true
        },
        user_rights: [
          'access',
          'amendment',
          'accounting_of_disclosures',
          'restriction_requests'
        ]
      },
      
      pipeda: {
        name: 'Personal Information Protection and Electronic Documents Act',
        jurisdiction: 'Canada',
        requirements: {
          consent_required: true,
          purpose_identification: true,
          limiting_collection: true,
          accuracy: true,
          safeguards: true
        },
        user_rights: [
          'access',
          'correction',
          'complaint'
        ]
      }
    };

    this.initializeTransparencyLedger();
  }

  /**
   * Log data usage with detailed tracking
   */
  async logDataUsage(userId, dataCategory, purpose, processingDetails) {
    try {
      const usageLog = {
        log_id: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        timestamp: new Date().toISOString(),
        data_category: dataCategory,
        processing_purpose: purpose,
        data_elements: processingDetails.data_elements || [],
        processing_method: processingDetails.method || 'automated',
        retention_period: this.dataCategories[dataCategory]?.retention_period,
        legal_basis: processingDetails.legal_basis || 'consent',
        third_party_sharing: processingDetails.third_party_sharing || false,
        result_description: processingDetails.result_description
      };

      // Store usage log
      const userLogs = this.dataUsageLogs.get(userId) || [];
      userLogs.push(usageLog);
      this.dataUsageLogs.set(userId, userLogs);

      // Check compliance requirements
      await this.validateComplianceRequirements(userId, usageLog);

      return {
        success: true,
        log_id: usageLog.log_id,
        transparency_message: this.generateTransparencyMessage(usageLog),
        user_notification_required: this.shouldNotifyUser(usageLog)
      };

    } catch (error) {
      console.error('Data usage logging error:', error);
      throw new Error(`Failed to log data usage: ${error.message}`);
    }
  }

  /**
   * Get user's complete data usage history
   */
  async getUserDataUsageHistory(userId, timeframe = 90) {
    try {
      const userLogs = this.dataUsageLogs.get(userId) || [];
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeframe);

      const recentLogs = userLogs.filter(log => 
        new Date(log.timestamp) >= cutoffDate
      );

      // Group by category and purpose
      const usageByCategory = {};
      const usageByPurpose = {};

      recentLogs.forEach(log => {
        // Group by category
        if (!usageByCategory[log.data_category]) {
          usageByCategory[log.data_category] = {
            category_name: this.dataCategories[log.data_category]?.name || log.data_category,
            usage_count: 0,
            last_used: null,
            purposes: new Set()
          };
        }
        
        usageByCategory[log.data_category].usage_count++;
        usageByCategory[log.data_category].last_used = log.timestamp;
        usageByCategory[log.data_category].purposes.add(log.processing_purpose);

        // Group by purpose
        if (!usageByPurpose[log.processing_purpose]) {
          usageByPurpose[log.processing_purpose] = {
            purpose_name: this.formatPurposeName(log.processing_purpose),
            usage_count: 0,
            data_categories: new Set(),
            last_used: null
          };
        }
        
        usageByPurpose[log.processing_purpose].usage_count++;
        usageByPurpose[log.processing_purpose].data_categories.add(log.data_category);
        usageByPurpose[log.processing_purpose].last_used = log.timestamp;
      });

      // Convert Sets to Arrays for JSON serialization
      Object.values(usageByCategory).forEach(category => {
        category.purposes = Array.from(category.purposes);
      });
      
      Object.values(usageByPurpose).forEach(purpose => {
        purpose.data_categories = Array.from(purpose.data_categories);
      });

      return {
        success: true,
        timeframe_days: timeframe,
        total_usage_events: recentLogs.length,
        usage_by_category: usageByCategory,
        usage_by_purpose: usageByPurpose,
        recent_logs: recentLogs.slice(-10), // Last 10 events
        transparency_summary: this.generateTransparencySummary(usageByCategory, usageByPurpose)
      };

    } catch (error) {
      console.error('Data usage history error:', error);
      throw new Error(`Failed to get usage history: ${error.message}`);
    }
  }

  /**
   * Manage user permissions and consent
   */
  async updateUserPermissions(userId, permissionUpdates) {
    try {
      const currentPermissions = this.userPermissions.get(userId) || this.getDefaultPermissions();
      
      // Update permissions with audit trail
      const updatedPermissions = {
        ...currentPermissions,
        ...permissionUpdates,
        last_updated: new Date().toISOString(),
        update_history: [
          ...(currentPermissions.update_history || []),
          {
            timestamp: new Date().toISOString(),
            changes: permissionUpdates,
            user_initiated: true
          }
        ].slice(-50) // Keep last 50 updates
      };

      this.userPermissions.set(userId, updatedPermissions);

      // Log permission changes for compliance
      await this.logPermissionChange(userId, permissionUpdates);

      return {
        success: true,
        permissions: updatedPermissions,
        compliance_impact: this.assessComplianceImpact(permissionUpdates),
        data_processing_changes: this.determineProcessingChanges(permissionUpdates)
      };

    } catch (error) {
      console.error('Permission update error:', error);
      throw new Error(`Failed to update permissions: ${error.message}`);
    }
  }

  /**
   * Generate compliance report for specific framework
   */
  async generateComplianceReport(userId, framework = 'gdpr') {
    try {
      const frameworkConfig = this.complianceFrameworks[framework];
      if (!frameworkConfig) {
        throw new Error(`Unsupported compliance framework: ${framework}`);
      }

      const userPermissions = this.userPermissions.get(userId) || this.getDefaultPermissions();
      const userLogs = this.dataUsageLogs.get(userId) || [];

      const report = {
        user_id: userId,
        framework: frameworkConfig.name,
        jurisdiction: frameworkConfig.jurisdiction,
        report_generated: new Date().toISOString(),
        compliance_status: 'compliant',
        user_rights_status: {},
        data_processing_summary: {},
        recommendations: []
      };

      // Assess user rights compliance
      for (const right of frameworkConfig.user_rights) {
        report.user_rights_status[right] = this.assessUserRightCompliance(
          right, 
          userPermissions, 
          userLogs, 
          framework
        );
      }

      // Assess data processing compliance
      report.data_processing_summary = this.assessDataProcessingCompliance(
        userLogs, 
        frameworkConfig.requirements
      );

      // Generate recommendations
      report.recommendations = this.generateComplianceRecommendations(
        report.user_rights_status,
        report.data_processing_summary,
        framework
      );

      // Determine overall compliance status
      report.compliance_status = this.determineOverallComplianceStatus(report);

      return {
        success: true,
        compliance_report: report,
        action_items: report.recommendations.filter(rec => rec.priority === 'high')
      };

    } catch (error) {
      console.error('Compliance report error:', error);
      throw new Error(`Failed to generate compliance report: ${error.message}`);
    }
  }

  /**
   * Handle data subject rights requests
   */
  async processDataSubjectRequest(userId, requestType, requestDetails = {}) {
    try {
      const supportedRequests = ['access', 'delete', 'portability', 'rectification', 'restriction'];
      
      if (!supportedRequests.includes(requestType)) {
        throw new Error(`Unsupported request type: ${requestType}`);
      }

      const request = {
        request_id: `dsr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        request_type: requestType,
        submitted_at: new Date().toISOString(),
        status: 'processing',
        details: requestDetails,
        processing_log: []
      };

      // Process based on request type
      let result;
      switch (requestType) {
        case 'access':
          result = await this.processAccessRequest(userId);
          break;
        case 'delete':
          result = await this.processDeleteRequest(userId, requestDetails);
          break;
        case 'portability':
          result = await this.processPortabilityRequest(userId);
          break;
        case 'rectification':
          result = await this.processRectificationRequest(userId, requestDetails);
          break;
        case 'restriction':
          result = await this.processRestrictionRequest(userId, requestDetails);
          break;
      }

      request.status = 'completed';
      request.completed_at = new Date().toISOString();
      request.result = result;

      return {
        success: true,
        request_id: request.request_id,
        status: request.status,
        result,
        completion_time: this.calculateProcessingTime(request)
      };

    } catch (error) {
      console.error('Data subject request error:', error);
      throw new Error(`Failed to process data subject request: ${error.message}`);
    }
  }

  // Helper methods for data transparency

  generateTransparencyMessage(usageLog) {
    const categoryName = this.dataCategories[usageLog.data_category]?.name || usageLog.data_category;
    const purposeName = this.formatPurposeName(usageLog.processing_purpose);
    
    return `We used your ${categoryName.toLowerCase()} to ${purposeName.toLowerCase()}${
      usageLog.result_description ? `: ${usageLog.result_description}` : ''
    }`;
  }

  formatPurposeName(purpose) {
    return purpose.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  generateTransparencySummary(usageByCategory, usageByPurpose) {
    const totalCategories = Object.keys(usageByCategory).length;
    const totalPurposes = Object.keys(usageByPurpose).length;
    const mostUsedCategory = Object.entries(usageByCategory)
      .sort(([,a], [,b]) => b.usage_count - a.usage_count)[0];
    
    return {
      summary: `Your data was used for ${totalPurposes} different purposes across ${totalCategories} data categories`,
      most_used_category: mostUsedCategory ? {
        name: mostUsedCategory[1].category_name,
        usage_count: mostUsedCategory[1].usage_count
      } : null,
      transparency_level: 'full'
    };
  }

  getDefaultPermissions() {
    return {
      data_processing: {
        personal_health_insights: true,
        trend_analysis: true,
        goal_tracking: true,
        recommendation_generation: true,
        platform_analytics: false,
        third_party_sharing: false,
        research_participation: false
      },
      communication: {
        health_alerts: true,
        progress_notifications: true,
        marketing_emails: false,
        research_invitations: false
      },
      data_sharing: {
        anonymized_research: false,
        healthcare_providers: false,
        family_caregivers: false,
        fitness_apps: false,
        nutrition_apps: false
      },
      created_at: new Date().toISOString(),
      consent_version: '2024.1',
      update_history: []
    };
  }

  initializeTransparencyLedger() {
    console.log('Data Transparency Ledger initialized with compliance frameworks');
  }
}

// Export singleton instance
const dataTransparencyLedger = new DataTransparencyLedger();

module.exports = {
  DataTransparencyLedger,
  dataTransparencyLedger
};