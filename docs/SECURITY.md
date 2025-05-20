# Healthmap Security Overview

## Architecture

The Healthmap security architecture is built on a modular, defense-in-depth approach that protects sensitive health data at multiple layers. The security module follows industry best practices and provides comprehensive protection against common web vulnerabilities.

### Core Security Components

1. **Token Management**
   - Secure JWT implementation with proper token rotation
   - Token revocation system for immediate invalidation
   - Separate access and refresh tokens with appropriate lifetimes
   - Enhanced token payload with essential security claims

2. **Authentication System**
   - Multi-factor authentication support
   - Secure password storage using bcrypt with appropriate cost factor
   - Session management with absolute and inactivity timeouts
   - IP-based and user-based account lockout

3. **Access Control**
   - Role-Based Access Control (RBAC) system
   - Fine-grained permission model for resources
   - Resource ownership verification
   - Attribute-based access controls for sensitive data

4. **API Protection**
   - Rate limiting on critical endpoints
   - Input validation and sanitization
   - CSRF protection using double-submit cookie pattern
   - Security headers for protection against common attacks

5. **Privacy Controls**
   - Data minimization in responses
   - Explicit consent management
   - Data retention policies
   - Audit logging for sensitive operations

## Implementation Details

### JWT Security

Our JWT implementation includes:
- Token signing with strong secrets
- Essential security claims (iss, aud, exp, jti)
- Token type verification to prevent token misuse
- Token revocation for security incidents
- Token renewal with secure rotation strategy

```typescript
// Example of creating a secure JWT token
const token = createAccessToken({
  id: user.id,
  username: user.username,
  role: user.role
});
```

### Authentication Middleware

All protected routes use the `authenticateToken` middleware:

```typescript
// Apply to individual routes
router.get('/profile', authenticateToken, (req, res) => { ... });

// Or apply to all routes in a group
router.use('/admin', authenticateToken, adminRoutes);
```

### Permission System

Resources and actions are protected using the permission system:

```typescript
// Check if a user has permission to perform an action
if (hasPermission(
  user,
  ResourceType.HEALTH_DATA,
  ResourceAction.UPDATE,
  resource
)) {
  // Allow the action
}

// Or use as middleware
router.patch(
  '/resource/:id',
  requirePermission(ResourceType.RESOURCE, ResourceAction.UPDATE)
);
```

### Rate Limiting

Protection against brute force attacks:

```typescript
// Apply to authentication endpoints
router.post('/login', loginRateLimiter, (req, res) => { ... });

// Apply to API endpoints
router.use('/api', apiRateLimiter);

// Apply to user-specific endpoints
router.use('/user', userRateLimiter);
```

### Input Validation

All input is validated and sanitized:

```typescript
// Validate input with Zod schema
router.post(
  '/endpoint',
  validateWith(mySchema),
  (req, res) => { ... }
);
```

## Security Best Practices

### For Developers

1. **Always validate input**
   - Use the provided validation middleware
   - Never trust client input
   - Apply proper data type conversion

2. **Use correct permission checks**
   - Identify the resource type and action
   - Check ownership when applicable
   - Test with different user roles

3. **Handle sensitive data properly**
   - Never log sensitive information
   - Properly sanitize outputs
   - Use appropriate data retention policies

4. **Error handling**
   - Don't expose implementation details in errors
   - Log security events appropriately
   - Use standard error responses

### For Operations

1. **Secret management**
   - Rotate JWT secrets periodically
   - Use environment variables for secrets
   - Monitor for secret exposure

2. **Monitoring**
   - Watch for unusual login patterns
   - Monitor rate limit triggers
   - Track permission denials

3. **Incident response**
   - Ability to revoke tokens immediately
   - Process for blocking compromised accounts
   - Procedures for data breach response

## Security Testing

### Automated Tests

- Unit tests for security components
- Integration tests for authentication flows
- API security tests for each endpoint
- Schema validation tests

### Manual Testing

- Regular security code reviews
- Penetration testing checklist
- Authentication bypass testing
- Authorization testing matrix

## Implementing Security in New Features

When adding new features:

1. Identify the resource type and required actions
2. Add appropriate permission definitions
3. Apply authentication and authorization middleware
4. Validate and sanitize all inputs
5. Implement appropriate rate limiting
6. Add audit logging for sensitive operations
7. Review security implications with the team

## Resources

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [OWASP Cross-Site Request Forgery Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)