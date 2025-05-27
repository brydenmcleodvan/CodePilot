import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Unified Error Boundary
 * Catches frontend errors and provides graceful error handling with logging
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to analytics service
    this.setState({
      error,
      errorInfo,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    // Log to console for development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Log to analytics service for production monitoring
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = async (error, errorInfo) => {
    try {
      // Log to your analytics service (Firebase, Sentry, etc.)
      const errorData = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.props.userId || 'anonymous'
      };

      // If Firebase is available, log there
      if (window.db) {
        const { collection, addDoc } = await import('firebase/firestore');
        await addDoc(collection(window.db, 'error_logs'), errorData);
      } else {
        // Fallback to localStorage for later sync
        const errorLogs = JSON.parse(localStorage.getItem('healthmap_error_logs') || '[]');
        errorLogs.push(errorData);
        localStorage.setItem('healthmap_error_logs', JSON.stringify(errorLogs.slice(-50))); // Keep last 50 errors
      }

      console.log('Error logged successfully:', this.state.errorId);
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleGoHome = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg w-full"
          >
            <Card className="border-red-200 shadow-lg">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl text-red-800">Oops! Something went wrong</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    We encountered an unexpected error. Don't worry - your data is safe and our team has been notified.
                  </p>
                  
                  <div className="bg-gray-50 border rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2 text-gray-700 mb-2">
                      <Bug className="h-4 w-4" />
                      <span className="font-medium text-sm">Error ID: {this.state.errorId}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {this.state.error?.message || 'Unknown error occurred'}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button 
                    onClick={this.handleRetry}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={this.handleGoHome}
                    className="flex-1"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </Button>
                </div>

                <div className="text-center text-xs text-gray-500 pt-4 border-t">
                  <p>Need help? Contact support at help@healthmap.ai</p>
                  <p className="mt-1">Include Error ID: {this.state.errorId}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary(WrappedComponent, errorFallback) {
  return function ErrorBoundaryWrapper(props) {
    return (
      <ErrorBoundary userId={props.userId} errorFallback={errorFallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Hook to report errors manually
 */
export function useErrorReporting() {
  const reportError = (error, context = {}) => {
    console.error('Manual error report:', error, context);
    
    // This would integrate with your error logging service
    const errorData = {
      message: error.message || String(error),
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      type: 'manual_report'
    };

    // Store for later sync if offline
    try {
      const errorLogs = JSON.parse(localStorage.getItem('healthmap_error_logs') || '[]');
      errorLogs.push(errorData);
      localStorage.setItem('healthmap_error_logs', JSON.stringify(errorLogs.slice(-50)));
    } catch (logError) {
      console.error('Failed to store error log:', logError);
    }
  };

  return { reportError };
}

export default ErrorBoundary;