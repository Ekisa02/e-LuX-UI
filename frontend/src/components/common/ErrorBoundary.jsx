import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in child component tree
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // Log to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cyber-dark flex items-center justify-center p-4">
          <div className="bg-cyber-panel border border-cyber-danger/50 rounded-lg p-8 max-w-lg w-full">
            <div className="flex items-center justify-center mb-6">
              <AlertCircle className="w-16 h-16 text-cyber-danger" />
            </div>
            
            <h1 className="text-2xl text-cyber-danger font-cyber text-center mb-4">
              SYSTEM ERROR
            </h1>
            
            <p className="text-cyber-primary/70 font-mono text-sm mb-6 text-center">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            
            {process.env.NODE_ENV === 'development' && (
              <pre className="bg-cyber-dark p-4 rounded text-xs text-cyber-primary/60 overflow-auto max-h-60 mb-6">
                {this.state.error?.stack}
              </pre>
            )}
            
            <div className="flex justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-cyber-danger/20 border border-cyber-danger 
                         text-cyber-danger rounded hover:bg-cyber-danger 
                         hover:text-white transition-colors font-mono"
              >
                RESTART SYSTEM
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;