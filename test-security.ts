/**
 * Quick Security Test Runner for Healthmap
 * Execute this to validate the RBAC system
 */

import { runSecurityValidation } from './tests/security-validation';

async function main() {
  try {
    console.log('🚀 Healthmap Security Validation Starting...\n');
    
    const results = await runSecurityValidation();
    
    const passedTests = results.filter(r => r.status === 'PASS').length;
    const totalTests = results.length;
    
    if (passedTests === totalTests) {
      console.log('\n🎊 VALIDATION COMPLETE: All security systems operational!');
      console.log('✨ Your RBAC implementation is enterprise-ready');
    } else {
      console.log(`\n⚠️  Security validation completed with ${totalTests - passedTests} issues`);
    }
    
    process.exit(passedTests === totalTests ? 0 : 1);
  } catch (error) {
    console.error('❌ Security validation failed:', error);
    process.exit(1);
  }
}

main();