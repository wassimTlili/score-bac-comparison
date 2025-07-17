import React from 'react';

class ChatErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Chat Error Boundary caught an error:', error);
    console.error('Error info:', errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-white">
          <h2 className="text-lg font-semibold mb-2">Chat Error</h2>
          <p className="text-sm text-red-200 mb-2">Something went wrong with the chat component.</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
          >
            Try Again
          </button>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-red-300">Error Details</summary>
              <pre className="mt-2 text-xs text-red-200 bg-red-900/30 p-2 rounded overflow-auto">
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChatErrorBoundary;
