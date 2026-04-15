import React from 'react';
import { AlertTriangle } from 'lucide-react';

/**
 * Error Boundary component to catch and display errors
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
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="glass-card p-8 max-w-lg w-full space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-red-500/20 p-3 rounded-full">
                                <AlertTriangle className="h-8 w-8 text-red-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Something went wrong</h1>
                                <p className="text-gray-400">
                                    We're sorry for the inconvenience
                                </p>
                            </div>
                        </div>

                        {this.state.error && (
                            <div className="bg-white/5 p-4 rounded-lg">
                                <p className="text-sm text-red-400 font-mono">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="btn-primary flex-1"
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={() => (window.location.href = '/')}
                                className="btn-secondary flex-1"
                            >
                                Go Home
                            </button>
                        </div>

                        {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                            <details className="bg-white/5 p-4 rounded-lg">
                                <summary className="cursor-pointer text-sm text-gray-400 mb-2">
                                    Error Details (Development Only)
                                </summary>
                                <pre className="text-xs text-gray-500 overflow-auto">
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
