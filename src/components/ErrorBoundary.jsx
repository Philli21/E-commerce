// src/components/ErrorBoundary.jsx
import { Component } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // You can also log to an error reporting service like Sentry here
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
          <AlertTriangle className="w-16 h-16 text-error mb-4" />
          <h1 className="text-3xl font-bold text-text mb-2">Something went wrong</h1>
          <p className="text-text-light mb-6 max-w-md">
            We're sorry for the inconvenience. Please try refreshing the page or go back home.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition"
            >
              Refresh Page
            </button>
            <Link
              to="/"
              className="bg-secondary text-white px-6 py-2 rounded-lg hover:bg-secondary-600 transition"
            >
              Go Home
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;