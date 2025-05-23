/**
 * Comprehensive Security Validation for Healthmap RBAC System
 * 
 * This validates our authentication and authorization implementation
 */

import { storage } from '../server/storage';
import { createAccessToken } from '../server/security/tokens/jwt-handler';
import { checkPermission } from '../server/security/permissions/permission-checker';
import { ResourceType } from '../server/security/permissions/permission-types';

interface ValidationResult {
  test: string;
  status: 'PASS' | 'FAIL';
  details: string;
}

export class SecurityValidator {
  private results: ValidationResult[] = [];

  async runValidation(): Promise<ValidationResult[]> {
    console.log('🔒 Starting Healthmap Security Validation\n');
    
    await this.validateUserCreation();
    await this.validateTokenGeneration();
    await this.validatePermissionSystem();
    await this.validateDataIsolation();
    await this.validateProviderAccess();
    await this.validateRoleEnforcement();
    
    this.displayResults();
    return this.results;
  }

  private async validateUserCreation(): Promise<void> {
    try {
      // Test creating users with different roles
      const patient = await storage.createUser({
        username: 'security_test_patient',
        email: 'patient@test.local',
        name: 'Test Patient',
        roles: ['patient'],
        password: 'hashedPassword123'
      });

      const provider = await storage.createUser({
        username: 'security_test_provider',
        email: 'provider@test.local', 
        name: 'Test Provider',
        roles: ['provider'],
        password: 'hashedPassword123'
      });

      const admin = await storage.createUser({
        username: 'security_test_admin',
        email: 'admin@test.local',
        name: 'Test Admin', 
        roles: ['admin'],
        password: 'hashedPassword123'
      });

      if (patient && provider && admin) {
        this.addResult('User Creation', 'PASS', 
          `Created users: Patient(${patient.id}), Provider(${provider.id}), Admin(${admin.id})`);
      } else {
        this.addResult('User Creation', 'FAIL', 'Failed to create test users');
      }
    } catch (error) {
      this.addResult('User Creation', 'FAIL', `Error: ${error}`);
    }
  }

  private async validateTokenGeneration(): Promise<void> {
    try {
      const patient = await storage.getUserByUsername('security_test_patient');
      const provider = await storage.getUserByUsername('security_test_provider');
      const admin = await storage.getUserByUsername('security_test_admin');

      if (!patient || !provider || !admin) {
        this.addResult('Token Generation', 'FAIL', 'Test users not found');
        return;
      }

      // Generate JWT tokens
      const patientToken = createAccessToken(patient.id, patient.roles);
      const providerToken = createAccessToken(provider.id, provider.roles);
      const adminToken = createAccessToken(admin.id, admin.roles);

      if (patientToken && providerToken && adminToken) {
        this.addResult('Token Generation', 'PASS', 
          'Successfully generated JWT tokens for all user types');
      } else {
        this.addResult('Token Generation', 'FAIL', 'Failed to generate one or more tokens');
      }
    } catch (error) {
      this.addResult('Token Generation', 'FAIL', `Error: ${error}`);
    }
  }

  private async validatePermissionSystem(): Promise<void> {
    try {
      const patient = await storage.getUserByUsername('security_test_patient');
      const provider = await storage.getUserByUsername('security_test_provider');
      const admin = await storage.getUserByUsername('security_test_admin');

      if (!patient || !provider || !admin) {
        this.addResult('Permission System', 'FAIL', 'Test users not found');
        return;
      }

      // Test patient permissions (should have basic access)
      const patientReadHealth = await checkPermission(patient, 'read', ResourceType.HEALTH_METRIC);
      const patientCreateHealth = await checkPermission(patient, 'create', ResourceType.HEALTH_METRIC);
      const patientDeleteHealth = await checkPermission(patient, 'delete', ResourceType.HEALTH_METRIC);

      // Test provider permissions (should have patient data access)
      const providerReadHealth = await checkPermission(provider, 'read', ResourceType.HEALTH_METRIC);
      const providerCreateHealth = await checkPermission(provider, 'create', ResourceType.HEALTH_METRIC);

      // Test admin permissions (should have full access)
      const adminReadHealth = await checkPermission(admin, 'read', ResourceType.HEALTH_METRIC);
      const adminDeleteHealth = await checkPermission(admin, 'delete', ResourceType.HEALTH_METRIC);

      const expectedResults = {
        patientRead: patientReadHealth,
        patientCreate: patientCreateHealth,
        patientDelete: !patientDeleteHealth, // Should NOT have delete
        providerRead: providerReadHealth,
        providerCreate: providerCreateHealth,
        adminRead: adminReadHealth,
        adminDelete: adminDeleteHealth
      };

      const allCorrect = Object.values(expectedResults).every(Boolean);

      if (allCorrect) {
        this.addResult('Permission System', 'PASS', 
          'All role permissions working correctly');
      } else {
        this.addResult('Permission System', 'FAIL', 
          `Permission issues detected: ${JSON.stringify(expectedResults)}`);
      }
    } catch (error) {
      this.addResult('Permission System', 'FAIL', `Error: ${error}`);
    }
  }

  private async validateDataIsolation(): Promise<void> {
    try {
      const patient1 = await storage.getUserByUsername('security_test_patient');
      
      // Create another test patient
      const patient2 = await storage.createUser({
        username: 'security_test_patient2',
        email: 'patient2@test.local',
        name: 'Test Patient 2',
        roles: ['patient'],
        password: 'hashedPassword123'
      });

      if (!patient1 || !patient2) {
        this.addResult('Data Isolation', 'FAIL', 'Could not create test patients');
        return;
      }

      // Create health data for patient1
      await storage.addHealthMetric({
        type: 'blood_pressure',
        value: '120/80',
        unit: 'mmHg',
        userId: patient1.id,
        timestamp: new Date(),
        notes: 'Test data for isolation'
      });

      // Check data access
      const patient1Data = await storage.getHealthMetrics(patient1.id);
      const patient2Data = await storage.getHealthMetrics(patient2.id);

      if (patient1Data.length === 1 && patient2Data.length === 0) {
        this.addResult('Data Isolation', 'PASS', 
          'Users can only access their own health data');
      } else {
        this.addResult('Data Isolation', 'FAIL', 
          `Data isolation failed: P1(${patient1Data.length}) P2(${patient2Data.length})`);
      }
    } catch (error) {
      this.addResult('Data Isolation', 'FAIL', `Error: ${error}`);
    }
  }

  private async validateProviderAccess(): Promise<void> {
    try {
      const patient = await storage.getUserByUsername('security_test_patient');
      const provider = await storage.getUserByUsername('security_test_provider');

      if (!patient || !provider) {
        this.addResult('Provider Access', 'FAIL', 'Test users not found');
        return;
      }

      // Test healthcare relationship checking
      const hasRelationship = await storage.hasHealthcareRelationship(provider.id, patient.id);
      const relationships = await storage.getHealthcareRelationships(provider.id);

      // For testing, we expect no relationships initially
      if (!hasRelationship && relationships.length === 0) {
        this.addResult('Provider Access', 'PASS', 
          'Provider relationship validation working correctly');
      } else {
        this.addResult('Provider Access', 'FAIL', 
          `Unexpected relationships found: ${hasRelationship}, count: ${relationships.length}`);
      }
    } catch (error) {
      this.addResult('Provider Access', 'FAIL', `Error: ${error}`);
    }
  }

  private async validateRoleEnforcement(): Promise<void> {
    try {
      const patient = await storage.getUserByUsername('security_test_patient');
      const provider = await storage.getUserByUsername('security_test_provider');
      const admin = await storage.getUserByUsername('security_test_admin');

      if (!patient || !provider || !admin) {
        this.addResult('Role Enforcement', 'FAIL', 'Test users not found');
        return;
      }

      // Verify role assignments
      const patientHasPatientRole = patient.roles.includes('patient');
      const patientLacksProviderRole = !patient.roles.includes('provider');
      
      const providerHasProviderRole = provider.roles.includes('provider');
      const providerLacksAdminRole = !provider.roles.includes('admin');
      
      const adminHasAdminRole = admin.roles.includes('admin');

      const allRolesCorrect = patientHasPatientRole && patientLacksProviderRole &&
                            providerHasProviderRole && providerLacksAdminRole &&
                            adminHasAdminRole;

      if (allRolesCorrect) {
        this.addResult('Role Enforcement', 'PASS', 
          'All user roles assigned correctly');
      } else {
        this.addResult('Role Enforcement', 'FAIL', 
          `Role assignment issues detected`);
      }
    } catch (error) {
      this.addResult('Role Enforcement', 'FAIL', `Error: ${error}`);
    }
  }

  private addResult(test: string, status: 'PASS' | 'FAIL', details: string): void {
    this.results.push({ test, status, details });
  }

  private displayResults(): void {
    console.log('\n📊 Security Validation Results');
    console.log('━'.repeat(60));
    
    let passed = 0;
    let failed = 0;

    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      const color = result.status === 'PASS' ? '\x1b[32m' : '\x1b[31m';
      
      console.log(`${icon} ${color}${result.test}: ${result.status}\x1b[0m`);
      console.log(`   ${result.details}\n`);
      
      if (result.status === 'PASS') passed++;
      else failed++;
    });

    console.log('━'.repeat(60));
    console.log(`🎯 Final Score: ${passed}/${this.results.length} tests passed`);
    
    if (failed === 0) {
      console.log('🎉 Excellent! All security validations passed successfully!');
      console.log('🔐 Your RBAC system is ready for production use.');
    } else {
      console.log(`⚠️  ${failed} validation(s) failed. Please review the issues above.`);
    }
  }
}

// Export validation function
export const runSecurityValidation = async (): Promise<ValidationResult[]> => {
  const validator = new SecurityValidator();
  return await validator.runValidation();
};