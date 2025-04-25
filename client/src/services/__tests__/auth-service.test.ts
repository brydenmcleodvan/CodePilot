/**
 * Auth Service Tests
 * 
 * This file demonstrates testing patterns for the service architecture:
 * 1. Mocking the API layer
 * 2. Testing retry and error handling
 * 3. Testing with service interfaces
 */

// Import the service interfaces for type safety
import { IAuthService } from '../api/auth-service-next';
import { ServiceError, ErrorType } from '../core/base-service';

// Mock the apiRequest function
jest.mock('../api/base-api', () => ({
  apiRequest: jest.fn(),
  handleApiResponse: jest.fn(promise => promise)
}));

// Import the mocked function for assertions
import { apiRequest } from '../api/base-api';

// Import the service under test
import { authServiceNext } from '../api/auth-service-next';

describe('AuthService', () => {
  // Clear mocks between tests
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('login', () => {
    const credentials = { username: 'testuser', password: 'password123' };
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    
    it('should call apiRequest with correct parameters', async () => {
      // Setup mock to return success
      (apiRequest as jest.Mock).mockResolvedValueOnce(mockUser);
      
      // Call the method
      const result = await authServiceNext.login(credentials);
      
      // Verify apiRequest was called correctly
      expect(apiRequest).toHaveBeenCalledWith(
        'POST',
        '/api/auth/login',
        credentials,
        expect.anything()
      );
      
      // Verify result
      expect(result).toEqual(mockUser);
    });
    
    it('should handle API errors correctly', async () => {
      // Setup mock to return error
      const mockError = new ServiceError({
        type: ErrorType.AUTHENTICATION,
        message: 'Invalid username or password',
        statusCode: 401
      });
      
      (apiRequest as jest.Mock).mockRejectedValueOnce(mockError);
      
      // Call the method and expect it to throw
      await expect(authServiceNext.login(credentials))
        .rejects
        .toThrow(mockError);
    });
    
    it('should retry on network errors', async () => {
      // Setup mock to fail with network error, then succeed on retry
      const networkError = new ServiceError({
        type: ErrorType.NETWORK,
        message: 'Network error'
      });
      
      (apiRequest as jest.Mock)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce(mockUser);
      
      // Call the method
      const result = await authServiceNext.login(credentials);
      
      // Verify apiRequest was called multiple times
      expect(apiRequest).toHaveBeenCalledTimes(2);
      
      // Verify result
      expect(result).toEqual(mockUser);
    });
  });
  
  describe('getCurrentUser', () => {
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    
    it('should call apiRequest with correct parameters', async () => {
      // Setup mock to return success
      (apiRequest as jest.Mock).mockResolvedValueOnce(mockUser);
      
      // Call the method
      const result = await authServiceNext.getCurrentUser();
      
      // Verify apiRequest was called correctly
      expect(apiRequest).toHaveBeenCalledWith(
        'GET',
        '/api/auth/user',
        undefined,
        expect.anything()
      );
      
      // Verify result
      expect(result).toEqual(mockUser);
    });
  });
  
  describe('logout', () => {
    it('should call apiRequest with correct parameters', async () => {
      // Setup mock to return success
      (apiRequest as jest.Mock).mockResolvedValueOnce(undefined);
      
      // Call the method
      await authServiceNext.logout();
      
      // Verify apiRequest was called correctly
      expect(apiRequest).toHaveBeenCalledWith(
        'POST',
        '/api/auth/logout',
        undefined,
        expect.anything()
      );
    });
  });
  
  // Add more tests for other methods...
});

/**
 * Using a ServiceFactory with a test service implementation
 */
describe('Testing with ServiceFactory', () => {
  // Create a mock implementation of IAuthService
  const mockAuthService: jest.Mocked<IAuthService> = {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
    requestPasswordReset: jest.fn(),
    resetPassword: jest.fn(),
    changePassword: jest.fn(),
    verifyEmail: jest.fn(),
    resendVerificationEmail: jest.fn(),
    updateProfile: jest.fn(),
    uploadProfilePicture: jest.fn(),
    getSessions: jest.fn(),
    terminateSession: jest.fn(),
    terminateAllSessions: jest.fn(),
    getOAuthUrl: jest.fn(),
    authenticateWithOAuth: jest.fn(),
    refreshAccessToken: jest.fn(),
    configure: jest.fn(),
    getConfiguration: jest.fn(),
    resetConfiguration: jest.fn(),
    clearCache: jest.fn(),
    handleError: jest.fn(),
  };
  
  // Import the ServiceFactory
  import { services } from '../service-factory';
  
  beforeEach(() => {
    // Reset all mocks
    jest.resetAllMocks();
    
    // Replace the real service with our mock
    (services as any).setService('auth', mockAuthService);
  });
  
  it('should use the mock service for authentication', async () => {
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    mockAuthService.login.mockResolvedValueOnce(mockUser);
    
    // Use the service through the factory
    const result = await services.auth.login({ username: 'testuser', password: 'password123' });
    
    // Verify our mock was called
    expect(mockAuthService.login).toHaveBeenCalledWith({ username: 'testuser', password: 'password123' });
    
    // Verify result
    expect(result).toEqual(mockUser);
  });
});

/**
 * Testing with the service hook
 */
describe('Testing service hooks', () => {
  // Import the useService hook
  import { renderHook, act } from '@testing-library/react-hooks';
  import { useService } from '../../hooks/use-service';
  
  // Mock the toast hook
  jest.mock('../../hooks/use-toast', () => ({
    useToast: () => ({
      toast: jest.fn()
    })
  }));
  
  it('should handle successful service calls', async () => {
    // Create a mock service method
    const mockServiceMethod = jest.fn().mockResolvedValue({ success: true });
    
    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => 
      useService(mockServiceMethod)
    );
    
    // Initial state should be not loading with no data or error
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
    
    // Execute the service call
    let servicePromise;
    act(() => {
      servicePromise = result.current.execute('arg1', 'arg2');
    });
    
    // Should be in loading state
    expect(result.current.loading).toBe(true);
    
    // Wait for the service call to complete
    await waitForNextUpdate();
    
    // Should have data and not be loading
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual({ success: true });
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBe(true);
    
    // Service method should have been called with the right args
    expect(mockServiceMethod).toHaveBeenCalledWith('arg1', 'arg2');
    
    // Promise should resolve with the data
    await expect(servicePromise).resolves.toEqual({ success: true });
  });
  
  it('should handle service errors', async () => {
    // Create a mock service error
    const mockError = new ServiceError({
      type: ErrorType.VALIDATION,
      message: 'Validation error',
      fieldErrors: { username: ['Username is required'] }
    });
    
    // Create a mock service method that throws
    const mockServiceMethod = jest.fn().mockRejectedValue(mockError);
    
    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => 
      useService(mockServiceMethod)
    );
    
    // Execute the service call
    let servicePromise;
    act(() => {
      servicePromise = result.current.execute();
    });
    
    // Wait for the service call to complete
    await waitForNextUpdate();
    
    // Should have error and not be loading
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBe(mockError);
    expect(result.current.success).toBe(false);
    
    // Promise should reject with the error
    await expect(servicePromise).rejects.toBe(mockError);
  });
});