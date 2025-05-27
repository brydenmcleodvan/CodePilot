/**
 * Family & Caregiver Sharing System
 * Enables secure health data sharing with granular permission controls
 */

class FamilyCaregiverSharing {
  constructor() {
    this.sharingConnections = new Map();
    this.invitations = new Map();
    this.accessLogs = new Map();
    
    // Predefined data categories for granular sharing
    this.dataCategories = {
      vitals: {
        name: 'Vital Signs',
        description: 'Heart rate, blood pressure, temperature',
        subcategories: ['heart_rate', 'blood_pressure', 'temperature', 'oxygen_saturation']
      },
      medications: {
        name: 'Medications & Prescriptions',
        description: 'Current medications, dosages, schedules',
        subcategories: ['current_medications', 'dosage_schedules', 'prescription_history']
      },
      appointments: {
        name: 'Medical Appointments',
        description: 'Upcoming and past appointments',
        subcategories: ['upcoming_appointments', 'appointment_history', 'doctor_notes']
      },
      fitness: {
        name: 'Fitness & Activity',
        description: 'Exercise, steps, activity levels',
        subcategories: ['exercise_sessions', 'daily_steps', 'activity_goals', 'workout_plans']
      },
      nutrition: {
        name: 'Nutrition & Diet',
        description: 'Meals, calories, dietary restrictions',
        subcategories: ['meal_logs', 'calorie_intake', 'dietary_restrictions', 'nutrition_goals']
      },
      sleep: {
        name: 'Sleep Patterns',
        description: 'Sleep duration, quality, patterns',
        subcategories: ['sleep_duration', 'sleep_quality', 'sleep_patterns', 'sleep_goals']
      },
      mood: {
        name: 'Mental Health & Mood',
        description: 'Mood tracking, mental health assessments',
        subcategories: ['mood_scores', 'mental_health_assessments', 'stress_levels']
      },
      symptoms: {
        name: 'Symptoms & Concerns',
        description: 'Reported symptoms, health concerns',
        subcategories: ['symptom_reports', 'pain_levels', 'health_concerns']
      },
      lab_results: {
        name: 'Lab Results & Tests',
        description: 'Blood work, diagnostic tests',
        subcategories: ['blood_work', 'diagnostic_tests', 'lab_reports']
      }
    };

    // Permission levels
    this.permissionLevels = {
      view_only: {
        name: 'View Only',
        description: 'Can view shared data but cannot make changes',
        capabilities: ['view']
      },
      limited_interaction: {
        name: 'Limited Interaction',
        description: 'Can view data and add notes/reminders',
        capabilities: ['view', 'add_notes', 'set_reminders']
      },
      caregiver: {
        name: 'Caregiver Access',
        description: 'Can view, add notes, and help manage appointments',
        capabilities: ['view', 'add_notes', 'set_reminders', 'manage_appointments', 'emergency_contacts']
      },
      healthcare_provider: {
        name: 'Healthcare Provider',
        description: 'Professional access for medical providers',
        capabilities: ['view', 'add_notes', 'medical_annotations', 'treatment_plans']
      }
    };

    // Relationship types
    this.relationshipTypes = [
      'spouse', 'parent', 'child', 'sibling', 'grandparent', 'grandchild',
      'caregiver', 'doctor', 'nurse', 'therapist', 'guardian', 'friend', 'other'
    ];
  }

  /**
   * Create a sharing invitation
   */
  async createSharingInvitation(ownerId, inviteData) {
    try {
      const invitation = {
        id: `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ownerId,
        inviteeEmail: inviteData.email,
        inviteeName: inviteData.name,
        relationship: inviteData.relationship,
        permissionLevel: inviteData.permissionLevel,
        sharedCategories: inviteData.sharedCategories || [],
        customMessage: inviteData.message || '',
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdAt: new Date().toISOString(),
        emergencyContact: inviteData.emergencyContact || false
      };

      // Validate permission level and categories
      if (!this.permissionLevels[invitation.permissionLevel]) {
        throw new Error('Invalid permission level');
      }

      if (!invitation.sharedCategories.every(cat => this.dataCategories[cat])) {
        throw new Error('Invalid data category specified');
      }

      this.invitations.set(invitation.id, invitation);

      // Send invitation email (mock implementation)
      await this.sendInvitationEmail(invitation);

      return {
        success: true,
        invitationId: invitation.id,
        invitation,
        message: 'Sharing invitation sent successfully'
      };

    } catch (error) {
      console.error('Invitation creation error:', error);
      throw new Error(`Failed to create sharing invitation: ${error.message}`);
    }
  }

  /**
   * Accept a sharing invitation
   */
  async acceptSharingInvitation(invitationId, acceptorUserId) {
    try {
      const invitation = this.invitations.get(invitationId);
      
      if (!invitation) {
        throw new Error('Invitation not found');
      }

      if (invitation.status !== 'pending') {
        throw new Error('Invitation already processed');
      }

      if (invitation.expiresAt < new Date()) {
        throw new Error('Invitation has expired');
      }

      // Create sharing connection
      const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const connection = {
        id: connectionId,
        ownerId: invitation.ownerId,
        sharedWithUserId: acceptorUserId,
        relationship: invitation.relationship,
        permissionLevel: invitation.permissionLevel,
        sharedCategories: invitation.sharedCategories,
        emergencyContact: invitation.emergencyContact,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastAccessedAt: null,
        accessCount: 0
      };

      this.sharingConnections.set(connectionId, connection);

      // Update invitation status
      invitation.status = 'accepted';
      invitation.acceptedAt = new Date().toISOString();
      invitation.acceptedByUserId = acceptorUserId;

      // Log access event
      await this.logAccessEvent(connectionId, acceptorUserId, 'connection_created');

      return {
        success: true,
        connectionId,
        connection,
        message: 'Sharing invitation accepted successfully'
      };

    } catch (error) {
      console.error('Invitation acceptance error:', error);
      throw new Error(`Failed to accept invitation: ${error.message}`);
    }
  }

  /**
   * Get shared data for a user based on permissions
   */
  async getSharedData(connectionId, requestorUserId, dataCategory, filters = {}) {
    try {
      const connection = this.sharingConnections.get(connectionId);
      
      if (!connection) {
        throw new Error('Sharing connection not found');
      }

      if (connection.status !== 'active') {
        throw new Error('Sharing connection is not active');
      }

      if (connection.sharedWithUserId !== requestorUserId) {
        throw new Error('Unauthorized access to shared data');
      }

      if (!connection.sharedCategories.includes(dataCategory)) {
        throw new Error('Data category not shared with you');
      }

      // Check if user has view permission
      const permissions = this.permissionLevels[connection.permissionLevel];
      if (!permissions.capabilities.includes('view')) {
        throw new Error('Insufficient permissions to view data');
      }

      // Get the actual health data (mock implementation)
      const healthData = await this.getHealthDataByCategory(
        connection.ownerId, 
        dataCategory, 
        filters
      );

      // Apply privacy filters based on permission level
      const filteredData = this.applyPrivacyFilters(healthData, connection.permissionLevel);

      // Log access event
      await this.logAccessEvent(connectionId, requestorUserId, 'data_accessed', {
        category: dataCategory,
        recordCount: filteredData.length
      });

      // Update connection access stats
      connection.lastAccessedAt = new Date().toISOString();
      connection.accessCount = (connection.accessCount || 0) + 1;

      return {
        success: true,
        data: filteredData,
        category: dataCategory,
        permissionLevel: connection.permissionLevel,
        lastUpdated: new Date().toISOString(),
        totalRecords: filteredData.length
      };

    } catch (error) {
      console.error('Shared data access error:', error);
      throw new Error(`Failed to get shared data: ${error.message}`);
    }
  }

  /**
   * Update sharing permissions for an existing connection
   */
  async updateSharingPermissions(connectionId, ownerId, updates) {
    try {
      const connection = this.sharingConnections.get(connectionId);
      
      if (!connection) {
        throw new Error('Sharing connection not found');
      }

      if (connection.ownerId !== ownerId) {
        throw new Error('Only the data owner can update permissions');
      }

      const oldPermissions = { ...connection };

      // Update permissions
      if (updates.permissionLevel && this.permissionLevels[updates.permissionLevel]) {
        connection.permissionLevel = updates.permissionLevel;
      }

      if (updates.sharedCategories) {
        if (!updates.sharedCategories.every(cat => this.dataCategories[cat])) {
          throw new Error('Invalid data category specified');
        }
        connection.sharedCategories = updates.sharedCategories;
      }

      if (updates.emergencyContact !== undefined) {
        connection.emergencyContact = updates.emergencyContact;
      }

      connection.updatedAt = new Date().toISOString();

      // Log permission change
      await this.logAccessEvent(connectionId, ownerId, 'permissions_updated', {
        oldPermissions: {
          level: oldPermissions.permissionLevel,
          categories: oldPermissions.sharedCategories
        },
        newPermissions: {
          level: connection.permissionLevel,
          categories: connection.sharedCategories
        }
      });

      // Notify shared user of permission changes
      await this.notifyPermissionChanges(connection, oldPermissions);

      return {
        success: true,
        connection,
        message: 'Sharing permissions updated successfully'
      };

    } catch (error) {
      console.error('Permission update error:', error);
      throw new Error(`Failed to update permissions: ${error.message}`);
    }
  }

  /**
   * Revoke sharing access
   */
  async revokeSharingAccess(connectionId, ownerId, reason = '') {
    try {
      const connection = this.sharingConnections.get(connectionId);
      
      if (!connection) {
        throw new Error('Sharing connection not found');
      }

      if (connection.ownerId !== ownerId) {
        throw new Error('Only the data owner can revoke access');
      }

      // Update connection status
      connection.status = 'revoked';
      connection.revokedAt = new Date().toISOString();
      connection.revocationReason = reason;

      // Log revocation event
      await this.logAccessEvent(connectionId, ownerId, 'access_revoked', {
        reason,
        revokedUser: connection.sharedWithUserId
      });

      // Notify the user whose access was revoked
      await this.notifyAccessRevoked(connection);

      return {
        success: true,
        message: 'Sharing access revoked successfully'
      };

    } catch (error) {
      console.error('Access revocation error:', error);
      throw new Error(`Failed to revoke access: ${error.message}`);
    }
  }

  /**
   * Get all sharing connections for a user
   */
  async getUserSharingConnections(userId, role = 'all') {
    try {
      const connections = Array.from(this.sharingConnections.values());
      
      let filteredConnections = [];
      
      if (role === 'owner' || role === 'all') {
        // Connections where user is the data owner
        const ownedConnections = connections
          .filter(conn => conn.ownerId === userId)
          .map(conn => ({ ...conn, role: 'owner' }));
        filteredConnections.push(...ownedConnections);
      }
      
      if (role === 'shared_with' || role === 'all') {
        // Connections where user has been granted access
        const sharedConnections = connections
          .filter(conn => conn.sharedWithUserId === userId)
          .map(conn => ({ ...conn, role: 'shared_with' }));
        filteredConnections.push(...sharedConnections);
      }

      // Sort by creation date (newest first)
      filteredConnections.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return {
        success: true,
        connections: filteredConnections,
        totalConnections: filteredConnections.length,
        activeConnections: filteredConnections.filter(c => c.status === 'active').length
      };

    } catch (error) {
      console.error('Connections retrieval error:', error);
      throw new Error(`Failed to get sharing connections: ${error.message}`);
    }
  }

  /**
   * Add a note or reminder to shared data
   */
  async addCaregiverNote(connectionId, authorUserId, noteData) {
    try {
      const connection = this.sharingConnections.get(connectionId);
      
      if (!connection) {
        throw new Error('Sharing connection not found');
      }

      if (connection.sharedWithUserId !== authorUserId) {
        throw new Error('Unauthorized to add notes to this connection');
      }

      const permissions = this.permissionLevels[connection.permissionLevel];
      if (!permissions.capabilities.includes('add_notes')) {
        throw new Error('Insufficient permissions to add notes');
      }

      const note = {
        id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        connectionId,
        authorId: authorUserId,
        type: noteData.type || 'general', // general, reminder, concern, observation
        title: noteData.title,
        content: noteData.content,
        category: noteData.category, // Which health category this relates to
        priority: noteData.priority || 'normal', // low, normal, high, urgent
        reminderDate: noteData.reminderDate,
        createdAt: new Date().toISOString()
      };

      // Store note (in production, this would go to database)
      if (!connection.notes) {
        connection.notes = [];
      }
      connection.notes.push(note);

      // Log note addition
      await this.logAccessEvent(connectionId, authorUserId, 'note_added', {
        noteType: note.type,
        category: note.category
      });

      // Notify data owner if it's an urgent note
      if (note.priority === 'urgent') {
        await this.notifyUrgentNote(connection, note);
      }

      return {
        success: true,
        noteId: note.id,
        note,
        message: 'Note added successfully'
      };

    } catch (error) {
      console.error('Note addition error:', error);
      throw new Error(`Failed to add note: ${error.message}`);
    }
  }

  // Helper methods

  async sendInvitationEmail(invitation) {
    console.log(`Sending invitation email to ${invitation.inviteeEmail}`);
    // In production, integrate with email service
  }

  async getHealthDataByCategory(userId, category, filters) {
    // Mock health data - in production, fetch from actual health database
    const mockData = {
      vitals: [
        { date: '2024-01-27', heartRate: 72, bloodPressure: '120/80', temperature: 98.6 },
        { date: '2024-01-26', heartRate: 75, bloodPressure: '118/78', temperature: 98.4 }
      ],
      medications: [
        { name: 'Lisinopril', dosage: '10mg', frequency: 'Daily', prescribedBy: 'Dr. Smith' },
        { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', prescribedBy: 'Dr. Johnson' }
      ],
      appointments: [
        { date: '2024-02-15', time: '10:00 AM', doctor: 'Dr. Smith', type: 'Check-up' },
        { date: '2024-02-20', time: '2:00 PM', doctor: 'Dr. Wilson', type: 'Cardiology' }
      ]
    };

    return mockData[category] || [];
  }

  applyPrivacyFilters(data, permissionLevel) {
    // Apply filtering based on permission level
    if (permissionLevel === 'view_only') {
      // Remove any sensitive details for view-only access
      return data.map(item => {
        const filtered = { ...item };
        // Remove potentially sensitive fields
        delete filtered.ssn;
        delete filtered.detailedNotes;
        return filtered;
      });
    }
    
    return data;
  }

  async logAccessEvent(connectionId, userId, eventType, metadata = {}) {
    const logEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      connectionId,
      userId,
      eventType,
      metadata,
      timestamp: new Date().toISOString(),
      ipAddress: 'xxx.xxx.xxx.xxx', // In production, get from request
      userAgent: 'Healthmap App' // In production, get from request
    };

    if (!this.accessLogs.has(connectionId)) {
      this.accessLogs.set(connectionId, []);
    }
    
    this.accessLogs.get(connectionId).push(logEntry);
  }

  async notifyPermissionChanges(connection, oldPermissions) {
    console.log(`Notifying user ${connection.sharedWithUserId} of permission changes`);
  }

  async notifyAccessRevoked(connection) {
    console.log(`Notifying user ${connection.sharedWithUserId} that access was revoked`);
  }

  async notifyUrgentNote(connection, note) {
    console.log(`Notifying data owner ${connection.ownerId} of urgent note`);
  }

  /**
   * Get access logs for a connection
   */
  async getAccessLogs(connectionId, ownerId, limit = 50) {
    try {
      const connection = this.sharingConnections.get(connectionId);
      
      if (!connection) {
        throw new Error('Sharing connection not found');
      }

      if (connection.ownerId !== ownerId) {
        throw new Error('Only the data owner can view access logs');
      }

      const logs = this.accessLogs.get(connectionId) || [];
      
      // Sort by timestamp (newest first) and limit results
      const sortedLogs = logs
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);

      return {
        success: true,
        logs: sortedLogs,
        totalLogs: logs.length,
        connectionId
      };

    } catch (error) {
      console.error('Access logs retrieval error:', error);
      throw new Error(`Failed to get access logs: ${error.message}`);
    }
  }

  /**
   * Get emergency contacts for a user
   */
  async getEmergencyContacts(userId) {
    const connections = Array.from(this.sharingConnections.values())
      .filter(conn => 
        (conn.ownerId === userId || conn.sharedWithUserId === userId) &&
        conn.emergencyContact === true &&
        conn.status === 'active'
      );

    return {
      success: true,
      emergencyContacts: connections,
      totalContacts: connections.length
    };
  }
}

// Export singleton instance
const familyCaregiverSharing = new FamilyCaregiverSharing();

module.exports = {
  FamilyCaregiverSharing,
  familyCaregiverSharing
};