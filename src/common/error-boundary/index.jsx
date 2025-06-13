import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-r from-red-100 to-red-300 border border-red-300 rounded-lg shadow-lg">
          <h1 className="text-6xl flex font-extrabold text-red-700 mb-4">
            Oops! Something went wrong.
          </h1>
          <p className="text-gray-800 mt-2 font-medium text-lg text-center">
            We encountered an unexpected error while processing your request.
            Please try refreshing the page or come back later.
          </p>
          <button
            className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition duration-300 transform hover:scale-105"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
